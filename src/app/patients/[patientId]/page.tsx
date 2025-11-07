'use server';

import { notFound } from 'next/navigation';
import { getPatient, getAssignedQuestionnairesForPatient, getAllResultsForPatient } from '@/lib/store';
import { getQuestionnaire, getInterpretation } from '@/lib/data';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { FileText, User, ClipboardList, Stethoscope, Pencil } from 'lucide-react';
import { PatientProfileForm } from '@/components/patient-profile-form';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from '@/components/ui/badge';

type PatientProfilePageProps = {
  params: {
    patientId: string;
  };
};

export default async function PatientProfilePage({ params }: PatientProfilePageProps) {
  const patient = getPatient(params.patientId);
  
  if (!patient) {
    notFound();
  }

  const assignments = getAssignedQuestionnairesForPatient(params.patientId);
  const assignedQuestionnaires = assignments.map(assignment => {
    const questionnaire = getQuestionnaire(assignment.questionnaireId);
    // Remove the assignment if the result is already submitted
    const results = getAllResultsForPatient(params.patientId);
    const isSubmitted = results.some(r => r.questionnaireId === assignment.questionnaireId);
    return isSubmitted ? null : questionnaire;
  }).filter(Boolean);


  const results = getAllResultsForPatient(params.patientId);

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8">
      <header className="flex items-center gap-4">
        <User className="h-8 w-8 text-primary" />
        <div>
            <h1 className="font-headline text-3xl font-bold tracking-tight">{patient.name}</h1>
            <p className="text-muted-foreground">Expediente: {patient.recordId} | {patient.semester}º Semestre - Grupo {patient.group}</p>
        </div>
      </header>

      <Tabs defaultValue="evaluations" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="profile"><Pencil className="mr-2 h-4 w-4" /> Ficha de Identificación</TabsTrigger>
          <TabsTrigger value="evaluations"><ClipboardList className="mr-2 h-4 w-4" /> Evaluaciones</TabsTrigger>
          <TabsTrigger value="diagnosis"><Stethoscope className="mr-2 h-4 w-4" /> Realizar Diagnóstico</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="mt-6">
            <PatientProfileForm patient={patient} />
        </TabsContent>
        
        <TabsContent value="evaluations" className="mt-6 grid gap-8 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Evaluaciones Asignadas</CardTitle>
              <CardDescription>Pruebas pendientes de aplicar para este paciente.</CardDescription>
            </CardHeader>
            <CardContent>
              {assignedQuestionnaires.length > 0 ? (
                <ul className="space-y-3">
                  {assignedQuestionnaires.map(q => q && (
                    <li key={q.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <FileText className="h-5 w-5 text-muted-foreground" />
                        <span className="font-medium">{q.name}</span>
                      </div>
                      <Button asChild size="sm">
                        <Link href={`/evaluation/${q.id}?patient=${patient.id}`}>Iniciar Evaluación</Link>
                      </Button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">No hay evaluaciones pendientes.</p>
              )}
            </CardContent>
          </Card>
           <Card>
            <CardHeader>
              <CardTitle>Resultados de Evaluaciones</CardTitle>
              <CardDescription>Historial de pruebas completadas.</CardDescription>
            </CardHeader>
            <CardContent>
              {results.length > 0 ? (
                <ul className="space-y-3">
                  {results.map(result => {
                    const interpretation = getInterpretation(result.questionnaireId, result.score);
                    return (
                      <li key={result.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <div className="flex-grow">
                          <p className="font-medium">{result.questionnaireName}</p>
                          <p className="text-xs text-muted-foreground">
                            Completado el {new Date(result.submittedAt).toLocaleDateString()}
                          </p>
                           <Badge variant={interpretation.severity === 'Alta' ? 'destructive' : 'secondary'} className="mt-2">
                            {interpretation.severity}
                          </Badge>
                        </div>
                        <Button asChild size="sm" variant="outline">
                          <Link href={`/results/${result.id}`}>Ver Detalles</Link>
                        </Button>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">No hay resultados de evaluaciones.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="diagnosis" className="mt-6">
           <Card>
            <CardHeader>
              <CardTitle>Realizar Diagnóstico (Próximamente)</CardTitle>
              <CardDescription>
                Esta sección te permitirá consolidar todos los resultados de las evaluaciones, notas de entrevistas y otras observaciones para formular un diagnóstico integral. 
                Podrás redactar tus conclusiones o utilizar herramientas de IA para que te asistan en el análisis y la redacción del informe final.
              </CardDescription>
            </CardHeader>
            <CardContent>
               <div className="flex flex-col items-center justify-center text-center p-8 border-2 border-dashed rounded-lg min-h-[300px]">
                 <Stethoscope className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="font-semibold">Funcionalidad en Desarrollo</h3>
                <p className="text-sm text-muted-foreground mt-2 max-w-md">
                    Pronto podrás utilizar esta área para sintetizar toda la información y generar un informe diagnóstico completo.
                </p>
            </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
