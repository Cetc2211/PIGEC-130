'use client';

import type { Questionnaire } from '@/lib/data';
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Check, Copy, Link as LinkIcon } from 'lucide-react';

type QuestionnaireListProps = {
  questionnaires: Questionnaire[];
};

export function QuestionnaireList({ questionnaires }: QuestionnaireListProps) {
  const [selectedQuestionnaire, setSelectedQuestionnaire] = useState<Questionnaire | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  const { toast } = useToast();

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
        title: "Link Copied!",
        description: "The evaluation link has been copied to your clipboard.",
      });
      setTimeout(() => setIsCopied(false), 2000);
    });
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {questionnaires.map((q) => (
          <Card key={q.id} className="flex flex-col transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
            <CardHeader>
              <CardTitle className="font-headline">{q.name}</CardTitle>
              <CardDescription>{q.description}</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow">
              <div className="text-sm text-muted-foreground">{q.questions.length} questions</div>
            </CardContent>
            <CardFooter>
              <Button onClick={() => handleGenerateLink(q)} className="w-full">
                <LinkIcon className="mr-2 h-4 w-4" />
                Generate Link
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      <Dialog open={!!selectedQuestionnaire} onOpenChange={handleCloseDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="font-headline">Share Evaluation Link</DialogTitle>
            <DialogDescription>
              Share this unique link with your client to begin the evaluation.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="link" className="text-right">
                Link
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
