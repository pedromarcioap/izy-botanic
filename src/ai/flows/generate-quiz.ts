// src/ai/flows/generate-quiz.ts
'use server';
/**
 * @fileOverview A flow for generating personalized psychology quizzes.
 *
 * - generateQuiz - A function that generates a quiz based on user-specified parameters.
 * - QuizSettings - The input type for the generateQuiz function.
 * - Quiz - The return type for the generateQuiz function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const QuizSettingsSchema = z.object({
  topic: z.string().describe('The main topic of the quiz.'),
  subtopics: z.string().optional().describe('Optional subtopics for the quiz.'),
  numberOfQuestions: z.number().describe('The number of questions in the quiz.'),
  difficulty: z.enum(['Básico', 'Intermediário', 'Avançado']).describe('The difficulty level of the quiz.'),
  distractorComplexity: z.enum(['Baixa', 'Média', 'Alta']).describe('The complexity of the distractors (incorrect answers).'),
  studyMode: z.enum(['Modo Estudo', 'Modo Prova de Fogo']).describe('The study mode for the quiz.'),
  automaticWebSearch: z.boolean().describe('Whether to use automatic web search to get updated information.'),
  systemPrompt: z.string().optional().describe('Optional system prompt for advanced customization of the AI.'),
  sourceContent: z.string().optional().describe('Optional content to base the quiz on.'),
});
export type QuizSettings = z.infer<typeof QuizSettingsSchema>;

const QuizQuestionSchema = z.object({
  question: z.string().describe('The text of the quiz question.'),
  options: z.array(z.string()).describe('The possible answers to the question.'),
  correctAnswer: z.string().describe('The correct answer to the question.'),
  explanation: z.string().optional().describe('Explanation of the correct answer, shown in study mode.'),
});

const QuizSchema = z.object({
  questions: z.array(QuizQuestionSchema).describe('The questions in the quiz.'),
});
export type Quiz = z.infer<typeof QuizSchema>;

export async function generateQuiz(quizSettings: QuizSettings): Promise<Quiz> {
  return generateQuizFlow(quizSettings);
}

const quizPrompt = ai.definePrompt({
  name: 'quizPrompt',
  input: {schema: QuizSettingsSchema},
  output: {schema: QuizSchema},
  prompt: `You are an expert in psychology and creating quizzes. Create a quiz based on the following parameters:

Topic: {{{topic}}}
{{#if subtopics}}Subtopics: {{{subtopics}}}{{/if}}
Number of Questions: {{{numberOfQuestions}}}
Difficulty: {{{difficulty}}}
Distractor Complexity: {{{distractorComplexity}}}
Study Mode: {{{studyMode}}}
{{#if sourceContent}}Source Content: {{{sourceContent}}}{{/if}}

Return the quiz as a JSON object with a "questions" array. Each question should have the fields "question", "options", "correctAnswer", and "explanation" (optional). The explanation should only be included if studyMode is set to 'Modo Estudo'.

Instructions:
*   The explanation should be very detailed and explain the rational for the answer.
*   You MUST return a valid JSON at all times.
*   The explanation should NOT be provided when studyMode is set to 'Modo Prova de Fogo'.
`, // Improved prompt instructions
  config: {
    responseMimeType: 'application/json',
  },
});

const generateQuizFlow = ai.defineFlow(
  {
    name: 'generateQuizFlow',
    inputSchema: QuizSettingsSchema,
    outputSchema: QuizSchema,
  },
  async input => {
    const {output} = await quizPrompt(input);
    return output!;
  }
);
