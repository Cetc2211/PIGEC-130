'use server';

import { z } from 'zod';
import { redirect } from 'next/navigation';
import { getQuestionnaire, saveCustomQuestionnaire } from '@/lib/data';
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
  const questionnaire = getQuestionnaire(questionnaireId);
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

export type CreateQuestionnaireState = {
    message: string;
    success: boolean;
    errors?: Record<string, any>;
    questionnaireId?: string;
};

const interpretationSchema = z.object({
    from: z.number(),
    to: z.number(),
    severity: z.enum(['Low', 'Mild', 'Moderate', 'High']),
    summary: z.string().min(1, 'Summary is required'),
});

const formSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().min(1, 'Description is required'),
  questions: z.array(z.object({ text: z.string().min(1, 'Question text cannot be empty') })).min(1, 'At least one question is required'),
  likertScale: z.array(z.object({ label: z.string().min(1, 'Scale label cannot be empty'), value: z.number() })).min(2, 'At least two scale options are required'),
  interpretations: z.array(interpretationSchema).min(1, 'At least one interpretation rule is required'),
});


export async function createQuestionnaireAction(
  prevState: CreateQuestionnaireState,
  formData: FormData
): Promise<CreateQuestionnaireState> {
  try {
    const data = JSON.parse(formData.get('jsonData') as string);
    const parsed = formSchema.safeParse(data);

    if (!parsed.success) {
      return {
        success: false,
        message: 'Validation failed. Check the fields.',
        errors: parsed.error.flatten(),
      };
    }

    const { name, description, questions, likertScale, interpretations } = parsed.data;

    const newQuestionnaire = saveCustomQuestionnaire({
      name,
      description,
      questions: questions.map((q, i) => ({ ...q, id: `q${i+1}` })),
      likertScale,
      interpretations: (score: number) => {
        const rule = interpretations.find(i => score >= i.from && score <= i.to);
        if (rule) {
          return { severity: rule.severity, summary: rule.summary };
        }
        return { severity: 'Low', summary: 'Score is out of defined interpretation range.' };
      }
    });

    revalidatePath('/');
    return { 
        success: true, 
        message: 'Questionnaire created successfully!',
        questionnaireId: newQuestionnaire.id,
    };

  } catch (error: any) {
    return {
      success: false,
      message: error.message || 'An unexpected error occurred.',
    };
  }
}

