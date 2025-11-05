'use client';

import type { Questionnaire } from '@/lib/data';
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Check, Copy, Link as LinkIcon, Eye, Folder, FolderOpen } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './ui/accordion';

type QuestionnaireListProps = {
  groupedQuestionnaires: Record<string, Record<string, Questionnaire[]>>;
};

export function QuestionnaireList({ groupedQuestionnaires }: QuestionnaireListProps) {
  const [selectedQuestionnaire, setSelectedQuestionnaire] = useState<Questionnaire | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const handleGenerateLink = (questionnaire: Questionnaire) => {
    setSelectedQuestionnaire(questionnaire);
    setIsCopied(false);
  };

  const handleCloseDialog = () => {
    setSelectedQuestionnaire(null);
  };

  const getEvaluationLink = () => {
    if (!selectedQuestionnaire) return '';
    return `${window.location.origin}/evaluation/${selectedQuestionnaire.id}`;
  };

  const handleCopy = () => {
    const link = getEvaluationLink();
    navigator.clipboard.writeText(link).then(() => {
      setIsCopied(true);
      toast({
        title: "¡Enlace Copiado!",
        description: "El enlace de la evaluación ha sido copiado a tu portapapeles.",
      });
      setTimeout(() => setIsCopied(false), 2000);
    });
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
                              <Button onClick={() => handleGenerateLink(q)} variant="secondary" className="w-full">
                                <LinkIcon className="mr-2 h-4 w-4" />
                                Enlace
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

      <Dialog open={!!selectedQuestionnaire} onOpenChange={handleCloseDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="font-headline">Compartir Enlace de Evaluación</DialogTitle>
            <DialogDescription>
              Comparte este enlace único con tu cliente para comenzar la evaluación no supervisada.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="link" className="text-right">
                Enlace
              </Label>
              <div className="col-span-3 relative">
                <Input
                  id="link"
                  value={getEvaluationLink()}
                  readOnly
                  className="pr-10"
                />
                <Button size="icon" variant="ghost" className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8" onClick={handleCopy}>
                    {isCopied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
