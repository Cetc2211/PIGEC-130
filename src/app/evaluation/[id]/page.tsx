import { notFound, redirect } from "next/navigation";
import { getQuestionnaire } from "@/lib/data";
import { QuestionnaireForm } from "@/components/questionnaire-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Logo } from "@/components/logo";
import { getEvaluationSession } from "@/lib/store";
import { Suspense } from "react";

type EvaluationPageProps = {
  params: {
    id: string;
  };
  searchParams?: {
    patient?: string;
    remote?: string;
    session?: string;
    // For chained evaluations
    intermediateResults?: string;
  };
};

function EvaluationPageContent({ params, searchParams }: EvaluationPageProps) {
  const questionnaire = getQuestionnaire(params.id);
  const patientId = searchParams?.patient;
  const isRemote = searchParams?.remote === 'true';
  const sessionId = searchParams?.session;
  const intermediateResults = searchParams?.intermediateResults;

  if (!questionnaire) {
    notFound();
  }
  
  // If this is a remote evaluation for a patient, figure out the correct test sequence.
  if (isRemote && patientId && sessionId) {
    const session = getEvaluationSession(sessionId);

    // If the session is invalid or doesn't belong to the patient, it's an error.
    if (!session || session.patientId !== patientId) {
      // Or show an error page
      notFound();
    }
    
    // Determine which questionnaires are already completed from intermediateResults
    const completedQuestionnaireIds = intermediateResults 
      ? JSON.parse(intermediateResults).map((r: any) => r.questionnaireId)
      : [];
    
    // Find the first questionnaire in the session's list that is NOT completed
    const nextQuestionnaireId = session.questionnaireIds.find(
      (id) => !completedQuestionnaireIds.includes(id)
    );

    // If the next test is not the current one, redirect to the correct one.
    // This handles cases where user navigates back/forward or re-opens a link for an old test in the sequence.
    if (nextQuestionnaireId && nextQuestionnaireId !== params.id) {
       const nextUrl = `/evaluation/${nextQuestionnaireId}?patient=${patientId}&remote=true&session=${sessionId}${intermediateResults ? `&intermediateResults=${intermediateResults}` : ''}`;
       redirect(nextUrl);
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
              sessionId={sessionId}
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
