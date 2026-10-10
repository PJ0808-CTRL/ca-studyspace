import type { Subject } from "./questions";

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

export const writtenPrompts: { id: string; subject: "Accounting" | "Business Laws"; topic: string; prompt: string; checklist: string[] }[] = [
  { id: "written-accounting-journal", subject: "Accounting", topic: "Journal entries", prompt: "A proprietor starts a business with ₹80,000 cash, purchases equipment for ₹20,000 cash, and buys goods worth ₹12,000 on credit. Prepare the journal entries and explain the effect on the accounting equation.", checklist: ["Record capital introduced as cash debit and capital credit.", "Record equipment debit and cash credit.", "Record purchases debit and supplier credit.", "Show that assets equal capital plus liabilities after each event."] },
  { id: "written-accounting-bank", subject: "Accounting", topic: "Bank reconciliation", prompt: "Explain why the cash-book bank balance may differ from the passbook balance. Give three examples and state whether each would be added or deducted when starting with the cash-book balance.", checklist: ["Identify timing differences clearly.", "Consider cheques issued but not presented.", "Consider deposits not yet credited.", "Consider bank charges or direct receipts and their direction."] },
  { id: "written-law-contract", subject: "Business Laws", topic: "Contract essentials", prompt: "Write a structured answer on the essentials of a valid contract. Apply them to a short example where an offer is accepted but the agreement has an unlawful object.", checklist: ["Identify offer and acceptance.", "Address consideration and capacity.", "Explain free consent and lawful object.", "Conclude whether the example is enforceable, with reasons."] },
  { id: "written-law-agency", subject: "Business Laws", topic: "Agency", prompt: "Explain how an agency relationship can be created and describe the principal's liability when an agent acts within authority.", checklist: ["Define principal and agent.", "Describe at least two ways authority may arise.", "Distinguish actual and apparent authority.", "State the effect of acts within authority."] },
];
