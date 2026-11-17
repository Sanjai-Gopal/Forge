"use client";

import { useState, useEffect } from "react";
import type { Challenge } from "@/lib/challenges";
import { Check, ArrowRight } from "@/components/icons";

interface Props {
  challenge: Challenge;
}

type TabType = "specs" | "evaluation" | "leaderboard" | "submit";

function computeTimeRemaining(deadlineStr: string) {
  const targetDate = new Date(deadlineStr).getTime();
  const distance = targetDate - Date.now();
  if (distance <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: true };
  }
  return {
    days: Math.floor(distance / (1000 * 60 * 60 * 24)),
    hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
    minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
    seconds: Math.floor((distance % (1000 * 60)) / 1000),
    isExpired: false,
  };
}

export default function ChallengeClientView({ challenge }: Props) {
  const [activeTab, setActiveTab] = useState<TabType>("specs");

  // Immediate initial countdown computation from challenge.deadline
  const [timeLeft, setTimeLeft] = useState(() =>
    computeTimeRemaining(challenge.deadline)
  );

  useEffect(() => {
    const update = () => {
      setTimeLeft(computeTimeRemaining(challenge.deadline));
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [challenge.deadline]);

  // Submission form state
  const [repoUrl, setRepoUrl] = useState("");
  const [branch, setBranch] = useState("main");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [submissionResult, setSubmissionResult] = useState<{
    passed: boolean;
    score: number;
    latency: number;
    grade: string;
    casesPassed: string;
  } | null>(null);

  const handleSubmitSolution = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (timeLeft.isExpired) {
      setErrorMessage("This challenge has ended. Submissions are now closed.");
      return;
    }

    if (!repoUrl || !repoUrl.startsWith("http")) {
      setErrorMessage("Please enter a valid Git repository URL (https://...).");
      return;
    }

    setSubmitting(true);
    setSubmissionResult(null);

    // Simulate multi-stage automated sandbox evaluation
    setTimeout(() => {
      setSubmitting(false);
      setSubmissionResult({
        passed: true,
        score: 96.4,
        latency: 34,
        grade: "A+",
        casesPassed: "412/412",
      });
    }, 1200);
  };

  const tabs: { id: TabType; label: string }[] = [
    { id: "specs", label: "Problem Specs" },
    { id: "evaluation", label: "Evaluation Rubric" },
    { id: "leaderboard", label: "Live Leaderboard" },
    { id: "submit", label: "Submit Solution" },
  ];

  return (
    <div className="space-y-8">
      {/* Metrics & Countdown Bar */}
      <div className="grid grid-cols-2 gap-4 rounded-xl border border-ink/10 bg-paper-card p-5 sm:grid-cols-4 dark:border-ink-line dark:bg-ink-soft">
        <div>
          <p className="font-mono text-xs uppercase tracking-wider text-muted dark:text-muted-dark">
            Registered Builders
          </p>
          <p className="mt-1 font-display text-2xl font-bold text-ink dark:text-paper">
            {challenge.buildersCount.toLocaleString()}
          </p>
        </div>
        <div>
          <p className="font-mono text-xs uppercase tracking-wider text-muted dark:text-muted-dark">
            Total Submissions
          </p>
          <p className="mt-1 font-display text-2xl font-bold text-ink dark:text-paper">
            {challenge.submissionsCount.toLocaleString()}
          </p>
        </div>
        <div>
          <p className="font-mono text-xs uppercase tracking-wider text-muted dark:text-muted-dark">
            Evaluation Latency
          </p>
          <p className="mt-1 font-display text-2xl font-bold text-accent">
            &lt; 50ms p99
          </p>
        </div>
        <div>
          <p className="font-mono text-xs uppercase tracking-wider text-muted dark:text-muted-dark">
            Closes In
          </p>
          <p className="mt-1 font-mono text-xl font-bold text-ink dark:text-paper">
            {timeLeft.isExpired
              ? "Closed"
              : `${String(timeLeft.days).padStart(2, "0")}d : ${String(timeLeft.hours).padStart(2, "0")}h : ${String(timeLeft.minutes).padStart(2, "0")}m : ${String(timeLeft.seconds).padStart(2, "0")}s`}
          </p>
        </div>
      </div>

      {/* Accessible Tab Navigation */}
      <div
        role="tablist"
        aria-label="Challenge details"
        className="flex flex-wrap gap-2 border-b border-ink/10 pb-3 dark:border-ink-line"
      >
        {tabs.map((t) => {
          const isSelected = activeTab === t.id;
          return (
            <button
              key={t.id}
              role="tab"
              type="button"
              aria-selected={isSelected}
              onClick={() => setActiveTab(t.id)}
              className={`min-h-11 px-4 py-2 inline-flex items-center justify-center rounded-lg font-mono text-xs font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
                isSelected
                  ? "bg-accent text-ink font-bold shadow-sm"
                  : "bg-paper-card text-ink/70 hover:text-ink border border-ink/10 dark:border-ink-line dark:bg-ink-soft dark:text-paper/70 dark:hover:text-paper"
              }`}
            >
              {t.label}
            </button>
          );
        })}
      </div>

      {/* Tab Panels */}
      {activeTab === "specs" && (
        <div className="space-y-6">
          <div className="rounded-xl border border-ink/10 bg-paper-card p-6 dark:border-ink-line dark:bg-ink-soft">
            <h2 className="font-display text-xl font-bold text-ink dark:text-paper">
              Problem Statement
            </h2>
            <p className="mt-3 leading-relaxed text-ink/80 dark:text-paper/80">
              {challenge.problemStatement}
            </p>
          </div>

          <div className="rounded-xl border border-ink/10 bg-paper-card p-6 dark:border-ink-line dark:bg-ink-soft">
            <h2 className="font-display text-xl font-bold text-ink dark:text-paper">
              Technical Requirements
            </h2>
            <ul className="mt-4 space-y-3">
              {challenge.technicalRequirements.map((req, i) => (
                <li
                  key={i}
                  className="flex items-start gap-3 text-sm text-ink/80 dark:text-paper/80"
                >
                  <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent/20 text-accent">
                    <Check width={12} height={12} strokeWidth={2.4} />
                  </span>
                  <span>{req}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-xl border border-ink/10 bg-ink p-6 text-paper dark:border-ink-line">
            <div className="flex items-center justify-between border-b border-ink-line pb-3">
              <span className="font-mono text-xs uppercase tracking-wider text-muted-dark">
                Starter Code Template
              </span>
              <span className="font-mono text-xs text-accent">TypeScript 5</span>
            </div>
            <pre className="mt-4 overflow-x-auto font-mono text-xs leading-relaxed text-paper/90">
              <code>{challenge.starterCodeSnippet}</code>
            </pre>
          </div>
        </div>
      )}

      {activeTab === "evaluation" && (
        <div className="rounded-xl border border-ink/10 bg-paper-card p-6 dark:border-ink-line dark:bg-ink-soft">
          <h2 className="font-display text-xl font-bold text-ink dark:text-paper">
            Evaluation Rubric &amp; Weighting
          </h2>
          <p className="mt-2 text-sm text-ink/70 dark:text-paper/70">
            Solutions are automatically assessed against this criteria in our isolated micro-VM sandboxes.
          </p>

          <div className="mt-6 overflow-x-auto">
            <table className="w-full text-left font-mono text-xs">
              <thead className="border-b border-ink/10 text-muted dark:border-ink-line dark:text-muted-dark">
                <tr>
                  <th className="pb-3 pr-4 font-semibold uppercase">Metric</th>
                  <th className="pb-3 pr-4 font-semibold uppercase">Target Benchmark</th>
                  <th className="pb-3 text-right font-semibold uppercase">Score Weight</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink/5 dark:divide-ink-line">
                {challenge.evaluationCriteria.map((c, i) => (
                  <tr key={i} className="hover:bg-accent/5">
                    <td className="py-3.5 pr-4 font-medium text-ink dark:text-paper">
                      {c.metric}
                    </td>
                    <td className="py-3.5 pr-4 text-ink/70 dark:text-paper/70">
                      {c.benchmark}
                    </td>
                    <td className="py-3.5 text-right font-bold text-accent">
                      {c.weight}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === "leaderboard" && (
        <div className="rounded-xl border border-ink/10 bg-paper-card p-6 dark:border-ink-line dark:bg-ink-soft">
          <div className="flex items-center justify-between border-b border-ink/10 pb-4 dark:border-ink-line">
            <div>
              <h2 className="font-display text-xl font-bold text-ink dark:text-paper">
                Live Challenge Leaderboard
              </h2>
              <p className="text-xs text-muted dark:text-muted-dark">
                Ranked by verification test passing rate and p99 execution latency.
              </p>
            </div>
            <span className="font-mono text-xs font-semibold text-accent">
              Active Session
            </span>
          </div>

          <div className="mt-4 space-y-2">
            {challenge.leaderboard.map((entry) => (
              <div
                key={entry.rank}
                className="flex items-center gap-3 rounded-lg border border-ink/10 bg-paper p-3 dark:border-ink-line dark:bg-ink transition-colors"
              >
                <span className="w-6 font-mono text-sm font-bold text-muted dark:text-muted-dark">
                  #{entry.rank}
                </span>
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-accent/20 font-mono text-xs font-bold text-accent">
                  {entry.avatar}
                </span>
                <div>
                  <span className="text-sm font-semibold text-ink dark:text-paper">
                    {entry.username}
                  </span>
                  <p className="text-[11px] text-muted dark:text-muted-dark">
                    Passed: {entry.testsPassed} · Latency: {entry.latencyMs}ms
                  </p>
                </div>
                <div className="ml-auto text-right">
                  <span className="font-mono text-base font-bold text-ink dark:text-paper">
                    {entry.score}
                  </span>
                  <span className="block text-[10px] uppercase text-muted dark:text-muted-dark">
                    pts
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === "submit" && (
        <div className="rounded-xl border border-ink/10 bg-paper-card p-6 sm:p-8 dark:border-ink-line dark:bg-ink-soft">
          <h2 className="font-display text-xl font-bold text-ink dark:text-paper">
            Submit Solution for Evaluation
          </h2>
          <p className="mt-1 text-sm text-ink/70 dark:text-paper/70">
            Provide your public Git repository URL. Forge evaluates the solution inside an isolated sandbox and posts your score to the live leaderboard.
          </p>

          <form onSubmit={handleSubmitSolution} className="mt-6 space-y-4">
            <div>
              <label htmlFor="repo-url" className="block font-mono text-xs uppercase text-muted dark:text-muted-dark">
                Repository URL (GitHub / GitLab)
              </label>
              <input
                id="repo-url"
                type="url"
                required
                disabled={timeLeft.isExpired}
                value={repoUrl}
                onChange={(e) => setRepoUrl(e.target.value)}
                placeholder="https://github.com/username/forge-solution"
                className="mt-1.5 w-full rounded-lg border border-ink/15 bg-paper px-3.5 py-2.5 text-sm text-ink focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent dark:border-ink-line dark:bg-ink dark:text-paper disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="repo-branch" className="block font-mono text-xs uppercase text-muted dark:text-muted-dark">
                  Target Branch
                </label>
                <input
                  id="repo-branch"
                  type="text"
                  disabled={timeLeft.isExpired}
                  value={branch}
                  onChange={(e) => setBranch(e.target.value)}
                  className="mt-1.5 w-full rounded-lg border border-ink/15 bg-paper px-3.5 py-2.5 text-sm text-ink focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent dark:border-ink-line dark:bg-ink dark:text-paper disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>
              <div>
                <label htmlFor="notes" className="block font-mono text-xs uppercase text-muted dark:text-muted-dark">
                  Architecture Notes (Optional)
                </label>
                <input
                  id="notes"
                  type="text"
                  disabled={timeLeft.isExpired}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Ring buffer with LRU cache"
                  className="mt-1.5 w-full rounded-lg border border-ink/15 bg-paper px-3.5 py-2.5 text-sm text-ink focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent dark:border-ink-line dark:bg-ink dark:text-paper disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>
            </div>

            {errorMessage && (
              <p role="alert" className="text-xs font-semibold text-red-500">
                {errorMessage}
              </p>
            )}

            <button
              type="submit"
              disabled={submitting || timeLeft.isExpired}
              className="mt-2 min-h-11 inline-flex items-center gap-2 rounded-lg bg-accent px-5 py-2.5 font-mono text-xs font-bold text-ink transition-all hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {timeLeft.isExpired
                ? "Submissions Closed"
                : submitting
                ? "Spawning evaluation sandbox…"
                : "Execute Sandbox Evaluation"}
              <ArrowRight width={14} height={14} strokeWidth={2.5} />
            </button>
          </form>

          {/* Submission Feedback Result */}
          {submissionResult && (
            <div
              role="status"
              aria-live="polite"
              className="mt-6 rounded-lg border border-accent/40 bg-accent/10 p-5"
            >
              <div className="flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-accent text-ink">
                  <Check width={18} height={18} strokeWidth={2.4} />
                </span>
                <div>
                  <h3 className="font-display text-base font-bold text-ink dark:text-paper">
                    Evaluation Passed: {submissionResult.grade} ({submissionResult.score} pts)
                  </h3>
                  <p className="font-mono text-xs text-muted dark:text-muted-dark">
                    Test cases: {submissionResult.casesPassed} · Execution latency: {submissionResult.latency}ms
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
