'use client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "./ui/textarea";

export default function ClinicalAssessmentForm() {

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        
        const formData = new FormData(event.currentTarget);
        const data = {
            studentId: 'S001', // ID de estudiante (debe ser dinámico en una app real)
            fecha_evaluacion: new Date().toISOString(),
            // Screening Emocional
            bdi_ii_score: Number(formData.get('bdi_score')),
            bai_score: Number(formData.get('bai_score')),
            riesgo_suicida_beck_score: Number(formData.get('beck_suicide_score')), // Nuevo campo
            // Tamizaje Neuropsicológico
            neuro_mt_score: Number(formData.get('mt_index')),
            neuro_as_score: Number(formData.get('as_index')),
            neuro_vp_score: Number(formData.get('vp_index')),
            contexto_carga_cognitiva: formData.get('cognitive_load_context'), // Nuevo campo
            // Conductas de Riesgo
            assist_result: formData.get('assist_result'),
            conducta_autolesiva_score: Number(formData.get('self_harm_score')),
            // Impresión Diagnóstica
            impresion_diagnostica: formData.get('diagnostic_impression'),
        };

        // Simulación de llamada a saveClinicalAssessment(data)
        console.log("Guardando en 'clinical_assessments':", data);
        alert("Perfil Clínico y Evaluación guardados (simulación). Revisa la consola.");
    };

    return (
        <Card className="shadow-lg">
            <CardHeader>
                <CardTitle>Módulo 2.1: Evaluación Clínica</CardTitle>
                <CardDescription>
                    Registro de puntajes de screening, tamizaje neuropsicológico e impresión diagnóstica.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* SECCIÓN I: SCREENING EMOCIONAL */}
                    <div>
                        <h3 className="text-lg font-semibold text-gray-700 mb-4">I. Screening Emocional</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="bdi-score">Puntuación BDI-II (Depresión)</Label>
                                <Input id="bdi-score" name="bdi_score" type="number" placeholder="Ej. 25" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="bai-score">Puntuación BAI (Ansiedad)</Label>
                                <Input id="bai-score" name="bai_score" type="number" placeholder="Ej. 21" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="beck-suicide-score">Puntaje Riesgo Suicida (Beck)</Label>
                                <Input id="beck-suicide-score" name="beck_suicide_score" type="number" placeholder="Ej. 10" />
                            </div>
                        </div>
                    </div>

                    <Separator />

                    {/* SECCIÓN II: TAMIZAJE NEUROPSICOLÓGICO */}
                    <div>
                        <h3 className="text-lg font-semibold text-gray-700 mb-4">II. Tamizaje Neuropsicológico (Funciones Ejecutivas)</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="mt-index">Índice Memoria de Trabajo (MT)</Label>
                                <Input id="mt-index" name="mt_index" type="number" placeholder="Ej. 85" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="as-index">Índice Atención Sostenida (AS)</Label>
                                <Input id="as-index" name="as_index" type="number" placeholder="Ej. 90" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="vp-index">Índice Velocidad de Procesamiento (VP)</Label>
                                <Input id="vp-index" name="vp_index" type="number" placeholder="Ej. 80" />
                            </div>
                        </div>
                         <div className="mt-6 space-y-2">
                            <Label htmlFor="cognitive-load-context">Contexto de Carga Cognitiva / Estrés</Label>
                            <Textarea id="cognitive-load-context" name="cognitive_load_context" placeholder="Describir situación actual que impacta el desempeño (ej. 'Exámenes finales', 'Conflicto familiar')." />
                        </div>
                    </div>
                    
                    <Separator />

                    {/* SECCIÓN III: CONDUCTAS DE RIESGO */}
                    <div>
                        <h3 className="text-lg font-semibold text-gray-700 mb-4">III. Conductas de Riesgo</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                             <div className="space-y-2">
                                <Label htmlFor="assist-result">Resultado ASSIST (Consumo de Sustancias)</Label>
                                <Input id="assist-result" name="assist_result" placeholder="Positivo / Negativo" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="self-harm-score">Puntaje Conductas Autolesivas (Frecuencia)</Label>
                                <Input id="self-harm-score" name="self_harm_score" type="number" placeholder="Ej. 5" />
                            </div>
                        </div>
                    </div>

                    <Separator />
                    
                    {/* SECCIÓN IV: IMPRESIÓN DIAGNÓSTICA */}
                    <div>
                        <h3 className="text-lg font-semibold text-gray-700 mb-4">IV. Impresión Diagnóstica (Provisional)</h3>
                         <div className="space-y-2">
                            <Label htmlFor="diagnostic-impression">Hipótesis Clínica Basada en la Evidencia Recopilada</Label>
                            <Textarea id="diagnostic-impression" name="diagnostic_impression" placeholder="Ej. 'Sintomatología depresiva y ansiosa severa, posiblemente exacerbada por déficit en memoria de trabajo y estresores académicos. Riesgo suicida activo a monitorear.'" />
                        </div>
                    </div>


                    <div className="flex justify-end pt-4">
                        <Button type="submit" className="bg-pink-600 hover:bg-pink-700 text-white font-bold">
                            Guardar Evaluación Clínica
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}
