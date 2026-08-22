import React from "react";
import {
  Sparkles,
  LayoutDashboard,
  Lightbulb,
  CheckCircle2,
  GitFork,
  MapPin,
  Cpu,
  Layers,
  BarChart3,
  FolderKanban,
  Plus,
} from "lucide-react";

export type ActiveTab =
  | "dashboard"
  | "generator"
  | "evaluator"
  | "architecture"
  | "roadmap"
  | "features"
  | "tech-stack"
  | "compare"
  | "history";

interface NavbarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  onNewProject: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab, onNewProject }) => {
  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "generator", label: "Idea Generator", icon: Sparkles },
    { id: "evaluator", label: "AI Evaluator", icon: CheckCircle2 },
    { id: "architecture", label: "System Architect", icon: GitFork },
    { id: "roadmap", label: "Roadmap", icon: MapPin },
    { id: "features", label: "Feature Recommender", icon: Lightbulb },
    { id: "tech-stack", label: "Tech Advisor", icon: Cpu },
    { id: "compare", label: "Compare Matrix", icon: BarChart3 },
    { id: "history", label: "Project Library", icon: FolderKanban },
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#1E293B] border-b border-slate-700 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab("dashboard")}>
            <div className="w-10 h-10 bg-indigo-500 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20 text-white font-black text-xl transition-transform hover:scale-105">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold tracking-tight text-white">Innovation Lab</span>
                <span className="px-2 py-0.5 text-[10px] font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded uppercase">
                  Gemini 3.7
                </span>
              </div>
              <p className="text-xs text-slate-400">Autonomous R&D & Systems Architecture</p>
            </div>
          </div>

          {/* AI Status & Quick Action Button */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-slate-800/80 rounded-xl border border-slate-700">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
              <span className="text-xs text-emerald-400 font-medium">Gemini 3.7 Active</span>
            </div>

            <button
              id="nav-quick-generate-btn"
              onClick={onNewProject}
              className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-lg shadow-lg shadow-indigo-500/20 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Generate Ideas</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs Bar */}
        <div className="flex items-center space-x-1.5 overflow-x-auto scrollbar-none py-1.5 border-t border-slate-700/60">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                id={`nav-tab-${item.id}`}
                onClick={() => setActiveTab(item.id as ActiveTab)}
                className={`flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-lg whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? "bg-indigo-600/10 text-indigo-400 border border-indigo-600/20 shadow-sm"
                    : "text-slate-400 hover:text-white hover:bg-slate-800/50"
                }`}
              >
                {isActive && <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>}
                <Icon className={`w-3.5 h-3.5 ${isActive ? "text-indigo-400" : "text-slate-400"}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
