// Nota del Experto: Este módulo contiene tanto el motor GII-M (generatePatientProfile)
// como el motor de Impresión Clínica (generateClinicalImpression).

// --- Definiciones de Tipos de Datos ---

/**
 * Define la estructura para los resultados de una evaluación.
 * (Asumido de '@/lib/store' para la implementación)
 */
export type EvaluationResultForDiagnosis = {
  instrumentName: string;
  date: Date;
  score: number;
  severity: string; // E.g., "Leve", "Moderada", "Alta"
  suicideRisk: boolean; // Indica si se respondió afirmativamente a una pregunta crítica
};

/**
 * Define el objeto de entrada para las funciones de diagnóstico.
 */
export type PatientResults = {
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

/**
 * Representa los datos estructurados de la entrevista clínica semiestructurada (ECPA).
 */
export type InterviewData = {
    patientId: string;
    motivoConsulta: string;
    expectativasTratamiento: string;
    riesgoSuicidaActivo: boolean;
    crisisPsicotica: boolean;
    historiaEnfermedadActual: string;
    ansiedadDominante: boolean;
    depresionDominante: boolean;
    disociacion: boolean;
    controlImpulsos: boolean;
    complicacionesPrenatales: boolean;
    hitosDesarrolloRetrasados: boolean;
    dinamicaFamiliarNuclear: string;
    desarrolloSexual?: string;
    escolaridadProblemas: boolean;
    relacionesInterpersonales: string;
    traumaInfancia: boolean;
    afeccionMedicaCronica?: string;
    consumoSustanciasActual?: string;
    impresionDiagnosticoDiferencial?: string;
};


/**
 * Define el objeto final de la Impresión Diagnóstica que integra todas las fuentes.
 */
export type ClinicalImpression = {
    patientId: string;
    profile: PatientProfile;
    dxDSM5: string;
    dxCIE11: string;
    differentialDx: string;
    interventionPlan: {
        protocolo: string;
        frecuenciaMonitoreo: string;
        terapiaSugerida: string;
        interconsultas: string[];
    };
    prognosis: string;
    context: string;
};


// --- Implementación de Funciones de Diagnóstico ---

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

export function generateClinicalImpression(
    interviewData: any, // Usamos 'any' por flexibilidad con el formulario
    evaluationResults: PatientResults
): ClinicalImpression {
    
    const patientProfile = generatePatientProfile(evaluationResults);
    
    const patientId = `CBTa130-${interviewData.name?.toUpperCase().slice(0, 3)}-${interviewData.age}`;
    
    let dxDSM5_impresion = patientProfile.name;
    let dxCIE11_impresion = "Z03.89";
    let interconsultas_list = patientProfile.profileId === 'perfil-d' ? ['Servicios de Emergencia y Psiquiatría'] : [];
    let prognosis_valor: "Bueno" | "Reservado" | "Malo" = "Reservado";

    if (patientProfile.profileId === 'perfil-d') {
        dxDSM5_impresion = "Crisis de Riesgo Suicida Mayor";
        dxCIE11_impresion = "6E20.Y";
        interconsultas_list.push('Notificación obligatoria a Dirección Escolar y Padres/Tutores.');

    } else if (['perfil-a', 'perfil-b', 'perfil-c'].includes(patientProfile.profileId)) {
        if (interviewData.afeccionMedicaCronica || (interviewData.consumoSustanciasActual && interviewData.consumoSustanciasActual.includes('moderado' || 'grave'))) {
            dxDSM5_impresion = `T. Depresivo/Ansioso (Inducido por Sustancia o Condición Médica: ${interviewData.afeccionMedicaCronica || 'Sustancias'})`;
            dxCIE11_impresion = interviewData.afeccionMedicaCronica ? "6E61.0" : "6C4F.Z"; 
            interconsultas_list.push('Medicina General/Endocrinología (Descarte etiológico)');
            prognosis_valor = "Malo";
        } 
        else if (interviewData.traumaInfancia) {
             dxDSM5_impresion = `Trastorno Depresivo Mayor (o Ansiedad) con comorbilidad de TEPT`;
             dxCIE11_impresion = "6B40.Z";
             interconsultas_list.push('Psicología Especializada en Trauma (para TEPT)');
        } 
        else {
             dxDSM5_impresion = `Trastorno de ${patientProfile.name.split('(')[0].trim()} (Diagnóstico GII-M)`;
             dxCIE11_impresion = patientProfile.profileId === 'perfil-c' ? "6A70.Z" : (patientProfile.profileId === 'perfil-a' ? "6A80.Z" : "6B00.Z");
        }
    }

    if (patientProfile.profileId !== 'perfil-d' && prognosis_valor !== 'Malo') {
        if (interviewData.traumaInfancia || interviewData.hitosDesarrolloRetrasados || interviewData.escolaridadProblemas) {
            prognosis_valor = "Reservado";
        }
        else if (interviewData.expectativasTratamiento.length > 10 && interviewData.dinamicaFamiliarNuclear.includes('Apoyo')) {
            prognosis_valor = "Bueno";
        }
    }

    return {
        patientId: patientId,
        profile: patientProfile,
        dxDSM5: dxDSM5_impresion,
        dxCIE11: dxCIE11_impresion,
        differentialDx: `Descarte principal: ${interviewData.impresionDiagnosticoDiferencial || 'N/A'}. Énfasis en diferenciar T. de Adaptación de T. Depresivo Mayor.`,
        interventionPlan: {
            protocolo: patientProfile.protocol,
            frecuenciaMonitoreo: patientProfile.monitoringFrequency,
            terapiaSugerida: patientProfile.protocol.includes('Transdiagnóstico') ? 'Terapia Cognitivo-Conductual (TCC) con énfasis en regulación emocional' : 'Terapia de Apoyo con remisión a TCC',
            interconsultas: Array.from(new Set(interconsultas_list)),
        },
        prognosis: prognosis_valor,
        context: "Centro de Bachillerato Tecnológico Agropecuario No. 130",
    };
}
