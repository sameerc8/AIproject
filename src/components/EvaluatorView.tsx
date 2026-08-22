import React, { useState } from "react";
import { Radar, Bar } from "react-chartjs-2";
import "../lib/chartConfig.js";
import {
  CheckCircle2,
  AlertTriangle,
  ShieldAlert,
  Award,
  Sparkles,
  DollarSign,
  Clock,
  ArrowRight,
  GitFork,
  MapPin,
  TrendingUp,
  HelpCircle,
  Zap,
} from "lucide-react";
import { ProjectEvaluation, Project, EvaluateProjectParams } from "../types.js";
import { evaluateProjectAPI } from "../lib/api.js";

interface EvaluatorViewProps {
  onOpenArchitecture: (project: Project) => void;
  onOpenRoadmap: (project: Project) => void;
  onSelectProject: (project: Project) => void;
}

const PRESET_IDEAS = [
  {
    title: "Diabetic Retinopathy Early Detection Telehealth Portal",
    domain: "Healthcare",
    targetAudience: "Optometrists & Rural Health Workers",
    description:
      "A web portal allowing field nurses to upload fundus camera retinal photos. A dual-CNN ensemble classifies micro-aneurysms and hemorrhages, outputs heatmaps, and drafts triage referrals.",
    technologies: ["Python", "FastAPI", "React", "PyTorch", "Tailwind CSS"],
  },
  {
    title: "Decentralized Carbon Credit Market with Satellite Oracle",
    domain: "Blockchain",
    targetAudience: "ESG Auditors & Reforestation Projects",
    description:
      "Tokenizing preserved forest acreage using ERC-1155 smart contracts. Satellite Sentinel-2 imagery is analyzed via computer vision change detection to automatically trigger carbon credit issuance.",
    technologies: ["Solidity", "Hardhat", "FastAPI", "Sentinel API", "React"],
  },
  {
    title: "AI Dynamic Green-Wave Traffic Signal Controller",
    domain: "Smart City",
    targetAudience: "City Traffic Operations & Emergency Services",
    description:
      "Edge-camera RTSP vehicle density counters that feed a Deep Q-Learning reinforcement agent to modulate traffic light phase splits dynamically and clear 500m green corridors for approaching ambulances.",
    technologies: ["Python", "YOLOv11", "FastAPI", "Redis", "React"],
  },
];

export const EvaluatorView: React.FC<EvaluatorViewProps> = ({
  onOpenArchitecture,
  onOpenRoadmap,
  onSelectProject,
}) => {
  const [title, setTitle] = useState<string>("");
  const [domain, setDomain] = useState<string>("Artificial Intelligence");
  const [targetAudience, setTargetAudience] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [technologiesText, setTechnologiesText] = useState<string>("");
  const [budgetOrScope, setBudgetOrScope] = useState<string>("");

  const [loading, setLoading] = useState<boolean>(false);
  const [evaluation, setEvaluation] = useState<ProjectEvaluation | null>(null);
  const [savedProject, setSavedProject] = useState<Project | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleApplyPreset = (preset: (typeof PRESET_IDEAS)[0]) => {
    setTitle(preset.title);
    setDomain(preset.domain);
    setTargetAudience(preset.targetAudience);
    setDescription(preset.description);
    setTechnologiesText(preset.technologies.join(", "));
  };

  const handleEvaluate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      setError("Please provide a project title and description.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const techs = technologiesText
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);

      const params: EvaluateProjectParams = {
        title,
        domain,
        targetAudience: targetAudience || "General Users",
        description,
        technologies: techs,
        budgetOrScope,
      };

      const result = await evaluateProjectAPI({ ...params, saveToHistory: true });
      setEvaluation(result.evaluation);
      setSavedProject(result.project);
    } catch (err: any) {
      console.error("Evaluation error:", err);
      setError(err?.message || "Failed to evaluate project idea. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Radar Chart Data for 6 Dimensions
  const radarData = evaluation
    ? {
        labels: [
          "Innovation",
          "Feasibility",
          "Usefulness",
          "Scalability",
          "Complexity",
          "Security",
        ],
        datasets: [
          {
            label: "Dimension Score (0-100)",
            data: [
              evaluation.scores.innovation,
              evaluation.scores.technicalFeasibility,
              evaluation.scores.realWorldUsefulness,
              evaluation.scores.scalability,
              evaluation.scores.complexity,
              evaluation.scores.security,
            ],
            backgroundColor: "rgba(99, 102, 241, 0.25)",
            borderColor: "#6366f1",
            borderWidth: 2,
            pointBackgroundColor: "#818cf8",
            pointBorderColor: "#fff",
            pointHoverBackgroundColor: "#fff",
            pointHoverBorderColor: "#6366f1",
          },
        ],
      }
    : null;

  const radarOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: "#0f172a",
        titleColor: "#f8fafc",
        bodyColor: "#cbd5e1",
        borderColor: "#334155",
        borderWidth: 1,
      },
    },
    scales: {
      r: {
        angleLines: { color: "#334155" },
        grid: { color: "#1e293b" },
        pointLabels: { color: "#cbd5e1", font: { size: 11, weight: "bold" as const } },
        ticks: {
          backdropColor: "transparent",
          color: "#64748b",
          font: { size: 9 },
          stepSize: 20,
        },
        min: 0,
        max: 100,
      },
    },
  };

  // Score Bar Chart Data
  const barData = evaluation
    ? {
        labels: ["Innovation", "Feasibility", "Usefulness", "Scalability", "Complexity", "Security"],
        datasets: [
          {
            label: "Score",
            data: [
              evaluation.scores.innovation,
              evaluation.scores.technicalFeasibility,
              evaluation.scores.realWorldUsefulness,
              evaluation.scores.scalability,
              evaluation.scores.complexity,
              evaluation.scores.security,
            ],
            backgroundColor: [
              "#f59e0b", // Amber
              "#10b981", // Emerald
              "#3b82f6", // Blue
              "#8b5cf6", // Purple
              "#ec4899", // Pink
              "#06b6d4", // Cyan
            ],
            borderRadius: 6,
          },
        ],
      }
    : null;

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: "#0f172a",
        titleColor: "#f8fafc",
        bodyColor: "#cbd5e1",
        borderColor: "#334155",
        borderWidth: 1,
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: "#94a3b8", font: { size: 10 } },
      },
      y: {
        grid: { color: "#1e293b" },
        ticks: { color: "#94a3b8", font: { size: 10 }, stepSize: 20 },
        min: 0,
        max: 100,
      },
    },
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="border-b border-slate-700 pb-5">
        <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-wider">
          <CheckCircle2 className="w-4 h-4" />
          <span>Technical Feasibility & Readiness Auditor</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-1">
          AI Project Evaluator
        </h1>
        <p className="text-sm text-slate-300 mt-1 max-w-3xl">
          Submit your custom project concept. Gemini AI will evaluate innovation, technical feasibility,
          real-world usefulness, security risks, scalability, and produce an overall Readiness Score.
        </p>
      </div>

      {/* Preset Prompts bar */}
      <div className="bg-[#1E293B] border border-slate-700 rounded-xl p-3 flex flex-wrap items-center gap-2">
        <span className="text-xs font-bold text-slate-300 flex items-center gap-1">
          <Zap className="w-3.5 h-3.5 text-amber-400" />
          Test with example ideas:
        </span>
        {PRESET_IDEAS.map((preset, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => handleApplyPreset(preset)}
            className="text-xs bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white px-2.5 py-1 rounded-md border border-slate-700 transition-colors cursor-pointer font-medium"
          >
            {preset.title.split(" ")[0]} ({preset.domain})
          </button>
        ))}
      </div>

      {/* Evaluation Input Form */}
      <div className="bg-[#1E293B] border border-slate-700 rounded-2xl p-6 shadow-sm">
        <form onSubmit={handleEvaluate} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                Project Title *
              </label>
              <input
                id="eval-title-input"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Autonomous Satellite Wildfire Detection Drone Swarm"
                className="w-full bg-slate-900/90 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                Domain
              </label>
              <select
                id="eval-domain-select"
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                className="w-full bg-slate-900/90 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 cursor-pointer"
              >
                <option value="Artificial Intelligence">Artificial Intelligence</option>
                <option value="Machine Learning">Machine Learning</option>
                <option value="Healthcare">Healthcare & BioTech</option>
                <option value="IoT">IoT & Embedded Systems</option>
                <option value="Blockchain">Blockchain & Web3</option>
                <option value="Cybersecurity">Cybersecurity & SecOps</option>
                <option value="Agriculture">Agriculture & Climate</option>
                <option value="Smart City">Smart City & Mobility</option>
                <option value="Education">Education & EdTech</option>
                <option value="FinTech">FinTech & Payments</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                Target Audience / End Users
              </label>
              <input
                id="eval-audience-input"
                type="text"
                value={targetAudience}
                onChange={(e) => setTargetAudience(e.target.value)}
                placeholder="e.g. Clinical Radiologists, Forestry Rangers, First Responders"
                className="w-full bg-slate-900/90 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                Proposed Tech Stack (Comma Separated)
              </label>
              <input
                id="eval-tech-input"
                type="text"
                value={technologiesText}
                onChange={(e) => setTechnologiesText(e.target.value)}
                placeholder="e.g. Python, PyTorch, React, OpenCV, MQTT, Docker"
                className="w-full bg-slate-900/90 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
              Project Description & Technical Mechanics *
            </label>
            <textarea
              id="eval-description-textarea"
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what the system does, how inputs are ingested, which models are used, and how value is delivered..."
              className="w-full bg-slate-900/90 border border-slate-700 rounded-lg p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 leading-relaxed"
              required
            />
          </div>

          <div className="pt-2 flex items-center justify-between">
            <span className="text-xs text-slate-400">
              Evaluates against 6 core software engineering & product feasibility criteria.
            </span>

            <button
              id="submit-evaluate-btn"
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 px-6 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 rounded-xl shadow-lg shadow-emerald-600/25 transition-all cursor-pointer"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Auditing Technical Feasibility...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Evaluate Project Idea</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Error Output */}
      {error && (
        <div className="bg-rose-950/40 border border-rose-800 rounded-xl p-4 text-xs text-rose-300">
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* Evaluation Results Section */}
      {evaluation && (
        <div className="space-y-6 animate-fadeIn">
          {/* Readiness Score Hero Card */}
          <div className="bg-gradient-to-r from-[#1E293B] via-slate-800 to-[#1E293B] border border-slate-700 rounded-2xl p-6 sm:p-8 shadow-md">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="space-y-2 text-center md:text-left">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold">
                  <Award className="w-3.5 h-3.5" />
                  <span>Audit Completed</span>
                </div>
                <h2 className="text-2xl font-bold text-white tracking-tight">{title}</h2>
                <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
                  {evaluation.verdict}
                </p>
                <div className="flex flex-wrap gap-4 pt-2 text-xs">
                  <span className="text-slate-400 flex items-center gap-1">
                    <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                    Estimated Cost: <strong className="text-white">{evaluation.estimatedCost}</strong>
                  </span>
                  <span className="text-slate-400 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-cyan-400" />
                    Target Timeline: <strong className="text-white">{evaluation.estimatedDuration}</strong>
                  </span>
                </div>
              </div>

              {/* Overall Readiness Gauge */}
              <div className="flex flex-col items-center justify-center p-5 rounded-2xl bg-slate-900/90 border border-slate-700 min-w-[200px] text-center shadow-lg">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Overall Readiness
                </span>
                <div className="my-2 relative flex items-center justify-center">
                  <div
                    className={`text-4xl font-extrabold ${
                      evaluation.overallReadinessScore >= 80
                        ? "text-emerald-400"
                        : evaluation.overallReadinessScore >= 65
                        ? "text-amber-400"
                        : "text-rose-400"
                    }`}
                  >
                    {evaluation.overallReadinessScore}
                    <span className="text-xl text-slate-400">/100</span>
                  </div>
                </div>
                <span
                  className={`text-xs px-2.5 py-0.5 rounded-full font-bold border ${
                    evaluation.overallReadinessScore >= 80
                      ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/20"
                      : evaluation.overallReadinessScore >= 65
                      ? "bg-amber-500/10 text-amber-300 border-amber-500/20"
                      : "bg-rose-500/10 text-rose-300 border-rose-500/20"
                  }`}
                >
                  {evaluation.overallReadinessScore >= 80
                    ? "High Production Viability"
                    : evaluation.overallReadinessScore >= 65
                    ? "Good Viability with Polish"
                    : "Needs Scope Refinement"}
                </span>
              </div>
            </div>

            {/* Quick Action Navigation */}
            {savedProject && (
              <div className="mt-6 pt-4 border-t border-slate-700 flex flex-wrap items-center justify-between gap-3">
                <div className="text-xs text-slate-400">
                  Blueprint saved to library. Jump straight into system modeling:
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onOpenArchitecture(savedProject)}
                    className="px-3 py-1.5 text-xs font-bold text-cyan-300 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/20 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <GitFork className="w-3.5 h-3.5 text-cyan-400" />
                    <span>View Architecture</span>
                  </button>
                  <button
                    onClick={() => onOpenRoadmap(savedProject)}
                    className="px-3 py-1.5 text-xs font-bold text-purple-300 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/20 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <MapPin className="w-3.5 h-3.5 text-purple-400" />
                    <span>View 8-Phase Roadmap</span>
                  </button>
                  <button
                    onClick={() => onSelectProject(savedProject)}
                    className="px-3 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                  >
                    <span>Full Details</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Charts: Radar + Bar Graphs */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Radar Chart */}
            <div className="bg-[#1E293B] border border-slate-700 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-bold text-white">6-Dimensional Readiness Radar</h3>
                  <p className="text-xs text-slate-400">Holistic balance of technical and product traits</p>
                </div>
                <span className="text-xs font-semibold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                  Radar Graph
                </span>
              </div>
              <div className="h-64 relative">
                {radarData && <Radar data={radarData} options={radarOptions} />}
              </div>
            </div>

            {/* Score Bar Chart */}
            <div className="bg-[#1E293B] border border-slate-700 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-bold text-white">Dimension Breakdown (0 - 100)</h3>
                  <p className="text-xs text-slate-400">Granular metric comparison</p>
                </div>
                <span className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  Bar Metrics
                </span>
              </div>
              <div className="h-64 relative">
                {barData && <Bar data={barData} options={barOptions} />}
              </div>
            </div>
          </div>

          {/* Metric Progress Bars */}
          <div className="bg-[#1E293B] border border-slate-700 rounded-2xl p-6 shadow-sm">
            <h3 className="text-sm font-bold text-white mb-4">Detailed Dimension Analysis</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-slate-300">Innovation Score</span>
                  <span className="text-amber-400 font-bold">{evaluation.scores.innovation}%</span>
                </div>
                <div className="w-full bg-slate-900 rounded-full h-2">
                  <div
                    className="bg-amber-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${evaluation.scores.innovation}%` }}
                  ></div>
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-slate-300">Technical Feasibility</span>
                  <span className="text-emerald-400 font-bold">{evaluation.scores.technicalFeasibility}%</span>
                </div>
                <div className="w-full bg-slate-900 rounded-full h-2">
                  <div
                    className="bg-emerald-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${evaluation.scores.technicalFeasibility}%` }}
                  ></div>
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-slate-300">Real-World Usefulness</span>
                  <span className="text-blue-400 font-bold">{evaluation.scores.realWorldUsefulness}%</span>
                </div>
                <div className="w-full bg-slate-900 rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${evaluation.scores.realWorldUsefulness}%` }}
                  ></div>
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-slate-300">Scalability</span>
                  <span className="text-purple-400 font-bold">{evaluation.scores.scalability}%</span>
                </div>
                <div className="w-full bg-slate-900 rounded-full h-2">
                  <div
                    className="bg-purple-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${evaluation.scores.scalability}%` }}
                  ></div>
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-slate-300">Complexity Management</span>
                  <span className="text-pink-400 font-bold">{evaluation.scores.complexity}%</span>
                </div>
                <div className="w-full bg-slate-900 rounded-full h-2">
                  <div
                    className="bg-pink-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${evaluation.scores.complexity}%` }}
                  ></div>
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-slate-300">Security & Privacy Posture</span>
                  <span className="text-cyan-400 font-bold">{evaluation.scores.security}%</span>
                </div>
                <div className="w-full bg-slate-900 rounded-full h-2">
                  <div
                    className="bg-cyan-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${evaluation.scores.security}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          {/* Deep Dive Breakdown: Challenges, Security, Missing Features */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Challenges & Mitigations */}
            <div className="bg-[#1E293B] border border-slate-700 rounded-2xl p-6 shadow-sm space-y-3">
              <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wider">
                <AlertTriangle className="w-4 h-4" />
                <span>Key Challenges & Mitigations</span>
              </div>
              <div className="space-y-3">
                {evaluation.possibleChallenges?.map((item, idx) => (
                  <div key={idx} className="bg-slate-900/90 p-3.5 rounded-xl border border-slate-800 space-y-1 text-xs">
                    <p className="font-semibold text-slate-200">⚠️ {item.challenge}</p>
                    <p className="text-emerald-400/90 leading-relaxed">
                      <strong>Fix:</strong> {item.mitigation}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Security Concerns */}
            <div className="bg-[#1E293B] border border-slate-700 rounded-2xl p-6 shadow-sm space-y-3">
              <div className="flex items-center gap-2 text-rose-400 font-bold text-xs uppercase tracking-wider">
                <ShieldAlert className="w-4 h-4" />
                <span>Security Concerns & Audits</span>
              </div>
              <div className="space-y-2">
                {evaluation.securityConcerns?.map((sec, idx) => (
                  <div key={idx} className="bg-slate-900/90 p-3.5 rounded-xl border border-slate-800 text-xs text-slate-300 flex items-start gap-2">
                    <span className="text-rose-400 font-bold">•</span>
                    <span>{sec}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Missing Features & Recommendations */}
            <div className="bg-[#1E293B] border border-slate-700 rounded-2xl p-6 shadow-sm space-y-3">
              <div className="flex items-center gap-2 text-cyan-400 font-bold text-xs uppercase tracking-wider">
                <Sparkles className="w-4 h-4" />
                <span>High-Impact Recommendations</span>
              </div>
              <div className="space-y-2">
                {evaluation.recommendations?.map((rec, idx) => (
                  <div key={idx} className="bg-slate-900/90 p-3.5 rounded-xl border border-slate-800 text-xs text-slate-300 flex items-start gap-2">
                    <span className="text-cyan-400 font-bold">✓</span>
                    <span>{rec}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
