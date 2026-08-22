import React, { useState } from "react";
import { Radar, Bar } from "react-chartjs-2";
import "../lib/chartConfig.js";
import {
  BarChart3,
  Check,
  Plus,
  Flame,
  Clock,
  DollarSign,
  Cpu,
  Layers,
  ArrowRight,
  Shield,
  Trash2,
} from "lucide-react";
import { Project } from "../types.js";

interface CompareViewProps {
  projects: Project[];
  onSelectProject: (p: Project) => void;
}

export const CompareView: React.FC<CompareViewProps> = ({ projects, onSelectProject }) => {
  const [selectedIds, setSelectedIds] = useState<string[]>(
    projects.slice(0, 3).map((p) => p.id)
  );

  const toggleSelect = (id: string) => {
    if (selectedIds.includes(id)) {
      if (selectedIds.length > 1) {
        setSelectedIds(selectedIds.filter((item) => item !== id));
      }
    } else {
      if (selectedIds.length < 4) {
        setSelectedIds([...selectedIds, id]);
      }
    }
  };

  const comparedProjects = projects.filter((p) => selectedIds.includes(p.id));

  const colors = [
    { bg: "rgba(99, 102, 241, 0.2)", border: "#6366f1", solid: "#6366f1" }, // indigo
    { bg: "rgba(16, 185, 129, 0.2)", border: "#10b981", solid: "#10b981" }, // emerald
    { bg: "rgba(245, 158, 11, 0.2)", border: "#f59e0b", solid: "#f59e0b" }, // amber
    { bg: "rgba(236, 72, 153, 0.2)", border: "#ec4899", solid: "#ec4899" }, // pink
  ];

  // Radar Chart comparing projects on 5 normalized scores
  const radarData = {
    labels: [
      "Innovation (x10)",
      "Technical Difficulty (x10)",
      "Readiness Score",
      "Module Architecture Depth",
      "Market Feasibility",
    ],
    datasets: comparedProjects.map((proj, idx) => {
      const color = colors[idx % colors.length];
      const innovationNorm = (proj.innovationScore || 8) * 10;
      const diffNorm = (proj.difficultyScore || 7) * 10;
      const readiness = proj.readinessScore || (proj.evaluation ? proj.evaluation.overallReadinessScore : 75);
      const moduleDepth = Math.min((proj.developmentModules?.length || 4) * 20, 100);
      const feasibility = proj.evaluation?.scores?.technicalFeasibility || 80;

      return {
        label: proj.title.slice(0, 20) + "...",
        data: [innovationNorm, diffNorm, readiness, moduleDepth, feasibility],
        backgroundColor: color.bg,
        borderColor: color.border,
        borderWidth: 2,
        pointBackgroundColor: color.solid,
        pointBorderColor: "#fff",
      };
    }),
  };

  const radarOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom" as const,
        labels: { color: "#94a3b8", font: { size: 11 }, padding: 12 },
      },
      tooltip: {
        backgroundColor: "#1E293B",
        titleColor: "#f8fafc",
        bodyColor: "#cbd5e1",
        borderColor: "#334155",
        borderWidth: 1,
      },
    },
    scales: {
      r: {
        angleLines: { color: "#334155" },
        grid: { color: "#334155" },
        pointLabels: { color: "#cbd5e1", font: { size: 10, weight: "bold" as const } },
        ticks: { backdropColor: "transparent", color: "#64748b", font: { size: 9 }, stepSize: 20 },
        min: 0,
        max: 100,
      },
    },
  };

  // Grouped Bar Chart
  const barData = {
    labels: comparedProjects.map((p) => p.title.slice(0, 16) + "..."),
    datasets: [
      {
        label: "Innovation (0-10)",
        data: comparedProjects.map((p) => p.innovationScore || 8.5),
        backgroundColor: "#f59e0b",
        borderRadius: 6,
      },
      {
        label: "Difficulty (0-10)",
        data: comparedProjects.map((p) => p.difficultyScore || 7),
        backgroundColor: "#6366f1",
        borderRadius: 6,
      },
      {
        label: "Readiness / 10",
        data: comparedProjects.map((p) => Math.round((p.readinessScore || 80) / 10)),
        backgroundColor: "#10b981",
        borderRadius: 6,
      },
    ],
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom" as const,
        labels: { color: "#94a3b8", font: { size: 11 } },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: "#94a3b8", font: { size: 10 } },
      },
      y: {
        grid: { color: "#334155" },
        ticks: { color: "#94a3b8", font: { size: 10 }, stepSize: 2 },
        max: 10,
      },
    },
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="border-b border-slate-700 pb-5">
        <div className="flex items-center gap-2 text-xs font-bold text-indigo-400 uppercase tracking-wider">
          <BarChart3 className="w-4 h-4" />
          <span>Multi-Criteria Analysis</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-1">
          Project Comparison Matrix
        </h1>
        <p className="text-sm text-slate-300 mt-1 max-w-3xl">
          Select up to 4 project blueprints to analyze side-by-side: evaluate technical difficulty,
          innovation, readiness scores, hardware requirements, and development timelines.
        </p>
      </div>

      {/* Project Selector Chips */}
      <div className="bg-[#1E293B] border border-slate-700 rounded-2xl p-5 shadow-sm space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
            Select Projects to Compare ({selectedIds.length}/4)
          </span>
          <span className="text-xs text-slate-400">Click to add/remove</span>
        </div>

        <div className="flex flex-wrap gap-2 pt-1">
          {projects.map((proj) => {
            const isSelected = selectedIds.includes(proj.id);
            return (
              <button
                key={proj.id}
                onClick={() => toggleSelect(proj.id)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all cursor-pointer flex items-center gap-1.5 ${
                  isSelected
                    ? "bg-[#6366f1] text-white border-indigo-500 shadow-sm"
                    : "bg-slate-900 text-slate-300 border-slate-700 hover:text-white"
                }`}
              >
                {isSelected ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                <span>{proj.title}</span>
              </button>
            );
          })}
        </div>
      </div>

      {comparedProjects.length > 0 && (
        <div className="space-y-6">
          {/* Charts Comparison Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-[#1E293B] border border-slate-700 rounded-xl p-5 shadow-sm">
              <h3 className="text-sm font-bold text-white mb-2">Comparative Radar Analysis</h3>
              <div className="h-64 relative">
                <Radar data={radarData} options={radarOptions} />
              </div>
            </div>

            <div className="bg-[#1E293B] border border-slate-700 rounded-xl p-5 shadow-sm">
              <h3 className="text-sm font-bold text-white mb-2">Key Metric Score Comparison</h3>
              <div className="h-64 relative">
                <Bar data={barData} options={barOptions} />
              </div>
            </div>
          </div>

          {/* Side-by-Side Comparison Matrix Table */}
          <div className="bg-[#1E293B] border border-slate-700 rounded-2xl overflow-hidden shadow-sm">
            <div className="p-4 bg-slate-900 border-b border-slate-700">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Detailed Technical Specifications Matrix
              </h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-900/90 text-slate-400 border-b border-slate-700">
                    <th className="p-4 w-44 font-bold uppercase text-[10px] tracking-wider">Criteria</th>
                    {comparedProjects.map((p, idx) => (
                      <th key={p.id} className="p-4 min-w-[240px] font-bold text-white">
                        <div className="flex items-center justify-between">
                          <span className="text-indigo-400 font-bold">{p.title}</span>
                          <button
                            onClick={() => onSelectProject(p)}
                            className="text-[10px] text-slate-400 hover:text-white font-medium underline cursor-pointer"
                          >
                            Inspect
                          </button>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/80 text-slate-300">
                  <tr>
                    <td className="p-4 font-semibold text-slate-400 bg-slate-900/50">Domain</td>
                    {comparedProjects.map((p) => (
                      <td key={p.id} className="p-4">
                        <span className="px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 font-semibold">
                          {p.domain}
                        </span>
                      </td>
                    ))}
                  </tr>

                  <tr>
                    <td className="p-4 font-semibold text-slate-400 bg-slate-900/50">Scores</td>
                    {comparedProjects.map((p) => (
                      <td key={p.id} className="p-4 space-y-1">
                        <div>
                          Innovation: <strong className="text-amber-400">{p.innovationScore}/10</strong>
                        </div>
                        <div>
                          Difficulty: <strong className="text-slate-200">{p.difficultyScore}/10</strong> (
                          {p.difficultyLevel})
                        </div>
                        <div>
                          Readiness:{" "}
                          <strong className="text-emerald-400">{p.readinessScore || 85}%</strong>
                        </div>
                      </td>
                    ))}
                  </tr>

                  <tr>
                    <td className="p-4 font-semibold text-slate-400 bg-slate-900/50">Tech Stack</td>
                    {comparedProjects.map((p) => (
                      <td key={p.id} className="p-4">
                        <div className="flex flex-wrap gap-1">
                          {p.technologiesRequired?.map((tech, tIdx) => (
                            <span
                              key={tIdx}
                              className="px-2 py-0.5 rounded bg-slate-900 text-slate-200 text-[11px] border border-slate-700/60"
                            >
                              {tech}
                            </span>
                          ))}
                        </div>
                      </td>
                    ))}
                  </tr>

                  <tr>
                    <td className="p-4 font-semibold text-slate-400 bg-slate-900/50">AI / ML Algorithms</td>
                    {comparedProjects.map((p) => (
                      <td key={p.id} className="p-4">
                        <div className="flex flex-wrap gap-1">
                          {p.aiMlAlgorithms?.map((algo, aIdx) => (
                            <span
                              key={aIdx}
                              className="px-2 py-0.5 rounded bg-purple-500/10 text-purple-300 text-[11px] border border-purple-500/20"
                            >
                              {algo}
                            </span>
                          ))}
                        </div>
                      </td>
                    ))}
                  </tr>

                  <tr>
                    <td className="p-4 font-semibold text-slate-400 bg-slate-900/50">Database Engine</td>
                    {comparedProjects.map((p) => (
                      <td key={p.id} className="p-4 text-slate-300 font-mono text-[11px]">
                        {p.databaseRequirements?.join(", ") || "PostgreSQL / SQLite"}
                      </td>
                    ))}
                  </tr>

                  <tr>
                    <td className="p-4 font-semibold text-slate-400 bg-slate-900/50">Hardware Requirements</td>
                    {comparedProjects.map((p) => (
                      <td key={p.id} className="p-4 text-slate-300 text-[11px]">
                        {p.hardwareRequirements?.length
                          ? p.hardwareRequirements.join(", ")
                          : "Standard Server / Cloud Host"}
                      </td>
                    ))}
                  </tr>

                  <tr>
                    <td className="p-4 font-semibold text-slate-400 bg-slate-900/50">
                      Timeline & Cost
                    </td>
                    {comparedProjects.map((p) => (
                      <td key={p.id} className="p-4 text-[11px]">
                        <div>⏱ {p.estimatedDevelopmentTime}</div>
                        <div className="text-emerald-400 font-semibold">
                          💰 {p.estimatedCost || "$100 - $300"}
                        </div>
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
