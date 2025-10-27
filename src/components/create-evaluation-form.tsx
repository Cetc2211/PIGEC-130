"use client";

import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useFormState } from "react-dom";
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
    severity: z.enum(['Low', 'Mild', 'Moderate', 'High']),
    summary: z.string().min(1, 'Summary is required'),
}).refine(data => data.to >= data.from, {
    message: "To value must be greater than or equal to From value",
    path: ["to"],
});

const formSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  questions: z.array(z.object({ text: z.string().min(1, 'Question text cannot be empty') })).min(1, 'At least one question is required'),
  likertScale: z.array(z.object({ label: z.string().min(1, 'Scale label cannot be empty') })).min(2, 'At least two scale options are required'),
  interpretations: z.array(interpretationSchema).min(1, 'At least one interpretation rule is required'),
});


export function CreateEvaluationForm() {
    const { toast } = useToast();
    const router = useRouter();
    
    const [state, formAction] = useFormState(createQuestionnaireAction, {
        message: "",
        success: false,
    });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      questions: [{ text: "" }],
      likertScale: [{ label: "Not at all" }, { label: "Very much" }],
      interpretations: [
          { from: 0, to: 5, severity: "Low", summary: "" }
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
            title: "Success!",
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
                    <CardTitle>Basic Information</CardTitle>
                    <CardDescription>Give your questionnaire a name and a brief description for your clients.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Name</FormLabel>
                                <FormControl>
                                    <Input placeholder="e.g., Burnout Inventory" {...field} />
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
                                <FormLabel>Description</FormLabel>
                                <FormControl>
                                    <Textarea placeholder="A short description of what this evaluation measures." {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Questions</CardTitle>
                    <CardDescription>Add the questions for your evaluation. You can add as many as you need.</CardDescription>
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
                                        <FormLabel className="flex-shrink-0 mt-2">Q{index + 1}</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Enter the question text" {...field} />
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
                        Add Question
                    </Button>
                </CardContent>
            </Card>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card>
                    <CardHeader>
                        <CardTitle>Rating Scale (Likert)</CardTitle>
                        <CardDescription>Define the labels for your rating scale. Values are assigned automatically.</CardDescription>
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
                                                <Input placeholder={`e.g., '${index === 0 ? 'Not at all' : 'Very much'}'`} {...field} />
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
                            Add Scale Option
                        </Button>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Interpretation Rules</CardTitle>
                        <CardDescription>Define how scores are interpreted. Create ranges and provide a summary for each.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {interpretations.map((field, index) => (
                           <div key={field.id} className="p-4 border rounded-md space-y-4">
                             <div className="flex justify-between items-center">
                               <h4 className="font-medium">Rule {index + 1}</h4>
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
                                            <FormLabel>From Score</FormLabel>
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
                                            <FormLabel>To Score</FormLabel>
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
                                        <FormLabel>Severity</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select severity" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="Low">Low</SelectItem>
                                                <SelectItem value="Mild">Mild</SelectItem>
                                                <SelectItem value="Moderate">Moderate</SelectItem>
                                                <SelectItem value="High">High</SelectItem>
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
                                        <FormLabel>Summary</FormLabel>
                                        <FormControl><Textarea placeholder="Provide an interpretation summary for this score range." {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                               />
                           </div>
                        ))}
                         <Button type="button" variant="outline" size="sm" onClick={() => appendInterpretation({ from: 0, to: 0, severity: "Low", summary: "" })}>
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Add Interpretation Rule
                        </Button>
                    </CardContent>
                </Card>
            </div>
            
            <div className="flex justify-end">
                <Button type="submit">Create Questionnaire</Button>
            </div>
        </form>
    </Form>
  );
}
