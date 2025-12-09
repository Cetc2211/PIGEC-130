'use client';

import type { Questionnaire, Question } from '@/lib/data';
import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { submitEvaluation } from '@/app/actions';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/hooks/use-toast';
import { useEffect } from 'react';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Terminal } from 'lucide-react';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';

type QuestionnaireFormProps = {
  questionnaire: Questionnaire;
  patientId?: string;
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full sm:w-auto">
      {pending ? 'Enviando...' : 'Enviar Evaluación'}
    </Button>
  );
}

function LikertOptions({ question }: { question: Question }) {
    // Determina si usar las opciones específicas de la pregunta o la escala global del cuestionario.
    const options = question.options || [];

    return (
        <RadioGroup
            name={question.id}
            required
            className="flex flex-wrap gap-4 pt-2"
        >
            {options.map((option) => (
                <div key={option.value} className="flex items-center space-x-2">
                    <RadioGroupItem value={String(option.value)} id={`${question.id}-${option.value}`} />
                    <Label htmlFor={`${question.id}-${option.value}`} className="font-normal cursor-pointer">
                        {option.label}
                    </Label>
                </div>
            ))}
        </RadioGroup>
    );
}

export function QuestionnaireForm({ questionnaire, patientId }: QuestionnaireFormProps) {
  const submitEvaluationWithContext = submitEvaluation.bind(null, questionnaire.id, patientId || null);
  const [state, formAction] = useActionState(submitEvaluationWithContext, { message: '' });
  const { toast } = useToast();

  useEffect(() => {
    if (state.message && state.errors) {
       toast({
        title: 'Error de Validación',
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

      {questionnaire.questions.map((question, index) => {
        const options = question.options || questionnaire.likertScale;
        return (
          <fieldset key={question.id} className="space-y-3 p-4 border rounded-lg shadow-sm bg-background">
            <legend className="text-base font-semibold leading-7">
              {index + 1}. {question.text}
            </legend>
            
            {question.type === 'likert' ? (
              <RadioGroup
                  name={question.id}
                  required
                  className="flex flex-wrap gap-4 pt-2"
                >
                  {options.map((option) => (
                    <div key={option.value} className="flex items-center space-x-2">
                      <RadioGroupItem value={String(option.value)} id={`${question.id}-${option.value}`} />
                      <Label htmlFor={`${question.id}-${option.value}`} className="font-normal cursor-pointer">
                        {option.label}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
            ) : (
              <div className="pt-2">
                   <Label htmlFor={question.id} className="sr-only">Respuesta</Label>
                   <Textarea 
                      id={question.id}
                      name={question.id}
                      required 
                      placeholder="Escribe tu respuesta aquí..."
                      className="min-h-[100px]"
                  />
              </div>
            )}

            {state.errors?.[question.id] && (
              <p className="text-sm font-medium text-destructive">{state.errors[question.id]}</p>
            )}
          </fieldset>
        )
      })}

      <div className="flex justify-end pt-4">
        <SubmitButton />
      </div>
    </form>
  );
}
