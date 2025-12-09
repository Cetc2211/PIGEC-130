// src/instruments/ATQ-30.ts

import { EvaluationResultForDiagnosis, PatientResults } from '@/lib/diagnosis';

// --- I. Definición de Rangos de Severidad para ATQ-30 ---
// Rangos estandarizados del ATQ-30 (versión de 30 ítems) para la interpretación clínica:
export const ATQ30_SEVERITY_RANGES = [
  { scoreMax: 60, severity: 'Leve', description: 'Presencia de PANs que se activan bajo estrés leve.' },
  { scoreMax: 90, severity: 'Moderada', description: 'Frecuencia significativa de PANs y autocrítica. Foco principal para la Reestructuración Cognitiva.' },
  { scoreMax: 120, severity: 'Alta', description: 'Alta frecuencia de PANs y diálogos internos negativos intrusivos, manteniendo la sintomatología (Perfil A, B).' },
  { scoreMax: 150, severity: 'Alta', description: 'Frecuencia extrema de PANs. Se requiere Reestructuración Cognitiva urgente.' },
];

/**
 * Traduce la puntuación bruta del ATQ-30 a un nivel de frecuencia de PANs.
 * @param score Puntuación bruta del ATQ-30 (rango 30-150, 30 ítems, 1-5 Likert).
 * @returns {severity: string, description: string}
 */
export function interpretATQ30Score(score: number): { severity: string, description: string } {
  // Asumimos la versión de 30 ítems (rango teórico 30-150)
  const adjustedScore = Math.min(Math.max(score, 30), 150); 
  
  if (adjustedScore <= 30) {
      return { severity: 'Mínima', description: 'Baja frecuencia de pensamientos automáticos negativos (PANs).' };
  }

  const range = ATQ30_SEVERITY_RANGES.find(r => adjustedScore <= r.scoreMax);
  
  if (range) {
    return { severity: range.severity, description: range.description };
  }
  return { severity: 'Alta', description: 'Frecuencia extrema de PANs. Se requiere Reestructuración Cognitiva urgente.' };
}

// --- II. Función para Generar el Resultado de Evaluación ---

/**
 * Genera el objeto EvaluationResult para el ATQ-30.
 *
 * @param score Puntuación bruta total del ATQ-30.
 * @returns EvaluationResult para el ATQ-30.
 */
export function generateATQ30Result(score: number): EvaluationResultForDiagnosis {
  const interpretation = interpretATQ30Score(score);

  return {
    instrumentName: 'ATQ-30',
    date: new Date(),
    score: score,
    severity: interpretation.severity,
    // Escala de mecanismo, no de riesgo suicida directo.
    suicideRisk: false, 
    contextDescription: interpretation.description
  } as EvaluationResultForDiagnosis;
}


// --- III. Ejemplo de Integración y Simulación ---

/**
 * Simula la integración de un resultado de ATQ-30 en el motor de diagnóstico.
 */
export function simulateATQ30Integration() {
    // Escenario clínico simulado: Frecuencia de PANs Moderada.
    const atq30Result: EvaluationResultForDiagnosis = generateATQ30Result(85); 

    // Simular los resultados completos del paciente
    const mockResults: PatientResults = {
        results: [
            atq30Result,
            // Simulación BDI-II: Moderada (para confirmar la depresión sintomática)
            { instrumentName: 'BDI-II', date: new Date('2025-12-01'), score: 25, severity: 'Moderada', suicideRisk: false, contextDescription: '' },
        ]
    };
    
    // El ATQ-30 Alto justifica la elección de protocolos TCC enfocados en la cognición.

    console.log("--- ATQ-30 Resultado para Integración ---");
    console.log(atq30Result);
    
    console.log("\n--- Interpretación Clínica y Mecanismo TCC (Simulado) ---");
    console.log(`Frecuencia de Pensamientos Automáticos Negativos: ${atq30Result.severity}`);
    console.log(`Implicación TCC: Nivel ${atq30Result.severity} indica que la fase inicial de la TCC debe enfocarse en la detección, registro y cuestionamiento de estos pensamientos (Técnica de los 7 pasos).`);
}

// simulateATQ30Integration(); // Descomentar para probar
