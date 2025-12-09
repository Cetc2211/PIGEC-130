'use client';

import { useActionState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { importResultAction, type ImportResultState } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { SidebarTriggerButton } from '@/components/sidebar-trigger-button';
import { Import, Loader2 } from 'lucide-react';


const importSchema = z.object({
  resultCode: z.string().min(20, 'El código parece demasiado corto. Asegúrate de copiarlo completo.'),
});

export default function ImportPage() {
  const { toast } = useToast();
  const [state, formAction, isPending] = useActionState<ImportResultState, FormData>(importResultAction, {
    success: false,
    message: '',
  });

  const form = useForm<z.infer<typeof importSchema>>({
    resolver: zodResolver(importSchema),
    defaultValues: {
      resultCode: '',
    },
  });

  useEffect(() => {
    if (!state.message) return;
    if (state.success) {
      toast({
        title: '¡Éxito!',
        description: state.message,
      });
      form.reset();
    } else {
      toast({
        title: 'Error al Importar',
        description: state.message,
        variant: 'destructive',
      });
    }
  }, [state, toast, form]);


  return (
    <div className="flex flex-col h-full">
       <header className="p-4 sm:p-6 border-b flex items-center gap-4">
        <SidebarTriggerButton />
        <div>
          <h1 className="font-headline text-2xl sm:text-3xl font-bold tracking-tight">
            Importar Resultados de Evaluación
          </h1>
          <p className="text-muted-foreground mt-1">
            Pega aquí el código que te envió el paciente para integrar sus resultados al expediente.
          </p>
        </div>
      </header>
      <main className="flex-1 overflow-auto p-4 sm:p-6">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>Procesar Código de Resultados</CardTitle>
            <CardDescription>
                Pega el código de texto completo que recibiste del paciente en el siguiente campo y haz clic en "Importar".
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form action={formAction} className="space-y-6">
                <FormField
                  control={form.control}
                  name="resultCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Código de Resultados</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Pega aquí el código alfanumérico largo que te envió el paciente..."
                          className="min-h-[150px] font-mono text-xs"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <div className="flex justify-end">
                    <Button type="submit" disabled={isPending}>
                        {isPending ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                            <Import className="mr-2 h-4 w-4" />
                        )}
                        Importar Resultados
                    </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
