"""Free YouTube course suggestions using TinyFish Search API + OpenAI summaries."""
from __future__ import annotations

import json

import httpx
from openai import AsyncOpenAI

from app.config import settings
from app.schemas import CourseSearchResponse, CourseSuggestion

TINYFISH_SEARCH_URL = "https://api.search.tinyfish.ai"
TINYFISH_API_KEY = "sk-tinyfish-CNVJzvJz6PFPUW3rnmVIy8tFQaIs6IyE"


async def suggest_courses(keyword: str, target_role: str | None = None, count: int = 5) -> CourseSearchResponse:
    """Search TinyFish for free YouTube learning resources and summarize them."""
    role_context = f" for {target_role}" if target_role else ""
    query = (
        f"{keyword}{role_context} free full course tutorial YouTube "
        f"site:youtube.com/watch OR site:youtube.com/playlist"
    )

    async with httpx.AsyncClient(timeout=30) as client:
        response = await client.get(
            TINYFISH_SEARCH_URL,
            params={"query": query, "language": "en"},
            headers={"X-API-Key": TINYFISH_API_KEY},
        )

    if response.status_code != 200:
        raise RuntimeError(f"TinyFish course search failed with status {response.status_code}: {response.text}")

    results = response.json().get("results", [])
    if not results:
        return CourseSearchResponse(keyword=keyword, target_role=target_role, courses=[])

    snippets = []
    urls: list[str] = []
    for index, result in enumerate(results[:10]):
        title = result.get("title", "")
        snippet = result.get("snippet", "")
        url = result.get("url", "")
        site = result.get("site_name", "")

        if "youtube.com" not in url and "youtu.be" not in url:
            continue

        snippets.append(
            f"Result {index + 1}:\nTitle: {title}\nSite: {site}\nURL: {url}\nSnippet: {snippet}"
        )
        urls.append(url)

    if not snippets:
        return CourseSearchResponse(keyword=keyword, target_role=target_role, courses=[])

    client = AsyncOpenAI(api_key=settings.openai_api_key)
    system_prompt = """You suggest free YouTube courses for a career roadmap.
Use only the provided TinyFish search results. Prefer full courses, playlists, long tutorials, and beginner-friendly project tutorials.

Return valid JSON only in this format:
{
  "courses": [
    {
      "title": "...",
      "channel": "...",
      "url": "...",
      "summary": "One sentence summary of what the learner will practice.",
      "why_relevant": "One short sentence explaining why it matches the keyword."
    }
  ]
}

Rules:
- Return 3 to 5 courses when available.
- Every URL must come from the provided search results.
- Do not invent course links.
- Keep summaries concise."""

    user_prompt = f"""Keyword: {keyword}
Target role: {target_role or "Not specified"}

TinyFish YouTube search results:
{chr(10).join(snippets)}

Choose the best free YouTube learning links for this roadmap item."""

    completion = await client.chat.completions.create(
        model=settings.openai_model,
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt},
        ],
        response_format={"type": "json_object"},
        temperature=0.3,
        max_completion_tokens=1200,
    )

    raw = completion.choices[0].message.content or "{}"
    parsed = json.loads(raw)
    courses_data = parsed.get("courses", [])

    courses: list[CourseSuggestion] = []
    allowed_urls = set(urls)
    for item in courses_data:
        url = item.get("url", "")
        if url not in allowed_urls:
            continue
        courses.append(
            CourseSuggestion(
                title=item.get("title", "Free YouTube course"),
                channel=item.get("channel") or None,
                url=url,
                summary=item.get("summary", ""),
                why_relevant=item.get("why_relevant", ""),
            )
        )

    return CourseSearchResponse(keyword=keyword, target_role=target_role, courses=courses[:count])
