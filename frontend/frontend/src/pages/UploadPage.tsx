import React, { useState, useRef } from "react";
import { uploadResume, ResumeUploadResponse } from "../api/resumes";
import { createSession, Session } from "../api/sessions";
import { Upload, FileText, Settings, Play, AlertCircle, RefreshCw } from "lucide-react";

interface UploadPageProps {
  onSessionCreated: (session: Session) => void;
}

export default function UploadPage({ onSessionCreated }: UploadPageProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [parsedResume, setParsedResume] = useState<ResumeUploadResponse | null>(null);

  // Configuration state
  const [roleTarget, setRoleTarget] = useState("Software Engineer");
  const [seniority, setSeniority] = useState("mid");
  const [focus, setFocus] = useState("mixed");
  const [numQuestions, setNumQuestions] = useState(3);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (isUploading || isGenerating) return;
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.type === "application/pdf") {
      setFile(droppedFile);
      handleUpload(droppedFile);
    } else {
      setError("Please drop a valid PDF file.");
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      handleUpload(selectedFile);
    }
  };

  const handleUpload = async (fileToUpload: File) => {
    setIsUploading(true);
    setError(null);
    setParsedResume(null);
    try {
      const response = await uploadResume(fileToUpload);
      setParsedResume(response);
    } catch (err: any) {
      setError(err.message || "Failed to upload and parse resume.");
      setFile(null);
    } finally {
      setIsUploading(false);
    }
  };

  const handleStartInterview = async () => {
    if (!parsedResume) return;
    setIsGenerating(true);
    setError(null);
    try {
      const session = await createSession({
        resume_id: parsedResume.resume_id,
        role_target: roleTarget,
        seniority: seniority,
        focus: focus,
        num_questions: numQuestions,
      });
      onSessionCreated(session);
    } catch (err: any) {
      setError(err.message || "Failed to generate interview questions. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 py-4 animate-fade-in">
      {/* Title Hero Banner */}
      <div className="text-center space-y-3">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-sky-400 via-teal-400 to-emerald-400 bg-clip-text text-transparent">
          AI Interview Coach
        </h1>
        <p className="text-gray-400 text-lg max-w-2xl mx-auto">
          Upload your resume, customize your targeting, and practice with real-time feedback calibrated to senior hiring standards.
        </p>
      </div>

      <div className="grid md:grid-cols-5 gap-8">
        {/* Upload & Setup Section */}
        <div className="md:col-span-3 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
            <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
              <Upload className="w-5 h-5 text-sky-400" />
              1. Upload Resume
            </h2>

            {/* Drag and Drop Zone */}
            <div
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onClick={() => !isUploading && !isGenerating && fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-300 ${
                file
                  ? "border-emerald-500/50 bg-emerald-950/10"
                  : "border-slate-800 hover:border-sky-500/50 hover:bg-sky-950/10"
              }`}
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                accept="application/pdf"
                className="hidden"
                disabled={isUploading || isGenerating}
              />

              <div className="space-y-4">
                {isUploading ? (
                  <div className="flex flex-col items-center gap-3 py-4">
                    <RefreshCw className="w-10 h-10 text-sky-400 animate-spin" />
                    <p className="text-slate-300 font-medium">Extracting resume text...</p>
                  </div>
                ) : file ? (
                  <div className="flex flex-col items-center gap-2">
                    <FileText className="w-12 h-12 text-emerald-400" />
                    <p className="text-emerald-400 font-semibold">{file.name}</p>
                    <p className="text-slate-500 text-xs">{(file.size / 1024).toFixed(1)} KB</p>
                    <p className="text-xs text-slate-400 mt-2 bg-slate-800/80 px-3 py-1 rounded-full border border-slate-700">
                      Successfully parsed
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="mx-auto w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center">
                      <Upload className="w-6 h-6 text-slate-400" />
                    </div>
                    <p className="text-slate-300 font-medium">
                      Drag & drop your PDF resume here, or <span className="text-sky-400">browse</span>
                    </p>
                    <p className="text-slate-500 text-xs">Only PDF documents up to 5MB supported</p>
                  </div>
                )}
              </div>
            </div>

            {error && (
              <div className="flex gap-2 items-start bg-red-950/20 border border-red-800/50 p-4 rounded-xl text-red-400 text-sm">
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold">Error</p>
                  <p>{error}</p>
                </div>
              </div>
            )}

            {/* Custom Interview Configuration */}
            {parsedResume && (
              <div className="space-y-5 pt-4 border-t border-slate-800/80">
                <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
                  <Settings className="w-5 h-5 text-sky-400" />
                  2. Customize Interview
                </h2>

                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2 space-y-2">
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      Target Role
                    </label>
                    <input
                      type="text"
                      value={roleTarget}
                      onChange={(e) => setRoleTarget(e.target.value)}
                      placeholder="e.g. Backend Engineer, Product Manager"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-200 focus:outline-none focus:border-sky-500 transition-colors"
                      disabled={isGenerating}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      Seniority Level
                    </label>
                    <select
                      value={seniority}
                      onChange={(e) => setSeniority(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-3 text-slate-200 focus:outline-none focus:border-sky-500 transition-colors"
                      disabled={isGenerating}
                    >
                      <option value="junior">Junior</option>
                      <option value="mid">Mid-level</option>
                      <option value="senior">Senior</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      Questions Count
                    </label>
                    <select
                      value={numQuestions}
                      onChange={(e) => setNumQuestions(Number(e.target.value))}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-3 text-slate-200 focus:outline-none focus:border-sky-500 transition-colors"
                      disabled={isGenerating}
                    >
                      <option value={1}>1 Question</option>
                      <option value={2}>2 Questions</option>
                      <option value={3}>3 Questions</option>
                      <option value={4}>4 Questions</option>
                      <option value={5}>5 Questions</option>
                    </select>
                  </div>

                  <div className="col-span-2 space-y-2">
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      Interview Focus
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {["mixed", "technical", "behavioral"].map((type) => (
                        <button
                          key={type}
                          onClick={() => setFocus(type)}
                          className={`py-2 px-3 rounded-xl border text-sm font-medium capitalize transition-all duration-300 ${
                            focus === type
                              ? "border-sky-500 bg-sky-950/40 text-sky-300"
                              : "border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700"
                          }`}
                          disabled={isGenerating}
                        >
                          {type}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleStartInterview}
                  disabled={isGenerating}
                  className="w-full bg-gradient-to-r from-sky-500 via-teal-500 to-emerald-500 hover:from-sky-600 hover:via-teal-600 hover:to-emerald-600 text-white font-bold py-4 px-6 rounded-xl shadow-lg shadow-sky-500/10 flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.99] transition-all duration-300 disabled:opacity-50"
                >
                  {isGenerating ? (
                    <>
                      <RefreshCw className="w-5 h-5 animate-spin" />
                      Generating Questions via Gemini...
                    </>
                  ) : (
                    <>
                      <Play className="w-5 h-5" />
                      Start Mock Interview
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Resume Preview Section */}
        <div className="md:col-span-2">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl h-full flex flex-col space-y-4">
            <h2 className="text-lg font-bold text-slate-200 flex items-center gap-2">
              <FileText className="w-4 h-4 text-sky-400" />
              Extracted Resume Text
            </h2>
            <div className="flex-1 bg-slate-950 border border-slate-800 rounded-xl p-4 overflow-y-auto max-h-[460px] text-xs font-mono text-slate-400 leading-relaxed scrollbar-thin">
              {parsedResume ? (
                <pre className="whitespace-pre-wrap font-sans">{parsedResume.raw_text}</pre>
              ) : (
                <div className="h-full flex items-center justify-center text-center text-slate-600">
                  <p>Upload a PDF resume to view the extracted plain text preview here.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
