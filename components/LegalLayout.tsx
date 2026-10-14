"use client";

import Link from "next/link";
import ThemeToggle from "./ThemeToggle";

interface LegalLayoutProps {
  title: string;
  subtitle: string;
  lastUpdated?: string;
  activePath: "/privacy" | "/terms" | "/about";
  children: React.ReactNode;
}

export default function LegalLayout({
  title,
  subtitle,
  lastUpdated,
  activePath,
  children,
}: LegalLayoutProps) {
  return (
    <div className="legal-shell">
      {/* Top Navigation Bar */}
      <header className="legal-topbar">
        <div className="legal-topbar-inner">
          <Link href="/" className="legal-brand" title="Back to CA Studyspace Home">
            <span className="legal-brand-badge">CA</span>
            <strong>Studyspace</strong>
          </Link>

          <nav className="legal-nav-links">
            <Link
              href="/about"
              className={`legal-nav-link ${activePath === "/about" ? "active" : ""}`}
            >
              About Us
            </Link>
            <Link
              href="/privacy"
              className={`legal-nav-link ${activePath === "/privacy" ? "active" : ""}`}
            >
              Privacy Policy
            </Link>
            <Link
              href="/terms"
              className={`legal-nav-link ${activePath === "/terms" ? "active" : ""}`}
            >
              Terms of Service
            </Link>
          </nav>

          <div className="legal-topbar-actions">
            <ThemeToggle />
            <Link href="/" className="legal-cta-button">
              Open App ↗
            </Link>
          </div>
        </div>

        {/* Mobile Legal Navigation Strip */}
        <nav className="legal-mobile-subnav" aria-label="Legal documents">
          <Link
            href="/about"
            className={`legal-mobile-subnav-link ${activePath === "/about" ? "active" : ""}`}
          >
            About Us
          </Link>
          <Link
            href="/privacy"
            className={`legal-mobile-subnav-link ${activePath === "/privacy" ? "active" : ""}`}
          >
            Privacy Policy
          </Link>
          <Link
            href="/terms"
            className={`legal-mobile-subnav-link ${activePath === "/terms" ? "active" : ""}`}
          >
            Terms of Service
          </Link>
        </nav>
      </header>

      {/* Hero Banner */}
      <section className="legal-hero">
        <div className="legal-hero-inner">
          <div className="legal-kicker">CA STUDYSPACE · OFFICIAL POLICIES</div>
          <h1>{title}</h1>
          <p className="legal-subtitle">{subtitle}</p>
          {lastUpdated && (
            <div className="legal-meta-row">
              <span className="legal-status-pill">● Verified Document</span>
              <span>Effective & Last Updated: <strong>{lastUpdated}</strong></span>
            </div>
          )}
        </div>
      </section>

      {/* Main Document Content */}
      <main className="legal-main">
        <div className="legal-container">
          <div className="legal-content-card">
            {children}
          </div>
        </div>
      </main>

      {/* Comprehensive Footer */}
      <footer className="legal-footer">
        <div className="legal-footer-inner">
          <div className="legal-footer-top">
            <div className="legal-footer-info">
              <Link href="/" className="legal-brand">
                <span className="legal-brand-badge">CA</span>
                <strong>Studyspace</strong>
              </Link>
              <p>
                An independent, community-driven study workspace built for CA Foundation aspirants across India.
              </p>
              <small className="legal-icai-notice">
                Statutory Disclaimer: CA Studyspace is an independent student initiative and is not affiliated with, endorsed by, or sponsored by the Institute of Chartered Accountants of India (ICAI).
              </small>
            </div>

            <div className="legal-footer-columns">
              <div className="legal-col">
                <strong>Platform Navigation</strong>
                <Link href="/">Home & App</Link>
                <Link href="/about">About CA Studyspace</Link>
                <a href="/#features">Platform Features</a>
                <a href="/#how-it-works">How Pomodoro Works</a>
              </div>

              <div className="legal-col">
                <strong>Legal & Compliance</strong>
                <Link href="/privacy">Privacy Policy</Link>
                <Link href="/terms">Terms of Service</Link>
                <a href="mailto:castudyspace-support@gmail.com">Student Support</a>
                <a href="mailto:castudyspace-support@gmail.com">Legal Inquiries</a>
              </div>
            </div>
          </div>

          <div className="legal-footer-bottom">
            <span>© {new Date().getFullYear()} CA Studyspace. All rights reserved. Free educational initiative.</span>
            <div className="legal-bottom-pills">
              <span className="pill">100% Free For Students</span>
              <span className="pill">Independent Initiative</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
