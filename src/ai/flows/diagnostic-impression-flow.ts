'use server';
/**
 * @fileOverview Flujo de IA para generar Impresión Diagnóstica Automática.
 *
 * - generateDiagnosticImpression: Genera una impresión diagnóstica sugerida basada en datos de screening.
 * - DiagnosticImpressionInput: El tipo de entrada para el flujo.
 * - DiagnosticImpressionOutput: El tipo de salida para el flujo.
 *
 * Este flujo NO depende de WISC/WAIS y utiliza datos de screening emocional disponibles.
 */

import { z } from 'zod';

// Esquema de entrada con todos los instrumentos de screening disponibles
export const DiagnosticImpressionInputSchema = z.object({
  // Identificación del estudiante (solo para contexto, no se procesa)
  studentName: z.string().optional().describe('Nombre del estudiante para personalización.'),

  // Screening Emocional
  bdi_score: z.number().min(0).max(63).optional().describe('Puntuación BDI-II (0-63). Depresión.'),
  bai_score: z.number().min(0).max(63).optional().describe('Puntuación BAI (0-63). Ansiedad.'),
  phq9_score: z.number().min(0).max(27).optional().describe('Puntuación PHQ-9 (0-27). Depresión.'),
  gad7_score: z.number().min(0).max(21).optional().describe('Puntuación GAD-7 (0-21). Ansiedad.'),
  hads_anxiety: z.number().min(0).max(21).optional().describe('Puntuación HADS Ansiedad (0-21).'),
  hads_depression: z.number().min(0).max(21).optional().describe('Puntuación HADS Depresión (0-21).'),
  idare_anxiety: z.number().min(0).max(100).optional().describe('Percentil IDARE Ansiedad Estado.'),
  idare_trait: z.number().min(0).max(100).optional().describe('Percentil IDARE Ansiedad Rasgo.'),
  columbia_score: z.number().min(0).optional().describe('Puntuación Columbia-Suicide Severity Rating Scale.'),
  beck_suicide_score: z.number().min(0).optional().describe('Puntuación Ideación Suicida Beck.'),

  // Screening Conductual
  bhs_score: z.number().min(0).max(20).optional().describe('Puntuación BHS (0-20). Desesperanza.'),
  assist_result: z.string().optional().describe('Resultado ASSIST (consumo de sustancias).'),
  self_harm_score: z.number().min(0).optional().describe('Frecuencia conductas autolesivas.'),

  // Tamizaje Neuropsicológico
  neuro_mt_score: z.number().min(0).max(200).optional().describe('Índice Memoria de Trabajo.'),
  neuro_as_score: z.number().min(0).max(200).optional().describe('Índice Atención Sostenida.'),
  neuro_vp_score: z.number().min(0).max(200).optional().describe('Índice Velocidad de Procesamiento.'),

  // Contexto
  cognitive_load_context: z.string().optional().describe('Contexto de carga cognitiva / estrés.'),
  additional_observations: z.string().optional().describe('Observaciones adicionales del evaluador.'),
});

export type DiagnosticImpressionInput = z.infer<typeof DiagnosticImpressionInputSchema>;

// Esquema de salida
export const DiagnosticImpressionOutputSchema = z.object({
  primaryHypothesis: z.string().describe('Hipótesis diagnóstica principal.'),
  secondaryConsiderations: z.array(z.string()).describe('Consideraciones diagnósticas secundarias.'),
  severityLevel: z.enum(['leve', 'moderado', 'severo', 'crítico']).describe('Nivel de severidad estimado.'),
  riskFactors: z.array(z.string()).describe('Factores de riesgo identificados.'),
  protectiveFactors: z.array(z.string()).describe('Factores protectores identificados.'),
  recommendations: z.array(z.string()).describe('Recomendaciones clínicas inmediatas.'),
  requiresUrgentAttention: z.boolean().describe('Si requiere atención urgente.'),
  suggestedAssessments: z.array(z.string()).describe('Evaluaciones adicionales sugeridas.'),
  clinicalNotes: z.string().describe('Notas clínicas adicionales.'),
});

export type DiagnosticImpressionOutput = z.infer<typeof DiagnosticImpressionOutputSchema>;

/**
 * Genera una impresión diagnóstica usando IA basada en datos de screening.
 */
export async function generateDiagnosticImpression(
  input: DiagnosticImpressionInput
): Promise<DiagnosticImpressionOutput> {
  try {
    // Usar el endpoint de Cloud Run para la generación con IA
    const endpoint = process.env.NEXT_PUBLIC_CLOUD_RUN_ENDPOINT || 'https://ai-report-service-jjaeoswhya-uc.a.run.app';

    console.log('[DiagnosticImpression] Using AI Service Endpoint:', endpoint);

    // Construir el contexto clínico
    const clinicalContext = buildClinicalContext(input);

    const response = await fetch(`${endpoint}/generate-diagnostic-impression`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        clinical_data: clinicalContext,
        student_name: input.studentName || 'Estudiante',
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error('Error calling Cloud Run AI service:', response.status, response.statusText, errorBody);

      // Fallback: Generar impresión basada en reglas si el servicio de IA falla
      return generateRuleBasedImpression(input);
    }

    const data = await response.json();
    return data.impression;

  } catch (error) {
    console.error('Failed to generate diagnostic impression:', error);

    // Fallback: Generar impresión basada en reglas
    return generateRuleBasedImpression(input);
  }
}

/**
 * Construye el contexto clínico a partir de los datos de entrada.
 */
function buildClinicalContext(input: DiagnosticImpressionInput): string {
  const sections: string[] = [];

  // Screening Emocional
  if (input.bdi_score !== undefined) {
    const level = getBDILevel(input.bdi_score);
    sections.push(`BDI-II: ${input.bdi_score} puntos (${level})`);
  }

  if (input.bai_score !== undefined) {
    const level = getBAILevel(input.bai_score);
    sections.push(`BAI: ${input.bai_score} puntos (${level})`);
  }

  if (input.phq9_score !== undefined) {
    const level = getPHQ9Level(input.phq9_score);
    sections.push(`PHQ-9: ${input.phq9_score} puntos (${level})`);
  }

  if (input.gad7_score !== undefined) {
    const level = getGAD7Level(input.gad7_score);
    sections.push(`GAD-7: ${input.gad7_score} puntos (${level})`);
  }

  if (input.hads_anxiety !== undefined || input.hads_depression !== undefined) {
    sections.push(`HADS: Ansiedad=${input.hads_anxiety || 'N/A'}, Depresión=${input.hads_depression || 'N/A'}`);
  }

  if (input.idare_anxiety !== undefined || input.idare_trait !== undefined) {
    sections.push(`IDARE: Estado=${input.idare_anxiety || 'N/A'}%, Rasgo=${input.idare_trait || 'N/A'}%`);
  }

  // Riesgo Suicida
  if (input.columbia_score !== undefined) {
    sections.push(`Columbia-Suicide: ${input.columbia_score}`);
  }

  if (input.beck_suicide_score !== undefined) {
    const risk = getSuicideRisk(input.beck_suicide_score);
    sections.push(`Ideación Suicida Beck: ${input.beck_suicide_score} (${risk})`);
  }

  // Screening Conductual
  if (input.bhs_score !== undefined) {
    const level = getBHSLevel(input.bhs_score);
    sections.push(`BHS (Desesperanza): ${input.bhs_score} puntos (${level})`);
  }

  if (input.assist_result) {
    sections.push(`ASSIST: ${input.assist_result}`);
  }

  if (input.self_harm_score !== undefined && input.self_harm_score > 0) {
    sections.push(`Conductas Autolesivas: Frecuencia ${input.self_harm_score}`);
  }

  // Tamizaje Neuropsicológico
  const neuroScores: string[] = [];
  if (input.neuro_mt_score !== undefined) {
    neuroScores.push(`MT=${input.neuro_mt_score}`);
  }
  if (input.neuro_as_score !== undefined) {
    neuroScores.push(`AS=${input.neuro_as_score}`);
  }
  if (input.neuro_vp_score !== undefined) {
    neuroScores.push(`VP=${input.neuro_vp_score}`);
  }
  if (neuroScores.length > 0) {
    sections.push(`Tamizaje Neuropsicológico: ${neuroScores.join(', ')}`);
  }

  // Contexto
  if (input.cognitive_load_context) {
    sections.push(`Contexto de Estrés: ${input.cognitive_load_context}`);
  }

  if (input.additional_observations) {
    sections.push(`Observaciones: ${input.additional_observations}`);
  }

  return sections.join('\n');
}

// Funciones auxiliares para clasificación
function getBDILevel(score: number): string {
  if (score <= 13) return 'mínimo/sin depresión';
  if (score <= 19) return 'depresión leve';
  if (score <= 28) return 'depresión moderada';
  if (score <= 63) return 'depresión severa';
  return 'no clasificado';
}

function getBAILevel(score: number): string {
  if (score <= 7) return 'ansiedad mínima';
  if (score <= 15) return 'ansiedad leve';
  if (score <= 25) return 'ansiedad moderada';
  return 'ansiedad severa';
}

function getPHQ9Level(score: number): string {
  if (score <= 4) return 'sin depresión';
  if (score <= 9) return 'depresión leve';
  if (score <= 14) return 'depresión moderada';
  if (score <= 19) return 'depresión moderadamente severa';
  return 'depresión severa';
}

function getGAD7Level(score: number): string {
  if (score <= 4) return 'sin ansiedad';
  if (score <= 9) return 'ansiedad leve';
  if (score <= 14) return 'ansiedad moderada';
  return 'ansiedad severa';
}

function getSuicideRisk(score: number): string {
  if (score <= 3) return 'riesgo bajo';
  if (score <= 8) return 'riesgo moderado';
  return 'riesgo alto';
}

function getBHSLevel(score: number): string {
  if (score <= 3) return 'desesperanza mínima';
  if (score <= 8) return 'desesperanza leve';
  if (score <= 13) return 'desesperanza moderada';
  return 'desesperanza severa';
}

/**
 * Genera una impresión diagnóstica basada en reglas cuando el servicio de IA no está disponible.
 */
function generateRuleBasedImpression(input: DiagnosticImpressionInput): DiagnosticImpressionOutput {
  const riskFactors: string[] = [];
  const protectiveFactors: string[] = [];
  const recommendations: string[] = [];
  const secondaryConsiderations: string[] = [];
  let requiresUrgentAttention = false;
  let severityLevel: 'leve' | 'moderado' | 'severo' | 'crítico' = 'leve';

  // Evaluar riesgo suicida (prioridad máxima)
  if (input.beck_suicide_score !== undefined && input.beck_suicide_score > 8) {
    requiresUrgentAttention = true;
    severityLevel = 'crítico';
    riskFactors.push('Ideación suicida activa con puntuación elevada');
    recommendations.push('VALORACIÓN PSIQUIÁTRICA URGENTE');
    recommendations.push('Protocolo de seguridad inmediato');
  } else if (input.beck_suicide_score !== undefined && input.beck_suicide_score > 3) {
    severityLevel = 'severo';
    riskFactors.push('Ideación suicida presente');
    recommendations.push('Seguimiento cercano por salud mental');
  }

  // Evaluar depresión
  if (input.bdi_score !== undefined && input.bdi_score > 28) {
    if (severityLevel !== 'crítico') severityLevel = 'severo';
    riskFactors.push('Sintomatología depresiva severa');
    recommendations.push('Evaluación para intervención farmacológica');
    recommendations.push('Terapia cognitivo-conductual recomendada');
  } else if (input.bdi_score !== undefined && input.bdi_score > 19) {
    if (severityLevel === 'leve') severityLevel = 'moderado';
    riskFactors.push('Sintomatología depresiva moderada');
    recommendations.push('Seguimiento psicológico');
  }

  // Evaluar ansiedad
  if (input.bai_score !== undefined && input.bai_score > 25) {
    if (severityLevel === 'leve' || severityLevel === 'moderado') severityLevel = 'severo';
    riskFactors.push('Ansiedad severa');
    secondaryConsiderations.push('Posible trastorno de ansiedad generalizada');
    recommendations.push('Técnicas de manejo de ansiedad');
  }

  // Evaluar desesperanza
  if (input.bhs_score !== undefined && input.bhs_score > 8) {
    riskFactors.push('Desesperanza significativa');
    secondaryConsiderations.push('Factor de riesgo para conducta suicida');
  }

  // Evaluar funciones ejecutivas
  if (input.neuro_mt_score !== undefined && input.neuro_mt_score < 85) {
    secondaryConsiderations.push('Déficit en memoria de trabajo');
    recommendations.push('Ajustes pedagógicos para tareas que requieren retención de información');
    protectiveFactors.push('Posible compensación con apoyos externos');
  }

  if (input.neuro_as_score !== undefined && input.neuro_as_score < 85) {
    secondaryConsiderations.push('Dificultades en atención sostenida');
    recommendations.push('Ambiente de trabajo reducido en estímulos');
  }

  // Evaluar consumo de sustancias
  if (input.assist_result && input.assist_result.toLowerCase().includes('positivo')) {
    riskFactors.push('Consumo de sustancias detectado');
    recommendations.push('Evaluación de adicciones');
  }

  // Evaluar autolesiones
  if (input.self_harm_score !== undefined && input.self_harm_score > 0) {
    riskFactors.push('Conductas autolesivas presentes');
    recommendations.push('Plan de seguridad para autolesiones');
    if (severityLevel === 'leve') severityLevel = 'moderado';
  }

  // Contexto de estrés
  if (input.cognitive_load_context) {
    secondaryConsiderations.push(`Contexto estresante identificado: ${input.cognitive_load_context.substring(0, 50)}...`);
  }

  // Agregar factores protectores por defecto
  protectiveFactors.push('Búsqueda de apoyo profesional');

  // Construir hipótesis principal
  let primaryHypothesis = 'Sintomatología ';

  if (input.bdi_score !== undefined && input.bdi_score > 19) {
    primaryHypothesis += 'depresiva ';
  }
  if (input.bai_score !== undefined && input.bai_score > 15) {
    primaryHypothesis += 'y ansiosa ';
  }

  if (input.neuro_mt_score !== undefined && input.neuro_mt_score < 85) {
    primaryHypothesis += 'con afectación en funciones ejecutivas (memoria de trabajo) ';
  }

  if (primaryHypothesis === 'Sintomatología ') {
    primaryHypothesis = 'Sin evidencia suficiente para hipótesis diagnóstica específica. Se sugiere evaluación más profunda.';
  } else {
    primaryHypothesis += '. Se recomienda evaluación clínica integral para confirmar diagnóstico.';
  }

  // Sugerencias de evaluaciones adicionales
  const suggestedAssessments: string[] = [];
  if (input.bdi_score === undefined && input.bai_score === undefined) {
    suggestedAssessments.push('BDI-II y BAI para screening emocional');
  }
  if (input.beck_suicide_score === undefined && severityLevel !== 'leve') {
    suggestedAssessments.push('Escala de Ideación Suicida de Beck');
  }
  if (input.neuro_mt_score === undefined && input.neuro_as_score === undefined) {
    suggestedAssessments.push('Tamizaje neuropsicológico');
  }

  return {
    primaryHypothesis,
    secondaryConsiderations,
    severityLevel,
    riskFactors,
    protectiveFactors,
    recommendations,
    requiresUrgentAttention,
    suggestedAssessments,
    clinicalNotes: 'Impresión generada automáticamente basada en datos de screening. Esta sugerencia no sustituye el juicio clínico profesional.',
  };
}

/**
 * Versión simplificada para uso directo en componentes.
 */
export async function getQuickDiagnosticAssessment(
  bdiScore?: number,
  baiScore?: number,
  suicideRisk?: number
): Promise<{ severity: string; urgentAction: string | null }> {
  let severity = 'bajo';
  let urgentAction: string | null = null;

  // Evaluar riesgo suicida primero
  if (suicideRisk !== undefined && suicideRisk > 8) {
    return {
      severity: 'crítico',
      urgentAction: 'VALORACIÓN PSIQUIÁTRICA URGENTE - Riesgo suicida elevado',
    };
  }

  // Evaluar combinación de síntomas
  const depressionSevere = bdiScore !== undefined && bdiScore > 28;
  const anxietySevere = baiScore !== undefined && baiScore > 25;

  if (depressionSevere && anxietySevere) {
    severity = 'crítico';
    urgentAction = 'Comorbilidad depresión-ansiedad severa. Requiere atención prioritaria.';
  } else if (depressionSevere || anxietySevere) {
    severity = 'alto';
    urgentAction = 'Sintomatología severa detectada. Seguimiento cercano recomendado.';
  } else if ((bdiScore !== undefined && bdiScore > 19) || (baiScore !== undefined && baiScore > 15)) {
    severity = 'moderado';
  }

  return { severity, urgentAction };
}
