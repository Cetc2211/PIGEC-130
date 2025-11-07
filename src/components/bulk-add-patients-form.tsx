'use client';

import { useActionState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2 } from 'lucide-react';

import { bulkAddPatientsAction } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';

const bulkAddPatientsSchema = z.object({
  semester: z.string().min(1, 'El semestre es obligatorio.'),
  group: z.string().min(1, 'El grupo es obligatorio.'),
  names: z.string().min(3, 'Debes pegar al menos un nombre en la lista.'),
});

type BulkAddPatientsFormProps = {
  onFinished: () => void;
};

export function BulkAddPatientsForm({ onFinished }: BulkAddPatientsFormProps) {
  const { toast } = useToast();
  const [state, formAction, isPending] = useActionState(bulkAddPatientsAction, {
    success: false,
    message: '',
  });

  const form = useForm<z.infer<typeof bulkAddPatientsSchema>>({
    resolver: zodResolver(bulkAddPatientsSchema),
    defaultValues: {
      semester: '',
      group: '',
      names: '',
    },
  });

  useEffect(() => {
    if (state.success) {
      toast({
        title: '¡Éxito!',
        description: state.message,
      });
      onFinished();
      form.reset();
    } else if (state.message && !state.success) {
      toast({
        title: 'Error',
        description: state.message,
        variant: 'destructive',
      });
    }
  }, [state, onFinished, toast, form]);
  
  return (
    <Form {...form}>
      <form action={formAction} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="semester"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Semestre</FormLabel>
                <FormControl>
                  <Input placeholder="p.ej., 1" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="group"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Grupo</FormLabel>
                <FormControl>
                  <Input placeholder="p.ej., A" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="names"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Lista de Nombres de Estudiantes</FormLabel>
              <FormControl>
                <Textarea 
                    placeholder="Pega aquí la lista de nombres, un nombre por cada línea." 
                    className="min-h-[150px]"
                    {...field}
                />
              </FormControl>
               <FormDescription>
                Copia y pega una columna de nombres desde una hoja de cálculo o un documento de texto.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end">
          <Button type="submit" disabled={isPending}>
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Añadir Estudiantes
          </Button>
        </div>
      </form>
    </Form>
  );
}
