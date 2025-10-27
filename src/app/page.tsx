import { QuestionnaireList } from "@/components/questionnaire-list";
import { questionnaires } from "@/lib/data";

export default function DashboardPage() {
  return (
    <div className="flex flex-col h-full">
      <header className="p-4 sm:p-6 border-b">
        <h1 className="font-headline text-2xl sm:text-3xl font-bold tracking-tight">
          Available Evaluations
        </h1>
        <p className="text-muted-foreground mt-1">
          Select an evaluation to generate a unique link for your client.
        </p>
      </header>
      <main className="flex-1 overflow-auto p-4 sm:p-6">
        <QuestionnaireList questionnaires={questionnaires} />
      </main>
    </div>
  );
}
