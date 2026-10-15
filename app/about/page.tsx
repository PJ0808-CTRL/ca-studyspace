import type { Metadata } from "next";
import LegalLayout from "@/components/LegalLayout";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About Us",
  description: "Learn about the mission, features, and story behind CA Orbit — the 100% free, focused study platform for CA Foundation aspirants across India.",
  alternates: { canonical: "/about" },
};

export default function AboutUsPage() {
  return (
    <LegalLayout
      title="About CA Orbit"
      subtitle="Built by aspirants, for aspirants. Giving every CA Foundation student a focused, distraction-free study desk and structured progress tools."
      lastUpdated="October 15, 2026"
      activePath="/about"
    >
      <div className="legal-article">
        {/* Mission Statement Hero Box */}
        <div className="about-hero-box">
          <span className="about-kicker">OUR CORE MISSION</span>
          <h2>A dedicated digital study room for the toughest examination journey in India.</h2>
          <p>
            Preparing for CA Foundation requires hundreds of hours of solitary discipline. CA Orbit was built to replace aimless scrolling and loneliness with deep focus, transparent progress tracking, verified motivation, and structured academic productivity.
          </p>
        </div>

        {/* Section 1: The Problem & Origin */}
        <section className="legal-section">
          <h2>1. Why CA Orbit Exists</h2>
          <p>
            Every year, lakhs of passionate students across India register for the CA Foundation exam. Yet, over 70% of students struggle with the exact same challenges:
          </p>
          <div className="about-challenges-grid">
            <div className="about-challenge-card">
              <span className="about-challenge-num">01</span>
              <strong>Solitary Preparation Fatigue</strong>
              <p>Studying from home without a batch or study desk leads to burnout, self-doubt, and inconsistent daily study hours.</p>
            </div>
            <div className="about-challenge-card">
              <span className="about-challenge-num">02</span>
              <strong>Distracting Social Media Groups</strong>
              <p>WhatsApp and Telegram study groups often dissolve into memes, chatter, spam, and anxiety rather than real focus.</p>
            </div>
            <div className="about-challenge-card">
              <span className="about-challenge-num">03</span>
              <strong>Unstructured Study Tracking</strong>
              <p>Without disciplined milestone tracking and peer benchmarks, it is easy to lose track of syllabus completion targets.</p>
            </div>
          </div>
          <p style={{ marginTop: "16px" }}>
            We created <strong>CA Orbit</strong> to fix this: an all-in-one, clean, elegant web workspace with zero distractions, authentic peer study rooms, verified gamified ranks, and a centralized library of ICAI resources.
          </p>
        </section>

        {/* Section 2: Core Platform Pillars */}
        <section className="legal-section">
          <h2>2. The Three Pillars of Our Platform</h2>
          <div className="about-pillars-stack">
            <div className="about-pillar-row">
              <div className="about-pillar-icon">◷</div>
              <div className="about-pillar-content">
                <h3>1. Pomodoro Focus Studio & Syllabus Tracking</h3>
                <p>
                  Built specifically for 25-minute, 45-minute, and 50-minute exam study sprints. Smooth visual orbit timers, ambient focus sounds, and automated study logging that builds compounding study streaks.
                </p>
              </div>
            </div>

            <div className="about-pillar-row">
              <div className="about-pillar-icon">◈</div>
              <div className="about-pillar-content">
                <h3>2. Fair Gamification & Anti-Cheat Ranks</h3>
                <p>
                  Progress from <strong>Plastic Tier</strong> all the way to <strong>Grandmaster</strong>. To maintain true academic honesty, manual study hours do not award XP; experience points are unlocked strictly through verified Pomodoro sessions, mock tests, and spaced revisions.
                </p>
              </div>
            </div>

            <div className="about-pillar-row">
              <div className="about-pillar-icon">↗</div>
              <div className="about-pillar-content">
                <h3>3. Curated Notes & Official ICAI Materials Index</h3>
                <p>
                  Direct, one-click access to official ICAI question papers, Revision Test Papers (RTPs), Mock Test Papers (MTPs), suggested answers, and student-shared summaries in one centralized library.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Section 3: Why We Are 100% Free */}
        <section className="legal-section highlight-box">
          <h2>3. Our Commitment: Free Education, Supported by Non-Intrusive Ads</h2>
          <p>
            We believe that every aspiring Chartered Accountant—whether studying in a metro city or a small village—deserves equal access to premium productivity and focus tools.
          </p>
          <div className="legal-notice-box">
            <strong>Why there is NO subscription paywall on CA Orbit:</strong>
            <p>
              Rather than locking features behind expensive recurring subscriptions, CA Orbit is supported through minimal, clean third-party advertisements (such as Google AdSense). This ensures:
            </p>
            <ul>
              <li><strong>Zero Cost for Students:</strong> Every tool, timer, mock test, and shared note feature remains accessible to all.</li>
              <li><strong>Clean Study Focus:</strong> Advertisements are non-intrusive and never interrupt active Pomodoro focus cycles.</li>
              <li><strong>Continuous Maintenance:</strong> Ad revenue directly funds our database servers, file storage, and cloud hosting.</li>
            </ul>
          </div>
        </section>

        {/* Section 4: Academic Integrity & ICAI Disclaimer */}
        <section className="legal-section">
          <h2>4. Academic Integrity & Statutory Disclaimer</h2>
          <div className="legal-callout warning">
            <div className="legal-callout-icon">🏛️</div>
            <div>
              <strong>Non-Affiliation Notice:</strong>
              <p>
                CA Orbit is an independent student initiative created to support CA Foundation aspirants. CA Orbit is <strong>NOT affiliated with, endorsed by, or sponsored by the Institute of Chartered Accountants of India (ICAI)</strong>. All study materials, question papers, and syllabus syllabi are the intellectual property of their respective owners.
              </p>
            </div>
          </div>
        </section>

        {/* Section 5: Join the Community CTA */}
        <section className="about-cta-card">
          <h2>Ready to transform your CA Foundation prep?</h2>
          <p>Join thousands of aspirants building disciplined, daily focus routines on CA Orbit today.</p>
          <div className="about-cta-actions">
            <Link href="/" className="primary about-cta-desk-btn">
              Open CA Orbit Desk ↗
            </Link>
            <Link href="/privacy" className="about-cta-privacy-btn">
              Read Privacy Policy
            </Link>
          </div>
        </section>
      </div>
    </LegalLayout>
  );
}
