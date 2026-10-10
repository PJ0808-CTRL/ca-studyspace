import type { SupabaseClient } from "@supabase/supabase-js";
import type { Subject } from "./subjects";

const maxFileSize = 10 * 1024 * 1024;
const mimeTypes: Record<string, string> = {
  pdf: "application/pdf",
  doc: "application/msword",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
};

export async function uploadStudyNote(input: {
  supabase: SupabaseClient;
  userId: string;
  subject: Subject;
  title: string;
  file: File;
  shared: boolean;
}) {
  const { supabase, userId, subject, file, shared } = input;
  const title = input.title.trim();
  if (!title) throw new Error("Add a title for your note.");
  const extension = file.name.split(".").pop()?.toLowerCase() || "";
  const mime = mimeTypes[extension];
  if (!mime) throw new Error("Only PDF, DOC, and DOCX files are supported.");
  if (!file.size || file.size > maxFileSize) throw new Error("Choose a file smaller than 10 MB.");
  const path = `${userId}/${crypto.randomUUID()}.${extension}`;
  const displayName = `${file.name.slice(0, 175 - extension.length)}.${extension}`;
  const { data: note, error: insertError } = await supabase.from("notes").insert({
    user_id: userId, subject, title, content: "", shared,
    file_path: path, file_name: displayName, file_mime: mime, file_size: file.size,
  }).select("id").single();
  if (insertError) throw insertError;
  const { error: uploadError } = await supabase.storage.from("study-notes").upload(path, file, { contentType: mime, upsert: false });
  if (uploadError) {
    await supabase.from("notes").delete().eq("id", note.id);
    throw uploadError;
  }
  return { id: note.id as string, title, subject };
}
