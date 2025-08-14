
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLocalStorage } from '@/hooks/use-local-storage';
import type { Quiz, QuizSettings, QuizAttempt, UserAnswer } from '@/lib/types';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { CheckCircle, XCircle, ArrowRight, Flag } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

const TEMP_USER_ID = 'temp-user';

export function QuizPlayer() {
  const router = useRouter();
  const { toast } = useToast();
  const [activeQuiz, setActiveQuiz] = useLocalStorage<Quiz | null>('activeQuiz', null);
  const [settings] = useLocalStorage<QuizSettings | null>('activeQuizSettings', null);
  
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [userAnswers, setUserAnswers] = useState<UserAnswer[]>([]);

  useEffect(() => {
    if (!activeQuiz || !settings) {
      toast({ title: "Nenhum quiz ativo encontrado.", description: "Gerando um novo quiz...", variant: "destructive" });
      router.replace('/generate');
    }
  }, [activeQuiz, settings, router, toast]);

  if (!activeQuiz || !settings) {
    return <div className="flex justify-center items-center h-full"><p>Carregando quiz...</p></div>;
  }

  const currentQuestion = activeQuiz.questions[currentQuestionIndex];
  const isStudyMode = settings.studyMode === 'Modo Estudo';
  const isLastQuestion = currentQuestionIndex === activeQuiz.questions.length - 1;


  const recordAnswer = (answer: string) => {
    const isCorrect = answer === currentQuestion.correctAnswer;
    const newAnswer: UserAnswer = { 
        question: currentQuestion.question, 
        selectedAnswer: answer, 
        isCorrect 
    };
    setUserAnswers(prev => [...prev, newAnswer]);
    return newAnswer;
  }

  const handleAnswerSubmit = () => {
    if (!selectedAnswer) return;

    recordAnswer(selectedAnswer);
    
    if (isStudyMode) {
      setIsAnswered(true);
    } else {
      if (isLastQuestion) {
        finishQuiz();
      } else {
        handleNextQuestion();
      }
    }
  };

  const handleNextQuestion = () => {
    setIsAnswered(false);
    setSelectedAnswer(null);

    if (!isLastQuestion) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      finishQuiz();
    }
  };
  
  const finishQuiz = async () => {
    const finalAnswers = [...userAnswers];
    if (selectedAnswer && !isStudyMode) {
       const lastAnswer = recordAnswer(selectedAnswer);
       finalAnswers.push(lastAnswer);
    }

    // Explicitly define the type for the new object to be saved
    const newAttemptData = {
        topic: settings.topic,
        timestamp: serverTimestamp(), // This is a FieldValue, handled by types.ts
        score: finalAnswers.filter(a => a.isCorrect).length,
        totalQuestions: activeQuiz.questions.length,
        answers: finalAnswers,
        quiz: activeQuiz,
        settings: settings,
    };

    try {
        const historyCollectionRef = collection(db, 'users', TEMP_USER_ID, 'quizAttempts');
        const docRef = await addDoc(historyCollectionRef, newAttemptData);
        
        setActiveQuiz(null);

        toast({ title: "Quiz finalizado!", description: "Seu resultado foi salvo no histórico." });
        router.push(`/analysis?quizId=${docRef.id}`);
    } catch (error) {
        console.error("Error saving quiz attempt:", error);
        toast({
            variant: "destructive",
            title: "Erro ao Salvar",
            description: "Não foi possível salvar seu resultado."
        });
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <Card>
        <CardHeader>
          <div className='flex justify-between items-start'>
            <div>
              <CardTitle className="text-2xl">{settings.topic}</CardTitle>
              <CardDescription>Questão {currentQuestionIndex + 1} de {activeQuiz.questions.length}</CardDescription>
            </div>
             <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" size="sm">Sair</Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Se você sair, seu progresso neste quiz não será salvo.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Continuar Quiz</AlertDialogCancel>
                  <AlertDialogAction onClick={() => router.push('/dashboard')}>Sair</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
          <Progress value={((currentQuestionIndex + 1) / activeQuiz.questions.length) * 100} className="mt-4" />
        </CardHeader>
        <CardContent>
          <p className="text-lg font-semibold mb-6">{currentQuestion.question}</p>
          <RadioGroup
            value={selectedAnswer ?? ''}
            onValueChange={setSelectedAnswer}
            disabled={isAnswered}
          >
            {currentQuestion.options.map((option, index) => (
              <div key={index} className={cn("flex items-center space-x-3 space-y-0 p-3 rounded-lg border transition-all", isAnswered && isStudyMode && (option === currentQuestion.correctAnswer ? 'bg-green-100 dark:bg-green-900/50 border-green-500' : (option === selectedAnswer ? 'bg-red-100 dark:bg-red-900/50 border-red-500' : '')))}>
                <RadioGroupItem value={option} id={`option-${index}`} />
                <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer">{option}</Label>
              </div>
            ))}
          </RadioGroup>

          {isAnswered && isStudyMode && currentQuestion.explanation && (
            <Alert className="mt-6" variant={userAnswers[userAnswers.length-1]?.isCorrect ? 'default' : 'destructive'}>
              {userAnswers[userAnswers.length-1]?.isCorrect ? 
                <CheckCircle className="h-4 w-4" /> :
                <XCircle className="h-4 w-4" />
              }
              <AlertTitle>{userAnswers[userAnswers.length-1]?.isCorrect ? "Correto!" : "Incorreto!"}</AlertTitle>
              <AlertDescription>
                {currentQuestion.explanation}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
        <CardFooter>
            {isAnswered && isStudyMode ? (
                <Button onClick={handleNextQuestion} className="w-full">
                    {isLastQuestion ? 'Finalizar Quiz' : 'Próxima Questão'}
                    <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
            ) : (
                <Button 
                  onClick={handleAnswerSubmit} 
                  disabled={!selectedAnswer} 
                  className="w-full"
                >
                  {isLastQuestion ? 'Finalizar Quiz' : (isStudyMode ? 'Confirmar' : 'Próxima')}
                  {isLastQuestion ? <Flag className="ml-2 h-4 w-4" /> : <ArrowRight className="ml-2 h-4 w-4" />}
                </Button>
            )}
        </CardFooter>
      </Card>
    </div>
  );
}
