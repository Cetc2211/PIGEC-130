
'use client';

import { useActionState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Trash2, Loader2 } from 'lucide-react';
import { deleteAssignmentAction, type DeleteAssignmentState } from '@/app/actions';
import type { Patient, Assignment } from '@/lib/store';

type DeleteAssignmentDialogProps = {
  patient: Patient;
  assignment: Assignment;
  questionnaireName: string;
};

export function DeleteAssignmentDialog({ patient, assignment, questionnaireName }: DeleteAssignmentDialogProps) {
  const { toast } = useToast();
  const [state, formAction, isPending] = useActionState<DeleteAssignmentState, FormData>(deleteAssignmentAction, {
    success: false,
    message: '',
  });

  useEffect(() => {
    if (state.message) {
      if (state.success) {
        toast({
          title: 'Éxito',
          description: state.message,
        });
      } else {
        toast({
          title: 'Error',
          description: state.message,
          variant: 'destructive',
        });
      }
    }
  }, [state, toast]);

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10 hover:text-destructive">
          <Trash2 className="h-4 w-4" />
          <span className="sr-only">Eliminar asignación</span>
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <form action={formAction}>
          <input type="hidden" name="patientId" value={patient.id} />
          <input type="hidden" name="assignmentId" value={assignment.assignmentId} />
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará la evaluación asignada{' '}
              <span className="font-semibold text-foreground">"{questionnaireName}"</span> del expediente de{' '}
              <span className="font-semibold text-foreground">{patient.name}</span>. Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-4">
            <AlertDialogCancel disabled={isPending}>Cancelar</AlertDialogCancel>
            <AlertDialogAction type="submit" disabled={isPending} className="bg-destructive hover:bg-destructive/90 text-destructive-foreground">
              {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
              Sí, eliminar asignación
            </AlertDialogAction>
          </AlertDialogFooter>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  );
}
