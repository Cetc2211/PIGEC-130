import { notFound } from 'next/navigation';
import { getResult } from '@/lib/store';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ReportGenerator } from '@/components/report-generator';
import { Progress } from '@/components/ui/progress';
import { getInterpretation, getQuestionnaire } from '@/lib/data';
import { Separator } from '@/components/ui/separator';
import { SidebarTriggerButton } from '@/components/sidebar-trigger-button';

type ResultsPageProps = {
  params: {
    resultId: string;
  };
};

export default function ResultPage({ params }: ResultsPageProps) {
  const result = getResult(params.resultId);

  if (!result) {
    notFound();
  }

  const questionnaire = getQuestionnaire(result.questionnaireId);

  const hasNumericScore = result.totalPossibleScore > 0;
  const percentage = hasNumericScore ? (result.score / result.totalPossibleScore) * 100 : 0;
  const interpretation = hasNumericScore ? getInterpretation(result.questionnaireId, result.score) : null;

  const evaluationDataForAI = JSON.stringify({
    questionnaireName: result.questionnaireName,
    score: result.score,
    totalPossibleScore: result.totalPossibleScore,
    interpretation: interpretation,
    answers: result.answers,
    submittedAt: result.submittedAt.toISOString(),
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <header className="mb-8 flex items-center gap-4">
        <SidebarTriggerButton />
        <div>
          <h1 className="font-headline text-3xl font-bold tracking-tight">Resultado de la Evaluación</h1>
          <p className="text-muted-foreground">
            Enviado el {new Date(result.submittedAt).toLocaleString()}
          </p>
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1 flex flex-col gap-6">
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline">{result.questionnaireName}</CardTitle>
                    <CardDescription>Resumen de Puntuación</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {hasNumericScore && interpretation ? (
                        <>
                            <div className="flex items-baseline gap-2">
                                <span className="text-4xl font-bold">{result.score}</span>
                                <span className="text-muted-foreground">/ {result.totalPossibleScore}</span>
                            </div>
                            <Progress value={percentage} aria-label={`${percentage.toFixed(0)}%`} />
                            <div>
                                <h3 className="font-semibold mb-2">Interpretación</h3>
                                <Badge variant={interpretation.severity === 'Alta' ? 'destructive' : 'secondary'}>
                                    Severidad {interpretation.severity}
                                </Badge>
                                <p className="text-sm text-muted-foreground mt-2">{interpretation.summary}</p>
                            </div>
                        </>
                    ) : (
                        <p className="text-sm text-muted-foreground">Este cuestionario no tiene una puntuación numérica.</p>
                    )}
                </CardContent>
            </Card>
             <Card>
                <CardHeader>
                    <CardTitle className="font-headline">Respuestas</CardTitle>
                    <CardDescription>Respuestas detalladas a cada pregunta.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {questionnaire?.questions.map((question, index) => (
                        <div key={question.id}>
                            <p className="text-sm font-semibold">{index + 1}. {question.text}</p>
                            <p className="text-sm text-muted-foreground pl-4 border-l-2 ml-2 mt-1 py-1">
                                {String(result.answers[question.id])}
                            </p>
                            {index < questionnaire.questions.length - 1 && <Separator className="mt-4"/>}
                        </div>
                    ))}
                </CardContent>
            </Card>
        </div>

        <div className="lg:col-span-2">
            <Card className="min-h-[300px]">
                <CardHeader>
                    <CardTitle className="font-headline">Informe Automatizado</CardTitle>
                    <CardDescription>Análisis y visualizaciones de los resultados generados por IA.</CardDescription>
                </CardHeader>
                <CardContent>
                    <ReportGenerator resultId={params.resultId} evaluationData={evaluationDataForAI} />
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}
