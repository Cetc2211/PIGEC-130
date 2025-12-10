'use server';

import { z } from 'zod';
import { redirect } from 'next/navigation';
import { getQuestionnaire, saveCustomQuestionnaire, Question } from '@/lib/data';
import { savePatient, saveResult, savePatientsBatch, assignQuestionnairesToPatient, updatePatient, deleteAssignment } from '@/lib/store';
import { generateEvaluationReport } from '@/ai/flows/generate-evaluation-report';
import { revalidatePath } from 'next/cache';
import { createQuestionnaireFromPdf } from '@/ai/flows/create-questionnaire-from-pdf';
import { createQuestionnaireFromText } from '@/ai/flows/create-questionnaire-from-text';


export type FormState = {
  message: string;
  errors?: Record<string, string[] | undefined>;
  // To support chained evaluations, we need to pass results between steps
  intermediateResults?: string; 
};

export async function submitEvaluation(
  questionnaireId: string,
  patientId: string | null,
  isRemote: boolean,
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const questionnaire = getQuestionnaire(questionnaireId);
  if (!questionnaire) {
    return { message: 'Error: Cuestionario no encontrado.' };
  }

  const allQuestions = questionnaire.sections.flatMap(s => s.questions);
  const schemaFields: Record<string, z.ZodType<any, any>> = {};
  allQuestions.forEach((q) => {
    const fieldSchema = z.string().min(1, 'Por favor, completa este campo.');
    schemaFields[q.id] = fieldSchema;
  });
  // Add field for intermediate results
  schemaFields['intermediateResults'] = z.string().optional();
  const schema = z.object(schemaFields);
  
  const parsed = schema.safeParse(Object.fromEntries(formData.entries()));

  if (!parsed.success) {
    return {
      message: 'Por favor, responde todas las preguntas antes de enviar.',
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  const { intermediateResults: prevResults, ...answers } = parsed.data;
  const scores: Record<string, number> = {};
  const totalPossibleScores: Record<string, number> = {};
  const answerValues: Record<string, number | string> = {};

  for (const section of questionnaire.sections) {
    let sectionScore = 0;
    let sectionTotalPossible = 0;
    const sectionId = section.sectionId;

    for (const question of section.questions) {
      const questionId = question.id;
      const rawAnswer = answers[questionId];
      
      if (question.type === 'likert' && question.includeInScore !== false) {
        const value = parseInt(rawAnswer, 10);
        let scoreForQuestion = value;

        if (question.scoring?.type === 'match') {
          scoreForQuestion = value === question.scoring.value ? 1 : 0;
        } else if (question.scoring?.type === 'aq-10') {
            const agrees = value === 3 || value === 2;
            const disagrees = value === 1 || value === 0;
            if (question.scoring.agreesIsOne && agrees) {
                scoreForQuestion = 1;
            } else if (!question.scoring.agreesIsOne && disagrees) {
                scoreForQuestion = 1;
            } else {
                scoreForQuestion = 0;
            }
        } else if (question.scoringDirection === 'Inversa') {
          const maxScaleValue = Math.max(...section.likertScale.map(o => o.value));
          const minScaleValue = Math.min(...section.likertScale.map(o => o.value));
          scoreForQuestion = (maxScaleValue + minScaleValue) - value;
        }
        
        sectionScore += scoreForQuestion;
      }

      if (question.type === 'likert') {
        answerValues[questionId] = parseInt(rawAnswer, 10);
      } else {
        answerValues[questionId] = rawAnswer;
      }
    }

    scores[sectionId] = sectionScore;

    sectionTotalPossible = section.questions
      .filter(q => q.type === 'likert' && q.includeInScore !== false)
      .reduce((total, q) => {
          if (q.scoring?.type === 'match' || q.scoring?.type === 'aq-10') {
            return total + 1;
          }
          if (q.scoringDirection === 'Inversa') {
            const maxOptionValue = Math.max(...section.likertScale.map(o => o.value));
            return total + maxOptionValue;
          }
          const options = q.options || section.likertScale;
          const maxOptionValue = Math.max(...options.map(o => o.value));
          return total + maxOptionValue;
      }, 0);

    totalPossibleScores[sectionId] = sectionTotalPossible;
  }

  const currentResult = {
      questionnaireId,
      questionnaireName: questionnaire.name,
      answers: answerValues,
      scores,
      totalPossibleScores,
      submittedAt: new Date(),
  };

  if (isRemote) {
    const allResults = prevResults ? JSON.parse(prevResults) : [];
    allResults.push(currentResult);
    
    // Check for more pending assignments for this patient
    const { getAssignedQuestionnairesForPatient } = await import('@/lib/store');
    const allAssignments = getAssignedQuestionnairesForPatient(patientId!);
    const completedQuestionnaireIds = allResults.map((r: any) => r.questionnaireId);
    const nextAssignment = allAssignments.find(
      (a) => !completedQuestionnaireIds.includes(a.questionnaireId)
    );

    if (nextAssignment) {
      // If there's another test, redirect to it, passing along the accumulated results
      const nextUrl = `/evaluation/${nextAssignment.questionnaireId}?patient=${patientId}&remote=true&intermediateResults=${encodeURIComponent(JSON.stringify(allResults))}`;
      redirect(nextUrl);
    } else {
      // All tests are done, generate the final code
      const finalPayload = {
        patientId,
        results: allResults,
      };
      const resultCode = Buffer.from(JSON.stringify(finalPayload)).toString('base64');
      redirect(`/evaluation/submitted?code=${encodeURIComponent(resultCode)}`);
    }
  }

  // This part is for non-remote submissions
  const result = saveResult({
    ...currentResult,
    patientId: patientId || undefined,
  });

  if (patientId) {
    revalidatePath(`/patients/${patientId}`);
    redirect(`/patients/${patientId}`);
  } else {
    redirect(`/results/${result.id}`);
  }
}


export async function generateReportAction(resultId: string, evaluationData: string) {
  try {
    const questionnaireName = JSON.parse(evaluationData).questionnaireName;
    const aiResult = await generateEvaluationReport({
      evaluationResults: evaluationData,
      scaleName: questionnaireName,
    });
    
    revalidatePath(`/results/${resultId}`);
    return { success: true, report: aiResult.report };
  } catch (error) {
    console.error(error);
    return { success: false, report: 'No se pudo generar el informe.' };
  }
}

export type CreateQuestionnaireState = {
    message: string;
    success: boolean;
    errors?: Record<string, any>;
    questionnaireId?: string;
};

const interpretationSchema = z.object({
    from: z.number(),
    to: z.number(),
    severity: z.enum(['Baja', 'Leve', 'Moderada', 'Alta', 'Positivo', 'Negativo', 'Optimista', 'Intermedio', 'Pesimista']),
    summary: z.string().min(1, 'El resumen es obligatorio'),
});

const questionSchema = z.object({ 
    text: z.string().min(1, 'El texto de la pregunta no puede estar vacío'),
    type: z.enum(['likert', 'open']),
});

const formSchema = z.object({
  name: z.string().min(1, 'El nombre es obligatorio'),
  description: z.string().min(1, 'La descripción es obligatoria'),
  category: z.string().min(1, 'La categoría es obligatoria'),
  subcategory: z.string().min(1, 'La subcategoría es obligatoria'),
  questions: z.array(questionSchema).min(1, 'Se requiere al menos una pregunta'),
  likertScale: z.array(z.object({ label: z.string().min(1, 'La etiqueta de la escala no puede estar vacía'), value: z.number() })).min(2, 'Se requieren al menos dos opciones de escala'),
  interpretations: z.array(interpretationSchema).min(1, 'Se requiere al menos una regla de interpretación'),
});


export async function createQuestionnaireAction(
  prevState: CreateQuestionnaireState,
  formData: FormData
): Promise<CreateQuestionnaireState> {
  try {
    const data = JSON.parse(formData.get('jsonData') as string);
    const parsed = formSchema.safeParse(data);

    if (!parsed.success) {
      return {
        success: false,
        message: 'Validación fallida. Revisa los campos.',
        errors: parsed.error.flatten(),
      };
    }

    const { name, description, category, subcategory, questions, likertScale, interpretations } = parsed.data;

    const newQuestionnaireData = {
        name,
        description,
        category,
        subcategory,
        sections: [{
            sectionId: 'main',
            name,
            questions: questions.map((q: any, i: number) => ({ ...q, id: `q${i+1}` })),
            likertScale,
        }],
        interpretationData: interpretations,
    };

    const newQuestionnaire = saveCustomQuestionnaire(newQuestionnaireData as any);

    revalidatePath('/');
    
    return {
      success: true,
      message: `¡Cuestionario "${newQuestionnaire.name}" creado con éxito!`,
      questionnaireId: newQuestionnaire.id
    };


  } catch (error: any) {
    return {
      success: false,
      message: error.message || 'Ocurrió un error inesperado.',
    };
  }
}

export async function processPdfAction(formData: FormData) {
  const file = formData.get('pdf') as File;
  if (!file || file.size === 0) {
    return { success: false, error: 'No se ha subido ningún archivo.' };
  }

  try {
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const pdfDataUri = `data:application/pdf;base64,${buffer.toString('base64')}`;

    const result = await createQuestionnaireFromPdf({ pdfDataUri });
    return { success: true, data: result };

  } catch (error: any) {
    console.error('Error processing PDF:', error);
    let errorMessage = 'No se pudo procesar el PDF. Asegúrate de que el formato es correcto e inténtalo de nuevo.';
    if (error.message.includes('JSON')) {
        errorMessage = 'La IA no pudo estructurar los datos del PDF. Verifica que el documento contenga un cuestionario claro con preguntas, escala y reglas de interpretación.'
    }
    return { success: false, error: errorMessage };
  }
}

export async function processTextAction(text: string) {
  if (!text || text.trim().length < 50) {
    return { success: false, error: 'El texto es demasiado corto para ser procesado.' };
  }

  try {
    const result = await createQuestionnaireFromText({ text });
    return { success: true, data: result };

  } catch (error: any) {
    console.error('Error processing text:', error);
    let errorMessage = 'No se pudo procesar el texto. Asegúrate de que el formato es correcto e inténtalo de nuevo.';
    if (error.message.includes('JSON')) {
        errorMessage = 'La IA no pudo estructurar los datos del texto. Verifica que contenga un cuestionario claro con título, preguntas, escala y reglas de interpretación.'
    }
    return { success: false, error: errorMessage };
  }
}

export type AddPatientState = {
  message: string;
  success: boolean;
  errors?: Record<string, any>;
  patientId?: string;
};

const addPatientFormSchema = z.object({
  name: z.string().min(3, 'El nombre debe tener al menos 3 caracteres.'),
  semester: z.string().min(1, 'El semestre es obligatorio.'),
  group: z.string().min(1, 'El grupo es obligatorio.'),
});

export async function addPatientAction(
  prevState: AddPatientState,
  formData: FormData
): Promise<AddPatientState> {
  try {
    const parsed = addPatientFormSchema.safeParse({
      name: formData.get('name'),
      semester: formData.get('semester'),
      group: formData.get('group'),
    });

    if (!parsed.success) {
      return {
        success: false,
        message: 'Validación fallida.',
        errors: parsed.error.flatten().fieldErrors,
      };
    }

    const newPatient = savePatient({
      name: parsed.data.name,
      semester: parsed.data.semester,
      group: parsed.data.group,
    });

    revalidatePath('/patients');

    return {
      success: true,
      message: `¡Paciente "${newPatient.name}" añadido con éxito!`,
      patientId: newPatient.id,
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || 'Ocurrió un error inesperado al añadir el paciente.',
    };
  }
}

export type BulkAddPatientsState = {
    message: string;
    success: boolean;
    errors?: Record<string, any>;
    count?: number;
}

const bulkAddPatientsSchema = z.object({
    semester: z.string().min(1, "El semestre es obligatorio."),
    group: z.string().min(1, "El grupo es obligatorio."),
    names: z.string().min(3, "La lista de nombres no puede estar vacía."),
});

export async function bulkAddPatientsAction(
    prevState: BulkAddPatientsState,
    formData: FormData
): Promise<BulkAddPatientsState> {
    try {
        const parsed = bulkAddPatientsSchema.safeParse({
            semester: formData.get('semester'),
            group: formData.get('group'),
            names: formData.get('names'),
        });

        if (!parsed.success) {
            return {
                success: false,
                message: "Validación fallida.",
                errors: parsed.error.flatten().fieldErrors,
            };
        }

        const { semester, group, names } = parsed.data;
        const nameList = names.split('\n').map(name => name.trim()).filter(name => name.length > 0);

        if (nameList.length === 0) {
            return {
                success: false,
                message: "Validación fallida.",
                errors: { names: ["La lista de nombres no puede estar vacía."] },
            };
        }
        
        const newPatients = nameList.map(name => ({ name, semester, group }));
        
        const createdCount = savePatientsBatch(newPatients);

        revalidatePath('/patients');

        return {
            success: true,
            message: `Se han creado ${createdCount} expedientes con éxito en el grupo ${semester} - ${group}.`,
            count: createdCount,
        };

    } catch(error: any) {
        return {
            success: false,
            message: error.message || "Ocurrió un error inesperado al añadir los pacientes.",
        };
    }
}

export type AssignQuestionnaireState = {
  success: boolean;
  message: string;
};

const assignSchema = z.object({
  patientId: z.string().min(1, 'Debe seleccionar un paciente.'),
  questionnaireIds: z.array(z.string().min(1)).min(1, 'Debe seleccionar al menos un cuestionario.'),
});

export async function assignQuestionnairesAction(
  prevState: AssignQuestionnaireState,
  formData: FormData
): Promise<AssignQuestionnaireState> {
  try {
    const data = {
      patientId: formData.get('patientId'),
      questionnaireIds: formData.getAll('questionnaireIds'),
    };
    
    const parsed = assignSchema.safeParse(data);

    if (!parsed.success) {
      return {
        success: false,
        message: parsed.error.flatten().fieldErrors.questionnaireIds?.[0] || 'Error de validación.',
      };
    }

    const { patientId, questionnaireIds } = parsed.data;

    assignQuestionnairesToPatient(patientId, questionnaireIds);
    revalidatePath('/patients');
    revalidatePath(`/patients/${patientId}`);
    return {
      success: true,
      message: 'Cuestionarios asignados con éxito.',
    };
  } catch (error: any) {
    return {
      success: false,
      message: 'No se pudo asignar el cuestionario.',
    };
  }
}

export type UpdatePatientState = {
    message: string;
    success: boolean;
    errors?: Record<string, any>;
};

const profileFormSchema = z.object({
  name: z.string().optional(),
  dob: z.string().optional(),
  age: z.coerce.number().optional(),
  sex: z.enum(['M', 'F', 'Otro']).optional(),
  otherSex: z.string().optional(),
  maritalStatus: z.string().optional(),
  curp: z.string().optional(),
  nss: z.string().optional(),
  address: z.string().optional(),
  neighborhood: z.string().optional(),
  postalCode: z.string().optional(),
  municipality: z.string().optional(),
  homePhone: z.string().optional(),
  mobilePhone: z.string().optional(),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  emergencyContactName: z.string().optional(),
  emergencyContactRelationship: z.string().optional(),
  emergencyContactPhone: z.string().optional(),
});


export async function updatePatientAction(
    patientId: string,
    prevState: UpdatePatientState,
    formData: FormData
): Promise<UpdatePatientState> {
    try {
        const data = Object.fromEntries(formData.entries());
        const parsed = profileFormSchema.safeParse(data);

        if (!parsed.success) {
            return {
                success: false,
                message: 'Validación fallida.',
                errors: parsed.error.flatten().fieldErrors,
            };
        }

        updatePatient(patientId, parsed.data);
        
        revalidatePath(`/patients/${patientId}`);

        return {
            success: true,
            message: '¡Ficha de identificación guardada con éxito!',
        };

    } catch (error: any) {
        return {
            success: false,
            message: error.message || 'Ocurrió un error inesperado al guardar.',
        };
    }
}

export type SaveInterviewState = {
  success: boolean;
  message: string;
  errors?: Record<string, any>;
}

const interviewSchema = z.object({
  patientId: z.string(),
  motivoConsulta: z.string().min(10, 'El motivo de consulta es demasiado corto.'),
  expectativasTratamiento: z.string().min(10, 'Las expectativas son demasiado cortas.'),
  riesgoSuicidaActivo: z.boolean().default(false),
  crisisPsicotica: z.boolean().default(false),
  historiaEnfermedadActual: z.string().min(20, 'La historia de la enfermedad es demasiado corta.'),
  ansiedadDominante: z.boolean().default(false),
  depresionDominante: z.boolean().default(false),
  disociacion: z.boolean().default(false),
  controlImpulsos: z.boolean().default(false),
  complicacionesPrenatales: z.boolean().default(false),
  hitosDesarrolloRetrasados: z.boolean().default(false),
  dinamicaFamiliarNuclear: z.string().min(10, 'La descripción de la dinámica familiar es demasiado corta.'),
  desarrolloSexual: z.string().optional(),
  escolaridadProblemas: z.boolean().default(false),
  relacionesInterpersonales: z.string().min(10, 'La descripción de las relaciones es demasiado corta.'),
  traumaInfancia: z.boolean().default(false),
  afeccionMedicaCronica: z.string().optional(),
  consumoSustanciasActual: z.string().optional(),
  impresionDiagnosticoDiferencial: z.string().optional(),
});


export async function saveClinicalInterviewAction(
  prevState: SaveInterviewState,
  formData: FormData
): Promise<SaveInterviewState> {
    
    const data = {
        patientId: formData.get('patientId'),
        motivoConsulta: formData.get('motivoConsulta'),
        expectativasTratamiento: formData.get('expectativasTratamiento'),
        riesgoSuicidaActivo: formData.get('riesgoSuicidaActivo') === 'on',
        crisisPsicotica: formData.get('crisisPsicotica') === 'on',
        historiaEnfermedadActual: formData.get('historiaEnfermedadActual'),
        ansiedadDominante: formData.get('ansiedadDominante') === 'on',
        depresionDominante: formData.get('depresionDominante') === 'on',
        disociacion: formData.get('disociacion') === 'on',
        controlImpulsos: formData.get('controlImpulsos') === 'on',
        complicacionesPrenatales: formData.get('complicacionesPrenatales') === 'on',
        hitosDesarrolloRetrasados: formData.get('hitosDesarrolloRetrasados') === 'on',
        dinamicaFamiliarNuclear: formData.get('dinamicaFamiliarNuclear'),
        desarrolloSexual: formData.get('desarrolloSexual'),
        escolaridadProblemas: formData.get('escolaridadProblemas') === 'on',
        relacionesInterpersonales: formData.get('relacionesInterpersonales'),
        traumaInfancia: formData.get('traumaInfancia') === 'on',
        afeccionMedicaCronica: formData.get('afeccionMedicaCronica'),
        consumoSustanciasActual: formData.get('consumoSustanciasActual'),
        impresionDiagnosticoDiferencial: formData.get('impresionDiagnosticoDiferencial'),
    };
    
    const parsed = interviewSchema.safeParse(data);

    if (!parsed.success) {
      return {
        success: false,
        message: 'Error de validación. Revisa los campos marcados.',
        errors: parsed.error.flatten().fieldErrors,
      };
    }
    
    console.log("Datos de la entrevista a guardar:", parsed.data);
    revalidatePath(`/patients/${parsed.data.patientId}`);
    
    return {
      success: true,
      message: '¡Entrevista clínica guardada con éxito!',
    };
}


export type ImportResultState = {
  success: boolean;
  message: string;
}

export async function importResultAction(prevState: ImportResultState, formData: FormData): Promise<ImportResultState> {
  const code = formData.get('resultCode') as string;
  if (!code) {
    return { success: false, message: 'El código no puede estar vacío.' };
  }

  try {
    const decoded = JSON.parse(Buffer.from(code, 'base64').toString('utf8'));

    const { patientId, results: importedResults } = decoded;

    if (!patientId || !Array.isArray(importedResults) || importedResults.length === 0) {
      throw new Error('El código es inválido, está corrupto o no contiene resultados.');
    }

    let importedCount = 0;
    for (const res of importedResults) {
        const { questionnaireId, answers } = res;
        if (!questionnaireId || !answers) continue;

        const questionnaire = getQuestionnaire(questionnaireId);
        if (!questionnaire) continue;

        const scores: Record<string, number> = {};
        const totalPossibleScores: Record<string, number> = {};

        for (const section of questionnaire.sections) {
            let sectionScore = 0;
            let sectionTotalPossible = 0;
            const sectionId = section.sectionId;

            for (const question of section.questions) {
                const questionId = question.id;
                const rawAnswer = answers[questionId];

                if (rawAnswer !== undefined && question.type === 'likert' && question.includeInScore !== false) {
                    const value = Number(rawAnswer);
                    let scoreForQuestion = value;

                    if (question.scoring?.type === 'match') {
                        scoreForQuestion = value === question.scoring.value ? 1 : 0;
                    } else if (question.scoring?.type === 'aq-10') {
                        const agrees = value === 3 || value === 2;
                        const disagrees = value === 1 || value === 0;
                        if (question.scoring.agreesIsOne && agrees) scoreForQuestion = 1;
                        else if (!question.scoring.agreesIsOne && disagrees) scoreForQuestion = 1;
                        else scoreForQuestion = 0;
                    } else if (question.scoringDirection === 'Inversa') {
                        const maxScaleValue = Math.max(...section.likertScale.map(o => o.value));
                        const minScaleValue = Math.min(...section.likertScale.map(o => o.value));
                        scoreForQuestion = (maxScaleValue + minScaleValue) - value;
                    }
                    
                    sectionScore += scoreForQuestion;
                }
                if (question.type === 'likert' && question.includeInScore !== false) {
                    if (question.scoring?.type === 'match' || question.scoring?.type === 'aq-10') {
                        sectionTotalPossible += 1;
                    } else {
                        const options = question.options || section.likertScale;
                        sectionTotalPossible += Math.max(...options.map(o => o.value));
                    }
                }
            }
            scores[sectionId] = sectionScore;
            totalPossibleScores[sectionId] = sectionTotalPossible;
        }

        saveResult({
            questionnaireId: questionnaire.id,
            questionnaireName: questionnaire.name,
            answers: answers,
            scores,
            totalPossibleScores,
            submittedAt: new Date(res.submittedAt),
            patientId: patientId,
        });
        importedCount++;
    }

    if (patientId) {
        revalidatePath(`/patients/${patientId}`);
    }
    revalidatePath('/patients');

    return { success: true, message: `Se importaron ${importedCount} resultados de evaluaciones con éxito.` };

  } catch (error: any) {
    console.error("Import error:", error);
    return { success: false, message: 'El código proporcionado es inválido o está corrupto. No se pudo importar el resultado.' };
  }
}

export type DeleteAssignmentState = {
  success: boolean;
  message: string;
};

export async function deleteAssignmentAction(
  prevState: DeleteAssignmentState,
  formData: FormData
): Promise<DeleteAssignmentState> {
  const patientId = formData.get('patientId') as string;
  const assignmentId = formData.get('assignmentId') as string;

  if (!patientId || !assignmentId) {
    return {
      success: false,
      message: 'Faltan el ID del paciente o de la asignación.',
    };
  }

  try {
    deleteAssignment(patientId, assignmentId);
    revalidatePath(`/patients/${patientId}`);
    return {
      success: true,
      message: 'La evaluación asignada ha sido eliminada.',
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || 'No se pudo eliminar la asignación.',
    };
  }
}
