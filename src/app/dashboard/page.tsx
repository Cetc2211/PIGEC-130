'use client';

import React from 'react';
import Link from 'next/link';
import { useSession } from '@/context/SessionContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  ArrowRight, 
  AlertTriangle, 
  FolderOpen, 
  ClipboardList, 
  BookText, 
  FolderKanban,
  Shield,
  Activity,
  TrendingDown,
  Users
} from 'lucide-react';
import { calculateRisk } from '@/lib/risk-analysis';
import { getStudents } from '@/lib/store';

const quickLinks = [
  { 
    href: '/expedientes', 
    label: 'Expedientes', 
    description: 'Consulta y gestiona los expedientes clínicos y educativos de los estudiantes.',
    icon: FolderOpen,
    roles: ['Clinico', 'Orientador'],
    color: 'bg-blue-100 text-blue-600'
  },
  { 
    href: '/screening', 
    label: 'Gestión de Pruebas', 
    description: 'Aplica instrumentos de tamizaje y evaluación psicométrica.',
    icon: ClipboardList,
    roles: ['Clinico'],
    color: 'bg-purple-100 text-purple-600'
  },
  { 
    href: '/educativa/evaluacion', 
    label: 'Evaluación Educativa', 
    description: 'Revisa evaluaciones educativas y datos académicos de los estudiantes.',
    icon: BookText,
    roles: ['Orientador', 'Clinico'],
    color: 'bg-green-100 text-green-600'
  },
  { 
    href: '/tools', 
    label: 'Repositorio de Recursos', 
    description: 'Accede a evidencias, guías clínicas y materiales de intervención.',
    icon: FolderKanban,
    roles: ['Clinico', 'Orientador'],
    color: 'bg-amber-100 text-amber-600'
  },
];

export default function DashboardPage() {
    const { role } = useSession();
    const students = getStudents();

    const studentsWithRisk = students.map(student => {
        const ausentismo_norm = student.academicData.absences / 100;
        const bajo_rendimiento_bin = student.academicData.gpa < 7.0 ? 1 : 0;
        const ansiedad_norm = (student.ansiedadScore || 0) / 21;
        const riskResult = calculateRisk({ ausentismo_norm, bajo_rendimiento_bin, ansiedad_norm });
        return { ...student, ...riskResult };
    });

    const highRiskCount = studentsWithRisk.filter(s => s.color === 'red').length;
    const mediumRiskCount = studentsWithRisk.filter(s => s.color === 'yellow').length;
    const lowRiskCount = studentsWithRisk.filter(s => s.color === 'green').length;

    const filteredLinks = quickLinks.filter(link => link.roles.includes(role as string));

    return (
        <div className="p-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-800">
                    Dashboard de Riesgo
                </h1>
                <p className="mt-1 text-sm text-gray-500">
                    Vista general del sistema de detección temprana y seguimiento — CBTA 130
                </p>
            </div>

            {/* Tarjetas de resumen de riesgo */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <Card className="border-red-200 bg-red-50">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-red-800 flex items-center gap-2">
                            <AlertTriangle className="h-4 w-4" />
                            Riesgo Alto (Rojo)
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-3xl font-bold text-red-700">{highRiskCount}</p>
                        <p className="text-xs text-red-600 mt-1">Casos que requieren atención inmediata</p>
                    </CardContent>
                </Card>

                <Card className="border-yellow-200 bg-yellow-50">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-yellow-800 flex items-center gap-2">
                            <TrendingDown className="h-4 w-4" />
                            Riesgo Medio (Amarillo)
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-3xl font-bold text-yellow-700">{mediumRiskCount}</p>
                        <p className="text-xs text-yellow-600 mt-1">Casos con seguimiento preventivo</p>
                    </CardContent>
                </Card>

                <Card className="border-green-200 bg-green-50">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-green-800 flex items-center gap-2">
                            <Shield className="h-4 w-4" />
                            Riesgo Bajo (Verde)
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-3xl font-bold text-green-700">{lowRiskCount}</p>
                        <p className="text-xs text-green-600 mt-1">Casos estables sin intervención activa</p>
                    </CardContent>
                </Card>
            </div>

            {/* Resumen rápido de estudiantes */}
            <Card className="mb-8">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="flex items-center gap-2">
                                <Activity className="h-5 w-5" />
                                Resumen de Detección Universal (SDTBE)
                            </CardTitle>
                            <CardDescription className="mt-1">
                                Índice de Riesgo Compuesto (IRC) basado en factores académicos y clínicos
                            </CardDescription>
                        </div>
                        <Button asChild variant="outline">
                            <Link href="/expedientes">
                                Ver todos los expedientes
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </Link>
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {studentsWithRisk.map((student) => (
                            <div key={student.id} className="flex items-center justify-between p-3 rounded-lg border bg-white">
                                <div className="flex items-center gap-3">
                                    <div className={`h-3 w-3 rounded-full ${
                                        student.color === 'red' ? 'bg-red-500' : 
                                        student.color === 'yellow' ? 'bg-yellow-500' : 'bg-green-500'
                                    }`} />
                                    <div>
                                        <p className="font-medium text-sm text-gray-900">{student.name}</p>
                                        <p className="text-xs text-gray-500">
                                            {role === 'Clinico' && <>GPA: {student.academicData.gpa.toFixed(1)} · Faltas: {student.academicData.absences.toFixed(0)}% · </>}
                                            IRC: {student.IRC} — {student.nivelRiesgo}
                                        </p>
                                    </div>
                                </div>
                                <Button asChild variant="ghost" size="sm">
                                    <Link href={
                                        role === 'Clinico' 
                                            ? `/clinica/expediente/${student.id}` 
                                            : `/educativa/estudiante/${student.id}`
                                    }>
                                        <ArrowRight className="h-4 w-4" />
                                    </Link>
                                </Button>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Accesos rápidos */}
            <div>
                <h2 className="text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Acceso Rápido
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {filteredLinks.map((link) => (
                        <Card key={link.href} className="hover:shadow-md transition-shadow cursor-pointer">
                            <Link href={link.href}>
                                <CardHeader>
                                    <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${link.color}`}>
                                        <link.icon className="h-5 w-5" />
                                    </div>
                                    <CardTitle className="text-sm mt-2">{link.label}</CardTitle>
                                    <CardDescription className="text-xs">{link.description}</CardDescription>
                                </CardHeader>
                            </Link>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    );
}
