import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";

export default function PatientsPage() {
  return (
    <div className="flex flex-col h-full">
      <header className="p-4 sm:p-6 border-b flex justify-between items-center">
        <div>
            <h1 className="font-headline text-2xl sm:text-3xl font-bold tracking-tight">
            Gestión de Pacientes
            </h1>
            <p className="text-muted-foreground mt-1">
            Crea, busca y administra los expedientes de tus pacientes.
            </p>
        </div>
        <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Añadir Nuevo Paciente
        </Button>
      </header>
      <main className="flex-1 overflow-auto p-4 sm:p-6">
        <div className="flex flex-col items-center justify-center text-center p-8 border-2 border-dashed rounded-lg min-h-[400px]">
            <Users className="h-16 w-16 text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold">No hay pacientes todavía</h2>
            <p className="text-muted-foreground mt-2 max-w-sm">
                Haz clic en "Añadir Nuevo Paciente" para crear el primer expediente y empezar a asignar evaluaciones.
            </p>
        </div>
      </main>
    </div>
  );
}
