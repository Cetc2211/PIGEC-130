// Nota del Experto: Este módulo implementa la "Guía de Interpretación Integrada y Monitoreo" (GII-M)
// y la lógica para generar una Impresión Clínica completa, integrando datos psicométricos y de entrevista.

// --- Definiciones de Tipos de Datos (Entrada y Salida) ---

/**
 * Representa los datos estructurados de la entrevista clínica semiestructurada (ECPA).
 */
export type InterviewData = {
    // FASE I: Identificación y Queja
    motivoConsulta: string;
    expectativasTratamiento: string;

    // FASE II: Nivel de Seguridad y Gravedad (Triage Inmediato)
    riesgoSuicidaActivo: boolean;
    crisisPsicotica: boolean;

    // FASE III: Historia Clínica y Sistemas (Exploración Profunda)
    historiaEnfermedadActual: string;
    ansiedadDominante: boolean;
    depresionDominante: boolean;
    disociacion: boolean;
    controlImpulsos: boolean;
    traumaInfancia: boolean;
    dinamicaFamiliar: string;
    desarrolloSexual: string;
    escolaridadProblemas: boolean;
    
    // FASE IV: Diagnósticos Médicos/Sustancias (DSM-5 Criterio C/E)
    afeccionMedicaCronica: string;
    consumoSustanciasActual: string;
    
    // OUTPUT: Impresiones del clínico
    impresionCIE11_DSM5: string;
    impresionDiagnosticoDiferencial: string;
};


/**
 * Define la estructura para los resultados de una evaluación psicométrica.
 * (Asumido de '@/lib/store' para la implementación)
 */
type EvaluationResultForDiagnosis = {
  instrumentName: string;
  date: Date;
  score: number;
  severity: string;
  suicideRisk: boolean;
};

/**
 * Define el objeto de entrada para la función generatePatientProfile.
 */
type PatientResults = {
  results: EvaluationResultForDiagnosis[];
};

/**
 * El tipo de objeto que la función generatePatientProfile DEBE retornar.
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

// --- Implementación de la Lógica de Perfil GII-M ---

function getLatestScore(results: EvaluationResultForDiagnosis[], instrumentName: string): EvaluationResultForDiagnosis | undefined {
  return results
    .filter(r => r.instrumentName.includes(instrumentName))
    .sort((a, b) => b.date.getTime() - a.date.getTime())[0];
}

function mapSeverityToNumber(severity: string): number {
  switch (severity.toLowerCase()) {
    case 'alta':
    case 'severa':
    case 'grave':
      return 3;
    case 'moderada':
    case 'moderada-severa':
      return 2;
    case 'leve':
      return 1;
    default:
      return 0; // Baja, Mínima, Normal
  }
}

export function generatePatientProfile(data: PatientResults): PatientProfile {
  const { results } = data;

  const bdi = getLatestScore(results, 'BDI-II') || getLatestScore(results, 'PHQ-9');
  const bai = getLatestScore(results, 'BAI');
  const gad = getLatestScore(results, 'GAD-7');
  
  const suicideIndicators = results.filter(r => r.suicideRisk);
  
  const keyScores: PatientProfile['keyScores'] = [];
  if (bdi) keyScores.push({ instrumentName: bdi.instrumentName, score: bdi.score, severity: bdi.severity });
  if (bai) keyScores.push({ instrumentName: bai.instrumentName, score: bai.score, severity: bai.severity });
  if (gad) keyScores.push({ instrumentName: gad.instrumentName, score: gad.score, severity: gad.severity });

  // PERFIL D: RIESGO SUICIDA (MÁXIMA PRIORIDAD)
  if (suicideIndicators.length > 0) {
    return {
      profileId: 'perfil-d',
      name: 'RIESGO SUICIDA ACTIVO',
      summary: 'Se ha identificado un riesgo potencial o activo de conducta suicida. La prioridad clínica es absoluta.',
      protocol: 'PROTOCOLO DE CRISIS (Estabilización, Contención y Plan de Seguridad)',
      monitoringFrequency: 'Diario/Urgente',
      recommendedInstruments: ['SSI', 'BHS', 'PHQ-9 (ítem 9)'],
      keyScores: keyScores,
    };
  }

  if (!bdi && !bai && !gad) {
    return {
      profileId: 'inclasificable',
      name: 'INCLASIFICABLE (DATOS INSUFICIENTES)',
      summary: 'No se encontraron puntuaciones recientes para los instrumentos clave (BDI-II, BAI, GAD-7) para aplicar la GII-M.',
      protocol: 'N/A',
      monitoringFrequency: 'N/A',
      recommendedInstruments: ['BDI-II', 'BAI', 'GAD-7'],
      keyScores: [],
    };
  }

  const bdiSeverity = bdi ? mapSeverityToNumber(bdi.severity) : 0;
  const baiSeverity = bai ? mapSeverityToNumber(bai.severity) : 0;
  const gadSeverity = gad ? mapSeverityToNumber(gad.severity) : 0;

  // PERFIL C: MIXTO ANSIOSO-DEPRESIVO
  if (bdiSeverity >= 1 && (baiSeverity >= 1 || gadSeverity >= 1)) {
    const isSevere = bdiSeverity >= 2 && (baiSeverity >= 2 || gadSeverity >= 2);
    return {
        profileId: 'perfil-c',
        name: `MIXTO ANSIOSO-DEPRESIVO (${isSevere ? 'MODERADO/ALTO' : 'LEVE'})`,
        summary: `Presencia de sintomatología clínica significativa de depresión y ansiedad, indicando una comorbilidad de alta relevancia.`,
        protocol: isSevere ? 'Transdiagnóstico (TCC/Mindfulness)' : 'Transdiagnóstico de Baja Intensidad',
        monitoringFrequency: isSevere ? 'Quincenal' : 'Mensual',
        recommendedInstruments: isSevere ? ['PHQ-9', 'GAD-7', 'Medida de Síntomas Transversales-Nivel 1'] : ['PHQ-9', 'GAD-7'],
        keyScores: keyScores,
    };
  }

  // PERFIL A: DOMINIO DEPRESIVO
  if (bdiSeverity >= 1 && baiSeverity < 1 && gadSeverity < 1) {
    return {
      profileId: 'perfil-a',
      name: 'DOMINIO DEPRESIVO',
      summary: 'Predominancia clara de síntomas depresivos sin una activación ansiosa significativa.',
      protocol: 'Específico (Terapia Cognitiva de la Depresión o Activación Conductual)',
      monitoringFrequency: bdiSeverity >= 2 ? 'Quincenal' : 'Mensual',
      recommendedInstruments: ['BDI-II', 'PHQ-9', 'ASRM (para descartar bipolaridad)'],
      keyScores: keyScores,
    };
  }

  // PERFIL B: DOMINIO ANSIOSO
  if ((baiSeverity >= 1 || gadSeverity >= 1) && bdiSeverity < 1) {
    return {
      profileId: 'perfil-b',
      name: 'DOMINIO ANSIOSO',
      summary: 'Predominancia clara de síntomas de ansiedad con una sintomatología depresiva mínima o ausente.',
      protocol: 'Específico (Terapia de Exposición y Reestructuración Cognitiva)',
      monitoringFrequency: (baiSeverity >= 2 || gadSeverity >= 2) ? 'Quincenal' : 'Mensual',
      recommendedInstruments: ['BAI', 'GAD-7', 'PSWQ'],
      keyScores: keyScores,
    };
  }

  return {
    profileId: 'inclasificable',
    name: 'INCLASIFICABLE (PATRÓN NO ESTANDAR)',
    summary: 'Los resultados no se alinean con los perfiles A, B o C de la GII-M o la severidad es mínima.',
    protocol: 'N/A',
    monitoringFrequency: 'N/A',
    recommendedInstruments: ['Medida de Síntomas Transversales-Nivel 1 (DSM-5)'],
    keyScores: keyScores,
  };
}
