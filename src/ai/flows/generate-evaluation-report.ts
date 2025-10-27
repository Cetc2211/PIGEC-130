'use server';

/**
 * @fileOverview AI flow to generate a comprehensive evaluation report, including chart visualizations and a summary of key findings.
 *
 * - generateEvaluationReport - A function that generates the evaluation report.
 * - GenerateEvaluationReportInput - The input type for the generateEvaluationReport function.
 * - GenerateEvaluationReportOutput - The return type for the generateEvaluationReport function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateEvaluationReportInputSchema = z.object({
  evaluationResults: z.string().describe('The evaluation results in JSON format.'),
  scaleName: z.string().describe('The name of the evaluation scale used.'),
});

export type GenerateEvaluationReportInput = z.infer<
  typeof GenerateEvaluationReportInputSchema
>;

const GenerateEvaluationReportOutputSchema = z.object({
  report: z.string().describe('The generated evaluation report with visualizations.'),
});

export type GenerateEvaluationReportOutput = z.infer<
  typeof GenerateEvaluationReportOutputSchema
>;

export async function generateEvaluationReport(
  input: GenerateEvaluationReportInput
): Promise<GenerateEvaluationReportOutput> {
  return generateEvaluationReportFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateEvaluationReportPrompt',
  input: {schema: GenerateEvaluationReportInputSchema},
  output: {schema: GenerateEvaluationReportOutputSchema},
  prompt: `You are an expert psychologist specializing in interpreting evaluation results.

You will use the evaluation results and the scale name to generate a comprehensive report.
The report should include:
- A summary of key findings.
- Appropriate chart visualizations in markdown format (e.g., bar chart, pie chart, line chart) based on the data.

Scale Name: {{{scaleName}}}
Evaluation Results: {{{evaluationResults}}}

Ensure the report is easy to understand and share with clients.
`,
});

const generateEvaluationReportFlow = ai.defineFlow(
  {
    name: 'generateEvaluationReportFlow',
    inputSchema: GenerateEvaluationReportInputSchema,
    outputSchema: GenerateEvaluationReportOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
