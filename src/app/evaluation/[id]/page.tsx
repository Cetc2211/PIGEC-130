import { notFound, redirect } from "next/navigation";
import { getQuestionnaire } from "@/lib/data";
import { QuestionnaireForm } from "@/components/questionnaire-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Logo } from "@/components/logo";
import { getAssignedQuestionnairesForPatient } from "@/lib/store";
import { Suspense } from "react";

type EvaluationPageProps = {
  params: {
    id: string;
  };
  searchParams?: {
    patient?: string;
    remote?: string;
    // For chained evaluations
    intermediateResults?: string;
  };
};

function EvaluationPageContent({ params, searchParams }: EvaluationPageProps) {
  const questionnaire = getQuestionnaire(params.id);
  const patientId = searchParams?.patient;
  const isRemote = searchParams?.remote === 'true';
  const intermediateResults = searchParams?.intermediateResults;

  if (!questionnaire) {
    notFound();
  }
  
  // If this is the first remote evaluation for a patient, redirect to the portal
  if (isRemote && patientId && !intermediateResults) {
    const assignments = getAssignedQuestionnairesForPatient(patientId);
    if (assignments.length > 0) {
      // Redirect to the first assigned questionnaire, which will then chain
       const firstAssignmentId = assignments[0].questionnaireId;
       const portalUrl = `/evaluation/${firstAssignmentId}?patient=${patientId}&remote=true`;
       redirect(portalUrl);
    }
  }

  return (
    <div className="min-h-screen w-full bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-2xl mx-auto">
        <div className="mb-8 flex justify-center">
            <Logo />
        </div>
        <Card className="shadow-2xl">
          <CardHeader>
            <CardTitle className="font-headline text-3xl">{questionnaire.name}</CardTitle>
            <CardDescription>{questionnaire.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <QuestionnaireForm 
              questionnaire={questionnaire} 
              patientId={patientId} 
              isRemote={isRemote}
              intermediateResults={intermediateResults}
            />
          </CardContent>
        </Card>
         <p className="text-center text-sm text-muted-foreground mt-6">
            EscalaWeb - Evaluaciones psicológicas modernas
        </p>
      </div>
    </div>
  );
}

export default function EvaluationPage(props: EvaluationPageProps) {
  return (
    <Suspense fallback={<div>Cargando...</div>}>
      <EvaluationPageContent {...props} />
    </Suspense>
  )
}
