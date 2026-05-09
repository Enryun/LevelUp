from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.schemas import Dashboard, RoadmapNode


app = FastAPI(title=settings.app_name)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.frontend_origin],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.get("/api/dashboard", response_model=Dashboard)
def dashboard() -> Dashboard:
    return Dashboard(
        target_role="Junior Software Engineer",
        readiness_score=65,
        next_action="Write a pull request description for your latest project and explain the tradeoffs.",
        roadmap=[
            RoadmapNode(
                id="cv-ingestion",
                title="Upload CV",
                track="audit",
                status="done",
                tasks=["Extract projects", "Detect stack", "Map academic experience"],
            ),
            RoadmapNode(
                id="state-management",
                title="Master frontend state management",
                track="hard_skill",
                status="active",
                tasks=[
                    "Build a small React flow with server data",
                    "Handle loading, empty, and error states",
                    "Push the finished example to GitHub",
                ],
            ),
            RoadmapNode(
                id="communication",
                title="Practice cross-functional communication",
                track="soft_skill",
                status="next",
                tasks=[
                    "Summarize a technical blocker in plain language",
                    "Name the decision you need from a teammate",
                    "Write the follow-up action clearly",
                ],
            ),
        ],
    )
