'use server';

/**
 * @fileOverview This file defines a Genkit flow that suggests relevant evaluation scales based on a description of the client's situation.
 *
 * - suggestEvaluationScales - A function that suggests evaluation scales.
 * - SuggestEvaluationScalesInput - The input type for the suggestEvaluationScales function.
 * - SuggestEvaluationScalesOutput - The return type for the suggestEvaluationScales function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestEvaluationScalesInputSchema = z.object({
  clientDescription: z
    .string()
    .describe("Una descripción de la situación o el problema principal del cliente."),
});
export type SuggestEvaluationScalesInput = z.infer<
  typeof SuggestEvaluationScalesInputSchema
>;

const SuggestEvaluationScalesOutputSchema = z.object({
  suggestedScales: z
    .array(z.string())
    .describe('Una lista de escalas de evaluación sugeridas relevantes para la descripción del cliente.'),
});
export type SuggestEvaluationScalesOutput = z.infer<
  typeof SuggestEvaluationScalesOutputSchema
>;

export async function suggestEvaluationScales(
  input: SuggestEvaluationScalesInput
): Promise<SuggestEvaluationScalesOutput> {
  return suggestEvaluationScalesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestEvaluationScalesPrompt',
  input: {schema: SuggestEvaluationScalesInputSchema},
  output: {schema: SuggestEvaluationScalesOutputSchema},
  prompt: `Eres un psicólogo experto. Basado en la siguiente descripción de la situación de un cliente, sugiere una lista de escalas de evaluación relevantes.

Descripción del cliente: {{{clientDescription}}}

Escalas de evaluación sugeridas:`,
});

const suggestEvaluationScalesFlow = ai.defineFlow(
  {
    name: 'suggestEvaluationScalesFlow',
    inputSchema: SuggestEvaluationScalesInputSchema,
    outputSchema: SuggestEvaluationScalesOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
