'use client';

import { useParams, redirect } from 'next/navigation';
import { useSession } from '@/context/SessionContext';
import React from 'react';
import { getStudentById } from '@/lib/store';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Lock, BarChartHorizontal } from 'lucide-react';
import PIEIFeedback from '@/components/piei-feedback';

function ChteaRadarChartPlaceholder() {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <BarChartHorizontal />
                    Gráfico de Radar (CHAEA)
                </CardTitle>
                <CardDescription>
                    Visualización de los Estilos de Aprendizaje dominantes del estudiante.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="h-60 flex items-center justify-center bg-gray-100 rounded-lg">
                    <p className="text-gray-500 text-sm">(Placeholder para el Gráfico de Radar de Estilos de Aprendizaje)</p>
                </div>
            </CardContent>
        </Card>
    );
}


export default function EducationalFilePage() {
    const params = useParams();
    const studentId = params.id as string;
    const { role } = useSession();

    // GUARDIA DE RUTA
    if (role === 'loading') {
        return <div className="p-8 text-center text-xl">Verificando Permisos Educativos...</div>;
    }

    if (role === 'Clinico') {
        redirect(`/clinica/expediente/${studentId}`);
        return null;
    }
    
    const student = getStudentById(studentId);

    if (!student) {
        // En una app real, esto sería una página 404
        return <div className="p-8">Estudiante no encontrado.</div>;
    }

    return (
        <div className="p-8">
            <div className="max-w-4xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-extrabold text-blue-700">PERFIL ESTUDIANTIL Y PIEI (NIVEL 1/2)</h1>
                    <p className="text-md text-gray-500">{student.name}</p>
                </div>

                <Card className="mb-8 bg-purple-50 border-purple-500">
                    <CardHeader className="flex-row items-center gap-4">
                        <Lock className="h-8 w-8 text-purple-700" />
                        <div>
                            <CardTitle className="text-purple-800">Ambiente Educativo (Rol: {role})</CardTitle>
                            <CardDescription className="text-purple-700">
                               Esta vista muestra únicamente los componentes pedagógicos y de seguimiento académico, protegiendo la información clínica sensible de acuerdo al Capítulo 7 (Cortafuegos Ético Digital).
                            </CardDescription>
                        </div>
                    </CardHeader>
                </Card>

                <div className="space-y-12">
                   <PIEIFeedback />
                   <ChteaRadarChartPlaceholder />
                </div>
            </div>
        </div>
    )
}
