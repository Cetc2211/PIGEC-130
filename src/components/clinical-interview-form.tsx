'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useActionState, useEffect } from 'react';
import { Loader2, Save, AlertCircle, User, History, Syringe, Files, School, HeartPulse, BrainCircuit, Users } from 'lucide-react';
import type { Patient } from '@/lib/store';
import { saveClinicalInterviewAction } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';

import { Button } from '@/components/ui/button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Label } from './ui/label';

// Corresponde a la nueva estructura de dSIE.ts
const interviewSchema = z.object({
  patientId: z.string(),
  motivoConsulta: z.string().min(10, 'El motivo de consulta es demasiado corto.'),
  expectativasTratamiento: z.string().min(10, 'Las expectativas son demasiado cortas.'),
  riesgoSuicidaActivo: z.boolean().default(false),
  crisisPsicotica: z.boolean().default(false),
  historiaEnfermedadActual: z.string().min(20, 'La historia de la enfermedad es demasiado corta.'),
  ansiedadDominante: z.boolean().default(false),
  depresionDominante: z.boolean().default(false),
  disociacion: z.boolean().default(false),
  controlImpulsos: z.boolean().default(false),
  complicacionesPrenatales: z.boolean().default(false),
  hitosDesarrolloRetrasados: z.boolean().default(false),
  dinamicaFamiliarNuclear: z.string().min(10, 'La descripción de la dinámica familiar es demasiado corta.'),
  desarrolloSexual: z.string().optional(),
  escolaridadProblemas: z.boolean().default(false),
  relacionesInterpersonales: z.string().min(10, 'La descripción de las relaciones es demasiado corta.'),
  traumaInfancia: z.boolean().default(false),
  afeccionMedicaCronica: z.string().optional(),
  consumoSustanciasActual: z.string().optional(),
  impresionDiagnosticoDiferencial: z.string().optional(),
});


type ClinicalInterviewFormProps = {
  patient: Patient;
};

export function ClinicalInterviewForm({ patient }: ClinicalInterviewFormProps) {
  const { toast } = useToast();
  const [state, formAction, isPending] = useActionState(saveClinicalInterviewAction, {
    success: false,
    message: '',
  });

  const form = useForm<z.infer<typeof interviewSchema>>({
    resolver: zodResolver(interviewSchema),
    defaultValues: {
      patientId: patient.id,
      motivoConsulta: '',
      expectativasTratamiento: '',
      riesgoSuicidaActivo: false,
      crisisPsicotica: false,
      historiaEnfermedadActual: '',
      ansiedadDominante: false,
      depresionDominante: false,
      disociacion: false,
      controlImpulsos: false,
      complicacionesPrenatales: false,
      hitosDesarrolloRetrasados: false,
      dinamicaFamiliarNuclear: '',
      desarrolloSexual: '',
      escolaridadProblemas: false,
      relacionesInterpersonales: '',
      traumaInfancia: false,
      afeccionMedicaCronica: '',
      consumoSustanciasActual: '',
      impresionDiagnosticoDiferencial: '',
    },
  });
  
  useEffect(() => {
    if (state.message) {
        if (state.success) {
            toast({
                title: "Éxito",
                description: state.message,
            });
        } else {
            toast({
                title: "Error de Validación",
                description: state.message,
                variant: 'destructive'
            });
        }
    }
  }, [state, toast]);

  return (
    <Card>
        <CardHeader>
            <CardTitle>Entrevista Clínica Psicológica Aplicada (ECPA)</CardTitle>
            <CardDescription>Formato semi-estructurado para la recolección de información clínica esencial del paciente.</CardDescription>
        </CardHeader>
        <CardContent>
            <Form {...form}>
                <form action={formAction} className="space-y-8">
                    <input type="hidden" {...form.register('patientId')} />
                    <Accordion type="multiple" defaultValue={['item-1', 'item-2', 'item-3', 'item-4', 'item-5']} className="w-full">
                        
                        <AccordionItem value="item-1">
                            <AccordionTrigger className='font-semibold'><User className="mr-2" /> Fase I: Motivo de Consulta y Expectativas</AccordionTrigger>
                            <AccordionContent className="space-y-4 pt-4">
                                <FormField control={form.control} name="motivoConsulta" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Motivo de Consulta</FormLabel>
                                        <FormControl><Textarea placeholder="Describe la razón principal por la que el paciente busca ayuda..." {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}/>
                                <FormField control={form.control} name="expectativasTratamiento" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Expectativas del Tratamiento</FormLabel>
                                        <FormControl><Textarea placeholder="¿Qué espera lograr el paciente con la terapia?" {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}/>
                            </AccordionContent>
                        </AccordionItem>

                        <AccordionItem value="item-2">
                             <AccordionTrigger className='font-semibold'><AlertCircle className="mr-2 text-destructive" /> Fase II: Triage de Seguridad y Gravedad</AccordionTrigger>
                            <AccordionContent className="space-y-4 pt-4">
                               <FormField control={form.control} name="riesgoSuicidaActivo" render={({ field }) => (
                                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                                        <div className="space-y-0.5">
                                            <FormLabel>Riesgo Suicida Activo</FormLabel>
                                            <FormDescription>¿Hay ideación, planes o intento reciente?</FormDescription>
                                        </div>
                                        <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                                    </FormItem>
                                )}/>
                                <FormField control={form.control} name="crisisPsicotica" render={({ field }) => (
                                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                                        <div className="space-y-0.5">
                                            <FormLabel>Crisis Psicótica</FormLabel>
                                            <FormDescription>¿Hay alucinaciones/delirios agudos que requieran contención?</FormDescription>
                                        </div>
                                        <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                                    </FormItem>
                                )}/>
                            </AccordionContent>
                        </AccordionItem>
                        
                        <AccordionItem value="item-3">
                             <AccordionTrigger className='font-semibold'><History className="mr-2" /> Fase III: Historia Clínica y Desarrollo (ECPA)</AccordionTrigger>
                            <AccordionContent className="space-y-6 pt-4">
                                 <FormField control={form.control} name="historiaEnfermedadActual" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Historia de la Enfermedad Actual (HMA)</FormLabel>
                                        <FormControl><Textarea placeholder="Inicio de los síntomas, evolución, factores desencadenantes y de mantenimiento..." {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}/>
                                 <div>
                                    <FormLabel>Dimensiones Sintomáticas Predominantes</FormLabel>
                                    <div className="grid grid-cols-2 gap-4 mt-2">
                                        <FormField control={form.control} name="ansiedadDominante" render={({ field }) => (
                                            <FormItem className="flex items-center space-x-2"><FormControl><Switch checked={field.value} onCheckedChange={field.onChange} id="ansiedadDominante" /></FormControl><Label htmlFor="ansiedadDominante">Ansiedad</Label></FormItem>
                                        )}/>
                                        <FormField control={form.control} name="depresionDominante" render={({ field }) => (
                                            <FormItem className="flex items-center space-x-2"><FormControl><Switch checked={field.value} onCheckedChange={field.onChange} id="depresionDominante"/></FormControl><Label htmlFor="depresionDominante">Depresión</Label></FormItem>
                                        )}/>
                                        <FormField control={form.control} name="disociacion" render={({ field }) => (
                                            <FormItem className="flex items-center space-x-2"><FormControl><Switch checked={field.value} onCheckedChange={field.onChange} id="disociacion"/></FormControl><Label htmlFor="disociacion">Disociación</Label></FormItem>
                                        )}/>
                                        <FormField control={form.control} name="controlImpulsos" render={({ field }) => (
                                            <FormItem className="flex items-center space-x-2"><FormControl><Switch checked={field.value} onCheckedChange={field.onChange} id="controlImpulsos"/></FormControl><Label htmlFor="controlImpulsos">Control de Impulsos</Label></FormItem>
                                        )}/>
                                    </div>
                                 </div>
                                  <div className="space-y-4 pt-4 border-t mt-4">
                                    <h4 className="font-medium text-sm text-muted-foreground flex items-center"><BrainCircuit className="mr-2 h-4 w-4" /> Antecedentes del Desarrollo</h4>
                                     <FormField control={form.control} name="dinamicaFamiliarNuclear" render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Dinámica Familiar Nuclear</FormLabel>
                                            <FormControl><Textarea placeholder="Relaciones con padres, hermanos, si hay apoyo explícito, conflictos..." {...field} /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}/>
                                    <FormField control={form.control} name="relacionesInterpersonales" render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Relaciones Interpersonales (Pares)</FormLabel>
                                            <FormControl><Textarea placeholder="Calidad de los vínculos con amigos, pareja, si hay aislamiento..." {...field} /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}/>
                                    <FormField control={form.control} name="desarrolloSexual" render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Historia del Desarrollo Sexual</FormLabel>
                                            <FormControl><Textarea placeholder="Inicio de la vida sexual, orientación, identidad, relaciones significativas, dificultades..." {...field} /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}/>
                                     <div className="grid grid-cols-2 gap-4">
                                        <FormField control={form.control} name="complicacionesPrenatales" render={({ field }) => (
                                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm"><FormLabel>Complicaciones Prenatales</FormLabel><FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl></FormItem>
                                        )}/>
                                         <FormField control={form.control} name="hitosDesarrolloRetrasados" render={({ field }) => (
                                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm"><FormLabel>Retrasos en Hitos del Desarrollo</FormLabel><FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl></FormItem>
                                        )}/>
                                        <FormField control={form.control} name="traumaInfancia" render={({ field }) => (
                                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm"><FormLabel>Trauma en la Infancia (EAI)</FormLabel><FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl></FormItem>
                                        )}/>
                                         <FormField control={form.control} name="escolaridadProblemas" render={({ field }) => (
                                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm"><FormLabel>Problemas de Escolaridad</FormLabel><FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl></FormItem>
                                        )}/>
                                     </div>
                                  </div>
                            </AccordionContent>
                        </AccordionItem>
                        
                        <AccordionItem value="item-4">
                             <AccordionTrigger className='font-semibold'><HeartPulse className="mr-2" /> Fase IV: Etiología, Contexto y Comorbilidad</AccordionTrigger>
                            <AccordionContent className="space-y-4 pt-4">
                                <FormField control={form.control} name="afeccionMedicaCronica" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Afección Médica Crónica Relevante</FormLabel>
                                        <FormControl><Input placeholder="Ej: Hipotiroidismo, Diabetes, Asma" {...field} /></FormControl>
                                        <FormDescription>Dejar en blanco si no aplica.</FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}/>
                                 <FormField control={form.control} name="consumoSustanciasActual" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Consumo Actual de Sustancias</FormLabel>
                                        <FormControl><Input placeholder="Ej: Alcohol (moderado), Marihuana (ocasional)" {...field} /></FormControl>
                                        <FormDescription>Dejar en blanco si no aplica.</FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}/>
                            </AccordionContent>
                        </AccordionItem>
                        
                        <AccordionItem value="item-5">
                             <AccordionTrigger className='font-semibold'><Files className="mr-2" /> Fase V: Impresión Diagnóstica del Clínico</AccordionTrigger>
                            <AccordionContent className="space-y-4 pt-4">
                                  <FormField control={form.control} name="impresionDiagnosticoDiferencial" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Hipótesis de Diagnóstico Diferencial</FormLabel>
                                        <FormControl><Textarea placeholder="Ej: Se descarta Trastorno de Pánico por ausencia de crisis inesperadas. Se debe diferenciar de Trastorno de Adaptación..." {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}/>
                            </AccordionContent>
                        </AccordionItem>

                    </Accordion>
                    <div className="flex justify-end pt-8">
                        <Button type="submit" disabled={isPending}>
                            {isPending ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                                <Save className="mr-2 h-4 w-4" />
                            )}
                            Guardar Entrevista
                        </Button>
                    </div>
                </form>
            </Form>
        </CardContent>
    </Card>
  );
}
