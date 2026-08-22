import fs from "fs";
import path from "path";
import { Project, DashboardStats, RecommendedFeature } from "../src/types.js";

const DB_DIR = path.join(process.cwd(), "database");
const DB_FILE = path.join(DB_DIR, "projects_db.json");

/**
 * Ensure database directory and file exist
 */
function initDB(): void {
  if (!fs.existsSync(DB_DIR)) {
    fs.mkdirSync(DB_DIR, { recursive: true });
  }
  if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify([], null, 2), "utf-8");
  }
}

/**
 * Read all projects from storage
 */
export function readProjects(): Project[] {
  initDB();
  try {
    const raw = fs.readFileSync(DB_FILE, "utf-8");
    const data = JSON.parse(raw);
    if (Array.isArray(data)) {
      return data;
    }
    return [];
  } catch (err) {
    console.error("Error reading database file:", err);
    return [];
  }
}

/**
 * Write all projects to storage
 */
export function writeProjects(projects: Project[]): void {
  initDB();
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(projects, null, 2), "utf-8");
  } catch (err) {
    console.error("Error writing database file:", err);
  }
}

/**
 * Get project by ID
 */
export function getProjectById(id: string): Project | null {
  const projects = readProjects();
  return projects.find((p) => p.id === id) || null;
}

/**
 * Save a new project or insert multiple
 */
export function saveProject(project: Project): Project {
  const projects = readProjects();
  const existingIndex = projects.findIndex((p) => p.id === project.id);
  if (existingIndex >= 0) {
    projects[existingIndex] = { ...projects[existingIndex], ...project };
  } else {
    projects.unshift(project);
  }
  writeProjects(projects);
  return project;
}

/**
 * Save multiple projects in batch
 */
export function saveProjectsBatch(newProjects: Project[]): Project[] {
  const projects = readProjects();
  for (const np of newProjects) {
    const existingIndex = projects.findIndex((p) => p.id === np.id);
    if (existingIndex >= 0) {
      projects[existingIndex] = { ...projects[existingIndex], ...np };
    } else {
      projects.unshift(np);
    }
  }
  writeProjects(projects);
  return newProjects;
}

/**
 * Update project by ID
 */
export function updateProject(id: string, updates: Partial<Project>): Project | null {
  const projects = readProjects();
  const index = projects.findIndex((p) => p.id === id);
  if (index === -1) return null;

  projects[index] = {
    ...projects[index],
    ...updates,
  };
  writeProjects(projects);
  return projects[index];
}

/**
 * Delete project by ID
 */
export function deleteProject(id: string): boolean {
  const projects = readProjects();
  const filtered = projects.filter((p) => p.id !== id);
  if (filtered.length !== projects.length) {
    writeProjects(filtered);
    return true;
  }
  return false;
}

/**
 * Filter projects by domain, difficulty, search query, type
 */
export function queryProjects(filters: {
  domain?: string;
  difficultyLevel?: string;
  type?: string;
  search?: string;
}): Project[] {
  let projects = readProjects();

  if (filters.domain && filters.domain !== "All") {
    projects = projects.filter(
      (p) => p.domain.toLowerCase() === filters.domain?.toLowerCase()
    );
  }

  if (filters.difficultyLevel && filters.difficultyLevel !== "All") {
    projects = projects.filter(
      (p) => p.difficultyLevel?.toLowerCase() === filters.difficultyLevel?.toLowerCase()
    );
  }

  if (filters.type && filters.type !== "All") {
    projects = projects.filter((p) => p.type === filters.type);
  }

  if (filters.search) {
    const q = filters.search.toLowerCase();
    projects = projects.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.domain.toLowerCase().includes(q) ||
        p.technologiesRequired.some((t) => t.toLowerCase().includes(q))
    );
  }

  return projects;
}

/**
 * Toggle roadmap task completion
 */
export function toggleRoadmapTask(
  projectId: string,
  taskId: string
): { project: Project; taskCompleted: boolean } | null {
  const project = getProjectById(projectId);
  if (!project || !project.roadmap) return null;

  let toggled = false;
  let newStatus = false;

  for (const phase of project.roadmap) {
    for (const task of phase.tasks) {
      if (task.id === taskId) {
        task.completed = !task.completed;
        newStatus = task.completed;
        toggled = true;
        break;
      }
    }
    if (toggled) break;
  }

  if (toggled) {
    updateProject(projectId, { roadmap: project.roadmap });
    return { project, taskCompleted: newStatus };
  }

  return null;
}

/**
 * Add a recommended feature to project
 */
export function addFeatureToProject(
  projectId: string,
  feature: RecommendedFeature
): Project | null {
  const project = getProjectById(projectId);
  if (!project) return null;

  const currentFeatures = project.recommendedFeatures || [];
  const existingIdx = currentFeatures.findIndex((f) => f.id === feature.id || f.title === feature.title);

  if (existingIdx >= 0) {
    currentFeatures[existingIdx].isAdded = true;
  } else {
    currentFeatures.push({ ...feature, isAdded: true });
  }

  // Also append to project technologies or objectives if beneficial
  const updatedTech = Array.from(
    new Set([...project.technologiesRequired, ...(feature.recommendedTech || [])])
  );

  return updateProject(projectId, {
    recommendedFeatures: currentFeatures,
    technologiesRequired: updatedTech,
  });
}

/**
 * Get aggregated dashboard statistics
 */
export function getDashboardStats(): DashboardStats {
  const projects = readProjects();

  const totalGenerated = projects.filter((p) => p.type === "generated").length;
  const totalEvaluated = projects.filter((p) => p.type === "evaluated").length;

  let totalInnovation = 0;
  let totalReadiness = 0;
  let readinessCount = 0;

  const domainCounts: Record<string, number> = {};
  const difficultyDistribution: Record<string, number> = {
    Beginner: 0,
    Intermediate: 0,
    Advanced: 0,
  };
  const techFrequency: Record<string, number> = {};

  for (const p of projects) {
    totalInnovation += p.innovationScore || 8;
    if (typeof p.readinessScore === "number" && p.readinessScore > 0) {
      totalReadiness += p.readinessScore;
      readinessCount++;
    } else if (p.evaluation?.overallReadinessScore) {
      totalReadiness += p.evaluation.overallReadinessScore;
      readinessCount++;
    }

    // Domain counts
    domainCounts[p.domain] = (domainCounts[p.domain] || 0) + 1;

    // Difficulty
    if (p.difficultyLevel) {
      difficultyDistribution[p.difficultyLevel] =
        (difficultyDistribution[p.difficultyLevel] || 0) + 1;
    }

    // Technologies
    for (const tech of p.technologiesRequired || []) {
      const cleanTech = tech.trim();
      if (cleanTech) {
        techFrequency[cleanTech] = (techFrequency[cleanTech] || 0) + 1;
      }
    }
  }

  const avgInnovationScore =
    projects.length > 0 ? +(totalInnovation / projects.length).toFixed(1) : 8.5;
  const avgReadinessScore =
    readinessCount > 0 ? Math.round(totalReadiness / readinessCount) : 84;

  // Find most frequent tech
  let mostSelectedTech = "Python / PyTorch";
  let maxTechCount = 0;
  for (const [t, c] of Object.entries(techFrequency)) {
    if (c > maxTechCount) {
      maxTechCount = c;
      mostSelectedTech = t;
    }
  }

  // Find most popular domain
  let mostPopularDomain = "Artificial Intelligence";
  let maxDomainCount = 0;
  for (const [d, c] of Object.entries(domainCounts)) {
    if (c > maxDomainCount) {
      maxDomainCount = c;
      mostPopularDomain = d;
    }
  }

  // Readiness ranges
  const readinessRanges = [
    { range: "90-100% (High Readiness)", count: 0 },
    { range: "75-89% (Good Viability)", count: 0 },
    { range: "60-74% (Moderate Work)", count: 0 },
    { range: "<60% (Needs Scoping)", count: 0 },
  ];

  for (const p of projects) {
    const score = p.readinessScore || p.evaluation?.overallReadinessScore || 80;
    if (score >= 90) readinessRanges[0].count++;
    else if (score >= 75) readinessRanges[1].count++;
    else if (score >= 60) readinessRanges[2].count++;
    else readinessRanges[3].count++;
  }

  return {
    totalGenerated: totalGenerated || projects.length,
    totalEvaluated: totalEvaluated || Math.max(1, Math.floor(projects.length / 2)),
    avgInnovationScore,
    avgReadinessScore,
    mostSelectedTech,
    mostPopularDomain,
    domainCounts,
    difficultyDistribution,
    readinessRanges,
    recentProjects: projects.slice(0, 6),
  };
}

/**
 * Seed initial benchmark projects if empty
 */
export function seedInitialDataIfEmpty(): void {
  const existing = readProjects();
  if (existing.length > 0) return;

  const sampleProjects: Project[] = [
    {
      id: "proj_benchmark_1",
      title: "MedVision AI: Multi-Modal Pathology & Radiology Diagnostics",
      domain: "Healthcare",
      difficultyScore: 9,
      difficultyLevel: "Advanced",
      innovationScore: 9.5,
      readinessScore: 88,
      problemStatement:
        "High rates of diagnostic radiology backlog in regional hospitals lead to critical delays in detecting early pulmonary nodules and retinal micro-aneurysms.",
      description:
        "An AI-powered clinical assistant combining medical image segmentation with patient symptom analysis using multimodal LLMs to generate ranked differential diagnoses and clinical report drafts.",
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
      estimatedDevelopmentTime: "8 Weeks",
      estimatedCost: "$150 - $400",
      scalabilitySuggestions: ["Deploy GPU inference pods on Kubernetes", "Leverage ONNX model quantization to 8-bit integers", "Store cache of frequent scan patterns"],
      futureEnhancements: ["Federated learning across hospital nodes", "Real-time ultrasound video stream parsing", "Integration with EHR Epic/Cerner"],
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
      type: "generated",
      tags: ["Healthcare", "AI", "Computer Vision"],
    },
    {
      id: "proj_benchmark_2",
      title: "AgroBot: IoT Micro-Climate & Crop Disease Autonomous Rover",
      domain: "Agriculture",
      difficultyScore: 7,
      difficultyLevel: "Intermediate",
      innovationScore: 8.8,
      readinessScore: 85,
      problemStatement:
        "Excessive pesticide spraying and delayed detection of root fungi destroy up to 30% of greenhouse tomato and strawberry yields.",
      description:
        "An autonomous micro-rover and LoRa sensor network monitoring soil moisture, ambient humidity, and leaf spectral health to spot diseases early and spray targeted biological micro-doses.",
      objectives: [
        "Detect powdery mildew and leaf rust using edge camera on mobile rover",
        "Stream soil NPK telemetry every 15 minutes over LoRaWAN",
        "Cut chemical pesticide usage by 60% through targeted spot application",
      ],
      targetUsers: ["Greenhouse Operators", "Agronomists", "Sustainable Farming Co-ops"],
      technologiesRequired: ["Python", "OpenCV", "YOLOv11", "ESP32", "MQTT", "React", "FastAPI"],
      hardwareRequirements: ["Raspberry Pi 4 / ESP32 Microcontroller", "LoRa Gateway", "Soil NPK Sensors"],
      softwareRequirements: ["Python 3.11", "Mosquitto MQTT Broker", "PostgreSQL / TimescaleDB"],
      databaseRequirements: ["TimescaleDB for IoT telemetry time-series", "PostGIS for greenhouse plot mapping"],
      aiMlAlgorithms: ["YOLOv11 for leaf lesion segmentation", "Gradient Boosting for moisture dry-down forecasting"],
      developmentModules: [
        { name: "Telemetry Ingestion", description: "MQTT broker and time-series parser", estHours: 20 },
        { name: "Edge Vision Engine", description: "On-device camera classification", estHours: 35 },
        { name: "Farmer Command Portal", description: "Live map and mobile responsive dashboard", estHours: 30 },
      ],
      systemArchitectureExplanation:
        "Sensors -> LoRa Gateway -> MQTT Broker -> TimescaleDB -> Anomaly Detector -> Farmer Alerts Dashboard.",
      apiSuggestions: [
        { method: "POST", endpoint: "/api/v1/telemetry", purpose: "Ingests sensor data" },
        { method: "GET", endpoint: "/api/v1/field/status", purpose: "Fetches live sensor metrics" },
      ],
      estimatedDevelopmentTime: "6 Weeks",
      estimatedCost: "$200 - $450",
      scalabilitySuggestions: ["Batch MQTT transmissions", "Deploy edge processing to reduce cloud bandwidth"],
      futureEnhancements: ["Solar panel autonomous recharging dock", "Multi-spectral drone fleet sync"],
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4).toISOString(),
      type: "generated",
      tags: ["Agriculture", "IoT", "Robotics"],
    },
    {
      id: "proj_benchmark_3",
      title: "ZeroTrustGuard: Graph Neural Network SOC Threat Hunter",
      domain: "Cybersecurity",
      difficultyScore: 9,
      difficultyLevel: "Advanced",
      innovationScore: 9.7,
      readinessScore: 91,
      problemStatement:
        "Traditional signature firewalls miss stealthy lateral movement in distributed microservice clouds, resulting in undetected data exfiltration.",
      description:
        "An autonomous cybersecurity defense platform parsing firewall, server, and DNS logs in real time using graph neural networks to reconstruct attack kill-chains and auto-isolate compromised nodes.",
      objectives: [
        "Detect abnormal lateral movement and privilege escalation in <3 seconds",
        "Reconstruct full MITRE ATT&CK kill chains on interactive graph visualizers",
        "Auto-generate eBPF firewall kernel rules for immediate containment",
      ],
      targetUsers: ["SOC Analysts", "DevSecOps Engineers", "CISO & Security Teams"],
      technologiesRequired: ["Python", "FastAPI", "React", "eBPF", "Docker", "D3.js", "Chart.js"],
      hardwareRequirements: ["Linux Multi-core Server with eBPF support"],
      softwareRequirements: ["Python 3.11", "Elasticsearch / OpenSearch", "Redis", "Docker"],
      databaseRequirements: ["OpenSearch for log indexes", "Graph Database for entity connections"],
      aiMlAlgorithms: ["Graph Neural Networks (GNN)", "Isolation Forests for anomaly detection", "Gemini 3.7 Flash for incident reporting"],
      developmentModules: [
        { name: "Log Stream Ingestion", description: "Parses Syslog and NetFlow at 10k eps", estHours: 30 },
        { name: "Graph Behavioral Engine", description: "Builds live topology graph of active connections", estHours: 45 },
        { name: "Automated Containment", description: "Injects kernel-level block rules", estHours: 35 },
      ],
      systemArchitectureExplanation:
        "eBPF hooks -> Log Stream -> Graph Anomaly Engine -> Automated Containment Controller -> SOC React UI.",
      apiSuggestions: [
        { method: "POST", endpoint: "/api/v1/logs", purpose: "Ingests security events" },
        { method: "GET", endpoint: "/api/v1/threats/active", purpose: "Retrieves active threat graph" },
      ],
      estimatedDevelopmentTime: "10 Weeks",
      estimatedCost: "$250 - $600",
      scalabilitySuggestions: ["Use Kafka for partitioned log streams", "Run distributed graph workers"],
      futureEnhancements: ["Autonomous honeypot deployment", "Cloud IAM auto-remediation"],
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 6).toISOString(),
      type: "evaluated",
      tags: ["Cybersecurity", "AI", "Graph Analytics"],
    },
    {
      id: "proj_benchmark_4",
      title: "VeriChain: Satellite-Verified Tokenized Carbon Offsets",
      domain: "Blockchain",
      difficultyScore: 8,
      difficultyLevel: "Advanced",
      innovationScore: 9.1,
      readinessScore: 84,
      problemStatement:
        "Double counting and greenwashing make institutional investors distrust traditional carbon offset registries.",
      description:
        "A transparent blockchain verification protocol linking satellite imagery deforestation telemetry with ERC-1155 tokenized carbon credits, ensuring every issued token is cryptographically backed by verified sensor and satellite proof-of-action.",
      objectives: [
        "Prevent double-spending of carbon offset claims with immutable on-chain records",
        "Automate satellite verification of forest preservation via AI change detection",
        "Provide verifiable QR code audit proofs for enterprise ESG reporting",
      ],
      targetUsers: ["Reforestation Project Owners", "ESG Auditors", "Carbon Traders"],
      technologiesRequired: ["Solidity", "Hardhat", "Ethers.js", "Python", "FastAPI", "React", "IPFS"],
      hardwareRequirements: ["Standard Dev Workstation"],
      softwareRequirements: ["Node.js 20", "Python 3.11", "MetaMask", "Hardhat Local Testnet"],
      databaseRequirements: ["IPFS for decentralized audit reports", "PostgreSQL for indexed transactions"],
      aiMlAlgorithms: ["Siamese Neural Network for satellite forest change detection"],
      developmentModules: [
        { name: "Smart Contracts & ERC-1155", description: "Deploys minting and retirement contracts", estHours: 35 },
        { name: "Satellite AI Oracle", description: "Analyzes Sentinel-2 imagery for biomass verification", estHours: 40 },
        { name: "ESG Marketplace & Certificate Generator", description: "Web3 trading interface", estHours: 30 },
      ],
      systemArchitectureExplanation:
        "Satellite Imagery -> AI Verification Oracle -> Smart Contract Minting -> IPFS Audit Storing -> React Web3 Marketplace.",
      apiSuggestions: [
        { method: "POST", endpoint: "/api/v1/oracle/verify", purpose: "Runs satellite tree density check" },
        { method: "GET", endpoint: "/api/v1/credits", purpose: "Lists verified credits" },
      ],
      estimatedDevelopmentTime: "8 Weeks",
      estimatedCost: "$120 - $300",
      scalabilitySuggestions: ["Deploy on Layer-2 Polygon rollups", "Batch on-chain mints"],
      futureEnhancements: ["Integration with soil IoT sensors", "Cross-chain bridge"],
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(),
      type: "evaluated",
      tags: ["Blockchain", "Web3", "Sustainability"],
    },
  ];

  writeProjects(sampleProjects);
}

// Initialize seed on startup
initDB();
seedInitialDataIfEmpty();
