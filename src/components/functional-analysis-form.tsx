'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

interface FunctionalAnalysisFormProps {
    studentName: string;
}

export default function FunctionalAnalysisForm({ studentName }: FunctionalAnalysisFormProps) {
    const [formData, setFormData] = useState({
        antecedent: '',
        behavior: '',
        consequence: '',
        cognitiveSchema: '',
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };
    
    const handleSelectChange = (value: string) => {
        setFormData(prev => ({ ...prev, consequence: value }));
    };

    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault();

        const analysisData = {
            studentId: 'S001', // ID de estudiante (debe ser dinámico en una app real)
            session_number: 1, // Número de sesión (debe ser dinámico)
            fecha_sesion: new Date().toISOString(),
            analisis_funcional: {
                antecedente_principal: formData.antecedent,
                conducta_problema: formData.behavior,
                funcion_mantenimiento: formData.consequence,
                creencia_esquema: formData.cognitiveSchema,
            }
        };

        // Simulación de llamada a saveFunctionalAnalysis(analysisData)
        console.log("Guardando en 'session_data':", analysisData);
        alert("Análisis Funcional guardado (simulación). Revisa la consola para ver los datos enviados.");
    };

    return (
        <Card className="shadow-lg">
            <CardHeader>
                <CardTitle>Módulo 2.3: Análisis Funcional (AF) y Formulación</CardTitle>
                <CardDescription>
                    Mapeo de contingencias (A-B-C) para generar la hipótesis funcional de la conducta problema.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* SECCIÓN I: MAPEO DE CONTINGENCIAS A-B-C */}
                    <div>
                        <h3 className="text-lg font-semibold text-gray-700 mb-4">I. Mapeo de Contingencias (A-B-C)</h3>
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="antecedent">A (Antecedente): ¿Qué situación precede a la conducta?</Label>
                                <Input id="antecedent" name="antecedent" placeholder="Ej. Recibir una mala calificación, discusión familiar" value={formData.antecedent} onChange={handleInputChange} required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="behavior">B (Conducta Problema): ¿Cuál es el comportamiento a modificar?</Label>
                                <Input id="behavior" name="behavior" placeholder="Ej. Aislamiento social, procrastinación, evitación de tareas" value={formData.behavior} onChange={handleInputChange} required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="consequence">C (Consecuencia/Función): ¿Cuál es el efecto inmediato?</Label>
                                 <Select onValueChange={handleSelectChange} required>
                                    <SelectTrigger id="consequence">
                                        <SelectValue placeholder="Selecciona la función de la conducta..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Refuerzo Negativo (Escape/Evitación)">Refuerzo Negativo (Escape/Evitación)</SelectItem>
                                        <SelectItem value="Refuerzo Positivo (Ganancia/Atención)">Refuerzo Positivo (Ganancia/Atención)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>

                    <Separator />

                    {/* SECCIÓN II: FORMULACIÓN COGNITIVA */}
                    <div>
                        <h3 className="text-lg font-semibold text-gray-700 mb-4">II. Formulación Cognitiva</h3>
                        <div className="space-y-2">
                             <Label htmlFor="cognitive-schema">Creencia o Esquema Cognitivo Subyacente</Label>
                            <Textarea
                                id="cognitive-schema"
                                name="cognitiveSchema"
                                placeholder="Ej. 'Debo ser perfecto en todo o soy un fracaso', 'Soy incompetente para la escuela', 'Si no lo intento, no puedo fallar'."
                                value={formData.cognitiveSchema}
                                onChange={handleInputChange}
                                className="min-h-[100px]"
                            />
                        </div>
                    </div>
                    
                    <div className="flex justify-end pt-4">
                        <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-bold">
                           Guardar Análisis Funcional
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}
