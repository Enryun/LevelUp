import { ArrowLeft, Check, CircleDot, Clock, FolderGit2, Sparkles } from 'lucide-react'
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
        <div className="graph-score">
          <span>{roadmap.readiness_score}%</span>
          market ready
        </div>
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
                  <ul>
                    {node.tasks.map((task) => (
                      <li key={task}>{task}</li>
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
