from typing import Any, Literal

# pyrefly: ignore [missing-import]
from pydantic import BaseModel, Field, field_validator


class RoadmapNode(BaseModel):
    id: str
    title: str
    track: Literal["audit", "hard_skill", "soft_skill"]
    status: Literal["done", "active", "next"]
    tasks: list[str]


class Dashboard(BaseModel):
    target_role: str
    readiness_score: int
    next_action: str
    roadmap: list[RoadmapNode]


class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1)
    context: Any | None = None


class ChatResponse(BaseModel):
    reply: str
    model: str
    summary: str
    next_action: str
    reason: str
    follow_up_question: str | None = None


class ChatAgentOutput(BaseModel):
    summary: str = Field(..., description="One sentence directly answering the user.")
    next_action: str = Field(..., description="Exactly one concrete action the user should take next.")
    reason: str = Field(..., description="A short reason this action is the best next step.")
    follow_up_question: str | None = Field(
        default=None,
        description="One focused question only if required context is missing.",
    )


class CvTextResponse(BaseModel):
    filename: str
    text: str
    page_count: int


class StarBreakdown(BaseModel):
    situation: int
    task: int
    action: int
    result: int


class InterviewAnswerOption(BaseModel):
    id: str
    label: str
    summary: str
    match: int
    star: StarBreakdown


class InterviewQuestion(BaseModel):
    id: str
    skill: str
    weight: int
    prompt: str
    why: str
    options: list[InterviewAnswerOption]


class MicroInterview(BaseModel):
    job_position: str
    fit_title: str
    completion_copy: str
    incomplete_copy: str
    questions: list[InterviewQuestion]


class SoftSkillQuestion(BaseModel):
    id: str
    skill: str
    prompt: str
    why: str


class SoftSkillsInterviewRequest(BaseModel):
    job_position: str = Field(..., min_length=2, max_length=120)
    question_count: int = Field(default=5, ge=1, le=10)

    @field_validator("job_position")
    @classmethod
    def job_position_must_have_text(cls, value: str) -> str:
        stripped = value.strip()
        if not stripped:
            raise ValueError("job_position must not be blank")
        return stripped


class SoftSkillsInterviewResponse(BaseModel):
    job_position: str
    questions: list[SoftSkillQuestion]
