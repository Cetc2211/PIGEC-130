'use client';

import { useParams, redirect } from 'next/navigation';
import { useSession } from '@/context/SessionContext';
import React, { useEffect, useState } from 'react';

import ClinicalAssessmentForm from "@/components/clinical-assessment-form";
import FunctionalAnalysisForm from "@/components/functional-analysis-form";
import TreatmentPlanGenerator from "@/components/treatment-plan-generator";
import ProgressTracker from "@/components/progress-tracker";
import PIEIGenerator from "@/components/piei-generator";
import ReportGenerator from "@/components/ReportGenerator";
import { getStudentById, getClinicalAssessmentByStudentId, getFunctionalAnalysisByStudentId, getTreatmentPlanByStudentId, getProgressTrackingByStudentId } from "@/lib/store";
import ClinicalKPILogger from '@/components/ClinicalKPILogger';
import RiskTimelineChart from '@/components/RiskTimelineChart';
import SOAPNotesForm from '@/components/SOAPNotesForm';

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal, ShieldAlert, Loader, ClipboardList, BookOpen } from "lucide-react";
import ScreeningManagement from '@/components/screening-management';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import WISCScoringConsole from '@/components/WISC-VScoringConsole';
import WAISScoringConsole from '@/components/WAIS-IVScoringConsole';


export default function ClinicalFilePage() {
    const params = useParams();
    const studentId = params.id as string;
    const { role } = useSession();

    useEffect(() => {
        if (role && role !== 'loading' && role !== 'Clinico') {
            console.error(`ACCESO DENEGADO: Rol '${role}' intentó acceder a ruta clínica. Redirigiendo.`);
            redirect(`/educativa/estudiante/${studentId}`);
        }
    }, [role, studentId]);

    if (role === 'loading' || role !== 'Clinico') {
        return (
            <div className="flex h-screen w-full items-center justify-center p-8">
                <div className="flex items-center gap-2 text-xl text-gray-600">
                    <Loader className="animate-spin" />
                    Verificando Permisos de Seguridad...
                </div>
            </div>
        );
    }

    const student = getStudentById(studentId);
    const clinicalAssessment = getClinicalAssessmentByStudentId(studentId);
    const functionalAnalysis = getFunctionalAnalysisByStudentId(studentId);
    const treatmentPlan = getTreatmentPlanByStudentId(studentId);
    const progressTracking = getProgressTrackingByStudentId(studentId);

    if (!student) {
        // En una app real, esto sería una página 404.
        return <div className="p-8">Estudiante no encontrado.</div>;
    }

    const isHighRisk = student.suicideRiskLevel === 'Alto' || student.suicideRiskLevel === 'Crítico';

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-4xl mx-auto">
                 <div className="mb-8">
                    <h1 className="text-3xl font-extrabold text-red-700">EXPEDIENTE CLÍNICO NIVEL 3 - CONFIDENCIAL</h1>
                    <p className="text-md text-gray-500">{student.name}</p>
                </div>
                
                {isHighRisk && (
                    <Alert variant="destructive" className="mb-8">
                        <ShieldAlert className="h-4 w-4" />
                        <AlertTitle>
                            {student.suicideRiskLevel === 'Crítico' ? 'Alerta de Riesgo Crítico (Código Rojo)' : 'Alerta de Riesgo Alto'}
                        </AlertTitle>
                        <AlertDescription>
                            Este caso está marcado con Riesgo Suicida '{student.suicideRiskLevel}'. Se debe priorizar la aplicación inmediata del Plan de Seguridad y la canalización externa de emergencia (Criterio A/B).
                        </AlertDescription>
                    </Alert>
                )}

                <Alert className="mb-8 border-yellow-500 text-yellow-800">
                    <Terminal className="h-4 w-4" />
                    <AlertTitle>Disclaimer Deontológico (Cap. 1.5)</AlertTitle>
                    <AlertDescription>
                        El resultado de este expediente (IRC, BDI, etc.) constituye una Alerta de Riesgo y una <strong>Impresión Diagnóstica Provisional</strong>, no un diagnóstico nosológico definitivo.
                    </AlertDescription>
                </Alert>

                <div className="space-y-12">
                    <ClinicalAssessmentForm initialData={clinicalAssessment} />
                    
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <ClipboardList />
                                Aplicar Instrumento de Tamizaje Individual
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                             <ScreeningManagement />
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <BookOpen />
                                Evaluación Psicométrica (Escalas Wechsler)
                            </CardTitle>
                            <CardDescription>
                                {student.demographics.age < 16 
                                    ? `Se muestra la consola WISC-V porque la edad del estudiante (${student.demographics.age}) es menor a 16.`
                                    : `Se muestra la consola WAIS-IV porque la edad del estudiante (${student.demographics.age}) es 16 o mayor.`
                                }
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {student.demographics.age < 16 ? (
                                <WISCScoringConsole studentAge={student.demographics.age} />
                            ) : (
                                <WAISScoringConsole studentAge={student.demographics.age} />
                            )}
                        </CardContent>
                    </Card>


                    <FunctionalAnalysisForm studentName={student.name} initialData={functionalAnalysis} />
                    <TreatmentPlanGenerator studentName={student.name} initialData={treatmentPlan} />
                    <PIEIGenerator clinicalData={clinicalAssessment} />
                    <ProgressTracker initialData={progressTracking} />
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <ClinicalKPILogger />
                        <RiskTimelineChart />
                    </div>
                    <SOAPNotesForm />

                    <ReportGenerator student={student} clinicalAssessment={clinicalAssessment} />
                </div>
            </div>
        </div>
    );
}
