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
  const allQuestions = questionnaire?.sections.flatMap(s => s.questions) ?? [];

  const mainScoreId = Object.keys(result.scores)[0] || 'main';
  const mainScore = result.scores[mainScoreId];
  const mainTotalPossible = result.totalPossibleScores[mainScoreId];

  const hasNumericScore = mainTotalPossible > 0;
  const interpretation = hasNumericScore ? getInterpretation(result.questionnaireId, mainScore) : null;

  const evaluationDataForAI = JSON.stringify({
    questionnaireName: result.questionnaireName,
    scores: result.scores,
    totalPossibleScores: result.totalPossibleScores,
    interpretation: interpretation, // Will need adjustment for multi-score
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
                    <CardDescription>Resumen de Puntuaciones</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {hasNumericScore ? (
                        <>
                           {Object.entries(result.scores).map(([sectionId, score], index) => {
                                const total = result.totalPossibleScores[sectionId];
                                const sectionPercentage = total > 0 ? (score / total) * 100 : 0;
                                const sectionInterpretation = getInterpretation(result.questionnaireId, score);
                                const section = questionnaire?.sections.find(s => s.sectionId === sectionId);
                                const sectionName = section?.name || sectionId;

                                return (
                                    <div key={sectionId}>
                                        <h3 className="font-semibold text-lg">{sectionName}</h3>
                                        <div className="flex items-baseline gap-2 mt-1">
                                            <span className="text-2xl font-bold">{score}</span>
                                            <span className="text-muted-foreground">/ {total}</span>
                                        </div>
                                        <Progress value={sectionPercentage} aria-label={`${sectionPercentage.toFixed(0)}%`} className="mt-2" />
                                         {sectionInterpretation && (
                                            <div className="mt-3">
                                                <h4 className="font-medium text-sm">Interpretación</h4>
                                                <div className='flex items-center gap-2 mt-1'>
                                                    <Badge variant={sectionInterpretation.severity === 'Alta' ? 'destructive' : 'secondary'}>
                                                        Severidad {sectionInterpretation.severity}
                                                    </Badge>
                                                    <p className="text-xs text-muted-foreground">{sectionInterpretation.summary}</p>
                                                </div>
                                            </div>
                                         )}
                                         {index < Object.keys(result.scores).length - 1 && <Separator className="mt-6"/>}
                                    </div>
                                );
                           })}
                        </>
                    ) : (
                        <p className="text-sm text-muted-foreground">Este cuestionario es cualitativo o no tiene una puntuación numérica interpretable.</p>
                    )}
                </CardContent>
            </Card>
             <Card>
                <CardHeader>
                    <CardTitle className="font-headline">Respuestas</CardTitle>
                    <CardDescription>Respuestas detalladas a cada pregunta.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {allQuestions.map((question, index) => {
                        const answer = result.answers[question.id];
                        let displayAnswer: string;
                        const section = questionnaire?.sections.find(s => s.questions.some(q => q.id === question.id));
                        const options = question.options || section?.likertScale;

                        if (question.type === 'likert' && options) {
                            const option = options.find(o => o.value === Number(answer));
                            displayAnswer = option ? `${option.label} (${answer})` : String(answer);
                        } else {
                            displayAnswer = String(answer);
                        }

                        return (
                            <div key={question.id}>
                                <p className="text-sm font-semibold">{index + 1}. {question.text}</p>
                                <p className="text-sm text-muted-foreground whitespace-pre-wrap pl-4 border-l-2 ml-2 mt-1 py-1">
                                    {displayAnswer}
                                </p>
                                {index < allQuestions.length - 1 && <Separator className="mt-4"/>}
                            </div>
                        );
                    })}
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
