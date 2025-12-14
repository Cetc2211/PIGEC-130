'use client';

import ScreeningManagement from '@/components/screening-management';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function ScreeningPage() {
    return (
        <div className="p-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-800">Módulo de Tamizaje Universal (Nivel 1)</h1>
                <p className="mt-2 text-sm text-gray-600">
                    Gestión y aplicación de encuestas de screening para la detección temprana de riesgo en toda la población estudiantil (SDTBE).
                </p>
            </div>
            
            <ScreeningManagement />
        </div>
    );
}
