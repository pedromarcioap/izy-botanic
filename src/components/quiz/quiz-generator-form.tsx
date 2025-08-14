
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState, useTransition } from 'react';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, onSnapshot, orderBy } from 'firebase/firestore';

import { Button } from '@/components/ui/button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/hooks/use-toast';
import { generateQuizAction, analyzeHistoryAction } from '@/ai/actions';
import type { Quiz, QuizSettings, QuizAttempt, LibraryItem } from '@/lib/types';
import { Loader2 } from 'lucide-react';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

const DEFAULT_SYSTEM_PROMPT = `Você é um professor experiente e amigável. Seu objetivo é criar quizzes educativos e envolventes, garantindo a precisão das informações e a clareza das perguntas. Foque em cobrir os tópicos de forma abrangente e fornecer perguntas com diferentes níveis de complexidade de distratores, conforme especificado nas configurações.`;
const TEMP_USER_ID = 'temp-user';

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
  const [libraryItems, setLibraryItems] = useState<LibraryItem[]>([]);

  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
    const libraryCollectionRef = collection(db, 'users', TEMP_USER_ID, 'libraryItems');
    const q = query(libraryCollectionRef, orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
        const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as LibraryItem));
        setLibraryItems(items);
    });
    return () => unsubscribe();
  }, []);

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
    if (!isMounted) return;
    const topic = searchParams.get('topic');
    const sourceId = searchParams.get('sourceId');

    if (topic) {
        form.setValue('topic', topic);
    }
    if (sourceId && libraryItems.length > 0) {
        const item = libraryItems.find(i => i.id === sourceId);
        if(item) {
            setSourceContent(item.content);
            form.setValue('topic', item.title);
        }
    }
  }, [searchParams, form, libraryItems, isMounted]);

  const [, setActiveQuiz] = useLocalStorage<Quiz | null>('activeQuiz', null);
  const [, setQuizSettings] = useLocalStorage<QuizSettings | null>('activeQuizSettings', null);

  function onSubmit(values: z.infer<typeof formSchema>) {
    startTransition(async () => {
      try {
        const finalSystemPrompt =
          values.systemPrompt && values.systemPrompt.trim() !== ''
            ? values.systemPrompt
            : DEFAULT_SYSTEM_PROMPT;

        const settings: QuizSettings = { ...values, systemPrompt: finalSystemPrompt, sourceContent: sourceContent };
        
        const quiz = await generateQuizAction(settings);
        
        const quizWithTitle: Quiz = { ...quiz, title: settings.topic };

        setActiveQuiz(quizWithTitle);
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

  function handlePersonalizeFromWeakness() {
    startTransition(async () => {
      toast({ title: 'Analisando seu desempenho...' });
      try {
        const historyCollectionRef = collection(db, 'users', TEMP_USER_ID, 'quizAttempts');
        const historySnapshot = await getDocs(historyCollectionRef);
        const quizAttempts = historySnapshot.docs.map(doc => ({id: doc.id, ...doc.data()}) as QuizAttempt);

        if (quizAttempts.length === 0) {
          toast({
            variant: 'destructive',
            title: 'Histórico Insuficiente',
            description: 'Não há dados de quizzes para analisar seu desempenho.',
          });
          return;
        }

        const analysis = await analyzeHistoryAction(quizAttempts);
        if (analysis.weakestTopics.length > 0) {
          form.setValue('topic', analysis.weakestTopics.join(', '));
          toast({ title: 'Tópico preenchido!', description: 'Foco nos seus pontos a melhorar.' });
        } else {
          toast({ title: 'Tudo certo!', description: 'Não encontramos pontos fracos específicos.' });
        }
      } catch (error) {
        console.error("Error analyzing history:", error)
        toast({ variant: 'destructive', title: 'Erro na Análise', description: 'Não foi possível analisar seu histórico.' });
      }
    });
  }
  
  if (!isMounted) {
    return null; 
  }

  return (
    <Card className="max-w-3xl mx-auto my-8">
    <CardHeader>
      <CardTitle className="text-2xl font-bold">Gerador de Quiz</CardTitle>
      <CardDescription>
        Personalize as configurações para gerar um quiz sob medida para você.
      </CardDescription>
    </CardHeader>
    <CardContent>
    <Button variant="outline" onClick={handlePersonalizeFromWeakness} className="w-full mb-6" disabled={isPending}>
        {isPending ? 'Analisando...' : 'Personalizar com base nos pontos fracos'}
    </Button>
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
              name="sourceContent"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Conteúdo de Origem para o Quiz (Opcional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Cole aqui o texto, artigo ou anotações que o AI deve usar como base para gerar o quiz."
                      className="min-h-[150px]"
                      value={sourceContent || ''}
                      onChange={(e) => {
                        setSourceContent(e.target.value);
                        field.onChange(e.target.value);
                      }}
                    />
                  </FormControl>
                  <FormDescription>
                    Se fornecido, a IA gerará o quiz com base neste conteúdo.
                  </FormDescription>
                  <FormMessage />
                  {libraryItems.length > 0 && (
                    <div className="mt-4">
                      <FormLabel>Ou selecione da sua biblioteca:</FormLabel>
                      <Select onValueChange={(value) => {
                        const selectedItem = libraryItems.find(item => item.id === value);
                        if (selectedItem) {
                          setSourceContent(selectedItem.content);
                          form.setValue('sourceContent', selectedItem.content);
                        } else {
                          setSourceContent('');
                          form.setValue('sourceContent', '');
                        }
                      }}>
                        <SelectTrigger className="mt-2">
                          <SelectValue placeholder="Selecione um item da biblioteca" />
                        </SelectTrigger>
                        <SelectContent>
                          {libraryItems.map((item: any) => (
                            <SelectItem key={item.id} value={item.id}>
                              {item.title}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </FormItem>
              )}
            />
        <Separator/>
        <h3 className="text-lg font-semibold -mb-4">Opções Avançadas</h3>
        <FormField
          control={form.control}
          name="systemPrompt"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Instruções para a IA</FormLabel>
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
                </Description>
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
    </CardContent>
    </Card>
  );
}
