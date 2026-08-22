import React, { useState, useEffect } from "react";
import {
  GitFork,
  Layers,
  Sparkles,
  ArrowDown,
  Server,
  Database,
  Cpu,
  Radio,
  Monitor,
  Network,
  CheckCircle2,
  Download,
  Copy,
  Check,
} from "lucide-react";
import { Project, ArchitectureLayer } from "../types.js";
import { generateArchitectureAPI } from "../lib/api.js";

interface ArchitectureViewProps {
  selectedProject: Project | null;
  allProjects: Project[];
  onSelectProject: (p: Project) => void;
}

export const ArchitectureView: React.FC<ArchitectureViewProps> = ({
  selectedProject,
  allProjects,
  onSelectProject,
}) => {
  const [activeProject, setActiveProject] = useState<Project | null>(selectedProject);
  const [layers, setLayers] = useState<ArchitectureLayer[]>([]);
  const [overview, setOverview] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    if (selectedProject) {
      setActiveProject(selectedProject);
      if (selectedProject.architectureLayers && selectedProject.architectureLayers.length > 0) {
        setLayers(selectedProject.architectureLayers);
        setOverview(
          selectedProject.systemArchitectureExplanation ||
            "Structured multi-tier enterprise architecture."
        );
      } else {
        loadArchitecture(selectedProject);
      }
    } else if (allProjects.length > 0 && !activeProject) {
      setActiveProject(allProjects[0]);
      loadArchitecture(allProjects[0]);
    }
  }, [selectedProject, allProjects]);

  const loadArchitecture = async (proj: Project) => {
    setLoading(true);
    setError(null);
    try {
      const res = await generateArchitectureAPI({
        title: proj.title,
        domain: proj.domain,
        description: proj.description,
        techStack: proj.technologiesRequired,
        projectId: proj.id,
      });
      setLayers(res.layers);
      setOverview(res.overview);
    } catch (err: any) {
      console.error("Architecture load error:", err);
      setError(err?.message || "Failed to generate system architecture");
    } finally {
      setLoading(false);
    }
  };

  const handleProjectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const proj = allProjects.find((p) => p.id === e.target.value);
    if (proj) {
      setActiveProject(proj);
      onSelectProject(proj);
      loadArchitecture(proj);
    }
  };

  const getLayerIcon = (layerId: string) => {
    switch (layerId) {
      case "frontend":
        return <Monitor className="w-5 h-5 text-blue-400" />;
      case "backend":
        return <Server className="w-5 h-5 text-indigo-400" />;
      case "api":
        return <Network className="w-5 h-5 text-cyan-400" />;
      case "ai_engine":
        return <Cpu className="w-5 h-5 text-purple-400" />;
      case "database":
        return <Database className="w-5 h-5 text-emerald-400" />;
      case "iot_external":
        return <Radio className="w-5 h-5 text-amber-400" />;
      default:
        return <Layers className="w-5 h-5 text-indigo-400" />;
    }
  };

  const getLayerColorClass = (layerId: string) => {
    switch (layerId) {
      case "frontend":
        return "border-blue-500/30 bg-[#1E293B] shadow-sm";
      case "backend":
        return "border-indigo-500/30 bg-[#1E293B] shadow-sm";
      case "api":
        return "border-cyan-500/30 bg-[#1E293B] shadow-sm";
      case "ai_engine":
        return "border-purple-500/30 bg-[#1E293B] shadow-sm";
      case "database":
        return "border-emerald-500/30 bg-[#1E293B] shadow-sm";
      case "iot_external":
        return "border-amber-500/30 bg-[#1E293B] shadow-sm";
      default:
        return "border-slate-700 bg-[#1E293B] shadow-sm";
    }
  };

  const handleCopyJSON = () => {
    navigator.clipboard.writeText(JSON.stringify({ overview, layers }, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-700 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-cyan-400 uppercase tracking-wider">
            <GitFork className="w-4 h-4" />
            <span>Multi-Tier Topology & Data Flow</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-1">
            AI System Architecture Generator
          </h1>
          <p className="text-sm text-slate-300 mt-1">
            Structured 6-layer visual topology from presentation to edge hardware and databases.
          </p>
        </div>

        {/* Project Selector */}
        {allProjects.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-300 whitespace-nowrap">Select Project:</span>
            <select
              id="architecture-project-select"
              value={activeProject?.id || ""}
              onChange={handleProjectChange}
              className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500 cursor-pointer max-w-xs font-medium"
            >
              {allProjects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {loading && (
        <div className="py-20 flex flex-col items-center justify-center space-y-3">
          <div className="w-10 h-10 border-3 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin"></div>
          <p className="text-xs text-cyan-400 animate-pulse font-medium">
            Gemini 3.7 AI is generating 6-layer system architecture topology...
          </p>
        </div>
      )}

      {error && (
        <div className="bg-rose-950/40 border border-rose-800 rounded-xl p-4 text-xs text-rose-300">
          <strong>Error:</strong> {error}
        </div>
      )}

      {!loading && activeProject && (
        <div className="space-y-6">
          {/* Architecture Overview Card */}
          <div className="bg-[#1E293B] border border-slate-700 rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-cyan-400 bg-cyan-500/10 px-2.5 py-0.5 rounded-full border border-cyan-500/20">
                  {activeProject.domain}
                </span>
                <span className="text-xs font-semibold text-slate-400">{activeProject.difficultyLevel} Tier</span>
              </div>
              <h2 className="text-xl font-bold text-white tracking-tight">{activeProject.title}</h2>
              <p className="text-xs text-slate-300 leading-relaxed max-w-4xl pt-1">
                {overview || activeProject.systemArchitectureExplanation}
              </p>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-center">
              <button
                onClick={handleCopyJSON}
                className="px-3 py-1.5 text-xs font-bold text-slate-200 bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? "Copied" : "Copy Spec"}</span>
              </button>
            </div>
          </div>

          {/* Visual Architecture Flow Diagram */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                6-Layer System Architecture Diagram
              </h3>
              <span className="text-xs text-slate-400">Data flow travels sequentially top-to-bottom</span>
            </div>

            <div className="space-y-3">
              {layers.map((layer, idx) => (
                <React.Fragment key={layer.layerId || idx}>
                  <div
                    className={`rounded-2xl border p-5 transition-all shadow-sm ${getLayerColorClass(
                      layer.layerId
                    )}`}
                  >
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                      {/* Left: Icon, Name & Description */}
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-xl bg-slate-900 border border-slate-700 shadow-sm">
                            {getLayerIcon(layer.layerId)}
                          </div>
                          <div>
                            <h4 className="text-base font-bold text-white">{layer.name}</h4>
                            <p className="text-xs text-slate-300 leading-relaxed">{layer.description}</p>
                          </div>
                        </div>

                        {/* Technologies Tags */}
                        <div className="flex flex-wrap items-center gap-1.5 pt-1 pl-11">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mr-1">
                            Technologies:
                          </span>
                          {layer.technologies?.map((tech, tIdx) => (
                            <span
                              key={tIdx}
                              className="px-2 py-0.5 text-xs font-semibold bg-slate-900 text-slate-200 rounded-md border border-slate-700"
                            >
                              {tech}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Right: Key Responsibilities & Data Flow */}
                      <div className="md:w-5/12 bg-slate-900/90 p-4 rounded-xl border border-slate-800 space-y-2 text-xs">
                        <div>
                          <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider">
                            Key Responsibilities
                          </span>
                          <ul className="mt-1 space-y-1">
                            {layer.keyResponsibilities?.map((resp, rIdx) => (
                              <li key={rIdx} className="text-slate-300 flex items-start gap-1.5">
                                <span className="text-indigo-400 font-bold">•</span>
                                <span>{resp}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        {layer.dataFlowDescription && (
                          <div className="pt-2 border-t border-slate-800">
                            <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider">
                              Data Flow Bridge
                            </span>
                            <p className="text-slate-400 text-[11px] mt-0.5 leading-relaxed">
                              {layer.dataFlowDescription}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Flow Arrow between layers */}
                  {idx < layers.length - 1 && (
                    <div className="flex items-center justify-center py-0.5">
                      <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-700 text-slate-300 text-[10px] font-mono shadow-sm">
                        <ArrowDown className="w-3 h-3 text-cyan-400 animate-bounce" />
                        <span>Payload & Event Streaming</span>
                      </div>
                    </div>
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
