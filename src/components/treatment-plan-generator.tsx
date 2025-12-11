'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from './ui/separator';

interface TreatmentPlanGeneratorProps {
    studentName: string;
}

export default function TreatmentPlanGenerator({ studentName }: TreatmentPlanGeneratorProps) {
    const [plan, setPlan] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleGeneratePlan = async () => {
        setIsLoading(true);
        // Simulación de llamada a la API del Motor IA
        // En una implementación real, aquí se haría una petición a /generate-clinical-plan
        await new Promise(resolve => setTimeout(resolve, 1500));

        const generatedPlan = `
PLAN DE TRATAMIENTO NARRATIVO - SIMULACIÓN PARA ${studentName.toUpperCase()}
--------------------------------------------------------------------------

Párrafo 1 (Estabilización y Activación Conductual):
El objetivo inicial es la estabilización emocional y la re-activación conductual. Dada la función de la conducta problema (evitación/escape), se implementará un protocolo de Activación Conductual (AC) para romper el ciclo de inacción. Se establecerá una jerarquía de actividades académicas y sociales, comenzando con tareas de baja demanda (ej. revisar apuntes por 15 minutos) para generar una sensación de auto-eficacia. Se programará y monitoreará el compromiso con estas actividades para contrarrestar el aislamiento y la procrastinación.

Párrafo 2 (Intervención Cognitiva):
Paralelamente, se abordará el esquema cognitivo subyacente de "incompetencia". Se utilizarán técnicas de reestructuración cognitiva para desafiar la validez de la creencia "Si no lo intento, no puedo fallar". El objetivo es reemplazar esta regla verbal disfuncional por una más adaptativa, como "El esfuerzo es una oportunidad de aprendizaje, no una prueba de mi valía". Se registrarán los pensamientos automáticos negativos asociados a las tareas académicas para su posterior análisis.

Párrafo 3 (Monitoreo y Prevención de Recaídas):
El progreso será monitoreado semanalmente, evaluando el cumplimiento de las metas de activación y los cambios en las puntuaciones de ansiedad/depresión. Se establecerá un plan de prevención de recaídas que identifique las señales tempranas de evitación y desarrolle estrategias de afrontamiento proactivas (ej. técnica de "los 5 minutos" para iniciar tareas). El nivel de intervención se mantendrá en Nivel 2 Focalizado, con reevaluación en 4 semanas para determinar si es necesaria una escalada a Nivel 3.
        `.trim();

        setPlan(generatedPlan);
        setIsLoading(false);
    };

    const handleSavePlan = () => {
        // Simulación de guardado en la base de datos
        console.log("Plan guardado en el expediente:", plan);
        alert("Plan de Tratamiento guardado con éxito en el expediente del estudiante (simulación).");
    };

    return (
        <Card className="shadow-lg">
            <CardHeader>
                <CardTitle>Módulo 3: Generador de Plan de Tratamiento</CardTitle>
                <CardDescription>
                    Generar y refinar el plan de intervención inicial basado en la formulación del caso.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="flex justify-center">
                    <Button 
                        onClick={handleGeneratePlan} 
                        disabled={isLoading}
                        className="bg-green-600 hover:bg-green-700 text-white font-bold"
                    >
                        {isLoading ? 'Generando Plan...' : 'Generar Plan de Tratamiento (IA)'}
                    </Button>
                </div>

                {plan && (
                    <div className="space-y-4">
                        <Separator />
                        <div>
                            <h3 className="text-lg font-semibold text-gray-700 mb-2">Plan Clínico Narrativo (Editable)</h3>
                            <Textarea
                                value={plan}
                                onChange={(e) => setPlan(e.target.value)}
                                className="min-h-[300px] bg-white text-sm"
                                placeholder="El plan generado por la IA aparecerá aquí..."
                            />
                        </div>
                        <div className="flex justify-end">
                            <Button onClick={handleSavePlan} className="bg-purple-600 hover:bg-purple-700 text-white font-bold">
                                Guardar Plan al Expediente
                            </Button>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
