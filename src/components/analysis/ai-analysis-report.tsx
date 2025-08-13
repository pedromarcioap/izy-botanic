'use client';

import { useState, useTransition } from 'react';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { getAIAnalysisStream } from '@/ai/flows/analyze-quiz-history';
import type { QuizAttempt } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Sparkles } from 'lucide-react';

export function AIAnalysisReport() {
  const [quizHistory] = useLocalStorage<QuizAttempt[]>('quizHistory', []);
  const [analysis, setAnalysis] = useState<string>('');
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const handleGenerate = () => {
    if (quizHistory.length < 1) {
      toast({
        variant: 'destructive',
        title: 'Dados insuficientes',
        description: 'Faça pelo menos um quiz para gerar uma análise.',
      });
      return;
    }
    
    startTransition(async () => {
      setAnalysis('');
      try {
        const result = await getAIAnalysisStream({ quizHistory: JSON.stringify(quizHistory) });
        if (typeof result === 'string') {
          setAnalysis(result);
        } else {
            // Handle cases where the output might be structured JSON
            setAnalysis(JSON.stringify(result, null, 2));
        }
      } catch (error) {
        console.error('Failed to get AI analysis:', error);
        toast({
          variant: 'destructive',
          title: 'Erro na Análise',
          description: 'Não foi possível gerar a análise. Tente novamente mais tarde.',
        });
      }
    });
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle>Relatório por IA</CardTitle>
        <CardDescription>Receba um feedback detalhado e plano de estudos.</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow flex flex-col">
        <Button onClick={handleGenerate} disabled={isPending || quizHistory.length === 0} className="w-full mb-4">
          {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
          Gerar Análise
        </Button>
        <ScrollArea className="flex-grow rounded-md border p-4 bg-muted/50 min-h-[200px]">
            {isPending && <p className="text-sm text-muted-foreground animate-pulse">A IA está analisando seu progresso...</p>}
            {!isPending && !analysis && (
                <div className="text-center text-sm text-muted-foreground py-10">
                    <p>Sua análise aparecerá aqui.</p>
                </div>
            )}
            {analysis && (
                 <div className="prose prose-sm dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: analysis.replace(/\n/g, '<br />') }}/>
            )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
