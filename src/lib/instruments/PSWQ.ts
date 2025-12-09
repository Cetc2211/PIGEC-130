// src/instruments/PSWQ.ts

import type { EvaluationResultForDiagnosis, PatientResults } from '@/lib/diagnosis';

// --- I. Definición de Rangos de Severidad para PSWQ ---
// Rangos estandarizados del PSWQ. Nota: No es una escala DSM, se usa para medir un rasgo central.
export const PSWQ_SEVERITY_RANGES = [
  { scoreMax: 44, severity: 'Bajo', description: 'Niveles de preocupación habituales, no clínicos.' },
  { scoreMax: 59, severity: 'Moderado', description: 'Tendencia elevada a la preocupación. Factor de riesgo para T. de Ansiedad.' },
  { scoreMax: 80, severity: 'Alto', description: 'Preocupación crónica, incontrolable e intrusiva. Mecanismo clave del TAG (Criterio A y B).' },
];

/**
 * Traduce la puntuación bruta del PSWQ a un nivel de rasgo (rasgo de preocupación).
 * @param score Puntuación bruta del PSWQ (rango 16-80).
 * @returns {severity: string, description: string}
 */
export function interpretPSWQScore(score: number): { severity: string, description: string } {
  const adjustedScore = Math.min(Math.max(score, 16), 80); 
  
  const range = PSWQ_SEVERITY_RANGES.find(r => adjustedScore <= r.scoreMax);

  if (range) {
    return { severity: range.severity as 'Bajo' | 'Moderado' | 'Alto', description: range.description };
  }
  
  return { severity: 'Alto', description: 'Preocupación crónica e incontrolable.' };
}

// --- II. Función para Generar el Resultado de Evaluación ---

/**
 * Genera el objeto EvaluationResult para el PSWQ.
 * Nota: El PSWQ no se utiliza para activar directamente el Perfil D, ni para el diagnóstico categórico
 * (BDI-II, GAD-7, BAI son prioritarios), sino para el componente 'protocol' del Perfil.
 *
 * @param score Puntuación bruta total del PSWQ.
 * @returns EvaluationResult para el PSWQ.
 */
export function generatePSWQResult(score: number): EvaluationResultForDiagnosis {
  const interpretation = interpretPSWQScore(score);

  return {
    instrumentName: 'PSWQ',
    date: new Date(),
    score: score,
    severity: interpretation.severity,
    // Escala de rasgo, no tiene ítem de riesgo suicida.
    suicideRisk: false, 
    contextDescription: interpretation.description
  } as EvaluationResultForDiagnosis;
}


// --- III. Ejemplo de Integración y Simulación ---

/**
 * Simula la integración de un resultado de PSWQ en el motor de diagnóstico.
 */
export function simulatePSWQIntegration() {
    // Escenario clínico simulado: Preocupación Alta (Típico de TAG/Perfil C).
    const pswqResult: EvaluationResultForDiagnosis = generatePSWQResult(65); 

    // Simular los resultados completos del paciente (solo para el contexto del PSWQ)
    const mockResults: PatientResults = {
        results: [
            pswqResult,
            // Simulación GAD-7: Moderada (para confirmar el TAG sintomático)
            { instrumentName: 'GAD-7', date: new Date('2025-12-01'), score: 12, severity: 'Moderada', suicideRisk: false, contextDescription: "" },
        ]
    };
    
    // Si esta simulación fuera alimentada al motor GII-M, el GAD-7 Moderado y el BDI-II Mínimo
    // llevarían a un Perfil C (Dominio Ansioso), y el PSWQ Alto refinaría el protocolo TCC.

    console.log("--- PSWQ Resultado para Integración ---");
    console.log(pswqResult);
    
    console.log("\n--- Interpretación Clínica y Mecanismo TCC (Simulado) ---");
    console.log(`Nivel de Rasgo de Preocupación: ${pswqResult.severity}`);
    console.log(`Implicación TCC: Este nivel alto dirige el protocolo hacia la Terapia Cognitiva, usando técnicas específicas para reducir la rumiación y la preocupación incontrolable (Criterio B del TAG).`);
}

// simulatePSWQIntegration(); // Descomentar para probar
