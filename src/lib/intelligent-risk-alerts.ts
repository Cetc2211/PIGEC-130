/**
 * @fileoverview Sistema de Alertas de Riesgo Inteligentes para PIGEC-130.
 *
 * Combina datos académicos (IRC) con datos clínicos para generar
 * alertas predictivas y recomendaciones de intervención.
 *
 * NO depende de WISC/WAIS - utiliza datos de screening disponibles.
 */

// Tipos de datos clínicos (definidos localmente para evitar dependencias circulares)
export interface ClinicalDataInput {
  studentName?: string;
  bdi_score?: number;
  bai_score?: number;
  phq9_score?: number;
  gad7_score?: number;
  hads_anxiety?: number;
  hads_depression?: number;
  idare_anxiety?: number;
  idare_trait?: number;
  columbia_score?: number;
  beck_suicide_score?: number;
  bhs_score?: number;
  assist_result?: string;
  self_harm_score?: number;
  neuro_mt_score?: number;
  neuro_as_score?: number;
  neuro_vp_score?: number;
  cognitive_load_context?: string;
  additional_observations?: string;
}

export interface DiagnosticOutput {
  primaryHypothesis: string;
  secondaryConsiderations: string[];
  severityLevel: 'leve' | 'moderado' | 'severo' | 'crítico';
  riskFactors: string[];
  protectiveFactors: string[];
  recommendations: string[];
  requiresUrgentAttention: boolean;
  suggestedAssessments: string[];
  clinicalNotes: string;
}

// Tipos de alerta
export type AlertLevel = 'info' | 'warning' | 'danger' | 'critical';
export type AlertCategory = 'academic' | 'emotional' | 'behavioral' | 'neurocognitive' | 'integrated';

export interface RiskAlert {
  id: string;
  level: AlertLevel;
  category: AlertCategory;
  title: string;
  description: string;
  contributingFactors: string[];
  recommendations: string[];
  timestamp: Date;
  requiresAction: boolean;
  actionDeadline?: Date;
  assignedTo?: string;
}

export interface StudentRiskProfile {
  studentId: string;
  studentName: string;

  // Riesgo Académico (IRC)
  academicRiskScore: number; // 0-100
  academicRiskLevel: 'bajo' | 'medio' | 'alto';
  failingRisk: number; // 0-100
  dropoutRisk: number; // 0-100

  // Riesgo Emocional
  emotionalRiskScore: number; // 0-100
  emotionalRiskLevel: 'bajo' | 'medio' | 'alto' | 'crítico';
  depressionIndicators: string[];
  anxietyIndicators: string[];

  // Riesgo Conductual
  behavioralRiskScore: number; // 0-100
  behavioralRiskLevel: 'bajo' | 'medio' | 'alto';
  suicideRisk: boolean;
  selfHarmRisk: boolean;
  substanceUseRisk: boolean;

  // Riesgo Neurocognitivo
  neurocognitiveRiskScore: number; // 0-100
  neurocognitiveRiskLevel: 'bajo' | 'medio' | 'alto';
  affectedDomains: string[];

  // Riesgo Integrado
  integratedRiskScore: number; // 0-100
  integratedRiskLevel: 'bajo' | 'medio' | 'alto' | 'crítico';

  // Alertas activas
  activeAlerts: RiskAlert[];

  // Última actualización
  lastUpdated: Date;
}

/**
 * Calcula el perfil de riesgo integrado de un estudiante.
 */
export function calculateIntegratedRiskProfile(
  studentId: string,
  studentName: string,
  academicData: {
    attendanceRate: number;
    grade: number;
    activityRate: number;
    participationRate: number;
  },
  clinicalData?: ClinicalDataInput,
  diagnosticOutput?: DiagnosticOutput
): StudentRiskProfile {
  // 1. Calcular riesgo académico (IRC)
  const academicRisk = calculateAcademicRisk(
    academicData.attendanceRate,
    academicData.grade,
    academicData.activityRate,
    academicData.participationRate
  );

  // 2. Calcular riesgo emocional
  const emotionalRisk = calculateEmotionalRisk(clinicalData);

  // 3. Calcular riesgo conductual
  const behavioralRisk = calculateBehavioralRisk(clinicalData);

  // 4. Calcular riesgo neurocognitivo
  const neurocognitiveRisk = calculateNeurocognitiveRisk(clinicalData);

  // 5. Calcular riesgo integrado
  const integratedRisk = calculateIntegratedRisk(
    academicRisk,
    emotionalRisk,
    behavioralRisk,
    neurocognitiveRisk
  );

  // 6. Generar alertas
  const alerts = generateRiskAlerts(
    studentId,
    academicRisk,
    emotionalRisk,
    behavioralRisk,
    neurocognitiveRisk,
    integratedRisk,
    clinicalData,
    diagnosticOutput
  );

  return {
    studentId,
    studentName,
    academicRiskScore: academicRisk.score,
    academicRiskLevel: academicRisk.level,
    failingRisk: academicRisk.failingRisk,
    dropoutRisk: academicRisk.dropoutRisk,
    emotionalRiskScore: emotionalRisk.score,
    emotionalRiskLevel: emotionalRisk.level,
    depressionIndicators: emotionalRisk.depressionIndicators,
    anxietyIndicators: emotionalRisk.anxietyIndicators,
    behavioralRiskScore: behavioralRisk.score,
    behavioralRiskLevel: behavioralRisk.level,
    suicideRisk: behavioralRisk.suicideRisk,
    selfHarmRisk: behavioralRisk.selfHarmRisk,
    substanceUseRisk: behavioralRisk.substanceUseRisk,
    neurocognitiveRiskScore: neurocognitiveRisk.score,
    neurocognitiveRiskLevel: neurocognitiveRisk.level,
    affectedDomains: neurocognitiveRisk.affectedDomains,
    integratedRiskScore: integratedRisk.score,
    integratedRiskLevel: integratedRisk.level,
    activeAlerts: alerts,
    lastUpdated: new Date(),
  };
}

/**
 * Calcula el riesgo académico usando el modelo IRC.
 */
function calculateAcademicRisk(
  attendanceRate: number,
  grade: number,
  activityRate: number,
  participationRate: number
): {
  score: number;
  level: 'bajo' | 'medio' | 'alto';
  failingRisk: number;
  dropoutRisk: number;
} {
  // Modelo simplificado de IRC
  const attendanceNormalized = 1 - (attendanceRate / 100);
  const gradeNormalized = grade < 60 ? 1 : grade < 70 ? 0.5 : 0;

  // Calcular riesgo de reprobación (basado en calificación y actividades)
  const failingRisk = Math.min(100, Math.round(
    (gradeNormalized * 50) +
    ((1 - activityRate) * 30) +
    ((1 - participationRate) * 20)
  ));

  // Calcular riesgo de abandono (basado en asistencia y participación)
  const dropoutRisk = Math.min(100, Math.round(
    (attendanceNormalized * 60) +
    ((1 - participationRate) * 40)
  ));

  // Score integrado de riesgo académico
  const score = Math.round((failingRisk + dropoutRisk) / 2);

  let level: 'bajo' | 'medio' | 'alto';
  if (score >= 60) {
    level = 'alto';
  } else if (score >= 30) {
    level = 'medio';
  } else {
    level = 'bajo';
  }

  return { score, level, failingRisk, dropoutRisk };
}

/**
 * Calcula el riesgo emocional basado en instrumentos de screening.
 */
function calculateEmotionalRisk(
  clinicalData?: ClinicalDataInput
): {
  score: number;
  level: 'bajo' | 'medio' | 'alto' | 'crítico';
  depressionIndicators: string[];
  anxietyIndicators: string[];
} {
  if (!clinicalData) {
    return {
      score: 0,
      level: 'bajo',
      depressionIndicators: [],
      anxietyIndicators: [],
    };
  }

  const depressionIndicators: string[] = [];
  const anxietyIndicators: string[] = [];
  let totalScore = 0;
  let maxPossibleScore = 0;

  // Evaluar BDI-II
  if (clinicalData.bdi_score !== undefined) {
    maxPossibleScore += 25;
    if (clinicalData.bdi_score > 28) {
      totalScore += 25;
      depressionIndicators.push('Depresión severa (BDI-II)');
    } else if (clinicalData.bdi_score > 19) {
      totalScore += 18;
      depressionIndicators.push('Depresión moderada (BDI-II)');
    } else if (clinicalData.bdi_score > 13) {
      totalScore += 10;
      depressionIndicators.push('Depresión leve (BDI-II)');
    }
  }

  // Evaluar PHQ-9
  if (clinicalData.phq9_score !== undefined) {
    maxPossibleScore += 25;
    if (clinicalData.phq9_score > 19) {
      totalScore += 25;
      depressionIndicators.push('Depresión severa (PHQ-9)');
    } else if (clinicalData.phq9_score > 14) {
      totalScore += 18;
      depressionIndicators.push('Depresión moderada (PHQ-9)');
    } else if (clinicalData.phq9_score > 9) {
      totalScore += 10;
      depressionIndicators.push('Depresión leve (PHQ-9)');
    }
  }

  // Evaluar BAI
  if (clinicalData.bai_score !== undefined) {
    maxPossibleScore += 25;
    if (clinicalData.bai_score > 25) {
      totalScore += 25;
      anxietyIndicators.push('Ansiedad severa (BAI)');
    } else if (clinicalData.bai_score > 15) {
      totalScore += 18;
      anxietyIndicators.push('Ansiedad moderada (BAI)');
    } else if (clinicalData.bai_score > 7) {
      totalScore += 10;
      anxietyIndicators.push('Ansiedad leve (BAI)');
    }
  }

  // Evaluar GAD-7
  if (clinicalData.gad7_score !== undefined) {
    maxPossibleScore += 25;
    if (clinicalData.gad7_score > 14) {
      totalScore += 25;
      anxietyIndicators.push('Ansiedad severa (GAD-7)');
    } else if (clinicalData.gad7_score > 9) {
      totalScore += 18;
      anxietyIndicators.push('Ansiedad moderada (GAD-7)');
    } else if (clinicalData.gad7_score > 4) {
      totalScore += 10;
      anxietyIndicators.push('Ansiedad leve (GAD-7)');
    }
  }

  // Normalizar a 0-100
  const score = maxPossibleScore > 0 ? Math.round((totalScore / maxPossibleScore) * 100) : 0;

  let level: 'bajo' | 'medio' | 'alto' | 'crítico';
  if (score >= 80) {
    level = 'crítico';
  } else if (score >= 60) {
    level = 'alto';
  } else if (score >= 30) {
    level = 'medio';
  } else {
    level = 'bajo';
  }

  return { score, level, depressionIndicators, anxietyIndicators };
}

/**
 * Calcula el riesgo conductual.
 */
function calculateBehavioralRisk(
  clinicalData?: ClinicalDataInput
): {
  score: number;
  level: 'bajo' | 'medio' | 'alto';
  suicideRisk: boolean;
  selfHarmRisk: boolean;
  substanceUseRisk: boolean;
} {
  if (!clinicalData) {
    return {
      score: 0,
      level: 'bajo',
      suicideRisk: false,
      selfHarmRisk: false,
      substanceUseRisk: false,
    };
  }

  let totalScore = 0;
  const suicideRisk = clinicalData.beck_suicide_score !== undefined && clinicalData.beck_suicide_score > 3;
  const selfHarmRisk = clinicalData.self_harm_score !== undefined && clinicalData.self_harm_score > 0;
  const substanceUseRisk = clinicalData.assist_result !== undefined &&
    clinicalData.assist_result.toLowerCase().includes('positivo');

  // Evaluar riesgo suicida
  if (clinicalData.beck_suicide_score !== undefined) {
    if (clinicalData.beck_suicide_score > 8) {
      totalScore += 50;
    } else if (clinicalData.beck_suicide_score > 3) {
      totalScore += 30;
    }
  }

  // Evaluar desesperanza
  if (clinicalData.bhs_score !== undefined) {
    if (clinicalData.bhs_score > 13) {
      totalScore += 30;
    } else if (clinicalData.bhs_score > 8) {
      totalScore += 15;
    }
  }

  // Evaluar autolesiones
  if (selfHarmRisk) {
    totalScore += 25;
  }

  // Evaluar sustancias
  if (substanceUseRisk) {
    totalScore += 20;
  }

  const score = Math.min(100, totalScore);

  let level: 'bajo' | 'medio' | 'alto';
  if (score >= 50) {
    level = 'alto';
  } else if (score >= 25) {
    level = 'medio';
  } else {
    level = 'bajo';
  }

  return { score, level, suicideRisk, selfHarmRisk, substanceUseRisk };
}

/**
 * Calcula el riesgo neurocognitivo.
 */
function calculateNeurocognitiveRisk(
  clinicalData?: ClinicalDataInput
): {
  score: number;
  level: 'bajo' | 'medio' | 'alto';
  affectedDomains: string[];
} {
  if (!clinicalData) {
    return {
      score: 0,
      level: 'bajo',
      affectedDomains: [],
    };
  }

  const affectedDomains: string[] = [];
  let deficitCount = 0;

  // Evaluar memoria de trabajo
  if (clinicalData.neuro_mt_score !== undefined && clinicalData.neuro_mt_score < 85) {
    deficitCount++;
    affectedDomains.push('Memoria de Trabajo');
  }

  // Evaluar atención sostenida
  if (clinicalData.neuro_as_score !== undefined && clinicalData.neuro_as_score < 85) {
    deficitCount++;
    affectedDomains.push('Atención Sostenida');
  }

  // Evaluar velocidad de procesamiento
  if (clinicalData.neuro_vp_score !== undefined && clinicalData.neuro_vp_score < 85) {
    deficitCount++;
    affectedDomains.push('Velocidad de Procesamiento');
  }

  // Calcular score basado en número de dominios afectados
  const score = Math.min(100, deficitCount * 35);

  let level: 'bajo' | 'medio' | 'alto';
  if (deficitCount >= 2) {
    level = 'alto';
  } else if (deficitCount === 1) {
    level = 'medio';
  } else {
    level = 'bajo';
  }

  return { score, level, affectedDomains };
}

/**
 * Calcula el riesgo integrado combinando todas las dimensiones.
 */
function calculateIntegratedRisk(
  academicRisk: { score: number },
  emotionalRisk: { score: number; level: string },
  behavioralRisk: { score: number; suicideRisk: boolean },
  neurocognitiveRisk: { score: number }
): {
  score: number;
  level: 'bajo' | 'medio' | 'alto' | 'crítico';
} {
  // Si hay riesgo suicida, el riesgo integrado es crítico
  if (behavioralRisk.suicideRisk) {
    return { score: 100, level: 'crítico' };
  }

  // Si el riesgo emocional es crítico, el integrado es alto
  if (emotionalRisk.level === 'crítico') {
    return { score: 90, level: 'alto' };
  }

  // Ponderación de factores
  const weights = {
    academic: 0.25,
    emotional: 0.35,
    behavioral: 0.25,
    neurocognitive: 0.15,
  };

  const score = Math.round(
    academicRisk.score * weights.academic +
    emotionalRisk.score * weights.emotional +
    behavioralRisk.score * weights.behavioral +
    neurocognitiveRisk.score * weights.neurocognitive
  );

  let level: 'bajo' | 'medio' | 'alto' | 'crítico';
  if (score >= 80) {
    level = 'crítico';
  } else if (score >= 60) {
    level = 'alto';
  } else if (score >= 30) {
    level = 'medio';
  } else {
    level = 'bajo';
  }

  return { score, level };
}

/**
 * Genera alertas de riesgo basadas en el perfil.
 */
function generateRiskAlerts(
  studentId: string,
  academicRisk: { score: number; level: string; failingRisk: number; dropoutRisk: number },
  emotionalRisk: { score: number; level: string; depressionIndicators: string[]; anxietyIndicators: string[] },
  behavioralRisk: { score: number; level: string; suicideRisk: boolean; selfHarmRisk: boolean; substanceUseRisk: boolean },
  neurocognitiveRisk: { score: number; level: string; affectedDomains: string[] },
  integratedRisk: { score: number; level: string },
  clinicalData?: ClinicalDataInput,
  diagnosticOutput?: DiagnosticOutput
): RiskAlert[] {
  const alerts: RiskAlert[] = [];
  const now = new Date();

  // Alerta de riesgo suicida (CRÍTICA)
  if (behavioralRisk.suicideRisk) {
    alerts.push({
      id: `${studentId}-suicide-${now.getTime()}`,
      level: 'critical',
      category: 'behavioral',
      title: '⚠️ RIESGO SUICIDA DETECTADO',
      description: 'El estudiante presenta indicadores de ideación suicida que requieren atención inmediata.',
      contributingFactors: [
        `Puntuación de ideación suicida: ${clinicalData?.beck_suicide_score || 'N/A'}`,
        ...(diagnosticOutput?.riskFactors || []),
      ],
      recommendations: [
        'VALORACIÓN PSIQUIÁTRICA URGENTE',
        'Activar protocolo de seguridad',
        'Notificar a familia/tutores',
        'Seguimiento diario hasta estabilización',
      ],
      timestamp: now,
      requiresAction: true,
      actionDeadline: new Date(now.getTime() + 24 * 60 * 60 * 1000), // 24 horas
    });
  }

  // Alerta de autolesiones (PELIGRO)
  if (behavioralRisk.selfHarmRisk) {
    alerts.push({
      id: `${studentId}-selfharm-${now.getTime()}`,
      level: 'danger',
      category: 'behavioral',
      title: '🔴 Conductas Autolesivas Detectadas',
      description: 'El estudiante ha reportado conductas autolesivas. Requiere intervención especializada.',
      contributingFactors: [
        `Frecuencia de autolesiones: ${clinicalData?.self_harm_score || 'N/A'}`,
      ],
      recommendations: [
        'Derivación a terapia especializada',
        'Plan de seguridad personalizado',
        'Monitoreo constante',
      ],
      timestamp: now,
      requiresAction: true,
      actionDeadline: new Date(now.getTime() + 48 * 60 * 60 * 1000), // 48 horas
    });
  }

  // Alerta emocional severa
  if (emotionalRisk.level === 'crítico' || emotionalRisk.level === 'alto') {
    alerts.push({
      id: `${studentId}-emotional-${now.getTime()}`,
      level: emotionalRisk.level === 'crítico' ? 'critical' : 'danger',
      category: 'emotional',
      title: emotionalRisk.level === 'crítico' ? '🔴 Crisis Emocional Severa' : '🟠 Riesgo Emocional Alto',
      description: `El estudiante presenta indicadores emocionales preocupantes: ${[...emotionalRisk.depressionIndicators, ...emotionalRisk.anxietyIndicators].join(', ')}`,
      contributingFactors: [
        ...emotionalRisk.depressionIndicators,
        ...emotionalRisk.anxietyIndicators,
      ],
      recommendations: [
        'Evaluación psicológica profunda',
        'Considerar apoyo farmacológico',
        'Terapia individual',
      ],
      timestamp: now,
      requiresAction: true,
      actionDeadline: new Date(now.getTime() + 72 * 60 * 60 * 1000), // 72 horas
    });
  }

  // Alerta académica
  if (academicRisk.level === 'alto') {
    alerts.push({
      id: `${studentId}-academic-${now.getTime()}`,
      level: 'warning',
      category: 'academic',
      title: '📚 Riesgo Académico Alto',
      description: `Riesgo de reprobación: ${academicRisk.failingRisk}%. Riesgo de abandono: ${academicRisk.dropoutRisk}%.`,
      contributingFactors: [
        academicRisk.failingRisk > 50 ? 'Alto riesgo de reprobación' : '',
        academicRisk.dropoutRisk > 50 ? 'Alto riesgo de abandono' : '',
      ].filter(Boolean),
      recommendations: [
        'Revisión de PIEI',
        'Tutorías de apoyo',
        'Reunión con padres/tutores',
      ],
      timestamp: now,
      requiresAction: true,
    });
  }

  // Alerta neurocognitiva
  if (neurocognitiveRisk.level === 'alto') {
    alerts.push({
      id: `${studentId}-neuro-${now.getTime()}`,
      level: 'warning',
      category: 'neurocognitive',
      title: '🧠 Déficit Neurocognitivo Múltiple',
      description: `Dominios afectados: ${neurocognitiveRisk.affectedDomains.join(', ')}`,
      contributingFactors: neurocognitiveRisk.affectedDomains,
      recommendations: [
        'Evaluación neuropsicológica completa',
        'Ajustes metodológicos específicos',
        'Apoyos compensatorios',
      ],
      timestamp: now,
      requiresAction: true,
    });
  }

  // Alerta integrada (resumen)
  if (integratedRisk.level === 'crítico' || integratedRisk.level === 'alto') {
    const existingCritical = alerts.some(a => a.level === 'critical');
    if (!existingCritical) {
      alerts.push({
        id: `${studentId}-integrated-${now.getTime()}`,
        level: integratedRisk.level === 'crítico' ? 'critical' : 'danger',
        category: 'integrated',
        title: integratedRisk.level === 'crítico' ? '🚨 PERFIL DE RIESGO CRÍTICO' : '⚠️ Perfil de Riesgo Alto',
        description: `El estudiante presenta un perfil de riesgo integrado de nivel ${integratedRisk.level} (Score: ${integratedRisk.score}%). Múltiples dimensiones requieren atención simultánea.`,
        contributingFactors: [
          `Riesgo académico: ${academicRisk.level} (${academicRisk.score}%)`,
          `Riesgo emocional: ${emotionalRisk.level} (${emotionalRisk.score}%)`,
          `Riesgo conductual: ${behavioralRisk.level} (${behavioralRisk.score}%)`,
          `Riesgo neurocognitivo: ${neurocognitiveRisk.level} (${neurocognitiveRisk.score}%)`,
        ],
        recommendations: diagnosticOutput?.recommendations || [
          'Reunión de equipo multidisciplinario',
          'Plan de intervención integral',
          'Seguimiento semanal',
        ],
        timestamp: now,
        requiresAction: true,
        actionDeadline: new Date(now.getTime() + 24 * 60 * 60 * 1000),
      });
    }
  }

  return alerts.sort((a, b) => {
    const levelOrder = { critical: 0, danger: 1, warning: 2, info: 3 };
    return levelOrder[a.level] - levelOrder[b.level];
  });
}

/**
 * Obtiene un resumen de alertas para mostrar en dashboard.
 */
export function getAlertsSummary(profiles: StudentRiskProfile[]): {
  totalAlerts: number;
  criticalCount: number;
  dangerCount: number;
  warningCount: number;
  byCategory: Record<AlertCategory, number>;
  topPriority: RiskAlert[];
} {
  const allAlerts = profiles.flatMap(p => p.activeAlerts);

  return {
    totalAlerts: allAlerts.length,
    criticalCount: allAlerts.filter(a => a.level === 'critical').length,
    dangerCount: allAlerts.filter(a => a.level === 'danger').length,
    warningCount: allAlerts.filter(a => a.level === 'warning').length,
    byCategory: {
      academic: allAlerts.filter(a => a.category === 'academic').length,
      emotional: allAlerts.filter(a => a.category === 'emotional').length,
      behavioral: allAlerts.filter(a => a.category === 'behavioral').length,
      neurocognitive: allAlerts.filter(a => a.category === 'neurocognitive').length,
      integrated: allAlerts.filter(a => a.category === 'integrated').length,
    },
    topPriority: allAlerts
      .filter(a => a.level === 'critical' || a.level === 'danger')
      .slice(0, 10),
  };
}
