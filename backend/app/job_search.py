"""Job search using TinyFish Search API + OpenAI for structured extraction."""
from __future__ import annotations

import json
import httpx
from openai import AsyncOpenAI
from pydantic import BaseModel

from app.config import settings

TINYFISH_SEARCH_URL = "https://api.search.tinyfish.ai"
TINYFISH_API_KEY = "sk-tinyfish-CNVJzvJz6PFPUW3rnmVIy8tFQaIs6IyE"


class JobPosition(BaseModel):
    title: str
    company: str | None = None
    salary: str
    description: str
    keywords: list[str]
    url: str | None = None
    site_name: str | None = None


class JobSearchResponse(BaseModel):
    target_role: str
    jobs: list[JobPosition]


async def search_jobs(target_role: str, count: int = 5) -> JobSearchResponse:
    """Search TinyFish for Vietnam job listings, then use OpenAI to extract structured data."""
    query = (
        f"{target_role} jobs Vietnam Ho Chi Minh City Hanoi "
        f"site:vn.linkedin.com OR site:topcv.vn OR site:careerviet.vn "
        f"OR site:itviec.com OR site:jobs.vn.indeed.com"
    )

    async with httpx.AsyncClient(timeout=30) as client:
        response = await client.get(
            TINYFISH_SEARCH_URL,
            params={"query": query, "location": "VN", "language": "en"},
            headers={"X-API-Key": TINYFISH_API_KEY},
        )

    if response.status_code != 200:
        raise RuntimeError(f"TinyFish search failed with status {response.status_code}: {response.text}")

    data = response.json()
    results = data.get("results", [])

    if not results:
        raise RuntimeError("No job listings found from TinyFish search.")

    # Build a prompt context from search results
    snippets = []
    urls = []
    site_names = []
    for i, r in enumerate(results[:10]):
        title = r.get("title", "")
        snippet = r.get("snippet", "")
        url = r.get("url", "")
        site = r.get("site_name", "")
        if title or snippet:
            snippets.append(
                f"Result {i + 1}:\nTitle: {title}\nSite: {site}\nURL: {url}\nSnippet: {snippet}"
            )
            urls.append(url)
            site_names.append(site)

    search_context = "\n\n".join(snippets)

    # Use OpenAI to extract structured job info from the snippets
    client = AsyncOpenAI(api_key=settings.openai_api_key)

    system_prompt = """You are a job data extraction assistant. Given web search results about job openings in Vietnam, extract exactly 5 job positions.

For each job, extract or infer:
- title: The exact job title (keep original English title)
- company: The company name hiring for this role (if mentioned in title or snippet); use a real Vietnamese tech company if not present (e.g. FPT Software, VNG, Tiki, MoMo, Grab Vietnam, Shopee Vietnam, NashTech, Axon Active, Rikkeisoft, Katalon)
- salary: Salary range if mentioned (e.g. "$1,200–$2,000/month" or "15–25M VND/month"), or "Competitive" if not specified
- description: A concise 2–3 sentence description of the role responsibilities and requirements, relevant to Vietnam's tech market
- keywords: 4–6 relevant technical or skill keywords for this role (e.g. "React", "Python", "Agile")

Respond with valid JSON only, in this exact format:
{
  "jobs": [
    {
      "title": "...",
      "company": "...",
      "salary": "...",
      "description": "...",
      "keywords": ["...", "..."]
    }
  ]
}"""

    user_prompt = f"""Target role: {target_role}
Location: Vietnam (Ho Chi Minh City / Hanoi)

Search results:
{search_context}

Extract 5 distinct job positions with real Vietnamese companies. Vary the companies — do not repeat the same company twice."""

    completion = await client.chat.completions.create(
        model=settings.openai_model,
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt},
        ],
        response_format={"type": "json_object"},
        temperature=0.4,
        max_completion_tokens=1500,
    )

    raw = completion.choices[0].message.content or "{}"
    parsed = json.loads(raw)
    jobs_data = parsed.get("jobs", [])

    jobs = []
    for i, job in enumerate(jobs_data[:count]):
        jobs.append(
            JobPosition(
                title=job.get("title", f"{target_role} Position {i + 1}"),
                company=job.get("company") or None,
                salary=job.get("salary", "Competitive"),
                description=job.get("description", ""),
                keywords=job.get("keywords", []),
                url=urls[i] if i < len(urls) else None,
                site_name=site_names[i] if i < len(site_names) else None,
            )
        )

    return JobSearchResponse(target_role=target_role, jobs=jobs)
