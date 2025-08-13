'use server';

/**
 * @fileOverview Provides an AI-powered analysis of a user's quiz history.
 *
 * - getAIAnalysisStream - A function that analyzes quiz history and provides feedback and a study plan.
 * - AIAnalysisInput - The input type for the getAIAnalysisStream function.
 * - AIAnalysisOutput - The return type for the getAIAnalysisStream function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AIAnalysisInputSchema = z.object({
  quizHistory: z.string().describe('The user quiz history in JSON format.'),
});
export type AIAnalysisInput = z.infer<typeof AIAnalysisInputSchema>;

const AIAnalysisOutputSchema = z.any();
export type AIAnalysisOutput = z.infer<typeof AIAnalysisOutputSchema>;

export async function getAIAnalysisStream(input: AIAnalysisInput): Promise<AIAnalysisOutput> {
  return analyzeQuizHistoryFlow(input);
}

const analyzeQuizHistoryPrompt = ai.definePrompt({
  name: 'analyzeQuizHistoryPrompt',
  input: {schema: AIAnalysisInputSchema},
  prompt: `You are an expert psychology tutor, skilled at analyzing student performance and providing personalized feedback.

  Analyze the following quiz history and provide a structured analysis in Markdown format, including a summary, identification of strengths and weaknesses, and a suggested study plan.

  Quiz History (JSON):
  {{{quizHistory}}}
  `,
});

const analyzeQuizHistoryFlow = ai.defineFlow(
  {
    name: 'analyzeQuizHistoryFlow',
    inputSchema: AIAnalysisInputSchema,
    outputSchema: AIAnalysisOutputSchema,
  },
  async input => {
    const {output} = await analyzeQuizHistoryPrompt(input);
    return output!;
  }
);
