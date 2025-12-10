// src/instruments/ASQ.ts

import { EvaluationResultForDiagnosis, PatientResults } from '@/lib/diagnosis';

// --- I. Definición de Rangos de Estilos Atribucionales (ASQ) ---
// El ASQ genera tres puntuaciones principales para eventos negativos (Puntuación de Pesimismo):
// 1. Internalidad (Interna vs. Externa)
// 2. Estabilidad (Estable vs. Inestable / Temporal)
// 3. Globalidad (Global vs. Específica)
// La media de estas tres subescalas para eventos negativos define el Estilo Atribucional Pesimista.

// Rangos simplificados para el índice de pesimismo:
export const ASQ_SEVERITY_RANGES = [
  { scoreMax: 3, severity: 'Optimista', description: 'Atribución de fracasos a causas externas y específicas.' },
  { scoreMax: 5, severity: 'Intermedio', description: 'Estilo atribucional flexible. El sesgo aparece bajo estrés.' },
  { scoreMax: 7, severity: 'Pesimista', description: 'Alta atribución a causas internas, estables y globales. Indica Sesgo Atribucional Crónico.' },
];

/**
 * Calcula la Puntuación de Pesimismo Negativo (promedio de las subescalas de eventos negativos).
 * Traduce el índice de pesimismo negativo a un nivel de riesgo.
 * @param score_negative_avg Puntuación promedio de las 3 subescalas de eventos negativos (rango 1-7).
 * @returns {severity: string, description: string}
 */
export function interpretASQScore(score_negative_avg: number): { severity: string, description: string } {
  // Ajustamos el score_negative_avg al rango teórico 1-7
  const adjustedScore = Math.min(Math.max(score_negative_avg, 1), 7); 
  
  const range = ASQ_SEVERITY_RANGES.find(r => adjustedScore <= r.scoreMax);
  
  if (range) {
    return { severity: range.severity, description: range.description };
  }
  return { severity: 'Pesimista', description: 'Sesgo atribucional muy rígido e inadaptativo.' };
}

// --- II. Función para Generar el Resultado de Evaluación ---

/**
 * Genera el objeto EvaluationResultForDiagnosis para el ASQ.
 *
 * @param score_negative_avg Puntuación promedio de pesimismo (1-7).
 * @param score_positive_avg Puntuación promedio de optimismo (1-7, para contexto).
 * @returns EvaluationResultForDiagnosis para el ASQ.
 */
export function generateASQResult(score_negative_avg: number, score_positive_avg: number): EvaluationResultForDiagnosis {
  const interpretation = interpretASQScore(score_negative_avg);

  return {
    instrumentName: 'ASQ',
    date: new Date(),
    // Usamos el promedio negativo para el score principal que clasifica el pesimismo.
    score: score_negative_avg, 
    severity: interpretation.severity,
    suicideRisk: false, // Escala de mecanismo, no de riesgo suicida directo.
    contextDescription: interpretation.description + ` (Optimismo Positivo Promedio: ${score_positive_avg})`
  } as EvaluationResultForDiagnosis;
}


// --- III. Ejemplo de Integración y Simulación ---

/**
 * Simula la integración de un resultado de ASQ en el motor de diagnóstico.
 */
export function simulateASQIntegration() {
    // Escenario clínico simulado: Estilo Atribucional Pesimista (Visión de Túnel Cognitiva).
    const score_negative = 7.5; // Pesimista
    const score_positive = 4.0; // Intermedio/Bajo (no tan optimista con los éxitos)
    
    const asqResult: EvaluationResultForDiagnosis = generateASQResult(score_negative, score_positive); 

    // El Sesgo Atribucional Pesimista (ASQ) es el correlato de la "Visión de Túnel" cognitiva en la TCC.

    console.log("--- ASQ Resultado para Integración ---");
    console.log(asqResult);
    
    console.log("\n--- Interpretación Clínica y Mecanismo TCC (Simulado) ---");
    console.log(`Estilo Atribucional: ${asqResult.severity}`);
    console.log(`Índice de Pesimismo: ${asqResult.score} (Alto).`);
    console.log(`Implicación TCC: Este nivel Pesimista justifica el uso de la Reestructuración Cognitiva para desafiar la Globalidad y Estabilidad de las atribuciones negativas, complementando la BHS (Desesperanza).`);
}

// simulateASQIntegration(); // Descomentar para probar
