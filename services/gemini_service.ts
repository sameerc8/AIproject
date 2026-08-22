import { GoogleGenAI } from "@google/genai";
import {
  Project,
  ProjectEvaluation,
  RecommendedFeature,
  ArchitectureLayer,
  RoadmapPhase,
  TechStackAdviceResponse,
  GenerateProjectParams,
  EvaluateProjectParams,
} from "../src/types.js";

// Initialize Gemini Client
const apiKey = process.env.GEMINI_API_KEY || "";
const ai = apiKey
  ? new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    })
  : null;

const MODEL_NAME = "gemini-3.7-flash";

/**
 * Utility to extract and parse JSON from Gemini text response
 */
function cleanAndParseJSON<T>(rawText: string, fallback: T): T {
  try {
    if (!rawText) return fallback;
    let text = rawText.trim();
    // Remove markdown code blocks if present
    if (text.startsWith("```json")) {
      text = text.replace(/^```json\s*/i, "").replace(/```\s*$/, "");
    } else if (text.startsWith("```")) {
      text = text.replace(/^```\s*/i, "").replace(/```\s*$/, "");
    }
    const parsed = JSON.parse(text);
    return parsed as T;
  } catch (err) {
    console.error("Error parsing Gemini JSON response:", err, "Raw text:", rawText.slice(0, 300));
    // Attempt relaxed regex extraction for JSON object or array
    try {
      const match = rawText.match(/(\{[\s\S]*\}|\[[\s\S]*\])/);
      if (match) {
        return JSON.parse(match[0]) as T;
      }
    } catch {
      // ignore
    }
    return fallback;
  }
}

/**
 * 1. AI Project Idea Generator
 * Generates 5 unique, comprehensive project ideas tailored to user parameters
 */
export async function generateProjectIdeas(
  params: GenerateProjectParams
): Promise<Project[]> {
  const prompt = `You are a world-class AI Software Architect and R&D Advisor.
Generate exactly 5 distinct, highly innovative, practical, and cutting-edge project ideas for students, developers, and researchers.

Input Specifications:
- Domain: ${params.domain}
- Technologies Known: ${params.technologies?.join(", ") || "General Modern Tech Stack"}
- Difficulty Level: ${params.difficultyLevel} (Score between 1 to 10 matching this difficulty)
- Project Duration: ${params.projectDuration}
- Project Setting: ${params.teamType}
- Preferred Project Type: ${params.preferredProjectType}
${params.customIdeaKeywords ? `- Additional Focus / Keywords: ${params.customIdeaKeywords}` : ""}

Return a strictly valid JSON array of exactly 5 project objects matching this schema:
[
  {
    "id": "proj_unique_id",
    "title": "Clear & Inspiring Project Title",
    "domain": "${params.domain}",
    "difficultyScore": 7,
    "difficultyLevel": "${params.difficultyLevel}",
    "innovationScore": 9,
    "readinessScore": 85,
    "problemStatement": "Detailed real-world problem being solved...",
    "description": "Comprehensive explanation of what the project is, its value proposition, and how it works...",
    "objectives": ["Specific Goal 1", "Specific Goal 2", "Specific Goal 3", "Specific Goal 4"],
    "targetUsers": ["Target Group 1", "Target Group 2", "Target Group 3"],
    "technologiesRequired": ["Python", "PyTorch", "FastAPI", "React", "Docker", "Tailwind CSS"],
    "hardwareRequirements": ["NVIDIA GPU / Jetson Nano / Raspberry Pi 4 (if IoT/Hardware applicable, else None)"],
    "softwareRequirements": ["Python 3.11", "Node.js 20", "VSCode", "Docker Desktop"],
    "databaseRequirements": ["PostgreSQL for user state", "Vector DB (ChromaDB / Qdrant) for embeddings", "Redis Cache"],
    "aiMlAlgorithms": ["Transformer-based Attention", "YOLOv11 for Object Detection", "Retrieval-Augmented Generation (RAG)"],
    "developmentModules": [
      { "name": "Module 1: Data Pipeline & Ingestion", "description": "Details of module implementation", "estHours": 25 },
      { "name": "Module 2: Core AI/ML Engine", "description": "Details of module implementation", "estHours": 40 },
      { "name": "Module 3: REST API & Auth Services", "description": "Details of module implementation", "estHours": 30 },
      { "name": "Module 4: Responsive Frontend Interface", "description": "Details of module implementation", "estHours": 35 }
    ],
    "systemArchitectureExplanation": "Comprehensive multi-tier architecture breakdown explaining how Frontend, Gateway, AI Engine, Database, and background queues collaborate seamlessly.",
    "apiSuggestions": [
      { "method": "POST", "endpoint": "/api/v1/analyze", "purpose": "Submits telemetry or text for AI evaluation" },
      { "method": "GET", "endpoint": "/api/v1/metrics", "purpose": "Retrieves real-time aggregated insights" },
      { "method": "POST", "endpoint": "/api/v1/stream", "purpose": "Streams real-time inferences via SSE or WebSocket" }
    ],
    "estimatedDevelopmentTime": "${params.projectDuration}",
    "estimatedCost": "$50 - $200 (Cloud hosting + API credits)",
    "scalabilitySuggestions": ["Use Kubernetes for microservice scaling", "Cache frequent inference results in Redis", "Implement asynchronous worker queues using Celery/RabbitMQ"],
    "futureEnhancements": ["Multi-modal sensory inputs", "On-device edge inference quantization", "Decentralized federated learning"],
    "type": "generated",
    "tags": ["AI", "${params.domain}", "${params.difficultyLevel}"]
  }
]

Ensure all 5 projects are genuinely distinct, creative, actionable, and state-of-the-art. Output ONLY valid JSON.`;

  if (ai) {
    try {
      const response = await ai.models.generateContent({
        model: MODEL_NAME,
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          temperature: 0.7,
        },
      });

      const parsed = cleanAndParseJSON<Project[]>(response.text || "", []);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map((p, idx) => ({
          ...p,
          id: p.id || `proj_${Date.now()}_${idx}`,
          domain: p.domain || params.domain,
          difficultyLevel: params.difficultyLevel,
          createdAt: new Date().toISOString(),
          type: "generated" as const,
        }));
      }
    } catch (error) {
      console.error("Gemini project generation failed:", error);
    }
  }

  // Fallback high-quality projects if API is offline or rate-limited
  return generateFallbackProjects(params);
}

/**
 * 2. AI Project Evaluator
 * Evaluates a user's project idea across innovation, feasibility, security, scalability, and readiness
 */
export async function evaluateProjectIdea(
  params: EvaluateProjectParams
): Promise<ProjectEvaluation> {
  const prompt = `You are an elite Senior Venture Capital Tech Auditor and Principal Software Architect.
Evaluate the following project idea thoroughly with realistic technical scrutiny, actionable feedback, and precise scoring.

Project Title: ${params.title}
Domain: ${params.domain}
Target Audience: ${params.targetAudience}
Description & Technical Details: ${params.description}
Proposed Technologies: ${params.technologies.join(", ") || "Unspecified"}
Budget / Scope Constraints: ${params.budgetOrScope || "Not provided"}

Return a strictly valid JSON object matching this schema:
{
  "overallReadinessScore": 82,
  "scores": {
    "innovation": 85,
    "technicalFeasibility": 80,
    "realWorldUsefulness": 90,
    "scalability": 78,
    "complexity": 75,
    "security": 70
  },
  "estimatedCost": "$150 - $450 (MVP Infrastructure + DB)",
  "estimatedDuration": "6 - 10 Weeks",
  "possibleChallenges": [
    {
      "challenge": "Model inference latency on high concurrent loads",
      "mitigation": "Utilize batching, ONNX runtime optimization, and Redis caching for repeated queries."
    },
    {
      "challenge": "Data privacy and user credential exposure",
      "mitigation": "Enforce TLS 1.3, encrypted at rest data stores, and zero-knowledge OAuth2 token authentication."
    },
    {
      "challenge": "High API consumption costs during initial user acquisition",
      "mitigation": "Implement tiered rate-limiting, semantic caching, and smaller local SLMs for simple tasks."
    }
  ],
  "securityConcerns": [
    "Input sanitization & prompt injection vulnerabilities in AI workflows",
    "Role-based access control (RBAC) authorization flaws between admin and normal tiers",
    "Sensitive PII data leakage in system logs or vector embedding stores"
  ],
  "missingFeatures": [
    "Real-time WebSocket alerting engine for critical anomalies",
    "Automated audit trail & compliance exporter (GDPR/HIPAA)",
    "Offline-first sync capability with local IndexedDB/SQLite cache"
  ],
  "strengths": [
    "Clear, tangible value proposition addressing a proven industry pain point",
    "Solid modern architectural foundation that supports modular upgrades",
    "High market demand with distinct differentiation from legacy solutions"
  ],
  "recommendations": [
    "Build a minimal vertical slice POC focused strictly on core AI accuracy first",
    "Establish automated CI/CD unit testing and synthetic data stress testing",
    "Implement comprehensive telemetry logging using OpenTelemetry & Prometheus"
  ],
  "verdict": "A highly promising and viable project with strong market potential. Focus initial efforts on securing the data pipeline and refining the AI inference latency before scaling out UI features."
}

Output ONLY valid JSON.`;

  if (ai) {
    try {
      const response = await ai.models.generateContent({
        model: MODEL_NAME,
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          temperature: 0.6,
        },
      });

      const parsed = cleanAndParseJSON<ProjectEvaluation>(response.text || "", null as any);
      if (parsed && typeof parsed.overallReadinessScore === "number") {
        return parsed;
      }
    } catch (error) {
      console.error("Gemini project evaluation failed:", error);
    }
  }

  // Fallback evaluation
  return {
    overallReadinessScore: 84,
    scores: {
      innovation: 82,
      technicalFeasibility: 86,
      realWorldUsefulness: 88,
      scalability: 80,
      complexity: 72,
      security: 76,
    },
    estimatedCost: "$100 - $350 (MVP Cloud / APIs)",
    estimatedDuration: "6 - 8 Weeks",
    possibleChallenges: [
      {
        challenge: "Real-time sync latency across distributed clients",
        mitigation: "Implement WebSocket connection pooling and Redis Pub/Sub channels.",
      },
      {
        challenge: "AI prompt hallucination and edge case inconsistency",
        mitigation: "Integrate strict JSON schema enforcement and grounding verification checks.",
      },
    ],
    securityConcerns: [
      "Rate limiting against DDoS and automated scraping",
      "End-to-end token validation with secure HTTP-only cookies",
    ],
    missingFeatures: [
      "AI Agentic Copilot with automated task scheduling",
      "Interactive data analytics export to CSV/PDF",
      "Role-Based Access Control (RBAC)",
    ],
    strengths: [
      "Focused domain architecture with well-defined user personas",
      "High feasibility with modern open-source toolchains",
    ],
    recommendations: [
      "Create modular REST APIs with clear OpenAPI/Swagger documentation",
      "Deploy with Docker containers for cloud portability",
    ],
    verdict: "Strong technical viability. Ready for rapid prototype development with targeted focus on AI accuracy and responsive UI.",
  };
}

/**
 * 3. AI Feature Recommender
 * Suggests transformative, advanced features (Agentic AI, IoT, RAG, Blockchain, etc.)
 */
export async function recommendAdvancedFeatures(
  project: { title: string; domain: string; description: string; techStack?: string[] }
): Promise<RecommendedFeature[]> {
  const prompt = `You are a Chief Innovation Officer.
Analyze the following project and recommend 6-8 transformative, high-impact advanced features that will elevate its innovation, market value, and technical maturity.

Project: ${project.title} (${project.domain})
Description: ${project.description}
Current Tech Stack: ${project.techStack?.join(", ") || "Modern Stack"}

Cover suggestions from categories such as:
- Agentic AI & Autonomous Workflows
- RAG (Retrieval-Augmented Generation) Chatbot / Knowledge Base
- Real-Time Notifications & WebSocket Live Collaboration
- Voice Control & Multimodal Speech Interface
- Computer Vision & Edge AI
- IoT Telemetry & Sensor Streaming
- Blockchain / Decentralized Audit & Smart Contracts
- Predictive Analytics & Anomaly Detection
- Progressive Web App (PWA) / Mobile Hybrid
- Enterprise Cloud Deployment & Serverless Auto-scaling

Return a strictly valid JSON array of feature objects matching this schema:
[
  {
    "id": "feat_1",
    "title": "Autonomous Agentic AI Workflow",
    "category": "Agentic AI",
    "description": "Deploys autonomous multi-step reasoning agents that proactively schedule tasks, synthesize summaries, and trigger external webhooks without human intervention.",
    "impactScore": 9,
    "complexity": "Medium",
    "recommendedTech": ["LangChain", "CrewAI", "FastAPI", "Redis Queue"],
    "implementationTip": "Use tool-calling with deterministic schemas to avoid loops, and store state checkpoints in Redis.",
    "isAdded": false
  }
]

Output ONLY valid JSON.`;

  if (ai) {
    try {
      const response = await ai.models.generateContent({
        model: MODEL_NAME,
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          temperature: 0.7,
        },
      });

      const parsed = cleanAndParseJSON<RecommendedFeature[]>(response.text || "", []);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map((f, i) => ({
          ...f,
          id: f.id || `feat_${Date.now()}_${i}`,
          isAdded: false,
        }));
      }
    } catch (error) {
      console.error("Gemini feature recommendation failed:", error);
    }
  }

  // Fallback feature recommendations
  return [
    {
      id: "feat_agentic",
      title: "Agentic AI Co-Pilot & Automation",
      category: "Agentic AI",
      description: "Embed autonomous multi-step reasoning agents that analyze project metrics, automate routine workflows, and execute scheduled tasks proactively.",
      impactScore: 9,
      complexity: "Medium",
      recommendedTech: ["LangGraph / CrewAI", "Gemini Function Calling", "FastAPI"],
      implementationTip: "Structure actions with strict JSON tool definitions and provide human-in-the-loop review triggers.",
      isAdded: false,
    },
    {
      id: "feat_rag",
      title: "RAG Semantic Knowledge Search",
      category: "RAG Chatbot",
      description: "Empower users to upload technical PDFs, research papers, and codebase specs to chat with context-aware semantic grounding.",
      impactScore: 9,
      complexity: "Medium",
      recommendedTech: ["ChromaDB / Qdrant", "Sentence Transformers", "LangChain"],
      implementationTip: "Chunk documents with 15% overlap and implement hybrid vector + BM25 keyword reranking.",
      isAdded: false,
    },
    {
      id: "feat_realtime",
      title: "Real-Time WebSocket Collaboration & Telemetry",
      category: "Real-time notifications",
      description: "Enable multi-user real-time state synchronization, live cursor tracking, and instant alerts for state modifications.",
      impactScore: 8,
      complexity: "Low",
      recommendedTech: ["Socket.io / WS", "Redis PubSub", "Web Workers"],
      implementationTip: "Use Redis adapter to scale socket connections across multiple backend instances effortlessly.",
      isAdded: false,
    },
    {
      id: "feat_voice",
      title: "Voice-Activated Natural Language Command Center",
      category: "Voice control",
      description: "Hands-free voice recognition and speech synthesis for querying system status and triggering automated actions.",
      impactScore: 8,
      complexity: "Medium",
      recommendedTech: ["Web Speech API / Whisper", "Gemini Live Audio", "AudioWorklet"],
      implementationTip: "Process wake-word locally in the browser to reduce cloud bandwidth and latency.",
      isAdded: false,
    },
    {
      id: "feat_predictive",
      title: "Predictive Analytics & Anomaly Detection Engine",
      category: "Predictive analytics",
      description: "Machine learning model predicting milestone completion risks, bottleneck emergence, and telemetry deviations in real time.",
      impactScore: 9,
      complexity: "High",
      recommendedTech: ["Scikit-Learn", "Prophet / XGBoost", "Chart.js"],
      implementationTip: "Train on historical project velocity data with automated daily model checkpoint retraining.",
      isAdded: false,
    },
    {
      id: "feat_cloud",
      title: "Zero-Downtime Multi-Region Cloud & Edge Deployment",
      category: "Cloud deployment",
      description: "Containerized CI/CD orchestration with automated health checks, blue/green deployments, and edge CDN acceleration.",
      impactScore: 8,
      complexity: "Medium",
      recommendedTech: ["Docker", "Kubernetes", "GitHub Actions", "Cloud Run"],
      implementationTip: "Utilize lightweight Alpine base images and multi-stage Docker builds to keep image sizes under 80MB.",
      isAdded: false,
    },
  ];
}

/**
 * 4. AI System Architecture Generator
 * Generates structured 6-layer architecture with full technical breakdown
 */
export async function generateSystemArchitecture(project: {
  title: string;
  domain: string;
  description: string;
  techStack?: string[];
}): Promise<{ layers: ArchitectureLayer[]; overview: string }> {
  const prompt = `You are a Principal Cloud Systems Architect.
Design a comprehensive, enterprise-ready 6-layer System Architecture for the following project:

Project: ${project.title}
Domain: ${project.domain}
Description: ${project.description}
Technologies: ${project.techStack?.join(", ") || "Modern Stack"}

The architecture MUST cover all 6 distinct layers in order:
1. Frontend Layer (UI/UX, State, Client-side caching, Responsive layout)
2. Backend Layer (Server Framework, Business Logic, Middleware, Auth)
3. REST APIs & Gateway Layer (Endpoints, Rate limiting, Webhooks, API Gateway)
4. AI/ML Engine Layer (Model inference, Vector DB, Pipelines, Embeddings, LLM Orchestration)
5. Database & Cache Layer (Relational/NoSQL, In-memory cache, Object Storage)
6. IoT Devices or External Services Layer (Sensors, Hardware bridges, Third-party APIs, Payment/Notification gateways)

Return a strictly valid JSON object matching this schema:
{
  "overview": "High-level summary of the end-to-end data flow and architectural paradigm (e.g. Event-driven Microservices / Hybrid Modular Monolith)...",
  "layers": [
    {
      "layerId": "frontend",
      "name": "1. Presentation & Client Layer",
      "technologies": ["React 19", "Vite", "Tailwind CSS", "Chart.js", "Zustand / Redux"],
      "description": "Handles responsive UI rendering, dynamic telemetry charts, local state synchronization, and user interaction feedback.",
      "keyResponsibilities": [
        "Render reactive dashboards and real-time metric updates",
        "Form validation and optimistic UI state updates",
        "Manage secure authentication tokens and local persistence"
      ],
      "dataFlowDescription": "Dispatches asynchronous REST/GraphQL requests to the API Gateway and listens for server-sent push events."
    },
    {
      "layerId": "backend",
      "name": "2. Application & Business Logic Layer",
      "technologies": ["Node.js / Express or Python FastAPI", "TypeScript", "Pydantic"],
      "description": "Executes core business rules, coordinates asynchronous pipelines, verifies permissions, and manages transaction integrity.",
      "keyResponsibilities": [
        "Authentication & Role-Based Access Control (RBAC)",
        "Request sanitization and business constraint enforcement",
        "Dispatching background jobs to task queues"
      ],
      "dataFlowDescription": "Receives validated client payloads, queries or writes to Database, and calls AI inference engine."
    },
    {
      "layerId": "api",
      "name": "3. REST API & Integration Gateway",
      "technologies": ["Express Router / FastAPI", "OpenAPI / Swagger", "JWT", "Helmet"],
      "description": "Exposes standardized RESTful endpoints, enforces rate-limiting, CORS, and request logging.",
      "keyResponsibilities": [
        "Route versioning (/api/v1/)",
        "DDoS protection, rate limiting, and CORS headers",
        "Centralized error handling and telemetry interceptors"
      ],
      "dataFlowDescription": "Acts as the unified entry point routing traffic securely between client applications and downstream microservices."
    },
    {
      "layerId": "ai_engine",
      "name": "4. AI/ML & Analytics Engine",
      "technologies": ["Google Gemini 3.7 Flash", "PyTorch / TensorFlow", "ChromaDB / Qdrant", "LangChain"],
      "description": "Performs multimodal inference, semantic vector embeddings, continuous predictions, and generative reasoning.",
      "keyResponsibilities": [
        "Execute prompt templates and structured JSON responses",
        "Compute similarity embeddings and vector search",
        "Real-time anomaly detection and predictive modeling"
      ],
      "dataFlowDescription": "Pulls contextual records from the database, executes AI inference, and delivers structured predictions back to backend."
    },
    {
      "layerId": "database",
      "name": "5. Persistence & In-Memory Caching",
      "technologies": ["PostgreSQL / SQLite", "Redis Cache", "Drizzle ORM / Prisma"],
      "description": "Provides ACID-compliant relational data storage, high-throughput session caching, and vector indexing.",
      "keyResponsibilities": [
        "Store user profiles, project roadmaps, and audit logs",
        "Cache frequently requested analytics and LLM outputs in Redis",
        "Maintain foreign key relationships and index optimization"
      ],
      "dataFlowDescription": "Serves high-speed cached queries from Redis and executes ACID transactions on relational tables."
    },
    {
      "layerId": "iot_external",
      "name": "6. IoT Hardware & External Cloud Services",
      "technologies": ["MQTT Broker (Mosquitto)", "ESP32 / Raspberry Pi", "Stripe / SendGrid", "Google Cloud Run"],
      "description": "Bridges external telemetry sensor feeds, hardware actuators, cloud notifications, and third-party SaaS integrations.",
      "keyResponsibilities": [
        "Ingest sensor streams via lightweight MQTT protocols",
        "Deliver email/SMS notifications and push alerts",
        "Containerized cloud infrastructure deployment"
      ],
      "dataFlowDescription": "Streams telemetry data into backend collectors and executes hardware control commands."
    }
  ]
}

Output ONLY valid JSON.`;

  if (ai) {
    try {
      const response = await ai.models.generateContent({
        model: MODEL_NAME,
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          temperature: 0.6,
        },
      });

      const parsed = cleanAndParseJSON<{ layers: ArchitectureLayer[]; overview: string }>(
        response.text || "",
        null as any
      );
      if (parsed && Array.isArray(parsed.layers) && parsed.layers.length > 0) {
        return parsed;
      }
    } catch (error) {
      console.error("Gemini system architecture generation failed:", error);
    }
  }

  // Fallback system architecture
  return {
    overview:
      "A modern, modular multi-tier architecture featuring clean separation between presentation, business logic, AI/ML inference pipelines, and persistent database storage.",
    layers: [
      {
        layerId: "frontend",
        name: "1. Presentation Layer (UI/UX)",
        technologies: ["React 19", "Vite", "Tailwind CSS", "Chart.js"],
        description: "Responsive interface providing real-time data visualizers, roadmap task management, and project analyzers.",
        keyResponsibilities: [
          "Render interactive dashboards and charts",
          "Handle user inputs and live filtering",
          "Optimistic UI state updates",
        ],
        dataFlowDescription: "Communicates via REST JSON APIs to the Backend Gateway.",
      },
      {
        layerId: "backend",
        name: "2. Backend Application Layer",
        technologies: ["Node.js Express / Python FastAPI", "TypeScript"],
        description: "Orchestrates API endpoints, business logic validation, and AI service invocations.",
        keyResponsibilities: [
          "Manage business workflows and user security",
          "Coordinate AI generation and evaluation tasks",
          "Serve analytics and aggregation endpoints",
        ],
        dataFlowDescription: "Receives client requests, queries database, and dispatches AI prompts.",
      },
      {
        layerId: "api",
        name: "3. REST API Gateway",
        technologies: ["Express Router", "OpenAPI", "JSON REST Protocol"],
        description: "Standardized RESTful interface handling routing, error wrapping, and rate limiting.",
        keyResponsibilities: [
          "Route requests to dedicated controllers",
          "Validate schemas and sanitize inputs",
          "Format standardized JSON responses",
        ],
        dataFlowDescription: "Enforces protocol standards between client and services.",
      },
      {
        layerId: "ai_engine",
        name: "4. AI/ML Engine Layer",
        technologies: ["Google Gemini 3.7 Flash", "@google/genai SDK", "Embeddings"],
        description: "Generates project blueprints, performs multi-criteria technical evaluations, and suggests features.",
        keyResponsibilities: [
          "Execute generative AI reasoning prompts",
          "Score innovation and feasibility vectors",
          "Produce structured architecture and roadmap JSON",
        ],
        dataFlowDescription: "Ingests project parameters and returns structured analysis.",
      },
      {
        layerId: "database",
        name: "5. Database & Persistence Layer",
        technologies: ["SQLite / PostgreSQL", "JSON Storage Engine", "Redis Cache"],
        description: "Stores generated projects, evaluation benchmarks, roadmap task states, and aggregate analytics.",
        keyResponsibilities: [
          "ACID transaction persistence",
          "Indexing and fast keyword search",
          "Persistent project history archiving",
        ],
        dataFlowDescription: "Safely persists and retrieves project records on demand.",
      },
      {
        layerId: "iot_external",
        name: "6. External Services & Cloud Layer",
        technologies: ["Cloud Run Container", "External Webhooks", "Sensor APIs"],
        description: "Manages containerized hosting, telemetry feeds, and external integrations.",
        keyResponsibilities: [
          "Host web services with auto-scaling",
          "Provide external API communication",
          "Manage environment secrets securely",
        ],
        dataFlowDescription: "Connects the system to the cloud ecosystem and telemetry endpoints.",
      },
    ],
  };
}

/**
 * 5. Development Roadmap Generator
 * Generates an 8-phase actionable development plan
 */
export async function generateDevelopmentRoadmap(project: {
  title: string;
  domain: string;
  description: string;
  duration?: string;
}): Promise<RoadmapPhase[]> {
  const prompt = `You are a Technical Project Manager and Agile Coach.
Create an exhaustive 8-Phase Development Roadmap for the following project:

Project: ${project.title}
Domain: ${project.domain}
Description: ${project.description}
Target Timeline: ${project.duration || "8 Weeks"}

You MUST create all 8 phases in sequence:
Phase 1: Requirement Analysis & Feasibility Study
Phase 2: UI/UX & System Design
Phase 3: Database & Architecture Setup
Phase 4: Backend & API Development
Phase 5: AI/ML Engine & Model Integration
Phase 6: Frontend & Real-time Integration
Phase 7: Comprehensive Testing & Security Auditing
Phase 8: Production Deployment & Monitoring

For each phase, provide 3-4 specific, actionable tasks with estimated duration, priority (High, Medium, Low), dependencies, and completion status (false).

Return a strictly valid JSON array matching this schema:
[
  {
    "phaseNumber": 1,
    "title": "Phase 1: Requirement Analysis & Feasibility Study",
    "description": "Define scope, user stories, hardware/software constraints, and API benchmarks.",
    "duration": "1 Week",
    "tasks": [
      {
        "id": "task_1_1",
        "title": "Finalize Functional & Non-Functional Requirements",
        "description": "Document system objectives, latency targets, and target user personas.",
        "duration": "2 Days",
        "priority": "High",
        "dependencies": [],
        "completed": false
      },
      {
        "id": "task_1_2",
        "title": "Select AI Model & API Provider Benchmarks",
        "description": "Benchmark token latency, token costs, and context windows.",
        "duration": "3 Days",
        "priority": "High",
        "dependencies": ["task_1_1"],
        "completed": false
      }
    ]
  }
]

Output ONLY valid JSON for all 8 phases.`;

  if (ai) {
    try {
      const response = await ai.models.generateContent({
        model: MODEL_NAME,
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          temperature: 0.6,
        },
      });

      const parsed = cleanAndParseJSON<RoadmapPhase[]>(response.text || "", []);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map((phase, pIdx) => ({
          ...phase,
          phaseNumber: phase.phaseNumber || pIdx + 1,
          tasks: (phase.tasks || []).map((t, tIdx) => ({
            ...t,
            id: t.id || `task_${pIdx + 1}_${tIdx + 1}`,
            completed: false,
          })),
        }));
      }
    } catch (error) {
      console.error("Gemini roadmap generation failed:", error);
    }
  }

  // Fallback 8-phase roadmap
  return [
    {
      phaseNumber: 1,
      title: "Phase 1: Requirement Analysis",
      description: "Define core problem scope, user stories, architectural constraints, and API dependencies.",
      duration: "1 Week",
      tasks: [
        {
          id: "task_1_1",
          title: "Define System Scope & User Personas",
          description: "Document user workflows and key functional requirements.",
          duration: "3 Days",
          priority: "High",
          dependencies: [],
          completed: true,
        },
        {
          id: "task_1_2",
          title: "Technical Feasibility & API Audit",
          description: "Verify SDK compatibility, rate limits, and latency targets.",
          duration: "2 Days",
          priority: "High",
          dependencies: ["task_1_1"],
          completed: true,
        },
      ],
    },
    {
      phaseNumber: 2,
      title: "Phase 2: UI/UX Design",
      description: "Create wireframes, component design systems, and responsive layout mockups.",
      duration: "1 Week",
      tasks: [
        {
          id: "task_2_1",
          title: "Design System & Interactive Wireframes",
          description: "Build wireframes for dashboard, analytics charts, and form views.",
          duration: "4 Days",
          priority: "Medium",
          dependencies: ["task_1_2"],
          completed: false,
        },
        {
          id: "task_2_2",
          title: "Accessibility & Responsive Layout Spec",
          description: "Ensure WCAG AA contrast standards and mobile-first responsive breakpoints.",
          duration: "2 Days",
          priority: "Medium",
          dependencies: ["task_2_1"],
          completed: false,
        },
      ],
    },
    {
      phaseNumber: 3,
      title: "Phase 3: Database Design",
      description: "Model relational database schemas, indexes, foreign keys, and cache strategies.",
      duration: "5 Days",
      tasks: [
        {
          id: "task_3_1",
          title: "Database Schema & Entity Relationship Model",
          description: "Define tables for users, project blueprints, evaluations, and tasks.",
          duration: "3 Days",
          priority: "High",
          dependencies: ["task_2_2"],
          completed: false,
        },
        {
          id: "task_3_2",
          title: "Migration Scripts & Seed Data Generation",
          description: "Create initial migrations and test benchmark datasets.",
          duration: "2 Days",
          priority: "Medium",
          dependencies: ["task_3_1"],
          completed: false,
        },
      ],
    },
    {
      phaseNumber: 4,
      title: "Phase 4: Backend Development",
      description: "Build robust REST APIs, authentication layers, middleware, and business services.",
      duration: "1.5 Weeks",
      tasks: [
        {
          id: "task_4_1",
          title: "Implement Core REST API Endpoints",
          description: "Build endpoints for project generation, evaluation, CRUD, and analytics.",
          duration: "5 Days",
          priority: "High",
          dependencies: ["task_3_2"],
          completed: false,
        },
        {
          id: "task_4_2",
          title: "Middleware, Input Sanitization & Error Handling",
          description: "Implement centralized error logging, rate limiting, and CORS security.",
          duration: "3 Days",
          priority: "High",
          dependencies: ["task_4_1"],
          completed: false,
        },
      ],
    },
    {
      phaseNumber: 5,
      title: "Phase 5: AI/ML Integration",
      description: "Integrate Google Gemini 3.7 Flash SDK, prompt engineering, and schema validators.",
      duration: "1 Week",
      tasks: [
        {
          id: "task_5_1",
          title: "Gemini SDK Service & Structured Output Handlers",
          description: "Implement robust prompt templates and JSON schema parsers.",
          duration: "4 Days",
          priority: "High",
          dependencies: ["task_4_2"],
          completed: false,
        },
        {
          id: "task_5_2",
          title: "AI Response Caching & Rate-Limit Fallbacks",
          description: "Add fallback generators and response caching for network resilience.",
          duration: "2 Days",
          priority: "Medium",
          dependencies: ["task_5_1"],
          completed: false,
        },
      ],
    },
    {
      phaseNumber: 6,
      title: "Phase 6: Frontend Integration",
      description: "Connect React components to REST endpoints with reactive state and Chart.js graphs.",
      duration: "1.5 Weeks",
      tasks: [
        {
          id: "task_6_1",
          title: "Interactive Dashboards & Chart.js Analytics",
          description: "Render radar charts, doughnut distributions, and metric score cards.",
          duration: "4 Days",
          priority: "High",
          dependencies: ["task_5_2"],
          completed: false,
        },
        {
          id: "task_6_2",
          title: "Real-Time Roadmap Task Checklists & Architecture Visualizer",
          description: "Enable 1-click task status toggling and multi-layer architecture diagrams.",
          duration: "4 Days",
          priority: "High",
          dependencies: ["task_6_1"],
          completed: false,
        },
      ],
    },
    {
      phaseNumber: 7,
      title: "Phase 7: Testing",
      description: "Perform end-to-end integration tests, load tests, and security vulnerability scans.",
      duration: "5 Days",
      tasks: [
        {
          id: "task_7_1",
          title: "Automated API & Unit Test Suite",
          description: "Test all REST routes with edge case inputs and invalid payloads.",
          duration: "3 Days",
          priority: "High",
          dependencies: ["task_6_2"],
          completed: false,
        },
        {
          id: "task_7_2",
          title: "Security Audit & XSS/Injection Scans",
          description: "Verify security headers, sanitize HTML rendering, and test secret handling.",
          duration: "2 Days",
          priority: "High",
          dependencies: ["task_7_1"],
          completed: false,
        },
      ],
    },
    {
      phaseNumber: 8,
      title: "Phase 8: Deployment",
      description: "Package application in Docker container, configure CI/CD pipeline, and go live.",
      duration: "4 Days",
      tasks: [
        {
          id: "task_8_1",
          title: "Containerization & Multi-Stage Dockerfile",
          description: "Optimize production build artifacts and verify container port binding.",
          duration: "2 Days",
          priority: "High",
          dependencies: ["task_7_2"],
          completed: false,
        },
        {
          id: "task_8_2",
          title: "Deploy to Cloud Run & Setup Telemetry Logging",
          description: "Deploy to Cloud Run, bind custom domains, and configure uptime monitoring.",
          duration: "2 Days",
          priority: "High",
          dependencies: ["task_8_1"],
          completed: false,
        },
      ],
    },
  ];
}

/**
 * 6. AI Tech Stack Advisor
 * Recommends optimal tech stack with detailed explanations
 */
export async function getTechStackAdvice(
  projectDescription: string,
  domain?: string
): Promise<TechStackAdviceResponse> {
  const prompt = `You are a Principal Enterprise Systems Architect.
Analyze the following project description and provide an authoritative, opinionated Tech Stack Recommendation with in-depth justification for every tier:

Project Description: ${projectDescription}
${domain ? `Domain: ${domain}` : ""}

Recommend specific technologies across all 8 essential categories:
1. Frontend Framework
2. Backend Framework
3. Database System
4. AI/ML Libraries & SDKs
5. Cloud Platform & Hosting
6. Authentication & Security
7. API Architecture
8. Deployment & CI/CD Toolchain

Return a strictly valid JSON object matching this schema:
{
  "projectTitle": "Recommended Tech Architecture",
  "summary": "High-level summary of the architectural strategy...",
  "cloudCostTier": "Low to Moderate ($15 - $60/month for MVP)",
  "architectureAdvice": "Start with a modular monolith or clean service architecture. Separate AI inference into async workers if processing large payloads.",
  "securityChecklist": [
    "Enforce HTTPS and HSTS headers in production",
    "Rotate API keys regularly and use environment secret vaults",
    "Validate all incoming request bodies with strict TypeScript/Pydantic schemas"
  ],
  "recommendations": [
    {
      "category": "Frontend Framework",
      "title": "Client-Side UI Engine",
      "technology": "React 19 with Vite & Tailwind CSS",
      "whySelected": "Offers rapid compile times, excellent component modularity, instant hot reload, and massive ecosystem support for data visualization libraries like Chart.js.",
      "alternativesConsidered": ["Next.js", "Vue 3", "SvelteKit"],
      "keyAdvantages": ["Zero-bloat client bundle", "Seamless integration with state management", "Fast rendering performance"]
    },
    {
      "category": "Backend Framework",
      "title": "Core API Service",
      "technology": "Node.js Express with TypeScript (or Python FastAPI)",
      "whySelected": "Provides high concurrency for I/O-bound AI requests, lightweight footprint, and shared TypeScript types between frontend and backend.",
      "alternativesConsidered": ["Django", "Ruby on Rails", "NestJS"],
      "keyAdvantages": ["Rapid REST endpoint authoring", "Type safety across boundaries", "Minimal runtime overhead"]
    },
    {
      "category": "Database",
      "title": "Persistent Data Store",
      "technology": "PostgreSQL (with SQLite for local dev & ChromaDB for vectors)",
      "whySelected": "Combines robust ACID compliance, JSONB document querying flexibility, and seamless migration paths from SQLite prototyping to production Postgres.",
      "alternativesConsidered": ["MongoDB", "MySQL", "DynamoDB"],
      "keyAdvantages": ["Structured relations", "Rich indexing capabilities", "Extensible vector search with pgvector"]
    },
    {
      "category": "AI/ML Libraries",
      "title": "Generative Intelligence Layer",
      "technology": "Google GenAI SDK (Gemini 3.7 Flash) + LangChain",
      "whySelected": "Delivers industry-leading reasoning speed, native JSON structured schema output, massive context window, and cost-efficient multimodal processing.",
      "alternativesConsidered": ["OpenAI GPT-4o", "Anthropic Claude", "Local Ollama Llama-3"],
      "keyAdvantages": ["Fast token generation", "Accurate schema adherence", "Built-in grounding capabilities"]
    },
    {
      "category": "Cloud Platform",
      "title": "Hosting & Compute",
      "technology": "Google Cloud Run / AWS ECS (Container-based)",
      "whySelected": "Allows scale-to-zero cost efficiency when idle, rapid auto-scaling under spike loads, and effortless container portability.",
      "alternativesConsidered": ["Vercel", "Heroku", "Bare Metal VPS"],
      "keyAdvantages": ["Pay-per-use compute", "Automatic SSL management", "Docker native container support"]
    },
    {
      "category": "Authentication",
      "title": "Identity & Access Control",
      "technology": "JWT with HTTP-Only Cookies & OAuth2",
      "whySelected": "Stateless token validation minimizes database lookup latency while protecting against XSS attacks via HTTP-only flags.",
      "alternativesConsidered": ["Session Cookies", "Firebase Auth", "Auth0"],
      "keyAdvantages": ["Stateless verification", "Easy microservice propagation", "Secure token expiration lifecycle"]
    },
    {
      "category": "API Architecture",
      "title": "Communication Protocol",
      "technology": "RESTful JSON APIs with OpenAPI Documentation",
      "whySelected": "Universal compatibility across web, mobile, and IoT clients with predictable caching and straightforward debugging.",
      "alternativesConsidered": ["GraphQL", "gRPC", "tRPC"],
      "keyAdvantages": ["Simple HTTP tooling", "Clear status codes", "Extensive testing tooling"]
    },
    {
      "category": "Deployment & CI/CD",
      "title": "Build & Release Pipeline",
      "technology": "GitHub Actions + Multi-Stage Dockerfile",
      "whySelected": "Automates linting, test execution, container image compilation, and automated blue-green rollouts on main branch commits.",
      "alternativesConsidered": ["GitLab CI", "CircleCI", "Manual SSH Deployment"],
      "keyAdvantages": ["Reproducible container builds", "Automated test gates", "Instant rollback capabilities"]
    }
  ]
}

Output ONLY valid JSON.`;

  if (ai) {
    try {
      const response = await ai.models.generateContent({
        model: MODEL_NAME,
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          temperature: 0.6,
        },
      });

      const parsed = cleanAndParseJSON<TechStackAdviceResponse>(response.text || "", null as any);
      if (parsed && Array.isArray(parsed.recommendations)) {
        return parsed;
      }
    } catch (error) {
      console.error("Gemini tech stack advice failed:", error);
    }
  }

  // Fallback tech stack advice
  return {
    projectTitle: "Recommended Modern Full-Stack Architecture",
    summary:
      "A high-velocity, scalable architecture utilizing TypeScript across frontend and backend, PostgreSQL/SQLite for data integrity, and Google Gemini 3.7 Flash for AI reasoning.",
    cloudCostTier: "Low ($20 - $50/month)",
    architectureAdvice:
      "Maintain a clean modular structure with distinct service layers. Decouple AI inference from synchronous API responses.",
    securityChecklist: [
      "Use environment variables for secret keys and never expose them in client bundles",
      "Implement CORS restrictions and rate limiting on public endpoints",
      "Validate user input schemas both client-side and server-side",
    ],
    recommendations: [
      {
        category: "Frontend Framework",
        title: "Presentation Tier",
        technology: "React 19 + Vite + Tailwind CSS",
        whySelected: "Superior rendering speed, rich data visualization ecosystem, and responsive utility styling.",
        alternativesConsidered: ["Next.js", "Vue 3"],
        keyAdvantages: ["Fast hot reload", "Modular component hierarchy", "Wide library compatibility"],
      },
      {
        category: "Backend Framework",
        title: "Application Server",
        technology: "Express.js with TypeScript",
        whySelected: "Lightweight, un-opinionated routing with type safety and high I/O throughput.",
        alternativesConsidered: ["FastAPI", "NestJS"],
        keyAdvantages: ["Unified TypeScript codebase", "Simple middleware chaining", "Low memory footprint"],
      },
      {
        category: "Database",
        title: "Persistence Tier",
        technology: "SQLite / PostgreSQL",
        whySelected: "Zero-config setup for development with seamless migration to PostgreSQL in production.",
        alternativesConsidered: ["MongoDB", "MySQL"],
        keyAdvantages: ["ACID compliance", "Relational integrity", "Fast indexed queries"],
      },
      {
        category: "AI/ML Engine",
        title: "Intelligence Tier",
        technology: "Google Gemini 3.7 Flash via @google/genai SDK",
        whySelected: "High reasoning capacity, rapid token latency, and native JSON schema enforcement.",
        alternativesConsidered: ["OpenAI GPT-4o", "Claude 3.5 Sonnet"],
        keyAdvantages: ["Fast response times", "Accurate JSON formatting", "Cost efficiency"],
      },
    ],
  };
}

/**
 * High-quality fallback generator for when Gemini API key is missing or offline
 */
function generateFallbackProjects(params: GenerateProjectParams): Project[] {
  const domain = params.domain || "Artificial Intelligence";
  return [
    {
      id: `proj_${Date.now()}_1`,
      title: `IntelliHealth: Multi-Modal Disease Screening & Clinical Decision Support`,
      domain: "Healthcare",
      difficultyScore: 8,
      difficultyLevel: params.difficultyLevel || "Intermediate",
      innovationScore: 9,
      readinessScore: 88,
      problemStatement:
        "Rural and underserved clinics lack access to specialist diagnostic radiologists, resulting in delayed patient diagnoses for retinal and pulmonary conditions.",
      description:
        "An AI-powered clinical assistant combining medical image segmentation (chest X-rays, retinal scans) with patient symptom analysis using multimodal LLMs to generate ranked differential diagnoses and clinical report drafts.",
      objectives: [
        "Automate chest X-ray lung opacity detection with >94% sensitivity",
        "Generate structured medical summary reports complying with FHIR standards",
        "Provide explainability heatmaps (Grad-CAM) for visual verification",
        "Support offline cached inference for rural field clinics",
      ],
      targetUsers: ["General Practitioners", "Radiology Technicians", "Telehealth Providers", "Medical Researchers"],
      technologiesRequired: ["Python", "PyTorch", "FastAPI", "React", "Docker", "Tailwind CSS", "ONNX Runtime"],
      hardwareRequirements: ["NVIDIA RTX GPU for training", "Standard x86 PC or Edge Device for inference"],
      softwareRequirements: ["Python 3.11", "Node.js 20", "PostgreSQL", "Docker Desktop"],
      databaseRequirements: ["PostgreSQL for patient history", "MinIO / S3 for encrypted medical DICOM images"],
      aiMlAlgorithms: ["DenseNet-121 for X-Ray classification", "Grad-CAM visual attribution", "Gemini 3.7 Flash for report synthesis"],
      developmentModules: [
        { name: "Module 1: DICOM & Image Preprocessing Pipeline", description: "Standardizes resolution and anonymizes patient metadata", estHours: 25 },
        { name: "Module 2: Deep Learning Segmentation & Classification", description: "Applies trained convolutional neural networks to detect anomalies", estHours: 40 },
        { name: "Module 3: Clinical Report Generation & LLM Summarizer", description: "Synthesizes diagnostic findings into physician-ready notes", estHours: 30 },
        { name: "Module 4: Secure Web Portal & Heatmap Viewer", description: "Interactive web dashboard with visual overlay sliders", estHours: 35 },
      ],
      systemArchitectureExplanation:
        "Client browser uploads encrypted scans -> FastAPI Gateway validates token -> DICOM preprocessor normalizes input -> Inference worker generates Grad-CAM heatmap -> Gemini LLM drafts clinical notes -> Results stored in Postgres and streamed to frontend.",
      apiSuggestions: [
        { method: "POST", endpoint: "/api/v1/diagnose/scan", purpose: "Uploads medical scan for multi-model inference" },
        { method: "POST", endpoint: "/api/v1/reports/generate", purpose: "Generates structured FHIR clinical report" },
        { method: "GET", endpoint: "/api/v1/patients/:id/history", purpose: "Retrieves diagnostic trajectory over time" },
      ],
      estimatedDevelopmentTime: params.projectDuration || "8 Weeks",
      estimatedCost: "$150 - $400",
      scalabilitySuggestions: ["Deploy GPU inference pods on Kubernetes", "Leverage ONNX model quantization to 8-bit integers", "Store cache of frequent scan patterns"],
      futureEnhancements: ["Federated learning across hospital nodes", "Real-time ultrasound video stream parsing", "Integration with EHR Epic/Cerner"],
      createdAt: new Date().toISOString(),
      type: "generated",
      tags: ["Healthcare", "AI", "Computer Vision"],
    },
    {
      id: `proj_${Date.now()}_2`,
      title: `AgroSense: Autonomous IoT Micro-Climate & Crop Disease Drone Swarm`,
      domain: "Agriculture",
      difficultyScore: 7,
      difficultyLevel: params.difficultyLevel || "Intermediate",
      innovationScore: 9,
      readinessScore: 84,
      problemStatement:
        "Farmers suffer up to 35% crop yield losses due to undetected early-stage fungal outbreaks and inefficient water/fertilizer distribution.",
      description:
        "An end-to-end precision agriculture platform ingesting LoRaWAN soil moisture/temperature telemetry alongside multispectral drone aerial imagery to detect leaf rust, predict irrigation needs, and calculate localized fertilizer dosing.",
      objectives: [
        "Process multispectral NDVI aerial imagery to map crop vigor zones",
        "Stream soil telemetry every 15 minutes using low-power LoRaWAN nodes",
        "Predict fungal outbreak risks 72 hours before visible symptoms",
        "Generate automated variable-rate fertilizer distribution maps",
      ],
      targetUsers: ["Commercial Farmers", "Agronomists", "Agricultural Co-ops", "Government Crop Surveyors"],
      technologiesRequired: ["Python", "FastAPI", "React", "MQTT", "OpenCV", "YOLOv11", "Chart.js"],
      hardwareRequirements: ["Raspberry Pi 4 / ESP32 nodes", "LoRaWAN Gateway", "DJI Multispectral Drone / USB Camera"],
      softwareRequirements: ["Python 3.11", "Mosquitto MQTT Broker", "PostgreSQL / TimescaleDB", "Docker"],
      databaseRequirements: ["TimescaleDB for high-frequency IoT time-series telemetry", "PostGIS for geographic boundary mapping"],
      aiMlAlgorithms: ["YOLOv11 for leaf pest detection", "Random Forest Regressor for soil moisture forecasting", "NDVI vegetative index calculation"],
      developmentModules: [
        { name: "Module 1: IoT Sensor Telemetry & MQTT Broker", description: "Collects sensor packets from field micro-nodes", estHours: 20 },
        { name: "Module 2: Aerial Imagery & NDVI Processing", description: "Stitches drone orthomosaics and computes vegetation index", estHours: 35 },
        { name: "Module 3: Crop Disease Classification Engine", description: "Identifies leaf lesions and fungal spores", estHours: 30 },
        { name: "Module 4: Farm Dashboard & Alert Dispatcher", description: "Interactive map with live alerts via SMS/WhatsApp", estHours: 30 },
      ],
      systemArchitectureExplanation:
        "ESP32 sensors transmit telemetry via LoRa to MQTT Broker -> TimescaleDB logs time-series -> Drone imagery analyzed via YOLO engine -> Backend computes disease probability index -> Dashboard updates map overlays and triggers SMS notifications.",
      apiSuggestions: [
        { method: "POST", endpoint: "/api/v1/telemetry/ingest", purpose: "Receives batch sensor packets from LoRa gateway" },
        { method: "POST", endpoint: "/api/v1/drone/analyze-ortho", purpose: "Uploads orthomosaic imagery for NDVI computation" },
        { method: "GET", endpoint: "/api/v1/farm/:id/risk-map", purpose: "Fetches geo-tagged disease risk heatmaps" },
      ],
      estimatedDevelopmentTime: params.projectDuration || "6 Weeks",
      estimatedCost: "$200 - $500",
      scalabilitySuggestions: ["Use TimescaleDB continuous aggregates", "Partition sensor tables by farm region", "Process drone imagery on asynchronous worker pools"],
      futureEnhancements: ["Autonomous rover path planning", "Carbon credit sequestration quantification", "Satellite Sentinel-2 imagery fusion"],
      createdAt: new Date().toISOString(),
      type: "generated",
      tags: ["Agriculture", "IoT", "Computer Vision"],
    },
    {
      id: `proj_${Date.now()}_3`,
      title: `TrustChain: Decentralized Carbon Credit Verification & Proof-of-Action`,
      domain: "Blockchain",
      difficultyScore: 8,
      difficultyLevel: params.difficultyLevel || "Advanced",
      innovationScore: 9,
      readinessScore: 82,
      problemStatement:
        "Greenwashing and double-counting plague voluntary carbon markets, causing institutional buyers to distrust carbon offset claims.",
      description:
        "A transparent blockchain verification protocol linking satellite imagery deforestation telemetry with ERC-1155 tokenized carbon credits, ensuring every issued token is cryptographically backed by verified sensor and satellite proof-of-action.",
      objectives: [
        "Prevent double-spending of carbon offset claims with immutable on-chain records",
        "Automate satellite verification of forest preservation via AI change detection",
        "Enable fractional carbon credit trading on transparent decentralized marketplace",
        "Provide verifiable QR code audit proofs for enterprise ESG reporting",
      ],
      targetUsers: ["Reforestation Project Owners", "ESG Corporate Auditors", "Carbon Credit Traders", "Environmental NGOs"],
      technologiesRequired: ["Solidity", "Hardhat", "Ethers.js", "Python", "FastAPI", "React", "IPFS / Pinata"],
      hardwareRequirements: ["Standard Dev PC"],
      softwareRequirements: ["Node.js 20", "Python 3.11", "MetaMask", "Hardhat Local Testnet"],
      databaseRequirements: ["IPFS for decentralized audit report storage", "PostgreSQL for indexing on-chain transactions"],
      aiMlAlgorithms: ["Siamese Neural Network for satellite forest change detection", "Random Forest for biomass estimation"],
      developmentModules: [
        { name: "Module 1: Smart Contracts & ERC-1155 Tokenization", description: "Deploys minting and verification contracts", estHours: 35 },
        { name: "Module 2: Satellite AI Verification Oracle", description: "Analyzes Sentinel imagery to confirm forest density", estHours: 40 },
        { name: "Module 3: Web3 Marketplace & Wallet Connect", description: "Interface for purchasing and retiring verified credits", estHours: 30 },
        { name: "Module 4: Enterprise ESG Certificate Generator", description: "Generates cryptographic proof certificates with QR codes", estHours: 20 },
      ],
      systemArchitectureExplanation:
        "Project owner submits coordinates -> AI Oracle evaluates satellite change detection -> If biomass verified, Oracle triggers smart contract minting -> Token metadata pinned to IPFS -> Enterprise buyers purchase and retire credits on-chain.",
      apiSuggestions: [
        { method: "POST", endpoint: "/api/v1/oracle/verify-forest", purpose: "Analyzes polygon coordinates for tree density proof" },
        { method: "GET", endpoint: "/api/v1/credits/marketplace", purpose: "Lists verified carbon credits with IPFS audit links" },
        { method: "POST", endpoint: "/api/v1/credits/retire", purpose: "Generates cryptographic certificate of carbon retirement" },
      ],
      estimatedDevelopmentTime: params.projectDuration || "10 Weeks",
      estimatedCost: "$100 - $300 (Testnet / Gas)",
      scalabilitySuggestions: ["Deploy on Layer 2 Rollups (Polygon / Arbitrum)", "Use Graph Protocol for on-chain query indexing", "Batch minting transactions"],
      futureEnhancements: ["Integration with IoT soil sensors for regenerative agriculture", "Cross-chain liquidity bridge", "Zero-knowledge proof verification"],
      createdAt: new Date().toISOString(),
      type: "generated",
      tags: ["Blockchain", "Web3", "Sustainability"],
    },
    {
      id: `proj_${Date.now()}_4`,
      title: `CityPulse: AI-Driven Dynamic Traffic Flow Optimization & Emergency Corridors`,
      domain: "Smart City",
      difficultyScore: 8,
      difficultyLevel: params.difficultyLevel || "Advanced",
      innovationScore: 9,
      readinessScore: 86,
      problemStatement:
        "Fixed-interval traffic signals cause massive urban congestion, idling emissions, and delay emergency ambulances by up to 12 critical minutes.",
      description:
        "An intelligent urban mobility platform analyzing real-time intersection camera feeds to compute vehicular queue densities, dynamically modulate traffic light phase timings, and clear green-wave emergency corridors for approaching ambulances.",
      objectives: [
        "Reduce intersection idle times by 28% via reinforcement learning signal control",
        "Automatically detect ambulances and clear green-light corridors 500m ahead",
        "Estimate vehicle emissions reductions in real time",
        "Provide interactive city operations dashboard with live queue visualization",
      ],
      targetUsers: ["City Traffic Controllers", "Emergency First Responders", "Urban Planners", "Municipal Governments"],
      technologiesRequired: ["Python", "YOLOv11", "SUMO Traffic Simulator", "FastAPI", "React", "WebSockets", "Chart.js"],
      hardwareRequirements: ["Edge AI Box (NVIDIA Jetson) or RTSP IP Cameras"],
      softwareRequirements: ["Python 3.11", "SUMO Simulation Suite", "Node.js 20", "PostgreSQL / Redis"],
      databaseRequirements: ["Redis for sub-millisecond vehicle queue caching", "PostgreSQL for historical traffic density logs"],
      aiMlAlgorithms: ["YOLOv11 for vehicle counting & classification", "Deep Q-Learning (DQN) for dynamic traffic signal phase switching"],
      developmentModules: [
        { name: "Module 1: Real-Time RTSP Stream Vehicle Counter", description: "Processes camera feeds to count cars, buses, and trucks", estHours: 30 },
        { name: "Module 2: Emergency Vehicle Detection & GPS Tracker", description: "Identifies siren audio and emergency transponders", estHours: 25 },
        { name: "Module 3: Adaptive Signal Control RL Engine", description: "Calculates optimal green-light durations dynamically", estHours: 40 },
        { name: "Module 4: Central Municipal Operations Dashboard", description: "Live map of intersections with manual override controls", estHours: 30 },
      ],
      systemArchitectureExplanation:
        "CCTV feeds analyzed on edge Jetson nodes -> Vehicle counts pushed to Redis over WebSockets -> RL algorithm calculates optimal signal splits -> Control signals dispatched to traffic controllers -> Real-time metrics displayed on operations dashboard.",
      apiSuggestions: [
        { method: "POST", endpoint: "/api/v1/intersections/:id/telemetry", purpose: "Ingests live vehicle counts from edge camera" },
        { method: "POST", endpoint: "/api/v1/emergency/green-corridor", purpose: "Requests priority green wave for ambulance route" },
        { method: "GET", endpoint: "/api/v1/city/traffic-metrics", purpose: "Fetches live congestion index and emissions saved" },
      ],
      estimatedDevelopmentTime: params.projectDuration || "8 Weeks",
      estimatedCost: "$250 - $600",
      scalabilitySuggestions: ["Decentralize signal decisions to edge nodes", "Use Redis Pub/Sub for sub-10ms emergency broadcasts", "Cluster intersections into synchronized zones"],
      futureEnhancements: ["V2X vehicle-to-infrastructure communication", "Pedestrian crowd density anticipation", "Integration with autonomous transit fleets"],
      createdAt: new Date().toISOString(),
      type: "generated",
      tags: ["Smart City", "AI", "Reinforcement Learning"],
    },
    {
      id: `proj_${Date.now()}_5`,
      title: `ZeroTrustGuard: AI Autonomous Cyber Threat Hunting & Zero-Day Sandbox`,
      domain: "Cybersecurity",
      difficultyScore: 9,
      difficultyLevel: params.difficultyLevel || "Advanced",
      innovationScore: 10,
      readinessScore: 87,
      problemStatement:
        "Enterprise security teams are overwhelmed by thousands of false alerts daily while sophisticated zero-day lateral movement attacks evade signature-based firewalls.",
      description:
        "An autonomous cybersecurity defense platform parsing firewall, server, and DNS logs in real time using graph neural networks to reconstruct attack kill-chains, isolate compromised endpoints, and auto-generate firewall mitigation rules.",
      objectives: [
        "Detect abnormal lateral movement and privilege escalation in <3 seconds",
        "Reconstruct full MITRE ATT&CK kill chains on interactive graph visualizations",
        "Automatically isolate compromised Docker containers and microservices",
        "Generate zero-day firewall and eBPF kernel security rules automatically",
      ],
      targetUsers: ["Security Operations Center (SOC) Analysts", "DevSecOps Engineers", "CISO & Security Managers"],
      technologiesRequired: ["Python", "FastAPI", "React", "NetworkX / D3.js", "Docker", "eBPF / Suricata", "Chart.js"],
      hardwareRequirements: ["Standard Multi-core Server / Linux VM"],
      softwareRequirements: ["Python 3.11", "Elasticsearch / OpenSearch", "Redis", "Docker Desktop"],
      databaseRequirements: ["OpenSearch for indexed log streams", "Neo4j / NetworkX for attack graph topological modeling"],
      aiMlAlgorithms: ["Graph Neural Networks (GNN) for entity relationship anomalies", "Isolation Forests for behavioral baseline deviation", "Gemini 3.7 Flash for incident report synthesis"],
      developmentModules: [
        { name: "Module 1: Real-Time Log Parser & Event Ingestion", description: "Ingests Syslog, Zeek, and Auth logs at 10k eps", estHours: 30 },
        { name: "Module 2: Graph Behavioral Anomaly Engine", description: "Maps user-to-server connection topologies in real time", estHours: 45 },
        { name: "Module 3: Automated Containment & eBPF Firewall", description: "Injects kernel-level block rules to stop data exfiltration", estHours: 35 },
        { name: "Module 4: SOC Threat Investigation Command Center", description: "Interactive attack graph visualizer and report exporter", estHours: 35 },
      ],
      systemArchitectureExplanation:
        "Server logs streamed to Ingestion Pipeline -> Graph Anomaly Engine evaluates connection topology -> If anomaly exceeds confidence threshold, eBPF module drops malicious traffic -> Gemini synthesizes SOC incident brief -> Live alert pushed to web dashboard.",
      apiSuggestions: [
        { method: "POST", endpoint: "/api/v1/logs/stream", purpose: "Ingests batch server security event logs" },
        { method: "GET", endpoint: "/api/v1/threats/active-graph", purpose: "Returns MITRE ATT&CK node graph data" },
        { method: "POST", endpoint: "/api/v1/containment/isolate-node", purpose: "Executes automated network isolation on host" },
      ],
      estimatedDevelopmentTime: params.projectDuration || "10 Weeks",
      estimatedCost: "$200 - $500",
      scalabilitySuggestions: ["Deploy Kafka for high-throughput log ingestion", "Partition OpenSearch clusters by date", "Execute graph queries in parallel worker nodes"],
      futureEnhancements: ["Autonomous deception honeypots generation", "Hardware memory tampering detection", "Cloud IAM policy auto-remediation"],
      createdAt: new Date().toISOString(),
      type: "generated",
      tags: ["Cybersecurity", "AI", "Graph Analytics"],
    },
  ];
}
