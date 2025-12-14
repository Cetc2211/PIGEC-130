'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "lucide-react";
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

const allScreenings = [
    {
        id: 'chte',
        title: 'CHTE (Hábitos y Técnicas de Estudio)',
        description: 'Mide las estrategias de planificación, concentración y toma de apuntes del estudiante.',
        chapter: 'Cap. 6.2.1',
        roles: ['Orientador', 'Clinico']
    },
    {
        id: 'neuro-screen',
        title: 'Tamizaje Neuropsicológico (Gamificado)',
        description: 'Tarea interactiva para medir atención sostenida, memoria de trabajo y control inhibitorio.',
        chapter: 'Cap. 6.2.3',
        roles: ['Orientador', 'Clinico']
    },
    {
        id: 'bdi-ii',
        title: 'BDI-II (Inventario de Depresión de Beck)',
        description: 'Evalúa la severidad de los síntomas depresivos. Instrumento clave para el Nivel 3.',
        chapter: 'Cap. 7.1',
        roles: ['Clinico']
    },
    {
        id: 'bai',
        title: 'BAI (Inventario de Ansiedad de Beck)',
        description: 'Mide la severidad de los síntomas de ansiedad en adultos y adolescentes.',
        chapter: 'Cap. 7.1',
        roles: ['Clinico']
    },
    {
        id: 'assist',
        title: 'ASSIST (Consumo de Sustancias)',
        description: 'Detecta el riesgo asociado al consumo de alcohol, tabaco y otras drogas.',
        chapter: 'Cap. 7.1',
        roles: ['Clinico']
    },
];

function GenerateLinkDialog({ screeningTitle }: { screeningTitle: string }) {
    const [groupName, setGroupName] = useState('');
    const [generatedLink, setGeneratedLink] = useState('');

    const handleGenerate = () => {
        if (!groupName) {
            alert("Por favor, especifica un grupo o ID de estudiante.");
            return;
        }
        // Simulación de la generación de un enlace único
        const uniqueId = Math.random().toString(36).substring(2, 10);
        const link = `https://escalaweb.app/survey/${screeningTitle.toLowerCase().replace(/ /g, '-')}/${uniqueId}?target=${encodeURIComponent(groupName)}`;
        setGeneratedLink(link);
        console.log(`Enlace generado para ${screeningTitle} - Grupo/ID ${groupName}: ${link}`);
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
                    Generar Enlace de Aplicación
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Generar Enlace de Tamizaje</DialogTitle>
                    <DialogDescription>
                        Crea un enlace único para que un grupo o individuo responda a "{screeningTitle}".
                    </DialogDescription>
                </DialogHeader>
                {!generatedLink ? (
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="group-name" className="text-right">
                                Grupo / ID
                            </Label>
                            <Input
                                id="group-name"
                                value={groupName}
                                onChange={(e) => setGroupName(e.target.value)}
                                placeholder="Ej. 3B, 5A, S001..."
                                className="col-span-3"
                            />
                        </div>
                    </div>
                ) : (
                     <div className="py-4 space-y-4">
                         <p className="text-sm text-gray-700">Enlace generado para <strong>{groupName}</strong>:</p>
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
    const { role } = useSession();
    const availableScreenings = allScreenings.filter(s => s.roles.includes(role as string));

    return (
        <div className="space-y-8">
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
