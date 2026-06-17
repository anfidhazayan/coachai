import { apiFetch } from "./client";

export interface Answer {
  answer_text: string;
  score: number;
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
  model_answer: string;
}

export interface Question {
  id: string;
  question_text: string;
  category: string;
  difficulty: string;
  source_context: string;
  order_index: number;
  answer: Answer | null;
}

export interface Session {
  id: string;
  resume_id: string;
  role_target: string;
  seniority: string;
  focus: string;
  questions: Question[];
}

export interface CreateSessionConfig {
  resume_id: string;
  role_target?: string;
  seniority?: string;
  focus?: string;
  num_questions?: number;
}

export async function createSession(config: CreateSessionConfig): Promise<Session> {
  return apiFetch<Session>("/api/sessions", {
    method: "POST",
    body: JSON.stringify(config),
  });
}

export async function getSession(sessionId: string): Promise<Session> {
  return apiFetch<Session>(`/api/sessions/${sessionId}`);
}

export async function submitAnswer(
  sessionId: string,
  questionId: string,
  answerText: string
): Promise<Answer> {
  return apiFetch<Answer>(`/api/sessions/${sessionId}/answers`, {
    method: "POST",
    body: JSON.stringify({ question_id: questionId, answer_text: answerText }),
  });
}
