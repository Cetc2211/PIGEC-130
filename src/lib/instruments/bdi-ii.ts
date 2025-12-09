// src/lib/instruments/bdi-ii.ts

import type { EvaluationResultForDiagnosis, PatientResults } from '@/lib/diagnosis';


// --- I. Definición de Rangos de Severidad para BDI-II ---
// Rangos estandarizados del BDI-II para la interpretación clínica:
export const BDI_II_SEVERITY_RANGES = [
  { scoreMax: 13, severity: 'Mínima', description: 'Sin depresión significativa o Subumbral.' },
  { scoreMax: 19, severity: 'Leve', description: 'Síntomas leves de depresión.' },
  { scoreMax: 28, severity: 'Moderada', description: 'Síntomas moderados de depresión. Se requiere atención clínica.' },
  { scoreMax: 63, severity: 'Grave', description: 'Síntomas graves de depresión. Posible indicador de TDM.' },
];

/**
 * Traduce la puntuación bruta del BDI-II a una severidad estandarizada.
 * @param score Puntuación bruta del BDI-II.
 * @returns {severity: string, description: string}
 */
export function interpretBDIIScore(score: number): { severity: string, description: string } {
  const range = BDI_II_SEVERITY_RANGES.find(r => score <= r.scoreMax);
  if (range) {
    return { severity: range.severity, description: range.description };
  }
  return { severity: 'Grave', description: 'Puntuación fuera de rango válido (0-63).' };
}


// --- II. Función de Triage para Riesgo Suicida (BDI-II) ---
// El ítem 9 del BDI-II ("Pensamientos de suicidio") es un indicador de riesgo crítico.

/**
 * Evalúa el riesgo suicida en el BDI-II.
 * @param item9Score Puntuación del ítem 9 (0: No; 1-3: Sí, con gravedad creciente).
 * @returns boolean
 */
export function checkBDIISuicideRisk(item9Score: number): boolean {
    // Si el paciente responde 1 o más, hay ideación (Criterio A9 del TDM).
    return item9Score >= 1;
}


// --- III. Función para Generar el Resultado de Evaluación ---

/**
 * Genera el objeto EvaluationResultForDiagnosis para el BDI-II.
 *
 * @param score Puntuación bruta total del BDI-II.
 * @param item9Score Puntuación del ítem 9 específico (para riesgo suicida).
 * @returns EvaluationResultForDiagnosis para el BDI-II.
 */
export function generateBDIResult(score: number, item9Score: number): EvaluationResultForDiagnosis {
  const interpretation = interpretBDIIScore(score);
  const suicideRisk = checkBDIISuicideRisk(item9Score);

  let severityDescription = interpretation.description;

  // Aumentar la descripción si hay riesgo de suicidio
  if (suicideRisk) {
    severityDescription += " ATENCIÓN: El ítem 9 (Ideación Suicida) es positivo, activando la alerta de riesgo (Perfil D).";
  }

  return {
    instrumentName: 'BDI-II',
    date: new Date(),
    score: score,
    severity: interpretation.severity,
    suicideRisk: suicideRisk,
    contextDescription: severityDescription,
  } as EvaluationResultForDiagnosis;
}


// --- IV. Ejemplo de Integración y Simulación ---

/**
 * Simula la integración de un resultado de BDI-II en el motor de diagnóstico.
 */
export function simulateBDIIntegration() {
    // Escenario clínico simulado: Depresión Moderada sin riesgo activo.
    const bdiResult: EvaluationResultForDiagnosis = generateBDIResult(22, 0); // Score 22 (Moderada), Ítem 9: 0 (No hay riesgo)

    // Simular los resultados completos del paciente (solo BDI-II por ahora)
    const mockResults: PatientResults = {
        results: [bdiResult]
    };
    
    // Aquí se vincularía con generatePatientProfile (ubicado en diagnosis.ts)
    // Nota: La importación de generatePatientProfile se haría en el módulo de la aplicación final.
    // const profile = generatePatientProfile(mockResults);

    // Salida para la consola
    console.log("--- BDI-II Resultado para Integración ---");
    console.log(bdiResult);
    
    console.log("\n--- Interpretación Clínica (para el motor dSIE) ---");
    console.log(`Severidad: ${bdiResult.severity} (${interpretBDIIScore(bdiResult.score).description})`);
    console.log(`Riesgo Suicida Activo: ${bdiResult.suicideRisk}`);
}

// simulateBDIIntegration(); // Descomentar para probar en entorno Node/Browser
