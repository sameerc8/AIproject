import { Router, Request, Response } from "express";
import {
  generateProjectIdeas,
  evaluateProjectIdea,
  recommendAdvancedFeatures,
  generateSystemArchitecture,
  generateDevelopmentRoadmap,
  getTechStackAdvice,
} from "../services/gemini_service.js";
import {
  readProjects,
  getProjectById,
  saveProject,
  saveProjectsBatch,
  updateProject,
  deleteProject,
  queryProjects,
  toggleRoadmapTask,
  addFeatureToProject,
  getDashboardStats,
  seedInitialDataIfEmpty,
} from "../services/storage_service.js";
import { Project, GenerateProjectParams, EvaluateProjectParams } from "../src/types.js";

export const apiRouter = Router();

/**
 * 1. AI Project Idea Generator
 * POST /api/projects/generate
 */
apiRouter.post("/projects/generate", async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      domain = "Artificial Intelligence",
      technologies = [],
      difficultyLevel = "Intermediate",
      projectDuration = "8 Weeks",
      teamType = "Team",
      preferredProjectType = "AI-Powered",
      customIdeaKeywords = "",
      autoSave = true,
    } = req.body as GenerateProjectParams & { autoSave?: boolean };

    if (!domain) {
      res.status(400).json({
        success: false,
        message: "Domain is required for project generation",
      });
      return;
    }

    const projects = await generateProjectIdeas({
      domain,
      technologies,
      difficultyLevel,
      projectDuration,
      teamType,
      preferredProjectType,
      customIdeaKeywords,
    });

    // Auto-save generated projects so they appear in library & dashboard
    if (autoSave && projects.length > 0) {
      saveProjectsBatch(projects);
    }

    res.json({
      success: true,
      message: `Successfully generated ${projects.length} innovative project ideas`,
      data: projects,
    });
  } catch (error: any) {
    console.error("Error generating projects:", error);
    res.status(500).json({
      success: false,
      message: error?.message || "Failed to generate project ideas",
    });
  }
});

/**
 * 2. AI Project Evaluator
 * POST /api/projects/evaluate
 */
apiRouter.post("/projects/evaluate", async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      title,
      domain = "Artificial Intelligence",
      targetAudience = "General Developers & Users",
      description,
      technologies = [],
      budgetOrScope = "",
      saveToHistory = true,
    } = req.body as EvaluateProjectParams & { saveToHistory?: boolean };

    if (!title || !description) {
      res.status(400).json({
        success: false,
        message: "Title and description are required for project evaluation",
      });
      return;
    }

    const evaluation = await evaluateProjectIdea({
      title,
      domain,
      targetAudience,
      description,
      technologies,
      budgetOrScope,
    });

    let savedProject: Project | null = null;
    if (saveToHistory) {
      const newProject: Project = {
        id: `proj_eval_${Date.now()}`,
        title,
        domain,
        difficultyScore: Math.round(evaluation.scores.complexity / 10) || 7,
        difficultyLevel:
          evaluation.scores.complexity > 80
            ? "Advanced"
            : evaluation.scores.complexity > 50
            ? "Intermediate"
            : "Beginner",
        innovationScore: Math.round((evaluation.scores.innovation / 10) * 10) / 10,
        readinessScore: evaluation.overallReadinessScore,
        problemStatement: description.slice(0, 150) + "...",
        description,
        objectives: evaluation.strengths || ["Build functional prototype", "Deploy to production"],
        targetUsers: [targetAudience],
        technologiesRequired: technologies.length > 0 ? technologies : ["TypeScript", "Python", "FastAPI"],
        hardwareRequirements: [],
        softwareRequirements: ["Node.js / Python", "Docker", "Database"],
        databaseRequirements: ["PostgreSQL / SQLite"],
        aiMlAlgorithms: ["Gemini 3.7 Flash Reasoning"],
        developmentModules: [
          { name: "Core Architecture & Backend", description: "REST endpoints and logic" },
          { name: "Frontend Interface", description: "Interactive client UI" },
        ],
        systemArchitectureExplanation:
          "Multi-tier client-server architecture with REST endpoints and AI reasoning services.",
        apiSuggestions: [
          { method: "POST", endpoint: "/api/v1/process", purpose: "Process client payload" },
        ],
        estimatedDevelopmentTime: evaluation.estimatedDuration || "6-8 Weeks",
        estimatedCost: evaluation.estimatedCost,
        scalabilitySuggestions: ["Containerize services", "Implement caching"],
        futureEnhancements: evaluation.missingFeatures || [],
        evaluation,
        createdAt: new Date().toISOString(),
        type: "evaluated",
        tags: [domain, "Evaluated"],
      };

      savedProject = saveProject(newProject);
    }

    res.json({
      success: true,
      message: "Project evaluated successfully",
      data: {
        evaluation,
        project: savedProject,
      },
    });
  } catch (error: any) {
    console.error("Error evaluating project:", error);
    res.status(500).json({
      success: false,
      message: error?.message || "Failed to evaluate project idea",
    });
  }
});

/**
 * 3. AI Feature Recommender
 * POST /api/projects/recommend-features
 */
apiRouter.post("/projects/recommend-features", async (req: Request, res: Response): Promise<void> => {
  try {
    const { title, domain = "General", description, techStack = [], projectId } = req.body;

    if (!title && !projectId) {
      res.status(400).json({
        success: false,
        message: "Title or projectId is required",
      });
      return;
    }

    let projTitle = title;
    let projDomain = domain;
    let projDesc = description || "";
    let projTech = techStack;

    if (projectId) {
      const existing = getProjectById(projectId);
      if (existing) {
        projTitle = existing.title;
        projDomain = existing.domain;
        projDesc = existing.description;
        projTech = existing.technologiesRequired;
      }
    }

    const features = await recommendAdvancedFeatures({
      title: projTitle,
      domain: projDomain,
      description: projDesc,
      techStack: projTech,
    });

    if (projectId) {
      updateProject(projectId, { recommendedFeatures: features });
    }

    res.json({
      success: true,
      message: `Generated ${features.length} advanced feature recommendations`,
      data: features,
    });
  } catch (error: any) {
    console.error("Error recommending features:", error);
    res.status(500).json({
      success: false,
      message: error?.message || "Failed to recommend features",
    });
  }
});

/**
 * 4. AI System Architecture Generator
 * POST /api/projects/architecture
 */
apiRouter.post("/projects/architecture", async (req: Request, res: Response): Promise<void> => {
  try {
    const { title, domain = "General", description = "", techStack = [], projectId } = req.body;

    let projTitle = title;
    let projDomain = domain;
    let projDesc = description;
    let projTech = techStack;

    if (projectId) {
      const existing = getProjectById(projectId);
      if (existing) {
        projTitle = existing.title;
        projDomain = existing.domain;
        projDesc = existing.description;
        projTech = existing.technologiesRequired;
      }
    }

    if (!projTitle) {
      res.status(400).json({
        success: false,
        message: "Project title or details required",
      });
      return;
    }

    const architecture = await generateSystemArchitecture({
      title: projTitle,
      domain: projDomain,
      description: projDesc,
      techStack: projTech,
    });

    if (projectId) {
      updateProject(projectId, {
        architectureLayers: architecture.layers,
        systemArchitectureExplanation: architecture.overview,
      });
    }

    res.json({
      success: true,
      message: "System architecture generated successfully",
      data: architecture,
    });
  } catch (error: any) {
    console.error("Error generating architecture:", error);
    res.status(500).json({
      success: false,
      message: error?.message || "Failed to generate architecture",
    });
  }
});

/**
 * 5. Development Roadmap Generator
 * POST /api/projects/roadmap
 */
apiRouter.post("/projects/roadmap", async (req: Request, res: Response): Promise<void> => {
  try {
    const { title, domain = "General", description = "", duration = "8 Weeks", projectId } = req.body;

    let projTitle = title;
    let projDomain = domain;
    let projDesc = description;
    let projDuration = duration;

    if (projectId) {
      const existing = getProjectById(projectId);
      if (existing) {
        projTitle = existing.title;
        projDomain = existing.domain;
        projDesc = existing.description;
        projDuration = existing.estimatedDevelopmentTime || duration;
      }
    }

    if (!projTitle) {
      res.status(400).json({
        success: false,
        message: "Project title or ID is required",
      });
      return;
    }

    const roadmap = await generateDevelopmentRoadmap({
      title: projTitle,
      domain: projDomain,
      description: projDesc,
      duration: projDuration,
    });

    if (projectId) {
      updateProject(projectId, { roadmap });
    }

    res.json({
      success: true,
      message: "Development roadmap generated successfully with 8 structured phases",
      data: roadmap,
    });
  } catch (error: any) {
    console.error("Error generating roadmap:", error);
    res.status(500).json({
      success: false,
      message: error?.message || "Failed to generate roadmap",
    });
  }
});

/**
 * 6. AI Tech Stack Advisor
 * POST /api/projects/tech-stack
 */
apiRouter.post("/projects/tech-stack", async (req: Request, res: Response): Promise<void> => {
  try {
    const { projectDescription, domain } = req.body;

    if (!projectDescription) {
      res.status(400).json({
        success: false,
        message: "Project description is required for tech stack advice",
      });
      return;
    }

    const advice = await getTechStackAdvice(projectDescription, domain);

    res.json({
      success: true,
      message: "Tech stack advice generated successfully",
      data: advice,
    });
  } catch (error: any) {
    console.error("Error getting tech stack advice:", error);
    res.status(500).json({
      success: false,
      message: error?.message || "Failed to get tech stack advice",
    });
  }
});

/**
 * 7. Get All Projects (with search & filters)
 * GET /api/projects
 */
apiRouter.get("/projects", (req: Request, res: Response): void => {
  try {
    const { domain, difficultyLevel, type, search } = req.query as {
      domain?: string;
      difficultyLevel?: string;
      type?: string;
      search?: string;
    };

    const projects = queryProjects({
      domain,
      difficultyLevel,
      type,
      search,
    });

    res.json({
      success: true,
      count: projects.length,
      data: projects,
    });
  } catch (error: any) {
    console.error("Error fetching projects:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch projects",
    });
  }
});

/**
 * 8. Get Single Project by ID
 * GET /api/projects/:id
 */
apiRouter.get("/projects/:id", (req: Request, res: Response): void => {
  try {
    const { id } = req.params;
    const project = getProjectById(id);

    if (!project) {
      res.status(404).json({
        success: false,
        message: `Project with ID ${id} not found`,
      });
      return;
    }

    res.json({
      success: true,
      data: project,
    });
  } catch (error: any) {
    console.error("Error fetching project by id:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch project details",
    });
  }
});

/**
 * 9. Create / Save Project
 * POST /api/projects
 */
apiRouter.post("/projects", (req: Request, res: Response): void => {
  try {
    const projectData = req.body as Partial<Project>;

    if (!projectData.title || !projectData.domain) {
      res.status(400).json({
        success: false,
        message: "Title and domain are required",
      });
      return;
    }

    const newProject: Project = {
      id: projectData.id || `proj_${Date.now()}`,
      title: projectData.title,
      domain: projectData.domain,
      difficultyScore: projectData.difficultyScore || 7,
      difficultyLevel: projectData.difficultyLevel || "Intermediate",
      innovationScore: projectData.innovationScore || 8.5,
      readinessScore: projectData.readinessScore || 80,
      problemStatement: projectData.problemStatement || "",
      description: projectData.description || "",
      objectives: projectData.objectives || [],
      targetUsers: projectData.targetUsers || [],
      technologiesRequired: projectData.technologiesRequired || [],
      hardwareRequirements: projectData.hardwareRequirements || [],
      softwareRequirements: projectData.softwareRequirements || [],
      databaseRequirements: projectData.databaseRequirements || [],
      aiMlAlgorithms: projectData.aiMlAlgorithms || [],
      developmentModules: projectData.developmentModules || [],
      systemArchitectureExplanation: projectData.systemArchitectureExplanation || "",
      apiSuggestions: projectData.apiSuggestions || [],
      estimatedDevelopmentTime: projectData.estimatedDevelopmentTime || "6-8 Weeks",
      estimatedCost: projectData.estimatedCost || "$100 - $300",
      scalabilitySuggestions: projectData.scalabilitySuggestions || [],
      futureEnhancements: projectData.futureEnhancements || [],
      createdAt: new Date().toISOString(),
      type: projectData.type || "custom",
      tags: projectData.tags || [projectData.domain],
    };

    const saved = saveProject(newProject);

    res.status(201).json({
      success: true,
      message: "Project saved successfully",
      data: saved,
    });
  } catch (error: any) {
    console.error("Error creating project:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create project",
    });
  }
});

/**
 * 10. Update Project
 * PUT /api/projects/:id
 */
apiRouter.put("/projects/:id", (req: Request, res: Response): void => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const updated = updateProject(id, updates);

    if (!updated) {
      res.status(404).json({
        success: false,
        message: `Project with ID ${id} not found`,
      });
      return;
    }

    res.json({
      success: true,
      message: "Project updated successfully",
      data: updated,
    });
  } catch (error: any) {
    console.error("Error updating project:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update project",
    });
  }
});

/**
 * 11. Delete Project
 * DELETE /api/projects/:id
 */
apiRouter.delete("/projects/:id", (req: Request, res: Response): void => {
  try {
    const { id } = req.params;
    const deleted = deleteProject(id);

    if (!deleted) {
      res.status(404).json({
        success: false,
        message: `Project with ID ${id} not found`,
      });
      return;
    }

    res.json({
      success: true,
      message: "Project deleted successfully",
    });
  } catch (error: any) {
    console.error("Error deleting project:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete project",
    });
  }
});

/**
 * 12. Toggle Roadmap Task Status
 * POST /api/projects/:id/roadmap/toggle
 */
apiRouter.post("/projects/:id/roadmap/toggle", (req: Request, res: Response): void => {
  try {
    const { id } = req.params;
    const { taskId } = req.body;

    if (!taskId) {
      res.status(400).json({
        success: false,
        message: "taskId is required",
      });
      return;
    }

    const result = toggleRoadmapTask(id, taskId);

    if (!result) {
      res.status(404).json({
        success: false,
        message: "Project or task not found",
      });
      return;
    }

    res.json({
      success: true,
      message: `Task status updated to ${result.taskCompleted ? "Completed" : "Pending"}`,
      data: result,
    });
  } catch (error: any) {
    console.error("Error toggling roadmap task:", error);
    res.status(500).json({
      success: false,
      message: "Failed to toggle roadmap task",
    });
  }
});

/**
 * 13. Add Feature to Project
 * POST /api/projects/:id/features/add
 */
apiRouter.post("/projects/:id/features/add", (req: Request, res: Response): void => {
  try {
    const { id } = req.params;
    const { feature } = req.body;

    if (!feature || !feature.title) {
      res.status(400).json({
        success: false,
        message: "Valid feature object is required",
      });
      return;
    }

    const updatedProject = addFeatureToProject(id, feature);

    if (!updatedProject) {
      res.status(404).json({
        success: false,
        message: "Project not found",
      });
      return;
    }

    res.json({
      success: true,
      message: `Feature '${feature.title}' added to project successfully`,
      data: updatedProject,
    });
  } catch (error: any) {
    console.error("Error adding feature:", error);
    res.status(500).json({
      success: false,
      message: "Failed to add feature to project",
    });
  }
});

/**
 * 14. Dashboard Analytics Stats
 * GET /api/dashboard/stats
 */
apiRouter.get("/dashboard/stats", (req: Request, res: Response): void => {
  try {
    const stats = getDashboardStats();
    res.json({
      success: true,
      data: stats,
    });
  } catch (error: any) {
    console.error("Error fetching dashboard stats:", error);
    res.status(500).json({
      success: false,
      message: "Failed to calculate dashboard statistics",
    });
  }
});

/**
 * 15. Seed Sample Projects
 * POST /api/projects/seed
 */
apiRouter.post("/projects/seed", (req: Request, res: Response): void => {
  try {
    seedInitialDataIfEmpty();
    const stats = getDashboardStats();
    res.json({
      success: true,
      message: "Sample innovative benchmark projects loaded successfully",
      data: stats,
    });
  } catch (error: any) {
    console.error("Error seeding projects:", error);
    res.status(500).json({
      success: false,
      message: "Failed to seed sample projects",
    });
  }
});
