'use server';

import { z } from 'zod';
import { redirect } from 'next/navigation';
import { getQuestionnaire, saveCustomQuestionnaire } from '@/lib/data';
import { saveResult } from '@/lib/store';
import { generateEvaluationReport } from '@/ai/flows/generate-evaluation-report';
import { revalidatePath } from 'next/cache';
import { createQuestionnaireFromPdf } from '@/ai/flows/create-questionnaire-from-pdf';
import { createQuestionnaireFromText } from '@/ai/flows/create-questionnaire-from-text';


export type FormState = {
  message: string;
  errors?: Record<string, string[] | undefined>;
};

export async function submitEvaluation(
  questionnaireId: string,
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const questionnaire = getQuestionnaire(questionnaireId);
  if (!questionnaire) {
    return { message: 'Error: Cuestionario no encontrado.' };
  }

  const schemaFields: Record<string, any> = {};
  questionnaire.questions.forEach((q) => {
    schemaFields[q.id] = z.string({ required_error: 'Por favor, selecciona una respuesta.' });
  });
  const schema = z.object(schemaFields);

  const parsed = schema.safeParse(Object.fromEntries(formData.entries()));

  if (!parsed.success) {
    return {
      message: 'Por favor, responde todas las preguntas antes de enviar.',
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  const answers = parsed.data;
  let score = 0;
  const answerValues: Record<string, number> = {};

  for (const questionId in answers) {
    const value = parseInt(answers[questionId], 10);
    score += value;
    answerValues[questionId] = value;
  }

  const totalPossibleScore = questionnaire.questions.length * (questionnaire.likertScale.length - 1);

  const result = saveResult({
    questionnaireId: questionnaire.id,
    questionnaireName: questionnaire.name,
    answers: answerValues,
    score,
    totalPossibleScore,
    submittedAt: new Date(),
  });

  redirect(`/results/${result.id}`);
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
    severity: z.enum(['Baja', 'Leve', 'Moderada', 'Alta']),
    summary: z.string().min(1, 'El resumen es obligatorio'),
});

const formSchema = z.object({
  name: z.string().min(1, 'El nombre es obligatorio'),
  description: z.string().min(1, 'La descripción es obligatoria'),
  questions: z.array(z.object({ text: z.string().min(1, 'El texto de la pregunta no puede estar vacío') })).min(1, 'Se requiere al menos una pregunta'),
  likertScale: z.array(z.object({ label: z.string().min(1, 'La etiqueta de la escala no puede estar vacía'), value: z.number() })).min(2, 'Se requieren al menos dos opciones de escala'),
  interpretations: z.array(interpretationSchema).min(1, 'Se requiere al menos una regla de interpretación'),
});


export async function createQuestionnaireAction(
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

    const { name, description, questions, likertScale, interpretations } = parsed.data;

    const newQuestionnaire = saveCustomQuestionnaire({
      name,
      description,
      questions: questions.map((q, i) => ({ ...q, id: `q${i+1}` })),
      likertScale,
      interpretationData: interpretations,
    });

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
