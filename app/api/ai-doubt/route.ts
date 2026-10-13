import { NextResponse } from "next/server";
import { resolveWithExpertEngine, type DoubtRequest } from "@/lib/ca-ai-engine";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { question, subject = "all", formatStyle = "icai_exam", history = [] } = body;

    if (!question || typeof question !== "string" || question.trim().length === 0) {
      return NextResponse.json(
        { error: "Please enter a valid doubt or question." },
        { status: 400 }
      );
    }

    const trimmedQuestion = question.trim();

    // Check if Gemini or Google API key is configured
    const geminiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;

    if (geminiKey) {
      try {
        const systemPrompt = `You are the CA Studyspace AI Doubt Assistant, an expert Chartered Accountancy educator specializing in the ICAI CA Foundation New Scheme.
You have mastery over all 4 subjects:
- Paper 1: Principles & Practice of Accounting
- Paper 2: Business Laws (Companies Act 2013, Indian Contract Act 1872, Sale of Goods Act 1930, Indian Partnership Act 1932, LLP Act 2008)
- Paper 3: Quantitative Aptitude (Business Math, Logical Reasoning, Statistics)
- Paper 4: Business Economics

RULES FOR ANSWER PRESENTATION:
1. When answering Business Laws:
   - Always structure in standard ICAI Case Law presentation format:
     * Applicable Legal Provision & Section
     * Facts of the Case & Legal Analysis
     * Conclusion & Decision
   - Mention relevant landmark case laws (e.g. Salomon, Mohori Bibee, Chinnaiah, Turquand).
2. When answering Accounting:
   - Provide clear Journal Entries with Narrations.
   - Show detailed Working Notes.
3. When answering Math/Stats:
   - State the formula clearly first.
   - Show step-by-step substitution and working.
4. Keep the answer structured, professional, academic, and encouraging.
5. Format response in clean GitHub Markdown with headings, bullet points, and tables.`;

        const contents = [
          ...history.slice(-4).map((h: { role: string; content: string }) => ({
            role: h.role === "assistant" ? "model" : "user",
            parts: [{ text: h.content }],
          })),
          {
            role: "user",
            parts: [
              {
                text: `${systemPrompt}\n\nSubject Context: ${subject}\nFormat Preference: ${formatStyle}\nStudent Doubt: ${trimmedQuestion}`,
              },
            ],
          },
        ];

        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ contents }),
            signal: AbortSignal.timeout(12000), // 12 second timeout
          }
        );

        if (response.ok) {
          const data = await response.json();
          const candidateText =
            data.candidates?.[0]?.content?.parts?.[0]?.text;

          if (candidateText) {
            return NextResponse.json({
              answer: candidateText,
              subject: subject === "all" ? "CA Foundation Core" : subject,
              topic: "ICAI Exam Guidance",
              source: "gemini_llm",
              examTips: [
                "Always cite relevant Section numbers or Bare Act provisions at the top.",
                "Draw proper ledger accounts with particulars and amount columns.",
                "Highlight key conclusions with a pencil box in physical exam answer sheets.",
              ],
              suggestedFollowups: [
                "Can you show an ICAI exam past-year numerical example for this?",
                "What are common mistakes students make in this topic?",
                "Give a quick mnemonic to memorize this.",
              ],
            });
          }
        }
      } catch {
        // Fall back gracefully to expert engine on any network or API error
      }
    }

    // High-performance built-in CA Foundation expert knowledge solver
    const expertResult = resolveWithExpertEngine({
      question: trimmedQuestion,
      subject,
      formatStyle,
    } as DoubtRequest);

    return NextResponse.json(expertResult);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to solve doubt";
    return NextResponse.json(
      { error: `Internal assistant error: ${message}` },
      { status: 500 }
    );
  }
}
