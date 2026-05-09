import importlib.util
from pathlib import Path

from pypdf.errors import PdfReadError
from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from openai import AuthenticationError, OpenAIError

from app.config import settings
from app.course_search import suggest_courses
from app.cv_parser import extract_pdf_text
from app.database import get_latest_roadmap, init_db
from app.job_search import search_jobs
from app.openai_agent import run_chat_agent
from app.roadmap_agent import generate_and_save_roadmap
from app.schemas import (
    ChatRequest,
    ChatResponse,
    CourseSearchRequest,
    CourseSearchResponse,
    CvTextResponse,
    Dashboard,
    JobSearchRequest,
    JobSearchResponse,
    MicroInterview,
    RoadmapGenerateRequest,
    RoadmapNode,
    RoadmapResponse,
    SoftSkillsInterviewRequest,
    SoftSkillsInterviewResponse,
)


def _load_soft_skills_module(module_name: str, filename: str):
    module_path = Path(__file__).parent / "onboard-soft-skills" / filename
    spec = importlib.util.spec_from_file_location(module_name, module_path)
    if spec is None or spec.loader is None:
        raise RuntimeError(f"Could not load onboard-soft-skills module: {filename}")

    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


generate_soft_skills_questions = _load_soft_skills_module(
    "onboard_soft_skills_service",
    "service.py",
).generate_soft_skills_questions

generate_micro_interview = _load_soft_skills_module(
    "onboard_soft_skills_service",
    "service.py",
).generate_micro_interview

get_micro_interview = _load_soft_skills_module(
    "onboard_soft_skills_interview_data",
    "interview_data.py",
).get_micro_interview

app = FastAPI(title=settings.app_name)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.frontend_origin],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def startup() -> None:
    init_db()


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


@app.post("/api/chat", response_model=ChatResponse)
async def chat(request: ChatRequest) -> ChatResponse:
    try:
        return await run_chat_agent(request)
    except RuntimeError as error:
        raise HTTPException(status_code=503, detail=str(error)) from error
    except AuthenticationError as error:
        raise HTTPException(
            status_code=401,
            detail="OpenAI authentication failed. Check OPENAI_API_KEY.",
        ) from error
    except OpenAIError as error:
        raise HTTPException(
            status_code=502,
            detail=f"OpenAI request failed: {error.__class__.__name__}",
        ) from error


@app.post("/api/cv/extract-text", response_model=CvTextResponse)
async def extract_cv_text(file: UploadFile = File(...)) -> CvTextResponse:
    if file.content_type not in {"application/pdf", "application/x-pdf"}:
        raise HTTPException(status_code=400, detail="Only PDF files are supported.")

    pdf_bytes = await file.read()

    if not pdf_bytes:
        raise HTTPException(status_code=400, detail="Uploaded PDF is empty.")

    try:
        text, page_count = extract_pdf_text(pdf_bytes)
    except PdfReadError as error:
        raise HTTPException(status_code=400, detail="Uploaded file is not a valid PDF.") from error

    return CvTextResponse(
        filename=file.filename or "cv.pdf",
        text=text,
        page_count=page_count,
    )


@app.post("/api/onboard-soft-skills/questions", response_model=SoftSkillsInterviewResponse)
async def onboard_soft_skills_questions(
    request: SoftSkillsInterviewRequest,
) -> SoftSkillsInterviewResponse:
    try:
        return await generate_soft_skills_questions(request)
    except RuntimeError as error:
        raise HTTPException(status_code=503, detail=str(error)) from error
    except AuthenticationError as error:
        raise HTTPException(
            status_code=401,
            detail="OpenAI authentication failed. Check OPENAI_API_KEY.",
        ) from error
    except OpenAIError as error:
        raise HTTPException(
            status_code=502,
            detail=f"OpenAI request failed: {error.__class__.__name__}",
        ) from error


@app.get("/api/onboard-soft-skills/micro-interview", response_model=MicroInterview)
async def onboard_soft_skills_micro_interview(job_position: str = "Software Engineer") -> MicroInterview:
    try:
        return await generate_micro_interview(job_position)
    except RuntimeError as error:
        raise HTTPException(status_code=503, detail=str(error)) from error
    except AuthenticationError as error:
        raise HTTPException(
            status_code=401,
            detail="OpenAI authentication failed. Check OPENAI_API_KEY.",
        ) from error
    except OpenAIError as error:
        raise HTTPException(
            status_code=502,
            detail=f"OpenAI request failed: {error.__class__.__name__}",
        ) from error


@app.post("/api/roadmaps/generate", response_model=RoadmapResponse)
async def generate_roadmap(request: RoadmapGenerateRequest) -> RoadmapResponse:
    try:
        return await generate_and_save_roadmap(request)
    except RuntimeError as error:
        raise HTTPException(status_code=503, detail=str(error)) from error
    except AuthenticationError as error:
        raise HTTPException(
            status_code=401,
            detail="OpenAI authentication failed. Check OPENAI_API_KEY.",
        ) from error
    except OpenAIError as error:
        raise HTTPException(
            status_code=502,
            detail=f"OpenAI request failed: {error.__class__.__name__}",
        ) from error


@app.get("/api/roadmaps/latest", response_model=RoadmapResponse)
def latest_roadmap(email: str) -> RoadmapResponse:
    roadmap = get_latest_roadmap(email)

    if roadmap is None:
        raise HTTPException(status_code=404, detail="No saved roadmap found for this email.")

    return roadmap


@app.post("/api/jobs/search", response_model=JobSearchResponse)
async def job_search(request: JobSearchRequest) -> JobSearchResponse:
    try:
        return await search_jobs(request.target_role)
    except RuntimeError as error:
        raise HTTPException(status_code=503, detail=str(error)) from error


@app.post("/api/courses/search", response_model=CourseSearchResponse)
async def course_search(request: CourseSearchRequest) -> CourseSearchResponse:
    try:
        return await suggest_courses(request.keyword, request.target_role)
    except RuntimeError as error:
        raise HTTPException(status_code=503, detail=str(error)) from error
    except AuthenticationError as error:
        raise HTTPException(
            status_code=401,
            detail="OpenAI authentication failed. Check OPENAI_API_KEY.",
        ) from error
    except OpenAIError as error:
        raise HTTPException(
            status_code=502,
            detail=f"OpenAI request failed: {error.__class__.__name__}",
        ) from error
