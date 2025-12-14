'use client';

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ShieldAlert } from "lucide-react";
import SafetyPlan from "./safety-plan";
import ReferralFlow from "./referral-flow";

export default function CrisisManagementActions({ studentName, riskLevel }: { studentName: string, riskLevel: 'Bajo' | 'Medio' | 'Alto' | 'Crítico' }) {
    const isHighRisk = riskLevel === 'Alto' || riskLevel === 'Crítico';

    return (
        <Card className="shadow-lg border-amber-500">
            <CardHeader>
                <CardTitle>Módulo 5: Acciones de Crisis y Documentación</CardTitle>
                <CardDescription>Protocolos para manejo de riesgo, derivación y exportación de informes.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col md:flex-row gap-4 justify-around items-center">
                 <Dialog>
                    <DialogTrigger asChild>
                         <Button variant={isHighRisk ? "destructive" : "secondary"} className="font-bold w-full md:w-auto">
                            <ShieldAlert className="mr-2 h-4 w-4" />
                            Activar Plan de Seguridad
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
                        <DialogHeader>
                          <DialogTitle>Módulo de Plan de Seguridad y Crisis</DialogTitle>
                          <DialogDescription>
                            Herramienta para el manejo activo del riesgo suicida y de autolesiones (Cap. 11.2).
                          </DialogDescription>
                        </DialogHeader>
                        <div className="flex-grow overflow-y-auto">
                           <SafetyPlan studentName={studentName} />
                        </div>
                    </DialogContent>
                </Dialog>

                <ReferralFlow studentName={studentName} />
            </CardContent>
        </Card>
    )
}
