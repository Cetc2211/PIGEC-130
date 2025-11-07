// NOTE: This now uses a static JSON file for initial data to ensure persistence
// across server reloads in development. Write operations are still in-memory.

import { format } from 'date-fns';
import initialData from './db.json';

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
    assignedAt: Date | string;
};

// In-memory stores that will be hydrated from the JSON file.
// Write operations will modify these in-memory maps.
let patientsStore: Map<string, Patient> = new Map(initialData.patients.map(p => [p.id, { ...p, createdAt: new Date(p.createdAt) }]));
let assignedQuestionnairesStore: Map<string, Assignment[]> = new Map(
    Object.entries(initialData.assignments).map(([patientId, assignments]) => [
        patientId,
        (assignments as any[]).map(a => ({ ...a, assignedAt: new Date(a.assignedAt) }))
    ])
);
const resultsStore: Map<string, EvaluationResult> = new Map();


// --- Store Functions ---

export const saveResult = (result: Omit<EvaluationResult, 'id'>): EvaluationResult => {
  const id = `res-${resultsStore.size + 1}-${Date.now()}`;
  const newResult: EvaluationResult = { ...result, id };
  resultsStore.set(id, newResult);
  
  // If the result belongs to a patient, add it to the in-memory results
  if (result.patientId) {
      const patientResults = Array.from(resultsStore.values()).filter(r => r.patientId === result.patientId);
      // In a real DB, you'd just save it. Here we don't need to do much more.
  }

  return newResult;
};

export const getResult = (id: string): EvaluationResult | undefined => {
  return resultsStore.get(id);
};

export function getAllResultsForPatient(patientId: string): EvaluationResult[] {
    return Array.from(resultsStore.values()).filter(r => r.patientId === patientId);
}

// Patient store functions
const generateRecordId = (date: Date) => {
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
  patientsStore.set(id, newPatient); // Save to in-memory store
  return newPatient;
};

export const savePatientsBatch = (patientsData: Omit<Patient, 'id' | 'createdAt' | 'recordId' | 'dob'>[]): number => {
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
    // Re-initialize from JSON on every call in dev to ensure data is fresh
    if (process.env.NODE_ENV === 'development') {
        patientsStore = new Map(initialData.patients.map(p => [p.id, { ...p, createdAt: new Date(p.createdAt) }]));
    }
    return patientsStore.get(id);
};

export const getAllPatients = (): Patient[] => {
    // Re-initialize from JSON on every call in dev to ensure data is fresh
    if (process.env.NODE_ENV === 'development') {
        patientsStore = new Map(initialData.patients.map(p => [p.id, { ...p, createdAt: new Date(p.createdAt) }]));
    }
    const patients = Array.from(patientsStore.values());
    return patients.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
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
    // Re-initialize from JSON on every call in dev to ensure data is fresh
    if (process.env.NODE_ENV === 'development') {
         assignedQuestionnairesStore = new Map(
            Object.entries(initialData.assignments).map(([pId, assignments]) => [
                pId,
                (assignments as any[]).map(a => ({ ...a, assignedAt: new Date(a.assignedAt) }))
            ])
        );
    }
    return assignedQuestionnairesStore.get(patientId) || [];
};

export const getAllAssignedQuestionnaires = (): Assignment[] => {
    // Re-initialize from JSON on every call in dev to ensure data is fresh
    if (process.env.NODE_ENV === 'development') {
         assignedQuestionnairesStore = new Map(
            Object.entries(initialData.assignments).map(([pId, assignments]) => [
                pId,
                (assignments as any[]).map(a => ({ ...a, assignedAt: new Date(a.assignedAt) }))
            ])
        );
    }
    return Array.from(assignedQuestionnairesStore.values()).flat();
};
