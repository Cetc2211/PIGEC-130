'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BookCheck, Lightbulb, Users } from "lucide-react";
import { getEvidenceRepository } from "@/lib/store";
import { Badge } from "@/components/ui/badge";

export default function ToolsPage() {
  const evidence = getEvidenceRepository();

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-2 text-gray-800">
        Repositorio de Evidencia (Cap. 9)
      </h1>
      <p className="mb-8 text-sm text-gray-600">
        Base de conocimiento de referencias bibliográficas que respaldan las intervenciones del modelo MTSS.
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {evidence.map((ref) => (
          <Card key={ref.id}>
            <CardHeader>
              <CardTitle className="text-xl flex items-start gap-3">
                <BookCheck className="text-blue-600 mt-1 flex-shrink-0" />
                {ref.titulo}
              </CardTitle>
              <CardDescription className="flex flex-col sm:flex-row sm:items-center sm:justify-between pt-2">
                <div className="flex items-center gap-2">
                    <Users className="h-4 w-4"/>
                    <span className="font-semibold">{ref.autor} ({ref.ano})</span>
                </div>
                <Badge variant="secondary">{ref.modeloIntervencion}</Badge>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                 <div>
                    <h4 className="font-semibold text-sm flex items-center gap-2 mb-2"><Lightbulb/>Aplicabilidad</h4>
                    <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-md border">{ref.aplicabilidad}</p>
                 </div>
                 <div>
                    <h4 className="font-semibold text-sm mb-2">Etiquetas</h4>
                    <div className="flex flex-wrap gap-2">
                        {ref.tags.map(tag => (
                            <Badge key={tag} variant="outline">{tag}</Badge>
                        ))}
                    </div>
                 </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
