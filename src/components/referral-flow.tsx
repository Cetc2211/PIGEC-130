'use client';
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { AlertTriangle, FileText } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

interface ReferralFlowProps {
    studentName: string;
}

export default function ReferralFlow({ studentName }: ReferralFlowProps) {

    const handleActivateFlow = () => {
        // En una aplicación real, esto registraría la acción en la bitácora.
        console.log(`ACTIVANDO FLUJO DE DERIVACIÓN para ${studentName} el ${new Date().toISOString()}`);
    };

    const referralLetterTemplate = `
[MEMBRETE DE LA INSTITUCIÓN]

Fecha: ${new Date().toLocaleDateString('es-MX')}
Para: [Nombre del Especialista / Institución de Salud]
De: [Tu Nombre], Psicólogo(a), CBTA 130

Asunto: Solicitud de Valoración Especializada y Contrarreferencia para el estudiante ${studentName}.

Estimado(a) colega,

Por medio de la presente, se solicita su valiosa colaboración para la valoración especializada del estudiante ${studentName}, quien forma parte de nuestro programa de seguimiento.

Tras la aplicación de los protocolos de detección y evaluación inicial, se ha identificado una **Impresión Diagnóstica Provisional** que sugiere la necesidad de una valoración más profunda en su área de especialidad.

**Impresión Diagnóstica Provisional (Resumen):**
[RESUMIR AQUÍ LOS HALLAZGOS CLAVE: Ej. "Sintomatología ansioso-depresiva severa con ideación suicida activa", "Indicadores de posible TDAH que exceden el ámbito de intervención escolar", "Sintomatología compatible con un posible trastorno de la conducta alimentaria", etc.]

Se adjunta un resumen del expediente con los puntajes relevantes (BDI-II, BAI, Escala de Riesgo Suicida, etc.) y la formulación funcional del caso para su revisión.

Agradecemos de antemano su atención y quedamos a la espera de la **Contrarreferencia** con sus hallazgos y recomendaciones para poder dar seguimiento coordinado y garantizar la continuidad de la atención del estudiante.

Atentamente,

[Tu Nombre y Cédula Profesional]
Psicólogo(a) del Departamento de Orientación Educativa
CBTA 130
`.trim();

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button 
                    onClick={handleActivateFlow} 
                    variant="outline"
                    className="font-bold w-full md:w-auto"
                >
                    <FileText className="mr-2 h-4 w-4" />
                    Derivar a Especialista Externo
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
                 <DialogHeader>
                    <DialogTitle>Flujo de Derivación y Contrarreferencia</DialogTitle>
                    <DialogDescription>
                        Activación del protocolo de canalización a especialistas externos (Cap. 11.2.3).
                    </DialogDescription>
                </DialogHeader>
                 <div className="space-y-4">
                    <h3 className="text-md font-semibold text-gray-800">Plantilla de Carta de Canalización</h3>
                    <Textarea
                        value={referralLetterTemplate}
                        readOnly
                        className="min-h-[400px] bg-gray-50 text-sm font-mono"
                    />
                        <div className="flex justify-end">
                        <Button onClick={() => navigator.clipboard.writeText(referralLetterTemplate)}>
                            Copiar Plantilla
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}