# LevelUp / Pathfinder AI

Hackathon starter for an action-oriented AI career engine built with React and FastAPI.

## Prerequisites

- Node.js 20+
- Python 3.11+

## Backend

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --reload-dir app --port 8000
```

Health check: http://localhost:8000/health
Dashboard API: http://localhost:8000/api/dashboard

## Frontend

```bash
cd frontend
npm install
npm run dev
```

App: http://localhost:5173

## Root Scripts

After dependencies are installed:

```bash
npm run dev:backend
npm run dev:frontend
npm run build
```

## Project Shape

- `frontend/`: React + TypeScript + Vite client.
- `backend/`: FastAPI service for parsing, AI orchestration, roadmap generation, and progress state.
