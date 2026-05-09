from typing import Any, Literal

from pydantic import BaseModel, Field


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
