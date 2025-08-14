
import { FieldValue, Timestamp } from 'firebase/firestore';

export interface LibraryItem {
  id: string;
  title: string;
  content: string;
  createdAt: Timestamp | string;
}

export interface QuizSettings {
  topic: string;
  subtopics?: string;
  numberOfQuestions: number;
  difficulty: 'Básico' | 'Intermediário' | 'Avançado';
  distractorComplexity: 'Baixa' | 'Média' | 'Alta';
  studyMode: 'Modo Estudo' | 'Modo Prova de Fogo';
  automaticWebSearch: boolean;
  systemPrompt?: string;
  sourceContent?: string;
}

export interface Question {
  question: string;
  options: string[];
  correctAnswer: string;
  explanation?: string; // Made optional
}

export interface Quiz {
  title: string;
  questions: Question[];
}

export interface UserAnswer {
  question: string;
  selectedAnswer: string;
  isCorrect: boolean;
}

export interface QuizAttempt {
  id: string;
  topic: string;
  timestamp: Timestamp | string;
  score: number;
  totalQuestions: number;
  answers: UserAnswer[];
  quiz: Quiz;
  settings: QuizSettings;
}

export interface Message {
  role: 'user' | 'model';
  content: string;
}
