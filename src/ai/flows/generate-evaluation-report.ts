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
  evaluationResults: z.string().describe('Los resultados de la evaluación en formato JSON.'),
  scaleName: z.string().describe('El nombre de la escala de evaluación utilizada.'),
});

export type GenerateEvaluationReportInput = z.infer<
  typeof GenerateEvaluationReportInputSchema
>;

const GenerateEvaluationReportOutputSchema = z.object({
  report: z.string().describe('El informe de evaluación generado con visualizaciones.'),
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
  prompt: `Eres un psicólogo experto en la interpretación de resultados de evaluaciones.

Utilizarás los resultados de la evaluación y el nombre de la escala para generar un informe completo.
El informe debe incluir:
- Un resumen de los hallazgos clave.
- Visualizaciones de gráficos apropiadas en formato markdown (por ejemplo, gráfico de barras, gráfico circular, gráfico de líneas) basadas en los datos.

Nombre de la escala: {{{scaleName}}}
Resultados de la evaluación: {{{evaluationResults}}}

Asegúrate de que el informe sea fácil de entender y de compartir con los clientes.
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
