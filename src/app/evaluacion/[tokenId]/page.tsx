
'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowRight, FileText, User, Shield, Check } from 'lucide-react';
import FichaIdentificacionForm from '@/components/FichaIdentificacionForm';

// Simulación de tipo de sesión basada en Token
type TokenType = 'STUDENT' | 'COMMUNITY';

export default function UniversalScreeningPage() {
    const params = useParams();
    const tokenId = params.tokenId as string;

    // Simulación: en una app real, esto se obtendría de Firestore usando el tokenId
    const sessionType: TokenType = tokenId.startsWith('school') ? 'STUDENT' : 'COMMUNITY';
    const studentName = "Ana María Pérez López"; // Nombre de estudiante para simulación

    const [step, setStep] = useState(1);
    const [isConsented, setIsConsented] = useState(false);
    const [communityUser, setCommunityUser] = useState({ name: '', age: '', reason: ''});

    const handleNextStep = () => {
        setStep(prev => prev + 1);
    };
    
    const handleCommunityUserChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setCommunityUser(prev => ({...prev, [name]: value}));
    };

    const isCommunityFormComplete = communityUser.name && communityUser.age && communityUser.reason;

    const renderStep = () => {
        switch (step) {
            // --- PASO 1: BIENVENIDA E IDENTIFICACIÓN ---
            case 1:
                return (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-blue-700">
                                <User /> Sistema de Valoración PIGEC-130
                            </CardTitle>
                            <CardDescription>
                                {sessionType === 'STUDENT'
                                    ? 'Bienvenido/a al portal de evaluación del CBTA 130. Por favor, confirma tu identidad para continuar.'
                                    : 'Bienvenido/a al Centro de Servicios Comunitarios Digital del CBTA 130. Por favor, ingrese sus datos para iniciar.'
                                }
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                             {sessionType === 'STUDENT' ? (
                                <div className="p-4 bg-blue-50 rounded-md border border-blue-200">
                                    <p className="font-semibold text-lg text-blue-900">{studentName}</p>
                                    <p className="text-sm text-blue-700">Matrícula: ******001</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                     <div className="space-y-2">
                                        <Label htmlFor="name">Nombre Completo</Label>
                                        <Input id="name" name="name" value={communityUser.name} onChange={handleCommunityUserChange} placeholder="Ej. Juan Carlos Rodríguez" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="age">Edad</Label>
                                        <Input id="age" name="age" type="number" value={communityUser.age} onChange={handleCommunityUserChange} placeholder="Ej. 34" />
                                    </div>
                                     <div className="space-y-2">
                                        <Label htmlFor="reason">Motivo de Consulta (Breve)</Label>
                                        <Input id="reason" name="reason" value={communityUser.reason} onChange={handleCommunityUserChange} placeholder="Ej. Evaluación vocacional, Ansiedad" />
                                    </div>
                                </div>
                            )}
                        </CardContent>
                        <CardFooter className="justify-end">
                            <Button onClick={handleNextStep} disabled={sessionType === 'COMMUNITY' && !isCommunityFormComplete}>
                                Siguiente <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                        </CardFooter>
                    </Card>
                );

            // --- PASO 2: CONSENTIMIENTO INFORMADO ---
            case 2:
                return (
                    <Card>
                         <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-yellow-700">
                                <Shield /> Consentimiento Informado Digital
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4 text-sm text-gray-700">
                           <p>Usted está a punto de realizar una evaluación psicométrica o de orientación. Los datos recopilados serán tratados con estricta confidencialidad por el personal autorizado del CBTA 130.</p>
                           <p>El propósito de esta evaluación es únicamente diagnóstico y de orientación. Los resultados se utilizarán para generar un reporte provisional que le servirá de guía. Esta evaluación no constituye un tratamiento psicológico.</p>
                           <p>Al continuar, usted afirma ser mayor de edad o contar con el consentimiento de sus padres o tutores para realizar esta prueba.</p>
                            <div className="flex items-center space-x-2 pt-4">
                                <Checkbox id="terms" checked={isConsented} onCheckedChange={(checked) => setIsConsented(!!checked)} />
                                <Label htmlFor="terms" className="font-semibold">
                                    He leído y acepto los términos del consentimiento informado.
                                </Label>
                            </div>
                        </CardContent>
                        <CardFooter className="justify-end">
                             <Button onClick={handleNextStep} disabled={!isConsented}>
                                Iniciar Evaluación <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                        </CardFooter>
                    </Card>
                );
            
            // --- PASO 3: APLICACIÓN DE LA PRUEBA ---
            case 3:
                 return (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                               <FileText /> Ficha de Identificación
                            </CardTitle>
                            <CardDescription>
                                Por favor, complete todos los campos solicitados a continuación.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {/* Aquí se renderizará el instrumento dinámicamente en el futuro */}
                            <FichaIdentificacionForm />
                        </CardContent>
                        <CardFooter className="justify-end">
                             <Button onClick={handleNextStep}>
                                Enviar Evaluación <Check className="ml-2 h-4 w-4" />
                            </Button>
                        </CardFooter>
                    </Card>
                );
            
            // --- PASO 4: FINALIZACIÓN ---
            case 4:
                return (
                     <Card className="text-center">
                        <CardHeader>
                             <CardTitle className="text-green-700">Evaluación Enviada con Éxito</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p>¡Gracias por completar la evaluación!</p>
                            <p className="mt-2 text-gray-600">Sus respuestas han sido enviadas de forma segura. El equipo del CBTA 130 se pondrá en contacto con usted para dar seguimiento a sus resultados.</p>
                             <p className="mt-4 text-xs text-gray-500">Ya puede cerrar esta ventana.</p>
                        </CardContent>
                    </Card>
                );

            default:
                return <p>Paso no válido.</p>;
        }
    };

    return (
        <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4 sm:p-8">
            <div className="w-full max-w-2xl">
                 <header className="text-center mb-8">
                    <h1 className="text-3xl font-extrabold text-gray-800 tracking-tight">PIGEC-130</h1>
                    <p className="mt-1 text-lg text-gray-500">Portal de Evaluación Universal</p>
                </header>
                <main>
                    {renderStep()}
                </main>
            </div>
        </div>
    );
}

