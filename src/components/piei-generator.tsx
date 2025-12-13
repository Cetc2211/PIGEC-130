'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { ClinicalAssessment } from '@/lib/store';
import { Lightbulb, BookOpen, ShieldCheck } from 'lucide-react';

interface PIEIGeneratorProps {
    clinicalData?: ClinicalAssessment;
}

// --- Algoritmo de Traducción (Simulación) ---
// Mapea hallazgos clínicos a instrucciones pedagógicas NO clínicas.
const translationMap: { [key: string]: { condition: (data: ClinicalAssessment) => boolean; instructions: { id: string, text: string }[] } } = {
    AjustesMetodologicos: {
        condition: (data) => data.neuro_mt_score < 85, // Memoria de Trabajo baja
        instructions: [
            { id: 'met_1', text: 'Entregar instrucciones de forma segmentada (un paso a la vez).' },
            { id: 'met_2', text: 'Utilizar apoyos visuales (diagramas, mapas conceptuales) para las tareas.' },
            { id: 'met_3', text: 'Confirmar la comprensión de las instrucciones pidiendo que las repita.' },
        ]
    },
    AjustesActivacion: {
        condition: (data) => data.bdi_ii_score > 20, // Síntomas depresivos significativos (apatía, anhedonia)
        instructions: [
            { id: 'act_1', text: 'Aplicar la "técnica de los 5 minutos" para iniciar tareas académicas.' },
            { id: 'act_2', text: 'Establecer metas de tarea muy pequeñas y concretas (ej. "leer 2 párrafos").' },
            { id: 'act_3', text: 'Permitir una pausa activa breve (2-3 min) entre bloques de trabajo.' },
        ]
    },
    AjustesAcceso: {
        condition: (data) => data.bai_score > 16, // Síntomas de ansiedad significativos
        instructions: [
            { id: 'acc_1', text: 'Permitir el uso de audífonos con música instrumental durante el trabajo individual.' },
            { id: 'acc_2', text: 'Ofrecer un espacio tranquilo y con menos estímulos para presentar exámenes.' },
        ]
    }
};

export default function PIEIGenerator({ clinicalData }: PIEIGeneratorProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [selectedInstructions, setSelectedInstructions] = useState<string[]>([]);

    const generatedSuggestions = useMemo(() => {
        if (!clinicalData) return [];
        
        let suggestions = [];
        for (const key in translationMap) {
            if (translationMap[key].condition(clinicalData)) {
                suggestions.push(...translationMap[key].instructions);
            }
        }
        return suggestions;
    }, [clinicalData]);

    const handleCheckboxChange = (instructionId: string) => {
        setSelectedInstructions(prev => 
            prev.includes(instructionId) 
                ? prev.filter(id => id !== instructionId) 
                : [...prev, instructionId]
        );
    };

    const handleFinalizePiei = () => {
        setIsLoading(true);
        const finalPlan = generatedSuggestions.filter(instr => selectedInstructions.includes(instr.id));
        
        console.log("--- CORTAFUEGOS ÉTICO ACTIVADO ---");
        console.log("Generando PIEI para Rol Orientador/Docente...");
        console.log("Datos Clínicos (Privados, no se envían):", clinicalData);
        console.log("Instrucciones Pedagógicas (Públicas, filtradas):", finalPlan);
        console.log("Guardando en 'piei_plans' (simulación):", {
            studentId: clinicalData?.studentId,
            approved_instructions: finalPlan,
            approved_at: new Date().toISOString(),
            approved_by: 'Rol Clínico'
        });
        
        setTimeout(() => {
            setIsLoading(false);
            alert("PIEI finalizado y enviado al Rol Orientador (simulación).");
        }, 1000);
    };

    return (
        <Card className="shadow-lg">
            <CardHeader>
                <CardTitle>Módulo 7: Generador de Plan de Intervención Educativa (PIEI)</CardTitle>
                <CardDescription>
                    Traducción de hallazgos clínicos a instrucciones pedagógicas para el personal de apoyo (Rol Orientador/Docente).
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-6">
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <h3 className="flex items-center gap-2 font-semibold text-blue-800">
                            <Lightbulb />
                            Sugerencias Generadas por el Algoritmo de Traducción
                        </h3>
                        <p className="text-sm text-blue-700 mt-2">
                           Basado en los datos clínicos, el sistema sugiere las siguientes intervenciones pedagógicas. Seleccione las que considere apropiadas.
                        </p>
                    </div>

                    {generatedSuggestions.length > 0 ? (
                        <div className="space-y-4">
                            {generatedSuggestions.map(instr => (
                                <div key={instr.id} className="flex items-center space-x-3 p-3 rounded-md bg-gray-50 border">
                                    <Checkbox
                                        id={instr.id}
                                        onCheckedChange={() => handleCheckboxChange(instr.id)}
                                        checked={selectedInstructions.includes(instr.id)}
                                    />
                                    <Label htmlFor={instr.id} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                        {instr.text}
                                    </Label>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-sm text-gray-500 italic text-center">No se generaron sugerencias automáticas basadas en los datos clínicos actuales.</p>
                    )}

                    <Separator />

                    <div className="flex justify-end">
                        <Button onClick={handleFinalizePiei} disabled={isLoading || selectedInstructions.length === 0}>
                            <ShieldCheck className="mr-2"/>
                            {isLoading ? 'Finalizando...' : 'Finalizar y Enviar PIEI'}
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

    