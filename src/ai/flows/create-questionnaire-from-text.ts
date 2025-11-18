'use server';

/**
 * @fileOverview This file defines a Genkit flow that parses a text document
 * and extracts the structure of a psychological evaluation questionnaire.
 *
 * - createQuestionnaireFromText - A function that processes the text.
 * - CreateQuestionnaireFromTextInput - The input type for the function.
 * - CreateQuestionnaireFromTextOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const CreateQuestionnaireFromTextInputSchema = z.object({
  text: z.string().min(50).describe('The full text content of the questionnaire, including questions, scales, and interpretation rules.'),
});
export type CreateQuestionnaireFromTextInput = z.infer<
  typeof CreateQuestionnaireFromTextInputSchema
>;

const interpretationSchema = z.object({
    from: z.coerce.number().min(0).describe("The starting value of the score range."),
    to: z.coerce.number().min(0).describe("The ending value of the score range."),
    severity: z.enum(['Baja', 'Leve', 'Moderada', 'Alta']).describe("The severity level for this range."),
    summary: z.string().min(1).describe("A summary of the interpretation for this score range."),
});

const CreateQuestionnaireFromTextOutputSchema = z.object({
  name: z.string().min(3).describe('El nombre del cuestionario.'),
  description: z.string().min(10).describe('Una breve descripción del cuestionario.'),
  questions: z.array(z.object({ text: z.string().min(1) })).min(1).describe('La lista de preguntas del cuestionario.'),
  likertScale: z.array(z.object({ label: z.string().min(1) })).min(2).describe('Las opciones de la escala de calificación (ej. "Para nada", "Muchísimo").'),
  interpretations: z.array(interpretationSchema).min(1).describe('Las reglas para interpretar la puntuación final.'),
});
export type CreateQuestionnaireFromTextOutput = z.infer<
  typeof CreateQuestionnaireFromTextOutputSchema
>;

export async function createQuestionnaireFromText(
  input: CreateQuestionnaireFromTextInput
): Promise<CreateQuestionnaireFromTextOutput> {
  return createQuestionnaireFromTextFlow(input);
}

const prompt = ai.definePrompt({
  name: 'createQuestionnaireFromTextPrompt',
  input: { schema: CreateQuestionnaireFromTextInputSchema },
  output: { schema: CreateQuestionnaireFromTextOutputSchema },
  prompt: `Eres un asistente experto en psicología y digitalización de documentos. Tu tarea es analizar el siguiente texto, que puede ser una prueba de autoevaluación o una guía de observación compleja, y extraer su estructura principal en formato JSON.

Sigue estas reglas estrictamente:

1.  **name**: Extrae el título o nombre oficial del instrumento (p.ej., "GUÍA DE OBSERVACIÓN CONDUCTUAL EN AULA (GOCA)").
2.  **description**: Extrae o genera un párrafo que explique el propósito de la prueba.
3.  **questions**: Extrae la lista de TODAS las conductas observables o ítems a evaluar, incluso si están en diferentes secciones (p.ej., "SECCIÓN I", "SECCIÓN II", etc.). Extrae solo el texto de la pregunta/conducta.
4.  **likertScale**: Busca la escala de calificación numérica y sus etiquetas (p.ej., "0 = Nunca", "1 = Raramente", etc.) y ordénala de menor a mayor puntuación.
5.  **interpretations**: Busca una sección como "INTERPRETACIÓN AUTOMÁTICA DE RESULTADOS". Extrae las reglas basadas en la puntuación TOTAL o de RIESGO.
    *   Para un rango como "0-40 puntos", usa 0 para 'from' y 40 para 'to'.
    *   Para un rango abierto como "121+ puntos", usa 121 para 'from' y un número muy alto como 999 para 'to'.
    *   Asegúrate de que la 'severity' sea uno de los valores permitidos: 'Baja', 'Leve', 'Moderada', 'Alta'. Para "Sin indicadores significativos" usa 'Baja'. Para "Señales de alerta moderadas" o "Múltiples indicadores", usa 'Moderada'. Para "Situación crítica" usa 'Alta'.

**IGNORA COMPLETAMENTE LAS SIGUIENTES SECCIONES:**
*   DATOS DE IDENTIFICACIÓN
*   INSTRUCCIONES PARA EL OBSERVADOR
*   Subtotal Sección I, II, III, IV, V, VI
*   RESUMEN DE PUNTUACIÓN (la tabla con porcentajes)
*   La sección sobre "Factores Protectores"
*   ANÁLISIS POR ÁREAS CRÍTICAS
*   OBSERVACIONES ADICIONALES DEL DOCENTE
*   RECOMENDACIONES DE ACCIÓN
*   DATOS DEL OBSERVADOR

Analiza el contenido del siguiente texto y extrae esta información con la mayor precisión posible.

Contenido de la Prueba:
{{{text}}}
`,
});

const createQuestionnaireFromTextFlow = ai.defineFlow(
  {
    name: 'createQuestionnaireFromTextFlow',
    inputSchema: CreateQuestionnaireFromTextInputSchema,
    outputSchema: CreateQuestionnaireFromTextOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
