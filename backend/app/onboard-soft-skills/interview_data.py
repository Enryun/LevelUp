from app.schemas import InterviewQuestion, MicroInterview


def get_micro_interview() -> MicroInterview:
    return MicroInterview(
        job_position="Frontend Engineer",
        fit_title="Frontend soft-skill fit",
        completion_copy=(
            "STAR completeness and black box scoring are now available because "
            "every frontend interview question has been answered."
        ),
        incomplete_copy=(
            "Complete every question to reveal STAR breakdowns and the weighted "
            "frontend black box score."
        ),
        questions=[
            InterviewQuestion(
                id="problem-solving",
                skill="Problem-solving",
                weight=25,
                prompt=(
                    "A production page is slow after a new component release. "
                    "How would you explain what happened and what you did?"
                ),
                why="Frontend engineers need to debug user-visible issues, isolate causes, and explain tradeoffs.",
                options=[
                    {
                        "id": "a",
                        "label": "A",
                        "summary": "Names the bug and says you fixed it, but gives little context or outcome.",
                        "match": 40,
                        "star": {"situation": 45, "task": 35, "action": 45, "result": 35},
                    },
                    {
                        "id": "b",
                        "label": "B",
                        "summary": "Explains the page, your responsibility, the debugging steps, and a basic result.",
                        "match": 65,
                        "star": {"situation": 70, "task": 60, "action": 70, "result": 60},
                    },
                    {
                        "id": "c",
                        "label": "C",
                        "summary": "Shows context, ownership, measured investigation, tradeoffs, and performance impact.",
                        "match": 90,
                        "star": {"situation": 90, "task": 85, "action": 95, "result": 90},
                    },
                ],
            ),
            InterviewQuestion(
                id="communication",
                skill="Communication",
                weight=20,
                prompt=(
                    "You need to explain a frontend technical decision to a product manager or designer. "
                    "What would your answer include?"
                ),
                why=(
                    "Strong frontend work depends on clear written and verbal updates across technical "
                    "and non-technical teammates."
                ),
                options=[
                    {
                        "id": "a",
                        "label": "A",
                        "summary": "Uses technical terms and focuses mainly on what you personally prefer.",
                        "match": 40,
                        "star": {"situation": 45, "task": 40, "action": 40, "result": 35},
                    },
                    {
                        "id": "b",
                        "label": "B",
                        "summary": "Explains the decision in plain language and mentions the user or delivery effect.",
                        "match": 65,
                        "star": {"situation": 65, "task": 65, "action": 65, "result": 65},
                    },
                    {
                        "id": "c",
                        "label": "C",
                        "summary": "Adapts to the audience, compares options, checks understanding, and confirms next steps.",
                        "match": 90,
                        "star": {"situation": 85, "task": 90, "action": 90, "result": 95},
                    },
                ],
            ),
            InterviewQuestion(
                id="collaboration",
                skill="Collaboration",
                weight=15,
                prompt=(
                    "A designer and backend engineer disagree with your implementation approach. "
                    "How do you move the work forward?"
                ),
                why="Frontend engineers sit between design, product, backend, QA, and users.",
                options=[
                    {
                        "id": "a",
                        "label": "A",
                        "summary": "Defends your approach and waits for someone else to decide.",
                        "match": 40,
                        "star": {"situation": 45, "task": 35, "action": 35, "result": 45},
                    },
                    {
                        "id": "b",
                        "label": "B",
                        "summary": "Listens to both sides, clarifies constraints, and proposes one compromise.",
                        "match": 65,
                        "star": {"situation": 65, "task": 65, "action": 70, "result": 60},
                    },
                    {
                        "id": "c",
                        "label": "C",
                        "summary": "Frames a shared goal, uses evidence, documents a decision, and protects team momentum.",
                        "match": 90,
                        "star": {"situation": 90, "task": 85, "action": 95, "result": 90},
                    },
                ],
            ),
            InterviewQuestion(
                id="ownership",
                skill="Ownership",
                weight=15,
                prompt="You discover an accessibility issue that was not part of your assigned ticket. What do you do?",
                why="Good frontend ownership means caring about real user outcomes, not only assigned tasks.",
                options=[
                    {
                        "id": "a",
                        "label": "A",
                        "summary": "Leaves it for later because it was outside the ticket.",
                        "match": 40,
                        "star": {"situation": 45, "task": 35, "action": 35, "result": 45},
                    },
                    {
                        "id": "b",
                        "label": "B",
                        "summary": "Flags it, estimates effort, and asks whether it should be included now.",
                        "match": 65,
                        "star": {"situation": 65, "task": 70, "action": 65, "result": 60},
                    },
                    {
                        "id": "c",
                        "label": "C",
                        "summary": "Assesses impact, communicates risk early, proposes a scoped fix, and follows through.",
                        "match": 90,
                        "star": {"situation": 90, "task": 90, "action": 90, "result": 90},
                    },
                ],
            ),
            InterviewQuestion(
                id="adaptability",
                skill="Adaptability",
                weight=10,
                prompt="Requirements change after you already built most of a feature. How do you respond?",
                why=(
                    "Frontend work changes quickly as teams learn from design reviews, user feedback, "
                    "and technical constraints."
                ),
                options=[
                    {
                        "id": "a",
                        "label": "A",
                        "summary": "Says the change is frustrating and tries to keep the original plan.",
                        "match": 40,
                        "star": {"situation": 45, "task": 35, "action": 40, "result": 40},
                    },
                    {
                        "id": "b",
                        "label": "B",
                        "summary": "Clarifies what changed, updates the plan, and communicates the schedule impact.",
                        "match": 65,
                        "star": {"situation": 65, "task": 65, "action": 70, "result": 60},
                    },
                    {
                        "id": "c",
                        "label": "C",
                        "summary": (
                            "Finds reusable work, renegotiates scope, ships the highest-value path, "
                            "and captures the lesson."
                        ),
                        "match": 90,
                        "star": {"situation": 85, "task": 90, "action": 90, "result": 95},
                    },
                ],
            ),
            InterviewQuestion(
                id="feedback",
                skill="Feedback mindset",
                weight=10,
                prompt="A reviewer gives tough feedback on your React implementation. What would a strong response look like?",
                why="Frontend engineers grow through code review, design critique, and repeated iteration.",
                options=[
                    {
                        "id": "a",
                        "label": "A",
                        "summary": "Explains why your original approach was fine and changes only what is required.",
                        "match": 40,
                        "star": {"situation": 45, "task": 40, "action": 35, "result": 40},
                    },
                    {
                        "id": "b",
                        "label": "B",
                        "summary": "Asks clarifying questions, applies the feedback, and checks the updated work.",
                        "match": 65,
                        "star": {"situation": 60, "task": 65, "action": 70, "result": 65},
                    },
                    {
                        "id": "c",
                        "label": "C",
                        "summary": "Turns critique into a better pattern, documents the learning, and improves future PRs.",
                        "match": 90,
                        "star": {"situation": 85, "task": 90, "action": 90, "result": 95},
                    },
                ],
            ),
            InterviewQuestion(
                id="empathy",
                skill="Empathy/product thinking",
                weight=5,
                prompt="User feedback shows that a polished UI is still confusing. How do you decide what to change?",
                why=(
                    "Frontend decisions should connect technical implementation to user comprehension "
                    "and product value."
                ),
                options=[
                    {
                        "id": "a",
                        "label": "A",
                        "summary": "Keeps the visual design because the UI looks clean and matches the spec.",
                        "match": 40,
                        "star": {"situation": 45, "task": 40, "action": 35, "result": 40},
                    },
                    {
                        "id": "b",
                        "label": "B",
                        "summary": "Reviews the feedback, adjusts copy or layout, and asks for another check.",
                        "match": 65,
                        "star": {"situation": 65, "task": 65, "action": 65, "result": 65},
                    },
                    {
                        "id": "c",
                        "label": "C",
                        "summary": (
                            "Identifies the user goal, tests a simpler flow, measures understanding, "
                            "and shares the tradeoff."
                        ),
                        "match": 90,
                        "star": {"situation": 90, "task": 85, "action": 90, "result": 95},
                    },
                ],
            ),
        ],
    )
