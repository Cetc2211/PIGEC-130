'use client';

import {
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "./ui/button";
import FichaIdentificacionForm from "./FichaIdentificacionForm";
import ChteForm from "./ChteForm";
import BdiForm from "./BdiForm";
import { NeuroScreeningConsole } from "./NeuroScreeningConsole";

interface ScreeningInstrumentDialogProps {
    instrumentId: string;
    instrumentTitle: string;
}

const InstrumentComponent = ({ id }: { id: string }) => {
    switch (id) {
        case 'ficha-id':
            return <FichaIdentificacionForm />;
        case 'chte':
            return <ChteForm />;
        case 'bdi-ii':
            return <BdiForm />;
        case 'neuro-screen':
            return <NeuroScreeningConsole studentId="preview" />;
        // Agrega casos para BAI, ASSIST, etc.
        default:
            return <p>Instrumento no disponible para previsualización.</p>;
    }
}

export default function ScreeningInstrumentDialog({ instrumentId, instrumentTitle }: ScreeningInstrumentDialogProps) {
    
    return (
        <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
            <DialogHeader>
                <DialogTitle>Vista Previa: {instrumentTitle}</DialogTitle>
                <DialogDescription>
                    Este es un ejemplo interactivo del instrumento. Los datos no serán guardados.
                </DialogDescription>
            </DialogHeader>
            <div className="flex-grow overflow-y-auto pr-4">
                <InstrumentComponent id={instrumentId} />
            </div>
            <DialogFooter>
                <Button variant="outline" type="button">Cerrar</Button>
            </DialogFooter>
        </DialogContent>
    )
}