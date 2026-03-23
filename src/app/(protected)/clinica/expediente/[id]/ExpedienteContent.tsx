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
import { Terminal, ShieldAlert, Loader, FileText, FileDown, Activity, UserCheck, Sparkles, Brain, RefreshCw, ClipboardList } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import StudentIdentificationCard from '@/components/StudentIdentificationCard';

export default function ExpedienteContent() {
    const params = useParams();
    const studentId = params.id as string;
    const { role } = useSession();
    
    const studentState = useState<Student | undefined>(undefined);
    const student = studentState[0];
    const setStudent = studentState[1];
    
    const showAIFeaturesState = useState(true);
    const showAIFeatures = showAIFeaturesState[0];
    const setShowAIFeatures = showAIFeaturesState[1];
    
    const diagnosticOutputState = useState<DiagnosticImpressionOutput | null>(null);
    const diagnosticOutput = diagnosticOutputState[0];
    const setDiagnosticOutput = diagnosticOutputState[1];
    
    const errorState = useState<string | null>(null);
    const error = errorState[0];
    const setError = errorState[1];

    useEffect(() => {
        try {
            if (studentId) {
                const foundStudent = getStudentById(studentId);
                setStudent(foundStudent);
            }
        } catch (err) {
            console.error('Error al cargar estudiante:', err);
            setError('No se pudo cargar la informacion del estudiante');
        }
    }, [studentId, setStudent]);

    useEffect(() => {
        if (role && role !== 'loading' && role !== 'Clinico') {
            console.log('ACCESO DENEGADO: Redirigiendo.');
            redirect('/educativa/estudiante/' + studentId);
        }
    }, [role, studentId]);

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

    if (role === 'loading' || !student) {
        return (
            <div className="flex h-screen w-full items-center justify-center p-8">
                <div className="flex items-center gap-2 text-xl text-gray-600">
                    <Loader className="animate-spin" />
                    {role === 'loading' ? 'Verificando Permisos de Seguridad...' : 'Cargando datos del estudiante...'}
                </div>
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
