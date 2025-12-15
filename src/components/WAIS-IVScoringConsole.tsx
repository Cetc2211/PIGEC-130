'use client';

import React, { useState } from 'react';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { BarChart, Calculator, AlertTriangle } from 'lucide-react';

interface WAISScoringConsoleProps {
    studentAge: number;
}

const subtests = [
    // Comprensión Verbal
    { id: 'S', name: 'Semejanzas', index: 'ICV' },
    { id: 'V', name: 'Vocabulario', index: 'ICV' },
    { id: 'I', name: 'Información', index: 'ICV' },
    { id: 'Co', name: 'Comprensión', index: 'ICV', optional: true },
    // Razonamiento Perceptual
    { id: 'C', name: 'Diseño con Cubos', index: 'IRP' },
    { id: 'M', name: 'Matrices', index: 'IRP' },
    { id: 'P', name: 'Puzles Visuales', index: 'IRP' },
    { id: 'FI', name: 'Figuras Incompletas', index: 'IRP', optional: true },
    { id: 'B', name: 'Balanzas', index: 'IRP', optional: true },
    // Memoria de Trabajo
    { id: 'D', name: 'Dígitos', index: 'IMT' },
    { id: 'A', name: 'Aritmética', index: 'IMT' },
    { id: 'LN', name: 'Letras y Números', index: 'IMT', optional: true },
    // Velocidad de Procesamiento
    { id: 'BS', name: 'Búsqueda de Símbolos', index: 'IVP' },
    { id: 'Cl', name: 'Claves', index: 'IVP' },
    { id: 'Ca', name: 'Cancelación', index: 'IVP', optional: true },
];

const getScaledScore = (rawScore: number): number => {
    if (rawScore === 0) return 1;
    // Simulación muy simplificada
    const scaled = Math.round((rawScore / 30) * 19); 
    return Math.max(1, Math.min(19, scaled));
};

const calculateIndexScores = (scaledScores: { [key: string]: number }) => {
    const getSum = (ids: string[]) => ids.reduce((sum, id) => sum + (scaledScores[id] || 0), 0);

    const icv = getSum(['S', 'V', 'I']);
    const irp = getSum(['C', 'M', 'P']);
    const imt = getSum(['D', 'A']);
    const ivp = getSum(['BS', 'Cl']);

    // Suma de 10 subpruebas principales para el CIT
    const citSum = icv + irp + imt + ivp;

    const convertToCI = (sumOfScaled: number, numTests: number) => {
        if (sumOfScaled === 0) return 0;
        const meanScaled = sumOfScaled / numTests;
        return Math.round(100 + (meanScaled - 10) * 5); // Simulación simplificada
    };

    return {
        ICV: convertToCI(icv, 3),
        IRP: convertToCI(irp, 3),
        IMT: convertToCI(imt, 2),
        IVP: convertToCI(ivp, 2),
        CIT: convertToCI(citSum, 10),
    };
};

export default function WAISScoringConsole({ studentAge }: WAISScoringConsoleProps) {
    const [rawScores, setRawScores] = useState<{ [key: string]: string }>({});
    const [results, setResults] = useState<{ scaledScores: { [key: string]: number }, indexScores: any } | null>(null);

    const handleScoreChange = (subtestId: string, value: string) => {
        setRawScores(prev => ({ ...prev, [subtestId]: value }));
    };

    const handleCalculate = () => {
        const scaledScores: { [key: string]: number } = {};
        for (const subtest of subtests) {
            const rawScore = parseInt(rawScores[subtest.id] || '0', 10);
            scaledScores[subtest.id] = getScaledScore(rawScore);
        }

        const indexScores = calculateIndexScores(scaledScores);
        setResults({ scaledScores, indexScores });

        console.log("--- WAIS-IV Scoring (Simulación) ---");
        console.log("Edad:", studentAge);
        console.log("Puntuaciones Brutas:", rawScores);
        console.log("Puntuaciones Escalares (Calculadas):", scaledScores);
        console.log("Puntuaciones de Índices y CIT (Calculados):", indexScores);
    };

    return (
        <div className="w-full shadow-md border rounded-lg p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                    <h3 className="font-semibold text-lg">Entrada de Puntuaciones Brutas</h3>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-4 max-h-[400px] overflow-y-auto pr-2">
                        {subtests.map(subtest => (
                            <div key={subtest.id} className="space-y-1">
                                <Label htmlFor={`wais-${subtest.id}`} className="text-sm">
                                    {subtest.name} ({subtest.id})
                                    {subtest.optional && <span className="text-xs text-gray-500"> (Op)</span>}
                                </Label>
                                <Input
                                    id={`wais-${subtest.id}`}
                                    type="number"
                                    value={rawScores[subtest.id] || ''}
                                    onChange={e => handleScoreChange(subtest.id, e.target.value)}
                                    placeholder="PB"
                                    className="h-9"
                                />
                            </div>
                        ))}
                    </div>
                    <Button onClick={handleCalculate} className="w-full bg-purple-600 hover:bg-purple-700">
                        <Calculator className="mr-2" />
                        Calcular Puntuaciones (WAIS-IV)
                    </Button>
                </div>
                <div className="space-y-6">
                    <h3 className="font-semibold text-lg">Perfil de Puntuaciones (Calculado)</h3>
                    {results ? (
                        <div className="space-y-4">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Índice</TableHead>
                                        <TableHead className="text-right">Puntuación</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    <TableRow><TableCell>Comprensión Verbal (ICV)</TableCell><TableCell className="text-right font-bold">{results.indexScores.ICV}</TableCell></TableRow>
                                    <TableRow><TableCell>Razonamiento Perceptual (IRP)</TableCell><TableCell className="text-right font-bold">{results.indexScores.IRP}</TableCell></TableRow>
                                    <TableRow><TableCell>Memoria de Trabajo (IMT)</TableCell><TableCell className="text-right font-bold">{results.indexScores.IMT}</TableCell></TableRow>
                                    <TableRow><TableCell>Velocidad de Procesamiento (IVP)</TableCell><TableCell className="text-right font-bold">{results.indexScores.IVP}</TableCell></TableRow>
                                    <TableRow className="bg-gray-100"><TableCell className="font-semibold">Coeficiente Intelectual Total (CIT)</TableCell><TableCell className="text-right font-extrabold text-lg">{results.indexScores.CIT}</TableCell></TableRow>
                                </TableBody>
                            </Table>
                            <div className="p-3 bg-yellow-50 border border-yellow-300 rounded-md">
                                <p className="text-xs text-yellow-800 flex items-start gap-2">
                                    <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                                    <span>
                                        <strong>Nota de Simulación:</strong> Las puntuaciones se basan en una conversión lineal simplificada, no en las tablas normativas reales del WAIS-IV.
                                    </span>
                                </p>
                            </div>
                            <Button variant="outline" className="w-full">
                                <BarChart className="mr-2" />
                                Generar Perfil Gráfico y Exportar
                            </Button>
                        </div>
                    ) : (
                        <div className="flex items-center justify-center h-full p-8 bg-gray-50 rounded-md border-dashed border-2">
                            <p className="text-sm text-gray-500">Los resultados aparecerán aquí.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
