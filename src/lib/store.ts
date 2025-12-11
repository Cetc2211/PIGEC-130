// NOTE: This now uses a static JSON file for initial data to ensure persistence
// across server reloads in development. Write operations now write back to the file.

import { format } from 'date-fns';
import fs from 'fs';
import path from 'path';

const dbPath = path.resolve(process.cwd(), 'src/lib/db.json');

// This flag prevents re-seeding on every hot reload in development
let isSeeded = false;

export type EvaluationResult = {
  id: string;
  patientId?: string; // Patient ID is now optional
  questionnaireId: string;
  questionnaireName: string;
  scores: Record<string, number>; // Soporta múltiples puntuaciones, ej. { estado: 25, rasgo: 30 }
  totalPossibleScores: Record<string, number>;
  answers: Record<string, number | string>; // Can now store numbers or strings
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

export type EvaluationSession = {
    sessionId: string;
    patientId: string;
    questionnaireIds: string[];
    createdAt: Date;
};


// In-memory stores
let patientsStore: Map<string, Patient> = new Map();
let assignedQuestionnairesStore: Map<string, Assignment[]> = new Map();
let resultsStore: Map<string, EvaluationResult> = new Map();
let sessionsStore: Map<string, EvaluationSession> = new Map();

// --- Data Seeding and Persistence ---

function readDb(): { patients: Patient[], assignments: Record<string, Assignment[]>, results: EvaluationResult[], sessions: EvaluationSession[] } {
    try {
        const fileContent = fs.readFileSync(dbPath, 'utf-8');
        return JSON.parse(fileContent);
    } catch (error) {
        console.error("Error reading db.json, returning empty state:", error);
        return { patients: [], assignments: {}, results: [], sessions: [] };
    }
}

function writeDb() {
    try {
        const data = {
            patients: Array.from(patientsStore.values()),
            assignments: Object.fromEntries(assignedQuestionnairesStore.entries()),
            results: Array.from(resultsStore.values()),
            sessions: Array.from(sessionsStore.values()),
        };
        fs.writeFileSync(dbPath, JSON.stringify(data, null, 2), 'utf-8');
    } catch (error) {
        console.error("Error writing to db.json:", error);
    }
}


function seedData() {
    // Seeding should only happen if the store is empty.
    if (isSeeded) return;

    const initialDb = readDb();

    patientsStore.clear();
    assignedQuestionnairesStore.clear();
    resultsStore.clear();
    sessionsStore.clear();

    initialDb.patients?.forEach((p: any) => patientsStore.set(p.id, {
        ...p,
        createdAt: new Date(p.createdAt)
    }));
    
    if (initialDb.assignments) {
      Object.entries(initialDb.assignments).forEach(([patientId, assignments]: [string, any]) => {
          const assignmentsWithDates = assignments.map((a: any) => ({
              ...a,
              assignedAt: new Date(a.assignedAt),
          }));
          assignedQuestionnairesStore.set(patientId, assignmentsWithDates);
      });
    }


    initialDb.results?.forEach((r: any) => {
         resultsStore.set(r.id, {
            ...r,
            submittedAt: new Date(r.submittedAt),
        })
    });

    initialDb.sessions?.forEach((s: any) => {
      sessionsStore.set(s.sessionId, {
        ...s,
        createdAt: new Date(s.createdAt)
      });
    });

    isSeeded = true;
}


// --- Store Functions ---
// Always seed before any operation to ensure data is loaded.

export const saveResult = (result: Omit<EvaluationResult, 'id'>): EvaluationResult => {
  seedData(); 
  const id = `res-${resultsStore.size + 1}-${Date.now()}`;
  const newResult: EvaluationResult = { ...result, id, submittedAt: new Date(result.submittedAt) };
  resultsStore.set(id, newResult);
  
  if (newResult.patientId) {
    const patientAssignments = assignedQuestionnairesStore.get(newResult.patientId) || [];
    const updatedAssignments = patientAssignments.filter(
      (assignment) => assignment.questionnaireId !== newResult.questionnaireId
    );
    assignedQuestionnairesStore.set(newResult.patientId, updatedAssignments);
  }
  
  writeDb();
  return newResult;
};

export const getResult = (id: string): EvaluationResult | undefined => {
  seedData();
  return resultsStore.get(id);
};

export function getAllResultsForPatient(patientId: string): EvaluationResult[] {
    seedData();
    return Array.from(resultsStore.values()).filter(r => r.patientId === patientId);
}

const generateRecordId = (date: Date) => {
    seedData();
    const totalPatients = patientsStore.size;
    const sequence = (totalPatients + 1).toString().padStart(5, '0');
    const datePart = format(date, 'dd/MM/yy');
    return `CBTA/130/${sequence}/${datePart}`;
}

export const savePatient = (patientData: Omit<Patient, 'id' | 'createdAt' | 'recordId'>): Patient => {
  seedData();
  const id = `pat-${patientsStore.size + 1}-${Date.now()}`;
  const now = new Date();
  const recordId = generateRecordId(now);

  const newPatient: Patient = { ...patientData, id, recordId, createdAt: now };
  patientsStore.set(id, newPatient);
  writeDb();
  return newPatient;
};

export const savePatientsBatch = (patientsData: Omit<Patient, 'id' | 'createdAt' | 'recordId' | 'dob'>[]): number => {
    seedData();
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

    writeDb();
    return createdCount;
};


export const getPatient = (id: string): Patient | undefined => {
    seedData();
    return patientsStore.get(id);
};

export const getAllPatients = (): Patient[] => {
    seedData();
    const patients = Array.from(patientsStore.values());
    return patients.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function updatePatient(patientId: string, dataToUpdate: Partial<Patient>) {
    seedData();
    const patient = patientsStore.get(patientId);
    if (patient) {
        const updatedPatient = { ...patient, ...dataToUpdate };
        patientsStore.set(patientId, updatedPatient);
        writeDb();
    } else {
        throw new Error("Patient not found");
    }
}

// Assignment functions
export const assignQuestionnairesToPatient = (patientId: string, questionnaireIds: string[]): Assignment[] => {
    seedData();
    const newAssignments: Assignment[] = questionnaireIds.map(qid => ({
        assignmentId: `asg-${Date.now()}-${Math.random()}`,
        patientId,
        questionnaireId: qid,
        assignedAt: new Date(),
    }));

    const existingAssignments = assignedQuestionnairesStore.get(patientId) || [];
    assignedQuestionnairesStore.set(patientId, [...existingAssignments, ...newAssignments]);
    
    writeDb();
    return newAssignments;
};

export const deleteAssignment = (patientId: string, assignmentId: string): void => {
    seedData();
    const assignments = assignedQuestionnairesStore.get(patientId);
    if (!assignments) {
        throw new Error('No se encontraron asignaciones para este paciente.');
    }
    const updatedAssignments = assignments.filter(a => a.assignmentId !== assignmentId);
    assignedQuestionnairesStore.set(patientId, updatedAssignments);
    writeDb();
};

export const getAssignedQuestionnairesForPatient = (patientId: string): Assignment[] => {
    seedData();
    return assignedQuestionnairesStore.get(patientId) || [];
};

export const getAllAssignedQuestionnaires = (): Assignment[] => {
    seedData();
    return Array.from(assignedQuestionnairesStore.values()).flat();
};

// Session functions
export function createEvaluationSession(patientId: string, questionnaireIds: string[]): EvaluationSession {
  seedData();
  const sessionId = `session-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  const newSession: EvaluationSession = {
    sessionId,
    patientId,
    questionnaireIds,
    createdAt: new Date(),
  };
  sessionsStore.set(sessionId, newSession);
  writeDb();
  return newSession;
}

export function getEvaluationSession(sessionId: string): EvaluationSession | undefined {
  seedData();
  return sessionsStore.get(sessionId);
}
