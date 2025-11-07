// NOTE: This now uses a static JSON file for initial data to ensure persistence
// across server reloads in development. Write operations are still in-memory.

import { format } from 'date-fns';
import initialDb from './db.json';

// Simple flag to prevent re-seeding in hot-reload scenarios
let isSeeded = false;

export type EvaluationResult = {
  id: string;
  patientId?: string; // Patient ID is now optional
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
  createdAt: Date | string;
  // Detailed profile info
  dob?: string | null;
  age?: number | null;
  sex?: 'M' | 'F' | 'Otro' | null;
  otherSex?: string | null;
  maritalStatus?: string | null;
  curp?: string | null;
  nss?: string | null;
  address?: string | null;
  neighborhood?: string | null;
  postalCode?: string | null;
  municipality?: string | null;
  homePhone?: string | null;
  mobilePhone?: string | null;
  email?: string | null;
  emergencyContactName?: string | null;
  emergencyContactRelationship?: string | null;
  emergencyContactPhone?: string | null;
};


export type Assignment = {
    assignmentId: string;
    patientId: string;
    questionnaireId: string;
    assignedAt: Date | string;
};

// In-memory stores
let patientsStore: Map<string, Patient> = new Map();
let assignedQuestionnairesStore: Map<string, Assignment[]> = new Map();
const resultsStore: Map<string, EvaluationResult> = new Map();

// --- Data Seeding ---
function seedData() {
    if (isSeeded) return;

    patientsStore.clear();
    assignedQuestionnairesStore.clear();
    resultsStore.clear();

    // Deep copy to avoid mutations affecting the imported JSON object across reloads
    const initialData = JSON.parse(JSON.stringify(initialDb));

    initialData.patients.forEach((p: any) => patientsStore.set(p.id, {
        ...p,
        createdAt: new Date(p.createdAt)
    }));
    
    Object.entries(initialData.assignments).forEach(([patientId, assignments]: [string, any]) => {
        const assignmentsWithDates = assignments.map((a: any) => ({
            ...a,
            assignedAt: new Date(a.assignedAt),
        }));
        assignedQuestionnairesStore.set(patientId, assignmentsWithDates);
    });

    initialData.results.forEach((r: any) => resultsStore.set(r.id, {
        ...r,
        submittedAt: new Date(r.submittedAt),
    }));

    isSeeded = true;
}


// --- Store Functions ---

export const saveResult = (result: Omit<EvaluationResult, 'id'>): EvaluationResult => {
  seedData(); // Ensure data is loaded
  const id = `res-${resultsStore.size + 1}-${Date.now()}`;
  const newResult: EvaluationResult = { ...result, id };
  resultsStore.set(id, newResult);
  
  return newResult;
};

export const getResult = (id: string): EvaluationResult | undefined => {
  seedData(); // Ensure data is loaded
  return resultsStore.get(id);
};

export function getAllResultsForPatient(patientId: string): EvaluationResult[] {
    seedData(); // Ensure data is loaded
    return Array.from(resultsStore.values()).filter(r => r.patientId === patientId);
}

// Patient store functions
const generateRecordId = (date: Date) => {
    seedData(); // Ensure data is loaded
    const totalPatients = patientsStore.size;
    const sequence = (totalPatients + 1).toString().padStart(5, '0');
    const datePart = format(date, 'dd/MM/yy');
    return `CBTA/130/${sequence}/${datePart}`;
}

export const savePatient = (patientData: Omit<Patient, 'id' | 'createdAt' | 'recordId'>): Patient => {
  seedData(); // Ensure data is loaded
  const id = `pat-${patientsStore.size + 1}-${Date.now()}`;
  const now = new Date();
  const recordId = generateRecordId(now);

  const newPatient: Patient = { ...patientData, id, recordId, createdAt: now };
  patientsStore.set(id, newPatient); // Save to in-memory store
  return newPatient;
};

export const savePatientsBatch = (patientsData: Omit<Patient, 'id' | 'createdAt' | 'recordId' | 'dob'>[]): number => {
    seedData(); // Ensure data is loaded
    const now = new Date();
    let createdCount = 0;
    
    patientsData.forEach(patientData => {
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
    seedData(); // Ensure data is loaded
    return patientsStore.get(id);
};

export const getAllPatients = (): Patient[] => {
    seedData(); // Ensure data is loaded
    const patients = Array.from(patientsStore.values());
    return patients.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function updatePatient(patientId: string, dataToUpdate: Partial<Patient>) {
    seedData();
    const patient = patientsStore.get(patientId);
    if (patient) {
        const updatedPatient = { ...patient, ...dataToUpdate };
        patientsStore.set(patientId, updatedPatient);
    } else {
        throw new Error("Patient not found");
    }
}

// Assignment functions
export const assignQuestionnaireToPatient = (patientId: string, questionnaireId: string): Assignment => {
    seedData(); // Ensure data is loaded
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
    seedData(); // Ensure data is loaded
    return assignedQuestionnairesStore.get(patientId) || [];
};

export const getAllAssignedQuestionnaires = (): Assignment[] => {
    seedData(); // Ensure data is loaded
    return Array.from(assignedQuestionnairesStore.values()).flat();
};
