import json
import sqlite3
from pathlib import Path

from app.schemas import RoadmapAgentOutput, RoadmapResponse


BACKEND_DIR = Path(__file__).resolve().parents[1]
DATA_DIR = BACKEND_DIR / "data"
DB_PATH = DATA_DIR / "levelup.sqlite3"


def get_connection() -> sqlite3.Connection:
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    connection = sqlite3.connect(DB_PATH)
    connection.row_factory = sqlite3.Row
    return connection


def init_db() -> None:
    with get_connection() as connection:
        connection.execute(
            """
            CREATE TABLE IF NOT EXISTS roadmaps (
                id TEXT PRIMARY KEY,
                email TEXT NOT NULL,
                name TEXT,
                target_role TEXT NOT NULL,
                readiness_score INTEGER NOT NULL,
                next_action TEXT NOT NULL,
                roadmap_json TEXT NOT NULL,
                cv_summary TEXT NOT NULL,
                interview_summary TEXT NOT NULL,
                created_at TEXT NOT NULL
            )
            """
        )
        connection.execute(
            "CREATE INDEX IF NOT EXISTS idx_roadmaps_email_created_at ON roadmaps(email, created_at DESC)"
        )


def save_roadmap(
    *,
    roadmap_id: str,
    email: str,
    name: str | None,
    created_at: str,
    output: RoadmapAgentOutput,
) -> RoadmapResponse:
    with get_connection() as connection:
        connection.execute(
            """
            INSERT INTO roadmaps (
                id,
                email,
                name,
                target_role,
                readiness_score,
                next_action,
                roadmap_json,
                cv_summary,
                interview_summary,
                created_at
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                roadmap_id,
                email,
                name,
                output.target_role,
                output.readiness_score,
                output.next_action,
                json.dumps([node.model_dump() for node in output.roadmap]),
                output.cv_summary,
                output.interview_summary,
                created_at,
            ),
        )

    return RoadmapResponse(
        id=roadmap_id,
        email=email,
        name=name,
        created_at=created_at,
        **output.model_dump(),
    )


def get_latest_roadmap(email: str) -> RoadmapResponse | None:
    with get_connection() as connection:
        row = connection.execute(
            """
            SELECT *
            FROM roadmaps
            WHERE email = ?
            ORDER BY created_at DESC
            LIMIT 1
            """,
            (email.strip().lower(),),
        ).fetchone()

    if row is None:
        return None

    return RoadmapResponse(
        id=row["id"],
        email=row["email"],
        name=row["name"],
        created_at=row["created_at"],
        target_role=row["target_role"],
        readiness_score=row["readiness_score"],
        next_action=row["next_action"],
        roadmap=json.loads(row["roadmap_json"]),
        cv_summary=row["cv_summary"],
        interview_summary=row["interview_summary"],
    )
