// src/instruments/DAS.ts

import { EvaluationResultForDiagnosis, PatientResults } from '@/lib/diagnosis';

// --- I. Definición de Rangos de Actitudes Disfuncionales (DAS) ---
// Rangos estandarizados de la DAS para la interpretación clínica:
export const DAS_SEVERITY_RANGES = [
  { scoreMax: 100, severity: 'Baja', description: 'Creencias y reglas personales flexibles y adaptativas.' },
  { scoreMax: 150, severity: 'Moderada', description: 'Presencia de esquemas cognitivos rígidos (ej. perfeccionismo, necesidad de aprobación) que pueden activarse ante el estrés.' },
  { scoreMax: 240, severity: 'Alta', description: 'Esquemas disfuncionales muy rígidos y generalizados. Constituye el foco principal de la intervención de Reestructuración Cognitiva (TCC).' },
];

/**
 * Traduce la puntuación bruta de la DAS a un nivel de rigidez cognitiva.
 * @param score Puntuación bruta de la DAS (rango 30-210, en la versión original de 30 ítems).
 * @returns {severity: string, description: string}
 */
export function interpretDASScore(score: number): { severity: 'Baja' | 'Moderada' | 'Alta', description: string } {
  // Ajustamos los puntos de corte a un rango común (ej. versión de 30 ítems, 1-7 Likert)
  const adjustedScore = Math.min(Math.max(score, 30), 240); 
  
  if (adjustedScore <= 100) {
      return { severity: 'Baja', description: 'Esquemas cognitivos predominantemente funcionales.' };
  } else if (adjustedScore <= 150) {
      return { severity: 'Moderada', description: 'Rigidez cognitiva moderada. Requiere identificación y flexibilización de reglas.' };
  } else {
      return { severity: 'Alta', description: 'Rigidez cognitiva alta. Implica que el paciente basa su valía en reglas rígidas y disfuncionales (ej. Perfeccionismo, dependencia). Foco de la TCC.' };
  }
}

// --- II. Función para Generar el Resultado de Evaluación ---

/**
 * Genera el objeto EvaluationResultForDiagnosis para la DAS.
 * Nota: Es una escala de rasgo cognitivo.
 *
 * @param score Puntuación bruta total de la DAS.
 * @returns EvaluationResultForDiagnosis para la DAS.
 */
export function generateDASResult(score: number): EvaluationResultForDiagnosis {
  const interpretation = interpretDASScore(score);

  return {
    instrumentName: 'DAS',
    date: new Date(),
    score: score,
    severity: interpretation.severity,
    // Escala de rasgo, no tiene ítem de riesgo suicida directo.
    suicideRisk: false, 
    contextDescription: interpretation.description
  } as EvaluationResultForDiagnosis;
}


// --- III. Ejemplo de Integración y Simulación ---

/**
 * Simula la integración de un resultado de DAS en el motor de diagnóstico.
 */
export function simulateDASIntegration() {
    // Escenario clínico simulado: Rigidez Cognitiva Alta (Típico en Trastornos Crónicos).
    const dasResult: EvaluationResultForDiagnosis = generateDASResult(185); 

    // Simular los resultados completos del paciente
    const mockResults: PatientResults = {
        results: [
            // Simulación BDI-II: Moderada (score: 28, item 9: 0)
            { instrumentName: 'BDI-II', date: new Date('2025-12-01'), score: 28, severity: 'Moderada', suicideRisk: false, contextDescription: '' },
            dasResult // Rigidez Alta
        ]
    };
    
    // Si esta simulación fuera alimentada al motor GII-M:
    // El BDI-II Moderado y el BAI/GAD Mínimo (por omisión) llevarían a un Perfil B (Dominio Depresivo),
    // y el DAS Alto reforzaría la elección del protocolo de TCC sobre Activación Conductual simple.

    console.log("--- DAS Resultado para Integración ---");
    console.log(dasResult);
    
    console.log("\n--- Interpretación Clínica y Mecanismo TCC (Simulado) ---");
    console.log(`Nivel de Actitudes Disfuncionales: ${dasResult.severity}`);
    console.log(`Implicación TCC: Nivel alto indica la necesidad de priorizar la Reestructuración de Esquemas Nucleares (Terapia Cognitiva Profunda) para modificar las creencias rígidas subyacentes.`);
}
// simulateDASIntegration(); // Descomentar para probar
