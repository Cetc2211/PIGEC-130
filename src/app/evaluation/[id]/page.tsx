'use server';

import { notFound } from "next/navigation";
import { getQuestionnaire } from "@/lib/data";
import { getEvaluationSession } from "@/lib/store";
import { EvaluationPageClient } from "./EvaluationPageClient";
import { Suspense } from "react";

type EvaluationPageProps = {
  params: {
    id: string;
  };
  searchParams: { [key: string]: string | string[] | undefined };
};


export default async function EvaluationPage({ params, searchParams }: EvaluationPageProps) {
  const questionnaire = getQuestionnaire(params.id);
  if (!questionnaire) {
    notFound();
  }

  const sessionId = typeof searchParams.session === 'string' ? searchParams.session : null;
  const patientId = typeof searchParams.patient === 'string' ? searchParams.patient : null;
  const isRemote = searchParams.remote === 'true';

  let session = null;
  if (isRemote && sessionId) {
    session = getEvaluationSession(sessionId);
    // CRITICAL FIX: Add a check to ensure the session object exists before trying to access its properties.
    // If the session is not found, it's a "not found" case.
    if (!session || session.patientId !== patientId) {
      notFound();
    }
  }
  
  const intermediateResults = typeof searchParams.intermediateResults === 'string' ? searchParams.intermediateResults : undefined;

  return (
    <Suspense fallback={<div>Cargando...</div>}>
      <EvaluationPageClient
        params={params}
        questionnaire={questionnaire}
        session={session}
        patientId={patientId}
        isRemote={isRemote}
        intermediateResults={intermediateResults}
      />
    </Suspense>
  )
}
