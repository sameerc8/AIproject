import React, { useState, useEffect } from "react";
import confetti from "canvas-confetti";
import {
  MapPin,
  CheckCircle2,
  Circle,
  Clock,
  Sparkles,
  Award,
  ChevronDown,
  ChevronUp,
  Filter,
  Check,
} from "lucide-react";
import { Project, RoadmapPhase, RoadmapTask } from "../types.js";
import { generateRoadmapAPI, toggleTaskAPI } from "../lib/api.js";

interface RoadmapViewProps {
  selectedProject: Project | null;
  allProjects: Project[];
  onUpdateProject: (p: Project) => void;
}

export const RoadmapView: React.FC<RoadmapViewProps> = ({
  selectedProject,
  allProjects,
  onUpdateProject,
}) => {
  const [activeProject, setActiveProject] = useState<Project | null>(selectedProject);
  const [roadmap, setRoadmap] = useState<RoadmapPhase[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [expandedPhases, setExpandedPhases] = useState<Record<string, boolean>>({});
  const [filterPriority, setFilterPriority] = useState<string>("All");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (selectedProject) {
      setActiveProject(selectedProject);
      if (selectedProject.roadmap && selectedProject.roadmap.length > 0) {
        setRoadmap(selectedProject.roadmap);
        expandAll(selectedProject.roadmap);
      } else {
        loadRoadmap(selectedProject);
      }
    } else if (allProjects.length > 0 && !activeProject) {
      setActiveProject(allProjects[0]);
      if (allProjects[0].roadmap && allProjects[0].roadmap.length > 0) {
        setRoadmap(allProjects[0].roadmap);
        expandAll(allProjects[0].roadmap);
      } else {
        loadRoadmap(allProjects[0]);
      }
    }
  }, [selectedProject, allProjects]);

  const expandAll = (phases: RoadmapPhase[]) => {
    const exp: Record<string, boolean> = {};
    phases.forEach((p) => {
      exp[String(p.phaseNumber)] = true;
    });
    setExpandedPhases(exp);
  };

  const loadRoadmap = async (proj: Project) => {
    setLoading(true);
    setError(null);
    try {
      const res = await generateRoadmapAPI({
        title: proj.title,
        domain: proj.domain,
        description: proj.description,
        duration: proj.estimatedDevelopmentTime,
        projectId: proj.id,
      });
      setRoadmap(res);
      expandAll(res);
      onUpdateProject({ ...proj, roadmap: res });
    } catch (err: any) {
      console.error("Roadmap generation error:", err);
      setError(err?.message || "Failed to generate roadmap");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleTask = async (phaseNumber: number, taskId: string) => {
    if (!activeProject) return;

    // Optimistic UI update
    let totalTasksCount = 0;
    let completedCount = 0;

    const updatedPhases = roadmap.map((phase) => {
      const updatedTasks = phase.tasks.map((task) => {
        if (task.id === taskId) {
          const nextState = !task.completed;
          return { ...task, completed: nextState };
        }
        return task;
      });

      const phaseCompleted = updatedTasks.every((t) => t.completed);
      return { ...phase, tasks: updatedTasks, completed: phaseCompleted };
    });

    updatedPhases.forEach((p) => {
      p.tasks.forEach((t) => {
        totalTasksCount++;
        if (t.completed) completedCount++;
      });
    });

    setRoadmap(updatedPhases);

    // If 100% completed, trigger celebratory confetti!
    if (totalTasksCount > 0 && completedCount === totalTasksCount) {
      confetti({
        particleCount: 120,
        spread: 70,
        origin: { y: 0.6 },
      });
    }

    try {
      const res = await toggleTaskAPI(activeProject.id, taskId);
      onUpdateProject(res.project);
    } catch (err) {
      console.error("Failed to sync task toggle:", err);
    }
  };

  const togglePhaseExpand = (phaseKey: string) => {
    setExpandedPhases((prev) => ({
      ...prev,
      [phaseKey]: !prev[phaseKey],
    }));
  };

  // Calculate overall metrics
  let totalTasks = 0;
  let completedTasks = 0;
  roadmap.forEach((phase) => {
    phase.tasks?.forEach((t) => {
      totalTasks++;
      if (t.completed) completedTasks++;
    });
  });

  const completionPercentage =
    totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-700 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-purple-400 uppercase tracking-wider">
            <MapPin className="w-4 h-4" />
            <span>Interactive 8-Phase Milestone Tracker</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-1">
            Development Roadmap
          </h1>
          <p className="text-sm text-slate-300 mt-1">
            Step-by-step engineering timeline from requirements to production deployment.
          </p>
        </div>

        {/* Project Selector */}
        {allProjects.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-300 whitespace-nowrap">Project:</span>
            <select
              id="roadmap-project-select"
              value={activeProject?.id || ""}
              onChange={(e) => {
                const proj = allProjects.find((p) => p.id === e.target.value);
                if (proj) {
                  setActiveProject(proj);
                  loadRoadmap(proj);
                }
              }}
              className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-purple-500 cursor-pointer max-w-xs font-medium"
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
          <div className="w-10 h-10 border-3 border-purple-500/30 border-t-purple-500 rounded-full animate-spin"></div>
          <p className="text-xs text-purple-400 animate-pulse font-medium">
            Gemini 3.7 AI is architecting 8-phase actionable milestones...
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
          {/* Progress Overview Card */}
          <div className="bg-[#1E293B] border border-slate-700 rounded-2xl p-6 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-purple-400 bg-purple-500/10 px-2.5 py-0.5 rounded-full border border-purple-500/20">
                    {activeProject.domain}
                  </span>
                  <span className="text-xs font-semibold text-slate-400">
                    Est. Duration: {activeProject.estimatedDevelopmentTime}
                  </span>
                </div>
                <h2 className="text-xl font-bold text-white tracking-tight">{activeProject.title}</h2>
                <p className="text-xs text-slate-300">
                  Track implementation milestones, mark tasks complete, and monitor delivery progress.
                </p>
              </div>

              {/* Progress Metric */}
              <div className="flex items-center gap-4 min-w-[220px] bg-slate-900/90 p-4 rounded-xl border border-slate-700 shadow-sm">
                <div className="relative flex items-center justify-center">
                  <div className="text-2xl font-black text-purple-400">{completionPercentage}%</div>
                </div>
                <div className="space-y-1 flex-1">
                  <div className="flex justify-between text-xs font-semibold text-slate-300">
                    <span>Tasks</span>
                    <span>
                      {completedTasks} / {totalTasks}
                    </span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-purple-500 to-indigo-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${completionPercentage}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Filter Bar */}
            <div className="mt-6 pt-4 border-t border-slate-700/80 flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2">
                <span className="text-slate-400 flex items-center gap-1 font-semibold">
                  <Filter className="w-3.5 h-3.5" /> Filter by Priority:
                </span>
                {["All", "High", "Medium", "Low"].map((prio) => (
                  <button
                    key={prio}
                    onClick={() => setFilterPriority(prio)}
                    className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer font-bold ${
                      filterPriority === prio
                        ? "bg-purple-600 text-white"
                        : "bg-slate-900 text-slate-400 hover:text-white border border-slate-700/60"
                    }`}
                  >
                    {prio}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => expandAll(roadmap)}
                  className="text-xs font-bold text-purple-400 hover:text-purple-300 cursor-pointer"
                >
                  Expand All Phases
                </button>
              </div>
            </div>
          </div>

          {/* 8 Phases List */}
          <div className="space-y-4">
            {roadmap.map((phase, idx) => {
              const phaseKey = String(phase.phaseNumber || idx + 1);
              const isExpanded = expandedPhases[phaseKey] !== false;
              const phaseTasks = phase.tasks.filter((t) =>
                filterPriority === "All" ? true : t.priority === filterPriority
              );
              const phaseDoneCount = phase.tasks.filter((t) => t.completed).length;
              const isPhaseAllDone = phase.tasks.length > 0 && phaseDoneCount === phase.tasks.length;

              return (
                <div
                  key={phaseKey}
                  className={`bg-[#1E293B] border rounded-2xl transition-all shadow-sm ${
                    isPhaseAllDone ? "border-emerald-500/40 bg-emerald-950/15" : "border-slate-700"
                  }`}
                >
                  {/* Phase Header Accordion */}
                  <div
                    onClick={() => togglePhaseExpand(phaseKey)}
                    className="p-4 sm:p-5 flex items-center justify-between cursor-pointer hover:bg-slate-800/40 rounded-2xl transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold ${
                          isPhaseAllDone
                            ? "bg-emerald-500 text-slate-950 font-black"
                            : "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                        }`}
                      >
                        {isPhaseAllDone ? "✓" : idx + 1}
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-bold text-white tracking-tight">
                            {phase.name}
                          </h3>
                          {isPhaseAllDone && (
                            <span className="text-[10px] font-bold bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/20">
                              Phase Completed
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5">{phase.description}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-400">
                        <Clock className="w-3.5 h-3.5 text-purple-400" />
                        <span>{phase.estimatedDuration}</span>
                      </div>

                      <span className="text-xs font-semibold text-slate-300">
                        {phaseDoneCount}/{phase.tasks.length} Done
                      </span>

                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4 text-slate-400" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-slate-400" />
                      )}
                    </div>
                  </div>

                  {/* Tasks List */}
                  {isExpanded && (
                    <div className="px-5 pb-5 pt-1 border-t border-slate-700/80 space-y-2">
                      {phaseTasks.map((task) => (
                        <div
                          key={task.id}
                          onClick={() => handleToggleTask(phase.phaseNumber, task.id)}
                          className={`p-3 rounded-xl border flex items-start justify-between gap-3 cursor-pointer transition-all ${
                            task.completed
                              ? "bg-emerald-950/20 border-emerald-500/30 text-slate-300"
                              : "bg-slate-900/90 border-slate-800 hover:border-purple-500/40 text-white"
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <div className="pt-0.5">
                              {task.completed ? (
                                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                              ) : (
                                <Circle className="w-4 h-4 text-slate-500 hover:text-purple-400" />
                              )}
                            </div>
                            <div className="space-y-0.5">
                              <p
                                className={`text-xs font-medium ${
                                  task.completed ? "line-through text-slate-400" : "text-slate-200"
                                }`}
                              >
                                {task.title}
                              </p>
                              <p className="text-[11px] text-slate-400 leading-relaxed">
                                {task.description}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 self-start">
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider ${
                                task.priority === "High"
                                  ? "bg-rose-500/10 text-rose-300 border-rose-500/20"
                                  : task.priority === "Medium"
                                  ? "bg-amber-500/10 text-amber-300 border-amber-500/20"
                                  : "bg-slate-800 text-slate-400 border-slate-700"
                              }`}
                            >
                              {task.priority}
                            </span>
                            <span className="text-[11px] text-slate-400 whitespace-nowrap">
                              ⏱ {task.estimatedHours}h
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
