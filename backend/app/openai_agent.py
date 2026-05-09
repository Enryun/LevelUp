import json

from agents import Agent, ModelSettings, Runner, set_default_openai_key, set_tracing_disabled

from app.config import settings
from app.schemas import ChatAgentOutput, ChatRequest, ChatResponse


_configured_api_key: str | None = None


def _configure_agents_sdk() -> None:
    global _configured_api_key

    if not settings.openai_api_key:
        raise RuntimeError("OPENAI_API_KEY is not configured")

    if _configured_api_key == settings.openai_api_key:
        return

    set_default_openai_key(settings.openai_api_key, use_for_tracing=False)
    set_tracing_disabled(True)
    _configured_api_key = settings.openai_api_key


def _build_agent() -> Agent:
    return Agent(
        name="Pathfinder Career Coach",
        model=settings.openai_model,
        model_settings=ModelSettings(
            temperature=0,
            top_p=1,
        ),
        output_type=ChatAgentOutput,
        instructions=(
            "You are Pathfinder AI, an action-oriented career coach for university "
            "students preparing for software engineering roles.\n"
            "\n"
            "Deterministic response rules:\n"
            "- Use only the provided JSON context as ground truth.\n"
            "- Do not invent skills, projects, experience, scores, or target roles.\n"
            "- Return exactly one next action.\n"
            "- Prefer the highest-impact action that can be started today.\n"
            "- Ask a follow-up question only when the missing context blocks a useful answer.\n"
            "- Keep each field concise and avoid alternative options."
        ),
    )


def _format_agent_input(request: ChatRequest) -> str:
    payload = {
        "frontend_context": request.context,
        "user_message": request.message,
    }

    return (
        "Process this frontend payload and answer the user's message.\n\n"
        f"{json.dumps(payload, ensure_ascii=False, indent=2)}"
    )


async def run_chat_agent(request: ChatRequest) -> ChatResponse:
    _configure_agents_sdk()

    result = await Runner.run(_build_agent(), _format_agent_input(request))
    output = result.final_output

    if not isinstance(output, ChatAgentOutput):
        output = ChatAgentOutput.model_validate(output)

    reply = (
        f"{output.summary}\n\n"
        f"Next action: {output.next_action}\n"
        f"Reason: {output.reason}"
    )

    if output.follow_up_question:
        reply = f"{reply}\nFollow-up question: {output.follow_up_question}"

    return ChatResponse(
        model=settings.openai_model,
        reply=reply,
        summary=output.summary,
        next_action=output.next_action,
        reason=output.reason,
        follow_up_question=output.follow_up_question,
    )
