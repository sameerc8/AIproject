import React, { useState } from "react";
import {
  X,
  Sparkles,
  Layers,
  Cpu,
  Clock,
  DollarSign,
  Flame,
  Award,
  Download,
  Copy,
  Check,
  GitFork,
  MapPin,
  Lightbulb,
  Radio,
  Server,
  Database,
  Code2,
  AlertTriangle,
  Shield,
} from "lucide-react";
import { Project } from "../types.js";

interface ProjectDetailModalProps {
  project: Project | null;
  onClose: () => void;
  onOpenArchitecture: (p: Project) => void;
  onOpenRoadmap: (p: Project) => void;
  onOpenFeatures: (p: Project) => void;
}

export const ProjectDetailModal: React.FC<ProjectDetailModalProps> = ({
  project,
  onClose,
  onOpenArchitecture,
  onOpenRoadmap,
  onOpenFeatures,
}) => {
  const [activeTab, setActiveTab] = useState<
    "overview" | "specs" | "modules" | "apis" | "roadmap" | "evaluation"
  >("overview");
  const [copied, setCopied] = useState<boolean>(false);

  if (!project) return null;

  const handleCopyJSON = () => {
    navigator.clipboard.writeText(JSON.stringify(project, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(project, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `${project.title.toLowerCase().replace(/\s+/g, "_")}_blueprint.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-[#1E293B] border border-slate-700 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="p-6 border-b border-slate-700 flex items-start justify-between gap-4 bg-slate-900/80">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-indigo-400 bg-indigo-500/10 px-2.5 py-0.5 rounded-full border border-indigo-500/20">
                {project.domain}
              </span>
              <span className="text-xs font-semibold text-slate-400">
                {project.difficultyLevel} (Score: {project.difficultyScore}/10)
              </span>
              <span className="text-xs text-amber-400 font-bold flex items-center gap-1">
                <Flame className="w-3.5 h-3.5" /> Innovation: {project.innovationScore}/10
              </span>
              {project.readinessScore && (
                <span className="text-xs text-emerald-400 font-bold flex items-center gap-1">
                  <Award className="w-3.5 h-3.5" /> {project.readinessScore}% Ready
                </span>
              )}
            </div>
            <h2 className="text-xl font-extrabold text-white tracking-tight">{project.title}</h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyJSON}
              className="p-2 text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors cursor-pointer"
              title="Copy JSON Blueprint"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>
            <button
              onClick={handleDownloadJSON}
              className="p-2 text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors cursor-pointer"
              title="Download JSON Blueprint"
            >
              <Download className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Navigation Tabs */}
        <div className="flex items-center space-x-1 px-6 pt-3 border-b border-slate-700 overflow-x-auto scrollbar-none bg-slate-900/50 text-xs">
          {[
            { id: "overview", label: "Overview & Objectives" },
            { id: "specs", label: "Tech Stack & Specs" },
            { id: "modules", label: "Development Modules" },
            { id: "apis", label: "API Blueprint" },
            { id: "roadmap", label: "Milestone Roadmap" },
            { id: "evaluation", label: "Evaluation & Risks" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3 py-2 font-medium rounded-t-lg transition-colors cursor-pointer ${
                activeTab === tab.id
                  ? "bg-[#1E293B] text-indigo-400 border-t-2 border-indigo-500 font-bold"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Modal Body Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          {/* Tab 1: Overview */}
          {activeTab === "overview" && (
            <div className="space-y-4">
              <div className="bg-slate-900 p-4 rounded-xl border border-slate-700/80 space-y-1">
                <span className="font-bold text-amber-400 uppercase tracking-wider text-[10px]">
                  Problem Statement
                </span>
                <p className="text-slate-300 text-xs leading-relaxed">{project.problemStatement}</p>
              </div>

              <div className="bg-slate-900 p-4 rounded-xl border border-slate-700/80 space-y-1">
                <span className="font-bold text-indigo-400 uppercase tracking-wider text-[10px]">
                  Detailed Architecture & Functional Description
                </span>
                <p className="text-slate-300 text-xs leading-relaxed">{project.description}</p>
              </div>

              {/* Objectives & Target Users */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-900 p-4 rounded-xl border border-slate-700/80 space-y-2">
                  <span className="font-bold text-emerald-400 uppercase tracking-wider text-[10px]">
                    Core Objectives
                  </span>
                  <ul className="space-y-1 text-slate-300">
                    {project.objectives?.map((obj, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <span className="text-emerald-400 font-bold">•</span>
                        <span>{obj}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-slate-900 p-4 rounded-xl border border-slate-700/80 space-y-2">
                  <span className="font-bold text-cyan-400 uppercase tracking-wider text-[10px]">
                    Target Users & Stakeholders
                  </span>
                  <ul className="space-y-1 text-slate-300">
                    {project.targetUsers?.map((user, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <span className="text-cyan-400 font-bold">•</span>
                        <span>{user}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Scalability & Future Enhancements */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-900 p-4 rounded-xl border border-slate-700/80 space-y-2">
                  <span className="font-bold text-purple-400 uppercase tracking-wider text-[10px]">
                    Scalability Suggestions
                  </span>
                  <ul className="space-y-1 text-slate-300">
                    {project.scalabilitySuggestions?.map((scale, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <span className="text-purple-400 font-bold">•</span>
                        <span>{scale}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-slate-900 p-4 rounded-xl border border-slate-700/80 space-y-2">
                  <span className="font-bold text-pink-400 uppercase tracking-wider text-[10px]">
                    Future Enhancements
                  </span>
                  <ul className="space-y-1 text-slate-300">
                    {project.futureEnhancements?.map((enh, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <span className="text-pink-400 font-bold">•</span>
                        <span>{enh}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Specs */}
          {activeTab === "specs" && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Software Requirements */}
                <div className="bg-slate-900 p-4 rounded-xl border border-slate-700/80 space-y-2">
                  <span className="font-bold text-indigo-400 uppercase tracking-wider text-[10px] flex items-center gap-1.5">
                    <Server className="w-3.5 h-3.5" /> Software & Frameworks Required
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {project.technologiesRequired?.map((tech, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 rounded bg-[#1E293B] border border-slate-700 text-slate-200"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>

                {/* AI / ML Algorithms */}
                <div className="bg-slate-900 p-4 rounded-xl border border-slate-700/80 space-y-2">
                  <span className="font-bold text-purple-400 uppercase tracking-wider text-[10px] flex items-center gap-1.5">
                    <Cpu className="w-3.5 h-3.5" /> AI / ML Models & Algorithms
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {project.aiMlAlgorithms?.map((algo, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 rounded bg-purple-500/10 border border-purple-500/20 text-purple-300"
                      >
                        {algo}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Database Requirements */}
                <div className="bg-slate-900 p-4 rounded-xl border border-slate-700/80 space-y-2">
                  <span className="font-bold text-emerald-400 uppercase tracking-wider text-[10px] flex items-center gap-1.5">
                    <Database className="w-3.5 h-3.5" /> Database & Storage Specs
                  </span>
                  <ul className="space-y-1 text-slate-300">
                    {project.databaseRequirements?.map((db, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <span className="text-emerald-400 font-bold">•</span>
                        <span>{db}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Hardware Requirements */}
                <div className="bg-slate-900 p-4 rounded-xl border border-slate-700/80 space-y-2">
                  <span className="font-bold text-amber-400 uppercase tracking-wider text-[10px] flex items-center gap-1.5">
                    <Radio className="w-3.5 h-3.5" /> Hardware & Edge Devices
                  </span>
                  <ul className="space-y-1 text-slate-300">
                    {project.hardwareRequirements?.length ? (
                      project.hardwareRequirements.map((hw, idx) => (
                        <li key={idx} className="flex items-start gap-1.5">
                          <span className="text-amber-400 font-bold">•</span>
                          <span>{hw}</span>
                        </li>
                      ))
                    ) : (
                      <li className="text-slate-400">Standard cloud container or Linux server</li>
                    )}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Tab 3: Development Modules */}
          {activeTab === "modules" && (
            <div className="space-y-3">
              <div className="flex items-center justify-between pb-1">
                <span className="text-xs font-bold text-slate-300">
                  Architected Modular Breakdown ({project.developmentModules?.length || 0} Modules)
                </span>
                <button
                  onClick={() => {
                    onClose();
                    onOpenArchitecture(project);
                  }}
                  className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <GitFork className="w-3.5 h-3.5" />
                  <span>Open 6-Layer Architecture View</span>
                </button>
              </div>

              {project.developmentModules?.map((mod, idx) => (
                <div key={idx} className="bg-slate-900 p-4 rounded-xl border border-slate-700/80 space-y-1">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-[10px]">
                      {idx + 1}
                    </div>
                    <h4 className="font-bold text-white text-xs">{mod.name}</h4>
                  </div>
                  <p className="text-slate-300 text-xs pl-7 leading-relaxed">{mod.description}</p>
                </div>
              ))}
            </div>
          )}

          {/* Tab 4: API Blueprint */}
          {activeTab === "apis" && (
            <div className="space-y-3">
              <span className="text-xs font-bold text-slate-300 block pb-1">
                REST API Endpoints Specification
              </span>
              <div className="space-y-2 font-mono">
                {project.apiSuggestions?.map((api, idx) => (
                  <div
                    key={idx}
                    className="bg-slate-900 p-3 rounded-xl border border-slate-700/80 flex items-start gap-3"
                  >
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        api.method === "GET"
                          ? "bg-blue-500/20 text-blue-400"
                          : api.method === "POST"
                          ? "bg-emerald-500/20 text-emerald-400"
                          : api.method === "PUT"
                          ? "bg-amber-500/20 text-amber-400"
                          : "bg-rose-500/20 text-rose-400"
                      }`}
                    >
                      {api.method}
                    </span>
                    <div className="space-y-0.5 flex-1">
                      <div className="text-white text-xs font-semibold">{api.endpoint}</div>
                      <div className="text-slate-400 text-[11px] font-sans">{api.purpose}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tab 5: Roadmap */}
          {activeTab === "roadmap" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-1">
                <span className="text-xs font-bold text-slate-300">
                  Phases & Implementation Schedule
                </span>
                <button
                  onClick={() => {
                    onClose();
                    onOpenRoadmap(project);
                  }}
                  className="text-xs text-purple-400 hover:text-purple-300 font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <MapPin className="w-3.5 h-3.5" />
                  <span>Open Interactive Roadmap Tracker</span>
                </button>
              </div>

              {project.roadmap && project.roadmap.length > 0 ? (
                <div className="space-y-3">
                  {project.roadmap.map((phase, idx) => (
                    <div key={phase.id || idx} className="bg-slate-900 p-4 rounded-xl border border-slate-700/80 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-purple-400">Phase {idx + 1}:</span>
                          <span className="font-bold text-white text-xs">{phase.name}</span>
                        </div>
                        <span className="text-[11px] text-slate-400">{phase.estimatedDuration}</span>
                      </div>
                      <p className="text-slate-300 text-xs">{phase.description}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-slate-900 p-6 rounded-xl border border-slate-700/80 text-center space-y-2">
                  <p className="text-slate-400">No generated roadmap found for this blueprint yet.</p>
                  <button
                    onClick={() => {
                      onClose();
                      onOpenRoadmap(project);
                    }}
                    className="px-4 py-2 bg-[#6366f1] hover:bg-indigo-600 text-white font-bold rounded-lg text-xs transition-colors cursor-pointer"
                  >
                    Generate 8-Phase Roadmap Now
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Tab 6: Evaluation */}
          {activeTab === "evaluation" && (
            <div className="space-y-4">
              {project.evaluation ? (
                <div className="space-y-4">
                  <div className="bg-slate-900 p-4 rounded-xl border border-slate-700/80 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        Readiness Verdict
                      </span>
                      <p className="text-slate-200 text-xs mt-0.5">{project.evaluation.verdict}</p>
                    </div>
                    <div className="text-2xl font-black text-emerald-400">
                      {project.evaluation.overallReadinessScore}/100
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-slate-900 p-4 rounded-xl border border-slate-700/80 space-y-2">
                      <span className="font-bold text-amber-400 uppercase tracking-wider text-[10px] flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5" /> Challenges & Mitigations
                      </span>
                      {project.evaluation.possibleChallenges?.map((ch, idx) => (
                        <div key={idx} className="text-xs space-y-0.5 border-b border-slate-800/80 pb-2">
                          <p className="font-medium text-slate-200">⚠️ {ch.challenge}</p>
                          <p className="text-emerald-400 text-[11px]">Fix: {ch.mitigation}</p>
                        </div>
                      ))}
                    </div>

                    <div className="bg-slate-900 p-4 rounded-xl border border-slate-700/80 space-y-2">
                      <span className="font-bold text-rose-400 uppercase tracking-wider text-[10px] flex items-center gap-1">
                        <Shield className="w-3.5 h-3.5" /> Security Considerations
                      </span>
                      <ul className="space-y-1.5 text-slate-300">
                        {project.evaluation.securityConcerns?.map((sec, idx) => (
                          <li key={idx} className="flex items-start gap-1.5">
                            <span className="text-rose-400 font-bold">•</span>
                            <span>{sec}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-slate-900 p-6 rounded-xl border border-slate-700/80 text-center space-y-2">
                  <p className="text-slate-400">This project has not been audited with the Evaluator yet.</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer Actions */}
        <div className="p-4 border-t border-slate-700 flex flex-wrap items-center justify-between gap-2 bg-slate-900/80">
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onClose();
                onOpenArchitecture(project);
              }}
              className="px-3 py-1.5 text-xs font-semibold text-cyan-300 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/20 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <GitFork className="w-3.5 h-3.5 text-cyan-400" />
              <span>Architecture</span>
            </button>

            <button
              onClick={() => {
                onClose();
                onOpenRoadmap(project);
              }}
              className="px-3 py-1.5 text-xs font-semibold text-purple-300 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/20 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <MapPin className="w-3.5 h-3.5 text-purple-400" />
              <span>Roadmap</span>
            </button>

            <button
              onClick={() => {
                onClose();
                onOpenFeatures(project);
              }}
              className="px-3 py-1.5 text-xs font-semibold text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
              <span>Recommend Features</span>
            </button>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
