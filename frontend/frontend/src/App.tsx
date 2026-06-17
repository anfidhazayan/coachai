import { useState } from "react";
import UploadPage from "./pages/UploadPage";
import InterviewPage from "./pages/InterviewPage";
import { Session } from "./api/sessions";

export default function App() {
  const [activeSession, setActiveSession] = useState<Session | null>(null);

  const handleSessionCreated = (session: Session) => {
    setActiveSession(session);
  };

  const handleGoHome = () => {
    setActiveSession(null);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-sky-500 selection:text-white antialiased">
      {/* Navigation Header */}
      <header className="border-b border-slate-900 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={handleGoHome}>
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-sky-500 via-teal-500 to-emerald-500 flex items-center justify-center font-black text-white text-base shadow-md shadow-sky-500/10">
              C
            </div>
            <span className="font-bold tracking-tight text-lg bg-gradient-to-r from-slate-100 to-slate-300 bg-clip-text text-transparent">
              CoachAI
            </span>
          </div>
          <div className="flex items-center gap-4 text-sm font-medium">
            <span className="text-slate-500 hover:text-slate-300 transition-colors" onClick={handleGoHome}>
              New Coach Session
            </span>
          </div>
        </div>
      </header>

      {/* Main content body */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-8">
        {!activeSession ? (
          <UploadPage onSessionCreated={handleSessionCreated} />
        ) : (
          <InterviewPage session={activeSession} onGoHome={handleGoHome} />
        )}
      </main>

      {/* Footer bar */}
      <footer className="border-t border-slate-900/60 bg-slate-950/80 py-6 text-center text-xs text-slate-600">
        <p>© 2026 AI Interview Coach. Powered by Gemini. All rights reserved.</p>
      </footer>
    </div>
  );
}
