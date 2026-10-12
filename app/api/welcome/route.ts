import { NextResponse } from "next/server";
import { getWelcomeEmailHtml } from "@/lib/welcome-email";
import nodemailer from "nodemailer";

export async function POST(req: Request) {
  try {
    const { email, name } = await req.json();

    if (!email || typeof email !== "string" || !email.includes("@")) {
      return NextResponse.json({ error: "Invalid email" }, { status: 400 });
    }

    const recipientName = typeof name === "string" && name ? name : "Aspirant";
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://ca-studyspace.vercel.app";
    const html = getWelcomeEmailHtml(recipientName, siteUrl);
    const subject = "Welcome to CA Studyspace! 🎓 Your study desk is ready";

    // 1. Try Resend if RESEND_API_KEY is available
    if (process.env.RESEND_API_KEY) {
      const fromAddress = process.env.RESEND_FROM || "CA Studyspace <onboarding@resend.dev>";
      const resendRes = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: fromAddress,
          to: email,
          subject,
          html,
        }),
      });

      if (resendRes.ok) {
        return NextResponse.json({ success: true, provider: "resend" });
      }
      const errData = await resendRes.json();
      console.warn("[Welcome Email] Resend API error:", errData);
    }

    // 2. Try Gmail SMTP if GMAIL_USER / GMAIL_APP_PASSWORD are provided
    const smtpUser = process.env.GMAIL_USER || process.env.SMTP_USER;
    const smtpPass = process.env.GMAIL_APP_PASSWORD || process.env.SMTP_PASS;

    if (smtpUser && smtpPass) {
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: smtpUser,
          pass: smtpPass,
        },
      });

      await transporter.sendMail({
        from: `"CA Studyspace" <${smtpUser}>`,
        to: email,
        subject,
        html,
      });

      return NextResponse.json({ success: true, provider: "gmail" });
    }

    // 3. Fallback when credentials are not yet set
    return NextResponse.json({
      success: true,
      delivered: false,
      note: "Welcome email skipped. Configure RESEND_API_KEY or GMAIL_APP_PASSWORD in environment variables to deliver live.",
    });
  } catch (error) {
    console.error("[Welcome Email] Failed to send:", error);
    return NextResponse.json(
      { error: (error as Error).message || "Internal error" },
      { status: 500 }
    );
  }
}
