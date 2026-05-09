# LevelUp AI

LevelUp AI helps students and early-career candidates turn an unclear career goal into a concrete execution plan.

The product starts with a CV, asks a short role-specific micro-interview, measures skill fit, finds relevant jobs, and generates a personalized roadmap with learning actions. On the roadmap, users can open task-level free YouTube course suggestions powered by TinyFish search and AI summaries.

The core idea is simple: students do not need more generic advice. They need a system that understands where they are, shows what is missing, and gives them the next practical step.

## Why It Exists

Students often know they should "build projects", "improve their CV", or "prepare for interviews", but those instructions are too broad to act on. LevelUp narrows the problem:

- What role are you aiming for?
- What does your CV already prove?
- What soft-skill signals show up in your interview answers?
- Which jobs match your current profile?
- What should you learn or build next?

Instead of handing users a static checklist, LevelUp creates a roadmap from their actual profile and keeps the plan tied to job readiness.

## Product Flow

1. Upload a CV
   The backend extracts text from a PDF and uses it as career evidence.

2. Complete a micro-interview
   The app asks role-specific soft-skill questions and scores answers with STAR-style signals.

3. Review skill match
   Users see how their answers map to the target role and can search matching job positions.

4. Generate a personalized roadmap
   The AI creates phases, tasks, estimated timing, dependencies, and career-prep actions.

5. Learn from free resources
   Each roadmap task can request 3 to 5 free YouTube course suggestions using TinyFish search, then AI summarizes why each link is relevant.

## What It Does Today

- CV PDF text extraction
- AI chat assistant endpoint
- AI-generated micro-interview questions
- Soft-skill match scoring
- Job search using TinyFish and structured AI extraction
- Detailed roadmap generation and persistence
- Roadmap graph view
- Free YouTube course suggestions for roadmap tasks
- Subscription and landing pages for the product shell

## Architecture

```text
frontend/
  React + TypeScript + Vite app
  Assessment flow, roadmap graph, landing page, subscription page

backend/
  FastAPI service
  CV parsing, AI orchestration, job search, course search, roadmap storage
```

The backend uses:

- FastAPI for API routes
- OpenAI for structured reasoning and summaries
- TinyFish Search API for job and YouTube discovery
- SQLite for saved roadmap state
- pypdf for CV text extraction

The frontend uses:

- React
- TypeScript
- Vite
- lucide-react icons

## Prerequisites

- Node.js 20+
- Python 3.13+
- An OpenAI API key for AI endpoints

## Setup

Install root tooling:

```bash
npm install
```

Set up the backend:

```bash
cd backend
python3.13 -m venv .venv
source .venv/bin/activate
python -m pip install --upgrade pip
python -m pip install -r requirements.txt
cp .env.example .env
```

Add your OpenAI key to `backend/.env`:

```env
OPENAI_API_KEY=your_key_here
```

Set up the frontend:

```bash
cd frontend
npm install
cp .env.example .env
```

Use the local backend URL in `frontend/.env`:

```env
VITE_API_BASE_URL=http://localhost:8000
```

## Run Locally

From the repo root:

```bash
npm run dev
```

Or run each side separately:

```bash
npm run dev:backend
npm run dev:frontend
```

Default URLs:

- Frontend: http://localhost:5173
- Backend: http://localhost:8000
- Health check: http://localhost:8000/health

## Useful API Endpoints

```text
GET  /health
GET  /api/dashboard
POST /api/chat
POST /api/cv/extract-text
GET  /api/onboard-soft-skills/micro-interview
POST /api/jobs/search
POST /api/roadmaps/generate
GET  /api/roadmaps/latest
POST /api/courses/search
```

Example CV extraction:

```bash
curl -X POST http://localhost:8000/api/cv/extract-text \
  -F "file=@/path/to/cv.pdf"
```

Example course search:

```bash
curl -X POST http://localhost:8000/api/courses/search \
  -H "Content-Type: application/json" \
  -d '{
    "keyword": "Build a simple app or feature in Kotlin or Flutter",
    "target_role": "Software Engineer"
  }'
```

## Build

```bash
npm run build
```

This runs the frontend TypeScript and Vite production build.

## Product Philosophy

LevelUp is not trying to be a general chatbot. It is designed to feel like a career operating system for students:

- diagnostic enough to understand the user
- practical enough to create next actions
- adaptive enough to change as the user progresses
- grounded enough to connect learning tasks to real jobs

The focus is execution, not inspiration.

## Roadmap Ideas

- Progress tracking for roadmap tasks
- Calendar-style weekly missions
- Better saved roadmap history
- Interview simulation with feedback
- Portfolio and GitHub review
- Mentor or coach handoff
- Scholarship and internship discovery
- More localized job-market intelligence

## Success Metrics

- Onboarding completion rate
- Roadmap generation rate
- Weekly active users
- Course suggestion click-through
- Portfolio completion
- Internship or job outcomes
- User confidence before and after onboarding

## One-Sentence Summary

LevelUp AI turns a student's CV, goals, and interview signals into a personalized career roadmap with job matches and free learning resources.
