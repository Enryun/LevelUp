import json
from datetime import UTC, datetime
from uuid import uuid4

from agents import Agent, ModelSettings, Runner

from app.database import save_roadmap
from app.config import settings
from app.openai_agent import _configure_agents_sdk
from app.schemas import RoadmapAgentOutput, RoadmapGenerateRequest, RoadmapResponse


def _build_roadmap_agent() -> Agent:
    return Agent(
        name="Pathfinder Roadmap Generator",
        model=settings.openai_model,
        model_settings=ModelSettings(
            temperature=0,
            top_p=1,
        ),
        output_type=RoadmapAgentOutput,
        instructions=(
            "You are Pathfinder AI, an action-oriented career strategist for early-career job seekers.\n"
            "\n"
            "Use only the provided CV text, target role, interview answers, option scores, and notes as ground truth.\n"
            "Create a practical roadmap that helps the user improve toward securing the target job.\n"
            "\n"
            "Output rules:\n"
            "- readiness_score must be an integer from 0 to 100.\n"
            "- roadmap must contain 3 to 5 nodes.\n"
            "- Each roadmap node must use only these tracks: audit, hard_skill, soft_skill.\n"
            "- Each roadmap node must use only these statuses: done, active, next.\n"
            "- Use done only for completed evidence already visible in the CV or questionnaire.\n"
            "- Use active for the highest-priority current improvement area.\n"
            "- Use next for later improvements.\n"
            "- Each node must include 2 to 4 concrete tasks the user can actually do.\n"
            "- next_action must be exactly one concrete action that can be started today.\n"
            "- cv_summary and interview_summary must be concise and must not include raw pasted CV text.\n"
            "- Do not invent degrees, employers, projects, skills, scores, or constraints that are not present."
        ),
    )


def _format_roadmap_input(request: RoadmapGenerateRequest) -> str:
    payload = request.model_dump()

    return (
        "Generate a personalized job-readiness roadmap from this payload.\n"
        "The full CV text is provided for analysis only. Summarize it; do not reproduce it.\n\n"
        f"{json.dumps(payload, ensure_ascii=False, indent=2)}"
    )


async def generate_and_save_roadmap(request: RoadmapGenerateRequest) -> RoadmapResponse:
    _configure_agents_sdk()

    result = await Runner.run(_build_roadmap_agent(), _format_roadmap_input(request))
    output = result.final_output

    if not isinstance(output, RoadmapAgentOutput):
        output = RoadmapAgentOutput.model_validate(output)

    return save_roadmap(
        roadmap_id=str(uuid4()),
        email=request.email,
        name=request.name,
        created_at=datetime.now(UTC).isoformat(),
        output=output,
    )
