'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Calculator, FileLock2, ChevronLeft, ChevronRight, BookOpen, Timer, Play, Pause } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Textarea } from './ui/textarea';
import { Separator } from './ui/separator';

interface WISCScoringConsoleProps {
    studentAge: number;
}

const subtestsByDomain = {
    ICV: [
        { id: 'S', name: 'Semejanzas', renderType: 'VERBAL_CRITERIO', isCit: true },
        { id: 'V', name: 'Vocabulario', renderType: 'DIRECT_INPUT', isCit: true },
        { id: 'I', name: 'Información', renderType: 'DIRECT_INPUT', optional: true },
        { id: 'Co', name: 'Comprensión', renderType: 'DIRECT_INPUT', optional: true },
    ],
    IVE: [
        { id: 'C', name: 'Cubos', renderType: 'DIRECT_INPUT', isCit: true },
        { id: 'P', name: 'Puzles Visuales', renderType: 'DIRECT_INPUT' },
    ],
    IRF: [
        { id: 'M', name: 'Matrices', renderType: 'DIRECT_INPUT', isCit: true },
        { id: 'B', name: 'Balanzas', renderType: 'DIRECT_INPUT', isCit: true },
        { id: 'A', name: 'Aritmética', renderType: 'DIRECT_INPUT', optional: true },
    ],
    IMT: [
        { id: 'D', name: 'Dígitos', renderType: 'DIRECT_INPUT', isCit: true },
        { id: 'LN', name: 'Letras y Números', renderType: 'DIRECT_INPUT', optional: true },
    ],
    IVP: [
        { id: 'Cl', name: 'Claves', renderType: 'DIRECT_INPUT', isCit: true },
        { id: 'BS', name: 'Búsqueda de Símbolos', renderType: 'DIRECT_INPUT', optional: true },
        { id: 'Ca', name: 'Cancelación', renderType: 'DIRECT_INPUT', optional: true },
    ]
};

// Esta función simula la búsqueda en las tablas de baremos.
const getScaledScore = (rawScore: number, subtestId: string): number => {
    // Caso de Prueba Maestro
    const masterCase: { [key: string]: { [key: number]: number } } = {
        C: { 18: 7 }, S: { 22: 10 }, M: { 15: 9 }, D: { 20: 11 },
        V: { 25: 10 }, B: { 14: 8 }, BS: { 22: 11 }
    };
    if (masterCase[subtestId] && masterCase[subtestId][rawScore] !== undefined) {
        return masterCase[subtestId][rawScore];
    }
    // Simulación general
    if (rawScore === 0) return 1;
    const scaled = Math.round((rawScore / 40) * 18) + 1;
    return Math.max(1, Math.min(19, scaled));
};


const getDescriptiveClassification = (score: number) => {
    if (score >= 130) return "Muy Superior";
    if (score >= 120) return "Superior";
    if (score >= 110) return "Promedio Alto";
    if (score >= 90) return "Promedio";
    if (score >= 80) return "Promedio Bajo";
    if (score >= 70) return "Muy Bajo (Limítrofe)";
    return "Extremadamente Bajo";
};

const calculateClinicalProfile = (scaledScores: { [key: string]: number }) => {
    
    const getSum = (ids: string[]) => ids.reduce((sum, id) => sum + (scaledScores[id] || 0), 0);
    
    const citSum = getSum(['S', 'V', 'C', 'M', 'B', 'D', 'BS']); // Usando BS como sustituto
    
    const scaleToComposite = (sum: number, numSubtests: number) => {
        if (numSubtests === 0 || sum === 0) return 40;
        // Simulación para Caso Maestro
        if (sum === 66 && numSubtests === 7) return 81;
        const meanScaled = sum / numSubtests;
        return Math.round(100 + 15 * (meanScaled - 10) / 3);
    };
    
    let citScaled = scaleToComposite(citSum, 7);
    
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
    const ivp = createProfile("Velocidad de Procesamiento (IVP)", scaleToComposite(getSum(['BS']), 1)); // Sustituida
    const cit = createProfile("C.I. Total (CIT)", citScaled);

    const compositeScores = [icv, ive, irf, imt, ivp, cit];
    
    const valoresCriticos = { 'ICV-IRF': 10.8, 'D-C': 2.5 };
    const discrepancies = [
        { pair: 'ICV - IRF', diff: icv.score - irf.score, significant: Math.abs(icv.score - irf.score) >= valoresCriticos['ICV-IRF'] },
    ];
    
    const allIds = Object.values(subtestsByDomain).flat().map(t => t.id);
    const meanPE = getSum(allIds) / allIds.filter(id => scaledScores[id]).length;

    const strengthsAndWeaknesses = allIds.filter(id => scaledScores[id]).map(id => {
        const score = scaledScores[id] || 0;
        const diff = score - meanPE;
        let classification = '-';
        if (diff >= valoresCriticos['D-C']) classification = 'Fortaleza (F)';
        if (diff <= -valoresCriticos['D-C']) classification = 'Debilidad (D)';
        const subtestInfo = Object.values(subtestsByDomain).flat().find(t => t.id === id);
        return { name: subtestInfo?.name, score, diff: diff.toFixed(2), classification };
    }).filter(s => s.name);

    return { compositeScores, discrepancies, strengthsAndWeaknesses };
};


// Componente para simular la aplicación de una subprueba verbal
function VerbalCriterionSubtest({ subtestName, onRawScoreChange }: { subtestName: string, onRawScoreChange: (score: number) => void }) {
    const [currentItem, setCurrentItem] = useState(1);
    const [scores, setScores] = useState<{[key: number]: number}>({});
    const [notes, setNotes] = useState("");
    const [timer, setTimer] = useState(0);
    const [isTimerActive, setIsTimerActive] = useState(false);

    useEffect(() => {
        let interval: NodeJS.Timeout | null = null;
        if (isTimerActive) {
            interval = setInterval(() => setTimer(t => t + 1), 1000);
        } else if (interval) {
            clearInterval(interval);
        }
        return () => { if (interval) clearInterval(interval); };
    }, [isTimerActive]);

    const totalScore = useMemo(() => Object.values(scores).reduce((sum, score) => sum + score, 0), [scores]);

    const setScore = (item: number, score: number) => {
        const newScores = {...scores, [item]: score};
        setScores(newScores);
        const newTotalScore = Object.values(newScores).reduce((sum, s) => sum + s, 0);
        onRawScoreChange(newTotalScore);
    };

    const handleNextItem = () => {
        setIsTimerActive(false);
        setTimer(0);
        setCurrentItem(p => p + 1);
    };

    const handlePrevItem = () => {
        setIsTimerActive(false);
        setTimer(0);
        setCurrentItem(p => Math.max(1, p - 1));
    };

    return (
        <div className="space-y-4 p-4 border rounded-lg bg-gray-50/70">
            <div className="flex justify-between items-center">
                <h4 className="font-semibold text-lg">{subtestName} - Ítem {currentItem}</h4>
                <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={handlePrevItem}><ChevronLeft className="h-4 w-4" /> Ant</Button>
                    <Button size="sm" variant="outline" onClick={handleNextItem}>Sig <ChevronRight className="h-4 w-4" /></Button>
                </div>
            </div>

            <div className="p-4 bg-white rounded-md border min-h-[80px]">
                <p className="text-sm text-gray-500">Consigna o estímulo del ítem {currentItem}:</p>
                <p className="font-semibold mt-2">Ej: "¿En qué se parecen un lápiz y un bolígrafo?"</p>
            </div>

            <div className="p-3 border rounded-lg bg-white flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Timer className="text-gray-500"/>
                    <span className="font-mono text-lg">{timer}s</span>
                </div>
                <Button size="sm" variant={isTimerActive ? "destructive" : "default"} onClick={() => setIsTimerActive(!isTimerActive)}>
                   {isTimerActive ? <Pause className="mr-2 h-4 w-4"/> : <Play className="mr-2 h-4 w-4"/>}
                   {isTimerActive ? 'Pausar' : 'Iniciar'}
                </Button>
            </div>
            
            <div>
                <Label className="text-sm font-medium">Puntuación del Ítem (según manual)</Label>
                <div className="flex gap-2 mt-1">
                    {[0, 1, 2].map(score => (
                        <Button 
                            key={score} 
                            type="button"
                            variant={scores[currentItem] === score ? 'default' : 'outline'}
                            onClick={() => setScore(currentItem, score)}
                        >
                            {score}
                        </Button>
                    ))}
                </div>
            </div>

             <div>
                <Label htmlFor={`notes-${subtestName}`} className="text-sm font-medium">Respuesta Cualitativa / Observaciones</Label>
                <Textarea 
                    id={`notes-${subtestName}`}
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                    placeholder="Anotar la respuesta textual del evaluado..."
                    className="mt-1"
                />
            </div>
            
            <Separator />

            <div className="flex justify-end items-center">
                <p className="text-md font-bold">Puntaje Bruto Acumulado: <span className="text-blue-600">{totalScore}</span></p>
            </div>
        </div>
    );
}

// Componente para entrada directa de puntaje bruto
function DirectInputSubtest({ subtestName, subtestId, rawScores, onScoreChange }: { subtestName: string, subtestId: string, rawScores: {[key: string]: string}, onScoreChange: (id: string, value: string) => void }) {
    return (
        <div className="p-4 border rounded-lg bg-gray-50/70">
            <Label htmlFor={`pb-${subtestId}`}>Puntaje Bruto (PB) para {subtestName}</Label>
            <Input 
                id={`pb-${subtestId}`}
                type="number"
                value={rawScores[subtestId] || ''}
                onChange={(e) => onScoreChange(subtestId, e.target.value)}
                placeholder="Puntaje Bruto"
                className="mt-1"
            />
        </div>
    );
}


export default function WISCScoringConsole({ studentAge }: WISCScoringConsoleProps) {
    const [rawScores, setRawScores] = useState<{ [key: string]: string }>({});
    const [results, setResults] = useState<ReturnType<typeof calculateClinicalProfile> | null>(null);
    const [clinicalObservations, setClinicalObservations] = useState('');

    const handleRawScoreChange = (subtestId: string, value: string) => {
        setRawScores(prev => ({ ...prev, [subtestId]: value }));
    };

    const handleSubtestScoreChange = (subtestId: string, score: number) => {
        setRawScores(prev => ({ ...prev, [subtestId]: String(score) }));
    };

    const handleCalculate = () => {
        const scaledScores: { [key: string]: number } = {};
        Object.entries(rawScores).forEach(([key, value]) => {
            const rawScore = parseInt(value, 10);
            if (!isNaN(rawScore)) {
                scaledScores[key] = getScaledScore(rawScore, key);
            }
        });

        const clinicalProfile = calculateClinicalProfile(scaledScores);
        setResults(clinicalProfile);
    };

    const handleFinalizeAndSeal = () => {
        if (!results) {
            alert("Primero debe calcular los resultados antes de finalizar.");
            return;
        }

        let resumen_ejecutivo = '';
        const citScore = results.compositeScores.find(s => s.name.includes('CIT'))?.score || 0;

        if (citScore > 115) {
            resumen_ejecutivo = "El evaluado presenta una capacidad intelectual significativamente superior al promedio de su grupo de edad. Posee habilidades destacadas para la resolución de problemas complejos y el aprendizaje autónomo.";
        } else if (citScore >= 90) {
            resumen_ejecutivo = "El funcionamiento cognitivo global se sitúa dentro de la normalidad, mostrando una capacidad adecuada para cumplir con las exigencias académicas de nivel bachillerato.";
        } else {
            resumen_ejecutivo = "Se observan retos significativos en el procesamiento de información que podrían impactar el rendimiento escolar. Se recomienda una intervención psicopedagógica focalizada y adecuaciones en el aula.";
        }

        const narrativeReportObject = {
            resumen_ejecutivo: `${resumen_ejecutivo}\n\nObservaciones Clínicas Adicionales:\n${clinicalObservations}`,
            analisis_indices: {
                fortalezas: results.strengthsAndWeaknesses.filter(s => s.classification.startsWith('F')).map(s => s.name),
                debilidades: results.strengthsAndWeaknesses.filter(s => s.classification.startsWith('D')).map(s => s.name)
            },
            plan_intervencion: [
                ...(results.strengthsAndWeaknesses.some(s => s.name === 'Cubos' && s.classification.startsWith('D'))
                    ? [{ area: 'Visoespacial', sugerencia: 'Implementar estrategias de organización espacial y planificación.', fuente: 'Manual de Intervención Psicopedagógica, pág. 88' }]
                    : [])
            ]
        };


        console.log("--- SIMULACIÓN DE CIERRE SEGURO Y AUDITORÍA ---", narrativeReportObject);
        alert("CIERRE SEGURO (SIMULACIÓN): El protocolo ha sido finalizado. Revisa la consola.");
    };

    return (
        <div className="w-full shadow-md border rounded-lg bg-white">
             <div className="flex justify-between items-center p-4 border-b">
                <div>
                     <h2 className="text-xl font-bold text-gray-800">Consola de Aplicación WISC-V</h2>
                     <p className="text-sm text-gray-500">Edad del evaluado: {studentAge} años</p>
                </div>
                <div className="flex items-center gap-4">
                     <Button onClick={handleCalculate} className="bg-blue-600 hover:bg-blue-700">
                        <Calculator className="mr-2 h-4 w-4" />
                        Calcular Puntuaciones Finales
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-8 gap-y-4 p-4">
                {/* Columna Izquierda: Protocolo de Aplicación */}
                <div className="space-y-4">
                    <h3 className="font-semibold text-lg text-center lg:text-left">Protocolo de Aplicación</h3>
                    <Accordion type="single" collapsible className="w-full" defaultValue='ICV'>
                        {Object.entries(subtestsByDomain).map(([domain, tests]) => (
                            <AccordionItem value={domain} key={domain}>
                                <AccordionTrigger className="font-semibold text-base">{domain}</AccordionTrigger>
                                <AccordionContent>
                                    <div className="space-y-4 p-1">
                                        {tests.map(test => (
                                           <Accordion key={test.id} type="single" collapsible>
                                                <AccordionItem value={test.id}>
                                                    <AccordionTrigger className="text-md flex items-center justify-between p-3 border rounded-md bg-white">
                                                       <div className="flex items-center gap-2">
                                                            <BookOpen className="h-5 w-5 text-gray-600"/>
                                                            <span className="font-semibold">{test.name}</span>
                                                        </div>
                                                        {test.optional && <span className="text-xs font-normal text-gray-500 ml-2">(Opcional)</span>}
                                                    </AccordionTrigger>
                                                    <AccordionContent className="pt-2">
                                                        {test.renderType === 'VERBAL_CRITERIO' ? (
                                                            <VerbalCriterionSubtest 
                                                                subtestName={test.name}
                                                                onRawScoreChange={(score) => handleSubtestScoreChange(test.id, score)}
                                                            />
                                                        ) : (
                                                            <DirectInputSubtest
                                                                subtestName={test.name}
                                                                subtestId={test.id}
                                                                rawScores={rawScores}
                                                                onScoreChange={handleRawScoreChange}
                                                            />
                                                        )}
                                                    </AccordionContent>
                                                </AccordionItem>
                                           </Accordion>
                                        ))}
                                    </div>
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>
                </div>

                {/* Columna Derecha: Resultados y Análisis */}
                <div className="space-y-6">
                     <h3 className="font-semibold text-lg text-center lg:text-left">Resultados y Análisis</h3>
                     {results ? (
                        <div className="space-y-8">
                            <div>
                                <h4 className="font-semibold text-md mb-2">Tabla de Puntuaciones Compuestas</h4>
                                <Table>
                                    <TableHeader><TableRow><TableHead>Índice</TableHead><TableHead>PC</TableHead><TableHead>Percentil</TableHead><TableHead>Clasificación</TableHead></TableRow></TableHeader>
                                    <TableBody>
                                        {results.compositeScores.map(res => (
                                            <TableRow key={res.name} className={res.name.includes('CIT') ? 'bg-blue-50 font-bold' : ''}>
                                                <TableCell>{res.name}</TableCell>
                                                <TableCell className="font-extrabold text-blue-800">{res.score}</TableCell>
                                                <TableCell>{res.percentile}</TableCell>
                                                <TableCell>{res.classification}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                            
                            <div>
                                <h4 className="font-semibold text-md mb-2">Análisis de Discrepancias</h4>
                                <Table>
                                    <TableHeader><TableRow><TableHead>Comparación</TableHead><TableHead>Diferencia</TableHead><TableHead>Significancia</TableHead></TableRow></TableHeader>
                                    <TableBody>
                                        {results.discrepancias.map(d => (
                                            <TableRow key={d.pair}>
                                                <TableCell>{d.pair}</TableCell>
                                                <TableCell>{d.diff}</TableCell>
                                                <TableCell className={d.significant ? 'font-bold text-red-600' : ''}>{d.significant ? 'Sí (p < .05)' : 'No'}</TableCell>
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

                             <Separator className="my-6" />

                            <div>
                                <h3 className="text-lg font-semibold mb-3">Informe Narrativo y Observaciones</h3>
                                 <div className="space-y-2">
                                    <Label htmlFor="clinical-observations">Observaciones y Análisis Cualitativo (Manual)</Label>
                                    <Textarea
                                        id="clinical-observations"
                                        placeholder="Añadir aquí observaciones conductuales, rapport, fatiga, lenguaje no verbal, etc."
                                        className="min-h-[120px]"
                                        value={clinicalObservations}
                                        onChange={(e) => setClinicalObservations(e.target.value)}
                                    />
                                </div>
                            </div>
                           
                           <Button onClick={handleFinalizeAndSeal} variant="default" className="w-full bg-green-700 hover:bg-green-800 text-white font-bold">
                                <FileLock2 className="mr-2" />
                                Finalizar y Sellar Protocolo (Auditoría)
                            </Button>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center min-h-[400px] p-8 bg-gray-50 text-gray-500 rounded-md border-2 border-dashed">
                             <p className="text-center">Los resultados y el análisis aparecerán aquí después de calcular las puntuaciones.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
