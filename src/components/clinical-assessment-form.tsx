'use client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

export default function ClinicalAssessmentForm() {

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        
        const formData = new FormData(event.currentTarget);
        const data = {
            studentId: 'S001', // ID de estudiante (debe ser dinámico en una app real)
            fecha_evaluacion: new Date().toISOString(),
            bdi_ii_score: Number(formData.get('bdi_score')),
            bai_score: Number(formData.get('bai_score')),
            ssi_score: Number(formData.get('ssi_score')),
            neuro_mt_score: Number(formData.get('mt_index')),
            neuro_as_score: Number(formData.get('as_index')),
            neuro_vp_score: Number(formData.get('vp_index')),
            assist_result: formData.get('assist_result'),
            self_harm_score: Number(formData.get('self_harm_score')),
        };

        // Simulación de llamada a saveClinicalAssessment(data)
        console.log("Guardando en 'clinical_assessments':", data);
        alert("Perfil Clínico actualizado (simulación). Los datos se han guardado en la consola.");
    };

    return (
        <Card className="shadow-lg">
            <CardHeader>
                <CardTitle>Módulo 2.1: Evaluación Clínica</CardTitle>
                <CardDescription>
                    Registro de puntajes de screening y tamizaje neuropsicológico.
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
                                <Label htmlFor="ssi-score">Puntuación Escala Ideación Suicida (SSI)</Label>
                                <Input id="ssi-score" name="ssi_score" type="number" placeholder="Ej. 10" />
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
