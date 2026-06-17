import { apiFetch } from "./client";

export interface ResumeUploadResponse {
  resume_id: string;
  filename: string;
  raw_text: string;
}

export async function uploadResume(file: File): Promise<ResumeUploadResponse> {
  const formData = new FormData();
  formData.append("file", file);

  return apiFetch<ResumeUploadResponse>("/api/resumes", {
    method: "POST",
    body: formData,
  });
}
