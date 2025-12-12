'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { UserPlus } from 'lucide-react';

// Simulación de la función que guardaría en Firestore
async function addNewStudent(data: { studentId: string; studentName: string; group: string; }) {
    console.log("Iniciando guardado de nuevo estudiante...");
    
    // Aquí iría la lógica para guardar en Firestore:
    // const db = getFirestore();
    // await setDoc(doc(db, "students", data.studentId), { ... });
    
    // Simulación de una llamada a API
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    console.log("Datos que se guardarían en Firestore (colección 'students'):", {
        id: data.studentId,
        name: data.studentName,
        demographics: {
            group: data.group,
            age: 0, // Se podría solicitar o dejar en 0
        },
        academicData: {
            gpa: 0,
            absences: 0,
        },
        suicideRiskLevel: 'Bajo', // Valor por defecto
        emergencyContact: {
            name: '',
            phone: '',
        }
    });

    return { success: true, studentId: data.studentId };
}


function AddNewStudentForm() {
    const [studentId, setStudentId] = useState('');
    const [studentName, setStudentName] = useState('');
    const [group, setGroup] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [feedback, setFeedback] = useState<{ type: 'success' | 'error', message: string } | null>(null);

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        setIsLoading(true);
        setFeedback(null);

        if (!studentId || !studentName || !group) {
            setFeedback({ type: 'error', message: 'Todos los campos son obligatorios.' });
            setIsLoading(false);
            return;
        }

        try {
            const result = await addNewStudent({ studentId, studentName, group });
            if (result.success) {
                setFeedback({ type: 'success', message: `Estudiante "${studentName}" ingresado con éxito. ID: ${result.studentId}` });
                // Limpiar formulario
                setStudentId('');
                setStudentName('');
                setGroup('');
            } else {
                 setFeedback({ type: 'error', message: 'Ocurrió un error al guardar el estudiante.' });
            }
        } catch (error) {
             setFeedback({ type: 'error', message: 'Ocurrió un error inesperado.' });
        } finally {
            setIsLoading(false);
        }
    };
    
    return (
        <Card className="max-w-lg mx-auto">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <UserPlus className="h-6 w-6" />
                    Ingresar Nuevo Estudiante al Sistema
                </CardTitle>
                <CardDescription>
                    Este formulario crea un nuevo expediente digital en la base de datos (Firestore).
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="student-id">ID del Estudiante (Matrícula)</Label>
                        <Input id="student-id" value={studentId} onChange={(e) => setStudentId(e.target.value)} placeholder="Ej. 2024001" required />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="student-name">Nombre Completo del Estudiante</Label>
                        <Input id="student-name" value={studentName} onChange={(e) => setStudentName(e.target.value)} placeholder="Ej. Juan Pérez López" required />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="group">Grupo</Label>
                        <Input id="group" value={group} onChange={(e) => setGroup(e.target.value)} placeholder="Ej. 5B" required />
                    </div>
                    <div className="flex justify-end">
                        <Button type="submit" disabled={isLoading} className="bg-blue-600 hover:bg-blue-700 text-white font-bold">
                            {isLoading ? 'Guardando...' : 'Crear Expediente'}
                        </Button>
                    </div>
                </form>

                {feedback && (
                    <div className={`mt-4 p-3 rounded-md text-sm ${feedback.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {feedback.message}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}


export default function AdminPage() {
    return (
        <div className="p-8">
            <h1 className="text-3xl font-bold mb-6 text-gray-800">
                Módulo de Administración
            </h1>
            <p className="mb-8 text-sm text-gray-600">
                Gestión de expedientes y cuentas de usuario del sistema MTSS.
            </p>

            <AddNewStudentForm />
        </div>
    );
}
