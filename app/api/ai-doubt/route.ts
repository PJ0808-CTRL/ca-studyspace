import { NextResponse } from "next/server";
import { resolveWithExpertEngine, type DoubtRequest } from "@/lib/ca-ai-engine";

export const runtime = "nodejs";

const RANKER_SYSTEM_PROMPT = `You are the CA Studyspace Flagship AI Doubt Mentor, an elite Chartered Accountant and All-India Ranker (AIR) educator specializing in the ICAI CA Foundation (New Scheme).

You possess deep mastery over:
- Paper 1: Principles and Practice of Accounting
- Paper 2: Business Laws (Companies Act 2013, Indian Contract Act 1872, Sale of Goods Act 1930, Indian Partnership Act 1932, LLP Act 2008, Regulatory Framework)
- Paper 3: Quantitative Aptitude (Business Math, Logical Reasoning, Statistics)
- Paper 4: Business Economics (Microeconomics, National Income, Fiscal & Monetary Policies, Markets)

TONE & PEDAGOGY GUIDELINES:
- NEVER be boring, robotic, or dry. Write with energy, charisma, and crystal-clear clarity.
- Ground complex concepts in memorable Indian business analogies (e.g. Tata, Reliance, Infosys, local dukan/partnership).
- Be 100% compliant with ICAI Study Material presentation rules.

STRUCTURE EVERY ANSWER WITH THESE HIGH-IMPACT SECTIONS:

### 🎯 1. Concept Snapshot (Intuitive 30-Second Summary)
- 2 to 3 punchy sentences explaining the core logic simply.
- Include a quick real-world analogy.

### 🏛️ 2. Statutory Authority / Accounting Standard / Math Formula
- State the exact legal Section & Act name (e.g. Section 11 of Indian Contract Act 1872; Section 2(68) of Companies Act 2013).
- State landmark case law precedents where applicable (e.g. Salomon v. Salomon, Mohori Bibee, Turquand).
- State Accounting Standards (AS) or exact mathematical formulas.

### 📝 3. Official ICAI Exam Presentation (Step-by-Step)
- Show how the student must write it in the exam answer sheet:
  * For Law: Format strictly into (1) Applicable Legal Provision, (2) Facts & Legal Analysis, (3) Conclusion & Decision.
  * For Accounting: Formatted Markdown Journal Entries with Particulars, Debit (₹), Credit (₹), and clear Narration ("Being..."), plus numbered Working Notes.
  * For Math & Stats: Formula -> Step-by-step substitution -> Calculation -> Final Answer.

### ⚠️ 4. Examiner's Trap Alert
- Highlight the exact trap or tricky twist where 80% of students lose marks in ICAI past papers and RTPs.

### 💡 5. Ranker's Memory Shortcut / Mnemonic
- A catchy, memorable keyword mnemonic to recall the points instantly under exam stress.`;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { question, subject = "all", formatStyle = "icai_exam", history = [], customApiKey } = body;

    if (!question || typeof question !== "string" || question.trim().length === 0) {
      return NextResponse.json(
        { error: "Please enter a valid doubt or question." },
        { status: 400 }
      );
    }

    const trimmedQuestion = question.trim();

    // Check for API Keys from headers, body, or environment variables
    const headerGemini = req.headers.get("x-gemini-key");
    const headerOpenAI = req.headers.get("x-openai-key");
    const headerGroq = req.headers.get("x-groq-key");

    const geminiKey = customApiKey || headerGemini || process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
    const openaiKey = headerOpenAI || process.env.OPENAI_API_KEY;
    const groqKey = headerGroq || process.env.GROQ_API_KEY;

    // 1. Try Google Gemini 2.0 Flash / 1.5 Pro
    if (geminiKey) {
      try {
        const contents = [
          ...history.slice(-4).map((h: { role: string; content: string }) => ({
            role: h.role === "assistant" ? "model" : "user",
            parts: [{ text: h.content }],
          })),
          {
            role: "user",
            parts: [
              {
                text: `${RANKER_SYSTEM_PROMPT}\n\nSubject Focus: ${subject}\nPresentation Style: ${formatStyle}\nStudent Doubt: ${trimmedQuestion}`,
              },
            ],
          },
        ];

        // First attempt with Gemini 2.0 Flash, then fallback to gemini-1.5-flash
        const models = ["gemini-2.0-flash", "gemini-1.5-flash", "gemini-1.5-pro"];
        for (const model of models) {
          try {
            const response = await fetch(
              `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${geminiKey}`,
              {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  contents,
                  generationConfig: {
                    temperature: 0.4,
                    topP: 0.95,
                    maxOutputTokens: 2048,
                  },
                }),
                signal: AbortSignal.timeout(14000),
              }
            );

            if (response.ok) {
              const data = await response.json();
              const candidateText = data.candidates?.[0]?.content?.parts?.[0]?.text;

              if (candidateText && candidateText.trim().length > 0) {
                return NextResponse.json({
                  answer: candidateText,
                  subject: subject === "all" ? "CA Foundation Core" : subject,
                  topic: "ICAI Exam Solution",
                  source: `Google ${model.toUpperCase()}`,
                  modelName: `Gemini ${model.includes("2.0") ? "2.0 Flash" : "1.5 Pro"}`,
                  examTips: [
                    "Always quote relevant Bare Act Sections or Math formulas in your first two lines.",
                    "Box your final numerical answer and highlight conclusion keywords in the ICAI answer booklet.",
                    "Never skip Working Notes—they carry up to 40% of the total question marks.",
                  ],
                  suggestedFollowups: [
                    "Can you solve an ICAI past-paper question on this?",
                    "What is an alternative exam case scenario for this concept?",
                    "Give me 3 practice MCQs on this topic with solutions.",
                  ],
                });
              }
            }
          } catch {
            // Try next model if timeout or rate limit
            continue;
          }
        }
      } catch {
        // Fall through to next provider
      }
    }

    // 2. Try OpenAI GPT-4o / GPT-4o-mini
    if (openaiKey) {
      try {
        const messages = [
          { role: "system", content: RANKER_SYSTEM_PROMPT },
          ...history.slice(-4).map((h: { role: string; content: string }) => ({
            role: h.role === "assistant" ? "assistant" : "user",
            content: h.content,
          })),
          {
            role: "user",
            content: `Subject Focus: ${subject}\nPresentation Style: ${formatStyle}\nStudent Doubt: ${trimmedQuestion}`,
          },
        ];

        const response = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${openaiKey}`,
          },
          body: JSON.stringify({
            model: "gpt-4o-mini",
            messages,
            temperature: 0.4,
            max_tokens: 2048,
          }),
          signal: AbortSignal.timeout(14000),
        });

        if (response.ok) {
          const data = await response.json();
          const candidateText = data.choices?.[0]?.message?.content;

          if (candidateText) {
            return NextResponse.json({
              answer: candidateText,
              subject: subject === "all" ? "CA Foundation Core" : subject,
              topic: "ICAI Exam Solution",
              source: "OpenAI GPT-4o",
              modelName: "GPT-4o Mini",
              examTips: [
                "Always quote relevant Section numbers or Math formulas in your first two lines.",
                "Structure law answers into Provision, Analysis, and Conclusion.",
                "Numbered Working Notes are mandatory for full marks.",
              ],
              suggestedFollowups: [
                "Solve an ICAI past-year numerical example for this",
                "What are common student pitfalls in this question?",
                "Give me 3 quick practice MCQs with solutions",
              ],
            });
          }
        }
      } catch {
        // Fall through
      }
    }

    // 3. Try Groq Llama 3.3 70B
    if (groqKey) {
      try {
        const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${groqKey}`,
          },
          body: JSON.stringify({
            model: "llama-3.3-70b-versatile",
            messages: [
              { role: "system", content: RANKER_SYSTEM_PROMPT },
              { role: "user", content: `Subject Focus: ${subject}\nStudent Doubt: ${trimmedQuestion}` },
            ],
            temperature: 0.3,
            max_tokens: 2048,
          }),
          signal: AbortSignal.timeout(12000),
        });

        if (response.ok) {
          const data = await response.json();
          const candidateText = data.choices?.[0]?.message?.content;
          if (candidateText) {
            return NextResponse.json({
              answer: candidateText,
              subject,
              topic: "ICAI Exam Solution",
              source: "Groq Llama 3.3 70B",
              modelName: "Llama 3.3 70B",
              examTips: [
                "Quote exact section numbers in your opening sentence.",
                "Always write journal narrations starting with 'Being...'.",
              ],
              suggestedFollowups: [
                "Show an ICAI exam past question example",
                "Give me a quick mnemonic to memorize this",
              ],
            });
          }
        }
      } catch {
        // Fall through
      }
    }

    // 4. Fallback to upgraded, high-engagement Ranker Knowledge Engine
    const expertResult = resolveWithExpertEngine({
      question: trimmedQuestion,
      subject,
      formatStyle,
    } as DoubtRequest);

    return NextResponse.json(expertResult);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to solve doubt";
    return NextResponse.json(
      { error: `Assistant error: ${message}` },
      { status: 500 }
    );
  }
}
