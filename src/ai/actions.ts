
'use server';

import { generateQuiz as generateQuizFlow } from '@/ai/flows/generate-quiz';
import { analyzeQuizHistoryFlow } from '@/ai/flows/analyze-quiz-history';
import { talkToMentor as talkToMentorFlow } from '@/ai/flows/mentor-chat';
import type { QuizSettings, QuizAttempt, Message } from '@/lib/types';

// This file contains server-side logic only.

export async function generateQuizAction(settings: QuizSettings) {
  const quiz = await generateQuizFlow(settings);
  if (!quiz || !quiz.questions || quiz.questions.length === 0) {
    throw new Error('A IA não retornou um quiz válido.');
  }
  return quiz;
}

export async function analyzeHistoryAction(history: QuizAttempt[]) {
  return await analyzeQuizHistoryFlow.run(history);
}

export async function mentorChatAction(messages: Message[], sourceContent?: string) {
  const response = await talkToMentorFlow({ messages, sourceContent });
  return response;
}
