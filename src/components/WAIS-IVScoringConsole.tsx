'use client';

import React, { useState } from 'react';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { BarChart, Calculator, AlertTriangle, FileLock2, ChevronLeft, ChevronRight } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './ui/accordion';
import { Checkbox } from './ui/checkbox';
import { Textarea } from './ui/textarea';

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


// Simulación de la función getScaledScore
const getScaledScore = (rawScore: number): number => {
    if (rawScore === 0) return 1;
    // Esta es una conversión lineal simplificada, no basada en baremos reales.
    // Asume que un puntaje bruto máximo (ej. 30) corresponde a un puntaje escalar de 19.
    const scaled = Math.round((rawScore / 30) * 18) + 1; 
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

// Simulación del motor de cálculo de índices
const calculateIndexScores = (scaledScores: { [key: string]: number }) => {
    const getSum = (ids: string[]) => ids.reduce((sum, id) => sum + (scaledScores[id] || 0), 0);
    
    const scaleToComposite = (sum: number, numSubtests: number) => {
        if (numSubtests === 0 || sum === 0) return 40; // Puntaje mínimo si no hay datos
        const meanScaled = sum / numSubtests;
        // Simulación de conversión a PC (media 100, DE 15)
        return Math.round(100 + 15 * (meanScaled - 10) / 3);
    };

    const createProfile = (name: string, score: number) => {
        // Simulación muy aproximada del percentil
        const percentile = Math.round(((score - 50) / 100) * 98) + 1;
        const confidence = [score - 5, score + 5]; // Simulación IC 95%
        return {
            name,
            score,
            percentile: Math.max(1, Math.min(99, percentile)),
            confidenceInterval: `${confidence[0]}-${confidence[1]}`,
            classification: getDescriptiveClassification(score),
        };
    };
    
    // Suma de las subpruebas para cada índice del WAIS-IV
    const icvSum = getSum(['S', 'V', 'I']);
    const irpSum = getSum(['C', 'M', 'P']);
    const imtSum = getSum(['D', 'A']);
    const ivpSum = getSum(['BS', 'Cl']);
    
    const icv = scaleToComposite(icvSum, 3);
    const irp = scaleToComposite(irpSum, 3);
    const imt = scaleToComposite(imtSum, 2);
    const ivp = scaleToComposite(ivpSum, 2);

    // CIT se basa en 10 subpruebas principales
    const citSubtestsIds = ['S', 'V', 'I', 'C', 'M', 'P', 'D', 'A', 'BS', 'Cl'];
    const citSum = getSum(citSubtestsIds);
    const cit = scaleToComposite(citSum, citSubtestsIds.length);
    
    return [
        createProfile("Comprensión Verbal (ICV)", icv),
        createProfile("Razonamiento Perceptual (IRP)", irp),
        createProfile("Memoria de Trabajo (IMT)", imt),
        createProfile("Velocidad de Procesamiento (IVP)", ivp),
        createProfile("C.I. Total (CIT)", cit),
    ];
};

export default function WAISScoringConsole({ studentAge }: WAISScoringConsoleProps) {
    const [rawScores, setRawScores] = useState<{ [key: string]: string }>({});
    const [results, setResults] = useState<ReturnType<typeof calculateIndexScores> | null>(null);

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
        setResults(indexScores);

        console.log("--- WAIS-IV Scoring (Simulación) ---", { studentAge, rawScores, scaledScores, indexScores });
    };

    const handleFinalizeAndSeal = () => {
        console.log("--- SIMULACIÓN DE CIERRE SEGURO Y AUDITORÍA ---");

        // 1. Generación del Payload de Integridad
        const integrityPayload = {
            studentId: "S001_WAIS", // Debería ser dinámico
            timestamp: new Date().toISOString(),
            rawResponses: rawScores,
            calculatedProfile: results,
            testVersion: "WAIS-IV"
        };
        console.log("1. Payload de Integridad (JSON) creado:", integrityPayload);

        // 2. Cálculo del Hash (Huella Digital)
        const hashSimulado = "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"; // Hash de un string vacío para simulación
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
                    <h3 className="font-semibold text-lg">Protocolo de Registro Digital (Psicólogo)</h3>
                    <Accordion type="multiple" className="w-full">
                        {Object.entries(subtestsByDomain).map(([domain, tests]) => (
                            <AccordionItem value={domain} key={domain}>
                                <AccordionTrigger className="font-semibold">{domain}</AccordionTrigger>
                                <AccordionContent>
                                    <div className="space-y-4 p-2">
                                        <div className="p-3 bg-gray-100 rounded-md border">
                                            <p className="font-semibold text-sm">CONSIGNA (Script para el psicólogo):</p>
                                            <p className="text-sm text-gray-700 mt-1">"Ahora vamos a hacer algo diferente. Mira estos cubos..."</p>
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
                                            <p className="text-xs text-gray-500">Ítem 5 de 14</p>
                                            <Button variant="outline" size="sm">Siguiente <ChevronRight className="ml-2 h-4 w-4" /></Button>
                                        </div>
                                    </div>
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>
                    <Button onClick={handleCalculate} className="w-full bg-purple-600 hover:bg-purple-700">
                        <Calculator className="mr-2" />
                        Calcular Puntuaciones (WAIS-IV)
                    </Button>
                     {results && (
                         <div className="space-y-4 pt-4">
                            <h3 className="font-semibold text-lg">Perfil de Puntuaciones (Calculado)</h3>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Índice</TableHead>
                                        <TableHead>PC</TableHead>
                                        <TableHead>Percentil</TableHead>
                                        <TableHead>IC (95%)</TableHead>
                                        <TableHead>Clasificación</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {results.map(res => (
                                        <TableRow key={res.name} className={res.name === 'C.I. Total (CIT)' ? 'bg-gray-100 font-bold' : ''}>
                                            <TableCell>{res.name}</TableCell>
                                            <TableCell className="font-extrabold">{res.score}</TableCell>
                                            <TableCell>{res.percentile}</TableCell>
                                            <TableCell>{res.confidenceInterval}</TableCell>
                                            <TableCell>{res.classification}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
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
                     <div className="p-3 bg-yellow-50 border border-yellow-300 rounded-md mt-auto">
                        <p className="text-xs text-yellow-800 flex items-start gap-2">
                            <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                            <span>
                                <strong>Nota de Simulación:</strong> Las puntuaciones se basan en una conversión lineal simplificada, no en las tablas normativas reales del WAIS-IV.
                            </span>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
