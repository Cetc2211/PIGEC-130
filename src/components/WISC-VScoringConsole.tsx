'use client';

import React, { useState } from 'react';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { BarChart, Calculator, AlertTriangle } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Checkbox } from './ui/checkbox';

interface WISCScoringConsoleProps {
    studentAge: number;
}

const subtestsByDomain = {
    ICV: [
        { id: 'S', name: 'Semejanzas' },
        { id: 'V', name: 'Vocabulario' },
        { id: 'I', name: 'Información', optional: true },
        { id: 'Co', name: 'Comprensión', optional: true },
    ],
    IVE: [
        { id: 'C', name: 'Cubos' },
        { id: 'P', name: 'Puzles Visuales' },
    ],
    IRF: [
        { id: 'M', name: 'Matrices' },
        { id: 'B', name: 'Balanzas' },
        { id: 'A', name: 'Aritmética', optional: true },
    ],
    IMT: [
        { id: 'D', name: 'Dígitos' },
        { id: 'LN', name: 'Letras y Números' },
    ],
    IVP: [
        { id: 'Cl', name: 'Claves' },
        { id: 'BS', name: 'Búsqueda de Símbolos' },
        { id: 'Ca', name: 'Cancelación', optional: true },
    ]
};

// --- SIMULACIÓN DE LÓGICA DE CÁLCULO ---
const getScaledScore = (rawScore: number): number => {
    // Simulación simplificada. Una app real buscaría en una tabla de baremos por edad.
    if (rawScore === 0) return 1;
    const scaled = Math.round((rawScore / 50) * 19); 
    return Math.max(1, Math.min(19, scaled));
};

const calculateIndexScores = (scaledScores: { [key: string]: number }) => {
    const getSum = (ids: string[]) => ids.reduce((sum, id) => sum + (scaledScores[id] || 0), 0);

    const icv = getSum(['S', 'V']);
    const ive = getSum(['C', 'P']);
    const irf = getSum(['M', 'B']);
    const imt = getSum(['D', 'LN']);
    const ivp = getSum(['Cl', 'BS']);
    
    // CIT se calcula sobre las 7 subpruebas principales del WISC-V
    const citSum = icv + ive + irf + getSum(['D']);

    // Simulación muy simplificada de conversión a CI.
    const scaleToComposite = (sum: number, numSubtests: number) => {
        if (sum === 0 && numSubtests > 0) return 40;
        if (sum === 0) return 0;
        const meanScaled = sum / numSubtests;
        return Math.round(100 + 15 * (meanScaled - 10) / 3);
    };

    return { 
        ICV: scaleToComposite(icv, 2), 
        IVE: scaleToComposite(ive, 2), 
        IRF: scaleToComposite(irf, 2), 
        IMT: scaleToComposite(imt, 2), 
        IVP: scaleToComposite(ivp, 2), 
        CIT: scaleToComposite(citSum, 7) 
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
        Object.keys(rawScores).forEach(subtestId => {
            const rawScore = parseInt(rawScores[subtestId] || '0', 10);
            scaledScores[subtestId] = getScaledScore(rawScore);
        });

        const indexScores = calculateIndexScores(scaledScores);
        setResults({ scaledScores, indexScores });

        console.log("--- WISC-V Scoring (Simulación) ---", { studentAge, rawScores, scaledScores, indexScores });
    };

    return (
        <div className="w-full shadow-md border rounded-lg p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Columna de Captura de Datos */}
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
                                                        <Label htmlFor={subtest.id} className="text-sm">
                                                          {subtest.name}
                                                          {subtest.optional && <span className="text-xs text-gray-500"> (Op)</span>}
                                                        </Label>
                                                    </TableCell>
                                                    <TableCell className="py-2"><Input id={subtest.id} type="number" value={rawScores[subtest.id] || ''} onChange={e => handleScoreChange(subtest.id, e.target.value)} placeholder="PB" className="h-8 w-20" /></TableCell>
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
                    <Button onClick={handleCalculate} className="w-full bg-blue-600 hover:bg-blue-700">
                        <Calculator className="mr-2" />
                        Calcular Puntuaciones (WISC-V)
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
                                        <strong>Nota de Simulación:</strong> Las Puntuaciones se basan en una conversión lineal simplificada, no en las tablas normativas reales del WISC-V.
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
        </div>
    );
}
