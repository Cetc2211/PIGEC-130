// src/instruments/MRFI-FGST.ts

import { EvaluationResultForDiagnosis, PatientResults } from '@/lib/diagnosis';

// --- I. Definición de Rangos de Calidad de la Fantasía Futura ---
// La interpretación se basa en la calidad del recuerdo futuro (constructibilidad y especificidad).
export const MRFI_FGST_QUALITY_RANGES = [
  { scoreMax: 0, severity: 'Específico y Vívido', description: 'Alta constructibilidad y especificidad de metas futuras. Factor protector.' },
  { scoreMax: 1, severity: 'Genérico/Ambiguo', description: 'Capacidad para nombrar metas futuras, pero sin detalles vívidos o específicos (Ej. "Espero estar mejor").' },
  { scoreMax: 2, severity: 'Abstracto/Vision de Túnel', description: 'Incapacidad para generar metas o fantasías futuras positivas. Predominio de temas negativos o evitación.' },
];

// Medimos la calidad de la respuesta con una puntuación compuesta (0 a 2)
type FutureGoalScore = 0 | 1 | 2; 

/**
 * Evalúa la calidad de la respuesta en la Prueba de Imaginación de Metas.
 * Nota: El puntaje 2 (Abstracto/Visión de Túnel) es el que indica el sesgo cognitivo.
 * * @param qualityScore Puntuación de la calidad de la respuesta (0: Específico, 2: Abstracto).
 * @returns {severity: string, description: string}
 */
export function interpretMRFIGSTScore(qualityScore: FutureGoalScore): { severity: string, description: string } {
  const range = MRFI_FGST_QUALITY_RANGES.find(r => qualityScore <= r.scoreMax);
  if (range) {
    return { severity: range.severity, description: range.description };
  }
  return { severity: 'Abstracto/Vision de Túnel', description: 'Error o Visión de Túnel extrema.' };
}


// --- II. Función para Generar el Resultado de Evaluación ---

/**
 * Genera el objeto EvaluationResultForDiagnosis para el MRFI/FGST.
 *
 * @param qualityScore Puntuación de la calidad de la respuesta (0-2).
 * @returns EvaluationResultForDiagnosis para el MRFI/FGST.
 */
export function generateMRFIGSTResult(qualityScore: FutureGoalScore): EvaluationResultForDiagnosis {
  const interpretation = interpretMRFIGSTScore(qualityScore);

  return {
    instrumentName: 'MRFI/FGST',
    date: new Date(),
    score: qualityScore, // La puntuación es la calidad de 0 a 2
    severity: interpretation.severity,
    suicideRisk: false, 
    contextDescription: interpretation.description
  } as EvaluationResultForDiagnosis;
}


// --- III. Ejemplo de Integración y Simulación ---

/**
 * Simula la integración de un resultado de MRFI/FGST en el motor de diagnóstico.
 */
export function simulateMRFIGSTIntegration() {
    // Escenario clínico simulado: Visión de Túnel (Abstracto/Negativo).
    const fgstResult: EvaluationResultForDiagnosis = generateMRFIGSTResult(2); // Score 2: Abstracto/Visión de Túnel

    // Simular los resultados completos del paciente
    const mockResults: PatientResults = {
        results: [
            fgstResult,
            // Simulación BHS: Moderada (la desesperanza se correlaciona con la Visión de Túnel)
            { instrumentName: 'BHS', date: new Date('2025-12-01'), score: 12, severity: 'Moderada', suicideRisk: true, contextDescription: '' },
        ]
    };
    
    // El puntaje de 2 en FGST/MRFI refuerza la intervención sobre la Desesperanza (BHS).

    console.log("--- MRFI/FGST Resultado para Integración ---");
    console.log(fgstResult);
    
    console.log("\n--- Interpretación Clínica y Mecanismo TCC (Simulado) ---");
    console.log(`Calidad de Fantasía Futura: ${fgstResult.severity}`);
    console.log(`Puntuación de Calidad: ${fgstResult.score} (2 = Abstracto/Visión de Túnel).`);
    console.log(`Implicación TCC: Este sesgo de Visión de Túnel es un objetivo CLAVE de intervención. La terapia debe utilizar técnicas de imaginación guiada para hacer que las metas positivas sean específicas y vívidas, rompiendo el ciclo de la desesperanza.`);
}

// simulateMRFIGSTIntegration(); // Descomentar para probar
