import React, { useState, useEffect } from "react";
import {
  Lightbulb,
  Sparkles,
  Zap,
  Plus,
  Check,
  Flame,
  Clock,
  Code2,
  Cpu,
  Radio,
  Eye,
  Bot,
  MessageSquare,
  ShieldCheck,
  Network,
} from "lucide-react";
import { Project, RecommendedFeature } from "../types.js";
import { recommendFeaturesAPI, addFeatureToProjectAPI } from "../lib/api.js";

interface FeatureRecommenderViewProps {
  selectedProject: Project | null;
  allProjects: Project[];
  onUpdateProject: (p: Project) => void;
}

export const FeatureRecommenderView: React.FC<FeatureRecommenderViewProps> = ({
  selectedProject,
  allProjects,
  onUpdateProject,
}) => {
  const [activeProject, setActiveProject] = useState<Project | null>(selectedProject);
  const [customTitle, setCustomTitle] = useState<string>("");
  const [customDescription, setCustomDescription] = useState<string>("");
  const [features, setFeatures] = useState<RecommendedFeature[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [addedFeatureIds, setAddedFeatureIds] = useState<Record<string, boolean>>({});
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (selectedProject) {
      setActiveProject(selectedProject);
      if (selectedProject.recommendedFeatures && selectedProject.recommendedFeatures.length > 0) {
        setFeatures(selectedProject.recommendedFeatures);
      } else {
        loadFeatures(selectedProject);
      }
    } else if (allProjects.length > 0 && !activeProject) {
      setActiveProject(allProjects[0]);
      if (allProjects[0].recommendedFeatures && allProjects[0].recommendedFeatures.length > 0) {
        setFeatures(allProjects[0].recommendedFeatures);
      } else {
        loadFeatures(allProjects[0]);
      }
    }
  }, [selectedProject, allProjects]);

  const loadFeatures = async (proj: Project) => {
    setLoading(true);
    setError(null);
    try {
      const res = await recommendFeaturesAPI({
        title: proj.title,
        domain: proj.domain,
        description: proj.description,
        techStack: proj.technologiesRequired,
        projectId: proj.id,
      });
      setFeatures(res);
      onUpdateProject({ ...proj, recommendedFeatures: res });
    } catch (err: any) {
      console.error("Feature recommendation error:", err);
      setError(err?.message || "Failed to recommend features");
    } finally {
      setLoading(false);
    }
  };

  const handleCustomRecommend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customTitle.trim()) return;

    setLoading(true);
    setError(null);
    try {
      const res = await recommendFeaturesAPI({
        title: customTitle,
        description: customDescription,
      });
      setFeatures(res);
    } catch (err: any) {
      console.error("Custom feature recommendation error:", err);
      setError(err?.message || "Failed to recommend features");
    } finally {
      setLoading(false);
    }
  };

  const handleAddFeature = async (feature: RecommendedFeature) => {
    if (!activeProject) return;

    try {
      const updated = await addFeatureToProjectAPI(activeProject.id, feature);
      setAddedFeatureIds((prev) => ({ ...prev, [feature.title]: true }));
      setActiveProject(updated);
      onUpdateProject(updated);
    } catch (err: any) {
      console.error("Failed to add feature:", err);
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "Agentic AI":
        return <Bot className="w-4 h-4 text-purple-400" />;
      case "RAG Chatbot":
        return <MessageSquare className="w-4 h-4 text-blue-400" />;
      case "Computer Vision":
        return <Eye className="w-4 h-4 text-cyan-400" />;
      case "IoT Sensors":
        return <Radio className="w-4 h-4 text-emerald-400" />;
      case "Real-Time WebSockets":
        return <Network className="w-4 h-4 text-amber-400" />;
      case "Blockchain Audit":
        return <ShieldCheck className="w-4 h-4 text-indigo-400" />;
      default:
        return <Sparkles className="w-4 h-4 text-amber-400" />;
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-700 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider">
            <Lightbulb className="w-4 h-4" />
            <span>AI Feature Recommender</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-1">
            Advanced Feature Enhancements
          </h1>
          <p className="text-sm text-slate-300 mt-1">
            Gemini AI suggests game-changing capabilities: Agentic workflows, RAG bots, Computer Vision, Voice & IoT.
          </p>
        </div>

        {/* Project Selector */}
        {allProjects.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-300 whitespace-nowrap">Project:</span>
            <select
              id="feature-project-select"
              value={activeProject?.id || ""}
              onChange={(e) => {
                const proj = allProjects.find((p) => p.id === e.target.value);
                if (proj) {
                  setActiveProject(proj);
                  loadFeatures(proj);
                }
              }}
              className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500 cursor-pointer max-w-xs font-medium"
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
          <div className="w-10 h-10 border-3 border-amber-500/30 border-t-amber-500 rounded-full animate-spin"></div>
          <p className="text-xs text-amber-400 animate-pulse font-medium">
            Gemini 3.7 AI is evaluating cutting-edge feature extensions...
          </p>
        </div>
      )}

      {error && (
        <div className="bg-rose-950/40 border border-rose-800 rounded-xl p-4 text-xs text-rose-300">
          <strong>Error:</strong> {error}
        </div>
      )}

      {!loading && (
        <div className="space-y-6">
          {/* Active Context Banner */}
          {activeProject && (
            <div className="bg-[#1E293B] border border-slate-700 rounded-2xl p-5 shadow-sm flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider">
                  Target Project
                </span>
                <h3 className="text-base font-bold text-white mt-0.5">{activeProject.title}</h3>
                <p className="text-xs text-slate-300 line-clamp-1">{activeProject.problemStatement}</p>
              </div>
              <button
                onClick={() => loadFeatures(activeProject)}
                className="px-3 py-1.5 text-xs font-bold text-amber-400 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Regenerate Features</span>
              </button>
            </div>
          )}

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {features.map((feat, idx) => {
              const isAdded = addedFeatureIds[feat.title] || false;
              return (
                <div
                  key={idx}
                  className="bg-[#1E293B] border border-slate-700 hover:border-amber-500/40 rounded-2xl p-5 shadow-sm flex flex-col justify-between transition-all space-y-3"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-lg bg-slate-900 border border-slate-700">
                          {getCategoryIcon(feat.category)}
                        </div>
                        <span className="text-xs font-semibold text-slate-300">{feat.category}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 flex items-center gap-0.5">
                          <Flame className="w-3 h-3" /> Impact: {feat.impactScore}/10
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase ${
                            feat.complexity === "High"
                              ? "bg-rose-500/10 text-rose-300 border-rose-500/20"
                              : feat.complexity === "Medium"
                              ? "bg-amber-500/10 text-amber-300 border-amber-500/20"
                              : "bg-emerald-500/10 text-emerald-300 border-emerald-500/20"
                          }`}
                        >
                          {feat.complexity}
                        </span>
                      </div>
                    </div>

                    <h4 className="text-base font-bold text-white tracking-tight">{feat.title}</h4>
                    <p className="text-xs text-slate-300 leading-relaxed">{feat.description}</p>

                    {/* Implementation Guide */}
                    <div className="bg-slate-900/90 p-3.5 rounded-xl border border-slate-800 space-y-1 text-xs">
                      <span className="font-bold text-indigo-400 uppercase tracking-wider text-[10px] flex items-center gap-1">
                        <Code2 className="w-3 h-3" /> Implementation Approach
                      </span>
                      <p className="text-slate-300 text-[11px] leading-relaxed">
                        {feat.implementationGuide}
                      </p>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-700/80 flex items-center justify-between text-xs">
                    <span className="text-slate-400 flex items-center gap-1 text-[11px]">
                      <Clock className="w-3 h-3 text-cyan-400" />
                      ⏱ {feat.estimatedEffort || "1 - 2 Weeks"}
                    </span>

                    {activeProject && (
                      <button
                        onClick={() => handleAddFeature(feat)}
                        disabled={isAdded}
                        className={`px-3 py-1 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                          isAdded
                            ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                            : "bg-[#6366f1] hover:bg-indigo-600 text-white shadow-sm"
                        }`}
                      >
                        {isAdded ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            <span>Added to Plan</span>
                          </>
                        ) : (
                          <>
                            <Plus className="w-3.5 h-3.5" />
                            <span>Add to Project Plan</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
