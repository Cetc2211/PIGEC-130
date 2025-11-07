'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { PlusCircle, User, Users, FileText, BookOpen } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { AddPatientForm } from '@/components/add-patient-form';
import type { Patient } from '@/lib/store';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

function PatientList({ patients }: { patients: Patient[] }) {
    if (patients.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center text-center p-8 border-2 border-dashed rounded-lg min-h-[400px]">
                <Users className="h-16 w-16 text-muted-foreground mb-4" />
                <h2 className="text-xl font-semibold">No hay pacientes todavía</h2>
                <p className="text-muted-foreground mt-2 max-w-sm">
                    Haz clic en "Añadir Nuevo Paciente" para crear el primer expediente y empezar a asignar evaluaciones.
                </p>
            </div>
        );
    }

    return (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {patients.map(patient => (
                <Card key={patient.id} className="cursor-pointer hover:shadow-lg transition-shadow flex flex-col">
                    <CardHeader>
                        <div className="flex items-start justify-between">
                            <CardTitle className="flex items-center gap-2 font-headline text-lg">
                                <User className="h-5 w-5 text-primary" />
                                {patient.name}
                            </CardTitle>
                             <Badge variant="outline">{patient.recordId}</Badge>
                        </div>
                        <CardDescription>
                            Registrado el {format(patient.createdAt, "dd/MM/yyyy")}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3 text-sm flex-grow">
                        <div className="flex items-center gap-2">
                            <BookOpen className="h-4 w-4 text-muted-foreground" />
                            <span>{patient.semester}º Semestre</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-muted-foreground" />
                            <span>Grupo {patient.group}</span>
                        </div>
                         <div className="flex items-center gap-2 pt-2 text-muted-foreground">
                            <FileText className="h-4 w-4" />
                            <span>0 Evaluaciones asignadas</span>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}

export function PatientPageClient({ patients }: { patients: Patient[] }) {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    
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
        <Button onClick={() => setIsDialogOpen(true)}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Añadir Nuevo Paciente
        </Button>
      </header>
      <main className="flex-1 overflow-auto p-4 sm:p-6">
        <PatientList patients={patients} />
      </main>

       <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Añadir Nuevo Paciente</DialogTitle>
                    <DialogDescription>
                        Introduce los detalles del nuevo paciente para crear su expediente.
                    </DialogDescription>
                </DialogHeader>
                <AddPatientForm onFinished={() => setIsDialogOpen(false)} />
            </DialogContent>
        </Dialog>
    </div>
  );
}
