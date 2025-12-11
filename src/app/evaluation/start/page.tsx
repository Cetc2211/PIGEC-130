'use client';

import { Suspense, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

function StartEvaluationContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const sessionId = searchParams.get('session');
    const patientId = searchParams.get('patientId');
    const firstQuestionnaireId = searchParams.get('firstQuestionnaireId');

    useEffect(() => {
        if (!sessionId || !patientId || !firstQuestionnaireId) {
            // TODO: Show an error page, for now redirect home
            router.replace('/');
            return;
        }
        
        // All data is present, perform the redirect.
        const initialUrl = `/evaluation/${firstQuestionnaireId}?patient=${patientId}&remote=true&session=${sessionId}`;
        router.replace(initialUrl);

    }, [sessionId, patientId, firstQuestionnaireId, router]);

    return (
        <div className="flex flex-col items-center justify-center min-h-screen text-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
            <h1 className="text-xl font-semibold">Iniciando evaluación...</h1>
            <p className="text-muted-foreground">Por favor, espera un momento.</p>
        </div>
    );
}


export default function StartEvaluationPageWrapper() {
    return (
        <Suspense fallback={<div>Cargando sesión...</div>}>
            <StartEvaluationContent />
        </Suspense>
    )
}
