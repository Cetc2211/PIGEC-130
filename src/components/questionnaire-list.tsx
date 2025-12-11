"use client";

import type { Questionnaire } from "@/lib/data";
import { useState, useMemo, useTransition } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Eye, Folder, FolderOpen, Plus, Search, User, Loader2, Link as LinkIcon, CheckSquare, Square } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './ui/accordion';
import type { Patient } from '@/lib/store';
import { ScrollArea } from './ui/scroll-area';
import { assignQuestionnairesAction } from '@/app/actions';

type AssignEvaluationDialogProps = {
    questionnaires: Questionnaire[];
    patients: Patient[];
    onClose: () => void;
};

function AssignEvaluationDialog({ questionnaires, patients, onClose }: AssignEvaluationDialogProps) {
    const { toast } = useToast();
    const [isPending, startTransition] = useTransition();
    
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
    const [selectedQuestionnaires, setSelectedQuestionnaires] = useState<Set<string>>(new Set());

    const filteredPatients = useMemo(() => {
        if (!searchTerm) return patients;
        return patients.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));
    }, [patients, searchTerm]);

    const toggleQuestionnaire = (id: string) => {
        setSelectedQuestionnaires(prev => {
            const newSet = new Set(prev);
            if (newSet.has(id)) {
                newSet.delete(id);
            } else {
                newSet.add(id);
            }
            return newSet;
        });
    };

    const handleSubmitAndShare = async () => {
        if (!selectedPatient || selectedQuestionnaires.size === 0) {
          toast({ title: 'Error', description: 'Selecciona un paciente y al menos un cuestionario.', variant: 'destructive' });
          return;
        };
        
        startTransition(async () => {
            const formData = new FormData();
            formData.append('patientId', selectedPatient.id);
            selectedQuestionnaires.forEach(id => formData.append('questionnaireIds', id));
            formData.append('baseUrl', window.location.origin);
            
            const result = await assignQuestionnairesAction({ success: false, message: '' }, formData);
        
            if (result.success && result.evaluationUrl) {
                const patientPhone = selectedPatient.mobilePhone;
                const message = `Hola ${selectedPatient.name.split(' ')[0]}, por favor completa la siguiente evaluación psicológica: ${result.evaluationUrl}`;
                
                if (patientPhone) {
                    const whatsappUrl = `https://wa.me/${patientPhone.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
                    window.open(whatsappUrl, '_blank');
                    toast({
                        title: "Abriendo WhatsApp...",
                        description: `Se está abriendo una conversación con ${selectedPatient.name}.`,
                    });
                } else {
                     toast({
                        title: "Asignación Exitosa",
                        description: "Las pruebas se asignaron. No se encontró un número para enviar por WhatsApp. Copia el enlace manualmente si es necesario.",
                    });
                }
                onClose();
            } else {
                toast({
                    title: "Error al Asignar",
                    description: result.message,
                    variant: "destructive",
                });
            }
        });
    };

    return (
        <Dialog open={true} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-3xl">
                <DialogHeader>
                    <DialogTitle className="font-headline">Asignar y/o Compartir Evaluaciones</DialogTitle>
                    <DialogDescription>
                        Selecciona las pruebas, busca y elige un paciente para asignar las pruebas a su expediente o compartir un enlace remoto.
                    </DialogDescription>
                </DialogHeader>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
                    {/* Questionnaire Selection */}
                    <div className='flex flex-col gap-4'>
                       <h4 className="font-semibold text-foreground">1. Seleccionar Pruebas</h4>
                       <ScrollArea className="h-[250px] border rounded-md">
                            <div className="p-2 space-y-1">
                                {questionnaires.map(q => (
                                    <button
                                        type="button"
                                        key={q.id}
                                        onClick={() => toggleQuestionnaire(q.id)}
                                        className="w-full text-left p-2 rounded-md transition-colors flex items-center gap-3 hover:bg-muted"
                                    >
                                        {selectedQuestionnaires.has(q.id) ? 
                                            <CheckSquare className="h-5 w-5 text-primary" /> : 
                                            <Square className="h-5 w-5 text-muted-foreground" />
                                        }
                                        <div className="flex flex-col">
                                            <span className="text-sm font-medium">{q.name}</span>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </ScrollArea>
                    </div>
                    
                    {/* Patient Selection */}
                    <div className="flex flex-col gap-4">
                        <h4 className="font-semibold text-foreground">2. Seleccionar Paciente</h4>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Buscar paciente por nombre..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                        <ScrollArea className="h-[200px] border rounded-md">
                            <div className="p-2 space-y-1">
                                {filteredPatients.length > 0 ? (
                                    filteredPatients.map(patient => (
                                        <button
                                            type="button"
                                            key={patient.id}
                                            onClick={() => setSelectedPatient(patient)}
                                            className={`w-full text-left p-2 rounded-md transition-colors flex items-center gap-3 ${selectedPatient?.id === patient.id ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}
                                        >
                                            <User className="h-4 w-4" />
                                            <div className="flex flex-col">
                                                <span className="text-sm font-medium">{patient.name}</span>
                                                <span className={`text-xs ${selectedPatient?.id === patient.id ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>{patient.recordId}</span>
                                            </div>
                                        </button>
                                    ))
                                ) : (
                                    <p className="text-sm text-muted-foreground text-center p-4">No se encontraron pacientes.</p>
                                )}
                            </div>
                        </ScrollArea>
                    </div>
                </div>
                
                <DialogFooter className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <Button type="button" variant="outline" onClick={onClose} disabled={isPending}>Cancelar</Button>
                    <Button type="button" onClick={handleSubmitAndShare} disabled={!selectedPatient || selectedQuestionnaires.size === 0 || isPending}>
                        {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <LinkIcon className="mr-2 h-4 w-4" />}
                        Asignar y Enviar por WhatsApp
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

type QuestionnaireListProps = {
  groupedQuestionnaires: Record<string, Record<string, Questionnaire[]>>;
  patients: Patient[];
};

export function QuestionnaireList({ groupedQuestionnaires, patients }: QuestionnaireListProps) {
  const [isAssigning, setIsAssigning] = useState(false);
  const router = useRouter();

  const handleAssignClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click
    setIsAssigning(true);
  };
  
  const handleCloseDialog = () => {
    setIsAssigning(false);
  };

  const handleCardClick = (id: string) => {
      router.push(`/evaluation/${id}`);
  }

  const allQuestionnaires = useMemo(() => Object.values(groupedQuestionnaires).flatMap(sub => Object.values(sub).flat()), [groupedQuestionnaires]);
  const categories = Object.keys(groupedQuestionnaires).sort();
  const totalQuestions = (q: Questionnaire) => q.sections.reduce((acc, section) => acc + section.questions.length, 0);


  if (categories.length === 0) {
    return <p className="text-muted-foreground">No hay evaluaciones disponibles. ¡Crea una para empezar!</p>;
  }

  return (
    <>
      <div className='mb-6 text-right'>
         <Button onClick={handleAssignClick} size="lg">
            <Plus className="mr-2 h-4 w-4" />
            Asignar / Compartir Pruebas
        </Button>
      </div>

      <Accordion type="multiple" className="w-full space-y-4" defaultValue={categories}>
        {categories.map((category) => (
          <AccordionItem value={category} key={category} className="border-none">
            <AccordionTrigger className="p-4 bg-muted/50 rounded-lg hover:bg-muted">
              <div className="flex items-center gap-3">
                <Folder className="h-6 w-6 text-primary" />
                <h2 className="text-xl font-headline font-semibold">{category}</h2>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pt-4 pl-6">
               <Accordion type="multiple" className="w-full space-y-2" defaultValue={Object.keys(groupedQuestionnaires[category])}>
                {Object.keys(groupedQuestionnaires[category]).sort().map(subcategory => (
                  <AccordionItem value={subcategory} key={subcategory} className="border-l pl-6 py-2">
                     <AccordionTrigger>
                      <div className="flex items-center gap-2">
                        <FolderOpen className="h-5 w-5 text-secondary-foreground" />
                        <h3 className="text-lg font-semibold">{subcategory}</h3>
                      </div>
                     </AccordionTrigger>
                     <AccordionContent className="pt-4">
                       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {groupedQuestionnaires[category][subcategory].map((q) => (
                          <Card key={q.id} className="flex flex-col transition-all duration-300 hover:shadow-xl">
                            <div className="flex-grow cursor-pointer p-6" onClick={() => handleCardClick(q.id)}>
                              <CardHeader className="p-0 mb-4">
                                <CardTitle className="font-headline">{q.name}</CardTitle>
                                <CardDescription>{q.description}</CardDescription>
                              </CardHeader>
                              <CardContent className="p-0">
                                <div className="text-sm text-muted-foreground">{totalQuestions(q)} preguntas</div>
                              </CardContent>
                            </div>
                             <CardFooter className="p-6 pt-0">
                              <Button onClick={() => handleCardClick(q.id)} variant="outline" size="sm" className="w-full">
                                <Eye className="mr-2 h-4 w-4" />
                                Revisar Prueba
                              </Button>
                            </CardFooter>
                          </Card>
                        ))}
                       </div>
                     </AccordionContent>
                  </AccordionItem>
                ))}
               </Accordion>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>

      {isAssigning && (
        <AssignEvaluationDialog 
            questionnaires={allQuestionnaires} 
            patients={patients}
            onClose={handleCloseDialog}
        />
      )}
    </>
  );
}
