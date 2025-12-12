'use client';

import { Header } from "@/components/header";
import ClinicalAssessmentForm from "@/components/clinical-assessment-form";
import FunctionalAnalysisForm from "@/components/functional-analysis-form";
import TreatmentPlanGenerator from "@/components/treatment-plan-generator";
import ProgressTracker from "@/components/progress-tracker";
import { getStudentById, Student } from "@/lib/store";
import { notFound } from "next/navigation";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal } from "lucide-react";
import ReferralFlow from "@/components/referral-flow";

export default function StudentFilePage({ params }: { params: { id: string } }) {
    const student = getStudentById(params.id);

    if (!student) {
        return notFound();
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Header />
            <main className="p-8">
                <div className="max-w-4xl mx-auto">
                    <div className="mb-8">
                        <h1 className="text-3xl font-extrabold text-gray-800">{student.name}</h1>
                        <p className="text-md text-gray-500">Expediente Clínico y Evaluación Funcional</p>
                    </div>

                    <Alert className="mb-8 border-yellow-500 text-yellow-800">
                        <Terminal className="h-4 w-4" />
                        <AlertTitle>Impresión Diagnóstica Provisional</AlertTitle>
                        <AlertDescription>
                            El resultado de este expediente (IRC, BDI, etc.) constituye una Alerta de Riesgo y una Impresión Diagnóstica Provisional, no un diagnóstico nosológico definitivo (Cap. 1.5).
                        </AlertDescription>
                    </Alert>

                    <div className="space-y-12">
                        {/* Módulo 2.1: Interfaz de Evaluación Clínica */}
                        <ClinicalAssessmentForm />

                        {/* Módulo 2.3: Análisis Funcional (AF) y Formulación */}
                        <FunctionalAnalysisForm studentName={student.name} />

                        {/* Módulo 3: Generador de Plan de Tratamiento */}
                        <TreatmentPlanGenerator studentName={student.name} />

                        {/* Módulo 4: Seguimiento y Trazabilidad del Progreso */}
                        <ProgressTracker />

                        {/* Flujo de Derivación */}
                        <ReferralFlow studentName={student.name} />
                    </div>
                </div>
            </main>
        </div>
    );
}
