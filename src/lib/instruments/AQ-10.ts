// src/instruments/AQ-10.ts

import { EvaluationResultForDiagnosis, PatientResults } from '@/lib/diagnosis';

// --- I. Definición de Rangos de Severidad para AQ-10 ---
// Rangos estandarizados del AQ-10 para la interpretación clínica:
export const AQ10_CUTOFF = 6; // Punto de corte común para un cribado positivo.

/**
 * Traduce la puntuación bruta del AQ-10 a una indicación de cribado.
 * @param score Puntuación bruta del AQ-10 (rango 0-10).
 * @returns {severity: string, description: string}
 */
export function interpretAQ10Score(score: number): { severity: string, description: string } {
  
  if (score >= AQ10_CUTOFF) {
      return { 
          severity: 'Positivo', 
          description: `Cribado positivo para rasgos del Espectro Autista. Puntuación (${score}/${AQ10_CUTOFF}+). Se requiere una Evaluación Diagnóstica Integral de TEA.` 
      };
  } else {
      return { 
          severity: 'Negativo', 
          description: `Cribado negativo para rasgos del Espectro Autista. La sintomatología se explica mejor por el diagnóstico primario (e.g., Trastorno de Ansiedad Social).` 
      };
  }
}

// --- II. Función para Generar el Resultado de Evaluación ---

/**
 * Genera el objeto EvaluationResult para el AQ-10.
 *
 * @param score Puntuación bruta total del AQ-10.
 * @returns EvaluationResult para el AQ-10.
 */
export function generateAQ10Result(score: number): EvaluationResultForDiagnosis {
  const interpretation = interpretAQ10Score(score);

  return {
    instrumentName: 'AQ-10',
    date: new Date(),
    score: score,
    // La severidad es Binaria: Positivo o Negativo
    severity: interpretation.severity, 
    suicideRisk: false, // No se utiliza para riesgo directo
    contextDescription: interpretation.description
  } as EvaluationResultForDiagnosis;
}


// --- III. Ejemplo de Integración y Simulación ---

/**
 * Simula la integración de un resultado de AQ-10 en el motor de diagnóstico.
 */
export function simulateAQ10Integration() {
    // Escenario clínico simulado: Cribado Positivo.
    const aq10Result: EvaluationResultForDiagnosis = generateAQ10Result(7); 

    // Simular los resultados completos del paciente
    const mockResults: PatientResults = {
        results: [
            // Simulación GAD-7: Ansiedad Moderada (que podría ser ansiedad social)
            { instrumentName: 'GAD-7', date: new Date('2025-12-01'), score: 13, severity: 'Moderada', suicideRisk: false },
            aq10Result // Cribado Positivo
        ]
    };
    
    // Si esta simulación fuera alimentada al motor dSIE:
    // La función generateClinicalImpression debe incluir la referencia de "TEA/T. de Comunicación"
    // en el Diagnóstico Diferencial, ya que los síntomas de ansiedad/social pueden ser
    // secundarios al TEA (DSM-5 Criterio E del Mutismo Selectivo/Ansiedad Social).

    console.log("--- AQ-10 Resultado para Integración ---");
    console.log(aq10Result);
    
    console.log("\n--- Interpretación Clínica y Diagnóstico Diferencial (Simulado) ---");
    console.log(`Cribado TEA: ${aq10Result.severity}`);
    console.log(`Implicación Diagnóstica (DSM-5): Si el GAD-7 es alto, se debe diferenciar si la ansiedad social es primaria o es secundaria al déficit de comunicación/intereses restringidos del TEA.`);
    console.log(`Próximo Paso: Interconsulta para Evaluación Funcional Completa de TEA.`);
}

// simulateAQ10Integration(); // Descomentar para probar
