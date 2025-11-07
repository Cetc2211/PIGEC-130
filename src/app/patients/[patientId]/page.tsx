'use server';

import { notFound } from 'next/navigation';
import { getPatient, getAssignedQuestionnairesForPatient } from '@/lib/store';
import { getQuestionnaire } from '@/lib/data';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { FileText, User } from 'lucide-react';
import { PatientProfileForm } from '@/components/patient-profile-form';

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
    return getQuestionnaire(assignment.questionnaireId);
  }).filter(Boolean); // Filter out any undefined questionnaires if an ID is invalid

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8">
      <header className="flex items-center gap-4">
        <User className="h-8 w-8 text-primary" />
        <div>
            <h1 className="font-headline text-3xl font-bold tracking-tight">{patient.name}</h1>
            <p className="text-muted-foreground">Expediente: {patient.recordId}</p>
        </div>
      </header>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
            <PatientProfileForm patient={patient} />
        </div>
        <div className="lg:col-span-1">
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
                        <Link href={`/evaluation/${q.id}`}>Iniciar Evaluación</Link>
                      </Button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">No hay evaluaciones asignadas.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
