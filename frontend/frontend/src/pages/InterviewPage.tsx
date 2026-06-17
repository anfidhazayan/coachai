import React, { useState } from "react";
import { Session, submitAnswer, Answer } from "../api/sessions";
import { CheckCircle, AlertTriangle, Lightbulb, Compass, Award, ArrowRight, Home, CornerDownRight, RefreshCw, Send } from "lucide-react";

interface InterviewPageProps {
  session: Session;
  onGoHome: () => void;
}

export default function InterviewPage({ session, onGoHome }: InterviewPageProps) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answerText, setAnswerText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentEvaluation, setCurrentEvaluation] = useState<Answer | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [sessionState, setSessionState] = useState<Session>(session);
  const [isFinished, setIsFinished] = useState(false);

  const questions = sessionState.questions;
  const currentQuestion = questions[currentIdx];

  const handleSubmit = async () => {
    if (!answerText.trim() || isSubmitting) return;
    setIsSubmitting(true);
    setError(null);
    try {
      const evaluation = await submitAnswer(sessionState.id, currentQuestion.id, answerText);
      setCurrentEvaluation(evaluation);
      
      // Update session state locally with the answer
      const updatedQuestions = [...sessionState.questions];
      updatedQuestions[currentIdx] = {
        ...currentQuestion,
        answer: evaluation,
      };
      setSessionState({
        ...sessionState,
        questions: updatedQuestions,
      });
    } catch (err: any) {
      setError(err.message || "Failed to submit and evaluate your answer.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNext = () => {
    setCurrentEvaluation(null);
    setAnswerText("");
    if (currentIdx + 1 < questions.length) {
      setCurrentIdx(currentIdx + 1);
    } else {
      setIsFinished(true);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-emerald-400 bg-emerald-950/30 border-emerald-500/30";
    if (score >= 60) return "text-amber-400 bg-amber-950/30 border-amber-500/30";
    return "text-red-400 bg-red-950/30 border-red-500/30";
  };

  const calculateAverageScore = () => {
    const scoredQuestions = questions.filter(q => q.answer !== null);
    if (scoredQuestions.length === 0) return 0;
    const sum = scoredQuestions.reduce((acc, q) => acc + (q.answer?.score || 0), 0);
    return Math.round(sum / scoredQuestions.length);
  };

  if (isFinished) {
    const avgScore = calculateAverageScore();
    return (
      <div className="max-w-4xl mx-auto space-y-8 py-4 animate-fade-in">
        {/* Synthesis Hero */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-slate-100 text-center space-y-6 shadow-2xl relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-tr from-sky-500/10 via-teal-500/5 to-emerald-500/10 pointer-events-none" />
          
          <div className="space-y-2">
            <h1 className="text-3xl font-extrabold text-slate-100">Session Summary</h1>
            <p className="text-slate-400">Mock interview complete for {sessionState.role_target} ({sessionState.seniority})</p>
          </div>

          <div className="flex justify-center">
            <div className="relative w-36 h-36 rounded-full bg-slate-950 border border-slate-800 flex flex-col items-center justify-center shadow-lg">
              <Award className="w-6 h-6 text-sky-400 mb-1" />
              <span className="text-4xl font-extrabold bg-gradient-to-r from-sky-400 to-teal-400 bg-clip-text text-transparent">
                {avgScore}%
              </span>
              <span className="text-slate-500 text-[10px] uppercase tracking-wider font-semibold mt-1">Average Score</span>
            </div>
          </div>

          <div className="flex justify-center gap-4">
            <button
              onClick={onGoHome}
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold py-3 px-6 rounded-xl flex items-center gap-2 border border-slate-700 transition-all duration-300"
            >
              <Home className="w-5 h-5" />
              Return to Upload
            </button>
          </div>
        </div>

        {/* Detailed Q&A Breakdown */}
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-slate-200">Question-by-Question Breakdown</h2>
          
          {questions.map((q, idx) => (
            <div key={q.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
              <div className="flex justify-between items-start gap-4">
                <div className="space-y-1">
                  <span className="text-xs font-semibold text-sky-400 uppercase tracking-wider">
                    Question {idx + 1} • {q.category}
                  </span>
                  <h3 className="text-lg font-bold text-slate-100">{q.question_text}</h3>
                </div>
                {q.answer && (
                  <div className={`px-3 py-1.5 rounded-xl border text-sm font-extrabold ${getScoreColor(q.answer.score)}`}>
                    {q.answer.score}/100
                  </div>
                )}
              </div>

              {q.answer ? (
                <div className="space-y-4 pt-4 border-t border-slate-800/80 text-sm">
                  <div className="space-y-1">
                    <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Your Answer</h4>
                    <p className="text-slate-300 italic whitespace-pre-wrap pl-3 border-l-2 border-slate-800">
                      "{q.answer.answer_text}"
                    </p>
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Model Answer</h4>
                    <p className="text-slate-400 whitespace-pre-wrap pl-3 border-l-2 border-sky-950 text-slate-300">
                      {q.answer.model_answer}
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-slate-500 text-sm italic">Unanswered</p>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 py-4 animate-fade-in">
      {/* Session Headers */}
      <div className="flex justify-between items-center text-sm text-slate-400 bg-slate-900 border border-slate-800/60 px-5 py-3 rounded-2xl shadow-md">
        <div>
          <span className="font-semibold text-slate-300">{sessionState.role_target}</span>
          <span className="text-slate-600"> • </span>
          <span className="capitalize">{sessionState.seniority}</span>
        </div>
        <div className="font-semibold text-sky-400">
          Question {currentIdx + 1} of {questions.length}
        </div>
      </div>

      {/* Main Question Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
        <div className="flex justify-between items-center">
          <div className="flex gap-2">
            <span className="px-3 py-1 bg-slate-950 border border-slate-800 rounded-full text-xs text-sky-300 capitalize font-medium">
              {currentQuestion.category}
            </span>
            <span className="px-3 py-1 bg-slate-950 border border-slate-800 rounded-full text-xs text-teal-300 capitalize font-medium">
              {currentQuestion.difficulty}
            </span>
          </div>
          {currentQuestion.source_context && (
            <span className="text-xs text-slate-500 flex items-center gap-1.5 max-w-[200px] md:max-w-xs truncate">
              <Compass className="w-3.5 h-3.5" />
              Source: {currentQuestion.source_context}
            </span>
          )}
        </div>

        <h2 className="text-xl md:text-2xl font-bold text-slate-100 leading-snug">
          {currentQuestion.question_text}
        </h2>
      </div>

      {/* Answer Inputs & Feedback */}
      <div className="space-y-6">
        {!currentEvaluation ? (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">
              Your Answer
            </h3>
            
            <textarea
              value={answerText}
              onChange={(e) => setAnswerText(e.target.value)}
              placeholder="Type your structured response here. Be detailed and draw upon your experience..."
              className="w-full h-48 bg-slate-950 border border-slate-800 rounded-xl p-4 text-slate-200 focus:outline-none focus:border-sky-500 transition-colors resize-none leading-relaxed"
              disabled={isSubmitting}
            />

            {error && (
              <div className="flex gap-2 items-start bg-red-950/20 border border-red-800/50 p-4 rounded-xl text-red-400 text-sm">
                <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
                <p>{error}</p>
              </div>
            )}

            <button
              onClick={handleSubmit}
              disabled={!answerText.trim() || isSubmitting}
              className="w-full bg-sky-600 hover:bg-sky-700 text-white font-bold py-3.5 px-6 rounded-xl flex items-center justify-center gap-2 hover:scale-[1.005] active:scale-[0.995] transition-all duration-300 disabled:opacity-40"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  Gemini Evaluator Scoring...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Submit Answer
                </>
              )}
            </button>
          </div>
        ) : (
          /* Rich Evaluation Feedback Card */
          <div className="space-y-6 animate-fade-in">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
              {/* Score visual */}
              <div className="flex justify-between items-center pb-4 border-b border-slate-800/80">
                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-slate-100">Answer Feedback</h3>
                  <p className="text-slate-400 text-xs">Evaluated against {sessionState.seniority}-level hiring standards</p>
                </div>
                <div className={`px-4 py-2 rounded-2xl border text-lg font-black flex items-center gap-2 ${getScoreColor(currentEvaluation.score)}`}>
                  <Award className="w-5 h-5" />
                  Score: {currentEvaluation.score}/100
                </div>
              </div>

              {/* Strengths & Weaknesses */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                    Key Strengths
                  </h4>
                  <ul className="space-y-2">
                    {currentEvaluation.strengths.map((str, i) => (
                      <li key={i} className="text-sm text-slate-300 pl-4 relative">
                        <span className="absolute left-0 text-emerald-400 font-bold">•</span>
                        {str}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="space-y-3">
                  <h4 className="text-sm font-semibold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-amber-400" />
                    Gaps & Weaknesses
                  </h4>
                  <ul className="space-y-2">
                    {currentEvaluation.weaknesses.map((weak, i) => (
                      <li key={i} className="text-sm text-slate-300 pl-4 relative">
                        <span className="absolute left-0 text-amber-400 font-bold">•</span>
                        {weak}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Suggestions */}
              <div className="bg-sky-950/20 border border-sky-900/50 rounded-xl p-5 space-y-3">
                <h4 className="text-sm font-semibold text-sky-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Lightbulb className="w-4 h-4 text-sky-300" />
                  Actionable Recommendations
                </h4>
                <div className="grid gap-2">
                  {currentEvaluation.suggestions.map((sug, i) => (
                    <div key={i} className="flex gap-2 text-sm text-slate-300">
                      <CornerDownRight className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
                      <p>{sug}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Model Answer */}
              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">
                  Example Model Answer
                </h4>
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 text-sm text-slate-300 leading-relaxed font-sans whitespace-pre-wrap">
                  {currentEvaluation.model_answer}
                </div>
              </div>

              {/* Navigation button */}
              <button
                onClick={handleNext}
                className="w-full bg-slate-800 hover:bg-slate-700 text-sky-300 font-bold py-3.5 px-6 rounded-xl flex items-center justify-center gap-2 hover:text-white border border-slate-700/80 transition-all duration-300"
              >
                {currentIdx + 1 < questions.length ? (
                  <>
                    Next Question
                    <ArrowRight className="w-4 h-4" />
                  </>
                ) : (
                  <>
                    Finish and View Summary
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
