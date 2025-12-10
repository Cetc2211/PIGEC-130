'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { User, Users, FileText, UserPlus } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import type { Patient, Assignment } from '@/lib/store';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './ui/accordion';
import { Badge } from './ui/badge';
import { Skeleton } from './ui/skeleton';
import { SidebarTriggerButton } from './sidebar-trigger-button';
import { AddPatientForm } from './add-patient-form';


function PatientList({ patientsByGroup, assignmentsByPatient }: { patientsByGroup: Record<string, Patient[]>, assignmentsByPatient: Record<string, Assignment[]> }) {
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    if (Object.keys(patientsByGroup).length === 0) {
        return (
            <div className="flex flex-col items-center justify-center text-center p-8 border-2 border-dashed rounded-lg min-h-[400px]">
                <Users className="h-16 w-16 text-muted-foreground mb-4" />
                <h2 className="text-xl font-semibold">No hay grupos ni pacientes todavía</h2>
                <p className="text-muted-foreground mt-2 max-w-sm">
                    Haz clic en "Añadir Estudiante" para crear tu primer expediente.
                </p>
            </div>
        );
    }

    return (
        <Accordion type="multiple" className="w-full space-y-4" defaultValue={Object.keys(patientsByGroup)}>
            {Object.entries(patientsByGroup).map(([groupKey, patients]) => (
                 <AccordionItem value={groupKey} key={groupKey} className="border-none">
                    <AccordionTrigger className="p-4 bg-muted/50 rounded-lg hover:bg-muted">
                        <div className="flex items-center gap-3">
                            <Users className="h-6 w-6 text-primary" />
                            <h2 className="text-xl font-headline font-semibold">{groupKey}</h2>
                            <Badge variant="outline">{patients.length} Estudiantes</Badge>
                        </div>
                    </AccordionTrigger>
                    <AccordionContent className="pt-4 pl-4 pr-4">
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                            {patients.map(patient => {
                                const patientAssignments = assignmentsByPatient[patient.id] || [];
                                return (
                                <Link href={`/patients/${patient.id}`} key={patient.id}>
                                    <Card className="cursor-pointer hover:shadow-lg transition-shadow flex flex-col h-full">
                                        <CardHeader>
                                            <div className="flex items-start justify-between">
                                                <CardTitle className="flex items-center gap-2 font-headline text-lg">
                                                    <User className="h-5 w-5 text-primary" />
                                                    {patient.name}
                                                </CardTitle>
                                                <Badge variant="outline">{patient.recordId}</Badge>
                                            </div>
                                            <CardDescription>
                                                {isClient ? (
                                                    `Registrado el ${new Date(patient.createdAt).toLocaleDateString()}`
                                                ) : (
                                                    <Skeleton className="h-4 w-24" />
                                                )}
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent className="space-y-3 text-sm flex-grow">
                                            <div className="flex items-center gap-2 pt-2 text-muted-foreground">
                                                <FileText className="h-4 w-4" />
                                                <span>{patientAssignments.length} Evaluaciones asignadas</span>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </Link>
                            )})}
                        </div>
                    </AccordionContent>
                </AccordionItem>
            ))}
        </Accordion>
    );
}

export function PatientPageClient({ patients, assignments }: { patients: Patient[], assignments: Assignment[] }) {
    const [isAddPatientOpen, setIsAddPatientOpen] = useState(false);

    const patientsByGroup = useMemo(() => {
        return patients.reduce((acc, patient) => {
            const key = `${patient.semester}º Semestre - Grupo ${patient.group}`;
            if (!acc[key]) {
                acc[key] = [];
            }
            acc[key].push(patient);
            return acc;
        }, {} as Record<string, Patient[]>);
    }, [patients]);

    const assignmentsByPatient = useMemo(() => {
        return assignments.reduce((acc, assignment) => {
            const key = assignment.patientId;
            if (!acc[key]) {
                acc[key] = [];
            }
            acc[key].push(assignment);
            return acc;
        }, {} as Record<string, Assignment[]>);
    }, [assignments]);
    
    const openAddPatientModal = () => {
        setIsAddPatientOpen(true);
    }
    
    return (
    <div className="flex flex-col h-full">
      <header className="p-4 sm:p-6 border-b flex justify-between items-center gap-4">
        <div className='flex items-center gap-4'>
            <SidebarTriggerButton />
            <div>
                <h1 className="font-headline text-2xl sm:text-3xl font-bold tracking-tight">
                Gestión de Pacientes por Grupos
                </h1>
                <p className="text-muted-foreground mt-1">
                Crea grupos y añade estudiantes en bloque para generar sus expedientes.
                </p>
            </div>
        </div>
        <Button onClick={openAddPatientModal}>
            <UserPlus className="mr-2 h-4 w-4" />
            Añadir Estudiante
        </Button>
      </header>
      <main className="flex-1 overflow-auto p-4 sm:p-6">
        <PatientList patientsByGroup={patientsByGroup} assignmentsByPatient={assignmentsByPatient} />
      </main>

       <Dialog open={isAddPatientOpen} onOpenChange={setIsAddPatientOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Añadir Nuevo Estudiante</DialogTitle>
                    <DialogDescription>
                        Define el semestre y grupo, luego ingresa el nombre del estudiante para crear su expediente.
                    </DialogDescription>
                </DialogHeader>
                <AddPatientForm onFinished={() => setIsAddPatientOpen(false)} />
            </DialogContent>
        </Dialog>
    </div>
  );
}
