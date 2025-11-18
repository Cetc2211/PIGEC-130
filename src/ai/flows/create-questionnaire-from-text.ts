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
    from: z.coerce.number().min(0).describe("El valor inicial del rango de puntuación."),
    to: z.coerce.number().min(0).describe("El valor final del rango de puntuación."),
    severity: z.enum(['Baja', 'Leve', 'Moderada', 'Alta']).describe("El nivel de severidad para este rango."),
    summary: z.string().min(1).describe("Un resumen de la interpretación para este rango de puntuación."),
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
  prompt: `Eres un asistente experto en psicología y digitalización de documentos. Tu tarea es analizar el siguiente texto, que puede ser una prueba de autoevaluación o una guía de observación compleja, y extraer su estructura principal.

Debes identificar los siguientes componentes y devolverlos en formato JSON:
1.  **name**: El título o nombre oficial del instrumento (p.ej., "GUÍA DE OBSERVACIÓN CONDUCTUAL EN AULA (GOCA)").
2.  **description**: Un párrafo introductorio o resumen que explique el propósito de la prueba. Si no hay uno explícito, crea uno basado en el título.
3.  **questions**: La lista de TODAS las conductas observables o ítems a evaluar, incluso si están divididas en secciones (p.ej., "SECCIÓN I: INDICADORES DE ATENCIÓN", "SECCIÓN II: INDICADORES DE PARTICIPACIÓN", etc.). Extrae solo el texto de la conducta observable (p.ej., "Se distrae fácilmente con ruidos externos"). **Ignora** los encabezados de sección, los datos de identificación, las instrucciones para el observador, los subtotales, y las secciones de "Recomendaciones" u "Observaciones adicionales".
4.  **likertScale**: Las opciones de respuesta para las preguntas (la escala de calificación). Busca la escala numérica y sus etiquetas (p.ej., "0 = Nunca", "1 = Raramente", etc.) y asegúrate de que el orden sea correcto, desde la puntuación más baja a la más alta.
5.  **interpretations**: Las reglas para interpretar la **puntuación TOTAL**. Busca una sección como "INTERPRETACIÓN AUTOMÁTICA DE RESULTADOS" y extrae las reglas basadas en el puntaje total (ej. 0-40 puntos), su severidad y su resumen. **Ignora** las interpretaciones por secciones o áreas críticas y enfócate solo en la interpretación del puntaje global de riesgo.

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
