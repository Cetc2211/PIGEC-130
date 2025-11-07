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

export const savePatientsBatch = (patientsData: Omit<Patient, 'id' | 'createdAt' | 'recordId'>[]): number => {
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
