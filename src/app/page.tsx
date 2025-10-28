import { QuestionnaireList } from "@/components/questionnaire-list";
import { getAllQuestionnaires } from "@/lib/data";

export default function DashboardPage() {
  const questionnaires = getAllQuestionnaires();

  return (
    <div className="flex flex-col h-full">
      <header className="p-4 sm:p-6 border-b">
        <h1 className="font-headline text-2xl sm:text-3xl font-bold tracking-tight">
          Evaluaciones Disponibles
        </h1>
        <p className="text-muted-foreground mt-1">
          Selecciona una evaluación para generar un enlace único para tu cliente.
        </p>
      </header>
      <main className="flex-1 overflow-auto p-4 sm:p-6">
        <QuestionnaireList questionnaires={questionnaires} />
      </main>
    </div>
  );
}
