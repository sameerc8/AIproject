import React, { useState, useEffect } from "react";
import { Navbar, ActiveTab } from "./components/Navbar.js";
import { DashboardView } from "./components/DashboardView.js";
import { GeneratorView } from "./components/GeneratorView.js";
import { EvaluatorView } from "./components/EvaluatorView.js";
import { ArchitectureView } from "./components/ArchitectureView.js";
import { RoadmapView } from "./components/RoadmapView.js";
import { FeatureRecommenderView } from "./components/FeatureRecommenderView.js";
import { TechStackAdvisorView } from "./components/TechStackAdvisorView.js";
import { CompareView } from "./components/CompareView.js";
import { HistoryView } from "./components/HistoryView.js";
import { ProjectDetailModal } from "./components/ProjectDetailModal.js";
import { Project, DashboardStats } from "./types.js";
import { fetchDashboardStats, fetchProjects, seedSampleProjectsAPI } from "./lib/api.js";
import { Sparkles, CheckCircle2, Shield, Heart } from "lucide-react";

export function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>("dashboard");
  const [projects, setProjects] = useState<Project[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [modalProject, setModalProject] = useState<Project | null>(null);
  const [contextProject, setContextProject] = useState<Project | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const [fetchedProjects, fetchedStats] = await Promise.all([
        fetchProjects(),
        fetchDashboardStats(),
      ]);
      setProjects(fetchedProjects);
      setStats(fetchedStats);
      if (fetchedProjects.length > 0 && !contextProject) {
        setContextProject(fetchedProjects[0]);
      }
    } catch (err) {
      console.error("Failed to load initial data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenArchitecture = (p: Project) => {
    setContextProject(p);
    setActiveTab("architecture");
  };

  const handleOpenRoadmap = (p: Project) => {
    setContextProject(p);
    setActiveTab("roadmap");
  };

  const handleOpenFeatures = (p: Project) => {
    setContextProject(p);
    setActiveTab("features");
  };

  const handleOpenTechAdvisor = (p: Project) => {
    setContextProject(p);
    setActiveTab("tech-stack");
  };

  const handleUpdateProject = (updated: Project) => {
    setProjects((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
    if (contextProject?.id === updated.id) {
      setContextProject(updated);
    }
  };

  return (
    <div className="min-h-screen bg-[#0F172A] text-slate-200 flex flex-col selection:bg-indigo-500/30 selection:text-indigo-200">
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onNewProject={() => setActiveTab("generator")}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === "dashboard" && (
          <DashboardView
            stats={stats}
            loading={loading}
            onNavigate={(tab) => setActiveTab(tab)}
            onSelectProject={(p) => setModalProject(p)}
            onRefresh={loadData}
          />
        )}

        {activeTab === "generator" && (
          <GeneratorView
            onSelectProject={(p) => setModalProject(p)}
            onOpenArchitecture={handleOpenArchitecture}
            onOpenRoadmap={handleOpenRoadmap}
            onOpenFeatures={handleOpenFeatures}
            onOpenTechAdvisor={handleOpenTechAdvisor}
          />
        )}

        {activeTab === "evaluator" && (
          <EvaluatorView
            onOpenArchitecture={handleOpenArchitecture}
            onOpenRoadmap={handleOpenRoadmap}
            onSelectProject={(p) => setModalProject(p)}
          />
        )}

        {activeTab === "architecture" && (
          <ArchitectureView
            selectedProject={contextProject}
            allProjects={projects}
            onSelectProject={(p) => setContextProject(p)}
          />
        )}

        {activeTab === "roadmap" && (
          <RoadmapView
            selectedProject={contextProject}
            allProjects={projects}
            onUpdateProject={handleUpdateProject}
          />
        )}

        {activeTab === "features" && (
          <FeatureRecommenderView
            selectedProject={contextProject}
            allProjects={projects}
            onUpdateProject={handleUpdateProject}
          />
        )}

        {activeTab === "tech-stack" && (
          <TechStackAdvisorView
            selectedProject={contextProject}
            allProjects={projects}
          />
        )}

        {activeTab === "compare" && (
          <CompareView
            projects={projects}
            onSelectProject={(p) => setModalProject(p)}
          />
        )}

        {activeTab === "history" && (
          <HistoryView
            projects={projects}
            onSelectProject={(p) => setModalProject(p)}
            onOpenArchitecture={handleOpenArchitecture}
            onOpenRoadmap={handleOpenRoadmap}
            onOpenFeatures={handleOpenFeatures}
            onNewProject={() => setActiveTab("generator")}
            onRefresh={loadData}
          />
        )}
      </main>

      {/* Project Detail Modal */}
      <ProjectDetailModal
        project={modalProject}
        onClose={() => setModalProject(null)}
        onOpenArchitecture={handleOpenArchitecture}
        onOpenRoadmap={handleOpenRoadmap}
        onOpenFeatures={handleOpenFeatures}
      />

      {/* Footer */}
      <footer className="border-t border-slate-700/80 bg-[#1E293B]/70 py-6 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-white">Innovation Lab</span>
            <span>—</span>
            <span>Enterprise Blueprint & AI Research Platform</span>
          </div>

          <div className="flex items-center gap-4 text-slate-400">
            <span className="flex items-center gap-1.5 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-emerald-400">Gemini 3.7 Flash Active</span>
            </span>
            <span>•</span>
            <span>REST API Ready</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
export default App;
