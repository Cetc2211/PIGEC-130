'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link, BarChart2 } from "lucide-react";
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

const availableScreenings = [
    {
        id: 'bdi-ii',
        title: 'BDI-II (Inventario de Depresión de Beck)',
        description: 'Evalúa la severidad de los síntomas depresivos. Instrumento clave para la variable de riesgo X3.',
        chapter: 'Cap. 7.1'
    },
    {
        id: 'bai',
        title: 'BAI (Inventario de Ansiedad de Beck)',
        description: 'Mide la severidad de los síntomas de ansiedad en adultos y adolescentes.',
        chapter: 'Cap. 7.1'
    },
    {
        id: 'phq-9',
        title: 'PHQ-9 (Cuestionario de Salud del Paciente-9)',
        description: 'Instrumento de tamizaje rápido para la depresión, basado en los criterios del DSM-IV.',
        chapter: 'Cap. 7.1'
    },
    {
        id: 'gad-7',
        title: 'GAD-7 (Trastorno de Ansiedad Generalizada-7)',
        description: 'Herramienta de 7 ítems para el tamizaje de ansiedad generalizada.',
        chapter: 'Cap. 7.1'
    },
    {
        id: 'ceam-ii',
        title: 'CEAM II (Cuestionario de Exposición a Adversidad Temprana)',
        description: 'Evalúa la exposición a eventos adversos en la infancia y adolescencia, un factor de riesgo crítico.',
        chapter: 'Cap. 6.2'
    }
];

function GenerateLinkDialog({ screeningTitle }: { screeningTitle: string }) {
    const [groupName, setGroupName] = useState('');
    const [generatedLink, setGeneratedLink] = useState('');

    const handleGenerate = () => {
        if (!groupName) {
            alert("Por favor, especifica un grupo.");
            return;
        }
        // Simulación de la generación de un enlace único
        const uniqueId = Math.random().toString(36).substring(2, 10);
        const link = `https://escalaweb.app/survey/${screeningTitle.toLowerCase().replace(/ /g, '-')}/${uniqueId}?group=${encodeURIComponent(groupName)}`;
        setGeneratedLink(link);
        console.log(`Enlace generado para ${screeningTitle} - Grupo ${groupName}: ${link}`);
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(generatedLink);
        alert("Enlace copiado al portapapeles.");
    };

    return (
        <Dialog onOpenChange={() => { setGroupName(''); setGeneratedLink(''); }}>
            <DialogTrigger asChild>
                <Button className="w-full">
                    <Link className="mr-2 h-4 w-4" />
                    Generar Enlace para Grupo
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Generar Enlace de Tamizaje</DialogTitle>
                    <DialogDescription>
                        Crea un enlace único para que un grupo completo de estudiantes responda la encuesta "{screeningTitle}".
                    </DialogDescription>
                </DialogHeader>
                {!generatedLink ? (
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="group-name" className="text-right">
                                Grupo
                            </Label>
                            <Input
                                id="group-name"
                                value={groupName}
                                onChange={(e) => setGroupName(e.target.value)}
                                placeholder="Ej. 3B, 5A..."
                                className="col-span-3"
                            />
                        </div>
                    </div>
                ) : (
                     <div className="py-4 space-y-4">
                         <p className="text-sm text-gray-700">Enlace generado para el grupo <strong>{groupName}</strong>:</p>
                         <Input
                            readOnly
                            value={generatedLink}
                            className="bg-gray-100"
                        />
                        <Button onClick={copyToClipboard} className="w-full">Copiar Enlace</Button>
                    </div>
                )}
                <DialogFooter>
                    {!generatedLink && <Button type="button" onClick={handleGenerate}>Generar</Button>}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}


export default function ScreeningManagement() {
    return (
        <div className="space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                        <span>Panel de Resultados (Placeholder)</span>
                         <Button variant="outline" disabled>
                            <BarChart2 className="mr-2 h-4 w-4" />
                            Ver Resultados
                        </Button>
                    </CardTitle>
                    <CardDescription>
                        Esta sección mostrará los resultados consolidados de los tamizajes aplicados, permitiendo filtrar por grupo, fecha o nivel de riesgo para alimentar la variable X3 (Riesgo Socioemocional) del modelo SDTBE.
                    </CardDescription>
                </CardHeader>
            </Card>

            <div>
                <h2 className="text-2xl font-semibold mb-4 text-gray-700">Instrumentos de Tamizaje Disponibles</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {availableScreenings.map((screening) => (
                        <Card key={screening.id} className="flex flex-col">
                            <CardHeader>
                                <CardTitle>{screening.title}</CardTitle>
                                <CardDescription>{screening.chapter}</CardDescription>
                            </CardHeader>
                            <CardContent className="flex-grow">
                                <p className="text-sm text-gray-600">{screening.description}</p>
                            </CardContent>
                            <div className="p-6 pt-0">
                                <GenerateLinkDialog screeningTitle={screening.title} />
                            </div>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    );
}
