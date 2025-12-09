// src/instruments/BAI.ts

import type { EvaluationResultForDiagnosis, PatientResults } from '../diagnosis';

// --- I. Definición de Rangos de Severidad para BAI ---
// Rangos estandarizados del BAI para la interpretación clínica (foco en síntomas somáticos/fisiológicos de ansiedad):
export const BAI_SEVERITY_RANGES = [
  { scoreMax: 9, severity: 'Mínima', description: 'Ansiedad muy baja o ausente.' },
  { scoreMax: 15, severity: 'Leve', description: 'Ansiedad leve.' },
  { scoreMax: 25, severity: 'Moderada', description: 'Ansiedad moderada. Sugiere T. de Ansiedad específico (p. ej., T. de Pánico).' },
  { scoreMax: 63, severity: 'Grave', description: 'Ansiedad grave. Alta activación fisiológica y malestar significativo.' },
];

/**
 * Traduce la puntuación bruta del BAI a una severidad estandarizada.
 * @param score Puntuación bruta del BAI.
 * @returns {severity: string, description: string}
 */
export function interpretBAIScore(score: number): { severity: string, description: string } {
  const range = BAI_SEVERITY_RANGES.find(r => score <= r.scoreMax);
  if (range) {
    return { severity: range.severity, description: range.description };
  }
  return { severity: 'Grave', description: 'Puntuación fuera de rango válido (0-63).' };
}

// --- II. Función para Generar el Resultado de Evaluación ---

/**
 * Genera el objeto EvaluationResultForDiagnosis para el BAI.
 * Nota: El BAI no tiene un ítem específico de riesgo suicida como el BDI-II o PHQ-9;
 * el riesgo se infiere de la comorbilidad con depresión.
 *
 * @param score Puntuación bruta total del BAI.
 * @returns EvaluationResultForDiagnosis para el BAI.
 */
export function generateBAIResult(score: number): EvaluationResultForDiagnosis {
  const interpretation = interpretBAIScore(score);

  return {
    instrumentName: 'BAI',
    date: new Date(),
    score: score,
    severity: interpretation.severity,
    // Se asume riesgo suicida como 'false' en el BAI, ya que no tiene ítems de ideación explícita.
    suicideRisk: false, 
    contextDescription: interpretation.description
  } as EvaluationResultForDiagnosis;
}


// --- III. Ejemplo de Integración y Simulación ---

/**
 * Simula la integración de un resultado de BAI en el motor de diagnóstico.
 */
export function simulateBAIIntegration() {
    // Escenario clínico simulado: Ansiedad Moderada.
    const baiResult: EvaluationResultForDiagnosis = generateBAIResult(24); 

    // Simular los resultados completos del paciente (incluyendo BDI-II del ejemplo anterior)
    const mockResults: PatientResults = {
        results: [
            // Simulación BDI-II: Depresión Leve (score: 15, item 9: 0)
            { instrumentName: 'BDI-II', date: new Date('2025-12-05'), score: 15, severity: 'Leve', suicideRisk: false, contextDescription: '' },
            baiResult // Ansiedad Moderada
        ]
    };
    
    // Aquí se invocaría la lógica de GII-M para ver el Perfil A
    // const profile = generatePatientProfile(mockResults);

    console.log("--- BAI Resultado para Integración ---");
    console.log(baiResult);
    
    console.log("\n--- Interpretación Clínica y Perfil (Simulado) ---");
    console.log(`Severidad Ansiedad Somática: ${baiResult.severity}`);
    // Si la simulación BDI-II (Leve) y BAI (Moderada) fueran alimentadas al motor:
    // console.log(`Perfil GII-M esperado: PERFIL A (Mixto Ansioso-Depresivo), ya que ambos dominios superan el umbral leve.`);
}

// simulateBAIIntegration(); // Descomentar para probar
