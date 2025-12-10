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
  
  // If this is a remote evaluation for a patient, figure out the correct test sequence.
  if (isRemote && patientId) {
    const assignments = getAssignedQuestionnairesForPatient(patientId);
    if (assignments.length > 0) {
      // Determine which questionnaires are already completed from intermediateResults
      const completedQuestionnaireIds = intermediateResults 
        ? JSON.parse(intermediateResults).map((r: any) => r.questionnaireId)
        : [];
      
      // Find the first assignment that is NOT in the completed list
      const nextAssignment = assignments.find(
        (a) => !completedQuestionnaireIds.includes(a.questionnaireId)
      );

      if (nextAssignment && nextAssignment.questionnaireId !== params.id) {
         // If there is a next assignment and we are not already on its page, redirect.
         const nextUrl = `/evaluation/${nextAssignment.questionnaireId}?patient=${patientId}&remote=true${intermediateResults ? `&intermediateResults=${intermediateResults}` : ''}`;
         redirect(nextUrl);
      }
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
