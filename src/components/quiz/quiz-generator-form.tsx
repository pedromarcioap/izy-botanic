'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState, useTransition } from 'react';

import { Button } from '@/components/ui/button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/hooks/use-toast';
import { generateQuiz } from '@/ai/flows/generate-quiz';
import type { Quiz, QuizSettings } from '@/lib/types';
import { Loader2 } from 'lucide-react';
import { useLocalStorage } from '@/hooks/use-local-storage';

const formSchema = z.object({
  topic: z.string().min(3, { message: 'O tópico deve ter pelo menos 3 caracteres.' }),
  subtopics: z.string().optional(),
  numberOfQuestions: z.number().min(1).max(20),
  difficulty: z.enum(['Básico', 'Intermediário', 'Avançado']),
  distractorComplexity: z.enum(['Baixa', 'Média', 'Alta']),
  studyMode: z.enum(['Modo Estudo', 'Modo Prova de Fogo']),
  automaticWebSearch: z.boolean(),
  systemPrompt: z.string().optional(),
  sourceContent: z.string().optional(),
});

export function QuizGeneratorForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [sourceContent, setSourceContent] = useState<string | undefined>(undefined);
  const [libraryItems] = useLocalStorage<any[]>('libraryItems', []);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      topic: searchParams.get('topic') || '',
      subtopics: '',
      numberOfQuestions: 5,
      difficulty: 'Intermediário',
      distractorComplexity: 'Média',
      studyMode: 'Modo Estudo',
      automaticWebSearch: false,
      systemPrompt: '',
    },
  });
  
  useEffect(() => {
    const topic = searchParams.get('topic');
    const sourceId = searchParams.get('sourceId');

    if (topic) {
        form.setValue('topic', topic);
    }
    if (sourceId) {
        const item = libraryItems.find(i => i.id === sourceId);
        if(item) {
            setSourceContent(item.content);
            form.setValue('topic', item.title);
        }
    }
  }, [searchParams, form, libraryItems]);

  const [, setActiveQuiz] = useLocalStorage<Quiz | null>('activeQuiz', null);
  const [, setQuizSettings] = useLocalStorage<QuizSettings | null>('activeQuizSettings', null);

  function onSubmit(values: z.infer<typeof formSchema>) {
    startTransition(async () => {
      try {
        const settings: QuizSettings = { ...values, sourceContent: sourceContent };
        const quiz = await generateQuiz(settings);
        
        if (!quiz || !quiz.questions || quiz.questions.length === 0) {
          throw new Error('A IA não retornou um quiz válido. Tente novamente.');
        }

        setActiveQuiz(quiz);
        setQuizSettings(settings);

        toast({
          title: 'Quiz Gerado!',
          description: 'Seu quiz está pronto. Bom estudo!',
        });
        router.push('/quiz/session');
      } catch (error) {
        console.error('Failed to generate quiz:', error);
        toast({
          variant: 'destructive',
          title: 'Erro ao Gerar Quiz',
          description: error instanceof Error ? error.message : 'Ocorreu um erro desconhecido.',
        });
      }
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="topic"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tópico Principal</FormLabel>
              <FormControl>
                <Input placeholder="Ex: Psicologia Cognitiva" {...field} />
              </FormControl>
              <FormDescription>O assunto central do seu quiz.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="subtopics"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Subtópicos (Opcional)</FormLabel>
              <FormControl>
                <Input placeholder="Ex: Memória, Atenção, Percepção" {...field} />
              </FormControl>
              <FormDescription>Especifique áreas dentro do tópico principal.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="numberOfQuestions"
          render={({ field: { value, onChange } }) => (
            <FormItem>
              <FormLabel>Número de Questões: {value}</FormLabel>
              <FormControl>
                <Slider
                  min={1}
                  max={20}
                  step={1}
                  defaultValue={[value]}
                  onValueChange={(vals) => onChange(vals[0])}
                />
              </FormControl>
            </FormItem>
          )}
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <FormField
            control={form.control}
            name="difficulty"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Nível de Dificuldade</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                    <SelectTrigger>
                        <SelectValue placeholder="Selecione a dificuldade" />
                    </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                    <SelectItem value="Básico">Básico</SelectItem>
                    <SelectItem value="Intermediário">Intermediário</SelectItem>
                    <SelectItem value="Avançado">Avançado</SelectItem>
                    </SelectContent>
                </Select>
                </FormItem>
            )}
            />
            <FormField
            control={form.control}
            name="distractorComplexity"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Complexidade dos Distratores</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                    <SelectTrigger>
                        <SelectValue placeholder="Selecione a complexidade" />
                    </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                    <SelectItem value="Baixa">Baixa</SelectItem>
                    <SelectItem value="Média">Média</SelectItem>
                    <SelectItem value="Alta">Alta</SelectItem>
                    </SelectContent>
                </Select>
                </FormItem>
            )}
            />
        </div>
         <FormField
          control={form.control}
          name="studyMode"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel>Modo de Estudo</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-4"
                >
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="Modo Estudo" />
                    </FormControl>
                    <FormLabel className="font-normal">Modo Estudo (feedback imediato)</FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="Modo Prova de Fogo" />
                    </FormControl>
                    <FormLabel className="font-normal">Modo Prova de Fogo (sem feedback)</FormLabel>
                  </FormItem>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="systemPrompt"
          render={({ field }) => (
            <FormItem>
              <FormLabel>System Prompt (Avançado)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Instruções personalizadas para a IA..."
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Customize o comportamento da IA. Deixe em branco para usar o padrão.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="automaticWebSearch"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 shadow-sm">
              <FormControl>
                <Checkbox checked={field.value} onCheckedChange={field.onChange} />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>Busca Web Automática</FormLabel>
                <FormDescription>
                  Permitir que a IA pesquise na web por informações atualizadas.
                </FormDescription>
              </div>
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isPending} className="w-full">
          {isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Gerando Quiz...
            </>
          ) : (
            'Gerar Quiz'
          )}
        </Button>
      </form>
    </Form>
  );
}
