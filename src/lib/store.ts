// NOTE: This is an in-memory store for demonstration purposes.
// Data will be lost on server restart.

export type EvaluationResult = {
  id: string;
  questionnaireId: string;
  questionnaireName: string;
  score: number;
  totalPossibleScore: number;
  answers: Record<string, number>;
  submittedAt: Date;
};

// Using a Map to store results. In a real app, this would be a database.
const resultsStore: Map<string, EvaluationResult> = new Map();

export const saveResult = (result: Omit<EvaluationResult, 'id'>): EvaluationResult => {
  const id = (resultsStore.size + 1).toString();
  const newResult: EvaluationResult = { ...result, id };
  resultsStore.set(id, newResult);
  return newResult;
};

export const getResult = (id: string): EvaluationResult | undefined => {
  return resultsStore.get(id);
};
