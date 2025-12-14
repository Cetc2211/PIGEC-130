'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { BookOpen, BrainCircuit, CheckSquare, Sparkles, AlertCircle, CheckCircle } from 'lucide-react';
import { EducationalAssessment } from '@/lib/store';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';

export default function EducationalAssessmentForm() {
    const [feedback, setFeedback] = useState<{ type: 'success' | 'triage' | 'alert', message: string }[]>([]);

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        
        const formData = new FormData(event.currentTarget);
        
        const chteScorePlanificacion = Number(formData.get('chte-planificacion'));
        const memoriaTrabajoPercentil = Number(formData.get('neuro-memoria'));
        const controlInhibitorioPercentil = Number(formData.get('neuro-inhibicion'));


        const dataToSave: Omit<EducationalAssessment, 'studentId' | 'fecha_evaluacion'> = {
            chteScores: {
                planificacion: chteScorePlanificacion,
                concentracion: Number(formData.get('chte-concentracion')),
                tomaDeApuntes: Number(formData.get('chte-apuntes')),
            },
            neuropsychScreening: {
                atencionPercentil: Number(formData.get('neuro-atencion')),
                memoriaTrabajoPercentil: memoriaTrabajoPercentil,
                controlInhibitorioPercentil: controlInhibitorioPercentil,
            }
        };

        const finalData = {
            studentId: formData.get('student-id') as string, // Asegúrate de tener un input para esto
            fecha_evaluacion: new Date().toISOString(),
            ...dataToSave
        };
        
        // Simulación de guardado
        console.log("Guardando Evaluación Educativa en 'educational_assessments':", finalData);

        let feedbackMessages: { type: 'success' | 'triage' | 'alert', message: string }[] = [{type: 'success', message: 'Evaluación Educativa guardada con éxito.'}];

        // Lógica de Triage Educativo (Cap. 6.2.2 y Cap. 9)
        if (chteScorePlanificacion < 40) {
            const triageMsg = `TRIAGE EDUCATIVO AUTOMÁTICO: Puntaje de Planificación (${chteScorePlanificacion}) es bajo. Se ha registrado la inscripción automática al micro-curso de 'Técnicas de Estudio'.`;
            console.log(triageMsg);
            feedbackMessages.push({ type: 'triage', message: triageMsg });
        }

        // Lógica de Alerta Cognitiva
        if (memoriaTrabajoPercentil < 25 || controlInhibitorioPercentil < 25) {
             const alertMsg = `ALERTA COGNITIVA: Percentiles bajos detectados (MT: ${memoriaTrabajoPercentil}, CI: ${controlInhibitorioPercentil}). Se ha enviado una notificación al Rol Clínico para una evaluación de Nivel 3.`;
            console.log(alertMsg);
            feedbackMessages.push({ type: 'alert', message: alertMsg });
        }
        
        setFeedback(feedbackMessages);

        // Limpiar el formulario o mostrar un mensaje de éxito
        (event.target as HTMLFormElement).reset();
        setTimeout(() => setFeedback([]), 15000);
    };

    return (
        <Card className="shadow-lg">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <CheckSquare />
                    Registrar Puntuaciones BEC-130
                </CardTitle>
                <CardDescription>
                    Ingrese los puntajes obtenidos por el estudiante en los instrumentos correspondientes.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-8">
                     <div className="space-y-2">
                        <Label htmlFor="student-id">ID del Estudiante (Matrícula)</Label>
                        <Input id="student-id" name="student-id" placeholder="Ej. S001" required />
                    </div>

                    <Separator />

                    {/* SECCIÓN II: CHTE */}
                    <div>
                        <h3 className="text-lg font.semibold text-gray-700 mb-4 flex items-center gap-2">
                            <Sparkles />
                            I. Cuestionario de Hábitos y Técnicas de Estudio (CHTE)
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                             <div className="space-y-2">
                                <Label htmlFor="chte-planificacion">Sub-escala Planificación</Label>
                                <Input id="chte-planificacion" name="chte-planificacion" type="number" placeholder="Ej. 35" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="chte-concentracion">Sub-escala Concentración</Label>
                                <Input id="chte-concentracion" name="chte-concentracion" type="number" placeholder="Ej. 50" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="chte-apuntes">Sub-escala Toma de Apuntes</Label>
                                <Input id="chte-apuntes" name="chte-apuntes" type="number" placeholder="Ej. 65" />
                            </div>
                        </div>
                    </div>

                    <Separator />

                    {/* SECCIÓN III: TAMIZAJE NEUROPSICOLÓGICO */}
                    <div>
                        <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2">
                            <BrainCircuit />
                            II. Tamizaje Neuropsicológico (Puntajes Normalizados)
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                             <div className="space-y-2">
                                <Label htmlFor="neuro-atencion">Atención (Percentil)</Label>
                                <Input id="neuro-atencion" name="neuro-atencion" type="number" placeholder="Ej. 60" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="neuro-memoria">Memoria de Trabajo (Percentil)</Label>
                                <Input id="neuro-memoria" name="neuro-memoria" type="number" placeholder="Ej. 45" />
                            </div>
                             <div className="space-y-2">
                                <Label htmlFor="neuro-inhibicion">Control Inhibitorio (Percentil)</Label>
                                <Input id="neuro-inhibicion" name="neuro-inhibicion" type="number" placeholder="Ej. 55" />
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end pt-4">
                        <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-bold">
                            Guardar Evaluación Educativa
                        </Button>
                    </div>

                    {feedback.length > 0 && (
                        <div className="mt-6 space-y-4">
                            {feedback.map((item, index) => (
                                <Alert key={index} variant={item.type === 'success' ? 'default' : 'destructive'} className={`${item.type === 'success' ? 'bg-green-50 border-green-300 text-green-800' : ''} ${item.type === 'triage' ? 'bg-yellow-50 border-yellow-300 text-yellow-800' : ''} ${item.type === 'alert' ? 'bg-red-50 border-red-300 text-red-800' : ''}`}>
                                    {item.type === 'success' && <CheckCircle className="h-4 w-4" />}
                                    {(item.type === 'triage' || item.type === 'alert') && <AlertCircle className="h-4 w-4" />}
                                    <AlertTitle>
                                        {item.type === 'success' && 'Éxito'}
                                        {item.type === 'triage' && 'Validación de Triage Educativo'}
                                        {item.type === 'alert' && 'Validación de Alerta Cognitiva'}
                                    </AlertTitle>
                                    <AlertDescription>
                                       {item.message}
                                    </AlertDescription>
                                </Alert>
                            ))}
                        </div>
                    )}
                </form>
            </CardContent>
        </Card>
    );
}
