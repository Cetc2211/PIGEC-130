// --- Tipos de Datos (Schemas de la Base de Datos) ---

export type SuicideRiskLevel = 'Bajo' | 'Medio' | 'Alto' | 'Crítico';

export interface Student {
    id: string; // PK: ID_Estudiante
    name: string;
    demographics: {
        age: number;
        group: string; // ej. "3B"
    };
    emergencyContact: {
        name: string;
        phone: string;
    };
    suicideRiskLevel: SuicideRiskLevel; // Campo restringido
    academicData: {
        gpa: number; // Promedio general
        absences: number; // Porcentaje de ausencias
    };
    // Este campo es para simulación, se puede quitar después
    ansiedadScore?: number;
}


export interface Evaluation {
    id: string; // PK
    studentId: string; // FK a Estudiantes
    type: 'GAD-7' | 'PHQ-9' | 'OTRO';
    score: number;
    date: Date;
}

// --- Simulación de la Base de Datos (Firestore) en Memoria ---

const studentsDB: Student[] = [
    { 
        id: 'S001', name: 'Ana M. Pérez (Riesgo Alto)', 
        demographics: { age: 17, group: '5A' },
        emergencyContact: { name: 'Mariana López', phone: '5512345678' },
        suicideRiskLevel: 'Alto',
        academicData: { gpa: 6.2, absences: 25 },
        ansiedadScore: 18,
    },
    { 
        id: 'S002', name: 'Carlos V. Ruiz (Riesgo Medio)', 
        demographics: { age: 16, group: '3B' },
        emergencyContact: { name: 'Juan Mendoza', phone: '5587654321' },
        suicideRiskLevel: 'Medio',
        academicData: { gpa: 7.8, absences: 15 },
        ansiedadScore: 10,
    },
    { 
        id: 'S003', name: 'Laura J. García (Riesgo Bajo)', 
        demographics: { age: 18, group: '5A' },
        emergencyContact: { name: 'Lucía Jiménez', phone: '5555555555' },
        suicideRiskLevel: 'Bajo',
        academicData: { gpa: 9.1, absences: 5 },
        ansiedadScore: 4,
    },
];

const evaluationsDB: Evaluation[] = [
    { id: 'eval-01', studentId: 'S001', type: 'GAD-7', score: 18, date: new Date('2024-05-01') },
    { id: 'eval-02', studentId: 'S002', type: 'GAD-7', score: 10, date: new Date('2024-05-10') },
    { id: 'eval-03', studentId: 'S003', type: 'GAD-7', score: 4, date: new Date('2024-05-12') },
];


// --- Funciones de Acceso a Datos (Simulan llamadas a Firestore) ---

export function getStudents(): Student[] {
    // En una app real: return await db.collection('Estudiantes').get();
    return studentsDB;
}

export function getStudentById(id: string): Student | undefined {
    return studentsDB.find(s => s.id === id);
}


export function getEvaluations(): Evaluation[] {
    // En una app real: return await db.collection('Evaluaciones').get();
    return evaluationsDB;
}
