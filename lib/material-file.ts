// The file rules of an upload (FR-G-030), shared by the browser and the Server Function.

export type MaterialFormat = "pdf" | "docx" | "pptx";

export const MAX_UPLOAD_MB = 25;
export const ACCEPTED_FORMATS: MaterialFormat[] = ["pdf", "docx", "pptx"];

// Checked in the browser and again before sending (FR-G-030).
export function fileProblem(file: { name: string; size: number }): string | undefined {
  const extension = file.name.split(".").pop()?.toLowerCase();
  if (!extension || !ACCEPTED_FORMATS.includes(extension as MaterialFormat)) {
    return "Format tidak didukung. Unggah berkas pdf, docx, atau pptx.";
  }
  if (file.size > MAX_UPLOAD_MB * 1024 * 1024) return `Ukuran berkas maksimal ${MAX_UPLOAD_MB} MB.`;
  return undefined;
}
