'use client';

import React from 'react';
import { PolarAngleAxis, PolarGrid, Radar, RadarChart, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChartHorizontal } from 'lucide-react';
import { ChteaScores } from '@/lib/store';

interface ChteaRadarChartProps {
    initialData?: ChteaScores;
}

const ChteaRadarChart: React.FC<ChteaRadarChartProps> = ({ initialData }) => {
    
    const data = initialData ? [
        { subject: 'Activo', score: initialData.activo, fullMark: 100 },
        { subject: 'Reflexivo', score: initialData.reflexivo, fullMark: 100 },
        { subject: 'Teórico', score: initialData.teorico, fullMark: 100 },
        { subject: 'Pragmático', score: initialData.pragmatico, fullMark: 100 },
    ] : [];

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
                {initialData ? (
                    <ResponsiveContainer width="100%" height={300}>
                        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
                            <PolarGrid />
                            <PolarAngleAxis dataKey="subject" />
                            <Tooltip contentStyle={{
                                backgroundColor: 'rgba(255, 255, 255, 0.8)',
                                border: '1px solid #ccc',
                                borderRadius: '5px'
                            }}/>
                            <Legend />
                            <Radar name="Puntaje" dataKey="score" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
                        </RadarChart>
                    </ResponsiveContainer>
                ) : (
                    <div className="h-60 flex items-center justify-center bg-gray-100 rounded-lg">
                        <p className="text-gray-500 text-sm">No hay datos de Evaluación Educativa para mostrar el gráfico.</p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

export default ChteaRadarChart;
