// Nota del Experto: Los tipos 'EvaluationResult' y 'PatientResults' se asumen
// definidos en '@/lib/store' y se replican aquí para el contexto de la función.
// La lógica de la GII-M (Perfiles A, B, C, D) se implementa priorizando el
// riesgo suicida (Perfil D), seguido de la gravedad de síntomas depresivos y ansiosos.

/**
 * Define la estructura para los resultados de una evaluación.
 * (Asumido de '@/lib/store' para la implementación)
 */
type EvaluationResult = {
  instrumentName: string;
  date: Date;
  score: number;
  severity: string; // E.g., "Leve", "Moderada", "Grave"
  suicideRisk: boolean; // Indica si se respondió afirmativamente a una pregunta crítica
};

/**
 * Define el objeto de entrada para la función generatePatientProfile.
 * (Asumido de '@/lib/store' para la implementación)
 */
type PatientResults = {
  results: EvaluationResult[];
};

/**
 * El tipo de objeto que la función DEBE retornar.
 */
export type PatientProfile = {
  profileId: 'perfil-a' | 'perfil-b' | 'perfil-c' | 'perfil-d' | 'inclasificable';
  name: string;
  summary: string;
  protocol: string;
  monitoringFrequency: string;
  recommendedInstruments: string[];
  keyScores: Array<{
    instrumentName: string;
    score: number;
    severity: string;
  }>;
};

/**
 * Busca el resultado más reciente de un instrumento específico.
 * @param results Resultados de las evaluaciones del paciente.
 * @param instrumentName Nombre del instrumento a buscar.
 * @returns El resultado más reciente o undefined.
 */
function getLatestScore(results: EvaluationResult[], instrumentName: string): EvaluationResult | undefined {
  return results
    .filter(r => r.instrumentName.includes(instrumentName)) // Use includes for broader matching
    .sort((a, b) => b.date.getTime() - a.date.getTime())[0];
}

/**
 * Mapea la severidad textual a un valor numérico para comparación.
 * Nota: 'Alta' (3) debe ser mayor que 'Moderada' (2), 'Leve' (1) y 'Baja' (0).
 * @param severity Nivel de severidad como string.
 * @returns Valor numérico de severidad.
 */
function mapSeverityToNumber(severity: string): number {
  switch (severity.toLowerCase()) {
    case 'alta':
    case 'grave':
      return 3;
    case 'moderada':
      return 2;
    case 'leve':
      return 1;
    default:
      return 0; // Baja, Mínima, Normal
  }
}

/**
 * Genera un Perfil Clínico GII-M basado en los resultados de evaluación del paciente.
 *
 * @param {PatientResults} data - Objeto con los resultados de evaluación del paciente.
 * @returns {PatientProfile} El perfil clínico integrado del paciente.
 */
export function generatePatientProfile(data: PatientResults): PatientProfile {
  const { results } = data;

  // 1. Encontrar puntuaciones más recientes (BDI-II, BAI, GAD-7)
  const bdi = getLatestScore(results, 'BDI-II') || getLatestScore(results, 'PHQ-9');
  const bai = getLatestScore(results, 'BAI');
  const gad = getLatestScore(results, 'GAD-7');
  
  // Asumimos que los instrumentos de riesgo suicida incluyen cualquier instrumento que
  // tenga la propiedad 'suicideRisk: true' en su resultado, o instrumentos como el SSI/PHQ-9.
  const suicideIndicators = results.filter(r => r.suicideRisk);
  
  const keyScores: PatientProfile['keyScores'] = [];

  if (bdi) keyScores.push({ instrumentName: bdi.instrumentName, score: bdi.score, severity: bdi.severity });
  if (bai) keyScores.push({ instrumentName: bai.instrumentName, score: bai.score, severity: bai.severity });
  if (gad) keyScores.push({ instrumentName: gad.instrumentName, score: gad.score, severity: gad.severity });

  // --- Lógica GII-M ---

  // PERFIL D: RIESGO SUICIDA (MÁXIMA PRIORIDAD)
  if (suicideIndicators.length > 0) {
    return {
      profileId: 'perfil-d',
      name: 'RIESGO SUICIDA ACTIVO',
      summary: 'Se ha identificado un riesgo potencial o activo de conducta suicida basado en las respuestas afirmativas a preguntas críticas en la evaluación. La prioridad clínica es absoluta.',
      protocol: 'PROTOCOLO DE CRISIS (Estabilización, Contención y Plan de Seguridad)',
      monitoringFrequency: 'Diario/Urgente',
      recommendedInstruments: ['SSI', 'BHS', 'PHQ-9 (ítem 9)'],
      keyScores: keyScores,
    };
  }

  // Si no hay puntuaciones clave, se considera inclasificable
  if (!bdi && !bai && !gad) {
    return {
      profileId: 'inclasificable',
      name: 'INCLASIFICABLE (DATOS INSUFICIENTES)',
      summary: 'No se encontraron puntuaciones recientes para los instrumentos clave (BDI-II, BAI, GAD-7) para aplicar la Guía de Interpretación Integrada y Monitoreo (GII-M). Se requiere una evaluación completa.',
      protocol: 'N/A',
      monitoringFrequency: 'N/A',
      recommendedInstruments: ['BDI-II', 'BAI', 'GAD-7'],
      keyScores: [],
    };
  }

  // Conversión de severidad a número para comparación
  const bdiSeverity = bdi ? mapSeverityToNumber(bdi.severity) : 0;
  const baiSeverity = bai ? mapSeverityToNumber(bai.severity) : 0;
  const gadSeverity = gad ? mapSeverityToNumber(gad.severity) : 0;

  // PERFIL C: MIXTO ANSIOSO-DEPRESIVO (Comorbilidad, BDI y BAI/GAD >= Leve)
  if (bdiSeverity >= 1 && (baiSeverity >= 1 || gadSeverity >= 1)) {
    const isSevere = bdiSeverity >= 2 && (baiSeverity >= 2 || gadSeverity >= 2);
    return {
        profileId: 'perfil-c',
        name: `MIXTO ANSIOSO-DEPRESIVO (${isSevere ? 'MODERADO/ALTO' : 'LEVE'})`,
        summary: `Presencia de sintomatología clínica significativa de depresión y ansiedad, indicando una comorbilidad de alta relevancia para el plan de tratamiento. El enfoque debe ser transdiagnóstico.`,
        protocol: isSevere ? 'Transdiagnóstico (TCC/Mindfulness, enfocado en mecanismos comunes)' : 'Transdiagnóstico de Baja Intensidad (Detección Temprana)',
        monitoringFrequency: isSevere ? 'Quincenal' : 'Mensual',
        recommendedInstruments: isSevere ? ['PHQ-9', 'GAD-7', 'Medida de Síntomas Transversales-Nivel 1 (DSM-5)'] : ['PHQ-9', 'GAD-7'],
        keyScores: keyScores,
    };
  }


  // PERFIL A: DOMINIO DEPRESIVO (BDI >= Leve y BAI/GAD < Leve)
  if (bdiSeverity >= 1 && baiSeverity < 1 && gadSeverity < 1) {
    return {
      profileId: 'perfil-a',
      name: 'DOMINIO DEPRESIVO',
      summary: 'Predominancia clara de síntomas depresivos, tales como ánimo bajo persistente, anhedonia y desesperanza, sin una activación ansiosa significativa. Se recomienda un protocolo específico para Trastornos Depresivos.',
      protocol: 'Específico (Terapia Cognitiva de la Depresión o Terapia de Activación Conductual)',
      monitoringFrequency: bdiSeverity >= 2 ? 'Quincenal' : 'Mensual',
      recommendedInstruments: ['BDI-II', 'PHQ-9', 'ASRM (para descartar bipolaridad)'],
      keyScores: keyScores,
    };
  }

  // PERFIL B: DOMINIO ANSIOSO (BAI/GAD >= Leve y BDI < Leve)
  if ((baiSeverity >= 1 || gadSeverity >= 1) && bdiSeverity < 1) {
    return {
      profileId: 'perfil-b',
      name: 'DOMINIO ANSIOSO',
      summary: 'Predominancia clara de síntomas de ansiedad (preocupación, tensión, hiperactivación autonómica) con una sintomatología depresiva mínima o ausente. El protocolo debe centrarse en la exposición y la reestructuración cognitiva.',
      protocol: 'Específico (Terapia de Exposición y Reestructuración Cognitiva)',
      monitoringFrequency: (baiSeverity >= 2 || gadSeverity >= 2) ? 'Quincenal' : 'Mensual',
      recommendedInstruments: ['BAI', 'GAD-7', 'PSWQ'],
      keyScores: keyScores,
    };
  }

  // PERFIL INCLASIFICABLE (por defecto si se pasa el filtro D, A, B y C sin clasificar)
  return {
    profileId: 'inclasificable',
    name: 'INCLASIFICABLE (PATRÓN NO ESTANDAR)',
    summary: 'Los resultados de las evaluaciones no se alinean claramente con los perfiles A, B o C de la GII-M o la severidad es mínima en todos los dominios clave. Se recomienda juicio clínico adicional.',
    protocol: 'N/A',
    monitoringFrequency: 'N/A',
    recommendedInstruments: ['Medida de Síntomas Transversales-Nivel 1 (DSM-5)'],
    keyScores: keyScores,
  };
}
