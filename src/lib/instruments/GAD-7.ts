// src/instruments/GAD-7.ts

import { EvaluationResultForDiagnosis, PatientResults } from '@/lib/diagnosis';

// --- I. Definición de Rangos de Severidad para GAD-7 ---
// Rangos estandarizados del GAD-7 para la interpretación clínica (foco en la preocupación cognitiva):
export const GAD7_SEVERITY_RANGES = [
  { scoreMax: 4, severity: 'Mínima', description: 'Ansiedad no significativa.' },
  { scoreMax: 9, severity: 'Leve', description: 'Ansiedad leve. Sugiere monitoreo.' },
  { scoreMax: 14, severity: 'Moderada', description: 'Ansiedad moderada. Consistente con un posible Trastorno de Ansiedad Generalizada (TAG).' },
  { scoreMax: 21, severity: 'Grave', description: 'Ansiedad grave. Alta preocupación que interfiere con el funcionamiento (Criterio D del TAG, DSM-5-TR).' },
];

/**
 * Traduce la puntuación bruta del GAD-7 a una severidad estandarizada.
 * @param score Puntuación bruta del GAD-7 (rango 0-21).
 * @returns {severity: string, description: string}
 */
export function interpretGAD7Score(score: number): { severity: string, description: string } {
  const range = GAD7_SEVERITY_RANGES.find(r => score <= r.scoreMax);
  if (range) {
    return { severity: range.severity, description: range.description };
  }
  return { severity: 'Grave', description: 'Puntuación fuera de rango válido (0-21).' };
}

// --- II. Función para Generar el Resultado de Evaluación ---

/**
 * Genera el objeto EvaluationResultForDiagnosis para el GAD-7.
 * Nota: El GAD-7, al igual que el PHQ-9, también incluye un ítem de dificultad funcional/síntomas de ansiedad
 * que, si es respondido afirmativamente, puede considerarse un factor de riesgo aunque no sea el foco principal del Triage D.
 * Sin embargo, se mantiene 'suicideRisk: false' para este módulo, confiando en el BDI-II y PHQ-9 para la alerta D.
 *
 * @param score Puntuación bruta total del GAD-7.
 * @returns EvaluationResultForDiagnosis para el GAD-7.
 */
export function generateGAD7Result(score: number): EvaluationResultForDiagnosis {
  const interpretation = interpretGAD7Score(score);

  return {
    instrumentName: 'GAD-7',
    date: new Date(),
    score: score,
    severity: interpretation.severity,
    // No se utiliza para activar directamente el Perfil D, sino el BDI-II/PHQ-9/SSI.
    suicideRisk: false, 
    contextDescription: interpretation.description
  } as EvaluationResultForDiagnosis;
}


// --- III. Ejemplo de Integración y Simulación ---

/**
 * Simula la integración de un resultado de GAD-7 en el motor de diagnóstico.
 */
export function simulateGAD7Integration() {
    // Escenario clínico simulado: Ansiedad Moderada.
    const gad7Result: EvaluationResultForDiagnosis = generateGAD7Result(11); 

    // Simular los resultados completos del paciente (Comorbilidad)
    const mockResults: PatientResults = {
        results: [
            // Simulación BDI-II: Depresión Leve (score: 18, item 9: 0)
            { instrumentName: 'BDI-II', date: new Date('2025-12-01'), score: 18, severity: 'Leve', suicideRisk: false, contextDescription: '' },
            // Simulación BAI: Ansiedad Mínima (score: 5)
            { instrumentName: 'BAI', date: new Date('2025-12-01'), score: 5, severity: 'Mínima', suicideRisk: false, contextDescription: '' },
            // GAD-7: Ansiedad Moderada (score: 11)
            gad7Result 
        ]
    };
    
    // Si esta simulación fuera alimentada al motor GII-M:
    // BDI-II (Leve) y GAD-7 (Moderada) -> Ambos >= Leve -> PERFIL A (Mixto Ansioso-Depresivo)

    console.log("--- GAD-7 Resultado para Integración ---");
    console.log(gad7Result);
    
    console.log("\n--- Interpretación Clínica y Perfil (Simulado) ---");
    console.log(`Severidad Ansiedad Cognitiva: ${gad7Result.severity}`);
    console.log(`Diagnóstico Categórico GAD-7: Ansiedad moderada (posible TAG, Criterio A del DSM-5-TR).`);
}

// simulateGAD7Integration(); // Descomentar para probar
