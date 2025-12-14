'use client';

import { useParams, redirect } from 'next/navigation';
import { useSession } from '@/context/SessionContext';
import React, { useEffect, useState } from 'react';
import { getStudentById, getEducationalAssessmentByStudentId, EducationalAssessment } from '@/lib/store';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Lock, Sparkles, BrainCircuit } from 'lucide-react';
import PIEIFeedback from '@/components/piei-feedback';

function EducationalDataSummary({ educationalAssessment }: { educationalAssessment?: EducationalAssessment }) {
  if (!educationalAssessment) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Resumen de Evaluación Educativa</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500">No hay datos de evaluación educativa disponibles para este estudiante.</p>
        </CardContent>
      </Card>
    );
  }

  const { chteScores, neuropsychScreening } = educationalAssessment;
  const isPlanningLow = chteScores.planificacion < 40;
  const isCognitiveAlert = neuropsychScreening.memoriaTrabajoPercentil < 25 || neuropsychScreening.controlInhibitorioPercentil < 25;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Resumen de Evaluación Educativa (BEC-130)</CardTitle>
        <CardDescription>Resultados clave de los instrumentos de Nivel 1 y 2.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h3 className="font-semibold flex items-center gap-2 mb-2"><Sparkles className="h-5 w-5 text-blue-600" />Hábitos y Técnicas de Estudio (CHTE)</h3>
          <ul className="list-disc pl-5 space-y-1 text-sm">
            <li>Planificación: <span className={`font-bold ${isPlanningLow ? 'text-red-600' : 'text-gray-800'}`}>{chteScores.planificacion}</span></li>
            <li>Concentración: <span className="font-bold">{chteScores.concentracion}</span></li>
            <li>Toma de Apuntes: <span className="font-bold">{chteScores.tomaDeApuntes}</span></li>
          </ul>
          {isPlanningLow && (
            <p className="mt-2 text-xs text-red-700 bg-red-50 p-2 rounded-md">
              <strong>Triage Automático:</strong> Se ha asignado el micro-curso de "Técnicas de Estudio" debido a una puntuación baja en planificación.
            </p>
          )}
        </div>
        <div>
          <h3 className="font-semibold flex items-center gap-2 mb-2"><BrainCircuit className="h-5 w-5 text-purple-600" />Tamizaje Neuropsicológico (Percentiles)</h3>
          <ul className="list-disc pl-5 space-y-1 text-sm">
            <li>Atención Sostenida: <span className="font-bold">{neuropsychScreening.atencionPercentil}</span></li>
            <li>Memoria de Trabajo: <span className={`font-bold ${neuropsychScreening.memoriaTrabajoPercentil < 25 ? 'text-red-600' : 'text-gray-800'}`}>{neuropsychScreening.memoriaTrabajoPercentil}</span></li>
            <li>Control Inhibitorio: <span className={`font-bold ${neuropsychScreening.controlInhibitorioPercentil < 25 ? 'text-red-600' : 'text-gray-800'}`}>{neuropsychScreening.controlInhibitorioPercentil}</span></li>
          </ul>
           {isCognitiveAlert && (
            <p className="mt-2 text-xs text-amber-700 bg-amber-50 p-2 rounded-md">
              <strong>Alerta Cognitiva:</strong> Se ha enviado una notificación al Rol Clínico para una evaluación de Nivel 3 debido a percentiles bajos.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}


export default function EducationalFilePage() {
    const params = useParams();
    const studentId = params.id as string;
    const { role } = useSession();

    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        if (role && role !== 'loading') {
            setIsLoaded(true);
        }
    }, [role]);

    // GUARDIA DE RUTA INVERSA: Si eres Clínico, ve a tu vista completa
    if (isLoaded) {
        if (role === 'Clinico') {
            redirect(`/clinica/expediente/${studentId}`);
            return null; 
        }
    }
    
    if (role === 'loading' || !isLoaded) {
        return <div className="p-8 text-center text-xl">Verificando Permisos Educativos...</div>;
    }
    
    const student = getStudentById(studentId);
    const educationalAssessment = getEducationalAssessmentByStudentId(studentId);


    if (!student) {
        // En una app real, esto sería una página 404
        return <div className="p-8">Estudiante no encontrado.</div>;
    }

    return (
        <div className="p-8">
            <div className="max-w-4xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-extrabold text-blue-700">PERFIL ESTUDIANTIL Y PIEI (NIVEL 1/2)</h1>
                    <p className="text-md text-gray-500">{student.name}</p>
                </div>

                <Card className="mb-8 bg-purple-50 border-purple-500">
                    <CardHeader className="flex-row items-center gap-4">
                        <Lock className="h-8 w-8 text-purple-700" />
                        <div>
                            <CardTitle className="text-purple-800">Ambiente Educativo (Rol: {role})</CardTitle>
                            <CardDescription className="text-purple-700">
                               Esta vista muestra únicamente los componentes pedagógicos y de seguimiento académico, protegiendo la información clínica sensible de acuerdo al Capítulo 7 (Cortafuegos Ético Digital).
                            </CardDescription>
                        </div>
                    </CardHeader>
                </Card>

                <div className="space-y-12">
                   <PIEIFeedback />
                   <EducationalDataSummary educationalAssessment={educationalAssessment} />
                </div>
            </div>
        </div>
    )
}
