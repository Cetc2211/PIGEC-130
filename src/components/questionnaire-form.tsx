'use client';

import type { Questionnaire, Question, QuestionnaireSection } from '@/lib/data';
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
import { Separator } from './ui/separator';

type QuestionnaireFormProps = {
  questionnaire: Questionnaire;
  patientId?: string;
  isRemote?: boolean;
  intermediateResults?: string;
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full sm:w-auto">
      {pending ? 'Enviando...' : 'Enviar y Continuar'}
    </Button>
  );
}

function QuestionField({ question, options, error }: { question: Question, options: any[], error?: string[] }) {
    return (
      <fieldset key={question.id} className="space-y-3 p-4 border rounded-lg shadow-sm bg-background">
        <legend className="text-base font-semibold leading-7">
           {question.text}
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

        {error && (
          <p className="text-sm font-medium text-destructive">{error}</p>
        )}
      </fieldset>
    )
}

export function QuestionnaireForm({ questionnaire, patientId, isRemote = false, intermediateResults }: QuestionnaireFormProps) {
  const submitEvaluationWithContext = submitEvaluation.bind(null, questionnaire.id, patientId || null, isRemote);
  const [state, formAction] = useActionState(submitEvaluationWithContext, { message: '', intermediateResults });
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

      {/* Hidden input to pass intermediate results */}
      {intermediateResults && (
        <input type="hidden" name="intermediateResults" value={intermediateResults} />
      )}

      {questionnaire.sections.map((section, sectionIndex) => (
        <div key={section.sectionId} className='space-y-6'>
            {questionnaire.sections.length > 1 && (
                <div className="mt-8 mb-4">
                    <h2 className="text-xl font-bold font-headline">{section.name}</h2>
                    {section.instructions && <p className="text-muted-foreground">{section.instructions}</p>}
                    <Separator className="mt-2" />
                </div>
            )}
            
            {section.questions.map((question, questionIndex) => {
                const options = question.options || section.likertScale;
                const questionNumber = questionnaire.sections.slice(0, sectionIndex).reduce((acc, sec) => acc + sec.questions.length, 0) + questionIndex + 1;
                const questionTextWithNumber = `${questionNumber}. ${question.text}`;

                return <QuestionField 
                    key={question.id} 
                    question={{...question, text: questionTextWithNumber}} 
                    options={options} 
                    error={state.errors?.[question.id]}
                />
            })}
        </div>
      ))}

      <div className="flex justify-end pt-4">
        <SubmitButton />
      </div>
    </form>
  );
}
