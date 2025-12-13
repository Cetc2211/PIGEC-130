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
    dualRelationshipNote?: string; // Campo para trazabilidad de relación dual (Cap. 4.3)
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


// --- NUEVOS TIPOS PARA DATOS DE SEGUIMIENTO ---
export interface ClinicalAssessment {
    studentId: string;
    fecha_evaluacion: string;
    bdi_ii_score: number;
    bai_score: number;
    riesgo_suicida_beck_score: number;
    neuro_mt_score: number;
    neuro_as_score: number;
    neuro_vp_score: number;
    contexto_carga_cognitiva: string;
    assist_result: string;
    conducta_autolesiva_score: number;
    impresion_diagnostica: string;
}

export interface FunctionalAnalysis {
    studentId: string;
    session_number: number;
    fecha_sesion: string;
    analisis_funcional: {
        antecedente_principal: string;
        conducta_problema: string;
        funcion_mantenimiento: string;
        creencia_esquema: string;
    }
}

export interface TreatmentPlan {
    studentId: string;
    fecha_aprobacion: string;
    plan_narrativo_final: string;
}

export interface ProgressRecord {
    studentId: string;
    semana_numero: number;
    fecha_registro: string;
    ideacion_suicida_score: number;
    suds_score: number;
    logro_tarea_score: number;
}

// Tipo para el componente de gráfico
export interface ProgressData {
    week: number;
    suicidalIdeation: number;
    suds: number;
    taskAchievement: number;
}


// --- Simulación de la Base de Datos (Firestore) en Memoria ---

const studentsDB: Student[] = [
    { 
        id: 'S001', name: 'Ana M. Pérez (Caso de Prueba: Riesgo Crítico)', 
        demographics: { age: 17, group: '5A' },
        emergencyContact: { name: 'Mariana López', phone: '5512345678' },
        suicideRiskLevel: 'Crítico',
        academicData: { gpa: 6.2, absences: 35 },
        ansiedadScore: 21, // Puntuación máxima para forzar riesgo alto
        dualRelationshipNote: 'Sin relación dual reportada.'
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
    { id: 'eval-01', studentId: 'S001', type: 'GAD-7', score: 21, date: new Date('2024-05-01') },
    { id: 'eval-02', studentId: 'S002', type: 'GAD-7', score: 10, date: new Date('2024-05-10') },
    { id: 'eval-03', studentId: 'S003', type: 'GAD-7', score: 4, date: new Date('2024-05-12') },
];

// --- DATOS SIMULADOS PARA EL CASO DE ANA PÉREZ ---
const clinicalAssessmentsDB: ClinicalAssessment[] = [
    {
        studentId: 'S001',
        fecha_evaluacion: '2024-05-15',
        bdi_ii_score: 35, // Puntuación elevada
        bai_score: 28, // Puntuación elevada
        riesgo_suicida_beck_score: 15, // Puntuación elevada
        neuro_mt_score: 82,
        neuro_as_score: 88,
        neuro_vp_score: 79,
        contexto_carga_cognitiva: 'Presión por exámenes finales y conflicto con su pareja. Expresa desesperanza.',
        assist_result: 'Negativo',
        conducta_autolesiva_score: 8, // Frecuencia alta
        impresion_diagnostica: 'Sintomatología depresiva y ansiosa severa, con ideación suicida activa y planificada. El rendimiento cognitivo parece afectado por la carga emocional. La conducta problema parece mantenida por evitación del malestar. Criterio de Riesgo Vital (Código Rojo) activado.',
    }
];

const functionalAnalysesDB: FunctionalAnalysis[] = [
    {
        studentId: 'S001',
        session_number: 1,
        fecha_sesion: '2024-05-16',
        analisis_funcional: {
            antecedente_principal: 'Recibir una tarea académica que percibe como difícil.',
            conducta_problema: 'Procrastinar la tarea, aislarse y rumiar sobre el fracaso.',
            funcion_mantenimiento: 'Refuerzo Negativo (Trampa de Evitación/Escape)',
            creencia_esquema: '"Soy incompetente y no puedo con la presión, es mejor no intentarlo."',
        }
    }
];

const treatmentPlansDB: TreatmentPlan[] = [
    {
        studentId: 'S001',
        fecha_aprobacion: '2024-05-17',
        plan_narrativo_final: `
Párrafo 1 (Estabilización y Activación Conductual):
El objetivo inicial es la estabilización y reducción del riesgo. Se priorizará la psicoeducación sobre el modelo de Activación Conductual (AC) para romper el ciclo de evitación. Se creará una jerarquía de actividades placenteras y de dominio, comenzando con tareas de baja dificultad (ej. "Organizar el escritorio por 10 minutos") para generar momentum y autoeficacia. El monitoreo será diario.

Párrafo 2 (Intervención Cognitiva y Regulación Emocional):
Se introducirán técnicas de Mindfulness para la observación de pensamientos sin juicio. Se trabajará en la identificación de distorsiones cognitivas asociadas a la creencia de "incompetencia". Se usarán registros de pensamiento para desafiar la evidencia a favor y en contra de pensamientos como "nunca lo lograré".

Párrafo 3 (Monitoreo y Prevención de Recaídas):
El progreso se medirá con SUDS, BDI-II semanal y el logro de tareas de AC. Se establecerá un plan de manejo de crisis que incluya contacto de emergencia y técnicas de auto-calma. La intervención se mantendrá en Nivel 3 (Intensivo) con reevaluación en 4 semanas.
        `.trim(),
    }
];

const progressTrackingDB: { [studentId: string]: ProgressData[] } = {
    'S001': [
        { week: 1, suicidalIdeation: 8, suds: 80, taskAchievement: 3 },
        { week: 2, suicidalIdeation: 7, suds: 75, taskAchievement: 5 },
        { week: 3, suicidalIdeation: 5, suds: 60, taskAchievement: 7 },
        { week: 4, suicidalIdeation: 4, suds: 50, taskAchievement: 8 },
    ]
};


// --- Funciones de Acceso a Datos (Simulan llamadas a Firestore) ---

export function getStudents(): Student[] {
    return studentsDB;
}

export function getStudentById(id: string): Student | undefined {
    return studentsDB.find(s => s.id === id);
}

export function getEvaluations(): Evaluation[] {
    return evaluationsDB;
}

// --- NUEVAS FUNCIONES PARA OBTENER DATOS DE SEGUIMIENTO ---
export function getClinicalAssessmentByStudentId(studentId: string): ClinicalAssessment | undefined {
    return clinicalAssessmentsDB.find(a => a.studentId === studentId);
}

export function getFunctionalAnalysisByStudentId(studentId: string): FunctionalAnalysis | undefined {
    return functionalAnalysesDB.find(a => a.studentId === studentId);
}

export function getTreatmentPlanByStudentId(studentId: string): TreatmentPlan | undefined {
    return treatmentPlansDB.find(a => a.studentId === studentId);
}

export function getProgressTrackingByStudentId(studentId: string): ProgressData[] {
    return progressTrackingDB[studentId] || [];
}
