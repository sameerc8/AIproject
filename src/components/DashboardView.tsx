import React from "react";
import { Doughnut, Bar } from "react-chartjs-2";
import "../lib/chartConfig.js";
import { DashboardStats, Project } from "../types.js";
import {
  Sparkles,
  CheckCircle2,
  TrendingUp,
  Award,
  Layers,
  ArrowRight,
  Cpu,
  Flame,
  Zap,
  BookOpen,
  GitFork,
  MapPin,
  Lightbulb,
  Radio,
  Server,
  Database,
  Plus,
} from "lucide-react";
import { ActiveTab } from "./Navbar.js";

interface DashboardViewProps {
  stats: DashboardStats | null;
  loading: boolean;
  onNavigate: (tab: ActiveTab) => void;
  onSelectProject: (project: Project) => void;
  onRefresh: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  stats,
  loading,
  onNavigate,
  onSelectProject,
}) => {
  if (loading || !stats) {
    return (
      <div className="py-20 flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin"></div>
        <p className="text-sm text-slate-400">Loading Innovation Lab Analytics...</p>
      </div>
    );
  }

  // Prepare Doughnut Chart Data (Domain Distribution)
  const domainLabels = Object.keys(stats.domainCounts || {});
  const domainValues = Object.values(stats.domainCounts || {});
  const domainColors = [
    "#6366f1", // indigo
    "#10b981", // emerald
    "#f59e0b", // amber
    "#06b6d4", // cyan
    "#ec4899", // pink
    "#8b5cf6", // purple
    "#3b82f6", // blue
    "#14b8a6", // teal
  ];

  const doughnutData = {
    labels: domainLabels.length ? domainLabels : ["AI & ML", "Healthcare", "IoT & Edge", "Cybersecurity", "Blockchain"],
    datasets: [
      {
        data: domainValues.length ? domainValues : [4, 3, 2, 2, 1],
        backgroundColor: domainColors.slice(0, Math.max(domainLabels.length, 5)),
        borderWidth: 0,
        hoverOffset: 6,
      },
    ],
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom" as const,
        labels: {
          color: "#94a3b8",
          font: { size: 11 },
          padding: 12,
        },
      },
      tooltip: {
        backgroundColor: "#0f172a",
        titleColor: "#f8fafc",
        bodyColor: "#cbd5e1",
        borderColor: "#334155",
        borderWidth: 1,
        padding: 10,
      },
    },
    cutout: "70%",
  };

  // Prepare Bar Chart Data (Readiness & Innovation Scores)
  const barData = {
    labels: stats.readinessRanges.map((r) => r.range),
    datasets: [
      {
        label: "Projects in Range",
        data: stats.readinessRanges.map((r) => r.count),
        backgroundColor: "#6366f1",
        borderRadius: 6,
      },
    ],
  };

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
        grid: { color: "#334155" },
        ticks: { color: "#94a3b8", font: { size: 10 }, stepSize: 1 },
      },
    },
  };

  const featuredProject = stats.recentProjects[0] || null;

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Current Project Spotlight Header */}
      <div className="bg-[#1E293B] rounded-2xl border border-slate-700 p-5 sm:p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-sm font-medium text-slate-400">
            Featured Blueprint:{" "}
            <span className="text-white font-bold">{featuredProject ? featuredProject.title : "EcoSync Smart Grid & AI Edge"}</span>
          </span>
          <span className="px-2.5 py-0.5 bg-amber-500/10 text-amber-400 text-[10px] font-bold rounded uppercase border border-amber-500/20">
            Production Ready
          </span>
          <span className="px-2.5 py-0.5 bg-indigo-500/10 text-indigo-400 text-[10px] font-bold rounded uppercase border border-indigo-500/20">
            {featuredProject ? featuredProject.domain : "IoT & Smart Energy"}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate("evaluator")}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-lg shadow-lg shadow-indigo-500/20 transition-all cursor-pointer flex items-center gap-1.5"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>New Evaluation</span>
          </button>
          <button
            onClick={() => onNavigate("generator")}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>Generate Ideas</span>
          </button>
        </div>
      </div>

      {/* Vibrant KPI Metric Cards (4-Column Bento Grid) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Metric 1: Innovation Score */}
        <div className="bg-[#1E293B] rounded-2xl p-5 border border-slate-700 shadow-sm flex flex-col justify-between hover:border-emerald-500/40 transition-colors">
          <div>
            <div className="flex items-center justify-between mb-1">
              <p className="text-xs text-slate-400 font-medium">Avg Innovation Score</p>
              <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
                <Flame className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-end gap-2 mb-3">
              <h3 className="text-3xl font-bold text-white">{stats.avgInnovationScore || "9.2"}</h3>
              <span className="text-emerald-400 text-xs font-bold pb-1">+14% Novelty</span>
            </div>
          </div>
          <div className="w-full bg-slate-700 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-emerald-500 h-1.5 rounded-full transition-all duration-500"
              style={{ width: `${Math.min((stats.avgInnovationScore || 9.2) * 10, 100)}%` }}
            ></div>
          </div>
        </div>

        {/* Metric 2: Readiness Score */}
        <div className="bg-[#1E293B] rounded-2xl p-5 border border-slate-700 shadow-sm flex flex-col justify-between hover:border-indigo-500/40 transition-colors">
          <div>
            <div className="flex items-center justify-between mb-1">
              <p className="text-xs text-slate-400 font-medium">Readiness Score</p>
              <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400">
                <Award className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-end gap-2 mb-3">
              <h3 className="text-3xl font-bold text-white">{stats.avgReadinessScore || 85}%</h3>
              <span className="text-indigo-400 text-xs font-bold pb-1">Stable Blueprint</span>
            </div>
          </div>
          <div className="w-full bg-slate-700 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-indigo-500 h-1.5 rounded-full transition-all duration-500"
              style={{ width: `${stats.avgReadinessScore || 85}%` }}
            ></div>
          </div>
        </div>

        {/* Metric 3: Technical Complexity */}
        <div className="bg-[#1E293B] rounded-2xl p-5 border border-slate-700 shadow-sm flex flex-col justify-between hover:border-amber-500/40 transition-colors">
          <div>
            <div className="flex items-center justify-between mb-1">
              <p className="text-xs text-slate-400 font-medium">System Complexity</p>
              <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400">
                <Zap className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-end gap-2 mb-3">
              <h3 className="text-3xl font-bold text-white">High</h3>
              <span className="text-amber-400 text-xs font-bold pb-1">Lv 7/10</span>
            </div>
          </div>
          <div className="flex gap-1.5">
            <div className="h-1.5 flex-1 bg-amber-500 rounded-full"></div>
            <div className="h-1.5 flex-1 bg-amber-500 rounded-full"></div>
            <div className="h-1.5 flex-1 bg-slate-700 rounded-full"></div>
          </div>
        </div>

        {/* Metric 4: Dev Team & Generated Blueprints */}
        <div className="bg-[#1E293B] rounded-2xl p-5 border border-slate-700 shadow-sm flex flex-col justify-between hover:border-cyan-500/40 transition-colors">
          <div>
            <div className="flex items-center justify-between mb-1">
              <p className="text-xs text-slate-400 font-medium">Total Blueprints</p>
              <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400">
                <Layers className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-end gap-2 mb-3">
              <h3 className="text-3xl font-bold text-white">{stats.totalGenerated + stats.totalEvaluated}</h3>
              <span className="text-slate-400 text-xs font-medium pb-1">4-6 Dev Scope</span>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex -space-x-2">
              <div className="w-6 h-6 rounded-full bg-indigo-500 border-2 border-[#1E293B] text-[9px] font-bold flex items-center justify-center text-white">AI</div>
              <div className="w-6 h-6 rounded-full bg-emerald-500 border-2 border-[#1E293B] text-[9px] font-bold flex items-center justify-center text-white">ML</div>
              <div className="w-6 h-6 rounded-full bg-amber-500 border-2 border-[#1E293B] text-[9px] font-bold flex items-center justify-center text-white">IoT</div>
              <div className="w-6 h-6 rounded-full bg-rose-500 border-2 border-[#1E293B] text-[9px] font-bold flex items-center justify-center text-white">DB</div>
            </div>
            <span className="text-[10px] text-slate-400 font-mono">100% Cloud</span>
          </div>
        </div>
      </div>

      {/* Vibrant System Architecture Flow & Feature Recommender Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* System Architecture Flow (Col 8) */}
        <div className="lg:col-span-8 bg-[#1E293B] rounded-2xl p-6 border border-slate-700 relative overflow-hidden flex flex-col justify-between shadow-sm">
          <div>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
                <h4 className="text-sm font-bold text-white uppercase tracking-wider">
                  System Architecture Flow
                </h4>
              </div>
              <button
                onClick={() => onNavigate("architecture")}
                className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1 cursor-pointer"
              >
                <span>Interactive 6-Tier Canvas</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Architecture Blocks Flow */}
            <div className="flex items-center justify-between relative z-10 py-2 overflow-x-auto scrollbar-none gap-2">
              <div className="flex flex-col items-center gap-2 min-w-[76px]">
                <div className="w-18 h-18 sm:w-20 sm:h-20 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex flex-col items-center justify-center text-center p-1 shadow-sm transition-transform hover:scale-105">
                  <Server className="w-5 h-5 text-indigo-400 mb-1" />
                  <span className="text-[10px] font-bold text-indigo-400 uppercase">FRONTEND</span>
                </div>
                <p className="text-[10px] text-slate-400 uppercase font-semibold">React / Tailwind</p>
              </div>

              <div className="h-px w-6 sm:w-10 bg-slate-700 flex-shrink-0"></div>

              <div className="flex flex-col items-center gap-2 min-w-[76px]">
                <div className="w-18 h-18 sm:w-20 sm:h-20 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex flex-col items-center justify-center text-center p-1 shadow-sm transition-transform hover:scale-105">
                  <Cpu className="w-5 h-5 text-emerald-400 mb-1" />
                  <span className="text-[10px] font-bold text-emerald-400 uppercase">AI ENGINE</span>
                </div>
                <p className="text-[10px] text-slate-400 uppercase font-semibold">Gemini 3.7 Flash</p>
              </div>

              <div className="h-px w-6 sm:w-10 bg-slate-700 flex-shrink-0"></div>

              <div className="flex flex-col items-center gap-2 min-w-[76px]">
                <div className="w-18 h-18 sm:w-20 sm:h-20 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex flex-col items-center justify-center text-center p-1 shadow-sm transition-transform hover:scale-105">
                  <Database className="w-5 h-5 text-amber-400 mb-1" />
                  <span className="text-[10px] font-bold text-amber-400 uppercase">STORAGE</span>
                </div>
                <p className="text-[10px] text-slate-400 uppercase font-semibold">PostgreSQL / Vector</p>
              </div>

              <div className="h-px w-6 sm:w-10 bg-slate-700 flex-shrink-0"></div>

              <div className="flex flex-col items-center gap-2 min-w-[76px]">
                <div className="w-18 h-18 sm:w-20 sm:h-20 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex flex-col items-center justify-center text-center p-1 shadow-sm transition-transform hover:scale-105">
                  <Radio className="w-5 h-5 text-rose-400 mb-1" />
                  <span className="text-[10px] font-bold text-rose-400 uppercase">IOT & EDGE</span>
                </div>
                <p className="text-[10px] text-slate-400 uppercase font-semibold">MQTT / WebSockets</p>
              </div>
            </div>
          </div>

          {/* Callout Quote */}
          <div className="mt-6 p-4 bg-slate-800/40 rounded-xl border border-dashed border-slate-700">
            <p className="text-xs leading-relaxed text-slate-300 italic">
              "The system architecture integrates a dual-pathway AI verification pipeline. Gemini 3.7 analyzes telemetry load patterns while the Edge layer handles real-time switching logic to prevent cascading failures."
            </p>
          </div>

          <div className="absolute top-0 right-0 -mt-8 -mr-8 w-60 h-60 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
        </div>

        {/* AI Feature Recommender (Col 4) */}
        <div className="lg:col-span-4 bg-[#1E293B] rounded-2xl p-6 border border-slate-700 flex flex-col justify-between shadow-sm">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-400" />
                <h4 className="text-sm font-bold text-white">AI Feature Recommender</h4>
              </div>
              <button
                onClick={() => onNavigate("features")}
                className="text-[11px] text-indigo-400 hover:text-indigo-300 font-semibold"
              >
                View All
              </button>
            </div>

            <div className="space-y-3">
              <div
                onClick={() => onNavigate("features")}
                className="p-3 bg-indigo-500/5 rounded-xl border border-indigo-500/20 group cursor-pointer hover:bg-indigo-500/10 transition-colors"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-indigo-400 uppercase">Predictive Analytics</span>
                  <span className="text-[10px] bg-indigo-500 text-white font-bold px-1.5 py-0.5 rounded">
                    ADD
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">Implement Time-Series forecasting for energy demand peaks.</p>
              </div>

              <div
                onClick={() => onNavigate("features")}
                className="p-3 bg-emerald-500/5 rounded-xl border border-emerald-500/20 group cursor-pointer hover:bg-emerald-500/10 transition-colors"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-emerald-400 uppercase">Blockchain Audit</span>
                  <span className="text-[10px] bg-emerald-500 text-white font-bold px-1.5 py-0.5 rounded">
                    ADD
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">Immutable ledger for peer-to-peer energy trading logs.</p>
              </div>

              <div
                onClick={() => onNavigate("features")}
                className="p-3 bg-amber-500/5 rounded-xl border border-amber-500/20 group cursor-pointer hover:bg-amber-500/10 transition-colors"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-amber-400 uppercase">Agentic Healing</span>
                  <span className="text-[10px] bg-amber-500 text-white font-bold px-1.5 py-0.5 rounded">
                    ADD
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">Self-correcting AI agents that isolate faulty grid nodes.</p>
              </div>
            </div>
          </div>

          <div className="pt-3">
            <button
              onClick={() => onNavigate("features")}
              className="w-full py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-bold rounded-lg transition-colors cursor-pointer text-center"
            >
              Explore 12+ Recommended AI Modules
            </button>
          </div>
        </div>
      </div>

      {/* Development Roadmap Phase 1-4 Preview Card */}
      <div className="bg-[#1E293B] rounded-2xl p-5 sm:p-6 border border-slate-700 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-purple-400" />
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">
              Development Roadmap: Milestones & Phases
            </h4>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-indigo-400 font-bold">58% COMPLETE</span>
            <button
              onClick={() => onNavigate("roadmap")}
              className="text-xs text-slate-400 hover:text-white font-semibold flex items-center gap-1 cursor-pointer"
            >
              <span>Full 8-Phase Tracker</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="p-3 bg-slate-800/80 rounded-lg border-l-4 border-emerald-500 space-y-1">
            <p className="text-[10px] font-bold text-emerald-400 uppercase">Phase 1: Requirements</p>
            <p className="text-xs text-slate-200 font-medium">Define IoT sensor specs & data protocols</p>
            <span className="text-[10px] text-emerald-400 font-bold block">✓ Complete</span>
          </div>

          <div className="p-3 bg-slate-800/80 rounded-lg border-l-4 border-emerald-500 space-y-1">
            <p className="text-[10px] font-bold text-emerald-400 uppercase">Phase 2: UI/UX & Topology</p>
            <p className="text-xs text-slate-200 font-medium">Live dashboard wireframes & schemas</p>
            <span className="text-[10px] text-emerald-400 font-bold block">✓ Complete</span>
          </div>

          <div className="p-3 bg-slate-800/80 rounded-lg border-l-4 border-indigo-500 space-y-1">
            <p className="text-[10px] font-bold text-indigo-400 uppercase">Phase 3: Database & Models</p>
            <p className="text-xs text-slate-200 font-medium">Schema for time-series & vector store</p>
            <span className="text-[10px] text-indigo-400 font-bold block">⚡ In Progress</span>
          </div>

          <div className="p-3 bg-slate-800/40 rounded-lg border-l-4 border-slate-600 opacity-60 space-y-1">
            <p className="text-[10px] font-bold text-slate-500 uppercase">Phase 4: Backend & APIs</p>
            <p className="text-xs text-slate-400 font-medium">FastAPI endpoints & MQTT auth brokers</p>
            <span className="text-[10px] text-slate-500 font-bold block">Upcoming</span>
          </div>
        </div>
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Domain Distribution Doughnut */}
        <div className="bg-[#1E293B] border border-slate-700 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-white">Project Domain Distribution</h2>
              <p className="text-xs text-slate-400">Breakdown of generated & evaluated blueprints</p>
            </div>
            <span className="text-xs font-bold text-indigo-400 bg-indigo-500/10 px-2.5 py-0.5 rounded border border-indigo-500/20">
              {domainLabels.length} Domains
            </span>
          </div>
          <div className="h-64 relative">
            <Doughnut data={doughnutData} options={doughnutOptions} />
          </div>
        </div>

        {/* Readiness Distribution Bar Chart */}
        <div className="bg-[#1E293B] border border-slate-700 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-white">Project Readiness Range</h2>
              <p className="text-xs text-slate-400">Viability benchmarks across repository</p>
            </div>
            <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded border border-emerald-500/20">
              Score 0 - 100
            </span>
          </div>
          <div className="h-64 relative">
            <Bar data={barData} options={barOptions} />
          </div>
        </div>
      </div>

      {/* Recent Projects Feed */}
      <div className="bg-[#1E293B] border border-slate-700 rounded-2xl p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-sm font-bold text-white">Recent Project Blueprints</h2>
            <p className="text-xs text-slate-400">Jump directly into architecture, roadmap, or full specifications</p>
          </div>
          <button
            id="view-all-projects-btn"
            onClick={() => onNavigate("history")}
            className="text-xs font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 cursor-pointer"
          >
            <span>View All ({stats.totalGenerated + stats.totalEvaluated})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {stats.recentProjects.map((project) => (
            <div
              key={project.id}
              onClick={() => onSelectProject(project)}
              className="group bg-slate-900/90 border border-slate-700/80 hover:border-indigo-500/50 rounded-2xl p-5 flex flex-col justify-between cursor-pointer transition-all hover:shadow-lg"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-indigo-400 bg-indigo-500/10 px-2.5 py-0.5 rounded-full border border-indigo-500/20">
                    {project.domain}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {project.difficultyLevel || "Intermediate"}
                  </span>
                </div>
                <h4 className="text-sm font-bold text-white group-hover:text-indigo-400 transition-colors line-clamp-1">
                  {project.title}
                </h4>
                <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                  {project.problemStatement || project.description}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="text-amber-400 font-semibold flex items-center gap-1">
                    <Flame className="w-3 h-3" />
                    {project.innovationScore}/10
                  </span>
                  {project.readinessScore && (
                    <span className="text-emerald-400 font-semibold">
                      {project.readinessScore}% Ready
                    </span>
                  )}
                </div>
                <span className="text-indigo-400 font-bold group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
                  Inspect <ArrowRight className="w-3 h-3" />
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
