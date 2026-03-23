'use client';

import { useParams, redirect } from 'next/navigation';
import { useSession } from '@/context/SessionContext';
import React, { useEffect, useState, useMemo } from 'react';

import ClinicalAssessmentForm from "@/components/clinical-assessment-form";
import FunctionalAnalysisForm from "@/components/functional-analysis-form";
import TreatmentPlanGenerator from "@/components/treatment-plan-generator";
import ProgressTracker from "@/components/progress-tracker";
import PIEIGenerator from "@/components/piei-generator";
import ReportGenerator from "@/components/ReportGenerator";
import { getStudentById, getClinicalAssessmentByStudentId, getFunctionalAnalysisByStudentId, getTreatmentPlanByStudentId, getProgressTrackingByStudentId, Student, ClinicalAssessment } from "@/lib/store";
import ClinicalKPILogger from '@/components/ClinicalKPILogger';
import RiskTimelineChart from '@/components/RiskTimelineChart';
import SOAPNotesForm from '@/components/SOAPNotesForm';

import DiagnosticImpressionAI from '@/components/diagnostic-impression-ai';
import IntelligentRiskAlerts from '@/components/intelligent-risk-alerts';
import { DiagnosticImpressionInput, DiagnosticImpressionOutput } from '@/ai/flows/diagnostic-impression-flow';
import { calculateIntegratedRiskProfile, StudentRiskProfile } from '@/lib/intelligent-risk-alerts';

import IndividualTestManagement from '@/components/individual-test-management';

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal, ShieldAlert, Loader, FileText, FileDown, Activity, UserCheck, Sparkles, Brain, RefreshCw, ClipboardList, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import StudentIdentificationCard from '@/components/StudentIdentificationCard';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';

// Interfaz para expediente de Firebase
interface FirebaseExpediente {
    id: string;
    matricula: string;
    nombreCompleto: string;
    grupoId: string;
    grupoNombre: string;
    sessionId: string;
    sessionName: string;
    estado: 'en_progreso' | 'completado';
    testsCompletados: number;
    testsTotal: number;
    fechaCreacion?: Date;
    fechaCompletado?: Date;
}

// Función para convertir expediente Firebase a Student
function expedienteToStudent(exp: FirebaseExpediente, testResults: any[]): Student {
    // Calcular nivel de riesgo basado en los resultados de pruebas
    let riskLevel: 'Bajo' | 'Medio' | 'Alto' | 'Crítico' = 'Bajo';
    
    testResults.forEach(result => {
        if (result.puntaje !== null) {
            const score = result.puntaje;
            const testId = result.testId;
            
            // GAD-7 o BAI (ansiedad)
            if (testId === 'gad-7' || testId === 'bai') {
                if (score >= 15) riskLevel = riskLevel === 'Crítico' || riskLevel === 'Alto' ? riskLevel : 'Alto';
                else if (score >= 10) riskLevel = riskLevel === 'Crítico' || riskLevel === 'Alto' || riskLevel === 'Medio' ? riskLevel : 'Medio';
            }
            // PHQ-9 o BDI-II (depresión)
            if (testId === 'phq-9' || testId === 'bdi-ii') {
                if (score >= 20) riskLevel = 'Crítico';
                else if (score >= 15) riskLevel = riskLevel === 'Crítico' ? riskLevel : 'Alto';
                else if (score >= 10) riskLevel = riskLevel === 'Crítico' || riskLevel === 'Alto' ? riskLevel : 'Medio';
            }
        }
    });

    return {
        id: exp.matricula,
        name: exp.nombreCompleto,
        demographics: {
            age: 0, // No disponible en Firebase
            group: exp.grupoNombre,
            semester: 1
        },
        emergencyContact: {
            name: 'No registrado',
            phone: 'No registrado'
        },
        suicideRiskLevel: riskLevel,
        academicData: {
            gpa: 0,
            absences: 0
        },
        dualRelationshipNote: `Expediente generado desde evaluación: ${exp.sessionName}`
    };
}

// Función para interpretar puntajes de pruebas
function interpretarPuntajeTest(testId: string, puntaje: number | null): { nivel: string; color: string } {
    if (puntaje === null) return { nivel: 'N/A', color: '#6b7280' };

    switch (testId) {
        case 'gad-7':
            if (puntaje <= 4) return { nivel: 'Ansiedad mínima', color: '#22c55e' };
            if (puntaje <= 9) return { nivel: 'Ansiedad leve', color: '#eab308' };
            if (puntaje <= 14) return { nivel: 'Ansiedad moderada', color: '#f97316' };
            return { nivel: 'Ansiedad grave', color: '#ef4444' };

        case 'phq-9':
            if (puntaje <= 4) return { nivel: 'Depresión mínima', color: '#22c55e' };
            if (puntaje <= 9) return { nivel: 'Depresión leve', color: '#eab308' };
            if (puntaje <= 14) return { nivel: 'Depresión moderada', color: '#f97316' };
            if (puntaje <= 19) return { nivel: 'Dep. moderadamente severa', color: '#f97316' };
            return { nivel: 'Depresión grave', color: '#ef4444' };

        case 'bai':
            if (puntaje <= 7) return { nivel: 'Ansiedad mínima', color: '#22c55e' };
            if (puntaje <= 15) return { nivel: 'Ansiedad leve', color: '#eab308' };
            if (puntaje <= 25) return { nivel: 'Ansiedad moderada', color: '#f97316' };
            return { nivel: 'Ansiedad severa', color: '#ef4444' };

        case 'bdi-ii':
            if (puntaje <= 10) return { nivel: 'Depresión mínima', color: '#22c55e' };
            if (puntaje <= 16) return { nivel: 'Depresión leve', color: '#eab308' };
            if (puntaje <= 20) return { nivel: 'Depresión moderada', color: '#f97316' };
            if (puntaje <= 30) return { nivel: 'Depresión severa', color: '#f97316' };
            return { nivel: 'Depresión muy severa', color: '#ef4444' };

        default:
            return { nivel: `Puntaje: ${puntaje}`, color: '#3b82f6' };
    }
}

export default function ExpedienteContent() {
    const params = useParams();
    const studentId = params.id as string;
    const { role } = useSession();
    
    const [student, setStudent] = useState<Student | null>(null);
    const [loading, setLoading] = useState(true);
    const [notFound, setNotFound] = useState(false);
    const [firebaseExpediente, setFirebaseExpediente] = useState<FirebaseExpediente | null>(null);
    const [firebaseTestResults, setFirebaseTestResults] = useState<any[]>([]);
    
    const [showAIFeatures, setShowAIFeatures] = useState(true);
    const [diagnosticOutput, setDiagnosticOutput] = useState<DiagnosticImpressionOutput | null>(null);
    const [error, setError] = useState<string | null>(null);

    // Cargar estudiante desde store.ts o Firebase
    useEffect(() => {
        async function loadStudent() {
            if (!studentId) return;
            
            setLoading(true);
            setNotFound(false);
            
            try {
                // 1. Primero buscar en store.ts (datos de ejemplo)
                const localStudent = getStudentById(studentId);
                
                if (localStudent) {
                    setStudent(localStudent);
                    setLoading(false);
                    return;
                }
                
                // 2. Si no existe, buscar en Firebase
                if (db) {
                    // Buscar por matrícula en la colección 'expedientes'
                    const expedientesQuery = query(
                        collection(db, 'expedientes'),
                        where('matricula', '==', studentId)
                    );
                    
                    const expedientesSnapshot = await getDocs(expedientesQuery);
                    
                    if (!expedientesSnapshot.empty) {
                        const expedienteDoc = expedientesSnapshot.docs[0];
                        const expedienteData = expedienteDoc.data();
                        
                        const expediente: FirebaseExpediente = {
                            id: expedienteDoc.id,
                            matricula: expedienteData.matricula || '',
                            nombreCompleto: expedienteData.nombreCompleto || '',
                            grupoId: expedienteData.grupoId || '',
                            grupoNombre: expedienteData.grupoNombre || '',
                            sessionId: expedienteData.sessionId || '',
                            sessionName: expedienteData.sessionName || '',
                            estado: expedienteData.estado || 'en_progreso',
                            testsCompletados: expedienteData.testsCompletados || 0,
                            testsTotal: expedienteData.testsTotal || 7,
                            fechaCreacion: expedienteData.fechaCreacion?.toDate(),
                            fechaCompletado: expedienteData.fechaCompletado?.toDate()
                        };
                        
                        setFirebaseExpediente(expediente);
                        
                        // Cargar resultados de pruebas
                        const resultsQuery = query(
                            collection(db, 'test_results'),
                            where('matricula', '==', studentId)
                        );
                        
                        const resultsSnapshot = await getDocs(resultsQuery);
                        const results = resultsSnapshot.docs.map(doc => ({
                            id: doc.id,
                            ...doc.data(),
                            fechaCompletado: doc.data().fechaCompletado?.toDate()
                        }));
                        
                        setFirebaseTestResults(results);
                        
                        // Convertir a Student
                        const studentFromFirebase = expedienteToStudent(expediente, results);
                        setStudent(studentFromFirebase);
                        setLoading(false);
                        return;
                    }
                }
                
                // 3. No encontrado en ningún lado
                setNotFound(true);
                setError(`No se encontró el expediente con ID: ${studentId}`);
                
            } catch (err) {
                console.error('Error al cargar estudiante:', err);
                setError('No se pudo cargar la información del estudiante');
            }
            
            setLoading(false);
        }
        
        loadStudent();
    }, [studentId]);

    useEffect(() => {
        if (role && role !== 'loading' && role !== 'Clinico') {
            console.log('ACCESO DENEGADO: Redirigiendo.');
            redirect('/educativa/estudiante/' + studentId);
        }
    }, [role, studentId]);

    // Pantalla de error
    if (error && notFound) {
        return (
            <div className="flex h-screen w-full items-center justify-center p-8">
                <Alert variant="destructive" className="max-w-md">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Expediente no encontrado</AlertTitle>
                    <AlertDescription>
                        {error}
                        <div className="mt-4">
                            <Button variant="outline" size="sm" onClick={() => window.history.back()}>
                                Volver
                            </Button>
                        </div>
                    </AlertDescription>
                </Alert>
            </div>
        );
    }

    // Pantalla de error genérico
    if (error) {
        return (
            <div className="flex h-screen w-full items-center justify-center p-8">
                <Alert variant="destructive" className="max-w-md">
                    <ShieldAlert className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            </div>
        );
    }

    // Pantalla de carga
    if (role === 'loading' || loading) {
        return (
            <div className="flex h-screen w-full items-center justify-center p-8">
                <div className="flex items-center gap-2 text-xl text-gray-600">
                    <Loader className="animate-spin" />
                    {role === 'loading' ? 'Verificando Permisos de Seguridad...' : 'Cargando datos del estudiante...'}
                </div>
            </div>
        );
    }
    
    // Si no hay estudiante después de cargar
    if (!student) {
        return (
            <div className="flex h-screen w-full items-center justify-center p-8">
                <Alert variant="destructive" className="max-w-md">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Expediente no encontrado</AlertTitle>
                    <AlertDescription>
                        No se pudo encontrar el expediente solicitado.
                        <div className="mt-4">
                            <Button variant="outline" size="sm" onClick={() => window.history.back()}>
                                Volver
                            </Button>
                        </div>
                    </AlertDescription>
                </Alert>
            </div>
        );
    }
    
    if (role !== 'Clinico') {
        return null;
    }

    const clinicalAssessment = getClinicalAssessmentByStudentId(studentId);
    const functionalAnalysis = getFunctionalAnalysisByStudentId(studentId);
    const treatmentPlan = getTreatmentPlanByStudentId(studentId);
    const progressTracking = getProgressTrackingByStudentId(studentId);

    const isHighRisk = student?.suicideRiskLevel === 'Alto' || student?.suicideRiskLevel === 'Critico';

    const clinicalDataForAI: DiagnosticImpressionInput = useMemo(() => ({
        studentName: student.name,
        bdi_score: clinicalAssessment?.bdi_ii_score,
        bai_score: clinicalAssessment?.bai_score,
        beck_suicide_score: clinicalAssessment?.riesgo_suicida_beck_score,
        neuro_mt_score: clinicalAssessment?.neuro_mt_score,
        neuro_as_score: clinicalAssessment?.neuro_as_score,
        neuro_vp_score: clinicalAssessment?.neuro_vp_score,
        cognitive_load_context: clinicalAssessment?.contexto_carga_cognitiva,
        assist_result: clinicalAssessment?.assist_result,
        self_harm_score: clinicalAssessment?.conducta_autolesiva_score,
    }), [student.name, clinicalAssessment]);

    const academicDataForRisk = {
        attendanceRate: 85,
        grade: 75,
        activityRate: 0.8,
        participationRate: 0.7,
    };

    const riskProfile = useMemo(() => {
        return calculateIntegratedRiskProfile(
            studentId,
            student.name,
            academicDataForRisk,
            clinicalDataForAI
        );
    }, [studentId, student.name, academicDataForRisk, clinicalDataForAI]);

    const handleImpressionGenerated = (impression: DiagnosticImpressionOutput) => {
        setDiagnosticOutput(impression);
    };

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-7xl mx-auto">
                 <div className="mb-8 flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-extrabold text-red-700">EXPEDIENTE CLINICO NIVEL 3 - CONFIDENCIAL</h1>
                        <p className="text-md text-gray-500">{student.name}</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button 
                            variant="outline" 
                            size="sm"
                            onClick={function() { setShowAIFeatures(!showAIFeatures); }}
                            className="gap-2"
                        >
                            {showAIFeatures ? <RefreshCw className="h-4 w-4" /> : <Sparkles className="h-4 w-4" />}
                            {showAIFeatures ? 'Ocultar IA' : 'Mostrar IA'}
                        </Button>
                        {riskProfile && (
                            <Badge 
                                className={
                                    riskProfile.integratedRiskLevel === 'critico' ? 'bg-red-600 text-white animate-pulse' :
                                    riskProfile.integratedRiskLevel === 'alto' ? 'bg-red-500 text-white' :
                                    riskProfile.integratedRiskLevel === 'medio' ? 'bg-amber-500 text-white' :
                                    'bg-green-500 text-white'
                                }
                            >
                                Riesgo: {riskProfile.integratedRiskLevel.toUpperCase()} ({riskProfile.integratedRiskScore}%)
                            </Badge>
                        )}
                    </div>
                </div>
                
                {isHighRisk && (
                    <Alert variant="destructive" className="mb-8">
                        <ShieldAlert className="h-4 w-4" />
                        <AlertTitle>
                            {student?.suicideRiskLevel === 'Critico' ? 'Alerta de Riesgo Critico (Codigo Rojo)' : 'Alerta de Riesgo Alto'}
                        </AlertTitle>
                        <AlertDescription>
                            Este caso esta marcado con Riesgo Suicida. Se debe priorizar la aplicacion inmediata del Plan de Seguridad.
                        </AlertDescription>
                    </Alert>
                )}

                {showAIFeatures && riskProfile && riskProfile.activeAlerts.length > 0 && (
                    <div className="mb-8">
                        <IntelligentRiskAlerts
                            studentId={studentId}
                            studentName={student.name}
                            academicData={academicDataForRisk}
                            clinicalData={clinicalDataForAI}
                        />
                    </div>
                )}

                <Alert className="mb-8 border-yellow-500 text-yellow-800">
                    <Terminal className="h-4 w-4" />
                    <AlertTitle>Disclaimer Deontologico (Cap. 1.5)</AlertTitle>
                    <AlertDescription>
                        El resultado de este expediente constituye una Alerta de Riesgo y una <strong>Impresion Diagnostica Provisional</strong>, no un diagnostico nosologico definitivo.
                    </AlertDescription>
                </Alert>

                <Tabs defaultValue="resumen" className="w-full">
                    <TabsList className="grid w-full grid-cols-5">
                        <TabsTrigger value="identificacion"><UserCheck className="mr-2"/>Ficha de Identificacion</TabsTrigger>
                        <TabsTrigger value="resumen"><Activity className="mr-2"/>Resumen Ejecutivo</TabsTrigger>
                        <TabsTrigger value="pruebas"><ClipboardList className="mr-2"/>Gestion de Pruebas</TabsTrigger>
                        <TabsTrigger value="soap"><FileText className="mr-2"/>Evolucion y Notas</TabsTrigger>
                        <TabsTrigger value="documentacion"><FileDown className="mr-2"/>Documentacion Legal</TabsTrigger>
                    </TabsList>

                    <TabsContent value="identificacion" className="mt-6">
                        <StudentIdentificationCard student={student} />
                    </TabsContent>
                    
                    <TabsContent value="resumen" className="mt-6 space-y-12">
                        {/* Mostrar información del expediente de Firebase si existe */}
                        {firebaseExpediente && (
                            <Card className="border-2 border-blue-200 bg-blue-50/30">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-lg">
                                        <FileText className="h-5 w-5 text-blue-600" />
                                        Información de Evaluación
                                    </CardTitle>
                                    <CardDescription>
                                        Datos de la sesión de evaluación psicométrica
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        <div className="p-3 rounded-lg bg-white border">
                                            <div className="text-xs text-gray-500 font-medium">Grupo</div>
                                            <div className="text-lg font-semibold text-gray-800">{firebaseExpediente.grupoNombre}</div>
                                        </div>
                                        <div className="p-3 rounded-lg bg-white border">
                                            <div className="text-xs text-gray-500 font-medium">Sesión</div>
                                            <div className="text-lg font-semibold text-gray-800">{firebaseExpediente.sessionName}</div>
                                        </div>
                                        <div className="p-3 rounded-lg bg-white border">
                                            <div className="text-xs text-gray-500 font-medium">Estado</div>
                                            <Badge variant={firebaseExpediente.estado === 'completado' ? 'default' : 'secondary'}>
                                                {firebaseExpediente.estado === 'completado' ? 'Completado' : 'En progreso'}
                                            </Badge>
                                        </div>
                                        <div className="p-3 rounded-lg bg-white border">
                                            <div className="text-xs text-gray-500 font-medium">Progreso</div>
                                            <div className="text-lg font-semibold text-gray-800">
                                                {firebaseExpediente.testsCompletados}/{firebaseExpediente.testsTotal} pruebas
                                            </div>
                                        </div>
                                    </div>
                                    
                                    {/* Mostrar resultados de pruebas */}
                                    {firebaseTestResults.length > 0 && (
                                        <div className="mt-6">
                                            <h4 className="font-semibold text-gray-700 mb-3">Resultados de Pruebas Aplicadas</h4>
                                            <div className="space-y-2">
                                                {firebaseTestResults.map((result, index) => {
                                                    const interpretacion = interpretarPuntajeTest(result.testId, result.puntaje);
                                                    return (
                                                        <div key={result.id || index} className="flex items-center justify-between p-3 bg-white rounded-lg border">
                                                            <div>
                                                                <span className="font-medium">{result.testName || result.testId}</span>
                                                                <span className="text-sm text-gray-500 ml-2">
                                                                    {result.fechaCompletado ? new Date(result.fechaCompletado).toLocaleDateString('es-MX') : ''}
                                                                </span>
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                <span className="font-semibold">{result.puntaje !== null ? result.puntaje : 'N/A'}</span>
                                                                <Badge style={{ backgroundColor: interpretacion.color, color: 'white' }}>
                                                                    {interpretacion.nivel}
                                                                </Badge>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        )}
                        
                        {showAIFeatures && riskProfile && (
                            <Card className="border-2 border-purple-200 bg-purple-50/30">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-lg">
                                        <Brain className="h-5 w-5 text-purple-600" />
                                        Perfil de Riesgo Multidimensional (IA)
                                    </CardTitle>
                                    <CardDescription>
                                        Analisis integrado de factores academicos, emocionales, conductuales y neurocognitivos
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                                        <div className={'p-3 rounded-lg text-center ' + (riskProfile.integratedRiskLevel === 'critico' ? 'bg-red-100 border-2 border-red-500' : riskProfile.integratedRiskLevel === 'alto' ? 'bg-red-50 border border-red-200' : 'bg-gray-50')}>
                                            <div className="text-xs text-gray-500 font-medium">INTEGRADO</div>
                                            <div className={'text-2xl font-bold ' + (riskProfile.integratedRiskLevel === 'critico' ? 'text-red-600' : riskProfile.integratedRiskLevel === 'alto' ? 'text-red-500' : riskProfile.integratedRiskLevel === 'medio' ? 'text-amber-500' : 'text-green-500')}>
                                                {riskProfile.integratedRiskScore}%
                                            </div>
                                            <Badge className={'text-xs ' + (riskProfile.integratedRiskLevel === 'critico' ? 'bg-red-600' : riskProfile.integratedRiskLevel === 'alto' ? 'bg-red-500' : riskProfile.integratedRiskLevel === 'medio' ? 'bg-amber-500' : 'bg-green-500') + ' text-white'}>
                                                {riskProfile.integratedRiskLevel.toUpperCase()}
                                            </Badge>
                                        </div>
                                        <div className="p-3 rounded-lg text-center bg-gray-50">
                                            <div className="text-xs text-gray-500 font-medium" suppressHydrationWarning>Academico</div>
                                            <div className={'text-xl font-bold ' + (riskProfile.academicRiskLevel === 'alto' ? 'text-red-500' : riskProfile.academicRiskLevel === 'medio' ? 'text-amber-500' : 'text-green-500')}>
                                                {riskProfile.academicRiskScore}%
                                            </div>
                                            <div className="text-xs text-gray-400">Rep: {riskProfile.failingRisk}%</div>
                                        </div>
                                        <div className="p-3 rounded-lg text-center bg-gray-50">
                                            <div className="text-xs text-gray-500 font-medium" suppressHydrationWarning>Emocional</div>
                                            <div className={'text-xl font-bold ' + (riskProfile.emotionalRiskLevel === 'critico' ? 'text-red-600' : riskProfile.emotionalRiskLevel === 'alto' ? 'text-red-500' : riskProfile.emotionalRiskLevel === 'medio' ? 'text-amber-500' : 'text-green-500')}>
                                                {riskProfile.emotionalRiskScore}%
                                            </div>
                                            <div className="text-xs text-gray-400">{riskProfile.depressionIndicators.length + riskProfile.anxietyIndicators.length} indicadores</div>
                                        </div>
                                        <div className={'p-3 rounded-lg text-center ' + (riskProfile.suicideRisk || riskProfile.selfHarmRisk ? 'bg-red-50 border border-red-300' : 'bg-gray-50')}>
                                            <div className="text-xs text-gray-500 font-medium" suppressHydrationWarning>Conductual</div>
                                            <div className={'text-xl font-bold ' + (riskProfile.behavioralRiskLevel === 'alto' ? 'text-red-500' : riskProfile.behavioralRiskLevel === 'medio' ? 'text-amber-500' : 'text-green-500')}>
                                                {riskProfile.behavioralRiskScore}%
                                            </div>
                                            <div className="flex justify-center gap-1 mt-1 flex-wrap">
                                                {riskProfile.suicideRisk && <Badge variant="destructive" className="text-xs">Suicida</Badge>}
                                                {riskProfile.selfHarmRisk && <Badge variant="destructive" className="text-xs">Autolesion</Badge>}
                                            </div>
                                        </div>
                                        <div className="p-3 rounded-lg text-center bg-gray-50">
                                            <div className="text-xs text-gray-500 font-medium" suppressHydrationWarning>Neurocog.</div>
                                            <div className={'text-xl font-bold ' + (riskProfile.neurocognitiveRiskLevel === 'alto' ? 'text-red-500' : riskProfile.neurocognitiveRiskLevel === 'medio' ? 'text-amber-500' : 'text-green-500')}>
                                                {riskProfile.neurocognitiveRiskScore}%
                                            </div>
                                            <div className="text-xs text-gray-400">{riskProfile.affectedDomains.length > 0 ? riskProfile.affectedDomains.join(', ') : 'Sin deficit'}</div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        <ClinicalAssessmentForm initialData={clinicalAssessment} />
                        
                        {showAIFeatures && (
                            <DiagnosticImpressionAI
                                clinicalData={clinicalDataForAI}
                                onImpressionGenerated={handleImpressionGenerated}
                                existingImpression={clinicalAssessment?.impresion_diagnostica}
                            />
                        )}

                        <FunctionalAnalysisForm studentName={student.name} initialData={functionalAnalysis} />
                        <TreatmentPlanGenerator studentName={student.name} initialData={treatmentPlan} />
                        <PIEIGenerator clinicalData={clinicalAssessment} />
                        <ProgressTracker initialData={progressTracking} />
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <ClinicalKPILogger />
                            <RiskTimelineChart />
                        </div>
                    </TabsContent>
                    
                    <TabsContent value="pruebas" className="mt-6 space-y-6">
                        <IndividualTestManagement 
                            studentId={studentId} 
                            student={student}
                        />
                    </TabsContent>

                    <TabsContent value="soap" className="mt-6">
                        <SOAPNotesForm />
                    </TabsContent>

                    <TabsContent value="documentacion" className="mt-6">
                         <ReportGenerator student={student} clinicalAssessment={clinicalAssessment} />
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}
