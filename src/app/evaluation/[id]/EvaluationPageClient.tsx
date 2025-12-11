'use client';

import { useRouter, notFound } from "next/navigation";
import { QuestionnaireForm } from "@/components/questionnaire-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Logo } from "@/components/logo";
import { useEffect } from "react";
import type { Questionnaire } from "@/lib/data";
import type { EvaluationSession } from "@/lib/store";

type EvaluationPageClientProps = {
  params: { id: string };
  questionnaire: Questionnaire;
  session: EvaluationSession | null;
  patientId: string | null;
  isRemote: boolean;
  intermediateResults?: string;
};

export function EvaluationPageClient({
  params,
  questionnaire,
  session,
  patientId,
  isRemote,
  intermediateResults
}: EvaluationPageClientProps) {
  const router = useRouter();

  // useEffect handles client-side redirection logic for remote sessions
  useEffect(() => {
    if (isRemote && patientId && session) {
      const completedQuestionnaireIds = intermediateResults
        ? JSON.parse(intermediateResults).map((r: any) => r.questionnaireId)
        : [];

      const nextQuestionnaireId = session.questionnaireIds.find(
        (id) => !completedQuestionnaireIds.includes(id)
      );

      // If there is a next questionnaire and it's not the one we are currently on, redirect.
      if (nextQuestionnaireId && nextQuestionnaireId !== params.id) {
        let nextUrl = `/evaluation/${nextQuestionnaireId}?patient=${patientId}&remote=true&session=${session.sessionId}`;
        if (intermediateResults) {
            nextUrl += `&intermediateResults=${encodeURIComponent(intermediateResults)}`;
        }
        router.replace(nextUrl);
      }
    }
  }, [params.id, isRemote, patientId, session, intermediateResults, router]);


  if (!questionnaire) {
    // Should be caught by server component, but as a fallback.
    notFound();
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
              sessionId={session?.sessionId || undefined}
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
