'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Timer, CheckCircle, Plus, Minus } from 'lucide-react';

interface NeuroScreeningConsoleProps {
  studentId: string;
}

export const NeuroScreeningConsole: React.FC<NeuroScreeningConsoleProps> = ({ studentId }) => {
  const [timer, setTimer] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [hits, setHits] = useState(0);

  // Lógica de cronómetro para pruebas de atención sostenida
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isActive) {
      interval = setInterval(() => {
        setTimer((timer) => timer + 1);
      }, 1000);
    } else if (interval) {
      clearInterval(interval);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive]);
  
  const handleToggleTimer = () => {
      setIsActive(!isActive);
  }

  const handleFinish = () => {
      console.log(`Tamizaje finalizado para ${studentId}.`);
      console.log(`Tiempo total: ${timer}s, Aciertos: ${hits}.`);
      // Aquí iría la lógica para guardar los resultados y calcular percentiles
      alert("Simulación: Tamizaje finalizado. Revisa la consola para ver los datos capturados.");
      setIsActive(false);
      setTimer(0);
      setHits(0);
  }


  return (
    <Card>
        <CardHeader>
            <CardTitle>Consola de Aplicación: Tamizaje Neuropsicológico</CardTitle>
            <CardDescription>Herramienta para el registro en tiempo real de pruebas de atención y funciones ejecutivas.</CardDescription>
        </CardHeader>
        <CardContent>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {/* Sección de Cronometraje */}
                <div className="p-4 border rounded-lg bg-slate-50 flex flex-col items-center justify-center">
                    <p className="text-sm font-semibold text-gray-600">Cronómetro de Tarea</p>
                    <p className="text-5xl font-mono my-2 text-slate-800">{timer}s</p>
                    <Button 
                        onClick={handleToggleTimer}
                        variant={isActive ? 'destructive' : 'default'}
                        className="w-full"
                    >
                        <Timer className="mr-2 h-4 w-4" />
                        {isActive ? 'Detener' : 'Iniciar Tiempo'}
                    </Button>
                </div>

                {/* Registro de Aciertos/Errores */}
                <div className="p-4 border rounded-lg bg-slate-50 flex flex-col items-center justify-center">
                    <p className="text-sm font-semibold text-gray-600">Registro de Aciertos</p>
                    <p className="text-5xl font-mono my-2 text-slate-800">{hits}</p>
                    <div className="flex gap-2 w-full">
                        <Button onClick={() => setHits(hits + 1)} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white">
                            <Plus/>
                        </Button>
                        <Button onClick={() => setHits(Math.max(0, hits - 1))} variant="secondary" className="flex-1">
                            <Minus/>
                        </Button>
                    </div>
                </div>
            </div>

            {/* Botón de Finalización y Scoring Automático */}
            <Button onClick={handleFinish} className="w-full bg-indigo-700 text-white font-bold py-3 text-base">
                <CheckCircle className="mr-2"/>
                Finalizar y Calcular Percentiles
            </Button>
        </CardContent>
    </Card>
  );
};
