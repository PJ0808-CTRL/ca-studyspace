export function getWelcomeEmailHtml(name: string, siteUrl: string): string {
  const safeName = name ? name.split(" ")[0] : "Aspirant";
  const deskUrl = siteUrl || "https://caorbit.vercel.app";

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Welcome to CA Orbit!</title>
</head>
<body style="margin:0;padding:24px 12px;background:#f3f7f4;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#162a22;">
  <div style="max-width:540px;margin:0 auto;background:#ffffff;border-radius:14px;border:1px solid #d9e8dc;overflow:hidden;box-shadow:0 8px 24px rgba(24,88,56,0.06);">
    
    <!-- Header -->
    <div style="background:linear-gradient(135deg,#185838 0%,#103d27 100%);padding:26px 28px;text-align:center;">
      <span style="display:inline-block;background:#ffffff;color:#185838;font-weight:900;font-size:14px;padding:4px 8px;border-radius:5px;vertical-align:middle;">CA</span>
      <span style="font-family:Georgia,serif;font-size:24px;font-weight:700;color:#ffffff;margin-left:7px;vertical-align:middle;">Orbit</span>
      <div style="margin-top:8px;">
        <span style="font-size:10px;font-weight:800;color:#b6f0ce;letter-spacing:1.2px;text-transform:uppercase;">CA FOUNDATION ASPIRANT DESK</span>
      </div>
    </div>

    <!-- Body -->
    <div style="padding:32px 28px;">
      <h2 style="font-family:Georgia,serif;font-size:23px;color:#15452d;margin:0 0 12px 0;">
        Welcome to your study desk, ${safeName}!
      </h2>
      <p style="font-size:14.5px;line-height:1.6;color:#435e50;margin:0 0 20px 0;">
        Your CA Orbit account is live and ready. Whether you are balancing ledgers in Accounting, memorizing provisions in Business Laws, tackling Quantitative Aptitude, or studying Economics, you now have a dedicated space to prepare with fellow aspirants.
      </p>

      <!-- Key Features Box -->
      <div style="background:#f7faf8;border:1px solid #e2ede5;border-radius:10px;padding:18px 20px;margin:22px 0;">
        <strong style="font-size:12px;color:#185838;letter-spacing:0.8px;text-transform:uppercase;display:block;margin-bottom:10px;">
          What is ready on your desk:
        </strong>
        <p style="margin:6px 0;font-size:13px;color:#335242;line-height:1.5;">
          &#127813; <strong>Focus Pomodoro:</strong> Timed study blocks with ambient sounds &amp; motivational quotes.
        </p>
        <p style="margin:6px 0;font-size:13px;color:#335242;line-height:1.5;">
          &#128218; <strong>Syllabus Progress:</strong> Track chapters across all 4 CA Foundation subjects.
        </p>
        <p style="margin:6px 0;font-size:13px;color:#335242;line-height:1.5;">
          &#128172; <strong>Live Rooms &amp; Discussions:</strong> Ask conceptual doubts and revise together in real time.
        </p>
      </div>

      <!-- Action Button -->
      <div style="text-align:center;margin:26px 0 20px 0;">
        <a href="${deskUrl}" target="_blank" style="display:inline-block;background-color:#185838;color:#ffffff;font-size:15px;font-weight:700;text-decoration:none;padding:14px 36px;border-radius:9px;box-shadow:0 5px 15px rgba(24,88,56,0.25);">
          Open My Study Desk &rarr;
        </a>
      </div>

      <p style="font-size:12.5px;color:#6d8a7a;text-align:center;margin:16px 0 0 0;">
        Kal par mat chhod, ladle &mdash; make today's study session count!
      </p>
    </div>

    <!-- Footer -->
    <div style="background:#f8fbf8;border-top:1px solid #e2ede4;padding:16px 28px;text-align:center;">
      <p style="font-size:11px;font-weight:700;color:#185838;margin:0;">
        &copy; 2026 CA Orbit &bull; Study Better Together
      </p>
    </div>

  </div>
</body>
</html>`;
}
