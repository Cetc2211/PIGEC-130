'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "./ui/textarea";
import { ClinicalAssessment } from "@/lib/store";
import { Sparkles, Brain, RefreshCw } from 'lucide-react';
import DiagnosticImpressionAI from './diagnostic-impression-ai';
import IntelligentRiskAlerts from './intelligent-risk-alerts';
import { DiagnosticImpressionInput, DiagnosticImpressionOutput } from '@/ai/flows/diagnostic-impression-flow';

interface EnhancedClinicalAssessmentFormProps {
    initialData?: ClinicalAssessment;
    academicData?: {
        attendanceRate: number;
        grade: number;
        activityRate: number;
        participationRate: number;
    };
}

export default function EnhancedClinicalAssessmentForm({ initialData, academicData }: EnhancedClinicalAssessmentFormProps) {
    const [formData, setFormData] = useState<DiagnosticImpressionInput>({
        studentName: initialData?.studentId || 'Estudiante',
        bdi_score: initialData?.bdi_ii_score,
        bai_score: initialData?.bai_score,
        beck_suicide_score: initialData?.riesgo_suicida_beck_score,
        neuro_mt_score: initialData?.neuro_mt_score,
        neuro_as_score: initialData?.neuro_as_score,
        neuro_vp_score: initialData?.neuro_vp_score,
        cognitive_load_context: initialData?.contexto_carga_cognitiva,
        assist_result: initialData?.assist_result,
        self_harm_score: initialData?.conducta_autolesiva_score,
    });

    const [generatedImpression, setGeneratedImpression] = useState<DiagnosticImpressionOutput | null>(null);
    const [showAI, setShowAI] = useState(false);

    const handleInputChange = (field: keyof DiagnosticImpressionInput, value: string | number) => {
        setFormData(prev => ({
            ...prev,
            [field]: typeof value === 'string' && !isNaN(Number(value)) ? Number(value) : value
        }));
    };

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const form = new FormData(event.currentTarget);
        const data: DiagnosticImpressionInput = {
            studentName: form.get('student_name') as string || 'Estudiante',
            bdi_score: Number(form.get('bdi_score')) || undefined,
            bai_score: Number(form.get('bai_score')) || undefined,
            beck_suicide_score: Number(form.get('beck_suicide_score')) || undefined,
            neuro_mt_score: Number(form.get('mt_index')) || undefined,
            neuro_as_score: Number(form.get('as_index')) || undefined,
            neuro_vp_score: Number(form.get('vp_index')) || undefined,
            cognitive_load_context: form.get('cognitive_load_context') as string || undefined,
            assist_result: form.get('assist_result') as string || undefined,
            self_harm_score: Number(form.get('self_harm_score')) || undefined,
        };

        setFormData(data);
        setShowAI(true);
    };

    const handleImpressionGenerated = (impression: DiagnosticImpressionOutput) => {
        setGeneratedImpression(impression);
    };

    return (
        <div className="space-y-6">
            <Card className="shadow-lg">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="flex items-center gap-2">
                                <Brain className="h-5 w-5 text-purple-600" />
                                Módulo 2.1: Evaluación Clínica Mejorada con IA
                            </CardTitle>
                            <CardDescription>
                                Registro de puntajes de screening con generación automática de impresión diagnóstica.
                            </CardDescription>
                        </div>
                        {showAI && (
                            <Button variant="outline" size="sm" onClick={() => setShowAI(!showAI)}>
                                <RefreshCw className="mr-2 h-4 w-4" />
                                {showAI ? 'Ocultar IA' : 'Mostrar IA'}
                            </Button>
                        )}
                    </div>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-8">
                        {/* SECCIÓN I: SCREENING EMOCIONAL */}
                        <div>
                            <h3 className="text-lg font-semibold text-gray-700 mb-4">I. Screening Emocional</h3>
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="bdi-score">Puntuación BDI-II (Depresión)</Label>
                                    <Input
                                        id="bdi-score"
                                        name="bdi_score"
                                        type="number"
                                        placeholder="Ej. 25 (0-63)"
                                        min={0}
                                        max={63}
                                        defaultValue={initialData?.bdi_ii_score}
                                        onChange={(e) => handleInputChange('bdi_score', e.target.value)}
                                    />
                                    <p className="text-xs text-gray-400">0-13: Mínimo | 14-19: Leve | 20-28: Moderado | 29+: Severo</p>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="bai-score">Puntuación BAI (Ansiedad)</Label>
                                    <Input
                                        id="bai-score"
                                        name="bai_score"
                                        type="number"
                                        placeholder="Ej. 21 (0-63)"
                                        min={0}
                                        max={63}
                                        defaultValue={initialData?.bai_score}
                                        onChange={(e) => handleInputChange('bai_score', e.target.value)}
                                    />
                                    <p className="text-xs text-gray-400">0-7: Mínima | 8-15: Leve | 16-25: Moderada | 26+: Severa</p>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="beck-suicide-score">Ideación Suicida (Beck)</Label>
                                    <Input
                                        id="beck-suicide-score"
                                        name="beck_suicide_score"
                                        type="number"
                                        placeholder="Ej. 10"
                                        min={0}
                                        defaultValue={initialData?.riesgo_suicida_beck_score}
                                        onChange={(e) => handleInputChange('beck_suicide_score', e.target.value)}
                                    />
                                    <p className="text-xs text-gray-400">0-3: Bajo | 4-8: Moderado | 9+: Alto</p>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="phq9-score">PHQ-9 (Depresión)</Label>
                                    <Input
                                        id="phq9-score"
                                        name="phq9_score"
                                        type="number"
                                        placeholder="Ej. 15 (0-27)"
                                        min={0}
                                        max={27}
                                    />
                                    <p className="text-xs text-gray-400">Opcional: Screening rápido de depresión</p>
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
                                    <Input
                                        id="mt-index"
                                        name="mt_index"
                                        type="number"
                                        placeholder="Ej. 85 (Puntaje estándar)"
                                        defaultValue={initialData?.neuro_mt_score}
                                        onChange={(e) => handleInputChange('neuro_mt_score', e.target.value)}
                                    />
                                    <p className="text-xs text-gray-400">Normal: 85-115 | Déficit: &lt;85</p>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="as-index">Índice Atención Sostenida (AS)</Label>
                                    <Input
                                        id="as-index"
                                        name="as_index"
                                        type="number"
                                        placeholder="Ej. 90"
                                        defaultValue={initialData?.neuro_as_score}
                                        onChange={(e) => handleInputChange('neuro_as_score', e.target.value)}
                                    />
                                    <p className="text-xs text-gray-400">Normal: 85-115 | Déficit: &lt;85</p>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="vp-index">Índice Velocidad de Procesamiento (VP)</Label>
                                    <Input
                                        id="vp-index"
                                        name="vp_index"
                                        type="number"
                                        placeholder="Ej. 80"
                                        defaultValue={initialData?.neuro_vp_score}
                                        onChange={(e) => handleInputChange('neuro_vp_score', e.target.value)}
                                    />
                                    <p className="text-xs text-gray-400">Normal: 85-115 | Déficit: &lt;85</p>
                                </div>
                            </div>
                            <div className="mt-6 space-y-2">
                                <Label htmlFor="cognitive-load-context">Contexto de Carga Cognitiva / Estrés</Label>
                                <Textarea
                                    id="cognitive-load-context"
                                    name="cognitive_load_context"
                                    placeholder="Describir situación actual que impacta el desempeño (ej. 'Exámenes finales', 'Conflicto familiar')."
                                    defaultValue={initialData?.contexto_carga_cognitiva}
                                />
                            </div>
                        </div>

                        <Separator />

                        {/* SECCIÓN III: CONDUCTAS DE RIESGO */}
                        <div>
                            <h3 className="text-lg font-semibold text-gray-700 mb-4">III. Conductas de Riesgo</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="assist-result">Resultado ASSIST (Consumo de Sustancias)</Label>
                                    <Input
                                        id="assist-result"
                                        name="assist_result"
                                        placeholder="Positivo / Negativo"
                                        defaultValue={initialData?.assist_result}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="self-harm-score">Puntaje Conductas Autolesivas (Frecuencia)</Label>
                                    <Input
                                        id="self-harm-score"
                                        name="self_harm_score"
                                        type="number"
                                        placeholder="Ej. 5"
                                        min={0}
                                        defaultValue={initialData?.conducta_autolesiva_score}
                                    />
                                </div>
                            </div>
                        </div>

                        <Separator />

                        {/* Botones de acción */}
                        <div className="flex justify-between pt-4">
                            <Button type="button" variant="outline" onClick={() => setShowAI(!showAI)}>
                                <Sparkles className="mr-2 h-4 w-4" />
                                {showAI ? 'Ocultar Análisis IA' : 'Generar Análisis con IA'}
                            </Button>
                            <Button type="submit" className="bg-pink-600 hover:bg-pink-700 text-white font-bold">
                                Guardar y Analizar
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>

            {/* Componentes de IA */}
            {showAI && (
                <div className="space-y-6">
                    {/* Alertas de Riesgo Inteligentes */}
                    {academicData && (
                        <IntelligentRiskAlerts
                            studentId={initialData?.studentId || 'S001'}
                            studentName={initialData?.studentId || 'Estudiante'}
                            academicData={academicData}
                            clinicalData={formData}
                        />
                    )}

                    {/* Impresión Diagnóstica con IA */}
                    <DiagnosticImpressionAI
                        clinicalData={formData}
                        onImpressionGenerated={handleImpressionGenerated}
                        existingImpression={initialData?.impresion_diagnostica}
                    />

                    {/* Mostrar impresión generada en el formulario */}
                    {generatedImpression && (
                        <Card className="border-purple-200 bg-purple-50/30">
                            <CardHeader>
                                <CardTitle className="text-lg">Impresión para Guardar en Expediente</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <Textarea
                                    name="diagnostic_impression"
                                    defaultValue={generatedImpression.primaryHypothesis}
                                    className="min-h-32"
                                />
                                <p className="text-xs text-gray-500 mt-2">
                                    Puede editar esta impresión antes de guardarla en el expediente.
                                </p>
                            </CardContent>
                        </Card>
                    )}
                </div>
            )}
        </div>
    );
}
