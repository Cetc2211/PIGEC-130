import { CreateEvaluationForm } from "@/components/create-evaluation-form";
import { SidebarTriggerButton } from "@/components/sidebar-trigger-button";

export default function CreateEvaluationPage() {
  return (
    <div className="p-4 sm:p-6 lg:p-8">
       <header className="p-4 sm:p-6 border-b mb-8 flex items-center gap-4">
        <SidebarTriggerButton />
        <div>
          <h1 className="font-headline text-2xl sm:text-3xl font-bold tracking-tight">
            Crear Nueva Evaluación
          </h1>
          <p className="text-muted-foreground mt-1">
            Diseña tu propio cuestionario con preguntas, escalas y reglas de interpretación personalizadas.
          </p>
        </div>
      </header>
      <main>
        <CreateEvaluationForm />
      </main>
    </div>
  );
}
