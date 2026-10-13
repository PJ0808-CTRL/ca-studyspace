"use client";

import { useEffect, useRef, useState } from "react";
import Markdown from "markdown-to-jsx";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  subject?: string;
  topic?: string;
  source?: string;
  modelName?: string;
  examTips?: string[];
  suggestedFollowups?: string[];
  timestamp: string;
}

const PRESET_QUICK_PROMPTS = [
  {
    label: "⚖️ Salomon v. Salomon & Corporate Veil",
    subject: "law",
    text: "Explain the principle of Separate Legal Entity with Salomon v. Salomon and exceptions for lifting corporate veil.",
  },
  {
    label: "📜 Minor's Agreement (Mohori Bibee)",
    subject: "law",
    text: "What is the legal effect of an agreement entered into by a minor? Explain with Mohori Bibee v. Dharmodas Ghose.",
  },
  {
    label: "🔄 BRS Golden Adjustment Rules",
    subject: "accounting",
    text: "Explain how to prepare a Bank Reconciliation Statement starting from Cash Book favourable balance.",
  },
  {
    label: "📦 Consignment: Normal vs Abnormal Loss",
    subject: "accounting",
    text: "How is abnormal loss valued in Consignment Accounts and how does it differ from normal loss?",
  },
  {
    label: "🔢 Time Value of Money Formulas",
    subject: "quants",
    text: "What are the master formulas for Annuity Regular, Annuity Due, and Effective Rate of Interest in TVM?",
  },
  {
    label: "📊 SD Change of Origin vs Scale",
    subject: "quants",
    text: "Explain the effect of change of origin and change of scale on Standard Deviation with formula.",
  },
  {
    label: "📈 5 Degrees of Price Elasticity",
    subject: "economics",
    text: "Explain the 5 degrees of Price Elasticity of Demand with their curves and numerical values.",
  },
  {
    label: "🏢 Doctrine of Indoor Management",
    subject: "law",
    text: "Explain the Doctrine of Indoor Management (Turquand's Rule) and its exceptions.",
  },
];

const INITIAL_MESSAGE: Message = {
  id: "welcome-1",
  role: "assistant",
  content: `### 🎯 Welcome to your CA Foundation AIR Doubt Assistant!
I am tuned specifically for the **ICAI New Scheme Syllabus** to provide high-clarity, ranker-standard exam solutions:
* **Paper 1:** Principles & Practice of Accounting
* **Paper 2:** Business Laws (Companies Act 2013, Contract Act 1872, Sale of Goods, Partnership, LLP)
* **Paper 3:** Quantitative Aptitude (Business Math, Logical Reasoning, Statistics)
* **Paper 4:** Business Economics

**How would you like to prepare today?**
* Ask any case law doubt, journal entry, or math formula.
* Every answer includes **Concept Snapshots, Statutory Sections, Step-by-Step ICAI Presentation, Trap Alerts, and Mnemonics**!`,
  timestamp: "Just now",
  modelName: "Ranker Knowledge Engine (ICAI Aligned)",
  examTips: [
    "Always state the legal provision/section or math formula in your first two lines.",
    "Show explicit working notes for every calculation.",
  ],
  suggestedFollowups: [
    "Explain Salomon v. Salomon and Corporate Veil",
    "What is the rule of Mohori Bibee for minor contracts?",
    "Explain BRS adjustment rules for cheques issued vs deposited",
  ],
};

export default function AIDoubtAssistant() {
  const [messages, setMessages] = useState<Message[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("ca-ai-doubt-history");
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
      } catch {
        /* Ignore storage read errors */
      }
    }
    return [INITIAL_MESSAGE];
  });

  const [input, setInput] = useState("");
  const [selectedSubject, setSelectedSubject] = useState<
    "all" | "accounting" | "law" | "quants" | "economics"
  >("all");
  const [formatStyle, setFormatStyle] = useState<
    "icai_exam" | "conceptual" | "step_by_step"
  >("icai_exam");
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [apiKeyModalOpen, setApiKeyModalOpen] = useState(false);
  const [customKeyInput, setCustomKeyInput] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("ca_custom_ai_key") || "";
    }
    return "";
  });
  const [activeModelLabel, setActiveModelLabel] = useState<string>(() => {
    if (typeof window !== "undefined" && localStorage.getItem("ca_custom_ai_key")) {
      return "Gemini 2.0 / Custom Key Active";
    }
    return "ICAI Flagship Engine";
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Sync history to local storage
  useEffect(() => {
    try {
      localStorage.setItem("ca-ai-doubt-history", JSON.stringify(messages));
    } catch {
      /* Storage full or private mode */
    }
  }, [messages]);

  // Auto scroll to latest response
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  function handleSaveKey(e: React.FormEvent) {
    e.preventDefault();
    const cleanKey = customKeyInput.trim();
    if (cleanKey) {
      localStorage.setItem("ca_custom_ai_key", cleanKey);
      setActiveModelLabel(cleanKey.startsWith("AIza") ? "Gemini 2.0 Flash (Live)" : "Custom AI (Live)");
    } else {
      localStorage.removeItem("ca_custom_ai_key");
      setActiveModelLabel("ICAI Flagship Engine");
    }
    setApiKeyModalOpen(false);
  }

  async function handleSend(textToSend?: string) {
    const query = (textToSend || input).trim();
    if (!query || loading) return;

    const userMessage: Message = {
      id: `u-${Date.now()}`,
      role: "user",
      content: query,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages(prev => [...prev, userMessage]);
    if (!textToSend) setInput("");
    setLoading(true);

    try {
      const history = messages.slice(-4).map(m => ({
        role: m.role,
        content: m.content,
      }));

      const customKey = typeof window !== "undefined" ? localStorage.getItem("ca_custom_ai_key") || "" : "";

      const res = await fetch("/api/ai-doubt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: query,
          subject: selectedSubject,
          formatStyle,
          history,
          customApiKey: customKey || undefined,
        }),
      });

      if (!res.ok) {
        throw new Error("Unable to retrieve answer. Please try again.");
      }

      const data = await res.json();

      if (data.modelName) {
        setActiveModelLabel(data.modelName);
      }

      const assistantMessage: Message = {
        id: `a-${Date.now()}`,
        role: "assistant",
        content: data.answer,
        subject: data.subject,
        topic: data.topic,
        source: data.source,
        modelName: data.modelName || "ICAI Ranker Engine",
        examTips: data.examTips,
        suggestedFollowups: data.suggestedFollowups,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (err: unknown) {
      const errorMessage: Message = {
        id: `err-${Date.now()}`,
        role: "assistant",
        content: `### ⚠️ Connection Notice\n${
          err instanceof Error ? err.message : "Failed to solve doubt."
        }\nPlease check your connection and retry.`,
        timestamp: "Just now",
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  }

  function handleCopy(id: string, text: string) {
    void navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  }

  function handleClearChat() {
    if (window.confirm("Do you want to clear your current AI doubt conversation history?")) {
      setMessages([INITIAL_MESSAGE]);
      try {
        localStorage.removeItem("ca-ai-doubt-history");
      } catch {
        /* Ignore */
      }
    }
  }

  return (
    <div className="ai-doubt-shell">
      {/* Top Banner / Header */}
      <div className="ai-doubt-header">
        <div className="ai-doubt-header-left">
          <div className="ai-doubt-icon-badge">AI</div>
          <div>
            <div className="ai-doubt-title-row">
              <h2>AI CA Doubt Solver</h2>
              <span className="free-badge">100% FREE · CA FOUNDATION</span>
              <span className="live-status">● {activeModelLabel}</span>
            </div>
            <p className="fine" style={{ margin: "2px 0 0" }}>
              Instant answers formatted to ICAI examination presentation standards for CA Foundation students.
            </p>
          </div>
        </div>

        <div className="ai-doubt-header-actions">
          <button
            type="button"
            className="ai-settings-pill-btn"
            onClick={() => setApiKeyModalOpen(true)}
            title="Configure AI API Key / Model"
          >
            ⚙️ AI Settings
          </button>
          <button
            type="button"
            className="text-button"
            onClick={handleClearChat}
            title="Clear chat thread"
          >
            Clear History
          </button>
        </div>
      </div>

      {/* Filter and Format Controls */}
      <div className="ai-doubt-toolbar">
        <div className="ai-subject-selector">
          <span className="toolbar-label">Subject:</span>
          <div className="ai-subject-pills">
            <button
              type="button"
              className={selectedSubject === "all" ? "active" : ""}
              onClick={() => setSelectedSubject("all")}
            >
              All Subjects
            </button>
            <button
              type="button"
              className={selectedSubject === "accounting" ? "active" : ""}
              onClick={() => setSelectedSubject("accounting")}
            >
              Paper 1: Accounting
            </button>
            <button
              type="button"
              className={selectedSubject === "law" ? "active" : ""}
              onClick={() => setSelectedSubject("law")}
            >
              Paper 2: Business Laws
            </button>
            <button
              type="button"
              className={selectedSubject === "quants" ? "active" : ""}
              onClick={() => setSelectedSubject("quants")}
            >
              Paper 3: Quants & Stats
            </button>
            <button
              type="button"
              className={selectedSubject === "economics" ? "active" : ""}
              onClick={() => setSelectedSubject("economics")}
            >
              Paper 4: Economics
            </button>
          </div>
        </div>

        <div className="ai-format-selector">
          <span className="toolbar-label">Presentation Format:</span>
          <select
            value={formatStyle}
            onChange={e => setFormatStyle(e.target.value as any)}
            aria-label="Select answer presentation style"
          >
            <option value="icai_exam">🏛️ ICAI Exam Format (Provision → Facts → Conclusion)</option>
            <option value="conceptual">💡 Simple Concept & Mnemonic</option>
            <option value="step_by_step">🔢 Step-by-Step Numerical Walkthrough</option>
          </select>
        </div>
      </div>

      {/* Quick Prompts / Syllabus Starters */}
      <div className="ai-starters-scroll">
        <span className="starters-label">Suggested Doubts:</span>
        <div className="ai-starters-list">
          {PRESET_QUICK_PROMPTS.map((p, i) => (
            <button
              key={i}
              type="button"
              className="ai-starter-pill"
              onClick={() => {
                if (p.subject) setSelectedSubject(p.subject as any);
                void handleSend(p.text);
              }}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Chat Thread */}
      <div className="ai-chat-thread">
        {messages.map(msg => (
          <div
            key={msg.id}
            className={`ai-message-wrapper ${msg.role === "user" ? "user-side" : "ai-side"}`}
          >
            <div className="ai-avatar">
              {msg.role === "user" ? "You" : "AI"}
            </div>

            <div className="ai-message-card">
              <div className="ai-card-meta">
                <span className="ai-author">
                  {msg.role === "user" ? "Your Doubt" : "CA Doubt Assistant"}
                </span>
                {msg.modelName && <span className="ai-model-tag">{msg.modelName}</span>}
                {msg.subject && <span className="ai-subject-tag">{msg.subject}</span>}
                <span className="ai-timestamp">{msg.timestamp}</span>

                {msg.role === "assistant" && (
                  <button
                    type="button"
                    className="ai-copy-btn"
                    onClick={() => handleCopy(msg.id, msg.content)}
                    title="Copy answer to clipboard"
                  >
                    {copiedId === msg.id ? "✓ Copied" : "Copy 📋"}
                  </button>
                )}
              </div>

              {/* Message Body with Clean Markdown Rendering */}
              <div className="ai-content-body ai-markdown-content">
                <Markdown>{msg.content}</Markdown>
              </div>

              {/* Exam Tips Box */}
              {msg.examTips && msg.examTips.length > 0 && (
                <div className="ai-exam-tips-box">
                  <div className="tips-head">
                    <span>💡</span>
                    <strong>ICAI Examination Presentation Tips:</strong>
                  </div>
                  <ul>
                    {msg.examTips.map((tip, tIdx) => (
                      <li key={tIdx}>{tip}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Suggested Followups */}
              {msg.suggestedFollowups && msg.suggestedFollowups.length > 0 && (
                <div className="ai-followup-suggestions">
                  <span className="fine" style={{ fontWeight: 800 }}>Explore Further:</span>
                  <div className="followup-pills">
                    {msg.suggestedFollowups.map((f, fIdx) => (
                      <button
                        key={fIdx}
                        type="button"
                        className="followup-btn"
                        onClick={() => void handleSend(f)}
                      >
                        {f} →
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="ai-message-wrapper ai-side">
            <div className="ai-avatar pulse">AI</div>
            <div className="ai-message-card loading-card">
              <div className="ai-loading-dots">
                <span />
                <span />
                <span />
              </div>
              <p className="fine" style={{ margin: "6px 0 0" }}>
                Analyzing ICAI bare act provisions & preparing structured model solution…
              </p>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Bar */}
      <div className="ai-input-dock">
        <form
          onSubmit={e => {
            e.preventDefault();
            void handleSend();
          }}
          className="ai-input-form"
        >
          <div className="ai-input-container">
            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  void handleSend();
                }
              }}
              placeholder={
                selectedSubject === "law"
                  ? "Ask about Companies Act, Minor's agreement, Consideration, Case laws..."
                  : selectedSubject === "accounting"
                  ? "Ask about Journal entries, BRS adjustments, Consignment, Depreciation..."
                  : selectedSubject === "quants"
                  ? "Ask about Time Value of Money, Annuity formulas, Standard Deviation, AP/GP..."
                  : selectedSubject === "economics"
                  ? "Ask about Elasticity of demand, Law of variable proportions, Market forms..."
                  : "Type any CA Foundation doubt, question, or concept... (Press Enter ↵ to send)"
              }
              rows={2}
              disabled={loading}
              autoFocus
            />
            <div className="ai-input-controls">
              <span className="fine ai-free-tag">
                100% Free for CA Aspirants · No Tokens Required
              </span>
              <button
                type="submit"
                className="primary ai-submit-btn"
                disabled={loading || !input.trim()}
              >
                {loading ? "Solving…" : "Ask Assistant ↗"}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* API Key / Engine Settings Modal */}
      {apiKeyModalOpen && (
        <div className="report-modal-overlay" onClick={() => setApiKeyModalOpen(false)}>
          <div className="report-modal-card ai-settings-modal" onClick={e => e.stopPropagation()}>
            <div className="report-modal-head">
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 22 }}>⚙️</span>
                <h3 style={{ margin: 0 }}>AI Engine & API Settings</h3>
              </div>
              <button
                type="button"
                className="close-btn"
                onClick={() => setApiKeyModalOpen(false)}
              >
                ✕
              </button>
            </div>

            <p className="fine" style={{ margin: "10px 0 14px", lineHeight: 1.6 }}>
              The solver uses our <strong>Flagship ICAI AIR Knowledge Engine</strong> by default. If you have your own <strong>Google Gemini API Key</strong> (free at Google AI Studio) or <strong>OpenAI Key</strong>, you can paste it below to connect directly to <strong>Gemini 2.0 Flash</strong> or <strong>GPT-4o</strong>!
            </p>

            <form onSubmit={handleSaveKey} className="form-stack">
              <label>
                <span>🔑</span> Google Gemini / OpenAI API Key (Optional)
                <input
                  type="password"
                  value={customKeyInput}
                  onChange={e => setCustomKeyInput(e.target.value)}
                  placeholder="Paste your Gemini AI Studio API key (AIzaSy...)"
                />
              </label>

              <div className="ai-settings-hint-box">
                <small>
                  💡 <strong>How to get a free Google Gemini key:</strong> Visit <a href="https://aistudio.google.com" target="_blank" rel="noopener noreferrer" style={{ textDecoration: "underline", color: "var(--green)" }}>aistudio.google.com</a> &rarr; Click &ldquo;Get API key&rdquo; (takes 30 seconds). Leave blank to use the built-in ICAI engine!
                </small>
              </div>

              <div className="report-modal-actions" style={{ marginTop: 14 }}>
                <button
                  type="button"
                  className="back"
                  onClick={() => setApiKeyModalOpen(false)}
                >
                  Cancel
                </button>
                {customKeyInput.trim() && (
                  <button
                    type="button"
                    className="danger-button"
                    style={{ minHeight: 38 }}
                    onClick={() => {
                      setCustomKeyInput("");
                      localStorage.removeItem("ca_custom_ai_key");
                      setActiveModelLabel("ICAI Flagship Engine");
                      setApiKeyModalOpen(false);
                    }}
                  >
                    Clear Key
                  </button>
                )}
                <button type="submit" className="primary" style={{ minHeight: 38 }}>
                  Save & Apply ↗
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
