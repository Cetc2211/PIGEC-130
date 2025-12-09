'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle, Copy } from 'lucide-react';
import { Logo } from '@/components/logo';

function SubmittedContent() {
  const searchParams = useSearchParams();
  const code = searchParams.get('code');
  const { toast } = useToast();

  const handleCopy = () => {
    if (code) {
      navigator.clipboard.writeText(code);
      toast({
        title: '¡Código Copiado!',
        description: 'El código de resultados ha sido copiado a tu portapapeles.',
      });
    }
  };

  if (!code) {
    return (
      <p className="text-destructive">No se ha encontrado un código de resultado. Por favor, completa la evaluación de nuevo.</p>
    );
  }

  return (
    <>
      <div className="flex flex-col items-center text-center">
        <CheckCircle className="h-16 w-16 text-green-500 mb-4" />
        <CardTitle className="font-headline text-3xl">¡Evaluación Enviada!</CardTitle>
        <CardDescription className="mt-2 max-w-md">
          Has completado la evaluación con éxito. El siguiente paso es enviar el código de resultados a tu terapeuta.
        </CardDescription>
      </div>

      <div className="space-y-2 pt-4">
        <p className="font-medium text-sm text-center">Tu código de resultados:</p>
        <Textarea
          readOnly
          value={code}
          className="text-xs font-mono h-32 text-center bg-muted/50"
        />
        <p className="text-xs text-muted-foreground text-center">
          Este código contiene tus respuestas de forma segura y anónima.
        </p>
      </div>
      
      <Button onClick={handleCopy} className="w-full">
        <Copy className="mr-2 h-4 w-4" />
        Copiar Código y Enviar por WhatsApp
      </Button>
    </>
  );
}


export default function EvaluationSubmittedPage() {
  return (
    <div className="min-h-screen w-full bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md mx-auto space-y-8">
        <div className="flex justify-center">
            <Logo />
        </div>
        <Card className="shadow-2xl">
          <CardHeader>
             {/* Header content is now inside the client component */}
          </CardHeader>
          <CardContent className="space-y-6">
            <Suspense fallback={<p>Cargando...</p>}>
              <SubmittedContent />
            </Suspense>
          </CardContent>
        </Card>
         <p className="text-center text-sm text-muted-foreground mt-6">
            Gracias por completar tu evaluación.
        </p>
      </div>
    </div>
  );
}
