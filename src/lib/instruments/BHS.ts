// src/instruments/BHS.ts

import { EvaluationResultForDiagnosis, PatientResults } from '@/lib/diagnosis';

// --- I. Definición de Rangos de Severidad para BHS ---
// Rangos estandarizados de la BHS para la interpretación clínica:
export const BHS_SEVERITY_RANGES = [
  { scoreMax: 3, severity: 'Mínima', description: 'Desesperanza adaptativa o ausente.' },
  { scoreMax: 8, severity: 'Leve', description: 'Desesperanza leve. No presenta riesgo inminente de suicidio por este factor.' },
  { scoreMax: 14, severity: 'Moderada', description: 'Desesperanza moderada. Factor de riesgo significativo para la cronicidad y la conducta suicida.' },
  { scoreMax: 20, severity: 'Grave', description: 'Desesperanza grave. Factor de riesgo cognitivo CLAVE para el suicidio. Requiere intervención inmediata sobre esquemas futuros.' },
];

/**
 * Traduce la puntuación bruta de la BHS a un nivel de rasgo de desesperanza.
 * @param score Puntuación bruta de la BHS (rango 0-20).
 * @returns {severity: string, description: string}
 */
export function interpretBHSScore(score: number): { severity: string, description: string } {
  const range = BHS_SEVERITY_RANGES.find(r => score <= r.scoreMax);
  if (range) {
    return { severity: range.severity, description: range.description };
  }
  // Aunque el rango es 0-20, el manejo de la puntuación máxima se incluye para robustez
  return { severity: 'Grave', description: 'Desesperanza extrema. Máximo riesgo.' };
}

// --- II. Función de Triage para Riesgo Suicida (BHS) ---
// La BHS no mide la ideación actual (como el PHQ-9), sino la vulnerabilidad cognitiva
// asociada a la conducta suicida. Una puntuación alta ES un factor de riesgo.

/**
 * Evalúa el factor de riesgo cognitivo BHS para la activación de alerta de crisis.
 * Una puntuación de 9 o más es clínicamente significativa en el contexto suicida.
 * @param score Puntuación bruta total de la BHS.
 * @returns boolean
 */
export function checkBHSCognitiveRisk(score: number): boolean {
    // Se utiliza el punto de corte clínico de 9+ para marcar una Desesperanza clínicamente relevante.
    return score >= 9; 
}


// --- III. Función para Generar el Resultado de Evaluación ---

/**
 * Genera el objeto EvaluationResultForDiagnosis para la BHS.
 *
 * @param score Puntuación bruta total de la BHS.
 * @returns EvaluationResultForDiagnosis para la BHS.
 */
export function generateBHSResult(score: number): EvaluationResultForDiagnosis {
  const interpretation = interpretBHSScore(score);
  // La BHS se utiliza como un indicador de riesgo secundario (no de ideación activa)
  const cognitiveRisk = checkBHSCognitiveRisk(score);

  let severityDescription = interpretation.description;

  // Si hay riesgo cognitivo significativo, se marca la atención.
  if (cognitiveRisk) {
    severityDescription = `FACTOR DE RIESGO COGNITIVO ALTO: ${interpretation.description}. Mecanismo clave para el suicidio (Modelo Cognitivo de Beck).`;
  }

  return {
    instrumentName: 'BHS',
    date: new Date(),
    score: score,
    severity: interpretation.severity,
    // Marcamos 'suicideRisk: true' si el riesgo cognitivo es alto, aunque la alerta D primaria 
    // debe venir de un ítem de ideación activa (PHQ-9/SSI). Se incluye aquí para que el motor la vea.
    suicideRisk: cognitiveRisk, 
    contextDescription: severityDescription
  } as EvaluationResultForDiagnosis;
}


// --- IV. Ejemplo de Integración y Simulación ---

/**
 * Simula la integración de un resultado de BHS en el motor de diagnóstico.
 */
export function simulateBHSIntegration() {
    // Escenario clínico simulado: Desesperanza Moderada-Grave.
    const bhsResult: EvaluationResultForDiagnosis = generateBHSResult(12); 

    // Simular los resultados completos del paciente (Comorbilidad BDI con BHS)
    const mockResults: PatientResults = {
        results: [
            // Simulación BDI-II: Moderada (score: 25, item 9: 0)
            { instrumentName: 'BDI-II', date: new Date('2025-12-01'), score: 25, severity: 'Moderada', suicideRisk: false, contextDescription: '' },
            bhsResult // Desesperanza Moderada (Riesgo cognitivo)
        ]
    };
    
    // Si esta simulación fuera alimentada al motor GII-M, se activaría la bandera
    // suicideRisk: true del BHS, lo que resultaría en un PERFIL D (RIESGO SUICIDA) 
    // o al menos un manejo de caso mucho más cauto.

    console.log("--- BHS Resultado para Integración ---");
    console.log(bhsResult);
    
    console.log("\n--- Interpretación Clínica y Mecanismo TCC (Simulado) ---");
    console.log(`Nivel de Desesperanza: ${bhsResult.severity}`);
    console.log(`Factor de Riesgo Cognitivo (BHS >= 9): ${bhsResult.suicideRisk ? 'ALTO' : 'BAJO'}`);
    console.log(`Implicación TCC: Guía la intervención en reestructuración de las creencias de futuro (parte central de la Terapia Cognitiva).`);
}

// simulateBHSIntegration(); // Descomentar para probar
