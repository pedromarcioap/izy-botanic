import { QuizGeneratorForm } from '@/components/quiz/quiz-generator-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function GenerateQuizPage() {
  return (
    <div className="max-w-3xl mx-auto">
        <Card>
            <CardHeader>
                <CardTitle className="text-2xl">Gerador de Quiz Inteligente</CardTitle>
                <CardDescription>
                Personalize os parâmetros abaixo para criar um quiz sob medida com o poder da IA.
                </CardDescription>
            </CardHeader>
            <CardContent>
                 <QuizGeneratorForm />
            </CardContent>
        </Card>
    </div>
  );
}
