import { useState } from 'react'
import { ArrowLeft, Check, CircleDot, Clock, ExternalLink, FolderGit2, Loader2, Sparkles } from 'lucide-react'
import { apiUrl } from '../../config'
import './RoadmapGraphPage.css'

type DetailedRoadmapNode = {
  id: string
  title: string
  category: string
  status: 'done' | 'active' | 'next'
  description: string
  tasks: string[]
  resources: string[]
  estimated_time: string
  depends_on: string[]
}

type DetailedRoadmapPhase = {
  id: string
  title: string
  timeframe: string
  goal: string
  nodes: DetailedRoadmapNode[]
}

type DetailedRoadmap = {
  headline: string
  timeline: string
  phases: DetailedRoadmapPhase[]
  suggested_projects: string[]
  english_targets: string[]
  certifications: string[]
  portfolio_actions: string[]
  internship_actions: string[]
}

type RoadmapResponse = {
  target_role: string
  readiness_score: number
  next_action: string
  detailed_roadmap: DetailedRoadmap | null
}

type RoadmapGraphPageProps = {
  onBack: () => void
}

type CourseSuggestion = {
  title: string
  channel: string | null
  url: string
  summary: string
  why_relevant: string
}

type CourseSearchState = {
  status: 'idle' | 'loading' | 'ready' | 'error'
  courses: CourseSuggestion[]
  message?: string
}

const ROADMAP_SESSION_KEY = 'levelup.latestRoadmap'

function loadRoadmap(): RoadmapResponse | null {
  const raw = sessionStorage.getItem(ROADMAP_SESSION_KEY)

  if (!raw) {
    return null
  }

  try {
    return JSON.parse(raw) as RoadmapResponse
  } catch {
    return null
  }
}

function formatCategory(category: string) {
  return category.replaceAll('_', ' ')
}

export function RoadmapGraphPage({ onBack }: RoadmapGraphPageProps) {
  const roadmap = loadRoadmap()
  const detailedRoadmap = roadmap?.detailed_roadmap
  const [courseSearches, setCourseSearches] = useState<Record<string, CourseSearchState>>({})

  async function handleCourseSearch(keyword: string) {
    const key = keyword.trim().toLowerCase()
    const cached = courseSearches[key]

    if (cached?.status === 'loading' || cached?.status === 'ready') {
      return
    }

    setCourseSearches((current) => ({
      ...current,
      [key]: { status: 'loading', courses: [] },
    }))

    try {
      const response = await fetch(apiUrl('/api/courses/search'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          keyword,
          target_role: roadmap?.target_role ?? null,
        }),
      })

      if (!response.ok) {
        const payload = await response.json().catch(() => null)
        throw new Error(payload?.detail ?? 'Course search failed.')
      }

      const data = (await response.json()) as { courses: CourseSuggestion[] }
      setCourseSearches((current) => ({
        ...current,
        [key]: { status: 'ready', courses: data.courses },
      }))
    } catch (error) {
      setCourseSearches((current) => ({
        ...current,
        [key]: {
          status: 'error',
          courses: [],
          message: error instanceof Error ? error.message : 'Course search failed.',
        },
      }))
    }
  }

  if (!roadmap || !detailedRoadmap) {
    return (
      <main className="roadmap-graph-page empty">
        <button type="button" className="graph-back-button" onClick={onBack}>
          <ArrowLeft size={18} />
          Assessment
        </button>
        <section className="empty-graph-state">
          <Sparkles size={28} />
          <h1>No detailed roadmap yet</h1>
          <p>Generate your personalized roadmap from the assessment flow first.</p>
          <button type="button" className="graph-primary-button" onClick={onBack}>
            Back to assessment
          </button>
        </section>
      </main>
    )
  }

  return (
    <main className="roadmap-graph-page">
      <header className="graph-topbar">
        <button type="button" className="graph-back-button" onClick={onBack}>
          <ArrowLeft size={18} />
          Assessment
        </button>
      </header>

      <section className="graph-intro">
        <p className="graph-eyebrow">Roadmap for {roadmap.target_role}</p>
        <h1>{detailedRoadmap.headline}</h1>
        <p>{detailedRoadmap.timeline}</p>
      </section>

      <section className="graph-board" aria-label="Detailed roadmap graph">
        {detailedRoadmap.phases.map((phase, phaseIndex) => (
          <article key={phase.id} className="graph-phase">
            <div className="phase-heading">
              <span className="phase-index">{phaseIndex + 1}</span>
              <div>
                <p>{phase.timeframe}</p>
                <h2>{phase.title}</h2>
                <span>{phase.goal}</span>
              </div>
            </div>

            <div className="phase-nodes">
              {phase.nodes.map((node) => (
                <section key={node.id} className={`graph-node ${node.status}`}>
                  <div className="node-topline">
                    <span className="node-status">
                      {node.status === 'done' ? <Check size={15} /> : <CircleDot size={15} />}
                      {node.status}
                    </span>
                    <span className="node-category">{formatCategory(node.category)}</span>
                  </div>
                  <h3>{node.title}</h3>
                  <p>{node.description}</p>
                  <div className="node-time">
                    <Clock size={15} />
                    {node.estimated_time}
                  </div>
                  <ul className="node-task-list">
                    {node.tasks.map((task) => (
                      <li key={task}>
                        <div className="task-row">
                          <span>{task}</span>
                          <button type="button" onClick={() => handleCourseSearch(task)}>
                            <Sparkles size={14} />
                            Courses
                          </button>
                        </div>
                        {courseSearches[task.trim().toLowerCase()]?.status === 'loading' && (
                          <div className="course-suggestions loading">
                            <Loader2 size={15} className="spin" />
                            Finding free YouTube courses...
                          </div>
                        )}
                        {courseSearches[task.trim().toLowerCase()]?.status === 'error' && (
                          <div className="course-suggestions error">
                            {courseSearches[task.trim().toLowerCase()].message}
                          </div>
                        )}
                        {courseSearches[task.trim().toLowerCase()]?.status === 'ready' && (
                          <div className="course-suggestions">
                            {courseSearches[task.trim().toLowerCase()].courses.length > 0 ? (
                              courseSearches[task.trim().toLowerCase()].courses.map((course) => (
                                <a key={course.url} href={course.url} target="_blank" rel="noopener noreferrer">
                                  <div>
                                    <strong>{course.title}</strong>
                                    {course.channel && <span>{course.channel}</span>}
                                  </div>
                                  <p>{course.summary}</p>
                                  <small>{course.why_relevant}</small>
                                  <ExternalLink size={14} />
                                </a>
                              ))
                            ) : (
                              <p>No free YouTube courses found for this item.</p>
                            )}
                          </div>
                        )}
                      </li>
                    ))}
                  </ul>
                  {node.resources.length > 0 && (
                    <div className="node-resources">
                      {node.resources.map((resource) => (
                        <span key={resource}>{resource}</span>
                      ))}
                    </div>
                  )}
                  {node.depends_on.length > 0 && (
                    <div className="node-dependencies">
                      Depends on {node.depends_on.join(', ')}
                    </div>
                  )}
                </section>
              ))}
            </div>
          </article>
        ))}
      </section>

      <section className="graph-action-panels">
        <article>
          <FolderGit2 size={20} />
          <h2>Projects to build</h2>
          <ul>
            {detailedRoadmap.suggested_projects.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </article>
        <article>
          <Sparkles size={20} />
          <h2>Career proof</h2>
          <ul>
            {[...detailedRoadmap.portfolio_actions, ...detailedRoadmap.internship_actions].map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </article>
        {(detailedRoadmap.english_targets.length > 0 || detailedRoadmap.certifications.length > 0) && (
          <article>
            <Check size={20} />
            <h2>Targets</h2>
            <ul>
              {[...detailedRoadmap.english_targets, ...detailedRoadmap.certifications].map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </article>
        )}
      </section>
    </main>
  )
}
