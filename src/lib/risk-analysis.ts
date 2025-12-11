/**
 * Simulación de la Función de Cálculo del Índice de Riesgo Compuesto (IRC)
 * Esta función representa la lógica de la Regresión Logística (Cap. 5.1.3)
 */
type RiskData = {
    gpa: number;        // Calificación promedio, ej: 8.5
    absences: number;   // Porcentaje de ausentismo, ej: 15 para 15%
    gad7Score?: number; // Puntaje del GAD-7, ej: 14
};

// Normaliza un valor a una escala de 0 a 1.
// Para GPA, un valor más bajo es peor. Invertimos la escala.
const normalizeGpa = (gpa: number) => Math.max(0, 1 - ((gpa - 5) / 5)); // Asume que 5 es la peor nota (1) y 10 es la mejor (0)
// Para ausentismo, un valor más alto es peor.
const normalizeAbsences = (absences: number) => Math.min(1, absences / 50); // Asume que 50% de faltas es el máximo riesgo (1)
// Para GAD-7, un valor más alto es peor.
const normalizeGad7 = (score: number) => Math.min(1, score / 21); // 21 es el puntaje máximo

export function calculateRiskIndex(data: RiskData) {
    // Coeficientes pre-determinados (deben ajustarse según la investigación real del 5.1.1)
    const beta0 = -3.0; // Intercepto (ajuste)
    const beta_ausentismo = 0.35; // Peso para X1
    const beta_rendimiento = 0.25; // Peso para X2
    const beta_ansiedad = 0.40; // Peso para X3

    // Variables de entrada normalizadas (asumiendo que los puntajes ya están de 0 a 1)
    const X1 = normalizeAbsences(data.absences);
    const X2 = normalizeGpa(data.gpa);
    const X3 = data.gad7Score !== undefined ? normalizeGad7(data.gad7Score) : 0;

    // Cálculo del puntaje lineal (Z)
    const Z = beta0 + (beta_ausentismo * X1) + (beta_rendimiento * X2) + (beta_ansiedad * X3);

    // Aplicación de la Ecuación Logística para obtener la Probabilidad (P)
    // P = 1 / (1 + e^(-Z))
    const probabilidadRiesgo = 1 / (1 + Math.exp(-Z));

    // Normalizar la probabilidad a una escala de 0 a 100 para el Semáforo
    const IRC = (probabilidadRiesgo * 100);

    return {
        IRC: parseFloat(IRC.toFixed(2)),
        probabilidad: probabilidadRiesgo
    };
}

/**
 * Devuelve el nivel de riesgo (semáforo) basado en el IRC.
 * - Verde (Bajo Riesgo): IRC < 30%
 * - Amarillo (Riesgo Medio): 30% <= IRC < 60%
 * - Rojo (Alto Riesgo): IRC >= 60%
 */
export function getRiskLevel(irc: number): 'Bajo' | 'Medio' | 'Alto' {
  if (irc >= 60) return 'Alto';
  if (irc >= 30) return 'Medio';
  return 'Bajo';
}
