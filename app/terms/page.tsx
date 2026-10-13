import type { Metadata } from "next";
import LegalLayout from "@/components/LegalLayout";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Terms of Service and user agreement for CA Studyspace, governing acceptable use, anti-cheat policies, community conduct, and legal disclaimers.",
  alternates: { canonical: "/terms" },
};

export default function TermsOfServicePage() {
  return (
    <LegalLayout
      title="Terms of Service"
      subtitle="The conditions, community standards, and fair-play policies that govern your use of the CA Studyspace platform."
      lastUpdated="October 13, 2026"
      activePath="/terms"
    >
      <div className="legal-article">
        {/* Important Disclaimer Banner */}
        <div className="legal-callout warning">
          <div className="legal-callout-icon">⚖️</div>
          <div>
            <strong>Mandatory Statutory Notice regarding ICAI:</strong>
            <p>
              CA Studyspace is an independent student platform created for educational preparation purposes. CA Studyspace is <strong>NOT</strong> affiliated with, endorsed by, sponsored by, or connected to the Institute of Chartered Accountants of India (ICAI). ICAI does not endorse or review any user content, mock tests, or AI explanations generated on this platform.
            </p>
          </div>
        </div>

        {/* Section 1 */}
        <section className="legal-section">
          <h2>1. Acceptance of Terms</h2>
          <p>
            By accessing, browsing, registering for, or utilizing CA Studyspace (the &ldquo;Service&rdquo; or &ldquo;Platform&rdquo;), you acknowledge that you have read, understood, and agree to be bound by these Terms of Service (&ldquo;Terms&rdquo;) and our Privacy Policy. If you do not agree with any part of these Terms, you must discontinue using the platform immediately.
          </p>
        </section>

        {/* Section 2 */}
        <section className="legal-section">
          <h2>2. Eligibility & Account Security</h2>
          <ul>
            <li>
              <strong>Eligibility:</strong> The Service is designed for CA Foundation students and aspiring professional accountants. You must provide valid, accurate registration credentials.
            </li>
            <li>
              <strong>Account Confidentiality:</strong> You are responsible for safeguarding your login credentials. You agree to notify us immediately of any unauthorized access or breach of security.
            </li>
            <li>
              <strong>One Account Per User:</strong> To preserve the competitive integrity of leaderboards and study statistics, users may not create multiple duplicate accounts to artificially boost ranks or bypass moderation bans.
            </li>
          </ul>
        </section>

        {/* Section 3 */}
        <section className="legal-section">
          <h2>3. Community Conduct & Content Standards</h2>
          <p>
            CA Studyspace hosts interactive community areas including live study rooms, discussion forums, and shared notes. When participating, you strictly agree NOT to:
          </p>
          <div className="legal-rules-grid">
            <div className="legal-rule-card">
              <strong>🚫 Zero Harassment or Hate Speech</strong>
              <p>Bullying, abusive language, discriminatory remarks, or hostile behavior towards fellow aspirants is strictly prohibited.</p>
            </div>
            <div className="legal-rule-card">
              <strong>🚫 No Pirated Commercial Material</strong>
              <p>Uploading unauthorized copies of paid coaching classes, commercial watermarked books, or test bank leaks is forbidden. Only original student notes and public ICAI educational material may be shared.</p>
            </div>
            <div className="legal-rule-card">
              <strong>🚫 No Commercial Spam or Promotion</strong>
              <p>Promoting third-party coaching institutes, selling study material, or posting affiliate links without explicit written permission is prohibited.</p>
            </div>
            <div className="legal-rule-card">
              <strong>🚫 No Impersonation or Defamation</strong>
              <p>Impersonating ICAI officials, faculty members, moderators, or other students will result in immediate permanent account termination.</p>
            </div>
          </div>
          <p style={{ marginTop: "14px" }}>
            Our community moderators reserve the unilateral right to delete offensive messages, hide flagged notes, and revoke room access without prior notice.
          </p>
        </section>

        {/* Section 4 */}
        <section className="legal-section highlight-box">
          <h2>4. Gamification, XP & Anti-Cheat Fair Play Policy</h2>
          <p>
            The CA Studyspace gamification hierarchy (spanning from Plastic up through Grandmaster) exists to motivate consistent, disciplined daily study habits.
          </p>
          <div className="legal-notice-box">
            <strong>Anti-Cheat Rules:</strong>
            <ul>
              <li>
                <strong>Verified Focus Sessions Only:</strong> Experience Points (XP) are awarded exclusively for verified Pomodoro sessions, mock tests, and active study drills.
              </li>
              <li>
                <strong>Manual Log Policy:</strong> Manually typed study logs do NOT award XP to prevent fraudulent score inflation and fake leaderboards.
              </li>
              <li>
                <strong>Prohibition on Automation:</strong> The use of headless browsers, bots, automated scripts, or fraudulent timer manipulators is strictly prohibited. Accounts caught engaging in XP fraud will have their score reset to 0 XP and their leaderboard eligibility permanently revoked.
              </li>
            </ul>
          </div>
        </section>

        {/* Section 5 */}
        <section className="legal-section">
          <h2>5. Dedicated AI CA Doubt Assistant — Usage & Disclaimers</h2>
          <p>
            CA Studyspace provides an AI-powered CA Doubt Assistant designed to clarify concepts across CA Foundation subjects (Accounting, Business Laws, Quantitative Aptitude, and Business Economics).
          </p>
          <ul>
            <li>
              <strong>Educational Study Aid Only:</strong> All explanations, legal case law summaries, journal entries, and math formulas provided by the AI assistant are generated by algorithmic models solely for revision assistance.
            </li>
            <li>
              <strong>Not Professional Advice:</strong> AI answers do not constitute formal chartered accountancy opinions, legal counsel, or statutory interpretations.
            </li>
            <li>
              <strong>Verification with Official Syllabus:</strong> Students are strongly advised to corroborate all AI responses with the latest official Study Modules, RTPs, MTPs, and Bare Acts published by ICAI.
            </li>
            <li>
              <strong>Free Access Guarantee:</strong> The AI Doubt Assistant is provided full free of charge for student revision, without mandatory token paywalls or hidden fees.
            </li>
          </ul>
        </section>

        {/* Section 6 */}
        <section className="legal-section">
          <h2>6. Platform Monetization & Advertisements</h2>
          <p>
            To provide this entire suite of tools—including live rooms, Pomodoro timers, notes libraries, and AI doubt solvers—at zero cost to students, CA Studyspace may display unobtrusive third-party advertisements (such as Google AdSense).
          </p>
          <p>
            By using the platform, you agree to the display of these advertisements. You agree not to employ automated tools to artificially click or inflate ad impressions.
          </p>
        </section>

        {/* Section 7 */}
        <section className="legal-section">
          <h2>7. Intellectual Property</h2>
          <ul>
            <li>
              <strong>Platform Property:</strong> The CA Studyspace interface design, logo, emblem illustrations, code, algorithms, and features are the exclusive intellectual property of CA Studyspace.
            </li>
            <li>
              <strong>User Content:</strong> You retain ownership of the study notes and summaries you create. By uploading them to the public library, you grant CA Studyspace a non-exclusive license to display them to other students on the platform.
            </li>
            <li>
              <strong>Third-Party Trademarks:</strong> &ldquo;ICAI&rdquo;, &ldquo;Chartered Accountant&rdquo;, &ldquo;CA Foundation&rdquo;, and official course titles are registered trademarks of their respective owners and are mentioned herein strictly under descriptive fair use.
            </li>
          </ul>
        </section>

        {/* Section 8 */}
        <section className="legal-section">
          <h2>8. Disclaimer of Warranties & Limitation of Liability</h2>
          <p>
            The Service is provided on an &ldquo;AS IS&rdquo; and &ldquo;AS AVAILABLE&rdquo; basis. CA Studyspace makes no representations or warranties that:
          </p>
          <ol>
            <li>The service will be uninterrupted, error-free, or completely secure at all times.</li>
            <li>Using this platform will guarantee passing marks, ranks, or examination results in ICAI CA Foundation or any subsequent level.</li>
          </ol>
          <p>
            To the maximum extent permitted by applicable law, CA Studyspace shall not be liable for any direct, indirect, incidental, consequential, or punitive damages arising out of your access or inability to access the platform.
          </p>
        </section>

        {/* Section 9 */}
        <section className="legal-section">
          <h2>9. Termination</h2>
          <p>
            We reserve the right to suspend, deactivate, or terminate your account and access to the Service at our sole discretion, without prior notice, for conduct that violates these Terms or harms other students or the platform.
          </p>
        </section>

        {/* Section 10 */}
        <section className="legal-section">
          <h2>10. Governing Law & Jurisdiction</h2>
          <p>
            These Terms shall be governed by and construed in accordance with the laws of India. Any disputes arising out of or related to these Terms shall be subject to the exclusive jurisdiction of the competent courts in India.
          </p>
        </section>

        {/* Section 11 */}
        <section className="legal-section">
          <h2>11. Contact & Grievance Officer</h2>
          <p>
            For legal inquiries, copyright notices, or community grievances, please reach out to:
          </p>
          <div className="legal-contact-card">
            <strong>CA Studyspace Legal & Community Compliance</strong>
            <p>Email: <a href="mailto:legal@castudyspace.in">legal@castudyspace.in</a></p>
            <p>Website: <Link href="/">castudyspace.in</Link></p>
          </div>
        </section>
      </div>
    </LegalLayout>
  );
}
