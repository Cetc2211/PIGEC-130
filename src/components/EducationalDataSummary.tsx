'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { EducationalAssessment } from '@/lib/store';
import { Sparkles, BrainCircuit } from 'lucide-react';

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

export default EducationalDataSummary;
