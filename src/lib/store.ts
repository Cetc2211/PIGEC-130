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
}

export interface StudentWithRisk extends Student {
    riskIndex: number;
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
        id: 'cbta-001', name: 'Ana Sofía López', 
        demographics: { age: 17, group: '5A' },
        emergencyContact: { name: 'Mariana López', phone: '5512345678' },
        suicideRiskLevel: 'Bajo',
        academicData: { gpa: 8.5, absences: 5 }
    },
    { 
        id: 'cbta-002', name: 'Carlos Mendoza', 
        demographics: { age: 16, group: '3B' },
        emergencyContact: { name: 'Juan Mendoza', phone: '5587654321' },
        suicideRiskLevel: 'Bajo',
        academicData: { gpa: 6.8, absences: 25 }
    },
    { 
        id: 'cbta-003', name: 'Beatriz Jiménez', 
        demographics: { age: 18, group: '5A' },
        emergencyContact: { name: 'Lucía Jiménez', phone: '5555555555' },
        suicideRiskLevel: 'Medio',
        academicData: { gpa: 7.2, absences: 40 }
    },
     { 
        id: 'cbta-004', name: 'David Ruiz', 
        demographics: { age: 17, group: '3C' },
        emergencyContact: { name: 'Pedro Ruiz', phone: '5511223344' },
        suicideRiskLevel: 'Alto',
        academicData: { gpa: 6.1, absences: 80 }
    },
];

const evaluationsDB: Evaluation[] = [
    { id: 'eval-01', studentId: 'cbta-001', type: 'GAD-7', score: 4, date: new Date('2024-05-01') },
    { id: 'eval-02', studentId: 'cbta-002', type: 'GAD-7', score: 14, date: new Date('2024-05-10') },
    { id: 'eval-03', studentId: 'cbta-003', type: 'GAD-7', score: 18, date: new Date('2024-05-12') },
    { id: 'eval-04', studentId: 'cbta-004', type: 'GAD-7', score: 20, date: new Date('2024-05-15') },
];


// --- Funciones de Acceso a Datos (Simulan llamadas a Firestore) ---

export function getStudents(): Student[] {
    // En una app real: return await db.collection('Estudiantes').get();
    return studentsDB;
}

export function getEvaluations(): Evaluation[] {
    // En una app real: return await db.collection('Evaluaciones').get();
    return evaluationsDB;
}
