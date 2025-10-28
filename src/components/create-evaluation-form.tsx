"use client";

import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useActionState } from "react";
import { createQuestionnaireAction } from "@/app/actions";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PlusCircle, Trash2, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";


const interpretationSchema = z.object({
    from: z.coerce.number().min(0),
    to: z.coerce.number().min(0),
    severity: z.enum(['Baja', 'Leve', 'Moderada', 'Alta']),
    summary: z.string().min(1, 'El resumen es obligatorio'),
}).refine(data => data.to >= data.from, {
    message: "El valor 'Hasta' debe ser mayor o igual que el valor 'Desde'",
    path: ["to"],
});

const formSchema = z.object({
  name: z.string().min(3, 'El nombre debe tener al menos 3 caracteres'),
  description: z.string().min(10, 'La descripción debe tener al menos 10 caracteres'),
  questions: z.array(z.object({ text: z.string().min(1, 'El texto de la pregunta no puede estar vacío') })).min(1, 'Se requiere al menos una pregunta'),
  likertScale: z.array(z.object({ label: z.string().min(1, 'La etiqueta de la escala no puede estar vacía') })).min(2, 'Se requieren al menos dos opciones de escala'),
  interpretations: z.array(interpretationSchema).min(1, 'Se requiere al menos una regla de interpretación'),
});


export function CreateEvaluationForm() {
    const { toast } = useToast();
    const router = useRouter();
    
    const [state, formAction] = useActionState(createQuestionnaireAction, {
        message: "",
        success: false,
    });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      questions: [{ text: "" }],
      likertScale: [{ label: "Para nada" }, { label: "Muchísimo" }],
      interpretations: [
          { from: 0, to: 5, severity: "Baja", summary: "" }
      ],
    },
  });

  const { fields: questions, append: appendQuestion, remove: removeQuestion } = useFieldArray({
    control: form.control,
    name: "questions",
  });

  const { fields: likertScale, append: appendScale, remove: removeScale } = useFieldArray({
    control: form.control,
    name: "likertScale",
  });

  const { fields: interpretations, append: appendInterpretation, remove: removeInterpretation } = useFieldArray({
    control: form.control,
    name: "interpretations",
  });

  useEffect(() => {
    if (state.success) {
        toast({
            title: "¡Éxito!",
            description: state.message,
        });
        if (state.questionnaireId) {
            router.push('/');
        }
    } else if (state.message && !state.success) {
        toast({
            title: "Error",
            description: state.message,
            variant: "destructive"
        })
    }
  }, [state, router, toast]);

  function onSubmit(values: z.infer<typeof formSchema>) {
    const formData = new FormData();
    const valuedLikertScale = values.likertScale.map((s, i) => ({...s, value: i}));
    const data = {...values, likertScale: valuedLikertScale };
    formData.append('jsonData', JSON.stringify(data));
    formAction(formData);
  }

  return (
    <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            {state.message && !state.success && (
                <Alert variant="destructive">
                    <X className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>
                        {state.message}
                    </AlertDescription>
                </Alert>
            )}

            <Card>
                <CardHeader>
                    <CardTitle>Información Básica</CardTitle>
                    <CardDescription>Dale a tu cuestionario un nombre y una breve descripción para tus clientes.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Nombre</FormLabel>
                                <FormControl>
                                    <Input placeholder="p.ej., Inventario de Burnout" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Descripción</FormLabel>
                                <FormControl>
                                    <Textarea placeholder="Una breve descripción de lo que mide esta evaluación." {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Preguntas</CardTitle>
                    <CardDescription>Añade las preguntas para tu evaluación. Puedes añadir tantas como necesites.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {questions.map((field, index) => (
                        <FormField
                            key={field.id}
                            control={form.control}
                            name={`questions.${index}.text`}
                            render={({ field }) => (
                                <FormItem>
                                    <div className="flex items-center gap-2">
                                        <FormLabel className="flex-shrink-0 mt-2">P{index + 1}</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Introduce el texto de la pregunta" {...field} />
                                        </FormControl>
                                        <Button type="button" variant="ghost" size="icon" onClick={() => removeQuestion(index)} disabled={questions.length <= 1}>
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    ))}
                    <Button type="button" variant="outline" size="sm" onClick={() => appendQuestion({ text: "" })}>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Añadir Pregunta
                    </Button>
                </CardContent>
            </Card>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card>
                    <CardHeader>
                        <CardTitle>Escala de Calificación (Likert)</CardTitle>
                        <CardDescription>Define las etiquetas para tu escala de calificación. Los valores se asignan automáticamente.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                         {likertScale.map((field, index) => (
                            <FormField
                                key={field.id}
                                control={form.control}
                                name={`likertScale.${index}.label`}
                                render={({ field }) => (
                                    <FormItem>
                                        <div className="flex items-center gap-2">
                                            <FormLabel className="mt-2">{index}</FormLabel>
                                            <FormControl>
                                                <Input placeholder={`p.ej., '${index === 0 ? 'Para nada' : 'Muchísimo'}`} {...field} />
                                            </FormControl>
                                            <Button type="button" variant="ghost" size="icon" onClick={() => removeScale(index)} disabled={likertScale.length <= 2}>
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        ))}
                        <Button type="button" variant="outline" size="sm" onClick={() => appendScale({ label: "" })}>
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Añadir Opción de Escala
                        </Button>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Reglas de Interpretación</CardTitle>
                        <CardDescription>Define cómo se interpretan las puntuaciones. Crea rangos y proporciona un resumen para cada uno.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {interpretations.map((field, index) => (
                           <div key={field.id} className="p-4 border rounded-md space-y-4">
                             <div className="flex justify-between items-center">
                               <h4 className="font-medium">Regla {index + 1}</h4>
                               <Button type="button" variant="ghost" size="icon" onClick={() => removeInterpretation(index)} disabled={interpretations.length <= 1}>
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                             </div>
                             <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name={`interpretations.${index}.from`}
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Puntuación Desde</FormLabel>
                                            <FormControl><Input type="number" {...field} /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name={`interpretations.${index}.to`}
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Puntuación Hasta</FormLabel>
                                            <FormControl><Input type="number" {...field} /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                             </div>
                             <FormField
                                control={form.control}
                                name={`interpretations.${index}.severity`}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Severidad</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Selecciona severidad" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="Baja">Baja</SelectItem>
                                                <SelectItem value="Leve">Leve</SelectItem>
                                                <SelectItem value="Moderada">Moderada</SelectItem>
                                                <SelectItem value="Alta">Alta</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                               />
                             <FormField
                                control={form.control}
                                name={`interpretations.${index}.summary`}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Resumen</FormLabel>
                                        <FormControl><Textarea placeholder="Proporciona un resumen de interpretación para este rango de puntuación." {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                               />
                           </div>
                        ))}
                         <Button type="button" variant="outline" size="sm" onClick={() => appendInterpretation({ from: 0, to: 0, severity: "Baja", summary: "" })}>
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Añadir Regla de Interpretación
                        </Button>
                    </CardContent>
                </Card>
            </div>
            
            <div className="flex justify-end">
                <Button type="submit">Crear Cuestionario</Button>
            </div>
        </form>
    </Form>
  );
}
