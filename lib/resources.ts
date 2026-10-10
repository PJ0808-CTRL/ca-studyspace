import type { Subject } from "./subjects";

export type Resource = { id: string; kind: "Question paper" | "MCQ paper & key" | "RTP" | "MTP" | "Suggested answer"; attempt: string; subject: Subject | "All papers"; url: string; note?: string };
const archive = "https://www.icai.org/post/question-papers-foundation-course";
const mcq: Record<string, string> = {
  "May 2026": "https://www.icai.org/post/24181",
  "January 2026": "https://www.icai.org/post/exam-mcq-ques-and-key-jan2026-int-fnd",
};
const attempts = ["September 2026", "May 2026", "January 2026", "September 2025", "May 2025", "January 2025", "September 2024", "June 2024"];
export const resources: Resource[] = [...attempts.flatMap((attempt, index): Resource[] => {
  const papers: Subject[] = index === 0 ? ["Accounting", "Business Laws", "Quantitative Aptitude", "Business Economics"] : ["Accounting", "Business Laws"];
  return papers.map(subject => ({ id: `paper-${attempt}-${subject}`, kind: "Question paper" as const, attempt, subject, url: archive, note: "Select this attempt and paper on ICAI's archive." }));
}),
  ...Object.entries(mcq).flatMap(([attempt, url]) => (["Quantitative Aptitude", "Business Economics"] as Subject[]).map(subject => ({ id: `mcq-${attempt}-${subject}`, kind: "MCQ paper & key" as const, attempt, subject, url, note: "Select the Foundation paper on ICAI's page." }))),
  ...(["Accounting", "Business Laws", "Quantitative Aptitude", "Business Economics"] as Subject[]).flatMap(subject => [
    { id: `rtp-may-${subject}`, kind: "RTP" as const, attempt: "May 2026", subject, url: "https://www.icai.org/post/rtp-foundation-course-may2026", note: "Official ICAI revision test paper." },
    { id: `rtp-jan-${subject}`, kind: "RTP" as const, attempt: "January 2026", subject, url: "https://www.icai.org/post/rtp-foundation-course-jan2026", note: "Official ICAI revision test paper." },
    { id: `mtp-${subject}`, kind: "MTP" as const, attempt: "Current model papers", subject, url: "https://www.icai.org/post/foundation-nset", note: "Open Model Test Papers on ICAI's Foundation page." },
    { id: `answers-${subject}`, kind: "Suggested answer" as const, attempt: "Archive", subject, url: "https://www.icai.org/post/suggested-answer-foundation-course", note: "Choose the relevant attempt on ICAI's answer archive." },
  ])
];
