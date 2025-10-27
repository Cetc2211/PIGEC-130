import { notFound } from "next/navigation";
import { getQuestionnaire } from "@/lib/data";
import { QuestionnaireForm } from "@/components/questionnaire-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Logo } from "@/components/logo";

type EvaluationPageProps = {
  params: {
    id: string;
  };
};

export default function EvaluationPage({ params }: EvaluationPageProps) {
  const questionnaire = getQuestionnaire(params.id);

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
            <QuestionnaireForm questionnaire={questionnaire} />
          </CardContent>
        </Card>
         <p className="text-center text-sm text-muted-foreground mt-6">
            EscalaWeb - Evaluaciones psicológicas modernas
        </p>
      </div>
    </div>
  );
}
