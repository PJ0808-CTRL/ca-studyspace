import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import { questions, type Subject } from "@/lib/questions";

const objective: Subject[] = ["Quantitative Aptitude", "Business Economics"];
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

function clientFor(token: string) {
  if (!url || !key) throw new Error("Supabase is not configured.");
  return createClient(url, key, {
    global: { headers: { Authorization: `Bearer ${token}` } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

async function authenticated(request: NextRequest) {
  const token = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "") || "";
  if (!token) return null;
  const supabase = clientFor(token);
  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data.user) return null;
  return { supabase, user: data.user };
}

export async function GET(request: NextRequest) {
  try {
    const account = await authenticated(request);
    if (!account) return NextResponse.json({ error: "Sign in first." }, { status: 401 });
    const subject = request.nextUrl.searchParams.get("subject") as Subject;
    if (!objective.includes(subject)) return NextResponse.json({ error: "Choose an objective paper." }, { status: 400 });
    const count = request.nextUrl.searchParams.get("mode") === "mock" ? 20 : 10;
    const pool = questions.filter(item => item.subject === subject);
    for (let i = pool.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [pool[i], pool[j]] = [pool[j], pool[i]]; }
    return NextResponse.json({ questions: pool.slice(0, count).map(({ answer: _answer, explanation: _explanation, ...item }) => item), minutes: count === 20 ? 30 : 15 });
  } catch (error) { return NextResponse.json({ error: (error as Error).message }, { status: 500 }); }
}

export async function POST(request: NextRequest) {
  try {
    const account = await authenticated(request);
    if (!account) return NextResponse.json({ error: "Sign in first." }, { status: 401 });
    const body = await request.json() as { subject?: Subject; answers?: Record<string, number>; ids?: string[] };
    if (!body.subject || !objective.includes(body.subject) || !Array.isArray(body.ids) || ![10, 20].includes(body.ids.length) || new Set(body.ids).size !== body.ids.length || !body.answers || typeof body.answers !== "object") return NextResponse.json({ error: "Invalid test submission." }, { status: 400 });
    const items = body.ids.map(id => questions.find(item => item.id === id && item.subject === body.subject));
    if (items.some(item => !item)) return NextResponse.json({ error: "Invalid question list." }, { status: 400 });
    const review = items.map(item => { const question = item!; const chosen = body.answers?.[question.id]; return { id: question.id, selected: typeof chosen === "number" && Number.isInteger(chosen) && chosen >= 0 && chosen <= 3 ? chosen : null, correct: question.answer, explanation: question.explanation }; });
    const score = review.filter(item => item.selected === item.correct).length;
    const { error } = await account.supabase.from("test_attempts").insert({ user_id: account.user.id, subject: body.subject, score, total: review.length, answers: review });
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ score, total: review.length, review });
  } catch (error) { return NextResponse.json({ error: (error as Error).message }, { status: 500 }); }
}
