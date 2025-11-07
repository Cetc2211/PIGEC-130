// NOTE: This is an in-memory store for demonstration purposes.
// Data will be lost on server restart unless pre-filled.

import { format } from 'date-fns';

export type EvaluationResult = {
  id: string;
  questionnaireId: string;
  questionnaireName: string;
  score: number;
  totalPossibleScore: number;
  answers: Record<string, number>;
  submittedAt: Date;
};

export type Patient = {
  id: string;
  recordId: string;
  // Basic info from bulk add
  name: string;
  semester: string;
  group: string;
  createdAt: Date;
  // Detailed profile info
  dob?: string; // Date of birth
  age?: number;
  sex?: 'M' | 'F' | 'Otro';
  otherSex?: string;
  maritalStatus?: string;
  curp?: string;
  nss?: string;
  address?: string;
  neighborhood?: string;
  postalCode?: string;
  municipality?: string;
  homePhone?: string;
  mobilePhone?: string;
  email?: string;
  emergencyContactName?: string;
  emergencyContactRelationship?: string;
  emergencyContactPhone?: string;
};


export type Assignment = {
    assignmentId: string;
    patientId: string;
    questionnaireId: string;
    assignedAt: Date;
};


// Using a Map to store results. In a real app, this would be a database.
const resultsStore: Map<string, EvaluationResult> = new Map();
const patientsStore: Map<string, Patient> = new Map();
const assignedQuestionnairesStore: Map<string, Assignment[]> = new Map();


// --- Data Persistence Simulation ---
// To avoid losing data on every server restart during development,
// we pre-fill the stores with some default data.

const generateRecordIdForSeed = (date: Date, index: number) => {
    const sequence = (index + 1).toString().padStart(5, '0');
    const datePart = format(date, 'dd/MM/yy');
    return `CBTA/130/${sequence}/${datePart}`;
}

const seedData = () => {
    const now = new Date();
    
    // Clear stores to prevent duplication on hot-reloads in dev
    if (patientsStore.size > 0 || assignedQuestionnairesStore.size > 0) {
        return;
    }

    const initialPatients = [
        { name: "Ana Sofía López", semester: "1", group: "A", email: "ana.lopez@example.com" },
        { name: "Carlos Mendoza", semester: "1", group: "A", email: "carlos.mendoza@example.com" },
        { name: "Beatriz Jiménez", semester: "1", group: "A", email: "beatriz.jimenez@example.com" },
        { name: "David Ruiz", semester: "3", group: "B", email: "david.ruiz@example.com" },
        { name: "Elena Torres", semester: "3", group: "B", email: "elena.torres@example.com" },
    ];

    const createdPatients: Patient[] = [];

    initialPatients.forEach((p, index) => {
        const id = `pat-${index + 1}-${now.getTime()}`;
        const recordId = generateRecordIdForSeed(now, index);
        const newPatient: Patient = {
            ...p,
            id,
            recordId,
            createdAt: now,
        };
        patientsStore.set(id, newPatient);
        createdPatients.push(newPatient);
    });

    // Assign a test to Ana Sofía López
    const ana = createdPatients.find(p => p.name === "Ana Sofía López");
    if (ana) {
        const assignment: Assignment = {
            assignmentId: `asg-seed-1`,
            patientId: ana.id,
            questionnaireId: 'gad-7',
            assignedAt: now,
        };
        assignedQuestionnairesStore.set(ana.id, [assignment]);
    }

    console.log('✅ In-memory store seeded with test data.');
};

// Initialize with seed data
seedData();


// --- Store Functions ---


export const saveResult = (result: Omit<EvaluationResult, 'id'>): EvaluationResult => {
  const id = `res-${resultsStore.size + 1}-${Date.now()}`;
  const newResult: EvaluationResult = { ...result, id };
  resultsStore.set(id, newResult);
  return newResult;
};

export const getResult = (id: string): EvaluationResult | undefined => {
  return resultsStore.get(id);
};

export function getAllResults(): EvaluationResult[] {
  return Array.from(resultsStore.values());
}


// Patient store functions
const generateRecordId = (date: Date) => {
    // This function needs to be aware of the total number of patients
    const totalPatients = patientsStore.size;
    const sequence = (totalPatients + 1).toString().padStart(5, '0');
    const datePart = format(date, 'dd/MM/yy');
    return `CBTA/130/${sequence}/${datePart}`;
}

export const savePatient = (patientData: Omit<Patient, 'id' | 'createdAt' | 'recordId'>): Patient => {
  const id = `pat-${patientsStore.size + 1}-${Date.now()}`;
  const now = new Date();
  const recordId = generateRecordId(now);

  const newPatient: Patient = { ...patientData, id, recordId, createdAt: now };
  patientsStore.set(id, newPatient);
  return newPatient;
};

export const savePatientsBatch = (patientsData: Omit<Patient, 'id' | 'createdAt' | 'recordId' | 'dob'>[]): number => {
    const now = new Date();
    let createdCount = 0;
    
    patientsData.forEach(patientData => {
        // The recordId needs to be generated inside the loop to get the correct sequence.
        const totalPatients = patientsStore.size;
        const sequence = (totalPatients + 1).toString().padStart(5, '0');
        const datePart = format(now, 'dd/MM/yy');
        const recordId = `CBTA/130/${sequence}/${datePart}`;

        const id = `pat-${totalPatients + 1}-${Date.now()}-${Math.random()}`;
        const newPatient: Patient = { ...patientData, id, recordId, createdAt: now };
        patientsStore.set(id, newPatient);
        createdCount++;
    });

    return createdCount;
};


export const getPatient = (id: string): Patient | undefined => {
    return patientsStore.get(id);
};

export const getAllPatients = (): Patient[] => {
    return Array.from(patientsStore.values()).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
}


// Assignment functions
export const assignQuestionnaireToPatient = (patientId: string, questionnaireId: string): Assignment => {
    const assignmentId = `asg-${Date.now()}-${Math.random()}`;
    const newAssignment: Assignment = {
        assignmentId,
        patientId,
        questionnaireId,
        assignedAt: new Date(),
    };

    const existingAssignments = assignedQuestionnairesStore.get(patientId) || [];
    assignedQuestionnairesStore.set(patientId, [...existingAssignments, newAssignment]);
    
    return newAssignment;
};

export const getAssignedQuestionnairesForPatient = (patientId: string): Assignment[] => {
    return assignedQuestionnairesStore.get(patientId) || [];
};

export const getAllAssignedQuestionnaires = (): Assignment[] => {
    return Array.from(assignedQuestionnairesStore.values()).flat();
};
