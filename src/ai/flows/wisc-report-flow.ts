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
    strengths: z.array(z.string()).describe('Lista de fortalezas detectadas.'),
    weaknesses: z.array(z.string()).describe('Lista de debilidades detectadas.'),
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
    prompt: `Rol: Actúa como un experto en Psicometría y Evaluación Clínica Neuropsicológica especializado en escalas Wechsler (WISC-V).

Entrada de Datos:
* Nombre del Estudiante: {{{studentName}}}
* Edad: {{{studentAge}}}
* Perfil de Índices:
{{#each compositeScores}}
  * {{{name}}}: PC = {{{score}}} (Clasificación: {{{classification}}})
{{/each}}
* Fortalezas detectadas: {{#each strengths}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}
* Debilidades detectadas: {{#each weaknesses}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}

Instrucciones de Redacción:
1.  **Introducción**: Redacta una descripción de la capacidad intelectual general basada en el C.I. Total (CIT).
2.  **Análisis por Dominios**: Genera párrafos descriptivos para cada índice (Comprensión Verbal, Visoespacial, Razonamiento Fluido, Memoria de Trabajo, Velocidad de Procesamiento) siguiendo el estilo del manual:
    *   **Comprensión Verbal**: Analiza la formación de conceptos y razonamiento verbal.
    *   **Visoespacial**: Describe la discriminación de detalles visuales y entendimiento de relaciones espaciales.
    *   **Memoria de Trabajo**: Evalúa la capacidad de registrar, mantener y manipular información visual/auditiva.
    *   **Velocidad de Procesamiento**: Comenta la velocidad y precisión en la toma de decisiones visuales.
3.  **Conclusión**: Finaliza con una **Síntesis Diagnóstica** clara, indicando si el rendimiento es acorde a su edad o si sugiere algún déficit intelectual (DIL, DIM, etc.).
4.  **Formato**: El resultado debe ser un objeto JSON con dos claves: 'narrativeReport' (con la introducción y análisis de dominios) y 'diagnosticSynthesis' (con la conclusión).
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
