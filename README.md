# LevelUp / Pathfinder AI

Hackathon starter for an action-oriented AI career engine built with React and FastAPI.

## Prerequisites

- Node.js 20+
- Python 3.13+

## Backend

```bash
cd backend
python3.13 -m venv .venv
source .venv/bin/activate
python -c "import sys; raise SystemExit('Python 3.13+ is required') if sys.version_info < (3, 13) else None"
python -m pip install --upgrade pip
python -m pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --reload --reload-dir app --port 8000
```

Add your OpenAI key to `backend/.env` before calling AI endpoints.

Health check: http://localhost:8000/health
Dashboard API: http://localhost:8000/api/dashboard
Chat API: http://localhost:8000/api/chat
CV text extraction API: http://localhost:8000/api/cv/extract-text

Example chat request:

```json
{
  "message": "What should I do next?",
  "context": {
    "target_role": "Junior Backend Engineer",
    "skills": ["Python", "FastAPI"]
  }
}
```

Example chat response:

```json
{
  "reply": "Human-readable combined answer.",
  "model": "gpt-5.4-mini",
  "summary": "One sentence directly answering the user.",
  "next_action": "Exactly one concrete action.",
  "reason": "Why this action is the best next step.",
  "follow_up_question": null
}
```

Example CV text extraction request:

```bash
curl -X POST http://localhost:8000/api/cv/extract-text \
  -F "file=@/path/to/cv.pdf"
```

Example CV text extraction response:

```json
{
  "filename": "cv.pdf",
  "text": "Raw extracted text from the PDF...",
  "page_count": 2
}
```

## Frontend

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

App: http://localhost:5173

Set the backend URL in `frontend/.env`:

```env
VITE_API_BASE_URL=http://localhost:8000
```

## Root Scripts

After dependencies are installed:

```bash
npm run dev
npm run dev:backend
npm run dev:frontend
npm run build
```

## Project Shape

- `frontend/`: React + TypeScript + Vite client.
- `backend/`: FastAPI service for parsing, AI orchestration, roadmap generation, and progress state.

# IDEA

## Overview

AI Buddy is an AI-powered career guidance and planning platform designed to help students discover their strengths, understand their career direction, and build a realistic path toward their goals.

Instead of providing generic advice, AI Buddy acts as a personalized career companion that deeply understands each student and generates adaptive execution roadmaps tailored to their unique situation.

---

# Vision

Help students move from confusion and uncertainty to clarity, confidence, and actionable direction.

AI Buddy aims to become:
- a mentor
- a strategist
- a planning assistant
- an accountability partner
- a long-term career companion

---

# Problem Statement

Many students struggle with:
- unclear career direction
- information overload
- lack of mentorship
- unrealistic expectations
- poor planning
- lack of consistency
- uncertainty about their strengths and weaknesses

Most existing platforms provide generic recommendations rather than personalized guidance.

AI Buddy solves this by building a deep understanding of the student before generating a career roadmap.

---

# Core Concept

The platform first learns about the student:
- who they are
- what they want
- what they already have
- what they are missing
- their strengths
- their weaknesses
- their learning style
- their constraints

Then AI Buddy generates:
- career recommendations
- gap analysis
- personalized learning plans
- milestone tracking
- adaptive progress adjustments

---

# Target Audience

## Primary Audience
- High school students
- University students
- Fresh graduates
- Career switchers

## Secondary Audience
- Parents
- Career coaches
- Educational institutions

---

# Key Features

## 1. AI Discovery Session

The AI asks adaptive questions to deeply understand the student.

### Information Collected
- education background
- current skills
- career interests
- strengths
- weaknesses
- available resources
- financial constraints
- personality type
- learning style
- long-term goals

---

## 2. Career Match Analysis

AI Buddy analyzes:
- interests
- strengths
- personality
- learning behavior

Then recommends suitable career paths.

### Example
- iOS Developer
- Product Designer
- Data Analyst
- AI Engineer
- UI/UX Designer
- Product Manager

---

## 3. Gap Analysis

The system identifies missing skills between:
- current state
- desired career goal

### Example
Goal: Become an iOS Developer

Missing:
- Swift fundamentals
- Git/GitHub
- portfolio projects
- networking knowledge
- interview preparation

---

## 4. Personalized Roadmap

AI Buddy generates a structured roadmap.

### Example

#### Phase 1 — Foundation
- Learn Swift basics
- Build mini projects
- Practice daily coding

#### Phase 2 — Portfolio
- Build production-level app
- Create GitHub portfolio
- Learn Firebase integration

#### Phase 3 — Career Preparation
- Resume creation
- LinkedIn optimization
- Mock interviews
- Job applications

---

## 5. Adaptive Planning

Roadmaps are dynamic and adjustable.

The AI adapts based on:
- progress
- missed goals
- burnout
- schedule changes
- motivation level

### Example
"You missed several weekly goals. Let's reduce workload and focus on smaller milestones."

---

## 6. Weekly Missions

Instead of overwhelming users with large goals, AI Buddy creates:
- weekly tasks
- daily objectives
- progress checkpoints
- streak systems

---

## 7. Skill Tracking Dashboard

Visual representation of:
- current skill levels
- missing competencies
- progress over time
- roadmap completion

---

## 8. AI Career Simulation

Students can explore realistic career insights:
- day in the life
- expected salary progression
- work environment
- required technical skills
- growth opportunities

---

## 9. Portfolio & Resume Assistant

AI Buddy helps students:
- generate project ideas
- improve resumes
- optimize LinkedIn profiles
- review GitHub repositories
- prepare for interviews

---

# User Journey

## Step 1 — Onboarding
Student creates profile.

## Step 2 — Discovery Session
AI asks personalized questions.

## Step 3 — Career Direction
AI suggests suitable career paths.

## Step 4 — Goal Selection
Student selects target direction.

## Step 5 — Roadmap Generation
AI creates personalized execution plan.

## Step 6 — Weekly Progress
Student tracks progress and receives adaptive guidance.

---

# Product Philosophy

AI Buddy is not just a chatbot.

It is designed to feel like:
- a mentor
- a strategic planner
- an accountability partner
- a supportive career coach

The focus is execution, not just inspiration.

---

# MVP Scope

## Initial MVP Features
- onboarding questionnaire
- AI profile analysis
- career recommendation engine
- roadmap generation
- weekly progress tracking

---

# Future Expansion

## Potential Future Features
- mentor marketplace
- internship matching
- AI interview simulation
- university recommendation system
- collaborative study groups
- AI-powered portfolio reviews
- scholarship recommendations
- AI emotional support companion

---

# Technical Direction

## Frontend
- SwiftUI (iOS)
- Next.js / React (Web)

## Backend
- Firebase
- Supabase
- Node.js

## AI Layer
- OpenAI APIs
- Vector embeddings
- recommendation engine
- memory system

---

# Monetization

## Free Tier
- basic roadmap generation
- limited AI conversations

## Premium Tier
- unlimited AI mentorship
- advanced roadmap customization
- interview preparation
- portfolio analysis
- personalized career simulations

---

# Brand Positioning

## Tagline Ideas

### Option 1
"Your AI career mentor."

### Option 2
"From confusion to clear direction."

### Option 3
"Personalized career roadmaps powered by AI."

### Option 4
"Discover your path. Build your future."

---

# Competitive Advantage

The core differentiation is personalization.

Most platforms provide:
- generic advice
- static roadmaps
- broad recommendations

AI Buddy provides:
- deep understanding
- adaptive planning
- realistic execution systems
- long-term personalized guidance

---

# Success Metrics

## User Metrics
- onboarding completion rate
- weekly active users
- roadmap completion rate
- retention rate
- user satisfaction score

## Outcome Metrics
- internships obtained
- portfolio completion
- job placement
- skill progression
- goal achievement rate

---

# Final Summary

AI Buddy is an AI-powered career companion that helps students:
- understand themselves
- discover suitable career paths
- identify skill gaps
- create actionable plans
- stay accountable
- continuously adapt and improve

The mission is to transform uncertainty into structured progress and help students confidently move toward their future careers.
