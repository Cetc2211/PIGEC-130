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
    .describe("A description of the client's situation or presenting problem."),
});
export type SuggestEvaluationScalesInput = z.infer<
  typeof SuggestEvaluationScalesInputSchema
>;

const SuggestEvaluationScalesOutputSchema = z.object({
  suggestedScales: z
    .array(z.string())
    .describe('A list of suggested evaluation scales relevant to the client description.'),
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
  prompt: `You are an expert psychologist. Based on the following description of a client's situation, suggest a list of relevant evaluation scales.

Client Description: {{{clientDescription}}}

Suggested Evaluation Scales:`,
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
