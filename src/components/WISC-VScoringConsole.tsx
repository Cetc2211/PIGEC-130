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

// Simulación de la función getScaledScore
const getScaledScore = (rawScore: number): number => {
    if (rawScore === 0) return 1;
    // Conversión lineal simplificada para simulación.
    const scaled = Math.round((rawScore / 50) * 18) + 1; 
    return Math.max(1, Math.min(19, scaled));
};

const getDescriptiveClassification = (score: number) => {
    if (score >= 130) return "Muy Superior";
    if (score >= 120) return "Superior";
    if (score >= 110) return "Promedio Alto";
    if (score >= 90) return "Promedio";
    if (score >= 80) return "Promedio Bajo";
    if (score >= 70) return "Limítrofe";
    return "Extremadamente Bajo";
};

// Simulación del motor de cálculo de índices y análisis
const calculateClinicalProfile = (scaledScores: { [key: string]: number }) => {
    const getSum = (ids: string[]) => ids.reduce((sum, id) => sum + (scaledScores[id] || 0), 0);

    const scaleToComposite = (sum: number, numSubtests: number) => {
        if (numSubtests === 0 || sum === 0) return 40;
        const meanScaled = sum / numSubtests;
        return Math.round(100 + 15 * (meanScaled - 10) / 3);
    };
    
    const createProfile = (name: string, score: number) => ({
        name,
        score,
        percentile: Math.max(1, Math.min(99, Math.round(((score - 50) / 100) * 98) + 1)),
        confidenceInterval: `${score - 5}-${score + 5}`,
        classification: getDescriptiveClassification(score),
    });

    const icv = createProfile("Comprensión Verbal (ICV)", scaleToComposite(getSum(['S', 'V']), 2));
    const ive = createProfile("Visoespacial (IVE)", scaleToComposite(getSum(['C', 'P']), 2));
    const irf = createProfile("Razonamiento Fluido (IRF)", scaleToComposite(getSum(['M', 'B']), 2));
    const imt = createProfile("Memoria de Trabajo (IMT)", scaleToComposite(getSum(['D', 'LN']), 2));
    const ivp = createProfile("Velocidad de Procesamiento (IVP)", scaleToComposite(getSum(['Cl', 'BS']), 2));
    
    const mainSubtestsIds = ['S', 'V', 'C', 'M', 'B', 'D', 'Cl'];
    const citSum = getSum(mainSubtestsIds);
    const cit = createProfile("C.I. Total (CIT)", scaleToComposite(citSum, 7));

    const compositeScores = [icv, ive, irf, imt, ivp, cit];

    // --- Simulación de Análisis de Discrepancias ---
    const discrepancies = [
        { pair: 'ICV - IVE', diff: icv.score - ive.score, significant: Math.abs(icv.score - ive.score) > 12 },
        { pair: 'IRF - IMT', diff: irf.score - imt.score, significant: Math.abs(irf.score - imt.score) > 14 },
    ];
    
    // --- Simulación de Fortalezas y Debilidades ---
    const meanPE = citSum / mainSubtestsIds.length;
    const strengthsAndWeaknesses = mainSubtestsIds.map(id => {
        const score = scaledScores[id] || 0;
        const diff = score - meanPE;
        let classification = '-';
        if (diff > 3) classification = 'Fortaleza (F)';
        if (diff < -3) classification = 'Debilidad (D)';
        return {
            name: subtestsByDomain[Object.keys(subtestsByDomain).find(d => subtestsByDomain[d as keyof typeof subtestsByDomain].some(t => t.id === id))!]?.find(t => t.id === id)?.name,
            score,
            diff: diff.toFixed(2),
            classification,
        };
    });

    return { compositeScores, discrepancies, strengthsAndWeaknesses };
};


export default function WISCScoringConsole({ studentAge }: WISCScoringConsoleProps) {
    const [rawScores, setRawScores] = useState<{ [key: string]: string }>({});
    const [results, setResults] = useState<ReturnType<typeof calculateClinicalProfile> | null>(null);

    const handleScoreChange = (subtestId: string, value: string) => {
        setRawScores(prev => ({ ...prev, [subtestId]: value }));
    };

    const handleCalculate = () => {
        const scaledScores: { [key: string]: number } = {};
        Object.keys(rawScores).forEach(subtestId => {
            const rawScore = parseInt(rawScores[subtestId] || '0', 10);
            scaledScores[subtestId] = getScaledScore(rawScore);
        });

        const clinicalProfile = calculateClinicalProfile(scaledScores);
        setResults(clinicalProfile);

        console.log("--- WISC-V Scoring (Simulación Avanzada) ---", { studentAge, rawScores, scaledScores, clinicalProfile });
    };

    return (
        <div className="w-full shadow-md border rounded-lg p-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
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

                <div className="space-y-6">
                     <h3 className="font-semibold text-lg">Perfil de Puntuaciones (Calculado)</h3>
                    {results ? (
                        <div className="space-y-8">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Índice</TableHead>
                                        <TableHead>PC</TableHead>
                                        <TableHead>Percentil</TableHead>
                                        <TableHead>Clasificación</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {results.compositeScores.map(res => (
                                        <TableRow key={res.name} className={res.name === 'C.I. Total (CIT)' ? 'bg-gray-100 font-bold' : ''}>
                                            <TableCell>{res.name}</TableCell>
                                            <TableCell className="font-extrabold">{res.score}</TableCell>
                                            <TableCell>{res.percentile}</TableCell>
                                            <TableCell>{res.classification}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                            
                            <div>
                                <h4 className="font-semibold text-md mb-2">Análisis de Discrepancias</h4>
                                <Table>
                                    <TableHeader><TableRow><TableHead>Comparación</TableHead><TableHead>Diferencia</TableHead><TableHead>Significancia</TableHead></TableRow></TableHeader>
                                    <TableBody>
                                        {results.discrepancies.map(d => (
                                            <TableRow key={d.pair}>
                                                <TableCell>{d.pair}</TableCell>
                                                <TableCell>{d.diff}</TableCell>
                                                <TableCell className={d.significant ? 'font-bold text-red-600' : ''}>{d.significant ? 'Sí' : 'No'}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>

                             <div>
                                <h4 className="font-semibold text-md mb-2">Fortalezas y Debilidades Personales</h4>
                                <Table>
                                     <TableHeader><TableRow><TableHead>Subprueba</TableHead><TableHead>PE</TableHead><TableHead>Clasificación</TableHead></TableRow></TableHeader>
                                    <TableBody>
                                         {results.strengthsAndWeaknesses.map(s => (
                                            <TableRow key={s.name}>
                                                <TableCell>{s.name}</TableCell>
                                                <TableCell>{s.score}</TableCell>
                                                <TableCell className={s.classification.startsWith('F') ? 'text-green-600' : s.classification.startsWith('D') ? 'text-orange-600' : ''}>{s.classification}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>

                            <div className="p-3 bg-yellow-50 border border-yellow-300 rounded-md">
                                <p className="text-xs text-yellow-800 flex items-start gap-2">
                                    <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                                    <span>
                                        <strong>Nota de Simulación:</strong> Las Puntuaciones y análisis se basan en una conversión simplificada, no en las tablas normativas reales del WISC-V.
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

    