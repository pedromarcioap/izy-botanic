export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: string;
  explanation?: string;
}

export interface Quiz {
  questions: QuizQuestion[];
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

export interface UserAnswer {
  question: string;
  selectedAnswer: string;
  isCorrect: boolean;
}

export interface QuizAttempt {
  id: string;
  topic: string;
  timestamp: string;
  score: number;
  totalQuestions: number;
  answers: UserAnswer[];
  quiz: Quiz;
  settings: QuizSettings;
}

export interface LibraryItem {
  id: string;
  title: string;
  content: string;
  createdAt: string;
}
