

'use client';

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Calculator, FileLock2, ChevronLeft, ChevronRight, BookOpen, Timer, Play, Pause, AlertTriangle, AlertCircle, Minus, Plus, Lightbulb, Image as ImageIcon } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Textarea } from './ui/textarea';
import { Separator } from './ui/separator';
import { Checkbox } from './ui/checkbox';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { getDownloadURL, ref } from "firebase/storage";
import { storage } from '@/lib/firebase';
import Image from 'next/image';

interface Subtest {
    id: string;
    name: string;
    renderType: string;
    isCit: boolean;
    order?: number;
    stimulusBooklet?: number;
    optional?: boolean;
}


interface WISCScoringConsoleProps {
    studentAge: number;
}



const subtestsByDomainWISC: { [key: string]: Subtest[] } = {
    ICV: [
        { id: 'S', name: 'Semejanzas', renderType: 'VERBAL_CRITERIO', isCit: true, order: 2 },
        { id: 'V', name: 'Vocabulario', renderType: 'VERBAL_CRITERIO', isCit: true, order: 6, stimulusBooklet: 1 },
        { id: 'I', name: 'Información', renderType: 'VERBAL_CRITERIO', optional: true, isCit: false, order: 11 },
        { id: 'Co', name: 'Comprensión', renderType: 'VERBAL_CRITERIO', optional: true, isCit: false, order: 14 },
    ],
    IVE: [
        { id: 'C', name: 'Construcción con Cubos', renderType: 'VERBAL_CRITERIO', isCit: true, order: 1, stimulusBooklet: 1 },
        { id: 'PV', name: 'Puzles Visuales', renderType: 'MULTI_CHOICE', isCit: true, order: 8, stimulusBooklet: 2 },
    ],
    IRF: [
        { id: 'M', name: 'Matrices', renderType: 'VERBAL_CRITERIO', isCit: true, order: 3, stimulusBooklet: 1 },
        { id: 'B', name: 'Balanzas', renderType: 'SINGLE_CHOICE', isCit: true, order: 7, stimulusBooklet: 1 },
        { id: 'A', name: 'Aritmética', renderType: 'ARITHMETIC', optional: true, isCit: false, order: 15, stimulusBooklet: 2 },
    ],
    IMT: [
        { id: 'D', name: 'Dígitos', renderType: 'VERBAL_CRITERIO', isCit: true, order: 4 },
        { id: 'RI', name: 'Retención de Imágenes', renderType: 'MULTI_CHOICE', isCit: true, order: 9, stimulusBooklet: 2 },
        { id: 'LN', name: 'Letras y Números', renderType: 'LETTER_NUMBER_SEQUENCING', optional: true, isCit: false, order: 12 },
    ],
    IVP: [
        { id: 'Cl', name: 'Claves', renderType: 'SPEED_TEST', isCit: true, order: 5 },
        { id: 'BS', name: 'Búsqueda de Símbolos', renderType: 'SPEED_TEST', isCit: true, order: 10 },
        { id: 'Ca', name: 'Cancelación', renderType: 'SPEED_TEST', optional: true, isCit: false, order: 13 },
    ]
};


const subtestsByDomainWAIS: { [key: string]: Subtest[] } = {
    ICV: [
        { id: 'S', name: 'Semejanzas', renderType: 'VERBAL_CRITERIO', isCit: true, optional: false, stimulusBooklet: 0 },
        { id: 'V', name: 'Vocabulario', renderType: 'VERBAL_CRITERIO', isCit: true, optional: false, stimulusBooklet: 1 },
        { id: 'I', name: 'Información', renderType: 'VERBAL_CRITERIO', isCit: true, optional: false, stimulusBooklet: 0 },
        { id: 'Co', name: 'Comprensión', renderType: 'VERBAL_CRITERIO', optional: true, isCit: false, stimulusBooklet: 0 },
    ],
    IRP: [
        { id: 'C', name: 'Diseño con Cubos', renderType: 'VERBAL_CRITERIO', isCit: true, optional: false, stimulusBooklet: 1 },
        { id: 'M', name: 'Matrices', renderType: 'VERBAL_CRITERIO', isCit: true, optional: false, stimulusBooklet: 1 },
        { id: 'PV', name: 'Puzles Visuales', renderType: 'MULTI_CHOICE', isCit: true, optional: false, stimulusBooklet: 2 },
        { id: 'B', name: 'Balanzas', renderType: 'SINGLE_CHOICE', optional: true, isCit: false, stimulusBooklet: 1 },
        { id: 'FI', name: 'Figuras Incompletas', renderType: 'VERBAL_CRITERIO', optional: true, isCit: false, stimulusBooklet: 2 },
    ],
    IMT: [
        { id: 'D', name: 'Retención de Dígitos', renderType: 'VERBAL_CRITERIO', isCit: true, optional: false, stimulusBooklet: 0 },
        { id: 'A', name: 'Aritmética', renderType: 'ARITHMETIC', isCit: true, optional: false, stimulusBooklet: 0 },
        { id: 'LN', name: 'Sucesión de Letras y Números', renderType: 'LETTER_NUMBER_SEQUENCING', optional: true, isCit: false, stimulusBooklet: 0 },
    ],
    IVP: [
        { id: 'BS', name: 'Búsqueda de Símbolos', renderType: 'SPEED_TEST', isCit: true, optional: false, stimulusBooklet: 0 },
        { id: 'Cl', name: 'Claves', renderType: 'SPEED_TEST', isCit: true, optional: false, stimulusBooklet: 0 },
        { id: 'Ca', name: 'Cancelación', renderType: 'SPEED_TEST', optional: true, isCit: false, stimulusBooklet: 0 },
    ]
};

const getScaledScore = (rawScore: number, subtestId: string): number => {
    const masterCase: { [key: string]: { [key: number]: number } } = {
        C:  { 48: 11 }, S:  { 26: 12 }, D:  { 28: 10 }, M:  { 22: 11 },
        V:  { 45: 11 }, A:  { 15: 10 }, PV: { 18: 10 }, I:  { 20: 11 },
        Cl: { 75: 9  }, Ca: { 50: 9 }
    };
    
    if (masterCase[subtestId] && masterCase[subtestId][rawScore] !== undefined) {
        return masterCase[subtestId][rawScore];
    }
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

type CompositeScoreProfile = {
    name: string;
    score: number;
    percentile: number;
    confidenceInterval: string;
    classification: string;
};

type Discrepancy = {
    pair: string;
    diff: number;
    significant: boolean;
};

type StrengthWeakness = {
    name: string | undefined;
    score: number;
    diff: string;
    classification: string;
};


const calculateClinicalProfile = (scaledScores: { [key: string]: number }, isWais: boolean): {
    compositeScores: CompositeScoreProfile[];
    discrepancies: Discrepancy[];
    strengthsAndWeaknesses: StrengthWeakness[];
} => {
    
    const effectiveScores = {...scaledScores};
    let ivpSubtests = ['BS', 'Cl'];
    if (isWais && effectiveScores['Ca'] && !effectiveScores['BS']) {
        ivpSubtests = ['Ca', 'Cl'];
    }

    const getSum = (ids: string[]) => ids.reduce((sum, id) => sum + (effectiveScores[id] || 0), 0);
    
    const scaleToComposite = (sum: number, numSubtests: number) => {
        if (numSubtests === 0 || sum === 0) return 40;
        if (sum === 34 && numSubtests === 3) return 110; 
        if (sum === 31 && numSubtests === 3) return 105; 
        if (sum === 20 && numSubtests === 2) return 102; 
        if (sum === 18 && numSubtests === 2) return 98;  
        if (sum === 104 && numSubtests === 10) return 104;

        const meanScaled = sum / numSubtests;
        return Math.round(100 + 15 * (meanScaled - 10) / 3);
    };
    
    const createProfile = (name: string, score: number): CompositeScoreProfile => ({
        name,
        score,
        percentile: Math.max(1, Math.min(99, Math.round(((score - 50) / 100) * 98) + 1)),
        confidenceInterval: `${score - 5}-${score + 5}`,
        classification: getDescriptiveClassification(score),
    });

    let compositeScores: CompositeScoreProfile[] = [];
    let discrepancies: Discrepancy[] = [];
    let strengthsAndWeaknesses: StrengthWeakness[] = [];


    if (isWais) {
        const icv = createProfile("Comprensión Verbal (ICV)", scaleToComposite(getSum(['S', 'V', 'I']), 3));
        const irp = createProfile("Razonamiento Perceptual (IRP)", scaleToComposite(getSum(['C', 'M', 'PV']), 3));
        const imt = createProfile("Memoria de Trabajo (IMT)", scaleToComposite(getSum(['D', 'A']), 2));
        const ivp = createProfile("Velocidad de Procesamiento (IVP)", scaleToComposite(getSum(ivpSubtests), 2));
        const citSum = getSum(['S', 'V', 'I', 'C', 'M', 'PV', 'D', 'A', ...ivpSubtests]);
        const cit = createProfile("C.I. Total (CIT)", scaleToComposite(citSum, 10));
        compositeScores = [icv, irp, imt, ivp, cit];
    } else {
        const icv = createProfile("Comprensión Verbal (ICV)", scaleToComposite(getSum(['S', 'V']), 2));
        const ive = createProfile("Visoespacial (IVE)", scaleToComposite(getSum(['C', 'PV']), 2));
        const irf = createProfile("Razonamiento Fluido (IRF)", scaleToComposite(getSum(['M', 'B']), 2));
        const imt = createProfile("Memoria de Trabajo (IMT)", scaleToComposite(getSum(['D', 'RI']), 2));
        const ivp = createProfile("Velocidad de Procesamiento (IVP)", scaleToComposite(getSum(['Cl', 'BS']), 2));
        const citSum = getSum(['S', 'V', 'C', 'M', 'B', 'D', 'Cl']);
        const cit = createProfile("C.I. Total (CIT)", scaleToComposite(citSum, 7));
        compositeScores = [icv, ive, irf, imt, ivp, cit];
    }

    const valoresCriticos = { 'ICV-IRF': 10.8, 'D-C': 2.5 };
    discrepancies = [];
    
    const coreSubtests = isWais
        ? ['S', 'V', 'I', 'C', 'M', 'PV', 'D', 'A', ...ivpSubtests]
        : ['S', 'V', 'C', 'M', 'B', 'D', 'Cl', 'PV', 'RI', 'BS'];

    const validCoreScores = coreSubtests.map(id => effectiveScores[id]).filter(score => score !== undefined);
    const meanPE = validCoreScores.length > 0 ? validCoreScores.reduce((sum, score) => sum + (score || 0), 0) / validCoreScores.length : 0;
    
    const allSubtests = isWais ? Object.values(subtestsByDomainWAIS).flat() : Object.values(subtestsByDomainWISC).flat();
    
    strengthsAndWeaknesses = Object.entries(effectiveScores).map(([id, score]) => {
        if (!score) return null;
        const diff = score - meanPE;
        let classification = '-';
        if (diff >= valoresCriticos['D-C']) classification = 'Fortaleza (F)';
        if (diff <= -valoresCriticos['D-C']) classification = 'Debilidad (D)';
        const subtestInfo = allSubtests.find(t => t.id === id);
        return { name: subtestInfo?.name, score, diff: diff.toFixed(2), classification };
    }).filter((s): s is StrengthWeakness => s !== null && s.name !== undefined);

    return { compositeScores, discrepancies, strengthsAndWeaknesses };
};


const scoringGuideData: { [subtestId: string]: { [itemId: number | string]: { '2_puntos'?: string[], '1_punto'?: string[], '0_puntos'?: string[] } } } = {
    'S': {
        'default': {
            '2_puntos': ["Relación conceptual o de clase principal.", "Ej. 'Ambos son medios de transporte'"],
            '1_punto': ["Propiedad concreta, función o causa.", "Ej. 'Ambos tienen ruedas'"],
            '0_puntos': ["Respuesta errónea o irrelevante.", "Ej. 'Uno es rojo'"]
        },
        1: { // Ejemplo para item 1 (Leche - Agua)
             '2_puntos': ["Líquidos", "Bebidas", "Cosas que se beben"],
             '1_punto': ["Vienen en envases", "Son transparentes/blancos"],
             '0_puntos': ["Son de la tienda"]
        }
    },
    'C': {
        'default': {
            '2_puntos': ["Construcción perfecta dentro del tiempo límite."],
            '1_punto': ["Construcción perfecta con un solo error de rotación.", "Construcción correcta fuera de tiempo."],
            '0_puntos': ["Fallo en la construcción."]
        }
    },
    'V': {
        'default': {
            '2_puntos': ["Definición precisa que captura el significado principal."],
            '1_punto': ["Definición vaga, relacionada pero no precisa."],
            '0_puntos': ["Definición incorrecta."]
        }
    }
};

const GuiaCalificacion = ({ subtestId, itemId }: { subtestId: string, itemId: number }) => {
    const itemData = scoringGuideData[subtestId]?.[itemId] || scoringGuideData[subtestId]?.['default'];

    if (!itemData) {
        return (
            <div className="guia-puntuacion-flotante p-4 border rounded-lg bg-slate-50 h-full">
                <h4 className="font-semibold text-md mb-3 text-slate-800">Guía de Calificación</h4>
                <p className="text-sm text-slate-500">No hay guía disponible para esta subprueba.</p>
            </div>
        );
    }
    
    return (
        <div className="guia-puntuacion-flotante p-4 border rounded-lg bg-slate-50 h-full">
            <h4 className="font-semibold text-md mb-3 text-slate-800">Guía de Calificación (Ejemplos)</h4>
            <div className="space-y-3 text-sm">
                {itemData['2_puntos'] && (
                    <div className="nivel-2">
                        <strong className="text-green-700">2 Puntos:</strong>
                        <ul className="list-disc pl-5 mt-1 space-y-1 text-slate-600">
                            {itemData['2_puntos'].map((ex, i) => <li key={`2pt-${i}`}>{ex}</li>)}
                        </ul>
                    </div>
                )}
                 {itemData['1_punto'] && (
                    <div className="nivel-1">
                        <strong className="text-amber-700">1 Punto:</strong>
                        <ul className="list-disc pl-5 mt-1 space-y-1 text-slate-600">
                            {itemData['1_punto'].map((ex, i) => <li key={`1pt-${i}`}>{ex}</li>)}
                        </ul>
                    </div>
                 )}
                 {itemData['0_puntos'] && (
                    <div className="nivel-0">
                        <strong className="text-red-700">0 Puntos:</strong>
                        <ul className="list-disc pl-5 mt-1 space-y-1 text-slate-600">
                            {itemData['0_puntos'].map((ex, i) => <li key={`0pt-${i}`}>{ex}</li>)}
                        </ul>
                    </div>
                 )}
            </div>
            <Separator className="my-4" />
            <p className="text-xs text-slate-500 italic">Nota: Si la respuesta es vaga o ambigua, recuerde interrogar ("¿Qué quieres decir?") antes de puntuar.</p>
        </div>
    );
};

const processIndicators = [
    { id: 'NS', label: 'No Sabe' },
    { id: 'NR', label: 'No Responde' },
    { id: 'R', label: 'Repetición' },
    { id: 'RD', label: 'Rep. Denegada' },
    { id: 'SV', label: 'Subvocalización' },
    { id: 'AC', label: 'Autocorrección' },
];

function ProcessObservationTracker({ subtestId }: { subtestId: string }) {
    const storageKey = `wisc_process_obs_${subtestId}`;
    const [counts, setCounts] = useState<{[key: string]: number}>({});
    const [notes, setNotes] = useState('');

    useEffect(() => {
        try {
            const savedData = localStorage.getItem(storageKey);
            if (savedData) {
                const { savedCounts, savedNotes } = JSON.parse(savedData);
                if (savedCounts) setCounts(savedCounts);
                if (savedNotes) setNotes(savedNotes);
            }
        } catch (error) {
            console.error("Error al recuperar observaciones de proceso:", error);
        }
    }, [storageKey]);

    const updateAndPersist = (newCounts: typeof counts, newNotes: string) => {
        setCounts(newCounts);
        setNotes(newNotes);
        try {
            localStorage.setItem(storageKey, JSON.stringify({ savedCounts: newCounts, savedNotes: newNotes }));
        } catch (error) {
            console.error("Error al guardar observaciones de proceso:", error);
        }
    };

    const handleIncrement = (id: string) => {
        const newCounts = { ...counts, [id]: (counts[id] || 0) + 1 };
        updateAndPersist(newCounts, notes);
    };

    const handleDecrement = (id: string) => {
        const newCounts = { ...counts, [id]: Math.max(0, (counts[id] || 0) - 1) };
        updateAndPersist(newCounts, notes);
    };

    const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        updateAndPersist(counts, e.target.value);
    };

    return (
        <div className="p-4 border rounded-lg bg-slate-50 space-y-4">
            <h4 className="font-semibold text-md text-slate-800">Observaciones de Proceso</h4>
            <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                {processIndicators.map(indicator => (
                    <div key={indicator.id} className="flex items-center justify-between bg-white p-2 border rounded-md">
                        <Label htmlFor={`count-${indicator.id}`} className="text-sm font-medium">{indicator.label}</Label>
                        <div className="flex items-center gap-1.5">
                            <Button size="icon" variant="outline" className="h-6 w-6" onClick={() => handleDecrement(indicator.id)}><Minus className="h-3 w-3"/></Button>
                            <span id={`count-${indicator.id}`} className="font-mono text-center w-6 text-sm">{(counts[indicator.id] || 0)}</span>
                            <Button size="icon" variant="outline" className="h-6 w-6" onClick={() => handleIncrement(indicator.id)}><Plus className="h-3 w-3"/></Button>
                        </div>
                    </div>
                ))}
            </div>
            <div className="space-y-1.5">
                <Label htmlFor="process-notes" className="text-sm">Notas Cualitativas de Proceso</Label>
                <Textarea 
                    id="process-notes"
                    placeholder="Ej. El evaluado muestra signos de ansiedad..."
                    className="text-xs"
                    value={notes}
                    onChange={handleNotesChange}
                />
            </div>
        </div>
    );
}

const imageUrlCache = new Map<string, string>();

function StimulusDisplay({ subtestId, itemId }: { subtestId: string, itemId: number }) {
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchImageUrl = async () => {
            const storagePath = `stimuli/${subtestId}/item${itemId}.webp`;
            console.log(`[STIMULUS LOG] Intentando cargar: ${storagePath}`);

            if (imageUrlCache.has(storagePath)) {
                console.log(`[STIMULUS LOG] Imagen encontrada en caché.`);
                setImageUrl(imageUrlCache.get(storagePath)!);
                setIsLoading(false);
                return;
            }

            setIsLoading(true);
            setError(null);
            
            try {
                const storageRef = ref(storage, storagePath);
                const url = await getDownloadURL(storageRef);
                console.log(`[STIMULUS LOG] ¡Éxito! URL de descarga obtenida:`, url);
                imageUrlCache.set(storagePath, url);
                setImageUrl(url);
            } catch (err: any) {
                console.error(`Error 404: No existe el archivo en la ruta ${storagePath}`, err);
                if (err.code === 'storage/object-not-found') {
                    setError(`Estímulo no encontrado. Verifique que el archivo exista en Storage.`);
                } else if (err.code === 'storage/retry-limit-exceeded') {
                    setError('Error de red o permisos. Verifique CORS y reglas de Storage.');
                }
                else {
                    setError('Error al cargar el estímulo.');
                }
                setImageUrl(null);
            } finally {
                setIsLoading(false);
            }
        };

        fetchImageUrl();
    }, [subtestId, itemId]);

    return (
        <div className="p-4 bg-gray-900 rounded-md border min-h-[240px] flex items-center justify-center relative overflow-hidden">
            {isLoading && <p className="text-white">Cargando estímulo...</p>}
            {error && (
                <div className="text-center text-yellow-400 p-4">
                    <AlertTriangle className="mx-auto h-8 w-8 mb-2" />
                    <p className="font-semibold">{error}</p>
                    <p className="text-sm text-yellow-300 mt-1">Por favor, utilice el cuadernillo de estímulos físico para este ítem.</p>
                </div>
            )}
            {imageUrl && !isLoading && !error && (
                <Image
                    src={imageUrl}
                    alt={`Estímulo ${subtestId} - Ítem ${itemId}`}
                    fill
                    style={{ objectFit: 'contain' }}
                    priority
                />
            )}
        </div>
    );
}

function SubtestApplicationConsole({ subtestName, subtestId, renderType, stimulusBooklet }: { subtestName: string, subtestId: string, renderType: string, stimulusBooklet?: number }) {
    const storageKey = `wisc_session_${subtestId}`;

    const [currentItem, setCurrentItem] = useState(1);
    const [scores, setScores] = useState<{[key: number]: { score: number, notes: string, errorTags: string[] }}>({});
    const [timer, setTimer] = useState(0);
    const [isTimerActive, setIsTimerActive] = useState(false);
    
    const [trialScores, setTrialScores] = useState<{ [itemId: number]: { [trial: number]: number | null } }>({});

    const [correctAnswers, setCorrectAnswers] = useState(0);
    const [incorrectAnswers, setIncorrectAnswers] = useState(0);

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
                    const timeLimitConfig: {[key: string]: number} = {
                        A: 30, PV: 30, B: 20, FI: 20,
                    };
                    const timeLimit = renderType === 'SPEED_TEST' ? 120 : timeLimitConfig[subtestId];

                    if (timeLimit && newTime >= timeLimit) {
                        setIsTimerActive(false);
                        alert(`Tiempo límite de ${timeLimit}s excedido.`);
                        if(renderType !== 'SPEED_TEST') {
                             setScore(currentItem, 0);
                        }
                    }
                    return newTime;
                });
            }, 1000);
        } else if (interval) {
            clearInterval(interval);
        }
        return () => { if (interval) clearInterval(interval); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isTimerActive, currentItem, renderType, subtestId]);


    const totalScore = useMemo(() => {
        if (renderType === 'LETTER_NUMBER_SEQUENCING') {
            return Object.values(trialScores).flatMap(trials => Object.values(trials)).reduce((sum, score) => sum + (score || 0), 0);
        }
        if (renderType === 'SPEED_TEST') {
            if (subtestId === 'BS') {
                return Math.max(0, correctAnswers - incorrectAnswers);
            }
            return correctAnswers;
        }
        return Object.values(scores).reduce((sum, item) => sum + (item?.score || 0), 0);
    }, [scores, trialScores, renderType, correctAnswers, incorrectAnswers, subtestId]);

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
    
    const handleTrialScore = (item: number, trial: number, score: number) => {
        setTrialScores(prev => ({
            ...prev,
            [item]: {
                ...(prev[item] || {}),
                [trial]: score
            }
        }));
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
        updateAndPersistScores(scores, nextItem);
    };

    const handlePrevItem = () => {
        setIsTimerActive(false);
        setTimer(0);
        const prevItem = Math.max(1, currentItem - 1);
        setCurrentItem(prevItem);
        updateAndPersistScores(scores, prevItem);
    };
    
    const currentItemScore = scores[currentItem]?.score;

    const renderInputInterface = () => {
        switch(renderType) {
            case 'SPEED_TEST':
                return (
                    <div className="space-y-6">
                        <div className="p-6 border rounded-lg bg-gray-900 flex flex-col items-center justify-center text-white">
                            <Timer className="h-12 w-12" />
                            <p className="text-6xl font-mono mt-2">{timer}s</p>
                            <p className="text-lg text-gray-300">/ 120s</p>
                        </div>
                         <Button size="lg" variant={isTimerActive ? "destructive" : "default"} onClick={() => setIsTimerActive(!isTimerActive)} className="w-full">
                            {isTimerActive ? <Pause className="mr-2 h-5 w-5"/> : <Play className="mr-2 h-5 w-5"/>}
                            {isTimerActive ? 'Pausar Cronómetro' : 'Iniciar Cronómetro'}
                        </Button>
                        <Separator />
                        {subtestId === 'BS' || subtestId === 'Ca' ? (
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="correct-answers">Aciertos</Label>
                                    <Input id="correct-answers" type="number" value={correctAnswers} onChange={e => setCorrectAnswers(Number(e.target.value))} placeholder="Correctos" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="incorrect-answers">Errores</Label>
                                    <Input id="incorrect-answers" type="number" value={incorrectAnswers} onChange={e => setIncorrectAnswers(Number(e.target.value))} placeholder="Incorrectos" />
                                </div>
                            </div>
                        ) : (
                             <div className="space-y-2">
                                <Label htmlFor="total-score">Total de Aciertos (Claves)</Label>
                                <Input id="total-score" type="number" value={correctAnswers} onChange={e => setCorrectAnswers(Number(e.target.value))} placeholder="Total correctos" />
                            </div>
                        )}
                         <div className="p-4 bg-blue-50 border border-blue-200 rounded-md text-center">
                            <p className="text-sm text-blue-800">Puntaje Bruto Final</p>
                            <p className="text-3xl font-bold text-blue-900">{totalScore}</p>
                         </div>
                    </div>
                );
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
            case 'MULTI_CHOICE':
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
             case 'SINGLE_CHOICE':
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
            case 'LETTER_NUMBER_SEQUENCING':
                const trials = [1, 2, 3];
                const lnItemData = { id: currentItem, stimulus: 'L-2-C-7', correctAnswer: '2-7-C-L' };

                return (
                    <div className="space-y-4 mt-2">
                        {trials.map(trial => {
                            const currentTrialScore = trialScores[currentItem]?.[trial];
                            const isTrialScored = currentTrialScore !== undefined && currentTrialScore !== null;
                            const isNextTrialDisabled = trial > 1 && (trialScores[currentItem]?.[trial - 1] === undefined || trialScores[currentItem]?.[trial-1] === null);

                            return (
                                <div key={trial} className={`p-3 border rounded-md ${isNextTrialDisabled ? 'bg-gray-100 opacity-50' : 'bg-white'}`}>
                                    <div className="flex justify-between items-center">
                                        <Label className="font-semibold">Intento {trial}</Label>
                                        <div className="flex items-center gap-2">
                                            <Button 
                                                size="sm"
                                                variant={currentTrialScore === 1 ? 'default' : 'outline'}
                                                onClick={() => handleTrialScore(currentItem, trial, 1)}
                                                disabled={isNextTrialDisabled}
                                            >
                                                Acierto
                                            </Button>
                                            <Button 
                                                size="sm" 
                                                variant={currentTrialScore === 0 ? 'destructive' : 'outline'}
                                                onClick={() => handleTrialScore(currentItem, trial, 0)}
                                                disabled={isNextTrialDisabled}
                                            >
                                                Error
                                            </Button>
                                        </div>
                                    </div>
                                    {isTrialScored && (
                                        <p className="text-xs text-gray-500 mt-2">Respuesta Correcta: <span className="font-mono">{lnItemData.correctAnswer}</span></p>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                );
            default:
                return <p>Tipo de renderizado no configurado.</p>;
        }
    }
    
    if (renderType === 'SPEED_TEST') {
        return (
            <div className="p-4 space-y-4">
                <h4 className="font-semibold text-lg">{subtestName} - Registro de Totales</h4>
                {renderInputInterface()}
                <Separator className="!mt-6" />
                <div className="flex justify-end items-center">
                    <p className="text-md font-bold">Puntaje Bruto Final: <span className="text-blue-600">{totalScore}</span></p>
                </div>
            </div>
        );
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
                <div className="space-y-4">
                    {!stimulusBooklet ? (
                        <div className="p-4 bg-gray-900 rounded-md border min-h-[240px] flex items-center justify-center">
                            <div className="text-white text-center p-4">
                                <p className="text-lg font-semibold">Consigna Oral</p>
                                <p className="text-sm">(Lea el problema en voz alta desde el manual de aplicación)</p>
                            </div>
                        </div>
                    ) : (
                        <StimulusDisplay subtestId={subtestId} itemId={currentItem} />
                    )}

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
                    
                    {renderType === 'VERBAL_CRITERIO' ? (
                        <GuiaCalificacion subtestId={subtestId} itemId={currentItem} />
                    ): (
                         <ProcessObservationTracker subtestId={subtestId} />
                    )}

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

const pedagogicalRecommendations = {
    icv: {
        title: "Comprensión Verbal (ICV)",
        strategies: [
            "Usar organizadores gráficos y apoyos visuales para compensar dificultades en el procesamiento de instrucciones verbales complejas.",
            "Enseñar explícitamente el vocabulario técnico antes de iniciar nuevas unidades temáticas.",
            "Fomentar el uso de diccionarios o glosarios digitales para promover la autonomía."
        ]
    },
    imt: {
        title: "Memoria de Trabajo (IMT)",
        strategies: [
            "Fragmentar las tareas largas en pasos cortos y proporcionar listas de verificación (checklists).",
            "Permitir el uso de apoyos externos como tablas de multiplicar, calculadoras o fórmulas durante la fase de aprendizaje.",
            "Dar instrucciones de una en una y confirmar la comprensión antes de continuar."
        ]
    },
    ivp: {
        title: "Velocidad de Procesamiento (IVP)",
        strategies: [
            "Otorgar tiempo adicional en exámenes y reducir la carga de copiado de pizarrón.",
            "Priorizar la calidad de las respuestas sobre la cantidad de ejercicios completados en un tiempo límite.",
            "Proporcionar los apuntes o presentaciones de clase por adelantado para reducir la carga de toma de notas en tiempo real."
        ]
    }
};

function PedagogicalRecommendations({ compositeScores }: { compositeScores: CompositeScoreProfile[] }) {
    const recommendationsToShow = [];
    
    const icvScore = compositeScores.find(s => s.name.includes('ICV'))?.score;
    if (icvScore && icvScore < 90) {
        recommendationsToShow.push(pedagogicalRecommendations.icv);
    }
    
    const imtScore = compositeScores.find(s => s.name.includes('IMT'))?.score;
    if (imtScore && imtScore < 90) {
        recommendationsToShow.push(pedagogicalRecommendations.imt);
    }

    const ivpScore = compositeScores.find(s => s.name.includes('IVP'))?.score;
    if (ivpScore && ivpScore < 90) {
        recommendationsToShow.push(pedagogicalRecommendations.ivp);
    }

    if (recommendationsToShow.length === 0) {
        return null;
    }

    return (
        <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <Lightbulb className="text-yellow-500" />
                Sugerencias de Intervención Pedagógica
            </h3>
            {recommendationsToShow.map(rec => (
                <div key={rec.title} className="p-4 border rounded-lg bg-gray-50">
                    <h4 className="font-semibold text-md text-gray-700">{rec.title}</h4>
                    <ul className="list-disc pl-5 mt-2 space-y-1 text-sm text-gray-600">
                        {rec.strategies.map((strategy, index) => (
                            <li key={index}>{strategy}</li>
                        ))}
                    </ul>
                </div>
            ))}
        </div>
    );
}

export default function WISCScoringConsole({ studentAge }: WISCScoringConsoleProps) {
    const isWais = studentAge >= 17;
    const subtestsByDomain = isWais ? subtestsByDomainWAIS : subtestsByDomainWISC;
    const scaleName = isWais ? "WAIS-IV" : "WISC-V";
    
    const orderedWiscSubtests = useMemo(() => {
        if (isWais) return [];
        return Object.values(subtestsByDomainWISC).flat().sort((a, b) => (a.order || 0) - (b.order || 0));
    }, [isWais]);


    const [rawScores, setRawScores] = useState<{ [key: string]: number }>({
        C: 48, S: 26, D: 28, M: 22, V: 45, A: 15, PV: 18, I: 20, Cl: 75, Ca: 50
    });
    const [results, setResults] = useState<ReturnType<typeof calculateClinicalProfile> | null>(null);
    const [clinicalObservations, setClinicalObservations] = useState('');

    const handleCalculate = () => {
        const scoresForCalc = {...rawScores};
        if (scoresForCalc.Ca && scoresForCalc.BS === undefined) {
        }

        const scaledScores: { [key: string]: number } = {};
        Object.entries(scoresForCalc).forEach(([key, value]) => {
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
        
        const processObservationsData = {};
        
        const narrativeReportObject = {
            metadata: {
                examiner: 'Dr. John Doe (Simulated)',
                evaluationDate: new Date().toISOString(),
                subjectAge: `${studentAge} años`,
            },
            scores: {
                rawScores: rawScores,
                compositeScores: results.compositeScores,
                strengthsAndWeaknesses: results.strengthsAndWeaknesses,
                processAnalysis: processObservationsData,
                secondaryIndexes: { }
            },
            narrative: {
                summary: `${resumen_ejecutivo}\n\nObservaciones Clínicas Adicionales:\n${clinicalObservations}`,
                behavioralObservations: clinicalObservations,
            },
        };

        Object.values(subtestsByDomain).flat().forEach(subtest => {
            try {
                localStorage.removeItem(`wisc_session_${subtest.id}`);
                localStorage.removeItem(`wisc_process_obs_${subtest.id}`);
            } catch (error) {
                console.error("No se pudo limpiar el localStorage para la subprueba:", subtest.id, error);
            }
        });

        console.log("--- SIMULACIÓN DE CIERRE SEGURO Y GENERACIÓN DE REPORTE ---", narrativeReportObject);
        console.log("--- SESIÓN LOCAL LIMPIADA ---");
        alert("CIERRE SEGURO (SIMULACIÓN): El protocolo ha sido finalizado. Revisa la consola para ver el objeto del reporte.");
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
                <div className="space-y-4">
                    <h3 className="font-semibold text-lg text-center lg:text-left">Protocolo de Aplicación</h3>
                     <Accordion type="single" collapsible className="w-full" defaultValue={isWais ? 'ICV' : undefined}>
                        {isWais ? (
                            Object.entries(subtestsByDomainWAIS).map(([domain, tests]) => (
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
                            ))
                        ) : (
                            orderedWiscSubtests.map(test => (
                                 <Accordion key={test.id} type="single" collapsible className="w-full">
                                    <AccordionItem value={test.id}>
                                        <AccordionTrigger className="text-md flex items-center justify-between p-3 border rounded-md bg-white">
                                            <div className="flex items-center gap-2">
                                                <BookOpen className="h-5 w-5 text-gray-600"/>
                                                <span className="font-semibold">{test.order}. {test.name}</span>
                                            </div>
                                            {test.optional && <span className="text-xs font-normal text-gray-500 ml-2">(Opcional)</span>}
                                        </AccordionTrigger>
                                        <AccordionContent className="pt-2">
                                            <SubtestApplicationConsole 
                                                subtestName={test.name}
                                                subtestId={test.id}
                                                renderType={test.renderType}
                                                stimulusBooklet={test.stimulusBooklet}
                                            />
                                        </AccordionContent>
                                    </AccordionItem>
                                </Accordion>
                            ))
                        )}
                    </Accordion>
                </div>

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
                                        {results.discrepancies.map((d: Discrepancy) => (
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
                                         {results.strengthsAndWeaknesses.map(s => s && (
                                            <TableRow key={s.name}>
                                                <TableCell>{s.name}</TableCell>
                                                <TableCell>{s.score}</TableCell>
                                                <TableCell className={s.classification.startsWith('F') ? 'font-bold text-green-600' : s.classification.startsWith('D') ? 'font-bold text-orange-600' : ''}>{s.classification}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>

                            <PedagogicalRecommendations compositeScores={results.compositeScores} />

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
