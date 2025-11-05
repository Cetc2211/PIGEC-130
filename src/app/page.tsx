import { QuestionnaireList } from "@/components/questionnaire-list";
import { getAllQuestionnaires, Questionnaire } from "@/lib/data";

export default function DashboardPage() {
  const questionnaires = getAllQuestionnaires();

  const groupedQuestionnaires = questionnaires.reduce((acc, q) => {
    const category = q.category || "Sin Categoría";
    const subcategory = q.subcategory || "General";
    
    if (!acc[category]) {
      acc[category] = {};
    }
    if (!acc[category][subcategory]) {
      acc[category][subcategory] = [];
    }
    acc[category][subcategory].push(q);
    
    return acc;
  }, {} as Record<string, Record<string, Questionnaire[]>>);


  return (
    <div className="flex flex-col h-full">
      <header className="p-4 sm:p-6 border-b">
        <h1 className="font-headline text-2xl sm:text-3xl font-bold tracking-tight">
          Biblioteca de Evaluaciones
        </h1>
        <p className="text-muted-foreground mt-1">
          Explora, revisa y selecciona las pruebas psicológicas para tus pacientes.
        </p>
      </header>
      <main className="flex-1 overflow-auto p-4 sm:p-6">
        <QuestionnaireList groupedQuestionnaires={groupedQuestionnaires} />
      </main>
    </div>
  );
}
