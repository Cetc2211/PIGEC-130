// src/instruments/BIS-BAS.ts

import { EvaluationResultForDiagnosis, PatientResults } from '@/lib/diagnosis';

// --- I. Definición de Rangos de Severidad para BIS/BAS ---
// El BIS/BAS produce dos puntuaciones principales:

// 1. Sensibilidad al Castigo (BIS): Mide la evitación de estímulos aversivos (rasgo central de la ansiedad).
//    Una puntuación alta se asocia con T. de Ansiedad (Perfil C).
export const BIS_RANGES = [
  { scoreMax: 18, severity: 'Baja', description: 'Baja sensibilidad a la ansiedad y el castigo.' },
  { scoreMax: 21, severity: 'Moderada', description: 'Sensibilidad moderada al castigo; puede contribuir a la ansiedad y la rumiación (BIS).' },
  { scoreMax: 28, severity: 'Alta', description: 'Alta sensibilidad al castigo y la evitación. Foco en la exposición.' },
];

// 2. Sensibilidad a la Recompensa (BAS): Mide la búsqueda de metas, la impulsividad y la motivación.
//    Una puntuación baja se asocia con anhedonia y depresión (Perfil B).
export const BAS_RANGES = [
  { scoreMin: 20, severity: 'Baja', description: 'Baja reactividad a la recompensa (anhedonia). Foco de la Activación Conductual.' },
  { scoreMin: 28, severity: 'Moderada', description: 'Motivación y búsqueda de recompensa típicas.' },
  { scoreMin: 35, severity: 'Alta', description: 'Alta búsqueda de recompensa (asociado a impulsividad/TDAH; posible factor de riesgo para T. Bipolar).' },
];


/**
 * Traduce las puntuaciones del BIS y BAS a un nivel de sensibilidad.
 * @param scoreBis Puntuación bruta del BIS.
 * @param scoreBas Puntuación bruta del BAS (Subescalas: Drive, Fun Seeking, Reward Responsiveness).
 * @returns {severity: string, description: string}
 */
export function interpretBISBASScore(scoreBis: number, scoreBas: number): { severity: string, description: string } {
  
  const bisLevel = BIS_RANGES.find(r => scoreBis <= r.scoreMax) || BIS_RANGES[BIS_RANGES.length - 1];
  const basLevel = BAS_RANGES.find(r => scoreBas >= r.scoreMin) || BAS_RANGES[0];

  let interpretation = `BIS (${bisLevel.severity}): ${bisLevel.description}. BAS (${basLevel.severity}): ${basLevel.description}.`;
  
  // Patrón Típico de Depresión (Perfil B): BAS Baja / BIS Típica o Alta
  if (basLevel.severity === 'Baja' && bisLevel.severity !== 'Baja') {
    interpretation = "Vulnerabilidad Depresiva Clásica: Baja búsqueda de placer (anhedonia) y alta evitación del castigo. Indica la necesidad de Activación Conductual.";
    return { severity: 'Vulnerabilidad Depresiva', description: interpretation };
  }

  // Patrón Típico de Ansiedad (Perfil C): BIS Alta / BAS Típica
  if (bisLevel.severity === 'Alta' && basLevel.severity !== 'Baja') {
    interpretation = "Vulnerabilidad Ansiosa/Evitativa: Excesiva evitación del castigo. Mecanismo clave para T. de Ansiedad y evitación.";
    return { severity: 'Vulnerabilidad Ansiosa', description: interpretation };
  }
  
  return { severity: 'Mixta/Típica', description: interpretation };
}

// --- II. Función para Generar el Resultado de Evaluación ---

/**
 * Genera el objeto EvaluationResult para el BIS/BAS.
 *
 * @param scoreBis Puntuación bruta total del BIS.
 * @param scoreBas Puntuación bruta total del BAS.
 * @returns EvaluationResult para el BIS/BAS.
 */
export function generateBISBASResult(scoreBis: number, scoreBas: number): EvaluationResultForDiagnosis {
  const interpretation = interpretBISBASScore(scoreBis, scoreBas);

  return {
    instrumentName: 'BIS/BAS',
    date: new Date(),
    // Usamos el promedio para la puntuación general, pero la interpretación depende de ambos.
    score: (scoreBis + scoreBas) / 2, 
    severity: interpretation.severity,
    suicideRisk: false, // No se utiliza para riesgo directo
    contextDescription: interpretation.description
  } as EvaluationResultForDiagnosis;
}


// --- III. Ejemplo de Integración y Simulación ---

/**
 * Simula la integración de un resultado de BIS/BAS en el motor de diagnóstico.
 */
export function simulateBISBASIntegration() {
    // Escenario clínico simulado: Patrón Depresivo Clásico (Anhedonia Alta)
    const scoreBis = 20; // BIS: Moderada
    const scoreBas = 18; // BAS: Baja (Anhedonia)
    
    const bisbasResult: EvaluationResultForDiagnosis = generateBISBASResult(scoreBis, scoreBas); 

    // Simular los resultados completos del paciente (Comorbilidad BDI con BIS/BAS)
    const mockResults: PatientResults = {
        results: [
            // Simulación BDI-II: Moderada (score: 25, item 9: 0)
            { instrumentName: 'BDI-II', date: new Date('2025-12-01'), score: 25, severity: 'Moderada', suicideRisk: false },
            bisbasResult // Patrón Depresivo
        ]
    };
    
    // Si esta simulación fuera alimentada al motor GII-M, el Perfil B (Dominio Depresivo)
    // se mantendría, y el BIS/BAS confirmaría el mecanismo de la anhedonia.

    console.log("--- BIS/BAS Resultado para Integración ---");
    console.log(bisbasResult);
    
    console.log("\n--- Interpretación Clínica y Mecanismo TCC (Simulado) ---");
    console.log(`Patrón Predominante: ${bisbasResult.severity}`);
    console.log(`Implicación TCC: Confirma que la ${bisbasResult.severity} se debe a una baja activación de recompensa. El protocolo se enfoca en la planificación de actividades placenteras (Activación Conductual).`);
}

// simulateBISBASIntegration(); // Descomentar para probar
