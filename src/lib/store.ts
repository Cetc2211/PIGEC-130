// NOTE: This is an in-memory store for demonstration purposes.
// Data will be lost on server restart.

import { getAllQuestionnaires } from "./data";

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
  name: string;
  dateOfBirth: Date;
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
export const savePatient = (patient: Omit<Patient, 'id' | 'createdAt'>): Patient => {
  const id = `pat-${patientsStore.size + 1}-${Date.now()}`;
  const newPatient: Patient = { ...patient, id, createdAt: new Date() };
  patientsStore.set(id, newPatient);
  return newPatient;
};

export const getPatient = (id: string): Patient | undefined => {
    return patientsStore.get(id);
};

export const getAllPatients = (): Patient[] => {
    return Array.from(patientsStore.values()).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
}