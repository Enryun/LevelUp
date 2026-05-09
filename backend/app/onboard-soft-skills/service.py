from agents import Agent, ModelSettings, Runner

from app.config import settings
from app.openai_agent import _configure_agents_sdk
from app.schemas import (
    SoftSkillQuestion,
    SoftSkillsInterviewRequest,
    SoftSkillsInterviewResponse,
)


def _build_agent() -> Agent:
    return Agent(
        name="Soft Skills Micro Interview Generator",
        model=settings.openai_model,
        model_settings=ModelSettings(
            temperature=0.85,
            top_p=1,
        ),
        output_type=SoftSkillsInterviewResponse,
        instructions=(
            "Generate role-specific micro-interview questions about soft skills.\n"
            "\n"
            "Rules:\n"
            "- Use the requested job position as the role context.\n"
            "- Generate only behavioral or situational soft-skill questions.\n"
            "- Do not ask technical trivia or hard-skill implementation questions.\n"
            "- Each question must be realistic for an early career interview.\n"
            "- Vary the skills across questions.\n"
            "- Keep prompts concise and answerable in 1-2 minutes.\n"
            "- Return the requested number of questions.\n"
            "- Use stable lowercase kebab-case ids."
        ),
    )


def _fallback_questions(request: SoftSkillsInterviewRequest) -> SoftSkillsInterviewResponse:
    role = request.job_position.strip()
    templates = [
        SoftSkillQuestion(
            id="communication-tradeoff",
            skill="Communication",
            prompt=f"Tell me about a time you explained a difficult decision to a non-technical teammate as a {role}.",
            why="The role needs clear communication across different levels of context.",
        ),
        SoftSkillQuestion(
            id="ownership-blocker",
            skill="Ownership",
            prompt=f"Describe a time you were blocked on work related to a {role} responsibility. What did you do next?",
            why="Interviewers look for proactive follow-through when progress is uncertain.",
        ),
        SoftSkillQuestion(
            id="collaboration-feedback",
            skill="Collaboration",
            prompt=f"How would you handle receiving critical feedback on your work as a {role}?",
            why="The role requires improving work through feedback without losing momentum.",
        ),
        SoftSkillQuestion(
            id="prioritization-pressure",
            skill="Prioritization",
            prompt=f"You have multiple urgent tasks as a {role}. How would you decide what to do first?",
            why="Hiring teams need evidence that you can make practical tradeoffs under pressure.",
        ),
        SoftSkillQuestion(
            id="adaptability-change",
            skill="Adaptability",
            prompt=f"Tell me about a time requirements changed late. How would you adapt as a {role}?",
            why="The role often involves changing expectations and incomplete information.",
        ),
    ]

    return SoftSkillsInterviewResponse(
        job_position=role,
        questions=templates[: request.question_count],
    )


async def generate_soft_skills_questions(
    request: SoftSkillsInterviewRequest,
) -> SoftSkillsInterviewResponse:
    _configure_agents_sdk()

    role = request.job_position.strip()
    prompt = (
        f"Job position: {role}\n"
        f"Question count: {request.question_count}\n"
        "Generate random soft-skill micro-interview questions for this job position."
    )

    result = await Runner.run(_build_agent(), prompt)
    output = result.final_output

    if not isinstance(output, SoftSkillsInterviewResponse):
        output = SoftSkillsInterviewResponse.model_validate(output)

    questions = output.questions[: request.question_count]
    if len(questions) < request.question_count:
        fallback = _fallback_questions(request)
        questions.extend(fallback.questions[len(questions) : request.question_count])

    return SoftSkillsInterviewResponse(job_position=role, questions=questions)
