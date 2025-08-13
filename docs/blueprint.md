# **App Name**: PsiQuizz AI

## Core Features:

- Quiz Generation: Generate personalized quizzes based on user-defined topics, subtopics, difficulty, and distractors using Google's Gemini API. The user will fill out a form that specifies all this information, and a detailed prompt is constructed for Gemini.
- AI-Powered Analysis: Analyze user quiz history and provide personalized feedback and study plans, with Gemini acting as a tutor. The user can then make a decision of what the AI "tool" recommends.
- Material Upload: Allow users to upload their own study materials (PDF, DOCX, TXT) to generate quizzes, handling file parsing client-side to minimize complexity and the user uploading them in an intuitive way.
- Study Mode UI: Implement a study page with adaptive UI based on study mode (practice vs. test). If it is practice, the answers are revealed immediately. Otherwise, it is not until the end.
- Progress Dashboard: Develop an interactive dashboard to visualize user progress with performance summaries, recommended topics, and recent activities displayed. Allow the user to track themselves in an accessible and well organized area.
- Local Data Persistence: Store quiz history and library items in local storage to preserve user data without a backend database. Avoid backend as part of keeping it MVP.

## Style Guidelines:

- Primary color: Light blue (#ADD8E6) to evoke a sense of calm and focus, promoting an optimal study environment.
- Background color: Very light blue (#F0F8FF), creating a subtle and unobtrusive backdrop that prevents eye strain during long study sessions.
- Accent color: Soft green (#90EE90) used for positive feedback and highlighting correct answers, reinforcing learning.
- Body and headline font: 'PT Sans', a humanist sans-serif, blends a modern look with a little warmth or personality; suitable for both headlines and body text. The combination of these qualities matches this particular use case very well.
- Use clean, minimalist icons for navigation and quiz elements, maintaining a distraction-free environment.
- Implement a clean, single-page layout for a seamless user experience, optimized for study and quiz-taking. Every action the user might take should have the most logical and convenient layout.
- Use subtle animations and transitions for feedback and loading states, enhancing usability without disrupting focus.