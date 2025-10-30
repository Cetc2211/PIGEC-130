'use client';

import type { Questionnaire } from '@/lib/data';
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Check, Copy, Link as LinkIcon, Eye } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

type QuestionnaireListProps = {
  questionnaires: Questionnaire[];
};

export function QuestionnaireList({ questionnaires }: QuestionnaireListProps) {
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
    // This function can only run on the client, so window is available.
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

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {questionnaires.map((q) => (
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
                Ver Prueba
              </Button>
              <Button onClick={() => handleGenerateLink(q)} className="w-full">
                <LinkIcon className="mr-2 h-4 w-4" />
                Generar Enlace
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      <Dialog open={!!selectedQuestionnaire} onOpenChange={handleCloseDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="font-headline">Compartir Enlace de Evaluación</DialogTitle>
            <DialogDescription>
              Comparte este enlace único con tu cliente para comenzar la evaluación. Este método es para evaluaciones no supervisadas.
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