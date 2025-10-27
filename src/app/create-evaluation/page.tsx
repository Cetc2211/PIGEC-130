import { CreateEvaluationForm } from "@/components/create-evaluation-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function CreateEvaluationPage() {
  return (
    <div className="p-4 sm:p-6 lg:p-8">
       <header className="p-4 sm:p-6 border-b mb-8">
        <h1 className="font-headline text-2xl sm:text-3xl font-bold tracking-tight">
          Create New Evaluation
        </h1>
        <p className="text-muted-foreground mt-1">
          Design your own questionnaire with custom questions, scales, and interpretation rules.
        </p>
      </header>
      <main>
        <CreateEvaluationForm />
      </main>
    </div>
  );
}
