// src/instruments/YMRS.ts

import { EvaluationResultForDiagnosis, PatientResults } from '@/lib/diagnosis';

// --- I. Definición de Rangos de Severidad para YMRS ---
// Rangos estandarizados de la YMRS para la interpretación clínica:
export const YMRS_SEVERITY_RANGES = [
  { scoreMax: 6, severity: 'Mínima', description: 'Sin síntomas maníacos significativos. Descarte de manía/hipomanía exitoso.' },
  { scoreMax: 12, severity: 'Leve', description: 'Síntomas subumbrales. Requiere vigilancia activa y monitoreo para descartar T. Bipolar II.' },
  { scoreMax: 24, severity: 'Moderada', description: 'Episodio Hipomaníaco probable. Indicador clave de T. Bipolar II (DSM-5).' },
  { scoreMax: 60, severity: 'Grave', description: 'Episodio Maníaco o Mixto Grave probable. Indicador clave de T. Bipolar I (DSM-5).' },
];

/**
 * Traduce la puntuación bruta de la YMRS a un nivel de síntomas maníacos.
 * @param score Puntuación bruta de la YMRS (rango 0-60).
 * @returns {severity: string, description: string}
 */
export function interpretYMRSScore(score: number): { severity: string, description: string } {
  const range = YMRS_SEVERITY_RANGES.find(r => score <= r.scoreMax);
  if (range) {
    return { severity: range.severity, description: range.description };
  }
  return { severity: 'Grave', description: 'Episodio Maníaco Extremo.' };
}


// --- II. Función de Triage para Descarte de T. Bipolar ---

/**
 * Evalúa si la puntuación de la YMRS indica la necesidad de descartar T. Bipolar.
 * @param score Puntuación bruta total de la YMRS.
 * @returns boolean
 */
export function checkYMRSManicAlert(score: number): boolean {
    // Un score de 13 o más es un punto de corte común para un episodio maníaco/hipomaníaco moderado.
    return score >= 13; 
}


// --- III. Función para Generar el Resultado de Evaluación ---

/**
 * Genera el objeto EvaluationResult para la YMRS.
 *
 * @param score Puntuación bruta total de la YMRS.
 * @returns EvaluationResult para la YMRS.
 */
export function generateYMRSResult(score: number): EvaluationResultForDiagnosis {
  const interpretation = interpretYMRSScore(score);
  const manicAlert = checkYMRSManicAlert(score);

  let severityDescription = interpretation.description;

  // Cláusula de alerta para el motor de diagnóstico
  if (manicAlert) {
    severityDescription = `ALERTA DE DIAGNÓSTICO DIFERENCIAL CRÍTICO: ${interpretation.description}. Sospecha de Trastorno Bipolar (Criterio E del TDM) y requiere remisión a Psiquiatría.`;
  }

  return {
    instrumentName: 'YMRS',
    date: new Date(),
    score: score,
    severity: interpretation.severity,
    // No es una escala de riesgo suicida directo, pero el riesgo es inherente al T. Bipolar
    suicideRisk: false, 
    contextDescription: severityDescription
  } as EvaluationResultForDiagnosis;
}


// --- IV. Ejemplo de Integración y Simulación ---

/**
 * Simula la integración de un resultado de YMRS en el motor de diagnóstico.
 */
export function simulateYMRSIntegration() {
    // Escenario clínico simulado: Sospecha de Hipomanía (T. Bipolar II).
    const ymrsResult: EvaluationResultForDiagnosis = generateYMRSResult(18); 

    // Simular los resultados completos del paciente (Comorbilidad TDM con Alerta Maníaca)
    const mockResults: PatientResults = {
        results: [
            // Simulación BDI-II: Depresión Grave (score: 30) -> Si no se aplica YMRS, sería Perfil B.
            { instrumentName: 'BDI-II', date: new Date('2025-12-01'), score: 30, severity: 'Grave', suicideRisk: false },
            ymrsResult // Alerta Maníaca (Moderada)
        ]
    };
    
    // Si esta simulación fuera alimentada al motor GII-M:
    // El motor detectaría la alerta YMRS y, en el módulo dSIE, el diagnóstico DEBE cambiar de
    // TDM (Perfil B) a una sospecha de T. Bipolar (Exclusión Criterio E).

    console.log("--- YMRS Resultado para Integración ---");
    console.log(ymrsResult);
    
    console.log("\n--- Interpretación Clínica y Descarte (Simulado) ---");
    console.log(`Nivel Maníaco/Hipomaníaco: ${ymrsResult.severity}`);
    console.log(`Alerta de T. Bipolar: ${checkYMRSManicAlert(ymrsResult.score) ? 'CRÍTICA' : 'NO'}`);
    console.log(`Implicación Diagnóstica: Si el paciente está en fase depresiva (TDM), la puntuación YMRS (Moderada) indica T. Bipolar II, REQUIERE EXCLUSIÓN del TDM.`);
}

// simulateYMRSIntegration(); // Descomentar para probar
