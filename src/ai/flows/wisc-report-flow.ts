'use server';
/**
 * @fileOverview Flujo de IA para generar un informe narrativo de WISC-V.
 *
 * - generateWiscReport: Genera un análisis cualitativo a partir de datos psicométricos.
 * - WiscReportInput: El tipo de entrada para el flujo.
 * - WiscReportOutput: El tipo de salida para el flujo.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

export const WiscReportInputSchema = z.object({
    studentName: z.string().describe('Nombre del evaluado.'),
    studentAge: z.number().describe('Edad del evaluado.'),
    compositeScores: z.array(z.object({
        name: z.string(),
        score: z.number(),
        classification: z.string(),
    })).describe('Listado de Índices Compuestos y sus puntajes.'),
});
export type WiscReportInput = z.infer<typeof WiscReportInputSchema>;

export const WiscReportOutputSchema = z.object({
  narrativeReport: z.string().describe('El informe narrativo cualitativo generado.'),
  diagnosticSynthesis: z.string().describe('La síntesis diagnóstica final.'),
});
export type WiscReportOutput = z.infer<typeof WiscReportOutputSchema>;

const reportGenerationPrompt = ai.definePrompt({
    name: 'wiscReportPrompt',
    input: { schema: WiscReportInputSchema },
    output: { schema: WiscReportOutputSchema },
    prompt: `Actúa como un Psicólogo Clínico experto en evaluación neuropsicológica con la escala WISC-V/WAIS-IV.
    Tarea: Generar un análisis cualitativo profesional y una síntesis diagnóstica basada en los siguientes resultados psicométricos:
    
    * Nombre del Evaluado: {{{studentName}}}
    * Edad: {{{studentAge}}}
    * Puntajes Compuestos (PC):
    {{#each compositeScores}}
    * {{{name}}}: PC = {{{score}}} (Clasificación: {{{classification}}})
    {{/each}}
    
    Instrucciones de Redacción:
    - Para cada índice principal (ICV, IVE, IRF, IMT, IVP), redacta un párrafo describiendo el rendimiento del evaluado.
    - Utiliza una terminología técnica pero accesible, similar a: "La capacidad de acceder y aplicar el conocimiento de palabras...".
    - Basa la descripción cualitativa en la clasificación proporcionada (ej. "Promedio", "Medio Bajo", "Muy Bajo").
    - Menciona específicamente las habilidades de formación de conceptos, relaciones visoespaciales y manipulación de información visual/auditiva en los párrafos correspondientes.
    - El resultado debe ser un objeto JSON con dos claves: 'narrativeReport' (que contenga los párrafos descriptivos) y 'diagnosticSynthesis'.
    - En 'diagnosticSynthesis', genera una breve síntesis que relacione los resultados con la posible necesidad de apoyos pedagógicos, destacando las áreas de oportunidad.
    `,
});


const wiscReportFlow = ai.defineFlow(
    {
        name: 'wiscReportFlow',
        inputSchema: WiscReportInputSchema,
        outputSchema: WiscReportOutputSchema,
    },
    async (input) => {
        const {output} = await reportGenerationPrompt(input);
        if (!output) {
            throw new Error("La IA no generó una respuesta válida.");
        }
        return output;
    }
);

export async function generateWiscReport(input: WiscReportInput): Promise<WiscReportOutput> {
    return wiscReportFlow(input);
}
