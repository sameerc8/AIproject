import React, { useState } from "react";
import {
  FolderKanban,
  Search,
  Filter,
  Flame,
  Clock,
  DollarSign,
  ArrowRight,
  GitFork,
  MapPin,
  Lightbulb,
  Trash2,
  Download,
  Plus,
  RefreshCw,
  Award,
} from "lucide-react";
import { Project } from "../types.js";
import { deleteProjectAPI } from "../lib/api.js";

interface HistoryViewProps {
  projects: Project[];
  onSelectProject: (p: Project) => void;
  onOpenArchitecture: (p: Project) => void;
  onOpenRoadmap: (p: Project) => void;
  onOpenFeatures: (p: Project) => void;
  onNewProject: () => void;
  onRefresh: () => void;
}

const DOMAIN_OPTIONS = [
  "All",
  "Artificial Intelligence",
  "Machine Learning",
  "Healthcare",
  "IoT",
  "Blockchain",
  "Cybersecurity",
  "Agriculture",
  "Smart City",
  "Education",
  "Web Development",
];

export const HistoryView: React.FC<HistoryViewProps> = ({
  projects,
  onSelectProject,
  onOpenArchitecture,
  onOpenRoadmap,
  onOpenFeatures,
  onNewProject,
  onRefresh,
}) => {
  const [search, setSearch] = useState<string>("");
  const [selectedDomain, setSelectedDomain] = useState<string>("All");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("All");

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (window.confirm("Are you sure you want to delete this project blueprint?")) {
      await deleteProjectAPI(id);
      onRefresh();
    }
  };

  const filteredProjects = projects.filter((p) => {
    const matchesDomain = selectedDomain === "All" || p.domain === selectedDomain;
    const matchesDiff =
      selectedDifficulty === "All" || p.difficultyLevel === selectedDifficulty;
    const query = search.toLowerCase();
    const matchesSearch =
      !search ||
      p.title.toLowerCase().includes(query) ||
      p.problemStatement.toLowerCase().includes(query) ||
      p.domain.toLowerCase().includes(query) ||
      p.technologiesRequired?.some((t) => t.toLowerCase().includes(query));

    return matchesDomain && matchesDiff && matchesSearch;
  });

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-700 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-indigo-400 uppercase tracking-wider">
            <FolderKanban className="w-4 h-4" />
            <span>Persistent Project Repository</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-1">
            Project Blueprint Library
          </h1>
          <p className="text-sm text-slate-300 mt-1">
            Browse, search, inspect, and export all generated and evaluated engineering blueprints.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onNewProject}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-[#6366f1] hover:bg-indigo-600 rounded-lg shadow-sm transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Generate New</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-[#1E293B] border border-slate-700 rounded-2xl p-4 shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row items-center gap-3">
          {/* Search Input */}
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              id="history-search-input"
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by title, technology, algorithm, problem..."
              className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Difficulty Filter */}
          <div className="flex items-center gap-2 w-full md:w-auto">
            <span className="text-xs font-semibold text-slate-300 whitespace-nowrap">Difficulty:</span>
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 cursor-pointer w-full md:w-auto font-medium"
            >
              <option value="All">All Levels</option>
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
            </select>
          </div>
        </div>

        {/* Domain Filter Pills */}
        <div className="flex items-center space-x-1.5 overflow-x-auto scrollbar-none pt-1">
          {DOMAIN_OPTIONS.map((d) => {
            const isSelected = selectedDomain === d;
            return (
              <button
                key={d}
                onClick={() => setSelectedDomain(d)}
                className={`px-3 py-1 text-xs font-semibold rounded-full border whitespace-nowrap transition-colors cursor-pointer ${
                  isSelected
                    ? "bg-[#6366f1] text-white border-indigo-500 shadow-sm"
                    : "bg-slate-900 text-slate-300 border-slate-700 hover:text-white"
                }`}
              >
                {d}
              </button>
            );
          })}
        </div>
      </div>

      {/* Projects Grid */}
      {filteredProjects.length === 0 ? (
        <div className="bg-[#1E293B] border border-slate-700 rounded-2xl p-12 text-center space-y-3">
          <FolderKanban className="w-12 h-12 text-slate-500 mx-auto" />
          <h3 className="text-base font-bold text-white">No Matching Blueprints Found</h3>
          <p className="text-xs text-slate-300 max-w-sm mx-auto">
            Try adjusting your search criteria or generate fresh ideas tailored to your skills.
          </p>
          <button
            onClick={onNewProject}
            className="px-4 py-2 bg-[#6366f1] hover:bg-indigo-600 text-white font-bold rounded-lg text-xs transition-colors cursor-pointer"
          >
            Generate New Project Ideas
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProjects.map((project) => (
            <div
              key={project.id}
              onClick={() => onSelectProject(project)}
              className="group bg-[#1E293B] border border-slate-700 hover:border-indigo-500/50 rounded-2xl p-5 flex flex-col justify-between cursor-pointer transition-all hover:shadow-md space-y-4"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-indigo-400 bg-indigo-500/10 px-2.5 py-0.5 rounded-full border border-indigo-500/20">
                    {project.domain}
                  </span>
                  <span className="text-[10px] font-semibold text-slate-400">
                    {project.difficultyLevel} (Diff: {project.difficultyScore}/10)
                  </span>
                </div>

                <h3 className="text-base font-bold text-white group-hover:text-indigo-400 transition-colors line-clamp-1">
                  {project.title}
                </h3>

                <p className="text-xs text-slate-300 line-clamp-3 leading-relaxed">
                  {project.problemStatement || project.description}
                </p>

                {/* Tech Chips */}
                <div className="flex flex-wrap gap-1 pt-1">
                  {project.technologiesRequired?.slice(0, 4).map((tech, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 text-[10px] font-medium bg-slate-900 text-slate-200 rounded border border-slate-700"
                    >
                      {tech}
                    </span>
                  ))}
                  {project.technologiesRequired && project.technologiesRequired.length > 4 && (
                    <span className="px-1.5 py-0.5 text-[10px] font-medium text-slate-400">
                      +{project.technologiesRequired.length - 4}
                    </span>
                  )}
                </div>
              </div>

              {/* Card Footer */}
              <div className="pt-3 border-t border-slate-700/80 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="text-amber-400 font-bold flex items-center gap-1">
                    <Flame className="w-3 h-3" />
                    {project.innovationScore}/10
                  </span>
                  {project.readinessScore && (
                    <span className="text-emerald-400 font-bold flex items-center gap-0.5">
                      <Award className="w-3 h-3" />
                      {project.readinessScore}%
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenArchitecture(project);
                    }}
                    title="View Architecture Diagram"
                    className="p-1.5 text-slate-400 hover:text-cyan-400 hover:bg-slate-900 rounded transition-colors"
                  >
                    <GitFork className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenRoadmap(project);
                    }}
                    title="View 8-Phase Roadmap"
                    className="p-1.5 text-slate-400 hover:text-purple-400 hover:bg-slate-900 rounded transition-colors"
                  >
                    <MapPin className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={(e) => handleDelete(e, project.id)}
                    title="Delete Project"
                    className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-900 rounded transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
