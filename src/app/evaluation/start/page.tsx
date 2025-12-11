'use client';

import { Suspense, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { getEvaluationSession } from '@/lib/store';
import { Loader2 } from 'lucide-react';

function StartEvaluationContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const sessionId = searchParams.get('session');

    useEffect(() => {
        if (!sessionId) {
            // TODO: Show an error page
            router.replace('/');
            return;
        }

        const session = getEvaluationSession(sessionId);

        if (!session || session.questionnaireIds.length === 0) {
            // TODO: Show an error page
            router.replace('/');
            return;
        }

        const firstQuestionnaireId = session.questionnaireIds[0];
        const patientId = session.patientId;

        // Redirect to the first questionnaire in the session
        const initialUrl = `/evaluation/${firstQuestionnaireId}?patient=${patientId}&remote=true&session=${sessionId}`;
        router.replace(initialUrl);

    }, [sessionId, router]);

    return (
        <div className="flex flex-col items-center justify-center min-h-screen text-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
            <h1 className="text-xl font-semibold">Iniciando evaluación...</h1>
            <p className="text-muted-foreground">Por favor, espera un momento.</p>
        </div>
    );
}


export default function StartEvaluationPage() {
    return (
        <Suspense fallback={<div>Cargando sesión...</div>}>
            <StartEvaluationContent />
        </Suspense>
    )
}
