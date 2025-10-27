'use client';

import type { Questionnaire } from '@/lib/data';
import { useFormState, useFormStatus } from 'react-dom';
import { submitEvaluation } from '@/app/actions';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useForm } from 'react-hook-form';
import { useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Terminal } from 'lucide-react';

type QuestionnaireFormProps = {
  questionnaire: Questionnaire;
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full sm:w-auto">
      {pending ? 'Submitting...' : 'Submit Evaluation'}
    </Button>
  );
}

export function QuestionnaireForm({ questionnaire }: QuestionnaireFormProps) {
  const [state, formAction] = useFormState(submitEvaluation.bind(null, questionnaire.id), { message: '' });
  const form = useForm();
  const { toast } = useToast();

  useEffect(() => {
    if (state.message && state.errors) {
       toast({
        title: 'Validation Error',
        description: state.message,
        variant: 'destructive'
      });
    }
  }, [state, toast]);


  return (
    <form action={formAction} className="space-y-8">
      {state.message && !state.errors && (
         <Alert variant="destructive">
            <Terminal className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
                {state.message}
            </AlertDescription>
         </Alert>
      )}

      {questionnaire.questions.map((question, index) => (
        <fieldset key={question.id} className="space-y-3 p-4 border rounded-lg shadow-sm bg-background">
          <legend className="text-base font-semibold leading-7">
            {index + 1}. {question.text}
          </legend>
          <RadioGroup
            name={question.id}
            required
            className="flex flex-wrap gap-4 pt-2"
          >
            {questionnaire.likertScale.map((option) => (
              <div key={option.value} className="flex items-center space-x-2">
                <RadioGroupItem value={String(option.value)} id={`${question.id}-${option.value}`} />
                <label htmlFor={`${question.id}-${option.value}`} className="font-normal cursor-pointer">
                  {option.label}
                </label>
              </div>
            ))}
          </RadioGroup>
          {state.errors?.[question.id] && (
            <p className="text-sm font-medium text-destructive">{state.errors[question.id]}</p>
          )}
        </fieldset>
      ))}

      <div className="flex justify-end pt-4">
        <SubmitButton />
      </div>
    </form>
  );
}
