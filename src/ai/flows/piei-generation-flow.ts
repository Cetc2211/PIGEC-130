'use server';
/**
 * @fileOverview Flujo de IA para generar Planes de Intervención Educativa Individualizados (PIEI).
 *
 * - generatePIEI: Genera un PIEI completo basado en datos clínicos y académicos.
 * - PIEIInput: El tipo de entrada para el flujo.
 * - PIEIOutput: El tipo de salida para el flujo.
 */

import { z } from 'zod';

// Esquema de datos clínicos (recreado localmente para evitar dependencia circular)
const ClinicalDataSchema = z.object({
  studentName: z.string().optional(),
  bdi_score: z.number().min(0).max(63).optional(),
  bai_score: z.number().min(0).max(63).optional(),
  phq9_score: z.number().min(0).max(27).optional(),
  gad7_score: z.number().min(0).max(21).optional(),
  hads_anxiety: z.number().min(0).max(21).optional(),
  hads_depression: z.number().min(0).max(21).optional(),
  idare_anxiety: z.number().min(0).max(100).optional(),
  idare_trait: z.number().min(0).max(100).optional(),
  columbia_score: z.number().min(0).optional(),
  beck_suicide_score: z.number().min(0).optional(),
  bhs_score: z.number().min(0).max(20).optional(),
  assist_result: z.string().optional(),
  self_harm_score: z.number().min(0).optional(),
  neuro_mt_score: z.number().min(0).max(200).optional(),
  neuro_as_score: z.number().min(0).max(200).optional(),
  neuro_vp_score: z.number().min(0).max(200).optional(),
  cognitive_load_context: z.string().optional(),
  additional_observations: z.string().optional(),
}).optional();

// Esquema de entrada
export const PIEIInputSchema = z.object({
  studentName: z.string().describe('Nombre del estudiante.'),
  studentAge: z.number().optional().describe('Edad del estudiante.'),
  grade: z.string().optional().describe('Grado escolar.'),
  school: z.string().optional().describe('Institución educativa.'),

  // Datos académicos
  academicPerformance: z.object({
    averageGrade: z.number().describe('Promedio general.'),
    attendanceRate: z.number().describe('Tasa de asistencia (%).'),
    atRiskSubjects: z.array(z.string()).optional().describe('Materias en riesgo.'),
    strengths: z.array(z.string()).optional().describe('Fortalezas académicas.'),
  }).optional(),

  // Datos clínicos
  clinicalData: ClinicalDataSchema,

  // Diagnóstico previo (si existe)
  existingDiagnosis: z.string().optional().describe('Diagnóstico clínico previo.'),

  // Objetivos específicos
  specificGoals: z.array(z.string()).optional().describe('Objetivos específicos solicitados.'),

  // Restricciones
  constraints: z.array(z.string()).optional().describe('Restricciones o limitaciones a considerar.'),
});

export type PIEIInput = z.infer<typeof PIEIInputSchema>;

// Esquema de intervención individual
const InterventionSchema = z.object({
  id: z.string().describe('Identificador único de la intervención.'),
  area: z.enum(['académica', 'emocional', 'conductual', 'social', 'familiar', 'neurocognitiva']).describe('Área de intervención.'),
  objective: z.string().describe('Objetivo específico de la intervención.'),
  strategy: z.string().describe('Estrategia o técnica a utilizar.'),
  frequency: z.string().describe('Frecuencia de aplicación.'),
  responsible: z.string().describe('Responsable de la intervención.'),
  indicators: z.array(z.string()).describe('Indicadores de logro.'),
  resources: z.array(z.string()).optional().describe('Recursos necesarios.'),
  evidence: z.string().optional().describe('Base de evidencia científica.'),
});

// Esquema de salida
export const PIEIOutputSchema = z.object({
  // Información general
  planTitle: z.string().describe('Título del plan de intervención.'),
  generatedDate: z.string().describe('Fecha de generación del plan.'),

  // Resumen ejecutivo
  executiveSummary: z.string().describe('Resumen ejecutivo del plan.'),

  // Perfil del estudiante
  studentProfile: z.object({
    strengths: z.array(z.string()).describe('Fortalezas identificadas.'),
    areasOfImprovement: z.array(z.string()).describe('Áreas de mejora.'),
    learningStyle: z.string().optional().describe('Estilo de aprendizaje sugerido.'),
    riskLevel: z.enum(['bajo', 'medio', 'alto', 'crítico']).describe('Nivel de riesgo global.'),
  }),

  // Intervenciones
  interventions: z.array(InterventionSchema).describe('Lista de intervenciones propuestas.'),

  // Cronograma
  timeline: z.object({
    shortTerm: z.array(z.string()).describe('Metas a corto plazo (1-4 semanas).'),
    mediumTerm: z.array(z.string()).describe('Metas a mediano plazo (1-3 meses).'),
    longTerm: z.array(z.string()).describe('Metas a largo plazo (3-6 meses).'),
  }),

  // Ajustes razonables
  reasonableAccommodations: z.array(z.object({
    accommodation: z.string().describe('Ajuste razonable.'),
    justification: z.string().describe('Justificación clínica/académica.'),
    implementation: z.string().describe('Modo de implementación.'),
  })).optional().describe('Ajustes razonables para el entorno educativo.'),

  // Seguimiento
  monitoringPlan: z.object({
    frequency: z.string().describe('Frecuencia de revisiones.'),
    indicators: z.array(z.string()).describe('Indicadores de seguimiento.'),
    responsibleParties: z.array(z.string()).describe('Partes responsables del seguimiento.'),
    nextReviewDate: z.string().describe('Fecha de próxima revisión.'),
  }),

  // Recursos adicionales
  additionalResources: z.array(z.object({
    type: z.enum(['material', 'profesional', 'institucional', 'digital']),
    name: z.string(),
    description: z.string().optional(),
  })).optional().describe('Recursos adicionales recomendados.'),

  // Notas
  clinicalNotes: z.string().optional().describe('Notas clínicas adicionales.'),
  legalDisclaimer: z.string().describe('Aviso legal sobre el uso del plan.'),
});

export type PIEIOutput = z.infer<typeof PIEIOutputSchema>;

/**
 * Genera un PIEI usando IA basado en datos clínicos y académicos.
 */
export async function generatePIEI(input: PIEIInput): Promise<PIEIOutput> {
  try {
    // Usar el endpoint de Cloud Run para la generación con IA
    const endpoint = process.env.NEXT_PUBLIC_CLOUD_RUN_ENDPOINT || 'https://ai-report-service-jjaeoswhya-uc.a.run.app';

    console.log('[PIEI] Using AI Service Endpoint:', endpoint);

    const response = await fetch(`${endpoint}/generate-piei`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        student_name: input.studentName,
        student_age: input.studentAge,
        grade: input.grade,
        school: input.school,
        academic_performance: input.academicPerformance,
        clinical_data: input.clinicalData,
        existing_diagnosis: input.existingDiagnosis,
        specific_goals: input.specificGoals,
        constraints: input.constraints,
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error('Error calling Cloud Run AI service:', response.status, response.statusText, errorBody);

      // Fallback: Generar PIEI basado en reglas
      return generateRuleBasedPIEI(input);
    }

    const data = await response.json();
    return data.piei;

  } catch (error) {
    console.error('Failed to generate PIEI:', error);

    // Fallback: Generar PIEI basado en reglas
    return generateRuleBasedPIEI(input);
  }
}

/**
 * Genera un PIEI basado en reglas cuando el servicio de IA no está disponible.
 */
function generateRuleBasedPIEI(input: PIEIInput): PIEIOutput {
  const interventions: PIEIOutput['interventions'] = [];
  const accommodations: PIEIOutput['reasonableAccommodations'] = [];
  const strengths: string[] = [];
  const areasOfImprovement: string[] = [];

  // Analizar datos clínicos para generar intervenciones
  const clinical = input.clinicalData;

  // === ANÁLISIS DE DEPRESIÓN ===
  if (clinical?.bdi_score !== undefined && clinical.bdi_score > 13) {
    areasOfImprovement.push('Estado de ánimo');

    if (clinical.bdi_score > 28) {
      interventions.push({
        id: 'int_dep_1',
        area: 'emocional',
        objective: 'Reducir sintomatología depresiva severa',
        strategy: 'Terapia cognitivo-conductual con enfoque en activación conductual',
        frequency: '2 sesiones por semana',
        responsible: 'Psicólogo clínico',
        indicators: ['Reducción de puntuación BDI-II en 25%', 'Mejora en rutinas diarias'],
        resources: ['Registro de actividades', 'Escala BDI-II de seguimiento'],
        evidence: 'Beck et al. (1979) - Terapia Cognitiva de la Depresión',
      });
    } else if (clinical.bdi_score > 19) {
      interventions.push({
        id: 'int_dep_2',
        area: 'emocional',
        objective: 'Manejo de sintomatología depresiva moderada',
        strategy: 'Técnicas de activación conductual y reestructuración cognitiva',
        frequency: '1 sesión por semana',
        responsible: 'Psicólogo/Orientador',
        indicators: ['Cumplimiento de actividades programadas', 'Identificación de pensamientos negativos'],
        resources: ['Agenda de actividades', 'Diario de pensamientos'],
        evidence: 'Martell et al. (2010) - Activación Conductual',
      });
    }

    // Ajustes por depresión
    accommodations.push({
      accommodation: 'Extensiones de tiempo para entregas',
      justification: 'La sintomatología depresiva afecta la motivación y energía para tareas',
      implementation: 'Coordinar con docentes para flexibilidad en plazos',
    });
  }

  // === ANÁLISIS DE ANSIEDAD ===
  if (clinical?.bai_score !== undefined && clinical.bai_score > 7) {
    areasOfImprovement.push('Manejo de ansiedad');

    interventions.push({
      id: 'int_ans_1',
      area: 'emocional',
      objective: 'Desarrollar estrategias de afrontamiento para la ansiedad',
      strategy: 'Técnicas de relajación y respiración, exposición gradual',
      frequency: 'Sesión semanal + práctica diaria',
      responsible: 'Psicólogo/Orientador',
      indicators: ['Aplicación autónoma de técnicas de relajación', 'Reducción de evitación'],
      resources: ['App de meditación', 'Guía de ejercicios de respiración'],
      evidence: 'Craske et al. (2009) - Tratamiento del trastorno de ansiedad',
    });

    accommodations.push({
      accommodation: 'Ambiente reducido de estímulos para evaluaciones',
      justification: 'La ansiedad puede exacerbarse en situaciones de evaluación',
      implementation: 'Aplicar exámenes en espacio tranquilo, permitir audífonos',
    });
  }

  // === ANÁLISIS NEUROCOGNITIVO ===
  if (clinical?.neuro_mt_score !== undefined && clinical.neuro_mt_score < 85) {
    areasOfImprovement.push('Memoria de trabajo');

    interventions.push({
      id: 'int_neuro_1',
      area: 'neurocognitiva',
      objective: 'Compensar déficit en memoria de trabajo',
      strategy: 'Uso de apoyos externos y segmentación de tareas',
      frequency: 'Aplicación continua en contexto académico',
      responsible: 'Docente/Orientador',
      indicators: ['Seguimiento de instrucciones multi-paso', 'Uso autónomo de apoyos visuales'],
      resources: ['Agenda visual', 'Grabadora de audio', 'Mapas conceptuales'],
      evidence: 'Gathercole & Alloway (2008) - Working Memory and Learning',
    });

    accommodations.push({
      accommodation: 'Instrucciones segmentadas y por escrito',
      justification: 'Déficit en memoria de trabajo dificulta retención de instrucciones verbales',
      implementation: 'Proporcionar instrucciones un paso a la vez, con apoyo visual',
    });
  }

  if (clinical?.neuro_as_score !== undefined && clinical.neuro_as_score < 85) {
    areasOfImprovement.push('Atención sostenida');

    interventions.push({
      id: 'int_neuro_2',
      area: 'neurocognitiva',
      objective: 'Mejorar capacidad de atención sostenida',
      strategy: 'Entrenamiento en mindfulness y pausas estructuradas',
      frequency: 'Práctica diaria de 10 minutos',
      responsible: 'Orientador/Docente',
      indicators: ['Incremento en tiempo de atención sostenida', 'Reducción de distracciones'],
      resources: ['Timer visual', 'Ejercicios de mindfulness adaptados'],
      evidence: 'Zelazo & Lyons (2012) - Mindfulness y funciones ejecutivas',
    });

    accommodations.push({
      accommodation: 'Pausas estructuradas durante clases largas',
      justification: 'Dificultad para mantener atención por períodos prolongados',
      implementation: 'Permitir pausa de 2-3 minutos cada 20-25 minutos de clase',
    });
  }

  // === ANÁLISIS DE RIESGO SUICIDA ===
  if (clinical?.beck_suicide_score !== undefined && clinical.beck_suicide_score > 3) {
    interventions.unshift({
      id: 'int_crit_1',
      area: 'emocional',
      objective: 'ASEGURAR SEGURIDAD Y REDUCIR RIESGO SUICIDA',
      strategy: 'Plan de seguridad, intervención en crisis, seguimiento cercano',
      frequency: 'Diario hasta estabilización',
      responsible: 'Psiquiatra/Psicólogo clínico',
      indicators: ['Ausencia de ideación suicida activa', 'Compromiso con plan de seguridad'],
      resources: ['Líneas de ayuda', 'Contactos de emergencia', 'Plan de seguridad escrito'],
      evidence: 'Jobes (2016) - Collaborative Assessment and Management of Suicidality',
    });
  }

  // === ANÁLISIS ACADÉMICO ===
  if (input.academicPerformance) {
    if (input.academicPerformance.averageGrade < 70) {
      areasOfImprovement.push('Rendimiento académico');

      interventions.push({
        id: 'int_acad_1',
        area: 'académica',
        objective: 'Mejorar rendimiento académico general',
        strategy: 'Tutorías personalizadas y técnicas de estudio',
        frequency: '2-3 sesiones por semana',
        responsible: 'Tutor académico',
        indicators: ['Incremento de 10% en promedio', 'Cumplimiento de tareas'],
        resources: ['Material de estudio adaptado', 'Guías de técnicas de estudio'],
        evidence: 'Hattie (2009) - Visible Learning',
      });
    }

    if (input.academicPerformance.attendanceRate < 80) {
      areasOfImprovement.push('Asistencia escolar');

      interventions.push({
        id: 'int_acad_2',
        area: 'académica',
        objective: 'Mejorar tasa de asistencia',
        strategy: 'Identificación de barreras y refuerzo positivo',
        frequency: 'Seguimiento semanal',
        responsible: 'Orientador/Trabajador social',
        indicators: ['Asistencia superior al 90%', 'Identificación de factores de ausentismo'],
        resources: ['Sistema de monitoreo de asistencia', 'Contacto con familia'],
        evidence: 'Kearney (2008) - School absenteeism',
      });
    }

    if (input.academicPerformance.strengths && input.academicPerformance.strengths.length > 0) {
      strengths.push(...input.academicPerformance.strengths);
    }
  }

  // Agregar fortalezas por defecto si no hay
  if (strengths.length === 0) {
    strengths.push('Capacidad de respuesta a la intervención');
    strengths.push('Acceso a servicios de apoyo educativo');
  }

  // === GENERAR PLAN COMPLETO ===
  const now = new Date();
  const nextReview = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 días

  // Determinar nivel de riesgo
  let riskLevel: 'bajo' | 'medio' | 'alto' | 'crítico' = 'bajo';
  if (clinical?.beck_suicide_score !== undefined && clinical.beck_suicide_score > 3) {
    riskLevel = 'crítico';
  } else if (clinical?.bdi_score !== undefined && clinical.bdi_score > 28) {
    riskLevel = 'alto';
  } else if (areasOfImprovement.length > 2) {
    riskLevel = 'medio';
  }

  return {
    planTitle: `Plan de Intervención Educativa Individualizado - ${input.studentName}`,
    generatedDate: now.toISOString(),

    executiveSummary: `Este PIEI ha sido generado para ${input.studentName}, considerando las áreas de mejora identificadas: ${areasOfImprovement.join(', ')}. El plan incluye ${interventions.length} intervenciones específicas en las áreas ${Array.from(new Set(interventions.map(i => i.area))).join(', ')}. El nivel de riesgo global es ${riskLevel}.`,

    studentProfile: {
      strengths,
      areasOfImprovement,
      learningStyle: 'Visual/Kinestésico sugerido basado en perfil neuropsicológico',
      riskLevel,
    },

    interventions,

    timeline: {
      shortTerm: [
        'Establecer rapport con el estudiante',
        'Implementar ajustes razonables inmediatos',
        'Primera sesión de intervención',
      ],
      mediumTerm: [
        'Evaluación de progreso inicial',
        'Ajustes al plan según respuesta',
        'Coordinación con familia',
      ],
      longTerm: [
        'Evaluación de efectividad del plan',
        'Transición a mantenimiento',
        'Preparación para cierre de intervención',
      ],
    },

    reasonableAccommodations: accommodations.length > 0 ? accommodations : undefined,

    monitoringPlan: {
      frequency: 'Semanal las primeras 4 semanas, luego quincenal',
      indicators: [
        'Asistencia a sesiones de intervención',
        'Cumplimiento de indicadores de logro',
        'Reportes de docentes',
        'Auto-reporte del estudiante',
      ],
      responsibleParties: ['Orientador', 'Psicólogo', 'Docente tutor', 'Familia'],
      nextReviewDate: nextReview.toISOString(),
    },

    additionalResources: [
      {
        type: 'digital',
        name: 'Aplicaciones de mindfulness (Headspace, Calm)',
        description: 'Para práctica de técnicas de relajación',
      },
      {
        type: 'material',
        name: 'Agenda visual personalizada',
        description: 'Apoyo para organización y memoria de trabajo',
      },
      {
        type: 'profesional',
        name: 'Servicios de salud mental escolar',
        description: 'Apoyo emocional y conductual',
      },
    ],

    clinicalNotes: 'Plan generado automáticamente basado en datos de screening y rendimiento académico. Este documento no sustituye una evaluación clínica completa ni el juicio profesional.',

    legalDisclaimer: 'Este Plan de Intervención Educativa Individualizado (PIEI) es un documento de orientación educativa generado con apoyo de inteligencia artificial. No constituye un diagnóstico médico ni psicológico. Las intervenciones propuestas deben ser revisadas y adaptadas por profesionales capacitados antes de su implementación. El uso de este plan es responsabilidad del profesional a cargo del caso.',
  };
}

/**
 * Genera intervenciones específicas para un área determinada.
 */
export async function generateInterventionsForArea(
  area: 'académica' | 'emocional' | 'conductual' | 'social' | 'familiar' | 'neurocognitiva',
  specificNeeds: string[],
  studentContext?: Partial<PIEIInput>
): Promise<PIEIOutput['interventions']> {
  // Por ahora, usar el generador completo y filtrar
  const fullPlan = await generatePIEI({
    studentName: studentContext?.studentName || 'Estudiante',
    ...studentContext,
  });

  return fullPlan.interventions.filter(i => i.area === area);
}
