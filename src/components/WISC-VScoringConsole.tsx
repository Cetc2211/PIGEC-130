'use client';

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { BarChart, Calculator, BrainCircuit, AlertTriangle } from 'lucide-react';
import { Separator } from './ui/separator';

interface WISCScoringConsoleProps {
    studentAge: number;
}

const subtests = [
    // Comprensión Verbal
    { id: 'S', name: 'Semejanzas', index: 'ICV' },
    { id: 'V', name: 'Vocabulario', index: 'ICV' },
    { id: 'I', name: 'Información', index: 'ICV' },
    { id: 'Co', name: 'Comprensión', index: 'ICV' },
    // Visoespacial
    { id: 'C', name: 'Cubos', index: 'IVE' },
    { id: 'P', name: 'Puzles Visuales', index: 'IVE' },
    // Razonamiento Fluido
    { id: 'M', name: 'Matrices', index: 'IRF' },
    { id: 'B', name: 'Balanzas', index: 'IRF' },
    { id: 'A', name: 'Aritmética', index: 'IRF' },
    // Memoria de Trabajo
    { id: 'D', name: 'Dígitos', index: 'IMT' },
    { id: 'LN', name: 'Letras y Números', index: 'IMT' },
    // Velocidad de Procesamiento
    { id: 'Cl', name: 'Claves', index: 'IVP' },
    { id: 'BS', name: 'Búsqueda de Símbolos', index: 'IVP' },
    { id: 'Ca', name: 'Cancelación', index: 'IVP' },
];

// --- SIMULACIÓN DE LÓGICA DE CÁLCULO ---
// En una app real, esto estaría en un backend y consultaría tablas normativas completas.
const getScaledScore = (rawScore: number, subtestId: string, age: number): number => {
    // Esta es una simulación MUY simplificada.
    // La puntuación escalar real depende de tablas normativas por edad.
    if (rawScore === 0) return 1;
    // Simulación: aprox. un tercio de la puntuación bruta máxima como puntuación escalar 10.
    const maxRawScores: { [key: string]: number } = { 'S': 44, 'V': 68, 'C': 68, 'M': 35, 'D': 54, 'Cl': 119 };
    const maxRaw = maxRawScores[subtestId] || 50;
    let scaled = Math.round((rawScore / maxRaw) * 19);
    return Math.max(1, Math.min(19, scaled));
};

const calculateIndexScores = (scaledScores: { [key: string]: number }) => {
    const getSum = (ids: string[]) => ids.reduce((sum, id) => sum + (scaledScores[id] || 0), 0);

    const icv = getSum(['S', 'V']);
    const ive = getSum(['C', 'P']);
    const irf = getSum(['M', 'B']);
    const imt = getSum(['D', 'LN']);
    const ivp = getSum(['Cl', 'BS']);

    const cit = icv + ive + irf + imt + ivp;

    // Simulación MUY simplificada de conversión a CI (media 100, DE 15)
    const convertToCI = (sumOfScaled: number, numTests: number) => {
        if (sumOfScaled === 0) return 0;
        const meanScaled = sumOfScaled / numTests;
        return Math.round(100 + (meanScaled - 10) * 3 * numTests / 2);
    };

    return {
        ICV: convertToCI(icv, 2),
        IVE: convertToCI(ive, 2),
        IRF: convertToCI(irf, 2),
        IMT: convertToCI(imt, 2),
        IVP: convertToCI(ivp, 2),
        CIT: convertToCI(cit, 7) // CIT se basa en 7 subpruebas principales
    };
};
// --- FIN DE SIMULACIÓN ---


export default function WISCScoringConsole({ studentAge }: WISCScoringConsoleProps) {
    const [rawScores, setRawScores] = useState<{ [key: string]: string }>({});
    const [results, setResults] = useState<{ scaledScores: { [key: string]: number }, indexScores: any } | null>(null);

    const handleScoreChange = (subtestId: string, value: string) => {
        setRawScores(prev => ({ ...prev, [subtestId]: value }));
    };

    const handleCalculate = () => {
        const scaledScores: { [key: string]: number } = {};
        for (const subtest of subtests) {
            const rawScore = parseInt(rawScores[subtest.id] || '0', 10);
            scaledScores[subtest.id] = getScaledScore(rawScore, subtest.id, studentAge);
        }

        const indexScores = calculateIndexScores(scaledScores);
        setResults({ scaledScores, indexScores });

        console.log("--- WISC-V Scoring (Simulación) ---");
        console.log("Edad del estudiante:", studentAge);
        console.log("Puntuaciones Brutas:", rawScores);
        console.log("Puntuaciones Escalares (Calculadas):", scaledScores);
        console.log("Puntuaciones de Índices y CIT (Calculados):", indexScores);
    };

    return (
        <Card className="w-full shadow-md">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <BrainCircuit />
                    Consola de Calificación WISC-V
                </CardTitle>
                <CardDescription>
                    Ingrese las Puntuaciones Brutas (PB) por subprueba. El sistema calculará las Puntuaciones Escalares (PE) y los Índices correspondientes a la edad de {studentAge} años.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Columna de Captura de Datos */}
                    <div className="space-y-6">
                        <h3 className="font-semibold text-lg">Entrada de Puntuaciones Brutas</h3>
                        <div className="grid grid-cols-2 gap-x-4 gap-y-4 max-h-[400px] overflow-y-auto pr-2">
                            {subtests.map(subtest => (
                                <div key={subtest.id} className="space-y-1">
                                    <Label htmlFor={subtest.id} className="text-sm">{subtest.name} ({subtest.id})</Label>
                                    <Input
                                        id={subtest.id}
                                        type="number"
                                        value={rawScores[subtest.id] || ''}
                                        onChange={e => handleScoreChange(subtest.id, e.target.value)}
                                        placeholder="PB"
                                        className="h-9"
                                    />
                                </div>
                            ))}
                        </div>
                        <Button onClick={handleCalculate} className="w-full bg-blue-600 hover:bg-blue-700">
                            <Calculator className="mr-2" />
                            Calcular Puntuaciones
                        </Button>
                    </div>

                    {/* Columna de Resultados */}
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
                                        <TableRow><TableCell>Visoespacial (IVE)</TableCell><TableCell className="text-right font-bold">{results.indexScores.IVE}</TableCell></TableRow>
                                        <TableRow><TableCell>Razonamiento Fluido (IRF)</TableCell><TableCell className="text-right font-bold">{results.indexScores.IRF}</TableCell></TableRow>
                                        <TableRow><TableCell>Memoria de Trabajo (IMT)</TableCell><TableCell className="text-right font-bold">{results.indexScores.IMT}</TableCell></TableRow>
                                        <TableRow><TableCell>Velocidad de Procesamiento (IVP)</TableCell><TableCell className="text-right font-bold">{results.indexScores.IVP}</TableCell></TableRow>
                                        <TableRow className="bg-gray-100"><TableCell className="font-semibold">Coeficiente Intelectual Total (CIT)</TableCell><TableCell className="text-right font-extrabold text-lg">{results.indexScores.CIT}</TableCell></TableRow>
                                    </TableBody>
                                </Table>

                                <div className="p-3 bg-yellow-50 border border-yellow-300 rounded-md">
                                    <p className="text-xs text-yellow-800 flex items-start gap-2">
                                        <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                                        <span>
                                            <strong>Nota de Simulación:</strong> Las Puntuaciones Escalares y de Índice se basan en una conversión lineal simplificada, no en las tablas normativas reales del WISC-V. El propósito es demostrar el flujo de trabajo de calificación automatizada.
                                        </span>
                                    </p>
                                </div>
                                <Button variant="outline" className="w-full">
                                    <BarChart className="mr-2"/>
                                    Generar Perfil Gráfico y Exportar
                                </Button>
                            </div>
                        ) : (
                            <div className="flex items-center justify-center h-full p-8 bg-gray-50 rounded-md border-dashed border-2">
                                <p className="text-sm text-gray-500">Los resultados aparecerán aquí después del cálculo.</p>
                            </div>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
