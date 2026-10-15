"use client";

import { useState } from "react";
import ThemeToggle from "@/components/ThemeToggle";

export default function Landing({
  onStart,
  onLogin,
  onModerator,
}: {
  onStart: () => void;
  onLogin: () => void;
  onModerator: () => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);

  function scrollTo(id: string) {
    setMenuOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  }

  return (
    <div className="landing-page">
      <header className="landing-nav">
        <a className="landing-brand" href="#top" aria-label="CA Orbit home">
          <span>CA</span> Orbit
        </a>
        <nav className="landing-desktop-nav" aria-label="Homepage navigation">
          <a href="#features" onClick={e => { e.preventDefault(); scrollTo("features"); }}>Features</a>
          <a href="#how-it-works" onClick={e => { e.preventDefault(); scrollTo("how-it-works"); }}>How it works</a>
          <a href="#subjects" onClick={e => { e.preventDefault(); scrollTo("subjects"); }}>Subjects</a>
          <a href="/about">About</a>
        </nav>
        <div className="landing-nav-actions">
          <ThemeToggle />
          <button className="landing-mod-btn" onClick={onModerator} title="Moderator Portal" aria-label="Moderator Portal">
            <span className="mod-shield-icon">🛡️</span>
            <span className="mod-text">Moderator Portal</span>
          </button>
          <button className="landing-login" onClick={onLogin}>Log in</button>
          <button className="landing-start" onClick={onStart}>Start studying</button>
          <button
            className="landing-menu-toggle"
            onClick={() => setMenuOpen(prev => !prev)}
            aria-label="Toggle navigation menu"
            aria-expanded={menuOpen}
          >
            {menuOpen ? "✕" : "☰"}
          </button>
        </div>
        {menuOpen && (
          <div className="landing-mobile-dropdown">
            <a href="#features" onClick={e => { e.preventDefault(); scrollTo("features"); }}>Features</a>
            <a href="#how-it-works" onClick={e => { e.preventDefault(); scrollTo("how-it-works"); }}>How it works</a>
            <a href="#subjects" onClick={e => { e.preventDefault(); scrollTo("subjects"); }}>Subjects</a>
            <a href="/about">About Us</a>
            <a href="/privacy">Privacy Policy</a>
            <a href="/terms">Terms of Service</a>
            <button className="landing-mod-btn mobile-item" onClick={onModerator}>
              <span>🛡️</span> Moderator Portal
            </button>
            <div className="landing-mobile-auth">
              <button className="landing-login mobile" onClick={onLogin}>Log in</button>
              <button className="landing-start mobile" onClick={onStart}>Start studying →</button>
            </div>
          </div>
        )}
      </header>
      <main id="top">
        <section className="landing-hero">
          <div className="hero-copy">
            <div className="landing-kicker">BUILT FOR CA FOUNDATION</div>
            <h1>Study with <em>clarity.</em><br />Grow with consistency.</h1>
            <p>One focused space to plan your day, run Pomodoro sessions, share notes, discuss difficult concepts, and find official ICAI papers.</p>
            <div className="hero-cta">
              <button className="landing-start large" onClick={onStart}>Launch your free study orbit <span>↗</span></button>
              <button className="hero-link" onClick={() => scrollTo("features")}>Explore the workspace ↓</button>
            </div>
            <div className="hero-trust">
              <span><b>✓</b> Built for all 4 Foundation subjects</span>
              <span><b>✓</b> Your progress stays private</span>
            </div>
          </div>
          <div className="hero-visual" aria-label="Animated preview of CA Orbit">
            <div className="visual-glow" />
            <div className="preview-window">
              <div className="preview-top">
                <span className="preview-mark">CA <b>Orbit.</b></span>
                <div><i /><i /><i /></div>
              </div>
              <div className="preview-body">
                <aside><span className="active">▦</span><span>◷</span><span>◉</span><span>▤</span></aside>
                <div className="preview-content">
                  <div className="preview-greeting">
                    <span>GOOD MORNING, ASPIRANT</span>
                    <strong>Ready for a focused day?</strong>
                  </div>
                  <div className="preview-goal">
                    <div>
                      <span>TODAY&apos;S TARGET</span>
                      <strong>75 <small>/ 120 min</small></strong>
                      <div><i /></div>
                    </div>
                    <b>63%<small>complete</small></b>
                  </div>
                  <div className="preview-lower">
                    <div className="preview-chart">
                      <span>THIS WEEK</span>
                      <div>{[42, 70, 36, 86, 58, 74, 28].map((height, index) => <i style={{ height: `${height}%` }} key={index} />)}</div>
                    </div>
                    <div className="preview-focus">
                      <span>FOCUS SESSION</span>
                      <strong>24:36</strong>
                      <small>Business Laws</small>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="float-card note-float">
              <span>▤</span>
              <div><b>New shared note</b><small>Accounting · Partnership</small></div>
            </div>
            <div className="float-card room-float">
              <span>●</span>
              <div><b>Foundation room</b><small>12 students studying</small></div>
            </div>
          </div>
        </section>
        <section className="subject-ribbon" id="subjects">
          <span>YOUR COMPLETE FOUNDATION WORKSPACE</span>
          <div><b>Accounting</b><b>Business Laws</b><b>Quantitative Aptitude</b><b>Business Economics</b></div>
        </section>

        {/* Animated Feature Marquee Ticker */}
        <div className="landing-ticker-strip" aria-hidden="true">
          <div className="landing-ticker-track">
            <span className="landing-ticker-item"><i>⚡</i> <strong>Live Study Rooms:</strong> Realtime study accountability</span>
            <span className="landing-ticker-item"><i>⚡</i> <strong>GitHub Study Heatmap:</strong> 365-day visual consistency grid</span>
            <span className="landing-ticker-item"><i>⚡</i> <strong>Spaced Flashcards:</strong> Scientific 1-3-7-15-30 day recall</span>
            <span className="landing-ticker-item"><i>⚡</i> <strong>Pomodoro Focus Studio:</strong> Ambient soundscapes & auto-logs</span>
            <span className="landing-ticker-item"><i>⚡</i> <strong>ICAI Papers Library:</strong> Official MTPs, RTPs & answers</span>
            <span className="landing-ticker-item"><i>⚡</i> <strong>All-India XP Leaderboard:</strong> 9 rank tiers & trophy case</span>
            <span className="landing-ticker-item"><i>⚡</i> <strong>100% Free Forever:</strong> Zero paywalls, zero waitlists</span>
            {/* Duplicated for seamless loop */}
            <span className="landing-ticker-item"><i>⚡</i> <strong>Live Study Rooms:</strong> Realtime study accountability</span>
            <span className="landing-ticker-item"><i>⚡</i> <strong>GitHub Study Heatmap:</strong> 365-day visual consistency grid</span>
            <span className="landing-ticker-item"><i>⚡</i> <strong>Spaced Flashcards:</strong> Scientific 1-3-7-15-30 day recall</span>
            <span className="landing-ticker-item"><i>⚡</i> <strong>Pomodoro Focus Studio:</strong> Ambient soundscapes & auto-logs</span>
            <span className="landing-ticker-item"><i>⚡</i> <strong>ICAI Papers Library:</strong> Official MTPs, RTPs & answers</span>
            <span className="landing-ticker-item"><i>⚡</i> <strong>All-India XP Leaderboard:</strong> 9 rank tiers & trophy case</span>
            <span className="landing-ticker-item"><i>⚡</i> <strong>100% Free Forever:</strong> Zero paywalls, zero waitlists</span>
          </div>
        </div>
        <section className="landing-section" id="features">
          <div className="section-intro">
            <p className="landing-kicker">EVERYTHING IN ONE PLACE</p>
            <h2>Less switching.<br /><em>More studying.</em></h2>
            <p>Every tool has one job: helping you show up, stay focused, and know exactly what you accomplished.</p>
          </div>
          <div className="feature-bento">
            <article className="feature-card feature-progress">
              <div className="feature-icon">↗</div>
              <span>DAILY PROGRESS</span>
              <h3>Turn effort into a visible habit.</h3>
              <p>Log every study session, follow your streak, and see the week build up subject by subject.</p>
              <div className="mini-week">{[35, 58, 44, 76, 91, 62, 80].map((height, index) => <div key={index}><i style={{ height: `${height}%` }} /><small>{["M", "T", "W", "T", "F", "S", "S"][index]}</small></div>)}</div>
            </article>
            <article className="feature-card feature-pomo">
              <div className="feature-icon">◷</div>
              <span>FOCUS TIMER</span>
              <h3>A calmer way to do deep work.</h3>
              <p>Set your subject and topic. Completed Pomodoro sessions are saved to your dashboard automatically.</p>
              <div className="mini-timer">
                <div><strong>25:00</strong><small>FOCUS</small></div>
                <span>Start session →</span>
              </div>
            </article>
            <article className="feature-card feature-notes">
              <div className="feature-icon">▤</div>
              <span>SHARED NOTES</span>
              <h3>Your best material, easy to find.</h3>
              <p>Upload PDF or Word notes, keep them private, or share them with other aspirants. Filter everything by subject.</p>
              <div className="paper-stack">
                <i /><i />
                <div><span>PDF</span><b>Final Accounts</b><small>Accounting</small></div>
              </div>
            </article>
            <article className="feature-card feature-community">
              <div className="feature-icon">◎</div>
              <span>STUDY TOGETHER</span>
              <h3>Ask. Explain. Understand.</h3>
              <p>Join live subject rooms and focused discussions with students preparing for the same exam.</p>
              <div className="chat-preview">
                <div><i>A</i><span><b>Can someone explain this step?</b><small>Quantitative Aptitude</small></span></div>
                <div><i>P</i><span><b>Yes — start with the formula...</b><small>Just now</small></span></div>
              </div>
            </article>
            <article className="feature-card feature-papers">
              <div className="feature-icon">↗</div>
              <span>OFFICIAL ICAI PAPERS</span>
              <h3>The right paper, without the hunt.</h3>
              <p>Browse official question papers, MCQ keys, RTPs, MTPs, and suggested answers from one searchable library.</p>
              <div className="paper-tags"><span>Question papers</span><span>RTP</span><span>MTP</span><span>Answers</span></div>
            </article>
          </div>
        </section>
        <section className="landing-process" id="how-it-works">
          <div className="process-heading">
            <p className="landing-kicker">YOUR DAILY RHYTHM</p>
            <h2>A simple system you can<br />actually <em>stick with.</em></h2>
          </div>
          <div className="process-steps">
            <article>
              <span>01</span>
              <div className="process-dot">◎</div>
              <h3>Choose today&apos;s focus</h3>
              <p>Pick a subject and name the exact topic you want to move forward.</p>
            </article>
            <article>
              <span>02</span>
              <div className="process-dot">◷</div>
              <h3>Do one focused session</h3>
              <p>Start the timer and give one task your full attention for 25, 45, or 50 minutes.</p>
            </article>
            <article>
              <span>03</span>
              <div className="process-dot">↗</div>
              <h3>Watch progress compound</h3>
              <p>Your session is logged automatically. Return tomorrow and keep the streak alive.</p>
            </article>
          </div>
        </section>
        <section className="landing-cta">
          <div className="cta-orbit one" />
          <div className="cta-orbit two" />
          <p className="landing-kicker">YOUR NEXT SESSION STARTS HERE</p>
          <h2>Give your preparation<br />a place to <em>grow.</em></h2>
          <p>Build the routine that carries you to exam day.</p>
          <button onClick={onStart}>Create your free account <span>↗</span></button>
        </section>
      </main>
      <footer className="landing-footer">
        <div className="landing-footer-brand-col">
          <a className="landing-brand" href="#top"><span>CA</span> Orbit</a>
          <p>The all-in-one focus and study platform for CA Foundation aspirants.</p>
          <small className="landing-footer-disclaimer">
            Statutory Disclaimer: Independent study tool. Not affiliated with, endorsed by, or sponsored by the Institute of Chartered Accountants of India (ICAI).
          </small>
        </div>
        <div className="landing-footer-nav-cols">
          <div className="landing-footer-nav-col">
            <strong>Platform</strong>
            <button onClick={onStart}>Create account</button>
            <button onClick={onLogin}>Log in</button>
            <a href="#features">Features</a>
            <a href="#how-it-works">How it works</a>
          </div>
          <div className="landing-footer-nav-col">
            <strong>Policies & Info</strong>
            <a href="/about">About Us</a>
            <a href="/privacy">Privacy Policy</a>
            <a href="/terms">Terms of Service</a>
            <button className="landing-mod-footer-link" onClick={onModerator} title="Moderator Access">
              <span>🛡️</span> Moderator Portal
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
