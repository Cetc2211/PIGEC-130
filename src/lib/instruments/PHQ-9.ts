// src/instruments/PHQ-9.ts

import { EvaluationResult, PatientResults } from '@/lib/diagnosis';

// --- I. Definición de Rangos de Severidad para PHQ-9 ---
// Rangos estandarizados del PHQ-9 para la interpretación clínica:
export const PHQ9_SEVERITY_RANGES = [
  { scoreMax: 4, severity: 'Mínima', description: 'No hay indicación de depresión significativa.' },
  { scoreMax: 9, severity: 'Leve', description: 'Depresión leve. Se recomienda vigilancia y apoyo.' },
  { scoreMax: 14, severity: 'Moderada', description: 'Depresión moderada. Tratamiento recomendado: Psicoterapia o farmacoterapia.' },
  { scoreMax: 19, severity: 'Moderada-Grave', description: 'Depresión moderada a grave. Requiere intervención inmediata (Psicoterapia + Farmacoterapia).' },
  { scoreMax: 27, severity: 'Grave', description: 'Depresión grave. Justifica un diagnóstico de Trastorno Depresivo Mayor (TDM).' },
];

/**
 * Traduce la puntuación bruta del PHQ-9 a una severidad estandarizada.
 * @param score Puntuación bruta del PHQ-9 (rango 0-27).
 * @returns {severity: string, description: string}
 */
export function interpretPHQ9Score(score: number): { severity: string, description: string } {
  const range = PHQ9_SEVERITY_RANGES.find(r => score <= r.scoreMax);
  if (range) {
    return { severity: range.severity, description: range.description };
  }
  return { severity: 'Error', description: 'Puntuación fuera de rango válido (0-27).' };
}


// --- II. Función de Triage para Riesgo Suicida (PHQ-9) ---
// El ítem 9 del PHQ-9 ("Pensar que estaría mejor muerto o ideas de autolesionarse de alguna forma")
// es la pregunta de Triage por excelencia.

/**
 * Evalúa el riesgo suicida en el PHQ-9.
 * @param item9Score Puntuación del ítem 9 (0: Nunca; 1: Varios días; 2: Más de la mitad de los días; 3: Casi todos los días).
 * @returns boolean
 */
export function checkPHQ9SuicideRisk(item9Score: number): boolean {
    // Si el paciente responde 1 o más, hay ideación (Criterio A9 del TDM y activación de alerta de crisis).
    return item9Score >= 1;
}


// --- III. Función para Generar el Resultado de Evaluación ---

/**
 * Genera el objeto EvaluationResult para el PHQ-9.
 *
 * @param score Puntuación bruta total del PHQ-9.
 * @param item9Score Puntuación del ítem 9 específico (para riesgo suicida).
 * @returns EvaluationResult para el PHQ-9.
 */
export function generatePHQ9Result(score: number, item9Score: number): EvaluationResult {
  const interpretation = interpretPHQ9Score(score);
  const suicideRisk = checkPHQ9SuicideRisk(item9Score);

  let severityDescription = interpretation.description;

  // Si hay riesgo, la severidad real debe ser considerada Grave para fines de acción clínica.
  if (suicideRisk) {
    severityDescription = "ALERTA DE RIESGO SUICIDA (Perfil D Activado). Ideación positiva en Ítem 9. Prioridad de Plan de Seguridad y Contención.";
  }

  return {
    instrumentName: 'PHQ-9',
    date: new Date(),
    score: score,
    severity: interpretation.severity, // Se mantiene la severidad de depresión general
    suicideRisk: suicideRisk, // Se activa la bandera para la función generatePatientProfile
    contextDescription: severityDescription 
  } as EvaluationResult;
}


// --- IV. Ejemplo de Integración y Simulación ---

/**
 * Simula la integración de un resultado de PHQ-9 en el motor de diagnóstico.
 */
export function simulatePHQ9Integration() {
    // Escenario clínico simulado: Depresión Moderada-Grave CON Riesgo Activo.
    const phq9Result: EvaluationResult = generatePHQ9Result(17, 2); // Score 17, Ítem 9: 2 (Más de la mitad de los días)

    // Simular los resultados completos del paciente
    const mockResults: PatientResults = {
        results: [
            phq9Result,
            // Otros resultados no relevantes que serán ignorados por la prioridad del PHQ-9
            { instrumentName: 'BAI', date: new Date('2025-12-01'), score: 8, severity: 'Mínima', suicideRisk: false },
        ]
    };
    
    // Si esta simulación fuera alimentada al motor GII-M:
    // El motor detecta suicideRisk: true -> PERFIL D (RIESGO SUICIDA)
    
    console.log("--- PHQ-9 Resultado para Integración ---");
    console.log(phq9Result);
    
    console.log("\n--- Interpretación Clínica y Triage (Simulado) ---");
    console.log(`Severidad Depresiva: ${phq9Result.severity}`);
    console.log(`Riesgo Suicida Activo (Ítem 9): ${phq9Result.suicideRisk ? 'SI' : 'NO'}`);
    console.log(`Acción Clínica: La bandera 'suicideRisk: true' anula la clasificación por severidad y activa el Protocolo de Crisis (Perfil D).`);
}

// simulatePHQ9Integration(); // Descomentar para probar