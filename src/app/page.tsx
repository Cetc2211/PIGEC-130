'use client';

import { useRouter } from 'next/navigation';
import { useSession } from '@/context/SessionContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, User, Shield } from 'lucide-react';

function RoleSelectionCard({ title, description, role, onSelectRole }: { title: string, description: string, role: 'Orientador' | 'Clinico', onSelectRole: (role: 'Orientador' | 'Clinico') => void }) {
    const Icon = role === 'Orientador' ? User : Shield;
    return (
        <Card className="flex flex-col">
            <CardHeader>
                <CardTitle className="flex items-center gap-3">
                    <Icon className="h-6 w-6" />
                    {title}
                </CardTitle>
                <CardDescription>{description}</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow flex items-end">
                <Button onClick={() => onSelectRole(role)} className="w-full">
                    Acceder a Módulo <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
            </CardContent>
        </Card>
    );
}


export default function InstitutionalLandingPage() {
    const router = useRouter();
    const { setRole } = useSession();

    const handleRoleSelection = (role: 'Orientador' | 'Clinico') => {
        setRole(role);
        // La lógica de redirección se manejará en el contexto o en un paso posterior de autenticación.
        // Por ahora, solo se establece el rol.
        if (role === 'Orientador') {
            router.push('/orientacion');
        } else {
            router.push('/dashboard');
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-8">
            <header className="text-center mb-12">
                <h1 className="text-4xl font-extrabold text-gray-800 tracking-tight">PIGEC-130</h1>
                <p className="mt-2 text-xl text-gray-600">Centro de Bachillerato Tecnológico Agropecuario No. 130</p>
                <p className='text-lg text-gray-500'>"Eutimio Plantillas Avelar"</p>
            </header>

            <main className="w-full max-w-4xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <RoleSelectionCard
                        title="Acceso Orientación Educativa"
                        description="Gestión de Nivel 1 y 2. Detección temprana, aplicación de tamizajes grupales, seguimiento psicopedagógico y gestión de derivaciones."
                        role="Orientador"
                        onSelectRole={handleRoleSelection}
                    />
                    <RoleSelectionCard
                        title="Acceso Psicología Clínica"
                        description="Intervención de Nivel 3. Evaluación diagnóstica profunda (WISC/WAIS), formulación clínica, gestión de crisis y tratamiento especializado."
                        role="Clinico"
                        onSelectRole={handleRoleSelection}
                    />
                </div>
            </main>

            <footer className="mt-12 text-center text-xs text-gray-400">
                <p>Una iniciativa de la Secretaría de Educación Pública y la Dirección General de Educación Tecnológica Agropecuaria y Ciencias del Mar (DGETAyCM).</p>
                 <p>Sistema de Soporte a la Decisión para el protocolo MTSS del CBTA 130.</p>
            </footer>
        </div>
    );
}
