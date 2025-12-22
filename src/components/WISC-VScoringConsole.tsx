'use client';

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Calculator, FileLock2, ChevronLeft, ChevronRight, BookOpen, Timer, Play, Pause, AlertTriangle, AlertCircle } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Textarea } from './ui/textarea';
import { Separator } from './ui/separator';
import { Checkbox } from './ui/checkbox';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';


interface WISCScoringConsoleProps {
    studentAge: number;
}

const subtestsByDomainWISC = {
    ICV: [
        { id: 'S', name: 'Semejanzas', renderType: 'VERBAL_CRITERIO', isCit: true },
        { id: 'V', name: 'Vocabulario', renderType: 'VERBAL_CRITERIO', isCit: true },
        { id: 'I', name: 'Información', renderType: 'VERBAL_CRITERIO', optional: true },
        { id: 'Co', name: 'Comprensión', renderType: 'VERBAL_CRITERIO', optional: true },
    ],
    IVE: [
        { id: 'C', name: 'Cubos', renderType: 'VERBAL_CRITERIO', isCit: true },
        { id: 'PV', name: 'Puzles Visuales', renderType: 'MULTI_CHOICE', isCit: false },
    ],
    IRF: [
        { id: 'M', name: 'Matrices', renderType: 'VERBAL_CRITERIO', isCit: true },
        { id: 'B', name: 'Balanzas', renderType: 'SINGLE_CHOICE', isCit: true },
        { id: 'A', name: 'Aritmética', renderType: 'ARITHMETIC', optional: true },
    ],
    IMT: [
        { id: 'D', name: 'Dígitos', renderType: 'VERBAL_CRITERIO', isCit: true },
        { id: 'LN', name: 'Letras y Números', renderType: 'VERBAL_CRITERIO', optional: true },
    ],
    IVP: [
        { id: 'Cl', name: 'Claves', renderType: 'VERBAL_CRITERIO', isCit: true },
        { id: 'BS', name: 'Búsqueda de Símbolos', renderType: 'VERBAL_CRITERIO', optional: true },
        { id: 'Ca', name: 'Cancelación', renderType: 'VERBAL_CRITERIO', optional: true },
    ]
};

const subtestsByDomainWAIS = {
    ICV: [
        { id: 'S', name: 'Semejanzas', renderType: 'VERBAL_CRITERIO', isCit: true },
        { id: 'V', name: 'Vocabulario', renderType: 'VERBAL_CRITERIO', isCit: true },
        { id: 'I', name: 'Información', renderType: 'VERBAL_CRITERIO', isCit: true },
        { id: 'Co', name: 'Comprensión', renderType: 'VERBAL_CRITERIO', optional: true },
    ],
    IRP: [
        { id: 'C', name: 'Diseño con Cubos', renderType: 'VERBAL_CRITERIO', isCit: true },
        { id: 'M', name: 'Matrices', renderType: 'VERBAL_CRITERIO', isCit: true },
        { id: 'PV', name: 'Puzles Visuales', renderType: 'MULTI_CHOICE', isCit: true },
        { id: 'B', name: 'Balanzas', renderType: 'SINGLE_CHOICE', optional: true },
        { id: 'FI', name: 'Figuras Incompletas', renderType: 'VERBAL_CRITERIO', optional: true },
    ],
    IMT: [
        { id: 'D', name: 'Retención de Dígitos', renderType: 'VERBAL_CRITERIO', isCit: true },
        { id: 'A', name: 'Aritmética', renderType: 'ARITHMETIC', isCit: true },
        { id: 'LN', name: 'Sucesión de Letras y Números', renderType: 'VERBAL_CRITERIO', optional: true },
    ],
    IVP: [
        { id: 'BS', name: 'Búsqueda de Símbolos', renderType: 'VERBAL_CRITERIO', isCit: true },
        { id: 'Cl', name: 'Claves', renderType: 'VERBAL_CRITERIO', isCit: true },
        { id: 'Ca', name: 'Cancelación', renderType: 'VERBAL_CRITERIO', optional: true },
    ]
};


// Esta función simula la búsqueda en las tablas de baremos.
const getScaledScore = (rawScore: number, subtestId: string): number => {
    // Caso de Prueba Maestro
    const masterCase: { [key: string]: { [key: number]: number } } = {
        S: { 22: 10 }, V: { 25: 10 }, C: { 18: 7 }, M: { 15: 9 }, B: { 14: 8 }, D: { 20: 11 }, BS: { 22: 11 }
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

const calculateClinicalProfile = (scaledScores: { [key: string]: number }, isWais: boolean) => {
    
    const getSum = (ids: string[]) => ids.reduce((sum, id) => sum + (scaledScores[id] || 0), 0);
    
    const scaleToComposite = (sum: number, numSubtests: number) => {
        if (numSubtests === 0 || sum === 0) return 40;
        // Simulación para Caso Maestro
        if (sum === 66 && numSubtests === 7) return 81;
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

    let compositeScores, discrepancies, strengthsAndWeaknesses;

    if (isWais) {
        // Lógica de cálculo para WAIS-IV
        const icv = createProfile("Comprensión Verbal (ICV)", scaleToComposite(getSum(['S', 'V', 'I']), 3));
        const irp = createProfile("Razonamiento Perceptual (IRP)", scaleToComposite(getSum(['C', 'M', 'PV']), 3));
        const imt = createProfile("Memoria de Trabajo (IMT)", scaleToComposite(getSum(['D', 'A']), 2));
        const ivp = createProfile("Velocidad de Procesamiento (IVP)", scaleToComposite(getSum(['BS', 'Cl']), 2));
        const citSum = getSum(['S', 'V', 'I', 'C', 'M', 'PV', 'D', 'A', 'BS', 'Cl']);
        const cit = createProfile("C.I. Total (CIT)", scaleToComposite(citSum, 10));
        compositeScores = [icv, irp, imt, ivp, cit];
    } else {
        // Lógica de cálculo para WISC-V
        const icv = createProfile("Comprensión Verbal (ICV)", scaleToComposite(getSum(['S', 'V']), 2));
        const ive = createProfile("Visoespacial (IVE)", scaleToComposite(getSum(['C', 'PV']), 2));
        const irf = createProfile("Razonamiento Fluido (IRF)", scaleToComposite(getSum(['M', 'B']), 2));
        const imt = createProfile("Memoria de Trabajo (IMT)", scaleToComposite(getSum(['D']), 1)); // Solo Dígitos es esencial
        const ivp = createProfile("Velocidad de Procesamiento (IVP)", scaleToComposite(getSum(['Cl']), 1)); // Solo Claves es esencial
        const citSum = getSum(['S', 'V', 'C', 'M', 'B', 'D', 'Cl']);
        const cit = createProfile("C.I. Total (CIT)", scaleToComposite(citSum, 7));
        compositeScores = [icv, ive, irf, imt, ivp, cit];
    }

    const valoresCriticos = { 'ICV-IRF': 10.8, 'D-C': 2.5 };
    discrepancies = [
        // La lógica de discrepancias puede necesitar ajuste por escala
    ];
    
    const allSubtests = isWais ? Object.values(subtestsByDomainWAIS).flat() : Object.values(subtestsByDomainWISC).flat();
    const allIds = allSubtests.map(t => t.id);
    const meanPE = getSum(allIds) / allIds.filter(id => scaledScores[id]).length;

    strengthsAndWeaknesses = allIds.filter(id => scaledScores[id]).map(id => {
        const score = scaledScores[id] || 0;
        const diff = score - meanPE;
        let classification = '-';
        if (diff >= valoresCriticos['D-C']) classification = 'Fortaleza (F)';
        if (diff <= -valoresCriticos['D-C']) classification = 'Debilidad (D)';
        const subtestInfo = allSubtests.find(t => t.id === id);
        return { name: subtestInfo?.name, score, diff: diff.toFixed(2), classification };
    }).filter(s => s.name && s.score > 0);

    return { compositeScores, discrepancies, strengthsAndWeaknesses };
};


// Componente de guía de calificación para respuestas verbales
const GuiaCalificacion = () => {
    // Simulación de la base de datos de criterios para un ítem específico
    const itemData = {
        subprueba: "Semejanzas",
        item: "Piano - Tambor",
        criterios: {
            "2_puntos": ["Instrumentos musicales", "Para hacer música", "Producen sonidos"],
            "1_punto": ["Tienen teclas/parches", "Hacen ruido", "Se tocan", "Tienen ritmo"],
            "0_puntos": ["Son de madera", "Están en una banda", "Son grandes"],
        },
    };

    return (
        <div className="guia-puntuacion-flotante p-4 border rounded-lg bg-slate-50 h-full">
            <h4 className="font-semibold text-md mb-3 text-slate-800">Guía de Calificación (Ejemplos)</h4>
            <div className="space-y-3 text-sm">
                <div className="nivel-2">
                    <strong className="text-green-700">2 Puntos (Concepto Abstracto):</strong>
                    <ul className="list-disc pl-5 mt-1 space-y-1 text-slate-600">
                        {itemData.criterios['2_puntos'].map((ex, i) => <li key={`2pt-${i}`}>{ex}</li>)}
                    </ul>
                </div>
                <div className="nivel-1">
                    <strong className="text-amber-700">1 Punto (Propiedad Concreta/Función):</strong>
                    <ul className="list-disc pl-5 mt-1 space-y-1 text-slate-600">
                        {itemData.criterios['1_punto'].map((ex, i) => <li key={`1pt-${i}`}>{ex}</li>)}
                    </ul>
                </div>
                 <div className="nivel-0">
                    <strong className="text-red-700">0 Puntos (Irrelevante/Erróneo):</strong>
                    <ul className="list-disc pl-5 mt-1 space-y-1 text-slate-600">
                        {itemData.criterios['0_puntos'].map((ex, i) => <li key={`0pt-${i}`}>{ex}</li>)}
                    </ul>
                </div>
            </div>
            <Separator className="my-4" />
            <p className="text-xs text-slate-500 italic">Nota: Si la respuesta es vaga o ambigua, recuerde interrogar ("¿Qué quieres decir?") antes de puntuar.</p>
        </div>
    );
};


// Componente para simular la aplicación de una subprueba verbal
function SubtestApplicationConsole({ subtestName, subtestId, renderType }: { subtestName: string, subtestId: string, renderType: string }) {
    const storageKey = `wisc_session_${subtestId}`;

    const [currentItem, setCurrentItem] = useState(1);
    const [scores, setScores] = useState<{[key: number]: { score: number, notes: string, errorTags: string[] }}>({});
    const [timer, setTimer] = useState(0);
    const [isTimerActive, setIsTimerActive] = useState(false);

    // --- LÓGICA DE PERSISTENCIA Y RECUPERACIÓN ---
    const updateAndPersistScores = useCallback((newScores: typeof scores, newCurrentItem: number) => {
        setScores(newScores);
        try {
             localStorage.setItem(storageKey, JSON.stringify({ savedScores: newScores, savedCurrentItem: newCurrentItem }));
        } catch (error) {
            console.error("Error al guardar la sesión en el localStorage:", error);
        }
    }, [storageKey]);

    useEffect(() => {
        try {
            const savedSession = localStorage.getItem(storageKey);
            if (savedSession) {
                const { savedScores, savedCurrentItem } = JSON.parse(savedSession);
                if (savedScores) setScores(savedScores);
                if (savedCurrentItem) setCurrentItem(savedCurrentItem);
                console.log(`Sesión de ${subtestName} recuperada.`);
            }
        } catch (error) {
            console.error("Error al recuperar la sesión del localStorage:", error);
        }
    }, [storageKey, subtestName]);
    
    // --- FIN DE LÓGICA DE PERSISTENCIA ---


    const errorCategories = [
        "Respuesta Tangencial", "Perseveración", "Concreción Excesiva", 
        "Respuesta Personalizada", "Neologismos / Ensalada de Palabras"
    ];

    useEffect(() => {
        let interval: NodeJS.Timeout | null = null;
        if (isTimerActive) {
            interval = setInterval(() => {
                setTimer(t => {
                    const newTime = t + 1;
                    // Lógica de Timeout (Simulada)
                    const timeLimit = 30; // Límite de ejemplo, debería venir de la config de cada item.
                    if (newTime >= timeLimit) {
                        setIsTimerActive(false);
                        alert(`Tiempo límite de ${timeLimit}s excedido. Puntaje = 0.`);
                        setScore(currentItem, 0);
                    }
                    return newTime;
                });
            }, 1000);
        } else if (interval) {
            clearInterval(interval);
        }
        return () => { if (interval) clearInterval(interval); };
    }, [isTimerActive, currentItem]);

    const totalScore = useMemo(() => Object.values(scores).reduce((sum, item) => sum + (item?.score || 0), 0), [scores]);

    // Lógica de Alerta de Proceso (Cap. 13.1.2)
    useEffect(() => {
        const allTags = Object.values(scores).flatMap(s => s?.errorTags || []);
        if (allTags.length > 0) {
            const tagCounts = allTags.reduce((acc, tag) => {
                acc[tag] = (acc[tag] || 0) + 1;
                return acc;
            }, {} as {[key: string]: number});
            
            for (const tag in tagCounts) {
                if (tagCounts[tag] >= 3) {
                     console.warn(`Alerta de Proceso: Se detecta un patrón recurrente de '${tag}'. Considere evaluar funciones ejecutivas adicionales.`);
                }
            }
        }
    }, [scores]);

    const setScore = (item: number, score: number) => {
        const newScores = {...scores, [item]: { ...(scores[item] || { notes: '', errorTags: [] }), score }};
        updateAndPersistScores(newScores, item);
    };

    const setNotes = (item: number, notes: string) => {
        const newScores = {...scores, [item]: { ...(scores[item] || { score: 0, errorTags: [] }), notes }};
        updateAndPersistScores(newScores, item);
    };

    const handleErrorTagChange = (item: number, tag: string, isChecked: boolean) => {
        const currentTags = scores[item]?.errorTags || [];
        let newTags;
        if (isChecked) {
            newTags = [...currentTags, tag];
        } else {
            newTags = currentTags.filter(t => t !== tag);
        }
        const newScores = {...scores, [item]: { ...(scores[item] || { score: 0, notes: '' }), errorTags: newTags }};
        updateAndPersistScores(newScores, item);
    };

    const handleNextItem = () => {
        setIsTimerActive(false);
        setTimer(0);
        const nextItem = currentItem + 1;
        setCurrentItem(nextItem);
        // Persist only the item change
        updateAndPersistScores(scores, nextItem);
    };

    const handlePrevItem = () => {
        setIsTimerActive(false);
        setTimer(0);
        const prevItem = Math.max(1, currentItem - 1);
        setCurrentItem(prevItem);
        // Persist only the item change
        updateAndPersistScores(scores, prevItem);
    };
    
    const currentItemScore = scores[currentItem]?.score;

    // TODO: EQUIPO DE DESARROLLO - Esta URL debe ser reemplazada por la `imageUrl`
    // que proviene del objeto de configuración de la subprueba, una vez que
    // el script de carga masiva actualice la base de datos en Firestore.
    const stimulusImageUrl = `https://picsum.photos/seed/stimulus${subtestId}${currentItem}/600/400`;

    const renderInputInterface = () => {
        switch(renderType) {
            case 'VERBAL_CRITERIO':
                return (
                    <div className="flex gap-2 mt-1">
                        {[0, 1, 2].map(score => (
                            <Button 
                                key={score} 
                                type="button"
                                variant={currentItemScore === score ? 'default' : 'outline'}
                                onClick={() => setScore(currentItem, score)}
                            >
                                {score}
                            </Button>
                        ))}
                    </div>
                );
            case 'MULTI_CHOICE': // Para Puzles Visuales
                 return (
                    <div className="grid grid-cols-3 gap-2 mt-1">
                        {[1, 2, 3, 4, 5, 6].map(option => (
                           <div key={option} className="flex items-center space-x-2 p-2 rounded border bg-white">
                                <Checkbox id={`pv-opt-${option}`} />
                                <Label htmlFor={`pv-opt-${option}`}>Opción {option}</Label>
                            </div>
                        ))}
                    </div>
                );
             case 'SINGLE_CHOICE': // Para Balanzas
                return (
                    <div className="grid grid-cols-3 gap-2 mt-1">
                       {[1, 2, 3, 4, 5].map(option => (
                            <Button key={option} type="button" variant="outline">{option}</Button>
                        ))}
                    </div>
                );
            case 'ARITHMETIC':
                return (
                    <div className="space-y-4 mt-2">
                        <Alert variant="default" className="border-yellow-500 text-yellow-800">
                            <AlertCircle className="h-4 w-4" />
                            <AlertTitle className="font-bold">Recordatorio de Aplicación</AlertTitle>
                            <AlertDescription>
                                Prohibido usar papel, lápiz o calculadora.
                            </AlertDescription>
                        </Alert>
                         <div className="flex items-end gap-2">
                            <div className="flex-grow space-y-1">
                                <Label htmlFor="arithmetic-answer">Respuesta del Sujeto</Label>
                                <Input id="arithmetic-answer" type="number" placeholder="Ingresar respuesta" />
                            </div>
                            <Button>Registrar</Button>
                            <Button variant="secondary">Repetir</Button>
                        </div>
                    </div>
                );
            default:
                return <p>Tipo de renderizado no configurado.</p>;
        }
    }

    return (
        <div className="p-1 space-y-4">
            <div className="flex justify-between items-center">
                <h4 className="font-semibold text-lg">{subtestName} - Ítem {currentItem}</h4>
                <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={handlePrevItem}><ChevronLeft className="h-4 w-4" /> Ant</Button>
                    <Button size="sm" variant="outline" onClick={handleNextItem}>Sig <ChevronRight className="h-4 w-4" /></Button>
                </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                 {/* Columna Izquierda: Estímulo y Aplicación */}
                <div className="space-y-4">
                    <div className="p-4 bg-gray-900 rounded-md border min-h-[240px] flex items-center justify-center">
                        {renderType !== 'ARITHMETIC' ? (
                            <img 
                                src={stimulusImageUrl} 
                                alt={`Estímulo para el ítem ${currentItem}`}
                                className="max-w-full max-h-full object-contain rounded-sm"
                                onContextMenu={(e) => e.preventDefault()}
                            />
                        ) : (
                            <div className="text-white text-center p-4">
                                <p className="text-lg font-semibold">Consigna Oral</p>
                                <p className="text-sm">(Lea el problema en voz alta desde el manual)</p>
                            </div>
                        )}
                    </div>

                    <div>
                        <Label className="text-sm font-medium">Respuesta Cualitativa / Observaciones</Label>
                        <Textarea 
                            value={scores[currentItem]?.notes || ''}
                            onChange={e => setNotes(currentItem, e.target.value)}
                            placeholder="Anotar la respuesta textual del evaluado y observaciones conductuales..."
                            className="mt-1"
                        />
                    </div>
                </div>

                {/* Columna Derecha: Controles y Guía */}
                <div className="space-y-4">
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
                        {renderInputInterface()}
                    </div>
                    
                    {renderType === 'VERBAL_CRITERIO' && <GuiaCalificacion />}
                </div>
            </div>

            {currentItemScore === 0 && (
                <div className="p-4 border-l-4 border-orange-400 bg-orange-50 rounded-md mt-4">
                    <h5 className="font-semibold text-orange-800">Análisis Cualitativo del Error (Opcional)</h5>
                    <div className="mt-3 space-y-2">
                        {errorCategories.map(tag => (
                            <div key={tag} className="flex items-center space-x-2">
                                <Checkbox 
                                    id={`tag-${tag}-${currentItem}`}
                                    checked={scores[currentItem]?.errorTags?.includes(tag)}
                                    onCheckedChange={(checked) => handleErrorTagChange(currentItem, tag, !!checked)}
                                />
                                <Label htmlFor={`tag-${tag}-${currentItem}`} className="text-sm font-normal text-gray-700">
                                    {tag}
                                </Label>
                            </div>
                        ))}
                    </div>
                </div>
            )}
            
            <Separator className="!mt-6" />

            <div className="flex justify-end items-center">
                <p className="text-md font-bold">Puntaje Bruto Acumulado: <span className="text-blue-600">{totalScore}</span></p>
            </div>
        </div>
    );
}


export default function WISCScoringConsole({ studentAge }: WISCScoringConsoleProps) {
    const isWais = studentAge >= 17;
    const subtestsByDomain = isWais ? subtestsByDomainWAIS : subtestsByDomainWISC;
    const scaleName = isWais ? "WAIS-IV" : "WISC-V";

    const [rawScores, setRawScores] = useState<{ [key: string]: number }>({});
    const [results, setResults] = useState<ReturnType<typeof calculateClinicalProfile> | null>(null);
    const [clinicalObservations, setClinicalObservations] = useState('');

    const handleCalculate = () => {
        const scaledScores: { [key: string]: number } = {};
        Object.entries(rawScores).forEach(([key, value]) => {
            if (value !== undefined && !isNaN(value)) {
                scaledScores[key] = getScaledScore(value, key);
            }
        });

        const clinicalProfile = calculateClinicalProfile(scaledScores, isWais);
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

        // --- LIMPIEZA DE SESIÓN ---
        Object.values(subtestsByDomain).flat().forEach(subtest => {
            try {
                localStorage.removeItem(`wisc_session_${subtest.id}`);
            } catch (error) {
                console.error("No se pudo limpiar el localStorage para la subprueba:", subtest.id, error);
            }
        });

        console.log("--- SIMULACIÓN DE CIERRE SEGURO Y AUDITORÍA ---", narrativeReportObject);
        console.log("--- SESIÓN LOCAL LIMPIADA ---");
        alert("CIERRE SEGURO (SIMULACIÓN): El protocolo ha sido finalizado. Revisa la consola.");
    };

    return (
        <div className="w-full shadow-md border rounded-lg bg-white">
             <div className="flex justify-between items-center p-4 border-b">
                <div>
                     <h2 className="text-xl font-bold text-gray-800">Consola de Aplicación {scaleName}</h2>
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
                                                        <SubtestApplicationConsole 
                                                            subtestName={test.name}
                                                            subtestId={test.id}
                                                            renderType={test.renderType}
                                                        />
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
