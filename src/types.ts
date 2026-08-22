export interface Project {
  id: string;
  title: string;
  domain: string;
  difficultyScore: number; // 1 to 10
  difficultyLevel: 'Beginner' | 'Intermediate' | 'Advanced';
  innovationScore: number; // 1 to 10
  readinessScore?: number; // 0 to 100
  problemStatement: string;
  description: string;
  objectives: string[];
  targetUsers: string[];
  technologiesRequired: string[];
  hardwareRequirements: string[];
  softwareRequirements: string[];
  databaseRequirements: string[];
  aiMlAlgorithms: string[];
  developmentModules: { name: string; description: string; estHours?: number }[];
  systemArchitectureExplanation: string;
  apiSuggestions: { method: string; endpoint: string; purpose: string }[];
  estimatedDevelopmentTime: string;
  estimatedCost?: string;
  scalabilitySuggestions: string[];
  futureEnhancements: string[];
  architectureLayers?: ArchitectureLayer[];
  roadmap?: RoadmapPhase[];
  recommendedFeatures?: RecommendedFeature[];
  evaluation?: ProjectEvaluation;
  createdAt: string;
  type: 'generated' | 'evaluated' | 'custom';
  tags?: string[];
}

export interface ProjectEvaluation {
  overallReadinessScore: number; // 0 to 100
  scores: {
    innovation: number; // 0 to 100
    technicalFeasibility: number; // 0 to 100
    realWorldUsefulness: number; // 0 to 100
    scalability: number; // 0 to 100
    complexity: number; // 0 to 100
    security: number; // 0 to 100
  };
  estimatedCost: string;
  estimatedDuration: string;
  possibleChallenges: { challenge: string; mitigation: string }[];
  securityConcerns: string[];
  missingFeatures: string[];
  strengths: string[];
  recommendations: string[];
  verdict: string;
}

export interface RecommendedFeature {
  id: string;
  title: string;
  category: string; // e.g. "Agentic AI", "IoT Sensors", "RAG Chatbot", "Blockchain"
  description: string;
  impactScore: number; // 1 to 10
  complexity: 'Low' | 'Medium' | 'High';
  recommendedTech: string[];
  implementationTip: string;
  isAdded?: boolean;
}

export interface ArchitectureLayer {
  layerId: 'frontend' | 'backend' | 'api' | 'ai_engine' | 'database' | 'iot_external';
  name: string;
  technologies: string[];
  description: string;
  keyResponsibilities: string[];
  dataFlowDescription: string;
}

export interface RoadmapTask {
  id: string;
  title: string;
  description: string;
  duration: string;
  priority: 'High' | 'Medium' | 'Low';
  dependencies: string[];
  completed: boolean;
}

export interface RoadmapPhase {
  phaseNumber: number;
  title: string;
  description: string;
  duration: string;
  tasks: RoadmapTask[];
}

export interface TechStackRecommendation {
  category: string;
  title: string;
  technology: string;
  whySelected: string;
  alternativesConsidered: string[];
  keyAdvantages: string[];
}

export interface TechStackAdviceResponse {
  projectTitle?: string;
  summary: string;
  recommendations: TechStackRecommendation[];
  architectureAdvice: string;
  cloudCostTier: string;
  securityChecklist: string[];
}

export interface DashboardStats {
  totalGenerated: number;
  totalEvaluated: number;
  avgInnovationScore: number;
  avgReadinessScore: number;
  mostSelectedTech: string;
  mostPopularDomain: string;
  domainCounts: Record<string, number>;
  difficultyDistribution: Record<string, number>;
  readinessRanges: { range: string; count: number }[];
  recentProjects: Project[];
}

export interface GenerateProjectParams {
  domain: string;
  technologies: string[];
  difficultyLevel: 'Beginner' | 'Intermediate' | 'Advanced';
  projectDuration: string;
  teamType: 'Individual' | 'Team';
  preferredProjectType: string;
  customIdeaKeywords?: string;
}

export interface EvaluateProjectParams {
  title: string;
  domain: string;
  targetAudience: string;
  description: string;
  technologies: string[];
  budgetOrScope?: string;
}
