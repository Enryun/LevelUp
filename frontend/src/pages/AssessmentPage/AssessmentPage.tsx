import { useEffect, useMemo, useState } from 'react'
import {
  ArrowLeft,
  Check,
  CircleDot,
  FileUp,
  MessageSquareText,
  Play,
  Route,
  Sparkles,
  Target,
} from 'lucide-react'
import { apiUrl } from '../../config'
import { UploadCv } from '../../features/upload-cv/UploadCv'
import './AssessmentPage.css'

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

type AssessmentPageProps = {
  onBack: () => void
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

const jobPosition = 'Frontend Engineer'

const interviewQuestions: InterviewQuestion[] = [
  {
    id: 'problem-solving',
    skill: 'Problem-solving',
    weight: 25,
    prompt:
      'A production page is slow after a new component release. How would you explain what happened and what you did?',
    why: 'Frontend engineers need to debug user-visible issues, isolate causes, and explain tradeoffs.',
    options: [
      {
        id: 'a',
        label: 'A',
        summary: 'Names the bug and says you fixed it, but gives little context or outcome.',
        match: 40,
        star: { situation: 45, task: 35, action: 45, result: 35 },
      },
      {
        id: 'b',
        label: 'B',
        summary: 'Explains the page, your responsibility, the debugging steps, and a basic result.',
        match: 65,
        star: { situation: 70, task: 60, action: 70, result: 60 },
      },
      {
        id: 'c',
        label: 'C',
        summary: 'Shows context, ownership, measured investigation, tradeoffs, and performance impact.',
        match: 90,
        star: { situation: 90, task: 85, action: 95, result: 90 },
      },
    ],
  },
  {
    id: 'communication',
    skill: 'Communication',
    weight: 20,
    prompt:
      'You need to explain a frontend technical decision to a product manager or designer. What would your answer include?',
    why: 'Strong frontend work depends on clear written and verbal updates across technical and non-technical teammates.',
    options: [
      {
        id: 'a',
        label: 'A',
        summary: 'Uses technical terms and focuses mainly on what you personally prefer.',
        match: 40,
        star: { situation: 45, task: 40, action: 40, result: 35 },
      },
      {
        id: 'b',
        label: 'B',
        summary: 'Explains the decision in plain language and mentions the user or delivery effect.',
        match: 65,
        star: { situation: 65, task: 65, action: 65, result: 65 },
      },
      {
        id: 'c',
        label: 'C',
        summary: 'Adapts to the audience, compares options, checks understanding, and confirms next steps.',
        match: 90,
        star: { situation: 85, task: 90, action: 90, result: 95 },
      },
    ],
  },
  {
    id: 'collaboration',
    skill: 'Collaboration',
    weight: 15,
    prompt:
      'A designer and backend engineer disagree with your implementation approach. How do you move the work forward?',
    why: 'Frontend engineers sit between design, product, backend, QA, and users.',
    options: [
      {
        id: 'a',
        label: 'A',
        summary: 'Defends your approach and waits for someone else to decide.',
        match: 40,
        star: { situation: 45, task: 35, action: 35, result: 45 },
      },
      {
        id: 'b',
        label: 'B',
        summary: 'Listens to both sides, clarifies constraints, and proposes one compromise.',
        match: 65,
        star: { situation: 65, task: 65, action: 70, result: 60 },
      },
      {
        id: 'c',
        label: 'C',
        summary: 'Frames a shared goal, uses evidence, documents a decision, and protects team momentum.',
        match: 90,
        star: { situation: 90, task: 85, action: 95, result: 90 },
      },
    ],
  },
  {
    id: 'ownership',
    skill: 'Ownership',
    weight: 15,
    prompt:
      'You discover an accessibility issue that was not part of your assigned ticket. What do you do?',
    why: 'Good frontend ownership means caring about real user outcomes, not only assigned tasks.',
    options: [
      {
        id: 'a',
        label: 'A',
        summary: 'Leaves it for later because it was outside the ticket.',
        match: 40,
        star: { situation: 45, task: 35, action: 35, result: 45 },
      },
      {
        id: 'b',
        label: 'B',
        summary: 'Flags it, estimates effort, and asks whether it should be included now.',
        match: 65,
        star: { situation: 65, task: 70, action: 65, result: 60 },
      },
      {
        id: 'c',
        label: 'C',
        summary: 'Assesses impact, communicates risk early, proposes a scoped fix, and follows through.',
        match: 90,
        star: { situation: 90, task: 90, action: 90, result: 90 },
      },
    ],
  },
  {
    id: 'adaptability',
    skill: 'Adaptability',
    weight: 10,
    prompt:
      'Requirements change after you already built most of a feature. How do you respond?',
    why: 'Frontend work changes quickly as teams learn from design reviews, user feedback, and technical constraints.',
    options: [
      {
        id: 'a',
        label: 'A',
        summary: 'Says the change is frustrating and tries to keep the original plan.',
        match: 40,
        star: { situation: 45, task: 35, action: 40, result: 40 },
      },
      {
        id: 'b',
        label: 'B',
        summary: 'Clarifies what changed, updates the plan, and communicates the schedule impact.',
        match: 65,
        star: { situation: 65, task: 65, action: 70, result: 60 },
      },
      {
        id: 'c',
        label: 'C',
        summary: 'Finds reusable work, renegotiates scope, ships the highest-value path, and captures the lesson.',
        match: 90,
        star: { situation: 85, task: 90, action: 90, result: 95 },
      },
    ],
  },
  {
    id: 'feedback',
    skill: 'Feedback mindset',
    weight: 10,
    prompt:
      'A reviewer gives tough feedback on your React implementation. What would a strong response look like?',
    why: 'Frontend engineers grow through code review, design critique, and repeated iteration.',
    options: [
      {
        id: 'a',
        label: 'A',
        summary: 'Explains why your original approach was fine and changes only what is required.',
        match: 40,
        star: { situation: 45, task: 40, action: 35, result: 40 },
      },
      {
        id: 'b',
        label: 'B',
        summary: 'Asks clarifying questions, applies the feedback, and checks the updated work.',
        match: 65,
        star: { situation: 60, task: 65, action: 70, result: 65 },
      },
      {
        id: 'c',
        label: 'C',
        summary: 'Turns critique into a better pattern, documents the learning, and improves future PRs.',
        match: 90,
        star: { situation: 85, task: 90, action: 90, result: 95 },
      },
    ],
  },
  {
    id: 'empathy',
    skill: 'Empathy/product thinking',
    weight: 5,
    prompt:
      'User feedback shows that a polished UI is still confusing. How do you decide what to change?',
    why: 'Frontend decisions should connect technical implementation to user comprehension and product value.',
    options: [
      {
        id: 'a',
        label: 'A',
        summary: 'Keeps the visual design because the UI looks clean and matches the spec.',
        match: 40,
        star: { situation: 45, task: 40, action: 35, result: 40 },
      },
      {
        id: 'b',
        label: 'B',
        summary: 'Reviews the feedback, adjusts copy or layout, and asks for another check.',
        match: 65,
        star: { situation: 65, task: 65, action: 65, result: 65 },
      },
      {
        id: 'c',
        label: 'C',
        summary: 'Identifies the user goal, tests a simpler flow, measures understanding, and shares the tradeoff.',
        match: 90,
        star: { situation: 90, task: 85, action: 90, result: 95 },
      },
    ],
  },
]

function getSelectedOption(question: InterviewQuestion, selectedId: string) {
  return question.options.find((option) => option.id === selectedId)
}

function averageStar(star: StarBreakdown) {
  return Math.round((star.situation + star.task + star.action + star.result) / 4)
}

export function AssessmentPage({ onBack }: AssessmentPageProps) {
  const [dashboard, setDashboard] = useState<Dashboard>(fallbackDashboard)
  const [apiState, setApiState] = useState<'loading' | 'connected' | 'offline'>('loading')
  const [isUploadOpen, setIsUploadOpen] = useState(true)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [notes, setNotes] = useState<Record<string, string>>({})
  const [isInterviewOpen, setIsInterviewOpen] = useState(false)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)

  const answeredCount = useMemo(() => {
    return interviewQuestions.filter((question) => Boolean(answers[question.id])).length
  }, [answers])

  const isInterviewComplete = answeredCount === interviewQuestions.length

  const interviewScore = useMemo(() => {
    const weightedTotal = interviewQuestions.reduce((total, question) => {
      const option = getSelectedOption(question, answers[question.id])
      return total + (option?.match ?? 0) * question.weight
    }, 0)

    return Math.round(weightedTotal / 100)
  }, [answers])

  const strongestSkill = useMemo(() => {
    return interviewQuestions
      .map((question) => ({
        skill: question.skill,
        score: getSelectedOption(question, answers[question.id])?.match ?? 0,
      }))
      .sort((left, right) => right.score - left.score)[0]
  }, [answers])

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

  return (
    <main className="assessment-page">
      <nav className="topbar">
        <button type="button" className="back-button" onClick={onBack}>
          <ArrowLeft size={18} />
          Landing
        </button>
        <div className="brand">
          <Route size={22} />
          <span>LevelUp AI</span>
        </div>
        <span className={`api-pill ${apiState}`}>{apiState}</span>
      </nav>

      <div className="assessment-content">
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
            onClick={() => setIsInterviewOpen(true)}
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
                <h3>Frontend soft-skill fit</h3>
                <p>
                  STAR completeness and black box scoring are now available because
                  every frontend interview question has been answered.
                </p>
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

          {!isInterviewComplete && (
            <div className="questions-list">
              <article className="question-card">
                <div className="question-header">
                  <div>
                    <p className="track">
                      Question {currentQuestionIndex + 1} of {interviewQuestions.length} &middot; {activeQuestion.weight}% weight
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
                  ? `${strongestSkill.skill} is strongest so far`
                  : `${answeredCount} of ${interviewQuestions.length} answered`}
              </h3>
              <p>
                {isInterviewComplete
                  ? 'Use the selected STAR pattern as the first-pass score, then calibrate with the written answer notes.'
                  : 'Complete every question to reveal STAR breakdowns and the weighted frontend black box score.'}
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
            <h2>Today&apos;s path</h2>
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
      </div>
    </main>
  )
}
