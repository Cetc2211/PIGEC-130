'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { UserPlus, RefreshCw, UserCog, Terminal, Settings, Database, Shield, Bug, Upload, CheckCircle, AlertCircle } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import Link from 'next/link';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { doc, setDoc, writeBatch } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { syncExampleStudentsToFirebase } from '@/lib/store';


// Función que guarda en Firestore
async function addNewStudent(data: { studentId: string; studentName: string; group: string; dualRelationship: string; }) {
    console.log("Iniciando guardado de nuevo estudiante en Firestore...");
    
    const batch = writeBatch(db);

    // 1. Referencia a la colección de estudiantes (datos generales)
    const studentRef = doc(db, 'students', data.studentId);
    batch.set(studentRef, {
        id: data.studentId,
        name: data.studentName,
        demographics: {
            group: data.group,
            age: 0, 
            semester: 0,
        },
        academicData: {
            gpa: 0,
            absences: 0,
        },
        suicideRiskLevel: 'Bajo', // Valor por defecto
        dualRelationshipNote: data.dualRelationship, 
    });

    // 2. Referencia a la subcolección clínica (datos sensibles)
    const clinicalRecordRef = doc(db, 'students', data.studentId, 'clinical_records', 'initial_assessment');
    batch.set(clinicalRecordRef, {
        studentId: data.studentId,
        createdAt: new Date().toISOString(),
        emergencyContact: {
            name: '',
            phone: '',
        },
        // Aquí se inicializan los campos clínicos que se llenarán después
        bdi_ii_score: null,
        bai_score: null,
        impresion_diagnostica: 'Expediente recién creado, pendiente de evaluación inicial.',
    });
    
    await batch.commit();
    
    console.log("Datos guardados en Firestore para el estudiante:", data.studentId);
    return { success: true, studentId: data.studentId };
}


function AddNewStudentForm() {
    const [studentId, setStudentId] = useState('');
    const [studentName, setStudentName] = useState('');
    const [group, setGroup] = useState('');
    const [dualRelationship, setDualRelationship] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [feedback, setFeedback] = useState<{ type: 'success' | 'error', message: string } | null>(null);

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        setIsLoading(true);
        setFeedback(null);

        if (!studentId || !studentName || !group) {
            setFeedback({ type: 'error', message: 'Los campos de ID, Nombre y Grupo son obligatorios.' });
            setIsLoading(false);
            return;
        }

        try {
            const result = await addNewStudent({ studentId, studentName, group, dualRelationship });
            if (result.success) {
                setFeedback({ type: 'success', message: `Estudiante "${studentName}" ingresado con éxito. ID: ${result.studentId}` });
                setStudentId('');
                setStudentName('');
                setGroup('');
                setDualRelationship('');
            } else {
                 setFeedback({ type: 'error', message: 'Ocurrió un error al guardar el estudiante.' });
            }
        } catch (error) {
             setFeedback({ type: 'error', message: 'Ocurrió un error inesperado al conectar con la base de datos.' });
             console.error("Error al guardar en Firestore:", error);
        } finally {
            setIsLoading(false);
        }
    };
    
    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <UserPlus className="h-6 w-6" />
                    Ingresar Nuevo Estudiante
                </CardTitle>
                <CardDescription>
                    Crea un nuevo expediente digital en la base de datos (Firestore).
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
                    <div className="space-y-2">
                        <Label htmlFor="dual-relationship">Trazabilidad de Relación Dual (Cap. 4.3)</Label>
                        <Textarea id="dual-relationship" value={dualRelationship} onChange={(e) => setDualRelationship(e.target.value)} placeholder="¿Existe relación académica o familiar directa con el tutor/clínico asignado? Documentar aquí." />
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

function RoleManagementCard() {
    const [users, setUsers] = useState([
        { uid: 'user001', email: 'psic.martinez@example.com', role: 'Clinico' },
        { uid: 'user002', email: 'orientador.gomez@example.com', role: 'Orientador' },
        { uid: 'user003', email: 'nuevo.docente@example.com', role: 'none' },
    ]);

    const handleRoleChange = (uid: string, newRole: string) => {
        setUsers(users.map(user => user.uid === uid ? { ...user, role: newRole } : user));
    };
    
    const handleSaveChanges = () => {
        console.log("--- SIMULACIÓN: Guardando Cambios de Roles ---");
        console.log("Estos datos serían enviados a una Cloud Function para establecer Custom Claims en Firebase Auth.");
        console.log(users);
        alert("Simulación de guardado de roles completada. Revisa la consola para más detalles.");
    };

    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <UserCog className="h-6 w-6" />
                    Gestión de Roles de Usuario
                </CardTitle>
                <CardDescription>
                    Asigne los roles de 'Clinico' u 'Orientador' a los usuarios del sistema.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {users.map(user => (
                        <div key={user.uid} className="flex items-center justify-between p-2 border rounded-md">
                            <span className="text-sm font-medium">{user.email}</span>
                            <Select value={user.role} onValueChange={(newRole) => handleRoleChange(user.uid, newRole)}>
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue placeholder="Seleccionar rol" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Clinico">Clínico</SelectItem>
                                    <SelectItem value="Orientador">Orientador</SelectItem>
                                    <SelectItem value="none">Sin Rol</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    ))}
                </div>
                 <div className="flex justify-end mt-6">
                    <Button onClick={handleSaveChanges}>Guardar Cambios de Roles</Button>
                </div>
            </CardContent>
        </Card>
    );
}

// Componente para sincronizar datos de ejemplo
function SyncExampleDataCard() {
    const [isSyncing, setIsSyncing] = useState(false);
    const [syncResult, setSyncResult] = useState<{ success: boolean; message: string; count: number } | null>(null);

    const handleSync = async () => {
        setIsSyncing(true);
        setSyncResult(null);
        
        try {
            const result = await syncExampleStudentsToFirebase();
            setSyncResult(result);
        } catch (error) {
            setSyncResult({
                success: false,
                message: `Error: ${error instanceof Error ? error.message : 'Error desconocido'}`,
                count: 0
            });
        } finally {
            setIsSyncing(false);
        }
    };

    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Upload className="h-6 w-6" />
                    Sincronizar Datos de Ejemplo
                </CardTitle>
                <CardDescription>
                    Migra los estudiantes de demostración (S001-S004) a Firebase para que aparezcan en Expedientes.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <p className="text-sm text-blue-800">
                            <strong>Esta acción creará 4 expedientes de ejemplo en Firebase:</strong>
                        </p>
                        <ul className="text-sm text-blue-700 mt-2 list-disc list-inside">
                            <li>S001 - Ana M. Pérez (Riesgo Crítico)</li>
                            <li>S002 - Carlos V. Ruiz (Riesgo Medio)</li>
                            <li>S003 - Laura J. García (Riesgo Bajo)</li>
                            <li>S004 - Esteban Hernandarias (Riesgo Medio)</li>
                        </ul>
                    </div>
                    
                    <Button 
                        onClick={handleSync} 
                        disabled={isSyncing}
                        className="w-full bg-purple-600 hover:bg-purple-700"
                    >
                        {isSyncing ? (
                            <>
                                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                Sincronizando...
                            </>
                        ) : (
                            <>
                                <Upload className="h-4 w-4 mr-2" />
                                Sincronizar Datos de Ejemplo
                            </>
                        )}
                    </Button>
                    
                    {syncResult && (
                        <div className={`p-4 rounded-lg flex items-start gap-3 ${
                            syncResult.success 
                                ? 'bg-green-50 border border-green-200' 
                                : 'bg-red-50 border border-red-200'
                        }`}>
                            {syncResult.success ? (
                                <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                            ) : (
                                <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                            )}
                            <div>
                                <p className={`font-medium ${syncResult.success ? 'text-green-800' : 'text-red-800'}`}>
                                    {syncResult.message}
                                </p>
                                {syncResult.success && syncResult.count > 0 && (
                                    <p className="text-sm text-green-700 mt-1">
                                        Los expedientes ahora están disponibles en la sección de Expedientes.
                                    </p>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}

// Componente de acceso rápido a herramientas de admin
function AdminToolsCard() {
    const tools = [
        {
            title: 'Consola de Errores',
            description: 'Monitorea y diagnostica errores del sistema',
            icon: Terminal,
            href: '/admin/consola',
            color: 'text-red-600',
            bgColor: 'bg-red-50',
            borderColor: 'border-red-200'
        },
        {
            title: 'Gestionar Matriculas',
            description: 'Administración de matriculas y estudiantes',
            icon: Database,
            href: '/admin/matriculas',
            color: 'text-blue-600',
            bgColor: 'bg-blue-50',
            borderColor: 'border-blue-200'
        },
        {
            title: 'Expedientes',
            description: 'Ver y gestionar expedientes clínicos',
            icon: Shield,
            href: '/admin/expedientes',
            color: 'text-purple-600',
            bgColor: 'bg-purple-50',
            borderColor: 'border-purple-200'
        },
        {
            title: 'Configuración',
            description: 'Configuración del sistema',
            icon: Settings,
            href: '/admin/configuracion',
            color: 'text-gray-600',
            bgColor: 'bg-gray-50',
            borderColor: 'border-gray-200'
        }
    ];

    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Settings className="h-6 w-6" />
                    Herramientas de Administración
                </CardTitle>
                <CardDescription>
                    Acceso rápido a las funciones administrativas del sistema.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {tools.map((tool) => (
                        <Link key={tool.href} href={tool.href}>
                            <Card className={`cursor-pointer transition-all hover:shadow-md ${tool.borderColor} ${tool.bgColor} hover:scale-[1.02]`}>
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2 rounded-lg ${tool.bgColor}`}>
                                            <tool.icon className={`h-5 w-5 ${tool.color}`} />
                                        </div>
                                        <div>
                                            <p className="font-medium">{tool.title}</p>
                                            <p className="text-xs text-gray-500">{tool.description}</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}

export default function AdminPage() {
    return (
        <div className="p-8">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
                        <Shield className="h-8 w-8 text-blue-600" />
                        Módulo de Administración
                    </h1>
                    <p className="text-gray-500 mt-1">
                        Gestión de expedientes, usuarios, errores y configuración del sistema.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Link href="/admin/consola">
                        <Button variant="outline" className="gap-2 border-red-200 hover:bg-red-50">
                            <Bug className="h-4 w-4 text-red-500" />
                            Consola de Errores
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Herramientas de administración */}
            <div className="mb-8">
                <AdminToolsCard />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                <AddNewStudentForm />
                <SyncExampleDataCard />
                <RoleManagementCard />
            </div>
        </div>
    );
}
