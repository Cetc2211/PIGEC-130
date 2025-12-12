'use client';

import ClinicalAssessmentForm from "@/components/clinical-assessment-form";
import FunctionalAnalysisForm from "@/components/functional-analysis-form";
import TreatmentPlanGenerator from "@/components/treatment-plan-generator";
import ProgressTracker from "@/components/progress-tracker";
import { getStudentById, getClinicalAssessmentByStudentId, getFunctionalAnalysisByStudentId, getTreatmentPlanByStudentId, getProgressTrackingByStudentId } from "@/lib/store";
import { useParams } from "next/navigation";
import { notFound } from "next/navigation";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal, ShieldAlert } from "lucide-react";
import ReferralFlow from "@/components/referral-flow";
import SafetyPlan from "@/components/safety-plan";
import { useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";


function CrisisManagementActions({ studentName, riskLevel }: { studentName: string, riskLevel: 'Bajo' | 'Medio' | 'Alto' | 'Crítico' }) {
    // El botón se muestra más prominente si el riesgo es alto o crítico
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


export default function StudentFilePage() {
    const params = useParams();
    const studentId = params.id as string;

    // Fetch all data for the student using the in-memory store
    const student = useMemo(() => getStudentById(studentId), [studentId]);
    const clinicalAssessment = useMemo(() => getClinicalAssessmentByStudentId(studentId), [studentId]);
    const functionalAnalysis = useMemo(() => getFunctionalAnalysisByStudentId(studentId), [studentId]);
    const treatmentPlan = useMemo(() => getTreatmentPlanByStudentId(studentId), [studentId]);
    const progressTracking = useMemo(() => getProgressTrackingByStudentId(studentId), [studentId]);

    if (!student) {
        return notFound();
    }

    return (
        <div className="min-h-screen bg-gray-50">
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
                        <ClinicalAssessmentForm initialData={clinicalAssessment} />

                        {/* Módulo 2.3: Análisis Funcional (AF) y Formulación */}
                        <FunctionalAnalysisForm studentName={student.name} initialData={functionalAnalysis} />

                        {/* Módulo 3: Generador de Plan de Tratamiento */}
                        <TreatmentPlanGenerator studentName={student.name} initialData={treatmentPlan} />

                        {/* Acciones de Crisis y Derivación */}
                        <CrisisManagementActions studentName={student.name} riskLevel={student.suicideRiskLevel} />

                        {/* Módulo 4: Seguimiento y Trazabilidad del Progreso */}
                        <ProgressTracker initialData={progressTracking} />
                    </div>
                </div>
            </main>
        </div>
    );
}
