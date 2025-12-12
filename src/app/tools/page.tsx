import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText } from "lucide-react";

export default function ToolsPage() {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">
        Herramientas de Intervención
      </h1>
      <p className="mb-8 text-sm text-gray-600">
        Acceso a manuales, guías y recursos para el personal (Cap. 9).
      </p>

      <Card className="max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText />
            Recursos Disponibles
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-700">
            Esta sección contendrá los enlaces a los manuales de DBT, guías de TCC, y otros materiales de apoyo para la intervención en Nivel 1 y 2.
          </p>
           <p className="mt-4 text-sm text-gray-500">
            (Funcionalidad en desarrollo)
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
