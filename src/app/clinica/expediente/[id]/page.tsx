'use client';

import { useParams, redirect } from 'next/navigation';
import { useSession } from '@/context/SessionContext';
import React, { useEffect, useState } from 'react';

import ClinicalAssessmentForm from "@/components/clinical-assessment-form";
import FunctionalAnalysisForm from "@/components/functional-analysis-form";
import TreatmentPlanGenerator from "@/components/treatment-plan-generator";
import ProgressTracker from "@/components/progress-tracker";
import ReferralFlow from "@/components/referral-flow";
import SafetyPlan from "@/components/safety-plan";
import PIEIGenerator from "@/components/piei-generator";
import { getStudentById, getClinicalAssessmentByStudentId, getFunctionalAnalysisByStudentId, getTreatmentPlanByStudentId, getProgressTrackingByStudentId } from "@/lib/store";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal, ShieldAlert } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

function CrisisManagementActions({ studentName, riskLevel }: { studentName: string, riskLevel: 'Bajo' | 'Medio' | 'Alto' | 'Crítico' }) {
    const isHighRisk = riskLevel === 'Alto' || riskLevel === 'Crítico';

    return (
        <Card className="shadow-lg border-amber-500">
            <CardHeader>
                <CardTitle>Acciones de Crisis y Derivación</CardTitle>
                <CardDescription>Protocolos para manejo de riesgo y canalización a especialistas.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col md:flex-row gap-4 justify-around items-center">
                 <Dialog>
                    <DialogTrigger asChild>
                         <Button variant={isHighRisk ? "destructive" : "secondary"} className="font-bold w-full md:w-auto">
                            <ShieldAlert className="mr-2 h-4 w-4" />
                            Activar Plan de Seguridad
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
                        <DialogHeader>
                          <DialogTitle>Módulo de Plan de Seguridad y Crisis</DialogTitle>
                          <DialogDescription>
                            Herramienta para el manejo activo del riesgo suicida y de autolesiones (Cap. 11.2).
                          </DialogDescription>
                        </DialogHeader>
                        <div className="flex-grow overflow-y-auto">
                           <SafetyPlan studentName={studentName} />
                        </div>
                    </DialogContent>
                </Dialog>

                <ReferralFlow studentName={studentName} />
            </CardContent>
        </Card>
    )
}


export default function ClinicalFilePage() {
    const params = useParams();
    const studentId = params.id as string;
    const { role } = useSession();
    
    // GUARDIA DE RUTA ESTRICTA
    if (role === 'loading') {
        return <div className="p-8 text-center text-xl">Verificando Permisos de Seguridad...</div>;
    }

    if (role !== 'Clinico') {
        console.error(`ACCESO DENEGADO: Rol '${role}' intentó acceder a ruta clínica.`);
        redirect(`/educativa/estudiante/${studentId}`); 
        return null;
    }

    // El resto del componente solo se ejecuta si el rol es 'Clinico'
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
                    <FunctionalAnalysisForm studentName={student.name} initialData={functionalAnalysis} />
                    <TreatmentPlanGenerator studentName={student.name} initialData={treatmentPlan} />
                    <PIEIGenerator clinicalData={clinicalAssessment} />
                    <CrisisManagementActions studentName={student.name} riskLevel={student.suicideRiskLevel} />
                    <ProgressTracker initialData={progressTracking} />
                </div>
            </div>
        </div>
    );
}
