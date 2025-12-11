'use client';

import { notFound, redirect, useSearchParams } from "next/navigation";
import { getQuestionnaire } from "@/lib/data";
import { QuestionnaireForm } from "@/components/questionnaire-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Logo } from "@/components/logo";
import { getEvaluationSession } from "@/lib/store";
import { Suspense, useEffect } from "react";

type EvaluationPageProps = {
  params: {
    id: string;
  };
};

function EvaluationPageContent({ params }: EvaluationPageProps) {
  const searchParams = useSearchParams();
  const patientId = searchParams.get('patient');
  const isRemote = searchParams.get('remote') === 'true';
  const sessionId = searchParams.get('session');
  const intermediateResults = searchParams.get('intermediateResults') || undefined;

  const questionnaire = getQuestionnaire(params.id);

  // useEffect handles client-side redirection logic
  useEffect(() => {
    if (!questionnaire) {
      notFound();
    }

    if (isRemote && patientId && sessionId) {
      const session = getEvaluationSession(sessionId);

      if (!session || session.patientId !== patientId) {
        notFound();
        return;
      }

      const completedQuestionnaireIds = intermediateResults
        ? JSON.parse(intermediateResults).map((r: any) => r.questionnaireId)
        : [];

      const nextQuestionnaireId = session.questionnaireIds.find(
        (id) => !completedQuestionnaireIds.includes(id)
      );

      if (nextQuestionnaireId && nextQuestionnaireId !== params.id) {
        let nextUrl = `/evaluation/${nextQuestionnaireId}?patient=${patientId}&remote=true&session=${sessionId}`;
        if (intermediateResults) {
            nextUrl += `&intermediateResults=${encodeURIComponent(intermediateResults)}`;
        }
        redirect(nextUrl);
      }
    }
  }, [params.id, questionnaire, isRemote, patientId, sessionId, intermediateResults]);


  if (!questionnaire) {
    // Return null or a loader while useEffect logic runs, to prevent rendering with incorrect data
    return null;
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
              patientId={patientId || undefined}
              isRemote={isRemote}
              sessionId={sessionId || undefined}
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
