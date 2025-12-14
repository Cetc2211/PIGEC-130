'use client';

import {
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";

interface ReferralFlowProps {
    studentName: string;
    diagnosticImpression: string;
}

/**
 * Validates that sensitive data is not included in the referral letter.
 * @param template The letter template to check.
 * @returns boolean - True if the template is clean, false otherwise.
 */
function validateReferralContent(template: string): boolean {
    const lowerCaseTemplate = template.toLowerCase();
    const forbiddenTerms = ['bdi', 'bai', 'soap', 'beck Depression Inventory']; // Terms to exclude
    
    for (const term of forbiddenTerms) {
        if (lowerCaseTemplate.includes(term)) {
            console.error(`VALIDATION FAILED: El término prohibido "${term}" fue encontrado en la carta de referencia.`);
            return false;
        }
    }
    
    // Test de Integridad Documental (Cap. 8): La impresión diagnóstica debe estar presente.
    if (!lowerCaseTemplate.includes('impresión diagnóstica provisional')) {
        console.error("VALIDATION FAILED: La Impresión Diagnóstica Provisional es obligatoria y no fue encontrada.");
        return false;
    }
    
    return true;
}


export default function ReferralFlow({ studentName, diagnosticImpression }: ReferralFlowProps) {

    const referralLetterTemplate = `
[MEMBRETE DE LA INSTITUCIÓN]

Fecha: ${new Date().toLocaleDateString('es-MX')}
Para: [Nombre del Especialista / Institución de Salud]
De: [Tu Nombre], Psicólogo(a), CBTA 130

Asunto: Solicitud de Valoración Especializada y Contrarreferencia para el estudiante ${studentName}.

Estimado(a) colega,

Por medio de la presente, se solicita su valiosa colaboración para la valoración especializada del estudiante ${studentName}, quien forma parte de nuestro programa de seguimiento.

Tras la aplicación de los protocolos de detección y evaluación inicial, se ha identificado una Impresión Diagnóstica Provisional que sugiere la necesidad de una valoración más profunda en su área de especialidad.

**Impresión Diagnóstica Provisional (Resumen):**
${diagnosticImpression || '[RESUMIR AQUÍ LOS HALLAZGOS CLAVE: Ej. "Sintomatología ansioso-depresiva severa con ideación suicida activa", "Indicadores de posible TDAH que exceden el ámbito de intervención escolar", etc.]'}

Se adjunta un resumen del expediente con los puntajes relevantes y la formulación funcional del caso para su revisión.

Agradecemos de antemano su atención y quedamos a la espera de la **Contrarreferencia** con sus hallazgos y recomendaciones para poder dar seguimiento coordinado y garantizar la continuidad de la atención del estudiante.

Atentamente,

[Tu Nombre y Cédula Profesional]
Psicólogo(a) del Departamento de Orientación Educativa
CBTA 130
`.trim();

    const isContentValid = validateReferralContent(referralLetterTemplate);

    const handleCopy = () => {
         if (isContentValid) {
            navigator.clipboard.writeText(referralLetterTemplate);
            alert("Plantilla copiada al portapapeles. El contenido ha sido validado.");
         } else {
             alert("ERROR DE VALIDACIÓN: No se puede copiar la plantilla. Contiene datos sensibles o le falta información requerida. Revise la consola.");
         }
    };

    return (
        <DialogContent className="max-w-2xl">
             <DialogHeader>
                <DialogTitle>Flujo de Derivación y Contrarreferencia</DialogTitle>
                <DialogDescription>
                    Activación del protocolo de canalización a especialistas externos (Cap. 8.3).
                </DialogDescription>
            </DialogHeader>
             <div className="space-y-4">
                <h3 className="text-md font-semibold text-gray-800">Plantilla de Carta de Canalización (Datos Sanitizados)</h3>
                <Textarea
                    value={referralLetterTemplate}
                    readOnly
                    className={`min-h-[400px] bg-gray-50 text-sm font-mono ${!isContentValid ? 'border-red-500 ring-2 ring-red-500' : ''}`}
                />
                {!isContentValid && (
                    <p className="text-sm text-red-600 font-bold">
                        Error de validación: Se detectaron datos clínicos sensibles o falta la impresión diagnóstica. La copia está deshabilitada.
                    </p>
                )}
                    <div className="flex justify-end">
                    <Button onClick={handleCopy} disabled={!isContentValid}>
                        Copiar Plantilla Validada
                    </Button>
                </div>
            </div>
        </DialogContent>
    );
}
