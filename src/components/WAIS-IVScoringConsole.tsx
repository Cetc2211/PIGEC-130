'use client';

import React, { useState } from 'react';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { BarChart, Calculator, AlertTriangle } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './ui/accordion';
import { Checkbox } from './ui/checkbox';

interface WAISScoringConsoleProps {
    studentAge: number;
}

const subtestsByDomain = {
    ICV: [
        { id: 'S', name: 'Semejanzas' },
        { id: 'V', name: 'Vocabulario' },
        { id: 'I', name: 'Información' },
        { id: 'Co', name: 'Comprensión', optional: true },
    ],
    IRP: [
        { id: 'C', name: 'Diseño con Cubos' },
        { id: 'M', name: 'Matrices' },
        { id: 'P', name: 'Puzles Visuales' },
        { id: 'FI', name: 'Figuras Incompletas', optional: true },
        { id: 'B', name: 'Balanzas', optional: true },
    ],
    IMT: [
        { id: 'D', name: 'Dígitos' },
        { id: 'A', name: 'Aritmética' },
        { id: 'LN', name: 'Letras y Números', optional: true },
    ],
    IVP: [
        { id: 'BS', name: 'Búsqueda de Símbolos' },
        { id: 'Cl', name: 'Claves' },
        { id: 'Ca', name: 'Cancelación', optional: true },
    ],
};


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

    // CIT se calcula sobre las 10 subpruebas principales
    const citSum = icv + irp + imt + ivp;

    const convertToCI = (sumOfScaled: number, numTests: number) => {
        if (sumOfScaled === 0) return 0;
        // Simulación muy simplificada. CI = 100 + 15 * ( (suma_escalares/num_tests) - 10 ) / 3
        const meanScaled = sumOfScaled / numTests;
        return Math.round(100 + 15 * (meanScaled - 10) / 3);
    };
    
    const scaleToComposite = (sum: number, numSubtests: number) => {
        if (sum === 0 && numSubtests > 0) return 40;
        if (sum === 0) return 0;
        // This is a highly simplified linear scaling for simulation.
        // A real implementation would use lookup tables based on age.
        const avg = sum / numSubtests;
        const composite = 50 + (avg - 7) * (50 / 8); // scales 1-19 avg to 50-150 range
        return Math.round(Math.max(40, Math.min(160, composite)));
    }


    return {
        ICV: scaleToComposite(icv, 3),
        IRP: scaleToComposite(irp, 3),
        IMT: scaleToComposite(imt, 2),
        IVP: scaleToComposite(ivp, 2),
        CIT: scaleToComposite(citSum, 10),
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
        Object.keys(rawScores).forEach(subtestId => {
            const rawScore = parseInt(rawScores[subtestId] || '0', 10);
            scaledScores[subtestId] = getScaledScore(rawScore);
        });

        const indexScores = calculateIndexScores(scaledScores);
        setResults({ scaledScores, indexScores });

        console.log("--- WAIS-IV Scoring (Simulación) ---", { studentAge, rawScores, scaledScores, indexScores });
    };

    return (
        <div className="w-full shadow-md border rounded-lg p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                    <h3 className="font-semibold text-lg">Protocolo de Registro Digital</h3>
                    <Accordion type="multiple" className="w-full">
                        {Object.entries(subtestsByDomain).map(([domain, tests]) => (
                            <AccordionItem value={domain} key={domain}>
                                <AccordionTrigger className="font-semibold">{domain}</AccordionTrigger>
                                <AccordionContent>
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Subprueba</TableHead>
                                                <TableHead>P. Bruta</TableHead>
                                                <TableHead>Tiempo (s)</TableHead>
                                                <TableHead>Errores</TableHead>
                                                <TableHead>Discont.</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {tests.map(subtest => (
                                                <TableRow key={subtest.id}>
                                                    <TableCell className="py-2">
                                                        <Label htmlFor={`wais-${subtest.id}`} className="text-sm">
                                                            {subtest.name}
                                                            {subtest.optional && <span className="text-xs text-gray-500"> (Op)</span>}
                                                        </Label>
                                                    </TableCell>
                                                    <TableCell className="py-2">
                                                        <Input
                                                            id={`wais-${subtest.id}`}
                                                            type="number"
                                                            value={rawScores[subtest.id] || ''}
                                                            onChange={e => handleScoreChange(subtest.id, e.target.value)}
                                                            placeholder="PB"
                                                            className="h-8 w-20"
                                                        />
                                                    </TableCell>
                                                     <TableCell className="py-2"><Input type="number" placeholder="s" className="h-8 w-20" /></TableCell>
                                                    <TableCell className="py-2"><Input type="number" placeholder="n" className="h-8 w-20" /></TableCell>
                                                    <TableCell className="py-2"><Checkbox /></TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>
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
