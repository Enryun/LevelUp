import { useEffect, useState } from 'react'
import { Check, CircleDot, FileUp, MessageSquareText, Play, Route } from 'lucide-react'
import { UploadCv } from './features/upload-cv/UploadCv'
import './App.css'

type RoadmapNode = {
  id: string
  title: string
  track: 'audit' | 'hard_skill' | 'soft_skill'
  status: 'done' | 'active' | 'next'
  tasks: string[]
}

type Dashboard = {
  target_role: string
  readiness_score: number
  next_action: string
  roadmap: RoadmapNode[]
}

const fallbackDashboard: Dashboard = {
  target_role: 'Junior Software Engineer',
  readiness_score: 65,
  next_action: 'Write a pull request description for your latest project and explain the tradeoffs.',
  roadmap: [
    {
      id: 'cv-ingestion',
      title: 'Upload CV',
      track: 'audit',
      status: 'done',
      tasks: ['Extract projects', 'Detect stack', 'Map academic experience'],
    },
    {
      id: 'state-management',
      title: 'Master frontend state management',
      track: 'hard_skill',
      status: 'active',
      tasks: ['Build a React flow with server data', 'Handle loading, empty, and error states'],
    },
    {
      id: 'communication',
      title: 'Practice cross-functional communication',
      track: 'soft_skill',
      status: 'next',
      tasks: ['Summarize a technical blocker', 'Name the teammate decision you need'],
    },
  ],
}

function App() {
  const [dashboard, setDashboard] = useState<Dashboard>(fallbackDashboard)
  const [apiState, setApiState] = useState<'loading' | 'connected' | 'offline'>('loading')
  const [isUploadOpen, setIsUploadOpen] = useState(false)

  useEffect(() => {
    fetch('http://localhost:8000/api/dashboard')
      .then((response) => {
        if (!response.ok) {
          throw new Error('Dashboard request failed')
        }
        return response.json()
      })
      .then((data: Dashboard) => {
        setDashboard(data)
        setApiState('connected')
      })
      .catch(() => {
        setApiState('offline')
      })
  }, [])

  return (
    <main className="app-shell">
      <nav className="topbar">
        <div className="brand">
          <Route size={22} />
          <span>Pathfinder AI</span>
        </div>
        <span className={`api-pill ${apiState}`}>{apiState}</span>
      </nav>

      <section className="hero-panel">
        <div>
          <p className="eyebrow">Pathway to {dashboard.target_role}</p>
          <h1>{dashboard.readiness_score}% market ready</h1>
          <p className="hero-copy">
            Turn academic projects into a hiring playbook with focused hard-skill
            and soft-skill milestones.
          </p>
        </div>
        <div className="score-ring" aria-label={`${dashboard.readiness_score}% market ready`}>
          <span>{dashboard.readiness_score}%</span>
        </div>
      </section>

      <section className="actions-grid">
        <button
          type="button"
          className="action-button"
          onClick={() => setIsUploadOpen((value) => !value)}
          aria-expanded={isUploadOpen}
        >
          <FileUp size={18} />
          Upload CV
        </button>
        <button type="button" className="action-button secondary">
          <MessageSquareText size={18} />
          Start micro-interview
        </button>
      </section>

      {isUploadOpen && <UploadCv />}

      <section className="next-action">
        <div>
          <p className="eyebrow">Next action</p>
          <h2>{dashboard.next_action}</h2>
        </div>
        <button type="button" className="start-button" aria-label="Start next action">
          <Play size={18} fill="currentColor" />
        </button>
      </section>

      <section className="roadmap-section">
        <div className="section-heading">
          <p className="eyebrow">Dynamic roadmap</p>
          <h2>Today’s path</h2>
        </div>
        <ol className="roadmap">
          {dashboard.roadmap.map((node) => (
            <li key={node.id} className={`roadmap-node ${node.status}`}>
              <span className="node-icon">
                {node.status === 'done' ? <Check size={18} /> : <CircleDot size={18} />}
              </span>
              <div>
                <p className="track">{node.track.replace('_', ' ')}</p>
                <h3>{node.title}</h3>
                <ul>
                  {node.tasks.map((task) => (
                    <li key={task}>{task}</li>
                  ))}
                </ul>
              </div>
            </li>
          ))}
        </ol>
      </section>
    </main>
  )
}

export default App
