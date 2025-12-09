'use server';

import { notFound } from 'next/navigation';
import { getPatient, getAssignedQuestionnairesForPatient, getAllResultsForPatient, type EvaluationResult } from '@/lib/store';
import { getQuestionnaire, getInterpretation } from '@/lib/data';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { FileText, User, ClipboardList, Stethoscope, Pencil, ClipboardEdit, ShieldCheck } from 'lucide-react';
import { PatientProfileForm } from '@/components/patient-profile-form';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from '@/components/ui/badge';
import { SidebarTriggerButton } from '@/components/sidebar-trigger-button';
import { generatePatientProfile, PatientProfile } from '@/lib/diagnosis';
import { ClinicalInterviewForm } from '@/components/clinical-interview-form';

type PatientProfilePageProps = {
  params: {
    patientId: string;
  };
};

function adaptResultsForDiagnosis(results: EvaluationResult[]): any[] {
  return results.map(res => {
    // This now correctly gets the first score from the 'scores' object
    const mainScoreKey = Object.keys(res.scores)[0] || 'main';
    const mainScore = res.scores[mainScoreKey];
    const interpretation = getInterpretation(res.questionnaireId, mainScore);

    // This logic needs to be more robust. It assumes a specific question ID.
    const hasSuicideQuestion = getQuestionnaire(res.questionnaireId)?.sections.flatMap(s => s.questions).some(q => q.id.includes('suicide') || q.id === 'phq9_q9');
    const suicideRisk = hasSuicideQuestion && (res.answers['phq9_q9'] > 0 || res.answers['ssi_q4'] > 0 || res.answers['ssi_q5'] > 0);

    return {
      instrumentName: res.questionnaireName,
      date: res.submittedAt,
      score: mainScore,
      severity: interpretation.severity,
      suicideRisk: !!suicideRisk
    };
  });
}

function PatientDiagnosisProfile({ profile }: { profile: PatientProfile }) {
  const getSeverityBadgeVariant = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'alta':
      case 'grave':
        return 'destructive';
      case 'moderada':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  return (
     <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div>
            <CardTitle className="font-headline text-2xl">{profile.name}</CardTitle>
            <CardDescription>{profile.summary}</CardDescription>
          </div>
          <Badge variant="default" className="text-sm whitespace-nowrap">{profile.profileId.replace('perfil-', 'Perfil ').toUpperCase()}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h4 className="font-semibold text-muted-foreground">Puntuaciones Clave</h4>
          <div className="mt-2 grid grid-cols-1 md:grid-cols-3 gap-4">
            {profile.keyScores.length > 0 ? profile.keyScores.map(ks => (
              <div key={ks.instrumentName} className="p-3 rounded-md border bg-muted/50">
                <p className="font-medium">{ks.instrumentName}</p>
                <p className="text-2xl font-bold">{ks.score}</p>
                <Badge variant={getSeverityBadgeVariant(ks.severity)}>{ks.severity}</Badge>
              </div>
            )) : <p className="text-sm text-muted-foreground col-span-3">No hay puntuaciones clave disponibles.</p>}
          </div>
        </div>

        <div>
          <h4 className="font-semibold text-muted-foreground">Protocolo y Monitoreo Recomendado</h4>
           <div className="mt-2 space-y-2 text-sm">
             <p><span className="font-medium">Protocolo:</span> {profile.protocol}</p>
             <p><span className="font-medium">Frecuencia de Monitoreo:</span> {profile.monitoringFrequency}</p>
             <p><span className="font-medium">Instrumentos Recomendados:</span> {profile.recommendedInstruments.join(', ')}</p>
           </div>
        </div>

      </CardContent>
    </Card>
  )
}


export default async function PatientProfilePage({ params }: PatientProfilePageProps) {
  const patient = getPatient(params.patientId);
  
  if (!patient) {
    notFound();
  }

  const assignments = getAssignedQuestionnairesForPatient(params.patientId);
  const results = getAllResultsForPatient(params.patientId);
  const completedQuestionnaireIds = new Set(results.map(r => r.questionnaireId));

  const pendingAssignments = assignments.filter(
    assignment => !completedQuestionnaireIds.has(assignment.questionnaireId)
  );

  const assignedQuestionnaires = pendingAssignments.map(assignment => {
      return getQuestionnaire(assignment.questionnaireId);
  }).filter(Boolean);

  const diagnosisProfile = generatePatientProfile({ results: adaptResultsForDiagnosis(results) });

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8">
      <header className="flex items-center gap-4">
        <SidebarTriggerButton />
        <User className="h-8 w-8 text-primary" />
        <div>
            <h1 className="font-headline text-3xl font-bold tracking-tight">{patient.name}</h1>
            <p className="text-muted-foreground">Expediente: {patient.recordId} | {patient.semester}º Semestre - Grupo {patient.group}</p>
        </div>
      </header>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="profile"><Pencil className="mr-2 h-4 w-4" /> Ficha</TabsTrigger>
          <TabsTrigger value="clinical-interview"><ClipboardEdit className="mr-2 h-4 w-4" /> Entrevista</TabsTrigger>
          <TabsTrigger value="informed-consent"><ShieldCheck className="mr-2 h-4 w-4" /> Consentimiento</TabsTrigger>
          <TabsTrigger value="evaluations"><ClipboardList className="mr-2 h-4 w-4" /> Evaluaciones</TabsTrigger>
          <TabsTrigger value="diagnosis"><Stethoscope className="mr-2 h-4 w-4" /> Diagnóstico</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="mt-6">
            <PatientProfileForm patient={patient} />
        </TabsContent>

        <TabsContent value="clinical-interview" className="mt-6">
           <ClinicalInterviewForm patient={patient} />
        </TabsContent>

        <TabsContent value="informed-consent" className="mt-6">
             <Card>
              <CardHeader>
                <CardTitle>Consentimiento Informado</CardTitle>
                <CardDescription>Registro y firma del consentimiento informado del paciente o tutor.</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">El formulario de consentimiento informado estará disponible aquí próximamente.</p>
              </CardContent>
            </Card>
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
                    // Adapt for multi-score results
                    const mainScoreId = Object.keys(result.scores)[0] || 'main';
                    const mainScore = result.scores[mainScoreId];
                    const interpretation = getInterpretation(result.questionnaireId, mainScore);
                    return (
                      <li key={result.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <div className="flex-grow">
                          <p className="font-medium">{result.questionnaireName}</p>
                          <p className="text-xs text-muted-foreground">
                            Completado el {new Date(result.submittedAt).toLocaleDateString()}
                          </p>
                           {interpretation && <Badge variant={interpretation.severity === 'Alta' ? 'destructive' : 'secondary'} className="mt-2">
                            {interpretation.severity}
                          </Badge>}
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
           <PatientDiagnosisProfile profile={diagnosisProfile} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
