import { useState } from "react";
import { useOutletContext, useNavigate } from "react-router-dom";

const STOP_WORDS = new Set([
  "and", "or", "the", "a", "an", "for", "of", "in", "with",
  "under", "to", "at", "by", "from", "on", "within", "across",
  "during", "through", "including", "using", "while", "as",
])

const condenseSkill = (skill) => {
  const primary = skill.split(/\s+and\s+|,/i)[0].trim()
  const words = primary
    .split(/\s+/)
    .filter((w) => !STOP_WORDS.has(w.toLowerCase()))
    .slice(0, 3)
  return words.join(" ")
}

const BRANCH_HINTS = [
  { branch: "Army", example: "11B, 25U, 92A, 68W" },
  { branch: "Navy", example: "1120, HM, 2514, IT" },
  { branch: "Marine Corps", example: "0311, 0621, 3521" },
  { branch: "Air Force", example: "1A1X1, 3D0X2, 14N" },
  { branch: "Space Force", example: "3D1X2, 13S" },
  { branch: "Coast Guard", example: "BM, MK, IT, OS" },
];

export default function TranslatorPage() {
  const { token, translatorState, setTranslatorState } = useOutletContext();
  const navigate = useNavigate();
  const { query, selectedBranch, result } = translatorState;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const setQuery = (v) => setTranslatorState((s) => ({ ...s, query: v }));
  const setSelectedBranch = (v) => setTranslatorState((s) => ({ ...s, selectedBranch: v }));
  const setResult = (v) => setTranslatorState((s) => ({ ...s, result: v }));

  const handleTranslate = async () => {
    const trimmed = query.trim();
    if (!trimmed) return;
    setLoading(true);
    setError("");
    setResult(null);
    const fullQuery = selectedBranch ? `${selectedBranch}: ${trimmed}` : trimmed;
    try {
      const res = await fetch("/api/v1/translate/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Token ${token}`,
        },
        body: JSON.stringify({ query: fullQuery }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Translation failed.");
      }
      const data = await res.json();
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleTranslate();
  };

  const handleSearchWithSkill = (skill, condense = false) => {
    const q = condense ? condenseSkill(skill) : skill
    navigate(`/search?q=${encodeURIComponent(q)}`);
  };

  return (
    <div className="min-h-screen bg-slate-50 px-6 py-12">
      <div className="max-w-5xl mx-auto">
        <div className="mb-10 border-l-4 border-blue-600 pl-5">
          <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2">
            MOS Translator
          </h1>
          <p className="text-slate-500 text-base max-w-xl leading-relaxed">
            Enter any military occupational code or job title — we'll map it to
            civilian equivalents, transferable skills, and ATS keywords.
          </p>
        </div>

        <div className="mb-6">
          <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">
            Select Branch (optional)
          </p>
          <div className="flex flex-wrap gap-2">
            {BRANCH_HINTS.map((b) => (
              <button
                key={b.branch}
                onClick={() =>
                  setSelectedBranch(selectedBranch === b.branch ? "" : b.branch)
                }
                className={`px-4 py-1.5 rounded-full text-sm font-semibold border transition-all ${
                  selectedBranch === b.branch
                    ? "bg-blue-600 border-blue-600 text-white"
                    : "bg-white border-slate-200 text-slate-500 hover:border-blue-300"
                }`}
              >
                {b.branch}
              </button>
            ))}
          </div>
          {selectedBranch && (
            <p className="mt-2 text-xs text-slate-400">
              Example codes:{" "}
              <span className="text-blue-500 font-mono">
                {BRANCH_HINTS.find((b) => b.branch === selectedBranch)?.example}
              </span>
            </p>
          )}
        </div>

        <div className="flex gap-3 mb-6">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              selectedBranch
                ? `Enter ${selectedBranch} code or title...`
                : "e.g.  1120 · 11B · Surface Warfare Officer · Combat Medic"
            }
            className="flex-1 px-5 py-3.5 rounded-xl border border-slate-200 bg-white text-slate-800 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <button
            onClick={handleTranslate}
            disabled={loading || !query.trim()}
            className="px-6 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold shadow-lg shadow-blue-100 transition-all hover:-translate-y-0.5 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 whitespace-nowrap"
          >
            {loading ? "Translating..." : "Translate →"}
          </button>
        </div>

        {error && (
          <div className="mb-6 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm">
            {error}
          </div>
        )}

        {loading && (
          <div className="space-y-3 mt-8">
            {[200, 150, 250, 180].map((w, i) => (
              <div
                key={i}
                className="h-4 rounded-lg bg-slate-200 animate-pulse"
                style={{ width: w }}
              />
            ))}
          </div>
        )}

        {result && !loading && (
          <div className="space-y-5">

            <div className="flex items-center gap-4 flex-wrap">
              <span className="px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-600 text-xs font-mono font-bold">
                {result.branch} · {result.code}
              </span>
              <h2 className="text-2xl font-black text-slate-900">
                {result.military_title}
              </h2>
            </div>

            <div className="p-5 rounded-xl bg-white border border-slate-200 border-l-4 border-l-blue-500 shadow-sm">
              <p className="text-slate-600 text-sm leading-relaxed">{result.summary}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-sm">
                <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-500 inline-block" />
                  Civilian Job Titles
                </p>
                <ul className="space-y-2">
                  {result.civilian_job_titles.map((t, i) => (
                    <li key={i} className="flex items-center justify-between gap-2">
                      <span className="flex items-center gap-2 text-sm text-slate-700">
                        <span className="text-blue-500 font-bold">›</span>
                        {t}
                      </span>
                      <button
                        onClick={() => handleSearchWithSkill(t, true)}
                        className="text-xs px-2.5 py-1 rounded-lg border transition-all shrink-0 bg-slate-50 border-slate-200 text-blue-500 hover:border-blue-300 hover:bg-blue-50"
                      >
                        Search →
                      </button>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-sm">
                <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-500 inline-block" />
                  ATS Keywords
                </p>
                <div className="flex flex-wrap gap-2">
                  {result.suggested_keywords.map((kw, i) => (
                    <button
                      key={i}
                      onClick={() => handleSearchWithSkill(kw)}
                      className="px-2.5 py-1 rounded-lg bg-amber-50 border border-amber-200 text-amber-700 text-xs font-mono hover:bg-amber-100 hover:border-amber-400 transition-colors"
                    >
                      {kw}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-sm">
              <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
                Transferable Skills
                <span className="normal-case font-normal tracking-normal text-slate-300 text-xs ml-1">
                  — click any skill to search jobs
                </span>
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {result.transferable_skills.map((skill, i) => {
                  const condensed = condenseSkill(skill)
                  return (
                    <button
                      key={i}
                      onClick={() => handleSearchWithSkill(skill, true)}
                      className="flex flex-col px-4 py-3 rounded-lg border text-left transition-all bg-slate-50 border-slate-200 hover:border-emerald-300 hover:bg-emerald-50 gap-1"
                    >
                      <span className="text-sm text-slate-600 leading-snug">{skill}</span>
                      <span className="text-xs text-emerald-500 font-mono">→ "{condensed}"</span>
                    </button>
                  )
                })}
              </div>
            </div>

            <div>
              <button
                onClick={() => {
                  setResult(null);
                  setQuery("");
                  setSelectedBranch("");
                }}
                className="text-sm text-slate-400 hover:text-slate-600 transition-colors"
              >
                ← Translate another
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}