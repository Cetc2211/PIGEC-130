'use client';
import React from 'react';
import { calculateRisk } from '../lib/risk-analysis';
import RiskIndicator from './RiskIndicator';

// --- ESTRUCTURA DE DATOS DE EJEMPLO SIMULANDO LA INTEGRACIÓN ---

interface StudentData {
    id: string;
    name: string;
    gpa: number;
    totalClasses: number;
    nonAttendedClasses: number;
    ansiedadScore: number; // Asumimos GAD-7 Score (0-21)
}

// Función auxiliar para normalizar el GAD-7 Score (ejemplo)
const normalizeAnxiety = (score: number) => Math.min(score / 21, 1.0); // 0 a 1.0

// Base de Datos Simulada (datos obtenidos de AcademicTracker y Screening Clínico)
const MOCK_STUDENTS: StudentData[] = [
    { id: 'S001', name: 'Ana M. Pérez (Riesgo Alto)', gpa: 6.2, totalClasses: 100, nonAttendedClasses: 25, ansiedadScore: 18 },
    { id: 'S002', name: 'Carlos V. Ruiz (Riesgo Medio)', gpa: 7.8, totalClasses: 120, nonAttendedClasses: 15, ansiedadScore: 10 },
    { id: 'S003', name: 'Laura J. García (Riesgo Bajo)', gpa: 9.1, totalClasses: 110, nonAttendedClasses: 5, ansiedadScore: 4 },
];

const StudentDashboard: React.FC = () => {

    const studentsWithRisk = MOCK_STUDENTS.map(student => {
        // Preparación de variables de riesgo para el modelo (X1, X2, X3)
        const ausentismo_norm = student.nonAttendedClasses / student.totalClasses; // X1
        const bajo_rendimiento_bin = student.gpa < 7.0 ? 1 : 0; // X2
        const ansiedad_norm = normalizeAnxiety(student.ansiedadScore); // X3

        const riskData = {
            ausentismo_norm,
            bajo_rendimiento_bin,
            ansiedad_norm,
        };

        const riskResult = calculateRisk(riskData);

        return {
            ...student,
            ...riskResult, // Añade IRC, nivelRiesgo, color
        };
    });

    return (
        <div className="p-8">
            <h1 className="text-3xl font-bold mb-6 text-gray-800">
                Dashboard de Detección Universal (SDTBE)
            </h1>
            <p className="mb-4 text-sm text-gray-600">
                El Índice de Riesgo Compuesto (IRC) combina factores académicos (GPA, Faltas) y clínicos (Ansiedad) para categorizar el riesgo de abandono.
            </p>

            <div className="border rounded-xl overflow-hidden shadow-lg">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Estudiante
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                GPA
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Faltas (%)
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Nivel de Riesgo (IRC)
                            </th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Acción
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {studentsWithRisk.map((student) => (
                            <tr key={student.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                    {student.name}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {student.gpa.toFixed(1)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {((student.nonAttendedClasses / student.totalClasses) * 100).toFixed(0)}%
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    <RiskIndicator
                                        irc={student.IRC}
                                        nivel={student.nivelRiesgo}
                                        color={student.color}
                                    />
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                                    <button
                                        onClick={() => alert(`Iniciando canalización para: ${student.name}`)}
                                        className={`px-3 py-1 text-white text-xs font-semibold rounded ${student.color === 'red' ? 'bg-red-500 hover:bg-red-600' : student.color === 'yellow' ? 'bg-yellow-500 hover:bg-yellow-600' : 'bg-gray-400'}`}
                                    >
                                        {student.color !== 'green' ? 'Canalizar Nivel 2/3' : 'Ver Expediente'}
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default StudentDashboard;
