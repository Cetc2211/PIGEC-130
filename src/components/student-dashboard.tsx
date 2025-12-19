'use client';
import React from 'react';
import Link from 'next/link';
import { calculateRisk } from '../lib/risk-analysis';
import RiskIndicator from './RiskIndicator';
import { getStudents } from '@/lib/store';
import { useSession } from '@/context/SessionContext';
import { AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from './ui/button';

const StudentDashboard: React.FC = () => {
    const { role } = useSession();
    const students = getStudents();

    const studentsWithRisk = students.map(student => {
        const ausentismo_norm = student.academicData.absences / 100;
        const bajo_rendimiento_bin = student.academicData.gpa < 7.0 ? 1 : 0;
        const ansiedad_norm = (student.ansiedadScore || 0) / 21; // Normaliza score de ansiedad (0-21)

        const riskResult = calculateRisk({ ausentismo_norm, bajo_rendimiento_bin, ansiedad_norm });

        return { ...student, ...riskResult };
    });

    return (
        <div className="p-8">
            <h1 className="text-3xl font-bold mb-6 text-gray-800">
                Dashboard de Detección Universal (SDTBE)
            </h1>
            <p className="mb-4 text-sm text-gray-600">
                El Índice de Riesgo Compuesto (IRC) combina factores académicos y clínicos para categorizar el riesgo de abandono. 
                {role === 'Orientador' && <span className='font-bold text-purple-700'> (Vista de Orientador: Puntajes detallados ocultos).</span>}
            </p>

            <div className="border rounded-xl overflow-hidden shadow-lg">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Estudiante
                            </th>
                            {role === 'Clinico' && (
                                <>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        GPA
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Faltas (%)
                                    </th>
                                </>
                            )}
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Nivel de Riesgo (IRC)
                            </th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Acción
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {studentsWithRisk.map((student) => {
                            const isHighRisk = student.suicideRiskLevel === 'Alto' || student.suicideRiskLevel === 'Crítico';
                             const linkHref = role === 'Clinico' 
                                ? `/clinica/expediente/${student.id}` 
                                : `/educativa/estudiante/${student.id}`;
                            const buttonText = role === 'Clinico' ? 'Abrir Expediente' : 'Ver PIEI';

                            return (
                                <tr key={student.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                        {student.name}
                                    </td>
                                    {role === 'Clinico' && (
                                        <>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {student.academicData.gpa.toFixed(1)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {student.academicData.absences.toFixed(0)}%
                                            </td>
                                        </>
                                    )}
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        <RiskIndicator
                                            irc={student.IRC}
                                            nivel={student.nivelRiesgo}
                                            color={student.color}
                                        />
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                                        <Link href={linkHref} passHref legacyBehavior>
                                            <a
                                                className={cn(
                                                    buttonVariants({ variant: 'default', size: 'sm' }),
                                                    'font-semibold',
                                                    isHighRisk && role === 'Clinico' ? 'bg-red-600 hover:bg-red-700' : 'bg-gray-600 hover:bg-gray-700'
                                                )}
                                            >
                                                {isHighRisk && role === 'Clinico' && <AlertTriangle className="mr-2 h-4 w-4" />}
                                                {buttonText}
                                            </a>
                                        </Link>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

// This helper function is needed to properly type the button variants
// when they are used inside the <a> tag.
// You can define it here or in your utils file.
const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);


export default StudentDashboard;
