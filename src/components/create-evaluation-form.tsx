"use client";

import { useForm, useFieldArray, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useActionState, useState, useTransition } from "react";
import { createQuestionnaireAction, processPdfAction } from "@/app/actions";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PlusCircle, Trash2, X, FileUp, Loader2, Wand2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";


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


function PdfUploader({ onDataLoaded, onError }: { onDataLoaded: (data: any) => void, onError: (error: string) => void }) {
    const [isPending, startTransition] = useTransition();
    const [fileName, setFileName] = useState('');

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setFileName(file.name);
            const formData = new FormData();
            formData.append('pdf', file);
            startTransition(async () => {
                const result = await processPdfAction(formData);
                if (result.success) {
                    onDataLoaded(result.data);
                } else {
                    onError(result.error || 'Ocurrió un error desconocido.');
                }
            });
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Importar desde PDF</CardTitle>
                <CardDescription>Sube un archivo PDF y la IA extraerá la estructura del cuestionario por ti.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex items-center justify-center w-full">
                    <label htmlFor="dropzone-file" className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer bg-muted/50 hover:bg-muted/80">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <FileUp className="w-8 h-8 mb-4 text-muted-foreground" />
                            {isPending ? (
                                <>
                                    <Loader2 className="w-6 h-6 animate-spin text-primary" />
                                    <p className="mt-2 text-sm text-muted-foreground">Procesando PDF...</p>
                                </>
                            ) : (
                                <>
                                    <p className="mb-2 text-sm text-center text-muted-foreground">
                                        <span className="font-semibold">Haz clic para subir</span> o arrastra y suelta
                                    </p>
                                    <p className="text-xs text-muted-foreground">PDF (MAX. 5MB)</p>
                                    {fileName && <p className="text-xs text-primary mt-2">{fileName}</p>}
                                </>
                            )}
                        </div>
                        <input id="dropzone-file" type="file" className="hidden" onChange={handleFileChange} accept="application/pdf" disabled={isPending} />
                    </label>
                </div>
            </CardContent>
        </Card>
    );
}

export function CreateEvaluationForm() {
    const { toast } = useToast();
    const router = useRouter();
    
    const [state, formAction] = useActionState(createQuestionnaireAction, {
        message: "",
        success: false,
    });
    
    const [pdfError, setPdfError] = useState<string | null>(null);

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

    const { fields: questions, append: appendQuestion, remove: removeQuestion, replace: replaceQuestions } = useFieldArray({ control: form.control, name: "questions" });
    const { fields: likertScale, append: appendScale, remove: removeScale, replace: replaceLikertScale } = useFieldArray({ control: form.control, name: "likertScale" });
    const { fields: interpretations, append: appendInterpretation, remove: removeInterpretation, replace: replaceInterpretations } = useFieldArray({ control: form.control, name: "interpretations" });

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
    
    const handlePdfData = (data: any) => {
        setPdfError(null);
        form.reset({
            name: data.name || '',
            description: data.description || '',
            questions: data.questions.length > 0 ? data.questions : [{ text: '' }],
            likertScale: data.likertScale.length > 0 ? data.likertScale : [{label: ''}],
            interpretations: data.interpretations.length > 0 ? data.interpretations : [{ from: 0, to: 0, severity: 'Baja', summary: '' }],
        });
        toast({
            title: "¡PDF Procesado!",
            description: "El formulario ha sido rellenado con los datos del PDF. Revisa y ajusta si es necesario.",
        });
    };

    const handlePdfError = (error: string) => {
        setPdfError(error);
    }

    function onSubmit(values: z.infer<typeof formSchema>) {
        const formData = new FormData();
        const valuedLikertScale = values.likertScale.map((s, i) => ({...s, value: i}));
        const data = {...values, likertScale: valuedLikertScale };
        formData.append('jsonData', JSON.stringify(data));
        formAction(formData);
    }

    return (
        <Tabs defaultValue="manual" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="manual">Creación Manual</TabsTrigger>
                <TabsTrigger value="pdf"><Wand2 className="mr-2" /> Importar desde PDF</TabsTrigger>
            </TabsList>
            <TabsContent value="pdf" className="mt-6">
                {pdfError && (
                    <Alert variant="destructive" className="mb-4">
                        <X className="h-4 w-4" />
                        <AlertTitle>Error al Procesar PDF</AlertTitle>
                        <AlertDescription>{pdfError}</AlertDescription>
                    </Alert>
                )}
                <PdfUploader onDataLoaded={handlePdfData} onError={handlePdfError} />
                 <p className="text-xs text-muted-foreground text-center mt-4">
                    La importación con IA funciona mejor con PDFs que tienen una estructura clara: un título, una descripción, preguntas numeradas, opciones de respuesta consistentes y una tabla o sección de interpretación de puntuaciones.
                </p>
            </TabsContent>

            <TabsContent value="manual" className="mt-6">
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
            </TabsContent>
        </Tabs>
    );
}