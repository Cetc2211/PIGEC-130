'use client';

import ClinicalAssessmentForm from "@/components/clinical-assessment-form";
import FunctionalAnalysisForm from "@/components/functional-analysis-form";
import TreatmentPlanGenerator from "@/components/treatment-plan-generator";
import ProgressTracker from "@/components/progress-tracker";
import { getStudentById, getClinicalAssessmentByStudentId, getFunctionalAnalysisByStudentId, getTreatmentPlanByStudentId, getProgressTrackingByStudentId } from "@/lib/store";
import { useParams } from "next/navigation";
import { notFound } from "next/navigation";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal, ShieldAlert, Lock } from "lucide-react";
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
import { useSession } from "@/context/SessionContext";
import PIEIGenerator from "@/components/piei-generator";
import PIEIFeedback from "@/components/piei-feedback";


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


export default function StudentFilePage() {
    const params = useParams();
    const studentId = params.id as string;
    const { role } = useSession();

    const student = useMemo(() => getStudentById(studentId), [studentId]);
    const clinicalAssessment = useMemo(() => getClinicalAssessmentByStudentId(studentId), [studentId]);
    const functionalAnalysis = useMemo(() => getFunctionalAnalysisByStudentId(studentId), [studentId]);
    const treatmentPlan = useMemo(() => getTreatmentPlanByStudentId(studentId), [studentId]);
    const progressTracking = useMemo(() => getProgressTrackingByStudentId(studentId), [studentId]);

    if (!student) {
        return notFound();
    }

    const isHighRisk = student.suicideRiskLevel === 'Alto' || student.suicideRiskLevel === 'Crítico';

    // El rol de Orientador tiene acceso restringido al expediente
    if (role === 'Orientador') {
        return (
            <div className="p-8">
                <div className="max-w-4xl mx-auto">
                    <div className="mb-8">
                        <h1 className="text-3xl font-extrabold text-gray-800">{student.name}</h1>
                        <p className="text-md text-gray-500">Plan de Intervención Educativa Individualizada (PIEI)</p>
                    </div>
                     <Card className="mb-8 bg-yellow-50 border-yellow-500">
                        <CardHeader className="flex-row items-center gap-4">
                            <Lock className="h-8 w-8 text-yellow-700" />
                            <div>
                                <CardTitle className="text-yellow-800">Acceso Restringido (Rol Orientador)</CardTitle>
                                <CardDescription className="text-yellow-700">
                                   Su rol solo permite el acceso al <strong>Plan de Intervención Educativa (PIEI)</strong> y al registro de su efectividad, de acuerdo al Capítulo 7 (Cortafuegos Ético Digital).
                                </CardDescription>
                            </div>
                        </CardHeader>
                         <CardContent>
                            <p className="text-sm text-gray-800">
                               Los datos clínicos (scores, notas, plan de tratamiento) están protegidos y solo son visibles para el Rol Clínico, en cumplimiento de la NOM-004. A continuación se muestran únicamente las <strong>instrucciones pedagógicas</strong> aprobadas por el clínico.
                            </p>
                        </CardContent>
                    </Card>

                    <PIEIFeedback />
                </div>
            </div>
        )
    }

    // Vista completa para el Rol Clínico
    return (
        <div className="min-h-screen bg-gray-50">
            <main className="p-8">
                <div className="max-w-4xl mx-auto">
                    <div className="mb-8">
                        <h1 className="text-3xl font-extrabold text-gray-800">{student.name}</h1>
                        <p className="text-md text-gray-500">Expediente Clínico y Evaluación Funcional</p>
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
            </main>
        </div>
    );
}

    