'use client';

import React, { useState } from 'react';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { BarChart, Calculator, AlertTriangle, FileLock2, ChevronLeft, ChevronRight } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Checkbox } from './ui/checkbox';
import { Textarea } from './ui/textarea';

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

const getScaledScore = (rawScore: number): number => {
    if (rawScore === 0) return 1;
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

    const citSubtestsIds = ['S', 'V', 'C', 'M', 'B', 'D', 'Cl'];
    const icv = createProfile("Comprensión Verbal (ICV)", scaleToComposite(getSum(['S', 'V']), 2));
    const ive = createProfile("Visoespacial (IVE)", scaleToComposite(getSum(['C', 'P']), 2));
    const irf = createProfile("Razonamiento Fluido (IRF)", scaleToComposite(getSum(['M', 'B']), 2));
    const imt = createProfile("Memoria de Trabajo (IMT)", scaleToComposite(getSum(['D', 'LN']), 2));
    const ivp = createProfile("Velocidad de Procesamiento (IVP)", scaleToComposite(getSum(['Cl', 'BS']), 2));
    const cit = createProfile("C.I. Total (CIT)", scaleToComposite(getSum(citSubtestsIds), citSubtestsIds.length));

    const compositeScores = [icv, ive, irf, imt, ivp, cit];

    const valoresCriticos = { 'ICV-IVE': 11.5, 'ICV-IRF': 10.8, 'IMT-IVP': 12.3, 'ICV-IMT': 11.2 };
    const discrepancies = [
        { pair: 'ICV - IVE', diff: icv.score - ive.score, significant: Math.abs(icv.score - ive.score) >= valoresCriticos['ICV-IVE'] },
        { pair: 'ICV - IRF', diff: icv.score - irf.score, significant: Math.abs(icv.score - irf.score) >= valoresCriticos['ICV-IRF'] },
        { pair: 'IMT - IVP', diff: imt.score - ivp.score, significant: Math.abs(imt.score - ivp.score) >= valoresCriticos['IMT-IVP'] },
        { pair: 'ICV - IMT', diff: icv.score - imt.score, significant: Math.abs(icv.score - imt.score) >= valoresCriticos['ICV-IMT'] },
    ];
    
    const meanPE = getSum(citSubtestsIds) / citSubtestsIds.length;
    const allSubtests = Object.values(subtestsByDomain).flat();
    const strengthsAndWeaknesses = citSubtestsIds.map(id => {
        const score = scaledScores[id] || 0;
        const diff = score - meanPE;
        let classification = '-';
        if (diff > 3) classification = 'Fortaleza (F)';
        if (diff < -3) classification = 'Debilidad (D)';
        const subtestInfo = allSubtests.find(t => t.id === id);
        return { name: subtestInfo?.name, score, diff: diff.toFixed(2), classification };
    }).filter(s => s.name);

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
        Object.values(subtestsByDomain).flat().forEach(subtest => {
            const rawScore = parseInt(rawScores[subtest.id] || '0', 10);
            scaledScores[subtest.id] = getScaledScore(rawScore);
        });

        const clinicalProfile = calculateClinicalProfile(scaledScores);
        setResults(clinicalProfile);

        console.log("--- WISC-V Scoring (Simulación Avanzada) ---", { studentAge, rawScores, scaledScores, clinicalProfile });
    };

    const handleFinalizeAndSeal = () => {
        console.log("--- SIMULACIÓN DE CIERRE SEGURO Y AUDITORÍA ---");

        // 1. Generación del Payload de Integridad
        const integrityPayload = {
            studentId: "S002_WISC", // Debería ser dinámico
            timestamp: new Date().toISOString(),
            rawResponses: rawScores,
            calculatedProfile: results,
            testVersion: "WISC-V"
        };
        console.log("1. Payload de Integridad (JSON) creado:", integrityPayload);

        // 2. Cálculo del Hash (Huella Digital)
        const hashSimulado = "a1b2c3d4e5f67890a1b2c3d4e5f67890a1b2c3d4e5f67890a1b2c3d4e5f67890"; // Simulación
        console.log(`2. Hash SHA-256 calculado: ${hashSimulado}`);

        // 3. Renderizado del PDF Institucional
        console.log("3. Renderizando PDF de auditoría con logo institucional (Blanco y Verde)...");
        console.log(`   - El pie de página contendrá el ID de Integridad: ${hashSimulado}`);
        
        // 4. Flujo de Almacenamiento
        console.log("4. Guardando PDF en Firebase Storage en '/expedientes_clínicos/auditoria/...'");
        console.log("   - Cambiando estado de la evaluación a 'LOCKED' en Firestore.");

        alert("CIERRE SEGURO (SIMULACIÓN):\n\nEl protocolo ha sido finalizado, sellado con Hash de integridad y guardado como evidencia de auditoría. El registro ya no es editable.");
    };

    return (
        <div className="w-full shadow-md border rounded-lg p-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Columna Izquierda: Protocolo y Resultados */}
                <div className="space-y-4">
                    <h3 className="font-semibold text-lg">Protocolo de Registro (Psicólogo)</h3>
                     <Accordion type="multiple" className="w-full">
                        {Object.entries(subtestsByDomain).map(([domain, tests]) => (
                            <AccordionItem value={domain} key={domain}>
                                <AccordionTrigger className="font-semibold">{domain}</AccordionTrigger>
                                <AccordionContent>
                                    <div className="space-y-4 p-2">
                                        <div className="p-3 bg-gray-100 rounded-md border">
                                            <p className="font-semibold text-sm">CONSIGNA (Script para el psicólogo):</p>
                                            <p className="text-sm text-gray-700 mt-1">"Ahora vamos a hacer algo diferente. Mira estas balanzas..."</p>
                                        </div>

                                        <div className="grid grid-cols-3 gap-4">
                                            <div className="col-span-2 space-y-4">
                                                <div className="space-y-2">
                                                    <Label htmlFor={`response-${domain}`} className="text-xs">Respuesta del Sujeto (Cualitativa)</Label>
                                                    <Textarea id={`response-${domain}`} placeholder="Anotar respuesta literal..." className="h-20" />
                                                </div>
                                                <div className="flex items-center gap-4">
                                                    <div className="space-y-2">
                                                        <Label htmlFor={`time-${domain}`} className="text-xs">Tiempo (s)</Label>
                                                        <Input id={`time-${domain}`} type="number" placeholder="s" className="h-8 w-20" />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label htmlFor={`score-${domain}`} className="text-xs">Puntaje</Label>
                                                        <Input id={`score-${domain}`} type="number" placeholder="0, 1, 2" className="h-8 w-20" />
                                                    </div>
                                                </div>
                                            </div>
                                             <div className="col-span-1">
                                                <p className="text-xs font-semibold mb-2">Miniatura de Estímulo:</p>
                                                <div className="bg-gray-200 aspect-square rounded-md flex items-center justify-center">
                                                    <p className="text-xs text-gray-500">Img. aquí</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex justify-between items-center mt-4">
                                            <Button variant="outline" size="sm"><ChevronLeft className="mr-2 h-4 w-4" /> Anterior</Button>
                                            <p className="text-xs text-gray-500">Ítem 3 de 27</p>
                                            <Button variant="outline" size="sm">Siguiente <ChevronRight className="ml-2 h-4 w-4" /></Button>
                                        </div>
                                    </div>
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>
                    <Button onClick={handleCalculate} className="w-full bg-blue-600 hover:bg-blue-700">
                        <Calculator className="mr-2" />
                        Calcular Puntuaciones (WISC-V)
                    </Button>
                     {results && (
                        <div className="space-y-8 pt-4">
                            <h3 className="font-semibold text-lg">Perfil de Puntuaciones (Calculado)</h3>
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
                                        {results.discrepancias.map(d => (
                                            <TableRow key={d.pair}>
                                                <TableCell>{d.pair}</TableCell>
                                                <TableCell>{d.diff.toFixed(2)}</TableCell>
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
                                                <TableCell className={s.classification.startsWith('F') ? 'font-bold text-green-600' : s.classification.startsWith('D') ? 'font-bold text-orange-600' : ''}>{s.classification}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                           <Button onClick={handleFinalizeAndSeal} variant="default" className="w-full bg-green-700 hover:bg-green-800 text-white font-bold">
                                <FileLock2 className="mr-2" />
                                Finalizar y Sellar Protocolo (Auditoría)
                            </Button>
                        </div>
                    )}
                </div>

                 {/* Columna Derecha: Visor de Estímulos */}
                <div className="space-y-6">
                    <h3 className="font-semibold text-lg">Visor de Estímulos (Alumno)</h3>
                    <div className="flex items-center justify-center h-full p-8 bg-gray-900 text-white rounded-md border-dashed border-2 border-gray-400">
                        <p className="text-center text-lg">El Visor de Estímulos para el Alumno aparecerá aquí.<br/> (Modo Espejo Sincronizado)</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
