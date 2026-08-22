# AI Innovation Lab 🚀

**AI Innovation Lab** is a next-generation platform for students, developers, researchers, and tech architects to generate, analyze, evaluate, and plan cutting-edge software, IoT, Machine Learning, Blockchain, and AI projects.

---

## 🌟 Key Features

1. **AI Project Idea Generator**: Generates 5 unique, deeply structured projects with objectives, tech stacks, hardware/software specs, AI/ML algorithms, architecture explanations, and API suggestions.
2. **AI Project Evaluator**: Multi-criteria evaluation calculating Innovation, Feasibility, Usefulness, Scalability, Complexity, Security, and an overall **Project Readiness Score (0-100)** with interactive Radar charts.
3. **AI Feature Recommender**: Suggests advanced capabilities (Agentic AI, RAG Chatbot, Voice Control, IoT Sensors, Computer Vision, Real-time WebSockets, Blockchain Audit) with 1-click addition to project plans.
4. **AI System Architecture Visualizer**: Generates a structured 6-layer architecture (Frontend → Backend → REST APIs → AI/ML Engine → Database → IoT/External Services) with interactive visual layer breakdowns and data flow descriptions.
5. **Interactive 8-Phase Development Roadmap**: Step-by-step milestone tracker (Requirements → Deployment) with task checklists, completion percentages, priority tags, and duration estimates.
6. **AI Tech Stack Advisor**: Intelligent advisory system recommending optimal frontend, backend, database, AI/ML libraries, cloud, auth, and CI/CD with explicit rationale.
7. **Project Comparison Matrix**: Side-by-side radar and bar chart comparison of innovation, difficulty, readiness, duration, and scalability across projects.
8. **Project History & Search Engine**: Full project library with real-time domain filtering, difficulty level filtering, keyword search, and JSON export.
9. **Executive Analytics Dashboard**: High-level KPI metrics and interactive Chart.js graphs showing domain distributions, readiness tiers, tech popularity, and recent projects.

---

## 🛠️ Technology Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS, Chart.js, React-Chartjs-2, Lucide React, Motion
- **Backend & REST APIs**: Node.js & Express (with Python Flask compatibility specification)
- **AI Engine**: Google Gemini 3.7 Flash via `@google/genai` SDK
- **Database & Storage**: Persistent SQLite/JSON Database Engine with ACID-compliant operations
- **Build System**: Vite 6, tsx, esbuild

---

## 🚀 Getting Started

### Prerequisites

- Node.js 20+ installed
- Google Gemini API key (automatically configured in Google AI Studio or added to `.env`)

### Installation & Run

1. Clone or open the repository.
2. Copy environment file:
   ```bash
   cp .env.example .env
   ```
3. Add your Gemini API key in `.env`:
   ```env
   GEMINI_API_KEY="your_api_key_here"
   ```
4. Install dependencies:
   ```bash
   npm install
   ```
5. Start development server:
   ```bash
   npm run dev
   ```
6. Open your browser at `http://localhost:3000`.

---

## 📡 REST API Architecture

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/projects/generate` | Generates 5 unique AI-tailored project blueprints |
| `POST` | `/api/projects/evaluate` | Evaluates a project idea across 6 criteria + readiness score |
| `POST` | `/api/projects/recommend-features` | Generates advanced feature enhancements |
| `POST` | `/api/projects/architecture` | Generates 6-layer system architecture breakdown |
| `POST` | `/api/projects/roadmap` | Generates 8-phase actionable development roadmap |
| `POST` | `/api/projects/tech-stack` | Produces expert tech stack recommendations & reasoning |
| `GET` | `/api/projects` | Lists all projects with search & filtering |
| `GET` | `/api/projects/:id` | Retrieves single project details |
| `POST` | `/api/projects` | Saves a new project |
| `PUT` | `/api/projects/:id` | Updates an existing project |
| `DELETE` | `/api/projects/:id` | Deletes a project |
| `POST` | `/api/projects/:id/roadmap/toggle` | Toggles roadmap task completion status |
| `POST` | `/api/projects/:id/features/add` | Adds recommended feature into project plan |
| `GET` | `/api/dashboard/stats` | Fetches aggregate analytics for Chart.js dashboard |
| `POST` | `/api/projects/seed` | Seeds benchmark innovative projects |
