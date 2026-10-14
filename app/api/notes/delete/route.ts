import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: Request) {
  try {
    const { noteId, filePath } = await req.json();

    if (!noteId || typeof noteId !== "string") {
      return NextResponse.json({ error: "Invalid noteId" }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const authHeader = req.headers.get("authorization");

    if (!supabaseUrl) {
      return NextResponse.json({ error: "Missing Supabase configuration" }, { status: 500 });
    }

    // 1. If service role key is available on server, execute admin deletion bypassing RLS
    if (serviceRoleKey) {
      const adminClient = createClient(supabaseUrl, serviceRoleKey, {
        auth: { persistSession: false },
      });

      if (filePath && typeof filePath === "string") {
        try {
          await adminClient.storage.from("study-notes").remove([filePath]);
        } catch (e) {
          console.warn("[Notes Delete API] Storage file deletion warning:", e);
        }
      }

      const { error } = await adminClient.from("notes").delete().eq("id", noteId);
      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ success: true, method: "admin" });
    }

    // 2. If user token is available in authorization header, execute with user's session
    if (authHeader) {
      const client = createClient(supabaseUrl, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!, {
        global: { headers: { Authorization: authHeader } },
      });

      if (filePath && typeof filePath === "string") {
        try {
          await client.storage.from("study-notes").remove([filePath]);
        } catch {}
      }

      const { error } = await client.from("notes").delete().eq("id", noteId);
      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ success: true, method: "authenticated_user" });
    }

    return NextResponse.json(
      { error: "Service role key not configured on server" },
      { status: 501 }
    );
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
