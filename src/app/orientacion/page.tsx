
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, ClipboardList, FolderKanban, PlusCircle } from "lucide-react";
import Link from "next/link";

export default function OrientadorDashboard() {
    return (
        <div className="p-8">
            <header className="mb-8">
                <h1 className="text-3xl font-bold text-gray-800">Panel de Orientación Educativa</h1>
                <p className="text-md text-gray-600">Gestión de Nivel 1 (Detección Universal) y Nivel 2 (Intervención Focalizada).</p>
            </header>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                
                {/* Tarjeta 1: Gestión de Estudiantes */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Users />
                            Gestión de Estudiantes
                        </CardTitle>
                        <CardDescription>
                            Administre listas de grupos, y dé de alta nuevos estudiantes en el sistema.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-2">
                        <Link href="/admin" passHref>
                           <Button variant="outline" className="w-full">Ver/Editar Grupos</Button>
                        </Link>
                         <Link href="/admin" passHref>
                            <Button>
                                <PlusCircle className="mr-2" />
                                Registrar Nuevo Estudiante
                            </Button>
                        </Link>
                    </CardContent>
                </Card>

                {/* Tarjeta 2: Aplicación de Tamizaje */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <ClipboardList />
                            Aplicación de Tamizaje Nivel 1
                        </CardTitle>
                        <CardDescription>
                            Genere enlaces para la aplicación masiva (grupal) o individual de los instrumentos educativos.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-2">
                        <Link href="/educativa/evaluacion" passHref>
                            <Button variant="default" className="w-full bg-blue-600 hover:bg-blue-700">
                               Generar Sesión Grupal
                            </Button>
                        </Link>
                         <Link href="/educativa/evaluacion" passHref>
                            <Button variant="secondary" className="w-full">
                               Aplicar a Estudiante Específico
                            </Button>
                        </Link>
                    </CardContent>
                </Card>
                
                {/* Tarjeta 3: Expedientes y PIEI */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <FolderKanban />
                            Expedientes y PIEI
                        </CardTitle>
                        <CardDescription>
                           Consulte los expedientes educativos, de seguimiento y los Planes de Intervención.
                        </CardDescription>
                    </CardHeader>
                     <CardContent>
                        <Link href="/dashboard" passHref>
                            <Button variant="outline" className="w-full">
                               Ver Todos los Expedientes
                            </Button>
                        </Link>
                    </CardContent>
                </Card>

            </div>
        </div>
    );
}
