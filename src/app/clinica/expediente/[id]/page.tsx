'use client';

import { useParams, redirect } from 'next/navigation';
import { useSession } from '@/context/SessionContext';
import React, { useEffect, useState } from 'react';

import ClinicalAssessmentForm from "@/components/clinical-assessment-form";
import FunctionalAnalysisForm from "@/components/functional-analysis-form";
import TreatmentPlanGenerator from "@/components/treatment-plan-generator";
import ProgressTracker from "@/components/progress-tracker";
import PIEIGenerator from "@/components/piei-generator";
import { getStudentById, getClinicalAssessmentByStudentId, getFunctionalAnalysisByStudentId, getTreatmentPlanByStudentId, getProgressTrackingByStudentId } from "@/lib/store";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal, ShieldAlert } from "lucide-react";
import CrisisManagementActions from '@/components/crisis-management-actions';

export default function ClinicalFilePage() {
    const params = useParams();
    const studentId = params.id as string;
    const { role } = useSession();
    
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        if (role !== null && role !== 'loading') {
            setIsLoaded(true);
        }
    }, [role]);

    if (isLoaded) {
        if (role !== 'Clinico') {
            console.error(`ACCESO DENEGADO: Rol '${role}' intentó acceder a ruta clínica.`);
            redirect(`/educativa/estudiante/${studentId}`); 
            return null;
        }
    }

    if (!isLoaded) {
        return <div className="p-8 text-center text-xl">Verificando Permisos de Seguridad...</div>;
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
