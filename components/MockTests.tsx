"use client";

import { useEffect, useState } from "react";
import type { MockTest } from "@/lib/types";
import { awardVerifiedXP } from "@/lib/gamification";

const STORAGE_PREFIX = "ca-orbit-mock-tests-";
const LEGACY_STORAGE_PREFIX = "ca-studyspace-mock-tests-";

const presetTitles = [
  "ICAI MTP Series 1",
  "ICAI MTP Series 2",
  "Full Syllabus Mock 1",
  "RTP Self-Assessment",
];

const sampleMock: Omit<MockTest, "id" | "user_id" | "created_at"> = {
  title: "ICAI MTP Series 1 (Benchmark)",
  test_date: new Date().toLocaleDateString("en-CA"),
  accounting: 68,
  business_laws: 52,
  quantitative_aptitude: 44,
  business_economics: 71,
  notes: "Good grasp on Accounting & Economics. Need more speed drills on Quants and writing practice for Business Law cases.",
};

export default function MockTests({ userId }: { userId: string }) {
  const [tests, setTests] = useState<MockTest[]>([]);
  const [hydrated, setHydrated] = useState(false);

  // Form fields
  const [title, setTitle] = useState("");
  const [testDate, setTestDate] = useState(() => new Date().toLocaleDateString("en-CA"));
  const [accounting, setAccounting] = useState<number | "">("");
  const [businessLaws, setBusinessLaws] = useState<number | "">("");
  const [quantitativeAptitude, setQuantitativeAptitude] = useState<number | "">("");
  const [businessEconomics, setBusinessEconomics] = useState<number | "">("");
  const [notes, setNotes] = useState("");
  const [formError, setFormError] = useState("");
  const [feedbackMsg, setFeedbackMsg] = useState("");

  const storageKey = `${STORAGE_PREFIX}${userId}`;

  // Load from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(storageKey) || localStorage.getItem(`${LEGACY_STORAGE_PREFIX}${userId}`);
      if (stored) {
        const parsed = JSON.parse(stored) as MockTest[];
        if (Array.isArray(parsed)) {
          setTests(parsed);
        }
      }
    } catch (err) {
      console.warn("Failed to read mock tests from localStorage", err);
    }
    setHydrated(true);
  }, [storageKey, userId]);

  // Persist helper
  function saveList(newList: MockTest[]) {
    setTests(newList);
    try {
      localStorage.setItem(storageKey, JSON.stringify(newList));
    } catch (err) {
      console.warn("Failed to save mock tests to localStorage", err);
    }
  }

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setFormError("");

    if (!title.trim()) {
      setFormError("Please enter a test title or select a preset.");
      return;
    }

    const acc = typeof accounting === "number" ? accounting : 0;
    const law = typeof businessLaws === "number" ? businessLaws : 0;
    const qa = typeof quantitativeAptitude === "number" ? quantitativeAptitude : 0;
    const eco = typeof businessEconomics === "number" ? businessEconomics : 0;

    if (acc < 0 || acc > 100 || law < 0 || law > 100 || qa < 0 || qa > 100 || eco < 0 || eco > 100) {
      setFormError("Each paper score must be between 0 and 100 marks.");
      return;
    }

    const newTest: MockTest = {
      id: `mt-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      user_id: userId,
      title: title.trim(),
      test_date: testDate || new Date().toLocaleDateString("en-CA"),
      accounting: acc,
      business_laws: law,
      quantitative_aptitude: qa,
      business_economics: eco,
      notes: notes.trim() || undefined,
      created_at: new Date().toISOString(),
    };

    saveList([newTest, ...tests]);
    void awardVerifiedXP({
      userId,
      baseXp: 50,
      reason: `Mock Exam Logged (${title.trim()})`,
      isMockTest: true,
    });
    setTitle("");
    setAccounting("");
    setBusinessLaws("");
    setQuantitativeAptitude("");
    setBusinessEconomics("");
    setNotes("");
    setFeedbackMsg("Mock test logged successfully! (+50 Verified XP Earned)");
    setTimeout(() => setFeedbackMsg(""), 3500);
  }

  function handleDelete(id: string) {
    if (confirm("Are you sure you want to delete this mock test record?")) {
      saveList(tests.filter(t => t.id !== id));
    }
  }

  function handleLoadSample() {
    const sample: MockTest = {
      id: `mt-${Date.now()}`,
      user_id: userId,
      ...sampleMock,
      created_at: new Date().toISOString(),
    };
    saveList([sample, ...tests]);
  }

  // Live form calculation
  const curAcc = typeof accounting === "number" ? accounting : 0;
  const curLaw = typeof businessLaws === "number" ? businessLaws : 0;
  const curQa = typeof quantitativeAptitude === "number" ? quantitativeAptitude : 0;
  const curEco = typeof businessEconomics === "number" ? businessEconomics : 0;
  const liveTotal = curAcc + curLaw + curQa + curEco;
  const livePercent = Math.round((liveTotal / 400) * 100);

  const belowCutoffPapers = [
    curAcc < 40 ? "Accounting" : null,
    curLaw < 40 ? "Business Laws" : null,
    curQa < 40 ? "Quantitative Aptitude" : null,
    curEco < 40 ? "Business Economics" : null,
  ].filter(Boolean) as string[];

  const livePassedCutoff = belowCutoffPapers.length === 0;
  const livePassedAggregate = liveTotal >= 200;
  const liveQualified = livePassedCutoff && livePassedAggregate;

  // Aggregate stats across all tests
  const totalMocks = tests.length;
  const highestMock = tests.reduce(
    (max, t) => {
      const tot = t.accounting + t.business_laws + t.quantitative_aptitude + t.business_economics;
      return tot > max.score ? { score: tot, test: t } : max;
    },
    { score: 0, test: null as MockTest | null }
  );

  const avgScore = totalMocks > 0
    ? Math.round(
        tests.reduce(
          (sum, t) => sum + (t.accounting + t.business_laws + t.quantitative_aptitude + t.business_economics),
          0
        ) / totalMocks
      )
    : 0;

  const qualifiedCount = tests.filter(t => {
    const tot = t.accounting + t.business_laws + t.quantitative_aptitude + t.business_economics;
    return (
      t.accounting >= 40 &&
      t.business_laws >= 40 &&
      t.quantitative_aptitude >= 40 &&
      t.business_economics >= 40 &&
      tot >= 200
    );
  }).length;

  if (!hydrated) {
    return <div className="sync">Loading mock test tracker…</div>;
  }

  return (
    <div className="mock-tests-container">
      {/* Overview Cards */}
      <div className="planning-stats mock-stats-grid">
        <div>
          <span>MOCKS ATTEMPTED</span>
          <strong>{totalMocks}</strong>
          <small>{totalMocks === 1 ? "1 mock logged" : `${totalMocks} total records`}</small>
        </div>
        <div>
          <span>HIGHEST SCORE</span>
          <strong>{highestMock.score > 0 ? `${highestMock.score}/400` : "—"}</strong>
          <small>{highestMock.score > 0 ? `${Math.round((highestMock.score / 400) * 100)}% aggregate` : "Log a test to view"}</small>
        </div>
        <div>
          <span>AVERAGE SCORE</span>
          <strong>{avgScore > 0 ? `${avgScore}/400` : "—"}</strong>
          <small>{avgScore > 0 ? `${Math.round((avgScore / 400) * 100)}% overall avg` : "Based on all mocks"}</small>
        </div>
        <div>
          <span>QUALIFY RATE</span>
          <strong>{totalMocks > 0 ? `${Math.round((qualifiedCount / totalMocks) * 100)}%` : "—"}</strong>
          <small>{qualifiedCount} of {totalMocks} passed both criteria</small>
        </div>
      </div>

      <div className="planner-grid mock-planner-grid">
        {/* Left: Input Form */}
        <section className="card mock-form-card">
          <div className="section-title">
            <div>
              <p className="eyebrow">LOG MOCK TEST (MTP)</p>
              <h3>Record assessment scores</h3>
            </div>
          </div>

          <form className="form-stack" onSubmit={handleSave}>
            <div>
              <span className="form-subheading">Quick Presets</span>
              <div className="mock-preset-chips">
                {presetTitles.map(preset => (
                  <button
                    type="button"
                    key={preset}
                    className={`preset-chip ${title === preset ? "active" : ""}`}
                    onClick={() => setTitle(preset)}
                  >
                    {preset}
                  </button>
                ))}
              </div>
            </div>

            <label>
              Test Title / Exam Series
              <input
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="e.g. ICAI MTP Series 1 - May 2026"
                maxLength={120}
                required
              />
            </label>

            <label>
              Test Date
              <input
                type="date"
                value={testDate}
                onChange={e => setTestDate(e.target.value)}
                required
              />
            </label>

            <div className="mock-papers-input-grid">
              <label>
                Paper 1: Accounting
                <div className="score-input-wrap">
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={accounting}
                    onChange={e => setAccounting(e.target.value === "" ? "" : Math.min(100, Math.max(0, Number(e.target.value))))}
                    placeholder="0-100"
                    required
                  />
                  <span>/ 100</span>
                </div>
              </label>

              <label>
                Paper 2: Business Laws
                <div className="score-input-wrap">
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={businessLaws}
                    onChange={e => setBusinessLaws(e.target.value === "" ? "" : Math.min(100, Math.max(0, Number(e.target.value))))}
                    placeholder="0-100"
                    required
                  />
                  <span>/ 100</span>
                </div>
              </label>

              <label>
                Paper 3: Quantitative Aptitude
                <div className="score-input-wrap">
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={quantitativeAptitude}
                    onChange={e => setQuantitativeAptitude(e.target.value === "" ? "" : Math.min(100, Math.max(0, Number(e.target.value))))}
                    placeholder="0-100"
                    required
                  />
                  <span>/ 100</span>
                </div>
              </label>

              <label>
                Paper 4: Business Economics
                <div className="score-input-wrap">
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={businessEconomics}
                    onChange={e => setBusinessEconomics(e.target.value === "" ? "" : Math.min(100, Math.max(0, Number(e.target.value))))}
                    placeholder="0-100"
                    required
                  />
                  <span>/ 100</span>
                </div>
              </label>
            </div>

            {/* Live calculation banner */}
            {(accounting !== "" || businessLaws !== "" || quantitativeAptitude !== "" || businessEconomics !== "") && (
              <div className={`mock-live-calc ${liveQualified ? "qualified" : "attention"}`}>
                <div className="live-calc-top">
                  <div>
                    <strong>Total: {liveTotal} / 400</strong>
                    <span>({livePercent}%)</span>
                  </div>
                  <span className={`live-status-badge ${liveQualified ? "pass" : "fail"}`}>
                    {liveQualified ? "✓ PASS / QUALIFIED" : livePassedCutoff ? "⚠️ FAIL (Aggregate < 50%)" : "⚠️ FAIL (Cutoff Missed)"}
                  </span>
                </div>
                {!livePassedCutoff && (
                  <p className="cutoff-hint">
                    Below 40% cutoff in: <b>{belowCutoffPapers.join(", ")}</b>. CA Foundation requires min 40 in every paper.
                  </p>
                )}
                {livePassedCutoff && !livePassedAggregate && (
                  <p className="cutoff-hint">
                    Need {200 - liveTotal} more marks to reach the 200/400 (50%) aggregate qualifying cutoff.
                  </p>
                )}
              </div>
            )}

            <label>
              Notes & Weak Areas <span className="optional">optional</span>
              <textarea
                rows={2}
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="e.g. Silly calculation mistake in Quants, wrote great answers in Law"
                maxLength={400}
              />
            </label>

            <button type="submit" className="primary">Save mock result →</button>
            {formError && <p className="error-text">{formError}</p>}
            {feedbackMsg && <p className="notice success">{feedbackMsg}</p>}
          </form>
        </section>

        {/* Right: Mock Test History */}
        <section className="card mock-history-card">
          <div className="section-title">
            <div>
              <p className="eyebrow">ASSESSMENT LOG</p>
              <h3>Test performance history</h3>
            </div>
            {tests.length > 0 && <span className="history-count">{tests.length} mock tests</span>}
          </div>

          {tests.length === 0 ? (
            <div className="planner-empty mock-empty">
              <b>No mock tests recorded yet.</b>
              <p>Log your full or sectional MTP scores to verify aggregate marks and paper cutoffs.</p>
              <button type="button" className="preset-btn" onClick={handleLoadSample} style={{ marginTop: 16 }}>
                Load benchmark sample MTP
              </button>
            </div>
          ) : (
            <div className="mock-tests-list">
              {tests.map(test => {
                const total = test.accounting + test.business_laws + test.quantitative_aptitude + test.business_economics;
                const percent = Math.round((total / 400) * 100);

                const failedCutoffs = [
                  test.accounting < 40 ? "Accounting" : null,
                  test.business_laws < 40 ? "Business Laws" : null,
                  test.quantitative_aptitude < 40 ? "Quantitative Aptitude" : null,
                  test.business_economics < 40 ? "Business Economics" : null,
                ].filter(Boolean) as string[];

                const passCutoff = failedCutoffs.length === 0;
                const passAggregate = total >= 200;
                const passed = passCutoff && passAggregate;

                return (
                  <article key={test.id} className={`mock-test-entry ${passed ? "passed" : "failed"}`}>
                    <div className="mock-entry-header">
                      <div>
                        <h4>{test.title}</h4>
                        <time>{new Date(`${test.test_date}T12:00:00`).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</time>
                      </div>
                      <div className="mock-entry-score">
                        <div className="score-number">
                          <strong>{total}</strong>
                          <span>/ 400</span>
                        </div>
                        <span className={`status-pill ${passed ? "pass" : "fail"}`}>
                          {passed ? "QUALIFIED" : !passCutoff ? "CUTOFF NOT MET" : "AGGREGATE SHORT"}
                        </span>
                      </div>
                    </div>

                    {/* Paper Score Breakdown */}
                    <div className="mock-paper-grid">
                      <div className={`paper-score-item ${test.accounting >= 60 ? "exemption" : test.accounting < 40 ? "failed-cutoff" : ""}`}>
                        <div className="paper-score-title">
                          <span>Paper 1</span>
                          <strong>Accounting</strong>
                        </div>
                        <div className="score-val">
                          <b>{test.accounting}</b>
                          {test.accounting >= 60 && <span className="exemption-badge" title="Exemption (60+)">⭐ 60+</span>}
                        </div>
                      </div>

                      <div className={`paper-score-item ${test.business_laws >= 60 ? "exemption" : test.business_laws < 40 ? "failed-cutoff" : ""}`}>
                        <div className="paper-score-title">
                          <span>Paper 2</span>
                          <strong>Law</strong>
                        </div>
                        <div className="score-val">
                          <b>{test.business_laws}</b>
                          {test.business_laws >= 60 && <span className="exemption-badge" title="Exemption (60+)">⭐ 60+</span>}
                        </div>
                      </div>

                      <div className={`paper-score-item ${test.quantitative_aptitude >= 60 ? "exemption" : test.quantitative_aptitude < 40 ? "failed-cutoff" : ""}`}>
                        <div className="paper-score-title">
                          <span>Paper 3</span>
                          <strong>Quants</strong>
                        </div>
                        <div className="score-val">
                          <b>{test.quantitative_aptitude}</b>
                          {test.quantitative_aptitude >= 60 && <span className="exemption-badge" title="Exemption (60+)">⭐ 60+</span>}
                        </div>
                      </div>

                      <div className={`paper-score-item ${test.business_economics >= 60 ? "exemption" : test.business_economics < 40 ? "failed-cutoff" : ""}`}>
                        <div className="paper-score-title">
                          <span>Paper 4</span>
                          <strong>Economics</strong>
                        </div>
                        <div className="score-val">
                          <b>{test.business_economics}</b>
                          {test.business_economics >= 60 && <span className="exemption-badge" title="Exemption (60+)">⭐ 60+</span>}
                        </div>
                      </div>
                    </div>

                    {/* Criteria explanation if failed */}
                    {!passed && (
                      <div className="mock-failure-reason">
                        {!passCutoff && (
                          <span>⚠️ Scored below 40 in {failedCutoffs.join(", ")} (Min 40 required per paper)</span>
                        )}
                        {passCutoff && !passAggregate && (
                          <span>⚠️ Scored {total}/400 ({percent}%). Need minimum 200/400 (50%) to qualify.</span>
                        )}
                      </div>
                    )}

                    {test.notes && (
                      <div className="mock-notes-quote">
                        <span>💬</span>
                        <p>{test.notes}</p>
                      </div>
                    )}

                    <div className="mock-entry-footer">
                      <small>Logged on {new Date(test.created_at).toLocaleDateString("en-IN")}</small>
                      <button
                        type="button"
                        className="danger-link"
                        onClick={() => handleDelete(test.id)}
                      >
                        Delete record
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
