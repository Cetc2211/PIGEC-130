
'use server';

import { z } from 'zod';
import { redirect } from 'next/navigation';
import { questionnaires } from '@/lib/data';
import { saveResult } from '@/lib/store';
import { generateEvaluationReport } from '@/ai/flows/generate-evaluation-report';
import { revalidatePath } from 'next/cache';

export type FormState = {
  message: string;
  errors?: Record<string, string[] | undefined>;
};

export async function submitEvaluation(
  questionnaireId: string,
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const questionnaire = questionnaires.find((q) => q.id === questionnaireId);
  if (!questionnaire) {
    return { message: 'Error: Questionnaire not found.' };
  }

  const schemaFields: Record<string, any> = {};
  questionnaire.questions.forEach((q) => {
    schemaFields[q.id] = z.string({ required_error: 'Please select an answer.' });
  });
  const schema = z.object(schemaFields);

  const parsed = schema.safeParse(Object.fromEntries(formData.entries()));

  if (!parsed.success) {
    return {
      message: 'Please answer all questions before submitting.',
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  const answers = parsed.data;
  let score = 0;
  const answerValues: Record<string, number> = {};

  for (const questionId in answers) {
    const value = parseInt(answers[questionId], 10);
    score += value;
    answerValues[questionId] = value;
  }

  const totalPossibleScore = questionnaire.questions.length * (questionnaire.likertScale.length - 1);

  const result = saveResult({
    questionnaireId: questionnaire.id,
    questionnaireName: questionnaire.name,
    answers: answerValues,
    score,
    totalPossibleScore,
    submittedAt: new Date(),
  });

  redirect(`/results/${result.id}`);
}


export async function generateReportAction(resultId: string, evaluationData: string) {
  try {
    const questionnaireName = JSON.parse(evaluationData).questionnaireName;
    const aiResult = await generateEvaluationReport({
      evaluationResults: evaluationData,
      scaleName: questionnaireName,
    });
    
    revalidatePath(`/results/${resultId}`);
    return { success: true, report: aiResult.report };
  } catch (error) {
    console.error(error);
    return { success: false, report: 'Failed to generate report.' };
  }
}
