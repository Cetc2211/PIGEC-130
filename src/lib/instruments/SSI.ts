// src/instruments/SSI.ts

import { EvaluationResult, PatientResults } from '@/lib/diagnosis';

// --- I. Definición de Rangos de Severidad para SSI ---
// Rangos estandarizados de la SSI para la interpretación clínica:
export const SSI_SEVERITY_RANGES = [
  { scoreMax: 1, severity: 'Mínima', description: 'Ideación vaga o ausente.' },
  { scoreMax: 5, severity: 'Leve', description: 'Ideación activa (deseo de morir) sin plan específico.' },
  { scoreMax: 15, severity: 'Moderada', description: 'Ideación significativa con algunos planes o métodos considerados.' },
  { scoreMax: 38, severity: 'Grave', description: 'Ideación grave con plan estructurado, intención alta y/o intentos no letales previos. Activación de Protocolo de Crisis (Perfil D).' },
];

/**
 * Traduce la puntuación bruta de la SSI a un nivel de riesgo.
 * @param score Puntuación bruta de la SSI (rango 0-38).
 * @returns {severity: string, description: string}
 */
export function interpretSSIScore(score: number): { severity: string, description: string } {
  const range = SSI_SEVERITY_RANGES.find(r => score <= r.scoreMax);
  if (range) {
    return { severity: range.severity, description: range.description };
  }
  return { severity: 'Grave', description: 'Riesgo Suicida Extremo. Máxima puntuación.' };
}


// --- II. Función de Triage Profundo para Riesgo Suicida (SSI) ---
// La SSI evalúa 19 ítems (letra de A a T), pero la presencia de un plan o la intención
// son los indicadores más fuertes de riesgo inminente.

/**
 * Evalúa el riesgo suicida en la SSI basándose en la intensidad y el plan.
 * @param score Puntuación bruta total de la SSI.
 * @returns boolean
 */
export function checkSSISuicideRisk(score: number): boolean {
    // Un score de 6 o más indica ideación activa y un riesgo que requiere Plan de Seguridad.
    return score >= 6; 
}


// --- III. Función para Generar el Resultado de Evaluación ---

/**
 * Genera el objeto EvaluationResult para la SSI.
 *
 * @param score Puntuación bruta total de la SSI.
 * @returns EvaluationResult para la SSI.
 */
export function generateSSIResult(score: number): EvaluationResult {
  const interpretation = interpretSSIScore(score);
  const suicideRisk = checkSSISuicideRisk(score);

  let severityDescription = interpretation.description;

  // Cláusula de alerta para el motor de diagnóstico
  if (suicideRisk) {
    severityDescription = `ALERTA DE RIESGO SUICIDA PROFUNDO: ${interpretation.description}. Puntuación >= 6, activando el Protocolo de Crisis (Perfil D).`;
  }

  return {
    instrumentName: 'SSI',
    date: new Date(),
    score: score,
    severity: interpretation.severity,
    // Activa la bandera para que generatePatientProfile lo identifique como Perfil D.
    suicideRisk: suicideRisk, 
    contextDescription: severityDescription
  } as EvaluationResult;
}


// --- IV. Ejemplo de Integración y Simulación ---

/**
 * Simula la integración de un resultado de SSI en el motor de diagnóstico.
 */
export function simulateSSIIntegration() {
    // Escenario clínico simulado: Riesgo Moderado.
    const ssiResult: EvaluationResult = generateSSIResult(10); 

    // Simular los resultados completos del paciente
    const mockResults: PatientResults = {
        results: [
            ssiResult
        ]
    };
    
    // El motor detectará suicideRisk: true -> PERFIL D (RIESGO SUICIDA)
    
    console.log("--- SSI Resultado para Integración ---");
    console.log(ssiResult);
    
    console.log("\n--- Interpretación Clínica y Triage (Simulado) ---");
    console.log(`Nivel de Riesgo (SSI): ${ssiResult.severity}`);
    console.log(`Acción Clínica: La SSI ofrece la información dimensional necesaria para completar las secciones de Plan de Seguridad y Contención en la historia clínica.`);
}

// simulateSSIIntegration(); // Descomentar para probar
