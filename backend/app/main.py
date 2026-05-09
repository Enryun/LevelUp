from pypdf.errors import PdfReadError
from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from openai import AuthenticationError, OpenAIError

from app.config import settings
from app.cv_parser import extract_pdf_text
from app.openai_agent import run_chat_agent
from app.schemas import ChatRequest, ChatResponse, CvTextResponse, Dashboard, RoadmapNode


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
