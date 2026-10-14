import type { Metadata } from "next";
import LegalLayout from "@/components/LegalLayout";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Learn how CA Studyspace collects, protects, and manages user information, cookies, and privacy rights in compliance with industry standards and Google AdSense policies.",
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPolicyPage() {
  return (
    <LegalLayout
      title="Privacy Policy"
      subtitle="How CA Studyspace collects, safeguards, and respects your personal study data, authentication credentials, and privacy rights."
      lastUpdated="October 13, 2026"
      activePath="/privacy"
    >
      <div className="legal-article">
        {/* Quick Summary Callout */}
        <div className="legal-callout">
          <div className="legal-callout-icon">🛡️</div>
          <div>
            <strong>Summary for Students:</strong>
            <p>
              We prioritize your study focus. We never sell your personal information or spam you. We use your data strictly to sync your study logs, Pomodoro focus cycles, and leaderboard ranks. We display non-intrusive advertisements to keep this platform 100% free for all CA aspirants.
            </p>
          </div>
        </div>

        {/* Section 1 */}
        <section className="legal-section">
          <h2>1. Introduction & Scope</h2>
          <p>
            Welcome to CA Studyspace (referred to herein as &ldquo;CA Studyspace&rdquo;, &ldquo;we&rdquo;, &ldquo;our&rdquo;, or &ldquo;the Platform&rdquo;). We are committed to protecting your privacy and ensuring transparency regarding how your data is handled while you prepare for your Chartered Accountancy examinations.
          </p>
          <p>
            This Privacy Policy applies to all services, features, Pomodoro tools, discussion boards, study rooms, notes libraries, and resources available at <strong>castudyspace.vercel.app</strong> and its subdomains.
          </p>
        </section>

        {/* Section 2 */}
        <section className="legal-section">
          <h2>2. Information We Collect</h2>
          <p>We collect information to provide a personalized, uninterrupted study environment:</p>
          <ul>
            <li>
              <strong>Account & Profile Information:</strong> When you register on CA Studyspace, we collect your email address, securely hashed password (managed via Supabase Authentication), chosen display name, target CA Foundation exam attempt (e.g., May/November), and optional profile notes.
            </li>
            <li>
              <strong>Study Activity & Focus Data:</strong> To help you monitor syllabus progress, we collect session durations, chosen subjects (Accounting, Business Laws, Quantitative Aptitude, Business Economics), Pomodoro timers completed, streak days, mock test completions, and earned experience points (XP).
            </li>
            <li>
              <strong>User-Generated Study Content:</strong> Any summaries or notes you upload to the shared library, questions posted in discussion forums, and chat messages sent in public live study rooms.
            </li>
            <li>
              <strong>Technical & Device Data:</strong> For security, session stability, and fraud prevention, we automatically receive your IP address, browser type, operating system version, and timestamps of interaction.
            </li>
          </ul>
        </section>

        {/* Section 3 */}
        <section className="legal-section">
          <h2>3. How We Use Your Information</h2>
          <p>Your data is utilized solely for the following legitimate educational purposes:</p>
          <ol>
            <li>To track and display your daily, weekly, and subject-wise study progress in your personal Dashboard.</li>
            <li>To power the gamified rank hierarchy (Plastic through Grandmaster) and authenticate fair Pomodoro XP allocations.</li>
            <li>To facilitate peer interaction in virtual study rooms and discussion threads.</li>
            <li>To send important transactional notifications, such as welcome onboarding emails and password resets.</li>
            <li>To protect against malicious behavior, abuse of community rooms, automated spam bots, and anti-cheat violations.</li>
          </ol>
        </section>

        {/* Section 4 */}
        <section className="legal-section">
          <h2>4. Cookies & Local Storage Technologies</h2>
          <p>
            CA Studyspace uses standard browser storage mechanisms—predominantly <code>localStorage</code>—to ensure a seamless user experience. We use these technologies to:
          </p>
          <ul>
            <li>Remember your selected interface theme (Light Mode vs. Dark Mode) across page refreshes.</li>
            <li>Persist your active Pomodoro timer countdown so your study focus isn&apos;t interrupted if you switch tabs.</li>
            <li>Securely store your active authentication session tokens so you don&apos;t have to log in repeatedly on the same device.</li>
            <li>Store local draft inputs for discussions or notes before final submission.</li>
          </ul>
          <p>
            You can clear local storage or cookies at any time via your browser settings; however, doing so may log you out of your active session.
          </p>
        </section>

        {/* Section 5 - AdSense Compliance */}
        <section className="legal-section highlight-box">
          <h2>5. Third-Party Advertising & Google AdSense Compliance</h2>
          <p>
            To keep CA Studyspace <strong>100% free of charge</strong> for all CA aspirants and eliminate subscription paywalls, we partner with third-party advertising networks, including <strong>Google AdSense</strong>, to serve advertisements on the site.
          </p>
          <div className="legal-notice-box">
            <strong>Disclosure regarding Google AdSense & Cookies:</strong>
            <ul>
              <li>
                Third-party vendors, including Google, use cookies to serve ads based on a user&apos;s prior visits to our website or other websites on the Internet.
              </li>
              <li>
                Google&apos;s use of advertising cookies enables it and its partners to serve personalized ads to users based on their visits to CA Studyspace and/or other sites across the World Wide Web.
              </li>
              <li>
                <strong>Opt-out options:</strong> You may opt out of personalized advertising by visiting the official Google Ad Settings at{" "}
                <a
                  href="https://www.google.com/settings/ads"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="legal-external-link"
                >
                  www.google.com/settings/ads ↗
                </a>{" "}
                or alternatively by visiting{" "}
                <a
                  href="https://www.aboutads.info/choices/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="legal-external-link"
                >
                  www.aboutads.info ↗
                </a>.
              </li>
            </ul>
          </div>
          <p>
            We enforce strict standards to ensure advertisements displayed are non-intrusive, academically safe, and do not interfere with student focus during active Pomodoro sessions.
          </p>
        </section>

        {/* Section 6 */}
        <section className="legal-section">
          <h2>6. Data Storage & Security Safeguards</h2>
          <p>
            Your account credentials, database records, and study logs are secured with enterprise-grade cloud providers (Supabase / PostgreSQL hosted on Amazon Web Services).
          </p>
          <ul>
            <li>All communications between your browser and our servers are encrypted using modern Transport Layer Security (TLS/HTTPS).</li>
            <li>User passwords are one-way cryptographic hashes and can never be viewed in plain text by anyone, including administrators.</li>
            <li>Row-Level Security (RLS) policies ensure that private study notes and account settings are accessible exclusively by the authenticated account holder.</li>
          </ul>
        </section>

        {/* Section 7 */}
        <section className="legal-section">
          <h2>7. Data Retention & Your Rights (Data Deletion)</h2>
          <p>
            You retain full ownership and control over your personal study records:
          </p>
          <ul>
            <li><strong>Right to Access:</strong> You can view all logged study hours, notes, and activity directly in your Dashboard and Profile.</li>
            <li><strong>Right to Rectification:</strong> You can modify your name, exam attempt, and study goals in the Settings tab.</li>
            <li><strong>Right to Erasure (Account Deletion):</strong> You may request the permanent deletion of your profile, all study logs, and notes by contacting support or selecting account deletion in Settings. Once deleted, all associated data is permanently purged from our primary database.</li>
          </ul>
        </section>

        {/* Section 8 */}
        <section className="legal-section">
          <h2>8. Children&apos;s & Student Privacy</h2>
          <p>
            CA Studyspace is designed for senior secondary students and college/professional aspirants preparing for the CA Foundation exam (typically ages 16 and above). We do not knowingly collect personal identifiable information from children under the age of 13.
          </p>
        </section>

        {/* Section 9 */}
        <section className="legal-section">
          <h2>9. Statutory Non-Affiliation Disclaimer</h2>
          <div className="legal-callout warning">
            <div className="legal-callout-icon">ℹ️</div>
            <div>
              <strong>Non-Affiliation Notice:</strong>
              <p>
                CA Studyspace is an independent student initiative. It is not affiliated with, endorsed by, sponsored by, or connected to the Institute of Chartered Accountants of India (ICAI). All official ICAI study materials and publications remain the intellectual property of ICAI.
              </p>
            </div>
          </div>
        </section>

        {/* Section 10 */}
        <section className="legal-section">
          <h2>10. Updates to This Policy</h2>
          <p>
            We may update this Privacy Policy from time to time to reflect operational changes or statutory legal compliance. When changes are published, the &ldquo;Last Updated&rdquo; date at the top of this page will be revised accordingly.
          </p>
        </section>

        {/* Section 11 */}
        <section className="legal-section">
          <h2>11. Contact Us</h2>
          <p>
            If you have questions, feedback, or privacy-related requests regarding this Privacy Policy, please reach out to:
          </p>
          <div className="legal-contact-card">
            <strong>CA Studyspace Privacy & Compliance Desk</strong>
            <p>Email: <a href="mailto:castudyspacesupport@gmail.com">castudyspacesupport@gmail.com</a></p>
            <p>Platform: <Link href="/">castudyspace.vercel.app</Link></p>
            <p>Response Time: Typically within 24–48 business hours</p>
          </div>
        </section>
      </div>
    </LegalLayout>
  );
}
