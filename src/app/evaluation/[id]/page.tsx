import { notFound } from "next/navigation";
import { getQuestionnaire } from "@/lib/data";
import { QuestionnaireForm } from "@/components/questionnaire-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Logo } from "@/components/logo";

type EvaluationPageProps = {
  params: {
    id: string;
  };
  searchParams?: {
    patient?: string;
    remote?: string;
  };
};

export default function EvaluationPage({ params, searchParams }: EvaluationPageProps) {
  const questionnaire = getQuestionnaire(params.id);
  const patientId = searchParams?.patient;
  const isRemote = searchParams?.remote === 'true';

  if (!questionnaire) {
    notFound();
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
            <QuestionnaireForm questionnaire={questionnaire} patientId={patientId} isRemote={isRemote} />
          </CardContent>
        </Card>
         <p className="text-center text-sm text-muted-foreground mt-6">
            EscalaWeb - Evaluaciones psicológicas modernas
        </p>
      </div>
    </div>
  );
}
