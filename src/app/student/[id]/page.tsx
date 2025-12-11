import { Header } from "@/components/header";
import ClinicalAssessmentForm from "@/components/clinical-assessment-form";
import FunctionalAnalysisForm from "@/components/functional-analysis-form";
import TreatmentPlanGenerator from "@/components/treatment-plan-generator";
import ProgressTracker from "@/components/progress-tracker";
import { getStudentById, Student } from "@/lib/store";
import { notFound } from "next/navigation";


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

                    <div className="space-y-12">
                        {/* Módulo 2.1: Interfaz de Evaluación Clínica */}
                        <ClinicalAssessmentForm />

                        {/* Módulo 2.3: Análisis Funcional (AF) y Formulación */}
                        <FunctionalAnalysisForm studentName={student.name} />

                        {/* Módulo 3: Generador de Plan de Tratamiento */}
                        <TreatmentPlanGenerator studentName={student.name} />

                        {/* Módulo 4: Seguimiento y Trazabilidad del Progreso */}
                        <ProgressTracker />
                    </div>
                </div>
            </main>
        </div>
    );
}
