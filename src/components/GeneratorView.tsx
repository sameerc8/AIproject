import React, { useState } from "react";
import {
  Sparkles,
  Layers,
  Cpu,
  Clock,
  Users,
  Code2,
  Flame,
  ArrowRight,
  Bookmark,
  GitFork,
  MapPin,
  Lightbulb,
  Check,
  Zap,
  Info,
  Server,
  Database,
  Radio,
  FileCode,
} from "lucide-react";
import { Project, GenerateProjectParams } from "../types.js";
import { generateProjectsAPI } from "../lib/api.js";

interface GeneratorViewProps {
  onSelectProject: (project: Project) => void;
  onOpenArchitecture: (project: Project) => void;
  onOpenRoadmap: (project: Project) => void;
  onOpenFeatures: (project: Project) => void;
  onOpenTechAdvisor: (project: Project) => void;
}

const DOMAINS = [
  "Artificial Intelligence",
  "Machine Learning",
  "IoT",
  "Blockchain",
  "Web Development",
  "Cybersecurity",
  "Healthcare",
  "Agriculture",
  "Education",
  "Smart City",
  "Robotics",
  "FinTech",
];

const PRESET_TECHS = [
  "Python",
  "React",
  "PyTorch",
  "FastAPI",
  "Node.js",
  "TypeScript",
  "Docker",
  "OpenCV",
  "PostgreSQL",
  "MQTT",
  "Solidity",
  "TensorFlow",
  "Tailwind CSS",
  "ESP32",
  "Redis",
];

export const GeneratorView: React.FC<GeneratorViewProps> = ({
  onSelectProject,
  onOpenArchitecture,
  onOpenRoadmap,
  onOpenFeatures,
  onOpenTechAdvisor,
}) => {
  const [domain, setDomain] = useState<string>("Artificial Intelligence");
  const [selectedTechs, setSelectedTechs] = useState<string[]>([
    "Python",
    "React",
    "FastAPI",
    "PyTorch",
  ]);
  const [customTech, setCustomTech] = useState<string>("");
  const [difficultyLevel, setDifficultyLevel] = useState<"Beginner" | "Intermediate" | "Advanced">(
    "Intermediate"
  );
  const [projectDuration, setProjectDuration] = useState<string>("6 - 8 Weeks");
  const [teamType, setTeamType] = useState<"Individual" | "Team">("Team");
  const [preferredProjectType, setPreferredProjectType] = useState<string>("AI-Powered Full-Stack");
  const [customKeywords, setCustomKeywords] = useState<string>("");

  const [loading, setLoading] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string>("");
  const [generatedProjects, setGeneratedProjects] = useState<Project[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [savedIds, setSavedIds] = useState<Record<string, boolean>>({});

  const handleAddTech = (tech: string) => {
    const trimmed = tech.trim();
    if (trimmed && !selectedTechs.includes(trimmed)) {
      setSelectedTechs([...selectedTechs, trimmed]);
    }
    setCustomTech("");
  };

  const handleRemoveTech = (tech: string) => {
    setSelectedTechs(selectedTechs.filter((t) => t !== tech));
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setStatusMessage("Connecting to Gemini 3.7 Flash...");

    try {
      const messages = [
        "Analyzing domain constraints and skill set...",
        "Engineering 5 unique, high-novelty project blueprints...",
        "Formulating system architectures and API specifications...",
        "Calculating difficulty and innovation scores...",
        "Finalizing project modules and data flows...",
      ];

      let msgIndex = 0;
      const interval = setInterval(() => {
        msgIndex = (msgIndex + 1) % messages.length;
        setStatusMessage(messages[msgIndex]);
      }, 1500);

      const params: GenerateProjectParams = {
        domain,
        technologies: selectedTechs,
        difficultyLevel,
        projectDuration,
        teamType,
        preferredProjectType,
        customIdeaKeywords: customKeywords,
      };

      const results = await generateProjectsAPI({ ...params, autoSave: true });
      clearInterval(interval);

      setGeneratedProjects(results);
      if (results.length > 0) {
        const ids: Record<string, boolean> = {};
        results.forEach((p) => (ids[p.id] = true));
        setSavedIds(ids);
      }
    } catch (err: any) {
      console.error("Project generation error:", err);
      setError(err?.message || "Failed to generate project ideas. Please try again.");
    } finally {
      setLoading(false);
      setStatusMessage("");
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="border-b border-slate-700 pb-5">
        <div className="flex items-center gap-2 text-xs font-bold text-indigo-400 uppercase tracking-wider">
          <Sparkles className="w-4 h-4" />
          <span>Intelligent Blueprint Engine</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-1">
          AI Project Idea Generator
        </h1>
        <p className="text-sm text-slate-300 mt-1 max-w-3xl">
          Enter your domain, known technologies, difficulty, and timeline. Gemini AI will architect
          5 unique, practical, and cutting-edge project blueprints with complete system specs.
        </p>
      </div>

      {/* Generator Form Card */}
      <div className="bg-[#1E293B] border border-slate-700 rounded-2xl p-6 shadow-sm">
        <form onSubmit={handleGenerate} className="space-y-6">
          {/* 1. Domain Selector */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
              1. Select Domain
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
              {DOMAINS.map((d) => {
                const isSelected = domain === d;
                return (
                  <button
                    type="button"
                    key={d}
                    id={`domain-btn-${d.toLowerCase().replace(/\s+/g, "-")}`}
                    onClick={() => setDomain(d)}
                    className={`px-3 py-2 text-xs font-bold rounded-lg border text-center transition-all cursor-pointer ${
                      isSelected
                        ? "bg-indigo-600 text-white border-indigo-500 shadow-lg shadow-indigo-600/20"
                        : "bg-slate-900/90 text-slate-400 border-slate-700 hover:border-slate-600 hover:text-white"
                    }`}
                  >
                    {d}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Known Technologies Tags */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
              2. Technologies You Know / Want to Use
            </label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {selectedTechs.map((tech) => (
                <span
                  key={tech}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-md"
                >
                  <span>{tech}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveTech(tech)}
                    className="text-indigo-400 hover:text-white cursor-pointer"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>

            {/* Presets & Input */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex-1 min-w-[200px] flex items-center gap-2">
                <input
                  id="tech-input-field"
                  type="text"
                  value={customTech}
                  onChange={(e) => setCustomTech(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddTech(customTech);
                    }
                  }}
                  placeholder="Type technology & press Enter (e.g. Next.js, Arduino, Rust)..."
                  className="w-full bg-slate-900/90 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
                <button
                  type="button"
                  onClick={() => handleAddTech(customTech)}
                  className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-lg border border-slate-700 cursor-pointer"
                >
                  Add
                </button>
              </div>
            </div>

            {/* Quick preset chips */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="text-[11px] text-slate-400 mr-1">Quick add:</span>
              {PRESET_TECHS.map((tech) => {
                const isAdded = selectedTechs.includes(tech);
                return (
                  <button
                    type="button"
                    key={tech}
                    onClick={() => (isAdded ? handleRemoveTech(tech) : handleAddTech(tech))}
                    className={`px-2 py-0.5 text-[11px] font-medium rounded transition-colors cursor-pointer ${
                      isAdded
                        ? "bg-indigo-600/20 text-indigo-300 border border-indigo-500/30"
                        : "bg-slate-900 text-slate-400 border border-slate-700/80 hover:text-slate-200"
                    }`}
                  >
                    {isAdded ? "✓ " : "+ "}
                    {tech}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. Difficulty, Duration, Team & Project Type Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Difficulty Level */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                Difficulty Level
              </label>
              <select
                id="difficulty-select"
                value={difficultyLevel}
                onChange={(e) => setDifficultyLevel(e.target.value as any)}
                className="w-full bg-slate-900/90 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 cursor-pointer"
              >
                <option value="Beginner">Beginner (1-4 score, clear scope)</option>
                <option value="Intermediate">Intermediate (5-7 score, full-stack/AI)</option>
                <option value="Advanced">Advanced (8-10 score, distributed/edge)</option>
              </select>
            </div>

            {/* Project Duration */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                Target Duration
              </label>
              <select
                id="duration-select"
                value={projectDuration}
                onChange={(e) => setProjectDuration(e.target.value)}
                className="w-full bg-slate-900/90 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 cursor-pointer"
              >
                <option value="Hackathon (24-48 Hours)">Hackathon (24-48 Hours)</option>
                <option value="2 - 4 Weeks">2 - 4 Weeks (Sprint MVP)</option>
                <option value="6 - 8 Weeks">6 - 8 Weeks (Comprehensive)</option>
                <option value="3 - 6 Months">3 - 6 Months (Final Year / Capstone)</option>
              </select>
            </div>

            {/* Setting */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                Project Setting
              </label>
              <select
                id="team-type-select"
                value={teamType}
                onChange={(e) => setTeamType(e.target.value as any)}
                className="w-full bg-slate-900/90 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 cursor-pointer"
              >
                <option value="Individual">Individual Developer</option>
                <option value="Team">Team Project (2 - 5 members)</option>
              </select>
            </div>

            {/* Preferred Project Type */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                Preferred Type
              </label>
              <select
                id="project-type-select"
                value={preferredProjectType}
                onChange={(e) => setPreferredProjectType(e.target.value)}
                className="w-full bg-slate-900/90 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 cursor-pointer"
              >
                <option value="AI-Powered Full-Stack">AI-Powered Full-Stack Web App</option>
                <option value="Edge AI / Hardware IoT">Edge AI & IoT Hardware Device</option>
                <option value="Blockchain & Web3 Protocol">Blockchain & Web3 DApp</option>
                <option value="Mobile App (React Native/Flutter)">Mobile AI Assistant</option>
                <option value="Autonomous Agentic Workflow">Autonomous Agentic System</option>
                <option value="Research Paper & PoC">Academic Research PoC</option>
              </select>
            </div>
          </div>

          {/* Optional Focus Keywords */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
              Specific Problem Focus / Keywords (Optional)
            </label>
            <input
              id="custom-keywords-input"
              type="text"
              value={customKeywords}
              onChange={(e) => setCustomKeywords(e.target.value)}
              placeholder="e.g. disaster relief drone telemetry, diabetic retinopathy, privacy-preserving zero knowledge..."
              className="w-full bg-slate-900/90 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Submit Action */}
          <div className="pt-2 flex items-center justify-between">
            <div className="text-xs text-slate-400 flex items-center gap-1.5">
              <Info className="w-4 h-4 text-indigo-400" />
              <span>Generates 5 distinct project architectures ready to build & compare.</span>
            </div>

            <button
              id="submit-generate-btn"
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 px-6 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 rounded-xl shadow-lg shadow-indigo-600/25 transition-all cursor-pointer"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Architecting Projects...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Generate 5 Unique Projects</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Loading Banner with Active Status */}
      {loading && (
        <div className="bg-[#1E293B] border border-indigo-500/30 rounded-2xl p-6 text-center space-y-3">
          <div className="w-10 h-10 border-3 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mx-auto"></div>
          <h3 className="text-base font-bold text-white">Gemini 3.7 AI is Generating Ideas...</h3>
          <p className="text-xs text-indigo-400 animate-pulse">{statusMessage}</p>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-rose-950/40 border border-rose-800 rounded-xl p-4 text-xs text-rose-300">
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* Generated Projects Results */}
      {generatedProjects.length > 0 && (
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-slate-700 pb-3">
            <div>
              <h2 className="text-lg font-bold text-white">Generated Project Blueprints (5)</h2>
              <p className="text-xs text-slate-400">
                Click any project to inspect system layers, roadmap, or feature recommendations.
              </p>
            </div>
            <span className="text-xs text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-md border border-emerald-500/20 flex items-center gap-1 font-bold">
              <Check className="w-3.5 h-3.5" /> Auto-Saved to Library
            </span>
          </div>

          <div className="space-y-6">
            {generatedProjects.map((project, idx) => (
              <div
                key={project.id || idx}
                id={`generated-project-card-${idx}`}
                className="bg-[#1E293B] border border-slate-700 hover:border-indigo-500/40 rounded-2xl p-6 shadow-md transition-all space-y-4"
              >
                {/* Header & Meta */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-bold text-indigo-400 bg-indigo-500/10 px-2.5 py-0.5 rounded-full border border-indigo-500/20">
                        {project.domain}
                      </span>
                      <span className="text-[11px] font-semibold text-slate-300 bg-slate-900 px-2 py-0.5 rounded border border-slate-700">
                        {project.difficultyLevel} (Difficulty: {project.difficultyScore}/10)
                      </span>
                      <span className="text-[11px] text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 flex items-center gap-1 font-bold">
                        <Flame className="w-3 h-3" /> Innovation: {project.innovationScore}/10
                      </span>
                      <span className="text-[11px] text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20 font-semibold">
                        ⏱ {project.estimatedDevelopmentTime}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-white tracking-tight pt-1">
                      {project.title}
                    </h3>
                  </div>

                  <div className="flex items-center gap-2 self-start">
                    <button
                      onClick={() => onSelectProject(project)}
                      className="px-3 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg shadow-sm transition-colors cursor-pointer flex items-center gap-1"
                    >
                      <span>Full Blueprint</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Problem & Description */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 text-xs">
                  <div className="bg-slate-900/90 p-4 rounded-xl border border-slate-800 space-y-1">
                    <span className="font-bold text-amber-400 uppercase tracking-wider text-[10px]">
                      Problem Statement
                    </span>
                    <p className="text-slate-300 leading-relaxed">{project.problemStatement}</p>
                  </div>

                  <div className="bg-slate-900/90 p-4 rounded-xl border border-slate-800 space-y-1">
                    <span className="font-bold text-indigo-400 uppercase tracking-wider text-[10px]">
                      Solution & Architecture Description
                    </span>
                    <p className="text-slate-300 leading-relaxed">{project.description}</p>
                  </div>
                </div>

                {/* Tech & Modules Pills */}
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-[11px] font-bold text-slate-400 mr-1">Required Tech:</span>
                    {project.technologiesRequired?.map((tech, tIdx) => (
                      <span
                        key={tIdx}
                        className="px-2 py-0.5 text-[11px] font-semibold bg-slate-900 text-slate-200 rounded border border-slate-700"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>

                  {project.aiMlAlgorithms?.length > 0 && (
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="text-[11px] font-bold text-purple-400 mr-1">AI / Algorithms:</span>
                      {project.aiMlAlgorithms.map((algo, aIdx) => (
                        <span
                          key={aIdx}
                          className="px-2 py-0.5 text-[11px] font-semibold bg-purple-500/10 text-purple-300 rounded border border-purple-500/20"
                        >
                          {algo}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Action Bar (Architecture, Roadmap, Features, Advisor) */}
                <div className="pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      onClick={() => onOpenArchitecture(project)}
                      className="px-2.5 py-1.5 text-xs font-semibold text-cyan-300 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/20 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
                    >
                      <GitFork className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Architecture Diagram</span>
                    </button>

                    <button
                      onClick={() => onOpenRoadmap(project)}
                      className="px-2.5 py-1.5 text-xs font-semibold text-purple-300 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/20 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
                    >
                      <MapPin className="w-3.5 h-3.5 text-purple-400" />
                      <span>8-Phase Roadmap</span>
                    </button>

                    <button
                      onClick={() => onOpenFeatures(project)}
                      className="px-2.5 py-1.5 text-xs font-semibold text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
                    >
                      <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
                      <span>Recommend Features</span>
                    </button>

                    <button
                      onClick={() => onOpenTechAdvisor(project)}
                      className="px-2.5 py-1.5 text-xs font-semibold text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
                    >
                      <Cpu className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Tech Advisor</span>
                    </button>
                  </div>

                  <span className="text-[11px] text-slate-400">
                    Est. Cost: <strong className="text-slate-200">{project.estimatedCost || "$100 - $300"}</strong>
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
