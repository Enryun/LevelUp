from typing import Literal

from pydantic import BaseModel


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
