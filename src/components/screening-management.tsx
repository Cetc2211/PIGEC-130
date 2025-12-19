'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link, Eye, FolderPlus, Send, CheckSquare } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import { Input } from './ui/input';
import { Label } from './ui/label';
import { useSession } from '@/context/SessionContext';
import { Separator } from './ui/separator';
import { Checkbox } from './ui/checkbox';
import { Badge } from './ui/badge';

const allScreenings = [
    {
        id: 'ficha-id',
        title: 'Ficha de Identificación del Estudiante',
        description: 'Recopila datos demográficos, sociofamiliares y de contacto.',
        chapter: 'Cap. 4.1',
        category: 'Ficha de Identificación',
        roles: ['Orientador', 'Clinico'],
    },
    {
        id: 'chte',
        title: 'CHTE (Hábitos y Técnicas de Estudio)',
        description: 'Mide las estrategias de planificación, concentración y toma de apuntes del estudiante.',
        chapter: 'Cap. 6.2.1',
        category: 'Habilidades Académicas',
        roles: ['Orientador', 'Clinico'],
    },
    {
        id: 'neuro-screen',
        title: 'Tamizaje Neuropsicológico (Gamificado)',
        description: 'Tarea interactiva para medir atención sostenida, memoria de trabajo y control inhibitorio.',
        chapter: 'Cap. 6.2.3',
        category: 'Habilidades Académicas',
        roles: ['Orientador', 'Clinico'],
    },
    {
        id: 'bdi-ii',
        title: 'BDI-II (Inventario de Depresión de Beck)',
        description: 'Evalúa la severidad de los síntomas depresivos. Instrumento clave para el Nivel 3.',
        chapter: 'Cap. 7.1',
        category: 'Socioemocionales',
        roles: ['Clinico'],
    },
    {
        id: 'bai',
        title: 'BAI (Inventario de Ansiedad de Beck)',
        description: 'Mide la severidad de los síntomas de ansiedad en adultos y adolescentes.',
        chapter: 'Cap. 7.1',
        category: 'Socioemocionales',
        roles: ['Clinico'],
    },
    {
        id: 'assist',
        title: 'ASSIST (Consumo de Sustancias)',
        description: 'Detecta el riesgo asociado al consumo de alcohol, tabaco y otras drogas.',
        chapter: 'Cap. 7.1',
        category: 'Socioemocionales',
        roles: ['Clinico'],
    },
];

const categories = [
    'Ficha de Identificación',
    'Habilidades Académicas',
    'Socioemocionales',
    'Orientación Educativa, Vocacional y Profesional',
];

export default function ScreeningManagement() {
    const { role } = useSession();
    const [selectedTests, setSelectedTests] = useState<string[]>([]);

    const toggleTestSelection = (testId: string) => {
        setSelectedTests(prev => 
            prev.includes(testId) 
                ? prev.filter(id => id !== testId) 
                : [...prev, testId]
        );
    };

    const availableScreenings = allScreenings.filter(s => s.roles.includes(role as string));
    const categorizedTests = categories.map(category => ({
        name: category,
        tests: availableScreenings.filter(test => test.category === category)
    })).filter(cat => cat.tests.length > 0);

    const handleCreateProcess = () => {
        if (selectedTests.length === 0) {
            alert("Por favor, seleccione al menos una prueba para crear un proceso de tamizaje.");
            return;
        }
        console.log("Creando carpeta de trabajo con las siguientes pruebas:", selectedTests);
        alert(`Proceso de tamizaje creado con ${selectedTests.length} prueba(s). Siguiente paso: Asignar a grupo.`);
    };


    return (
        <Card className="shadow-lg">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <CheckSquare />
                    Crear Proceso de Tamizaje
                </CardTitle>
                <CardDescription>
                    Seleccione uno o más instrumentos para crear una "carpeta de trabajo" y asignarla a un grupo o estudiante.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Columna de Selección de Pruebas */}
                    <div className="md:col-span-2 space-y-6">
                        {categorizedTests.map(category => (
                            <div key={category.name}>
                                <h3 className="text-lg font-semibold mb-3 text-gray-700">{category.name}</h3>
                                <div className="space-y-3">
                                    {category.tests.map(test => (
                                        <div key={test.id} className="flex items-center p-3 border rounded-md bg-gray-50/50 hover:bg-gray-50 transition-colors">
                                            <Checkbox
                                                id={test.id}
                                                checked={selectedTests.includes(test.id)}
                                                onCheckedChange={() => toggleTestSelection(test.id)}
                                                className="mr-4"
                                            />
                                            <div className="flex-1">
                                                <Label htmlFor={test.id} className="font-semibold text-base cursor-pointer">
                                                    {test.title}
                                                </Label>
                                                <p className="text-sm text-gray-500">{test.description}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Columna de Carpeta de Trabajo */}
                    <div className="md:col-span-1">
                        <div className="sticky top-8 border rounded-lg p-4 shadow-sm bg-white">
                            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                <FolderPlus />
                                Carpeta de Trabajo
                            </h3>
                            {selectedTests.length === 0 ? (
                                <p className="text-sm text-gray-500 text-center py-8">Seleccione las pruebas que desea añadir.</p>
                            ) : (
                                <div className="space-y-2">
                                    {selectedTests.map(testId => {
                                        const test = availableScreenings.find(t => t.id === testId);
                                        return test ? (
                                            <Badge key={testId} variant="secondary" className="w-full justify-start text-left py-2">
                                                {test.title}
                                            </Badge>
                                        ) : null;
                                    })}
                                </div>
                            )}
                            <Separator className="my-4" />
                            <Button 
                                onClick={handleCreateProcess} 
                                className="w-full" 
                                disabled={selectedTests.length === 0}
                            >
                                <Send className="mr-2" />
                                Crear Proceso de Tamizaje
                            </Button>
                            <p className="text-xs text-gray-500 mt-2">
                                El siguiente paso será asignar este proceso a un grupo de la lista.
                            </p>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
