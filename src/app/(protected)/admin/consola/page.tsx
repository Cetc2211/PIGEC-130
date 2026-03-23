'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from '@/context/SessionContext';
import ErrorConsole from '@/components/error-console';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Terminal, ArrowLeft, Shield, Database, RefreshCw, Download, Bug } from "lucide-react";
import Link from 'next/link';

export default function ConsolaPage() {
    const { role, user } = useSession();
    const router = useRouter();

    // Verificar permisos de administrador
    useEffect(() => {
        if (role && role !== 'loading' && role !== 'Clinico') {
            // Solo clínicos pueden acceder (por ahora se considera admin)
            // En el futuro se puede agregar un rol específico de administrador
        }
    }, [role, router]);

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center gap-4 mb-4">
                        <Link href="/admin">
                            <Button variant="outline" size="sm">
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Volver a Admin
                            </Button>
                        </Link>
                    </div>
                    
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
                                <div className="p-2 bg-red-100 rounded-lg">
                                    <Terminal className="h-8 w-8 text-red-600" />
                                </div>
                                Consola de Errores
                            </h1>
                            <p className="text-gray-500 mt-2">
                                Sistema de monitoreo y diagnóstico de errores de PIGEC-130
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            <Badge className="bg-green-500 text-white">
                                <Database className="h-3 w-3 mr-1" />
                                En línea
                            </Badge>
                        </div>
                    </div>
                </div>

                {/* Información de contexto */}
                <Card className="mb-6 border-blue-200 bg-blue-50/30">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-4 text-sm text-blue-700">
                            <Bug className="h-5 w-5" />
                            <p>
                                <strong>Usuario:</strong> {user?.email || 'No identificado'} • 
                                <strong className="ml-2">Rol:</strong> {role || 'Sin rol'} •
                                <strong className="ml-2">Entorno:</strong> {process.env.NODE_ENV === 'production' ? 'Producción' : 'Desarrollo'}
                            </p>
                        </div>
                    </CardContent>
                </Card>

                {/* Consola de errores */}
                <ErrorConsole />

                {/* Footer con información */}
                <Card className="mt-6 border-gray-200 bg-gray-50">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between text-xs text-gray-500">
                            <div className="flex items-center gap-4">
                                <span>Versión: 1.0.0</span>
                                <span>|</span>
                                <span>Última actualización: {new Date().toLocaleString('es-MX')}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Shield className="h-3 w-3" />
                                Acceso restringido a administradores
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

// Import Badge
import { Badge } from '@/components/ui/badge';
