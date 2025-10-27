'use client';

import { useState, useTransition } from 'react';
import { Button } from './ui/button';
import { generateReportAction } from '@/app/actions';
import { Sparkles, Loader2 } from 'lucide-react';
import { MarkdownRenderer } from './markdown-renderer';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';

type ReportGeneratorProps = {
  resultId: string;
  evaluationData: string;
};

export function ReportGenerator({ resultId, evaluationData }: ReportGeneratorProps) {
  const [isPending, startTransition] = useTransition();
  const [report, setReport] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerateReport = () => {
    startTransition(async () => {
      setError(null);
      const result = await generateReportAction(resultId, evaluationData);
      if (result.success) {
        setReport(result.report);
      } else {
        setError(result.report || 'Ocurrió un error desconocido.');
      }
    });
  };

  if (report) {
    return <MarkdownRenderer content={report} />;
  }
  
  if (isPending) {
    return (
        <div className="flex flex-col items-center justify-center text-center p-8 border-2 border-dashed rounded-lg min-h-[200px]">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
            <p className="font-semibold">Generando Informe...</p>
            <p className="text-sm text-muted-foreground">La IA está analizando los resultados. Esto puede tardar un momento.</p>
        </div>
    )
  }
  
  if (error) {
     return (
        <Alert variant="destructive">
            <AlertTitle>Falló la Generación del Informe</AlertTitle>
            <AlertDescription>
                {error}
                <Button variant="link" onClick={handleGenerateReport} className="p-0 h-auto ml-1">Intentar de Nuevo</Button>
            </AlertDescription>
        </Alert>
     )
  }

  return (
    <div className="flex flex-col items-center justify-center text-center p-8 border-2 border-dashed rounded-lg min-h-[200px]">
        <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <Sparkles className="h-6 w-6 text-primary" />
        </div>
      <h3 className="font-semibold">Generar un Informe con IA</h3>
      <p className="text-sm text-muted-foreground mb-4 max-w-sm">
        Haz clic en el botón para generar un informe detallado con visualizaciones y hallazgos clave basados en los datos de la evaluación.
      </p>
      <Button onClick={handleGenerateReport} disabled={isPending}>
        {isPending ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Generando...
          </>
        ) : (
          <>
            <Sparkles className="mr-2 h-4 w-4" />
            Generar con IA
          </>
        )}
      </Button>
    </div>
  );
}
