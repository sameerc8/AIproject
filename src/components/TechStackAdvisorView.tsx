import React, { useState } from "react";
import {
  Cpu,
  Sparkles,
  CheckCircle2,
  HelpCircle,
  Shield,
  DollarSign,
  ArrowRight,
  Layers,
  Zap,
} from "lucide-react";
import { TechStackAdviceResponse, Project } from "../types.js";
import { getTechStackAdviceAPI } from "../lib/api.js";

interface TechStackAdvisorViewProps {
  selectedProject: Project | null;
  allProjects: Project[];
}

export const TechStackAdvisorView: React.FC<TechStackAdvisorViewProps> = ({
  selectedProject,
  allProjects,
}) => {
  const [description, setDescription] = useState<string>(
    selectedProject?.description ||
      "Real-time edge IoT patient monitoring telemetry hub with Gemini clinical anomaly triage."
  );
  const [domain, setDomain] = useState<string>(selectedProject?.domain || "Healthcare");
  const [loading, setLoading] = useState<boolean>(false);
  const [advice, setAdvice] = useState<TechStackAdviceResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGetAdvice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;

    setLoading(true);
    setError(null);
    try {
      const res = await getTechStackAdviceAPI({
        projectDescription: description,
        domain,
      });
      setAdvice(res);
    } catch (err: any) {
      console.error("Tech stack advisor error:", err);
      setError(err?.message || "Failed to generate tech stack advice");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectProject = (proj: Project) => {
    setDescription(proj.description || proj.problemStatement);
    setDomain(proj.domain);
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="border-b border-slate-700 pb-5">
        <div className="flex items-center gap-2 text-xs font-bold text-cyan-400 uppercase tracking-wider">
          <Cpu className="w-4 h-4" />
          <span>Intelligent System Architecture Rationale</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-1">
          AI Tech Stack Advisor
        </h1>
        <p className="text-sm text-slate-300 mt-1 max-w-3xl">
          Describe your project workload. Gemini AI evaluates engineering tradeoffs and recommends the
          ideal Frontend, Backend, Database, AI SDK, Cloud Host, Auth, and CI/CD with explicit rationale.
        </p>
      </div>

      {/* Input Form & Project Presets */}
      <div className="bg-[#1E293B] border border-slate-700 rounded-2xl p-6 shadow-sm space-y-4">
        {allProjects.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 pb-2">
            <span className="text-xs font-semibold text-slate-300">Load from project library:</span>
            {allProjects.slice(0, 4).map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => handleSelectProject(p)}
                className="text-xs bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white px-2.5 py-1 rounded-md border border-slate-700 transition-colors cursor-pointer font-medium"
              >
                {p.title.slice(0, 25)}...
              </button>
            ))}
          </div>
        )}

        <form onSubmit={handleGetAdvice} className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
              Project Description & Requirements
            </label>
            <textarea
              id="advisor-desc-textarea"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Distributed high-throughput telemetry collector with zero-knowledge verification and real-time dashboard..."
              className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 leading-relaxed font-normal"
              required
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <label className="text-xs font-semibold text-slate-300">Domain context:</label>
              <select
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                className="bg-slate-900 border border-slate-700 rounded-md px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500 cursor-pointer font-medium"
              >
                <option value="Artificial Intelligence">Artificial Intelligence</option>
                <option value="Healthcare">Healthcare</option>
                <option value="IoT">IoT</option>
                <option value="Blockchain">Blockchain</option>
                <option value="Cybersecurity">Cybersecurity</option>
                <option value="Smart City">Smart City</option>
                <option value="FinTech">FinTech</option>
                <option value="Agriculture">Agriculture</option>
              </select>
            </div>

            <button
              id="submit-advisor-btn"
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 px-5 py-2 text-xs font-bold text-white bg-[#6366f1] hover:bg-indigo-600 disabled:opacity-50 rounded-xl shadow-sm transition-all cursor-pointer"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Analyzing Tradeoffs...</span>
                </>
              ) : (
                <>
                  <Cpu className="w-4 h-4" />
                  <span>Get Tech Recommendations</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {error && (
        <div className="bg-rose-950/40 border border-rose-800 rounded-xl p-4 text-xs text-rose-300">
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* Advisory Results */}
      {advice && (
        <div className="space-y-6 animate-fadeIn">
          {/* Summary & Cost Card */}
          <div className="bg-[#1E293B] border border-slate-700 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 text-xs font-bold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Architecture Synthesis</span>
              </div>
              <h3 className="text-lg font-bold text-white tracking-tight">
                Recommended Enterprise Technology Blueprint
              </h3>
              <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
                {advice.summaryRationale}
              </p>
            </div>

            <div className="bg-slate-900 p-4 rounded-xl border border-slate-700 min-w-[200px] text-xs space-y-1.5 shadow-sm">
              <span className="font-bold text-slate-400 uppercase tracking-wider text-[10px]">
                Estimated Cloud Cost Tier
              </span>
              <div className="text-base font-bold text-emerald-400 flex items-center gap-1">
                <DollarSign className="w-4 h-4" />
                <span>{advice.estimatedCloudCostTier}</span>
              </div>
            </div>
          </div>

          {/* 8 Categories Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {advice.recommendations.map((item, idx) => (
              <div
                key={idx}
                className="bg-[#1E293B] border border-slate-700 hover:border-slate-600 rounded-2xl p-5 shadow-sm space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider">
                    {item.category}
                  </span>
                  <span className="text-[11px] font-bold text-indigo-300 bg-indigo-500/15 px-2.5 py-0.5 rounded border border-indigo-500/30">
                    {item.recommended}
                  </span>
                </div>

                <div className="space-y-1 text-xs">
                  <span className="font-semibold text-slate-300">Why Selected:</span>
                  <p className="text-slate-300 leading-relaxed text-[11px]">{item.whySelected}</p>
                </div>

                {/* Key Advantages */}
                <div className="space-y-1 text-xs">
                  <span className="font-semibold text-emerald-400 text-[11px]">Key Advantages:</span>
                  <div className="flex flex-wrap gap-1">
                    {item.keyAdvantages?.map((adv, aIdx) => (
                      <span
                        key={aIdx}
                        className="px-2 py-0.5 text-[10px] font-medium bg-slate-900 text-slate-200 rounded border border-slate-700"
                      >
                        ✓ {adv}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Alternatives considered */}
                <div className="pt-2 border-t border-slate-700/80 flex items-center justify-between text-[11px] text-slate-400">
                  <span>Alternatives:</span>
                  <span className="text-slate-300 font-mono">
                    {item.alternativesConsidered?.join(", ") || "None"}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Security Best Practices */}
          {advice.securityConsiderations?.length > 0 && (
            <div className="bg-[#1E293B] border border-slate-700 rounded-2xl p-5 shadow-sm space-y-3">
              <div className="flex items-center gap-2 text-rose-400 font-bold text-xs uppercase tracking-wider">
                <Shield className="w-4 h-4" />
                <span>Security & Compliance Checklist</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
                {advice.securityConsiderations.map((sec, sIdx) => (
                  <div
                    key={sIdx}
                    className="bg-slate-900 p-3 rounded-lg border border-slate-800 text-slate-300 flex items-start gap-2"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span className="leading-relaxed">{sec}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
