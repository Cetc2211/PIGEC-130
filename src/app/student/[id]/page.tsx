import { Header } from "@/components/header";
import ClinicalAssessmentForm from "@/components/clinical-assessment-form";
import FunctionalAnalysisForm from "@/components/functional-analysis-form";
import TreatmentPlanGenerator from "@/components/treatment-plan-generator";
import ProgressTracker from "@/components/progress-tracker";


// --- ESTRUCTURA DE DATOS DE EJEMPLO SIMULANDO LA INTEGRACIÓN ---
interface StudentData {
    id: string;
    name: string;
    gpa: number;
    totalClasses: number;
    nonAttendedClasses: number;
    ansiedadScore: number; // Asumimos GAD-7 Score (0-21)
}
const MOCK_STUDENTS: StudentData[] = [
    { id: 'S001', name: 'Ana M. Pérez (Riesgo Alto)', gpa: 6.2, totalClasses: 100, nonAttendedClasses: 25, ansiedadScore: 18 },
    { id: 'S002', name: 'Carlos V. Ruiz (Riesgo Medio)', gpa: 7.8, totalClasses: 120, nonAttendedClasses: 15, ansiedadScore: 10 },
    { id: 'S003', name: 'Laura J. García (Riesgo Bajo)', gpa: 9.1, totalClasses: 110, nonAttendedClasses: 5, ansiedadScore: 4 },
];
// --- FIN DE DATOS SIMULADOS ---


// Esta función simula la obtención de datos de un estudiante por su ID
function getStudentData(id: string): StudentData | undefined {
    return MOCK_STUDENTS.find(s => s.id === id);
}


export default function StudentFilePage({ params }: { params: { id: string } }) {
    const student = getStudentData(params.id);

    if (!student) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Header />
                <main className="p-8 text-center">
                    <h1 className="text-2xl font-bold text-red-600">Error</h1>
                    <p className="text-gray-700 mt-2">No se encontró el expediente del estudiante con ID: {params.id}</p>
                </main>
            </div>
        );
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
