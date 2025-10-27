import { notFound } from 'next/navigation';
import { getResult } from '@/lib/store';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ReportGenerator } from '@/components/report-generator';
import { Progress } from '@/components/ui/progress';
import { getInterpretation } from '@/lib/data';

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

  const percentage = (result.score / result.totalPossibleScore) * 100;
  const interpretation = getInterpretation(result.questionnaireId, result.score);

  const evaluationDataForAI = JSON.stringify({
    questionnaireName: result.questionnaireName,
    score: result.score,
    totalPossibleScore: result.totalPossibleScore,
    interpretation: interpretation,
    submittedAt: result.submittedAt.toISOString(),
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <header className="mb-8">
        <h1 className="font-headline text-3xl font-bold tracking-tight">Resultado de la Evaluación</h1>
        <p className="text-muted-foreground">
          Enviado el {new Date(result.submittedAt).toLocaleString()}
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1 flex flex-col gap-6">
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline">{result.questionnaireName}</CardTitle>
                    <CardDescription>Resumen de Puntuación</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
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
