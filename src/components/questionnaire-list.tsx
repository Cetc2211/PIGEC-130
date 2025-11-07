'use client';

import type { Questionnaire } from '@/lib/data';
import { useState, useMemo, useTransition } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Eye, Folder, FolderOpen, Plus, Search, User, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './ui/accordion';
import type { Patient } from '@/lib/store';
import { ScrollArea } from './ui/scroll-area';
import { assignQuestionnaireAction } from '@/app/actions';

type AssignEvaluationDialogProps = {
    questionnaire: Questionnaire;
    patients: Patient[];
    onClose: () => void;
};

function AssignEvaluationDialog({ questionnaire, patients, onClose }: AssignEvaluationDialogProps) {
    const { toast } = useToast();
    const [isPending, startTransition] = useTransition();
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);

    const filteredPatients = useMemo(() => {
        if (!searchTerm) {
            return patients;
        }
        return patients.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));
    }, [patients, searchTerm]);

    const handleAssignClick = () => {
        if (selectedPatient && questionnaire) {
            startTransition(async () => {
                const result = await assignQuestionnaireAction(selectedPatient.id, questionnaire.id);
                if (result.success) {
                    toast({
                        title: "¡Evaluación Asignada!",
                        description: `"${questionnaire.name}" ha sido añadida al expediente de ${selectedPatient.name}.`,
                    });
                    onClose();
                } else {
                    toast({
                        title: "Error",
                        description: result.message,
                        variant: "destructive",
                    });
                }
            });
        }
    };
    
    return (
        <Dialog open={true} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="font-headline">Asignar "{questionnaire.name}"</DialogTitle>
                    <DialogDescription>
                        Busca y selecciona el paciente al que deseas asignar esta evaluación.
                    </DialogDescription>
                </DialogHeader>
                <div className="flex flex-col gap-4 py-4">
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
                <DialogFooter>
                    <Button variant="outline" onClick={onClose} disabled={isPending}>Cancelar</Button>
                    <Button onClick={handleAssignClick} disabled={!selectedPatient || isPending}>
                         {isPending ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                         ) : (
                            <Plus className="mr-2 h-4 w-4" />
                         )}
                        Asignar a Expediente
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
  const [selectedQuestionnaire, setSelectedQuestionnaire] = useState<Questionnaire | null>(null);
  const router = useRouter();

  const handleAssignClick = (questionnaire: Questionnaire) => {
    setSelectedQuestionnaire(questionnaire);
  };
  
  const handleCloseDialog = () => {
    setSelectedQuestionnaire(null);
  };

  const handleCardClick = (id: string) => {
      router.push(`/evaluation/${id}`);
  }

  const categories = Object.keys(groupedQuestionnaires).sort();

  if (categories.length === 0) {
    return <p className="text-muted-foreground">No hay evaluaciones disponibles. ¡Crea una para empezar!</p>;
  }

  return (
    <>
      <Accordion type="multiple" className="w-full space-y-4">
        {categories.map((category) => (
          <AccordionItem value={category} key={category} className="border-none">
            <AccordionTrigger className="p-4 bg-muted/50 rounded-lg hover:bg-muted">
              <div className="flex items-center gap-3">
                <Folder className="h-6 w-6 text-primary" />
                <h2 className="text-xl font-headline font-semibold">{category}</h2>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pt-4 pl-6">
               <Accordion type="multiple" className="w-full space-y-2">
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
                            <div className="flex-grow cursor-pointer" onClick={() => handleCardClick(q.id)}>
                              <CardHeader>
                                <CardTitle className="font-headline">{q.name}</CardTitle>
                                <CardDescription>{q.description}</CardDescription>
                              </CardHeader>
                              <CardContent>
                                <div className="text-sm text-muted-foreground">{q.questions.length} preguntas</div>
                              </CardContent>
                            </div>
                            <CardFooter className="flex justify-between items-center">
                              <Button onClick={() => handleCardClick(q.id)} variant="outline" className="w-full mr-2">
                                <Eye className="mr-2 h-4 w-4" />
                                Revisar
                              </Button>
                              <Button onClick={() => handleAssignClick(q)} variant="secondary" className="w-full">
                                <Plus className="mr-2 h-4 w-4" />
                                Asignar
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

      {selectedQuestionnaire && (
        <AssignEvaluationDialog 
            questionnaire={selectedQuestionnaire} 
            patients={patients}
            onClose={handleCloseDialog}
        />
      )}
    </>
  );
}
