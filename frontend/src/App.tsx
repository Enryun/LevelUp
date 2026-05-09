import { useEffect, useMemo, useState } from 'react'
import {
  Check,
  CircleDot,
  FileUp,
  MessageSquareText,
  Play,
  Route,
  Sparkles,
  Target,
} from 'lucide-react'
import { apiUrl } from './config'
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

type StarBreakdown = {
  situation: number
  task: number
  action: number
  result: number
}

type AnswerOption = {
  id: string
  label: string
  summary: string
  match: number
  star: StarBreakdown
}

type InterviewQuestion = {
  id: string
  skill: string
  weight: number
  prompt: string
  why: string
  options: AnswerOption[]
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

type MicroInterview = {
  job_position: string
  fit_title: string
  completion_copy: string
  incomplete_copy: string
  questions: InterviewQuestion[]
}

const fallbackMicroInterview: MicroInterview = {
  job_position: 'Frontend Engineer',
  fit_title: 'Frontend soft-skill fit',
  completion_copy:
    'STAR completeness and black box scoring are now available because every frontend interview question has been answered.',
  incomplete_copy:
    'Complete every question to reveal STAR breakdowns and the weighted frontend black box score.',
  questions: [],
}

function getSelectedOption(question: InterviewQuestion, selectedId: string) {
  return question.options.find((option) => option.id === selectedId)
}

function averageStar(star: StarBreakdown) {
  return Math.round((star.situation + star.task + star.action + star.result) / 4)
}

function App() {
  const [dashboard, setDashboard] = useState<Dashboard>(fallbackDashboard)
  const [apiState, setApiState] = useState<'loading' | 'connected' | 'offline'>('loading')
  const [isUploadOpen, setIsUploadOpen] = useState(false)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [notes, setNotes] = useState<Record<string, string>>({})
  const [isInterviewOpen, setIsInterviewOpen] = useState(false)
  const [interviewState, setInterviewState] = useState<'idle' | 'loading' | 'ready' | 'offline'>('idle')
  const [microInterview, setMicroInterview] = useState<MicroInterview>(fallbackMicroInterview)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const interviewQuestions = microInterview.questions
  const jobPosition = microInterview.job_position

  const answeredCount = useMemo(() => {
    return interviewQuestions.filter((question) => Boolean(answers[question.id])).length
  }, [answers, interviewQuestions])

  const isInterviewComplete = interviewQuestions.length > 0 && answeredCount === interviewQuestions.length

  const interviewScore = useMemo(() => {
    const weightedTotal = interviewQuestions.reduce((total, question) => {
      const option = getSelectedOption(question, answers[question.id])
      return total + (option?.match ?? 0) * question.weight
    }, 0)
    const totalWeight = interviewQuestions.reduce((total, question) => total + question.weight, 0)

    if (totalWeight === 0) {
      return 0
    }

    return Math.round(weightedTotal / totalWeight)
  }, [answers, interviewQuestions])

  const strongestSkill = useMemo(() => {
    return interviewQuestions
      .map((question) => ({
        skill: question.skill,
        score: getSelectedOption(question, answers[question.id])?.match ?? 0,
      }))
      .sort((left, right) => right.score - left.score)[0]
  }, [answers, interviewQuestions])

  const activeQuestion = interviewQuestions[currentQuestionIndex]

  function handleAnswerSelect(question: InterviewQuestion, optionId: string) {
    setAnswers((current) => ({
      ...current,
      [question.id]: optionId,
    }))

    if (currentQuestionIndex < interviewQuestions.length - 1) {
      setCurrentQuestionIndex((current) => current + 1)
    }
  }

  function handleInterviewStart() {
    setIsInterviewOpen(true)

    if (interviewState === 'idle') {
      setInterviewState('loading')
    }
  }

  useEffect(() => {
    fetch(apiUrl('/api/dashboard'))
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

  useEffect(() => {
    if (!isInterviewOpen || interviewState !== 'loading') {
      return
    }

    fetch(apiUrl(`/api/onboard-soft-skills/micro-interview?job_position=${encodeURIComponent(dashboard.target_role)}`))
      .then((response) => {
        if (!response.ok) {
          throw new Error('Micro-interview request failed')
        }
        return response.json()
      })
      .then((data: MicroInterview) => {
        setMicroInterview(data)
        setAnswers({})
        setNotes({})
        setCurrentQuestionIndex(0)
        setInterviewState('ready')
      })
      .catch(() => {
        setInterviewState('offline')
      })
  }, [interviewState, isInterviewOpen])

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
        <button
          type="button"
          className={`action-button secondary ${isInterviewOpen ? 'active' : ''}`}
          aria-expanded={isInterviewOpen}
          aria-controls="micro-interview"
          onClick={handleInterviewStart}
        >
          {isInterviewOpen ? <Check size={18} /> : <MessageSquareText size={18} />}
          {isInterviewOpen ? 'Micro-interview started' : 'Start micro-interview'}
        </button>
      </section>

      {isUploadOpen && <UploadCv />}

      {isInterviewOpen && (
        <section id="micro-interview" className="micro-interview" aria-labelledby="micro-interview-title">
          <div className="section-heading interview-heading">
            <div>
              <p className="eyebrow">Start micro-interview</p>
              <h2 id="micro-interview-title">{jobPosition}</h2>
            </div>
            <div
              className="interview-score"
              aria-label={
                isInterviewComplete
                  ? `${interviewScore}% black box score`
                  : `${answeredCount} of ${interviewQuestions.length} questions answered`
              }
            >
              <Target size={18} />
              <span>
                {isInterviewComplete
                  ? `${interviewScore}%`
                  : `${answeredCount}/${interviewQuestions.length}`}
              </span>
            </div>
          </div>

          {isInterviewComplete && (
            <div className="skill-match-panel">
              <div>
                <p className="eyebrow">Role-matched soft skills</p>
                <h3>{microInterview.fit_title}</h3>
                <p>{microInterview.completion_copy}</p>
              </div>
              <div className="skill-tags">
                {interviewQuestions.map((question) => {
                  const selected = getSelectedOption(question, answers[question.id])

                  return (
                    <span key={question.id} className="skill-tag">
                      {question.skill}
                      <strong>{selected ? `${selected.match}%` : 'Pending'}</strong>
                    </span>
                  )
                })}
              </div>
            </div>
          )}

          {interviewState === 'loading' && (
            <div className="questions-list">
              <article className="question-card">
                <p className="question-prompt">Loading micro-interview questions...</p>
              </article>
            </div>
          )}

          {interviewState === 'offline' && (
            <div className="questions-list">
              <article className="question-card">
                <p className="question-prompt">Micro-interview questions are unavailable.</p>
                <p className="question-why">Check the backend connection and try starting the interview again.</p>
              </article>
            </div>
          )}

          {!isInterviewComplete && activeQuestion && (
            <div className="questions-list">
              <article className="question-card">
                <div className="question-header">
                  <div>
                    <p className="track">
                      Question {currentQuestionIndex + 1} of {interviewQuestions.length} · {activeQuestion.weight}% weight
                    </p>
                    <h3>{activeQuestion.skill}</h3>
                  </div>
                </div>
                <p className="question-prompt">{activeQuestion.prompt}</p>
                <p className="question-why">{activeQuestion.why}</p>

                <div className="answer-options" role="radiogroup" aria-label={`${activeQuestion.skill} answer options`}>
                  {activeQuestion.options.map((option) => (
                    <label
                      key={option.id}
                      className={`answer-option ${answers[activeQuestion.id] === option.id ? 'selected' : ''}`}
                    >
                      <input
                        type="radio"
                        name={activeQuestion.id}
                        value={option.id}
                        checked={answers[activeQuestion.id] === option.id}
                        onChange={() => handleAnswerSelect(activeQuestion, option.id)}
                      />
                      <span className="option-label">{option.label}</span>
                      <span>{option.summary}</span>
                    </label>
                  ))}
                </div>

                <label className="open-answer">
                  Open answer notes
                  <textarea
                    value={notes[activeQuestion.id] ?? ''}
                    onChange={(event) =>
                      setNotes((current) => ({
                        ...current,
                        [activeQuestion.id]: event.target.value,
                      }))
                    }
                    placeholder="Write the candidate's real answer here, then choose the closest answer pattern above."
                  />
                </label>
              </article>
            </div>
          )}

          {isInterviewComplete && (
            <div className="questions-list">
              {interviewQuestions.map((question) => {
                const selected = getSelectedOption(question, answers[question.id])

                if (!selected) {
                  return null
                }

                return (
                  <article key={question.id} className="result-card">
                    <div className="question-header">
                      <div>
                        <p className="track">{question.weight}% weight</p>
                        <h3>{question.skill}</h3>
                      </div>
                      <span className="black-box-score">
                        <Sparkles size={16} />
                        {selected.match}% match
                      </span>
                    </div>
                    <div className="star-grid" aria-label={`${question.skill} STAR score breakdown`}>
                      <span>Situation {selected.star.situation}%</span>
                      <span>Task {selected.star.task}%</span>
                      <span>Action {selected.star.action}%</span>
                      <span>Result {selected.star.result}%</span>
                      <span>Average {averageStar(selected.star)}%</span>
                    </div>
                  </article>
                )
              })}
            </div>
          )}

          <div className="interview-summary">
            <div>
              <p className="eyebrow">Current signal</p>
              <h3>
                {isInterviewComplete
                  ? `${strongestSkill?.skill ?? 'Soft-skill fit'} is strongest so far`
                  : `${answeredCount} of ${interviewQuestions.length} answered`}
              </h3>
              <p>
                {isInterviewComplete
                  ? 'Use the selected STAR pattern as the first-pass score, then calibrate with the written answer notes.'
                  : microInterview.incomplete_copy}
              </p>
            </div>
            <button type="button" className="start-button" aria-label="Complete micro-interview">
              <Check size={18} />
            </button>
          </div>
        </section>
      )}

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
