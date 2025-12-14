'use client';

import EducationalAssessmentForm from "@/components/educational-assessment-form";
import { useSession } from "@/context/SessionContext";
import { redirect } from "next/navigation";

export default function EducationalAssessmentPage() {
    const { role } = useSession();
    
    // Solo el orientador puede acceder a esta página
    if (role === 'Clinico') {
        redirect('/');
        return null;
    }

    if (role === 'loading') {
        return <div className="p-8">Cargando...</div>
    }

    return (
        <div className="p-8">
            <div className="max-w-4xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-extrabold text-gray-800">Evaluación Educativa (Nivel 1 y 2)</h1>
                    <p className="mt-2 text-sm text-gray-600">
                        Registro de resultados de la Batería de Evaluación Complementaria (BEC-130) para el análisis pedagógico y neuropsicológico.
                    </p>
                </div>
                
                <EducationalAssessmentForm />
            </div>
        </div>
    );
}