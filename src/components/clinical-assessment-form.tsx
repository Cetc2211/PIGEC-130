'use client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "./ui/textarea";
import { ClinicalAssessment } from "@/lib/store";
import { useEffect, useState } from "react";
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from "@/lib/firebase";
import { collection, getDocs, query, where } from "firebase/firestore";
import { AlertTriangle, CheckCircle2, Clock, FileText, Loader2 } from "lucide-react";

interface ClinicalAssessmentFormProps {
    initialData?: ClinicalAssessment;
    studentId?: string;
}

// Nombres amigables para las pruebas
const testLabels: Record<string, string> = {
    'PHQ-9': 'PHQ-9 (Depresión)',
    'GAD-7': 'GAD-7 (Ansiedad)',
    'BDI-II': 'BDI-II (Depresión Beck)',
    'BAI': 'BAI (Ansiedad Beck)',
    'HADS': 'HADS (Ansiedad/Depresión)',
    'IDARE/STAI': 'IDARE (Ansiedad Rasgo-Estado)',
    'BHS': 'BHS (Desesperanza)',
    'IPA': 'IPA (Pensamientos Automáticos)',
    'SSI': 'SSI (Ideación Suicida)',
    'Columbia C-SSRS': 'Columbia (Severidad Suicida)',
    'Plutchik': 'Plutchik (Riesgo Suicida)',
    'CDFR': 'CDFR (Factores de Riesgo)',
    'ASSIST': 'ASSIST (Sustancias)',
    'CHTE': 'CHTE (Hábitos de Estudio)',
};

interface TestResult {
    id: string;
    testType: string;
    score: number;
    interpretation: string;
    date: string;
    alerts?: string[];
}

export default function ClinicalAssessmentForm({ initialData, studentId }: ClinicalAssessmentFormProps) {
    const [user, authLoading] = useAuthState(auth);

    // Cargar resultados de pruebas desde Firestore
    const [testResults, setTestResults] = useState<TestResult[]>([]);
    const [loadingResults, setLoadingResults] = useState(false);
    const [loadError, setLoadError] = useState<string | null>(null);

    useEffect(() => {
        async function loadTestResults() {
            if (!studentId || authLoading) return;

            if (!db || !user) {
                setTestResults([]);
                setLoadError('Debe iniciar sesión con una cuenta autorizada para leer las evaluaciones del expediente.');
                setLoadingResults(false);
                return;
            }

            setLoadingResults(true);
            setLoadError(null);

            try {
                // Evita depender de índice compuesto (where + orderBy en campos distintos)
                // y ordena en memoria por fecha de envío.
                const q = query(
                    collection(db, 'test_results'),
                    where('studentId', '==', studentId)
                );
                const snapshot = await getDocs(q);
                type SortableResult = TestResult & { _sortDate: Date };
                const rawResults: SortableResult[] = [];
                snapshot.forEach(doc => {
                    const data = doc.data();
                    const sortDate = data.submittedAt?.toDate?.() || data.date?.toDate?.() || new Date(0);
                    rawResults.push({
                        id: doc.id,
                        testType: data.testType || data.type || 'Desconocida',
                        score: data.score || data.totalScore || data.totalRisk || data.totalRiesgo || 0,
                        interpretation: data.interpretation || data.interpretacion || data.level || data.riskLevel || '',
                        date: sortDate.toLocaleDateString('es-MX'),
                        alerts: data.alerts || [],
                        _sortDate: sortDate,
                    });
                });

                rawResults.sort((a, b) => b._sortDate.getTime() - a._sortDate.getTime());

                setTestResults(rawResults.map(({ _sortDate, ...rest }) => rest));
            } catch (err) {
                console.error('Error cargando resultados de pruebas:', err);
                const errorMessage = (err as any)?.message || '';
                if (errorMessage.includes('Missing or insufficient permissions') || errorMessage.includes('PERMISSION_DENIED')) {
                    setLoadError('Sin permisos para leer resultados de pruebas. Verifique autenticación del personal o reglas Firestore de lectura para test_results.');
                } else {
                    setLoadError(`No se pudieron cargar resultados: ${errorMessage || 'Error desconocido'}`);
                }
            }

            setLoadingResults(false);
        }

        loadTestResults();
    }, [authLoading, studentId, user]);

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        
        const formData = new FormData(event.currentTarget);
        const effectiveStudentId = studentId || 'S001';
        const data: Omit<ClinicalAssessment, 'fecha_evaluacion'> = {
            studentId: effectiveStudentId,
            bdi_ii_score: Number(formData.get('bdi_score')),
            bai_score: Number(formData.get('bai_score')),
            riesgo_suicida_beck_score: Number(formData.get('beck_suicide_score')),
            neuro_mt_score: Number(formData.get('mt_index')),
            neuro_as_score: Number(formData.get('as_index')),
            neuro_vp_score: Number(formData.get('vp_index')),
            contexto_carga_cognitiva: formData.get('cognitive_load_context') as string,
            assist_result: formData.get('assist_result') as string,
            conducta_autolesiva_score: Number(formData.get('self_harm_score')),
            impresion_diagnostica: formData.get('diagnostic_impression') as string,
        };

        const finalData = { ...data, fecha_evaluacion: new Date().toISOString() };

        console.log("Guardando en 'clinical_assessments':", finalData);
        alert("Perfil Clínico y Evaluación guardados (simulación). Revisa la consola.");
    };

    return (
        <div className="space-y-12">
            {/* ─── RESULTADOS DE PRUEBAS APLICADAS ─────────────────────── */}
            <Card className="shadow-lg">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5 text-blue-600" />
                        Resultados de Pruebas Aplicadas
                    </CardTitle>
                    <CardDescription>
                        Pruebas psicométricas respondidas por el estudiante a través del Banco de Pruebas.
                        Los resultados se integran automáticamente al expediente.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {loadingResults && (
                        <div className="flex items-center justify-center py-8 gap-2 text-gray-500">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Cargando resultados de pruebas...
                        </div>
                    )}

                    {!loadingResults && testResults.length === 0 && (
                        <div className="text-center py-8">
                            <Clock className="h-10 w-10 mx-auto mb-3 text-gray-300" />
                            <p className="text-gray-500">No hay resultados de pruebas registrados</p>
                            <p className="text-xs text-gray-400 mt-1">
                                Cuando se apliquen pruebas desde el Banco de Pruebas, los resultados aparecerán aquí automáticamente.
                            </p>
                        </div>
                    )}

                    {loadError && (
                        <div className="mt-3 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                            {loadError}
                        </div>
                    )}

                    {!loadingResults && testResults.length > 0 && (
                        <>
                            <div className="flex items-center gap-2 mb-4">
                                <Badge className="bg-blue-100 text-blue-700">
                                    {testResults.length} prueba{testResults.length !== 1 ? 's' : ''} registrada{testResults.length !== 1 ? 's' : ''}
                                </Badge>
                            </div>
                            <div className="space-y-3">
                                {testResults.map((result) => (
                                    <div
                                        key={result.id}
                                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={`h-10 w-10 rounded-full flex items-center justify-center text-sm font-bold ${
                                                result.alerts && result.alerts.length > 0
                                                    ? 'bg-red-100 text-red-700'
                                                    : result.score >= 15
                                                        ? 'bg-amber-100 text-amber-700'
                                                        : 'bg-green-100 text-green-700'
                                            }`}>
                                                {result.score}
                                            </div>
                                            <div>
                                                <p className="font-medium text-sm">
                                                    {testLabels[result.testType] || result.testType}
                                                </p>
                                                <p className="text-xs text-gray-500">
                                                    Aplicada: {result.date}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {result.interpretation && (
                                                <Badge
                                                    variant="outline"
                                                    className={
                                                        result.interpretation.toLowerCase().includes('severo') ||
                                                        result.interpretation.toLowerCase().includes('alto')
                                                            ? 'bg-red-50 text-red-700 border-red-200'
                                                            : result.interpretation.toLowerCase().includes('moderado') ||
                                                                result.interpretation.toLowerCase().includes('medio')
                                                                ? 'bg-amber-50 text-amber-700 border-amber-200'
                                                                : 'bg-green-50 text-green-700 border-green-200'
                                                    }
                                                >
                                                    {result.interpretation}
                                                </Badge>
                                            )}
                                            {result.alerts && result.alerts.map((alert, i) => (
                                                <Badge key={i} variant="destructive" className="text-[10px] px-1.5">
                                                    <AlertTriangle className="h-3 w-3 mr-1" />
                                                    {alert}
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </CardContent>
            </Card>

            {/* ─── EVALUACIÓN CLÍNICA MANUAL ───────────────────────────── */}
            <Card className="shadow-lg">
                <CardHeader>
                    <CardTitle>Módulo 2.1: Evaluación Clínica</CardTitle>
                    <CardDescription>
                        Registro manual de puntajes de screening, tamizaje neuropsicológico e impresión diagnóstica.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-8">
                        {/* SECCIÓN I: SCREENING EMOCIONAL */}
                        <div>
                            <h3 className="text-lg font-semibold text-gray-700 mb-4">I. Screening Emocional</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="bdi-score">Puntuación BDI-II (Depresión)</Label>
                                    <Input id="bdi-score" name="bdi_score" type="number" placeholder="Ej. 25" defaultValue={initialData?.bdi_ii_score} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="bai-score">Puntuación BAI (Ansiedad)</Label>
                                    <Input id="bai-score" name="bai_score" type="number" placeholder="Ej. 21" defaultValue={initialData?.bai_score} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="beck-suicide-score">Puntaje Ideación Suicida (Beck)</Label>
                                    <Input id="beck-suicide-score" name="beck_suicide_score" type="number" placeholder="Ej. 10" defaultValue={initialData?.riesgo_suicida_beck_score} />
                                </div>
                            </div>
                        </div>

                        <Separator />

                        {/* SECCIÓN II: TAMIZAJE NEUROPSICOLÓGICO */}
                        <div>
                            <h3 className="text-lg font-semibold text-gray-700 mb-4">II. Tamizaje Neuropsicológico (Funciones Ejecutivas)</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="mt-index">Índice Memoria de Trabajo (MT)</Label>
                                    <Input id="mt-index" name="mt_index" type="number" placeholder="Ej. 85" defaultValue={initialData?.neuro_mt_score} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="as-index">Índice Atención Sostenida (AS)</Label>
                                    <Input id="as-index" name="as_index" type="number" placeholder="Ej. 90" defaultValue={initialData?.neuro_as_score} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="vp-index">Índice Velocidad de Procesamiento (VP)</Label>
                                    <Input id="vp-index" name="vp_index" type="number" placeholder="Ej. 80" defaultValue={initialData?.neuro_vp_score} />
                                </div>
                            </div>
                             <div className="mt-6 space-y-2">
                                <Label htmlFor="cognitive-load-context">Contexto de Carga Cognitiva / Estrés</Label>
                                <Textarea id="cognitive-load-context" name="cognitive_load_context" placeholder="Describir situación actual que impacta el desempeño (ej. 'Exámenes finales', 'Conflicto familiar')." defaultValue={initialData?.contexto_carga_cognitiva} />
                            </div>
                        </div>
                        
                        <Separator />

                        {/* SECCIÓN III: CONDUCTAS DE RIESGO */}
                        <div>
                            <h3 className="text-lg font-semibold text-gray-700 mb-4">III. Conductas de Riesgo</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                 <div className="space-y-2">
                                    <Label htmlFor="assist-result">Resultado ASSIST (Consumo de Sustancias)</Label>
                                    <Input id="assist-result" name="assist_result" placeholder="Positivo / Negativo" defaultValue={initialData?.assist_result} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="self-harm-score">Puntaje Conductas Autolesivas (Frecuencia)</Label>
                                    <Input id="self-harm-score" name="self_harm_score" type="number" placeholder="Ej. 5" defaultValue={initialData?.conducta_autolesiva_score} />
                                </div>
                            </div>
                        </div>

                        <Separator />
                        
                        {/* SECCIÓN IV: IMPRESIÓN DIAGNÓSTICA */}
                        <div>
                            <h3 className="text-lg font-semibold text-gray-700 mb-4">IV. Impresión Diagnóstica (Provisional)</h3>
                             <div className="space-y-2">
                                <Label htmlFor="diagnostic-impression">Hipótesis Clínica Basada en la Evidencia Recopilada</Label>
                                <Textarea id="diagnostic-impression" name="diagnostic_impression" placeholder="Ej. 'Sintomatología depresiva y ansiosa severa, posiblemente exacerbada por déficit en memoria de trabajo y estresores académicos. Riesgo suicida activo a monitorear.'" defaultValue={initialData?.impresion_diagnostica} />
                            </div>
                        </div>


                        <div className="flex justify-end pt-4">
                            <Button type="submit" className="bg-pink-600 hover:bg-pink-700 text-white font-bold">
                                Actualizar Evaluación Clínica
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
