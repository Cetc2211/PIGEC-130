'use server';

/**
 * @fileOverview This file defines a Genkit flow that parses a PDF document
 * and extracts the structure of a psychological evaluation questionnaire.
 *
 * - createQuestionnaireFromPdf - A function that processes the PDF.
 * - CreateQuestionnaireFromPdfInput - The input type for the function.
 * - CreateQuestionnaireFromPdfOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const CreateQuestionnaireFromPdfInputSchema = z.object({
  pdfDataUri: z
    .string()
    .describe(
      "A PDF file encoded as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:application/pdf;base64,<encoded_data>'."
    ),
});
export type CreateQuestionnaireFromPdfInput = z.infer<
  typeof CreateQuestionnaireFromPdfInputSchema
>;

const interpretationSchema = z.object({
    from: z.coerce.number().min(0).describe("El valor inicial del rango de puntuación."),
    to: z.coerce.number().min(0).describe("El valor final del rango de puntuación."),
    severity: z.enum(['Baja', 'Leve', 'Moderada', 'Alta']).describe("El nivel de severidad para este rango."),
    summary: z.string().min(1).describe("Un resumen de la interpretación para este rango de puntuación."),
});

const CreateQuestionnaireFromPdfOutputSchema = z.object({
  name: z.string().min(3).describe('El nombre del cuestionario.'),
  description: z.string().min(10).describe('Una breve descripción del cuestionario.'),
  questions: z.array(z.object({ text: z.string().min(1) })).min(1).describe('La lista de preguntas del cuestionario.'),
  likertScale: z.array(z.object({ label: z.string().min(1) })).min(2).describe('Las opciones de la escala de calificación (ej. "Para nada", "Muchísimo").'),
  interpretations: z.array(interpretationSchema).min(1).describe('Las reglas para interpretar la puntuación final.'),
});
export type CreateQuestionnaireFromPdfOutput = z.infer<
  typeof CreateQuestionnaireFromPdfOutputSchema
>;

export async function createQuestionnaireFromPdf(
  input: CreateQuestionnaireFromPdfInput
): Promise<CreateQuestionnaireFromPdfOutput> {
  return createQuestionnaireFromPdfFlow(input);
}

const prompt = ai.definePrompt({
  name: 'createQuestionnaireFromPdfPrompt',
  input: { schema: CreateQuestionnaireFromPdfInputSchema },
  output: { schema: CreateQuestionnaireFromPdfOutputSchema },
  prompt: `Eres un asistente experto en psicología y digitalización de documentos. Tu tarea es analizar el siguiente documento PDF y extraer la estructura completa de una prueba de evaluación psicológica.

Debes identificar los siguientes componentes y devolverlos en formato JSON:
1.  **name**: El título o nombre oficial de la prueba.
2.  **description**: Un párrafo introductorio o resumen que explique el propósito de la prueba. Si no hay uno explícito, crea uno basado en el título.
3.  **questions**: La lista de todas las preguntas o ítems que el paciente debe responder. Excluye los encabezados de sección (p.ej., "ÁREA EMOCIONAL").
4.  **likertScale**: Las opciones de respuesta para las preguntas (la escala de calificación). Asegúrate de que el orden sea correcto, desde la puntuación más baja a la más alta. Por ejemplo: "Nunca", "Pocas veces", "Muchas veces", "Siempre".
5.  **interpretations**: Las reglas para interpretar la puntuación total. Cada regla debe tener un rango de puntuación ('from', 'to'), un nivel de 'severity' (Baja, Leve, Moderada, Alta) y un 'summary' (la descripción de lo que significa ese rango de puntuación). Si el texto menciona una acción específica para un ítem (ej. "Ítem 15 > 0"), ignóralo y extrae solo las reglas basadas en la puntuación total.

Analiza el contenido del PDF y extrae esta información con la mayor precisión posible.

Contenido del PDF:
{{media url=pdfDataUri}}
`,
});

const createQuestionnaireFromPdfFlow = ai.defineFlow(
  {
    name: 'createQuestionnaireFromPdfFlow',
    inputSchema: CreateQuestionnaireFromPdfInputSchema,
    outputSchema: CreateQuestionnaireFromPdfOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
