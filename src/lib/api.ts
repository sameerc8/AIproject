import {
  Project,
  ProjectEvaluation,
  RecommendedFeature,
  ArchitectureLayer,
  RoadmapPhase,
  TechStackAdviceResponse,
  DashboardStats,
  GenerateProjectParams,
  EvaluateProjectParams,
} from "../types.js";

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

export async function fetchDashboardStats(): Promise<DashboardStats> {
  const res = await fetch("/api/dashboard/stats");
  const json: ApiResponse<DashboardStats> = await res.json();
  if (!json.success) throw new Error(json.message || "Failed to fetch dashboard stats");
  return json.data;
}

export async function fetchProjects(filters?: {
  domain?: string;
  difficultyLevel?: string;
  type?: string;
  search?: string;
}): Promise<Project[]> {
  const params = new URLSearchParams();
  if (filters?.domain && filters.domain !== "All") params.append("domain", filters.domain);
  if (filters?.difficultyLevel && filters.difficultyLevel !== "All")
    params.append("difficultyLevel", filters.difficultyLevel);
  if (filters?.type && filters.type !== "All") params.append("type", filters.type);
  if (filters?.search) params.append("search", filters.search);

  const res = await fetch(`/api/projects?${params.toString()}`);
  const json: ApiResponse<Project[]> = await res.json();
  if (!json.success) throw new Error(json.message || "Failed to fetch projects");
  return json.data;
}

export async function fetchProjectById(id: string): Promise<Project> {
  const res = await fetch(`/api/projects/${id}`);
  const json: ApiResponse<Project> = await res.json();
  if (!json.success) throw new Error(json.message || "Project not found");
  return json.data;
}

export async function generateProjectsAPI(
  params: GenerateProjectParams & { autoSave?: boolean }
): Promise<Project[]> {
  const res = await fetch("/api/projects/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });
  const json: ApiResponse<Project[]> = await res.json();
  if (!json.success) throw new Error(json.message || "Failed to generate project ideas");
  return json.data;
}

export async function evaluateProjectAPI(
  params: EvaluateProjectParams & { saveToHistory?: boolean }
): Promise<{ evaluation: ProjectEvaluation; project: Project | null }> {
  const res = await fetch("/api/projects/evaluate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });
  const json: ApiResponse<{ evaluation: ProjectEvaluation; project: Project | null }> =
    await res.json();
  if (!json.success) throw new Error(json.message || "Failed to evaluate project");
  return json.data;
}

export async function recommendFeaturesAPI(params: {
  title?: string;
  domain?: string;
  description?: string;
  techStack?: string[];
  projectId?: string;
}): Promise<RecommendedFeature[]> {
  const res = await fetch("/api/projects/recommend-features", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });
  const json: ApiResponse<RecommendedFeature[]> = await res.json();
  if (!json.success) throw new Error(json.message || "Failed to recommend features");
  return json.data;
}

export async function generateArchitectureAPI(params: {
  title?: string;
  domain?: string;
  description?: string;
  techStack?: string[];
  projectId?: string;
}): Promise<{ layers: ArchitectureLayer[]; overview: string }> {
  const res = await fetch("/api/projects/architecture", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });
  const json: ApiResponse<{ layers: ArchitectureLayer[]; overview: string }> = await res.json();
  if (!json.success) throw new Error(json.message || "Failed to generate architecture");
  return json.data;
}

export async function generateRoadmapAPI(params: {
  title?: string;
  domain?: string;
  description?: string;
  duration?: string;
  projectId?: string;
}): Promise<RoadmapPhase[]> {
  const res = await fetch("/api/projects/roadmap", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });
  const json: ApiResponse<RoadmapPhase[]> = await res.json();
  if (!json.success) throw new Error(json.message || "Failed to generate roadmap");
  return json.data;
}

export async function getTechStackAdviceAPI(params: {
  projectDescription: string;
  domain?: string;
}): Promise<TechStackAdviceResponse> {
  const res = await fetch("/api/projects/tech-stack", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });
  const json: ApiResponse<TechStackAdviceResponse> = await res.json();
  if (!json.success) throw new Error(json.message || "Failed to get tech stack advice");
  return json.data;
}

export async function saveProjectAPI(project: Partial<Project>): Promise<Project> {
  const res = await fetch("/api/projects", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(project),
  });
  const json: ApiResponse<Project> = await res.json();
  if (!json.success) throw new Error(json.message || "Failed to save project");
  return json.data;
}

export async function updateProjectAPI(id: string, updates: Partial<Project>): Promise<Project> {
  const res = await fetch(`/api/projects/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updates),
  });
  const json: ApiResponse<Project> = await res.json();
  if (!json.success) throw new Error(json.message || "Failed to update project");
  return json.data;
}

export async function deleteProjectAPI(id: string): Promise<boolean> {
  const res = await fetch(`/api/projects/${id}`, {
    method: "DELETE",
  });
  const json: ApiResponse<any> = await res.json();
  return Boolean(json.success);
}

export async function toggleTaskAPI(
  projectId: string,
  taskId: string
): Promise<{ project: Project; taskCompleted: boolean }> {
  const res = await fetch(`/api/projects/${projectId}/roadmap/toggle`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ taskId }),
  });
  const json: ApiResponse<{ project: Project; taskCompleted: boolean }> = await res.json();
  if (!json.success) throw new Error(json.message || "Failed to toggle task");
  return json.data;
}

export async function addFeatureToProjectAPI(
  projectId: string,
  feature: RecommendedFeature
): Promise<Project> {
  const res = await fetch(`/api/projects/${projectId}/features/add`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ feature }),
  });
  const json: ApiResponse<Project> = await res.json();
  if (!json.success) throw new Error(json.message || "Failed to add feature to project");
  return json.data;
}

export async function seedSampleProjectsAPI(): Promise<DashboardStats> {
  const res = await fetch("/api/projects/seed", {
    method: "POST",
  });
  const json: ApiResponse<DashboardStats> = await res.json();
  return json.data;
}
