// NOTE: This is an in-memory store for demonstration purposes.
// Data will be lost on server restart.

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
  name: string;
  semester: string;
  group: string;
  createdAt: Date;
};

// Using a Map to store results. In a real app, this would be a database.
const resultsStore: Map<string, EvaluationResult> = new Map();
const patientsStore: Map<string, Patient> = new Map();


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
export const savePatient = (patient: Omit<Patient, 'id' | 'createdAt' | 'recordId'>): Patient => {
  const id = `pat-${patientsStore.size + 1}-${Date.now()}`;
  const now = new Date();
  
  // Generate recordId
  const sequence = (patientsStore.size + 1).toString().padStart(5, '0');
  const datePart = format(now, 'dd/MM/yy');
  const recordId = `CBTA/130/${sequence}/${datePart}`;

  const newPatient: Patient = { ...patient, id, recordId, createdAt: now };
  patientsStore.set(id, newPatient);
  return newPatient;
};

export const getPatient = (id: string): Patient | undefined => {
    return patientsStore.get(id);
};

export const getAllPatients = (): Patient[] => {
    return Array.from(patientsStore.values()).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
}
