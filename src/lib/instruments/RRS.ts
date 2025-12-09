// src/instruments/RRS.ts

import { EvaluationResultForDiagnosis, PatientResults } from '@/lib/diagnosis';

// --- I. Definición de Rangos de Rumiación (RRS Subescala) ---
// La RRS tiene dos subescalas, pero la Rumiación es la clínicamente relevante.
// Rangos estandarizados de la subescala de Rumiación (12 ítems, rango 12-48):
export const RRS_RUMINATION_RANGES = [
  { scoreMax: 20, severity: 'Baja', description: 'Rumiación adaptativa o baja. Sin tendencia a quedarse atrapado en el malestar.' },
  { scoreMax: 30, severity: 'Moderada', description: 'Rumiación elevada. Riesgo de cronicidad y mantenimiento del Trastorno Depresivo (Perfil B).' },
  { scoreMax: 48, severity: 'Alta', description: 'Rumiación crónica y desadaptativa. Mecanismo de evitación cognitiva que requiere técnicas de mindfulness y Terapia de Activación Conductual.' },
];

/**
 * Traduce la puntuación bruta de la subescala de Rumiación a un nivel de rasgo.
 * @param scoreRumiation Puntuación bruta de la subescala de Rumiación (rango 12-48).
 * @returns {severity: string, description: string}
 */
export function interpretRRSRuminationScore(scoreRumiation: number): { severity: string, description: string } {
  const adjustedScore = Math.min(Math.max(scoreRumiation, 12), 48); 
  
  const range = RRS_RUMINATION_RANGES.find(r => adjustedScore <= r.scoreMax);
  
  if (range) {
    return { severity: range.severity, description: range.description };
  }
  return { severity: 'Alta', description: 'Rumiación extrema.' };
}

// --- II. Función para Generar el Resultado de Evaluación ---

/**
 * Genera el objeto EvaluationResultForDiagnosis para la RRS (Subescala de Rumiación).
 *
 * @param scoreRumiation Puntuación bruta de Rumiación.
 * @param scoreReflection Puntuación bruta de Reflexión (se incluye para contexto clínico, pero no para severidad principal).
 * @returns EvaluationResultForDiagnosis para la RRS.
 */
export function generateRRSResult(scoreRumiation: number, scoreReflection: number): EvaluationResultForDiagnosis {
  const interpretation = interpretRRSRuminationScore(scoreRumiation);

  return {
    instrumentName: 'RRS',
    date: new Date(),
    score: scoreRumiation, 
    severity: interpretation.severity,
    suicideRisk: false, 
    contextDescription: interpretation.description + ` (Reflexión: ${scoreReflection})`
  } as EvaluationResultForDiagnosis;
}


// --- III. Ejemplo de Integración y Simulación ---

/**
 * Simula la integración de un resultado de RRS en el motor de diagnóstico.
 */
export function simulateRRSIntegration() {
    // Escenario clínico simulado: Rumiación Alta (Baja Reflexión, lo cual es desadaptativo)
    const scoreRumiation = 38; 
    const scoreReflection = 20; 
    
    const rrsResult: EvaluationResultForDiagnosis = generateRRSResult(scoreRumiation, scoreReflection); 

    // Simular los resultados completos del paciente
    const mockResults: PatientResults = {
        results: [
            rrsResult,
            // Simulación BDI-II: Moderada (para mostrar la relación entre síntoma y mecanismo)
            { instrumentName: 'BDI-II', date: new Date('2025-12-01'), score: 25, severity: 'Moderada', suicideRisk: false, contextDescription: '' },
        ]
    };
    
    // El RRS Alto confirma un mecanismo de mantenimiento de la depresión.

    console.log("--- RRS Resultado para Integración ---");
    console.log(rrsResult);
    
    console.log("\n--- Interpretación Clínica y Mecanismo TCC (Simulado) ---");
    console.log(`Nivel de Rumiación: ${rrsResult.severity}`);
    console.log(`Implicación TCC: Nivel alto de Rumiación. Esto indica que el paciente utiliza el pensamiento repetitivo como una forma de Evitación Cognitiva. La intervención debe ser dual: Bloqueo de Rumiación (técnicas de TCC) y Activación Conductual (para romper el ciclo inercia-rumiación).`);
}

// simulateRRSIntegration(); // Descomentar para probar
