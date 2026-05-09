import { useEffect, useMemo, useState } from 'react'
import {
  ArrowLeft,
  Check,
  CircleDot,
  Loader2,
  Play,
  Route,
  Sparkles,
  Target,
  X,
} from 'lucide-react'
import { apiUrl } from '../../config'
import { UploadCv } from '../../features/upload-cv/UploadCv'
import type { CvExtractResponse } from '../../features/upload-cv/UploadCv'
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

type RoadmapResponse = Dashboard & {
  id: string
  email: string
  name: string | null
  created_at: string
  cv_summary: string
  interview_summary: string
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

type MicroInterview = {
  job_position: string
  fit_title: string
  completion_copy: string
  incomplete_copy: string
  questions: InterviewQuestion[]
}

type JobPosition = {
  title: string
  company: string | null
  salary: string
  description: string
  keywords: string[]
  url: string | null
  site_name: string | null
}

type JobSearchResponse = {
  target_role: string
  jobs: JobPosition[]
}

type AssessmentPageProps = {
  onBack: () => void
}

type OnboardingStep = 'upload' | 'interview' | 'match' | 'roadmap'

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

function isEmailReady(email: string) {
  const trimmed = email.trim()
  return trimmed.includes('@') && trimmed.split('@')[1]?.includes('.')
}

export function AssessmentPage({ onBack }: AssessmentPageProps) {
  const [dashboard, setDashboard] = useState<Dashboard>(fallbackDashboard)
  const [apiState, setApiState] = useState<'loading' | 'connected' | 'offline'>('loading')
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [targetRole, setTargetRole] = useState(fallbackDashboard.target_role)
  const [onboardingStep, setOnboardingStep] = useState<OnboardingStep>('upload')
  const [extractedCv, setExtractedCv] = useState<CvExtractResponse | null>(null)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [notes, setNotes] = useState<Record<string, string>>({})
  const [isInterviewOpen, setIsInterviewOpen] = useState(false)
  const [interviewState, setInterviewState] = useState<'idle' | 'loading' | 'ready' | 'offline'>('idle')
  const [microInterview, setMicroInterview] = useState<MicroInterview>(fallbackMicroInterview)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [roadmapState, setRoadmapState] = useState<'idle' | 'saving' | 'ready' | 'error'>('idle')
  const [roadmapMessage, setRoadmapMessage] = useState('')
  const [latestRoadmap, setLatestRoadmap] = useState<RoadmapResponse | null>(null)
  const [isRoadmapDialogOpen, setIsRoadmapDialogOpen] = useState(false)
  const [jobSearchState, setJobSearchState] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle')
  const [jobPositions, setJobPositions] = useState<JobPosition[]>([])
  const interviewQuestions = microInterview.questions
  const jobPosition = microInterview.job_position
  const isInterviewAnalyzing = interviewState === 'loading' || interviewQuestions.length === 0
  const onboardingSteps: Array<{ id: OnboardingStep; label: string }> = [
    { id: 'upload', label: 'Upload CV' },
    { id: 'interview', label: 'Interview' },
    { id: 'match', label: 'Skill match' },
    { id: 'roadmap', label: 'Roadmap' },
  ]
  const activeStepIndex = onboardingSteps.findIndex((step) => step.id === onboardingStep)

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
  const canGenerateRoadmap =
    isEmailReady(email) &&
    targetRole.trim().length > 1 &&
    Boolean(extractedCv?.text.trim()) &&
    isInterviewComplete &&
    roadmapState !== 'saving'

  function handleAnswerSelect(question: InterviewQuestion, optionId: string) {
    const nextAnswers = {
      ...answers,
      [question.id]: optionId,
    }

    setAnswers(nextAnswers)

    if (interviewQuestions.every((item) => Boolean(nextAnswers[item.id]))) {
      setOnboardingStep('match')
    } else if (currentQuestionIndex < interviewQuestions.length - 1) {
      setCurrentQuestionIndex((current) => current + 1)
    }
  }

  function handleInterviewStart() {
    setOnboardingStep('interview')
    setIsInterviewOpen(true)
    if (interviewState === 'idle') {
      setInterviewState('loading')
    }
  }

  async function handleJobSearch() {
    setJobSearchState('loading')
    try {
      const res = await fetch(apiUrl('/api/jobs/search'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ target_role: targetRole }),
      })
      if (!res.ok) throw new Error('Job search failed')
      const data = (await res.json()) as JobSearchResponse
      setJobPositions(data.jobs)
      setJobSearchState('ready')
      setOnboardingStep('roadmap')
    } catch {
      setJobSearchState('error')
    }
  }

  function handleTargetRoleChange(nextRole: string) {
    setTargetRole(nextRole)
    if (isInterviewOpen) {
      setInterviewState('idle')
      setMicroInterview(fallbackMicroInterview)
      setAnswers({})
      setNotes({})
      setCurrentQuestionIndex(0)
      setJobSearchState('idle')
      setJobPositions([])
      setLatestRoadmap(null)
      setRoadmapState('idle')
      setRoadmapMessage('')
      setOnboardingStep('interview')
    }
  }

  function handleEmailChange(nextEmail: string) {
    setEmail(nextEmail)
    if (!isEmailReady(nextEmail)) {
      setLatestRoadmap(null)
      setRoadmapMessage('')
      setRoadmapState('idle')
    }
  }

  async function handleGenerateRoadmap() {
    if (!canGenerateRoadmap || !extractedCv) {
      setRoadmapState('error')
      setRoadmapMessage('Add an email, target role, extracted CV, and completed micro-interview first.')
      return
    }

    setRoadmapState('saving')
    setRoadmapMessage('')

    const completedAnswers = interviewQuestions.flatMap((question) => {
      const selected = getSelectedOption(question, answers[question.id])
      if (!selected) {
        return []
      }
      return {
        question_id: question.id,
        skill: question.skill,
        prompt: question.prompt,
        selected_option_id: selected.id,
        selected_option_summary: selected.summary,
        match: selected.match,
        star: selected.star,
        notes: notes[question.id]?.trim() || null,
      }
    })

    try {
      const response = await fetch(apiUrl('/api/roadmaps/generate'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          name,
          target_role: targetRole,
          cv: extractedCv,
          interview_score: interviewScore,
          answers: completedAnswers,
        }),
      })

      if (!response.ok) {
        const payload = await response.json().catch(() => null)
        throw new Error(payload?.detail ?? 'Roadmap generation failed.')
      }

      const generated = (await response.json()) as RoadmapResponse
      setDashboard(generated)
      setTargetRole(generated.target_role)
      setLatestRoadmap(generated)
      setRoadmapState('ready')
      setRoadmapMessage('Generated and saved your latest roadmap.')
      setIsRoadmapDialogOpen(true)
    } catch (error) {
      setRoadmapState('error')
      setRoadmapMessage(error instanceof Error ? error.message : 'Roadmap generation failed.')
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
        setTargetRole(data.target_role)
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

    fetch(apiUrl(`/api/onboard-soft-skills/micro-interview?job_position=${encodeURIComponent(targetRole)}`))
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
  }, [interviewState, isInterviewOpen, targetRole])

  useEffect(() => {
    if (!isEmailReady(email)) {
      return
    }

    const controller = new AbortController()
    fetch(apiUrl(`/api/roadmaps/latest?email=${encodeURIComponent(email.trim().toLowerCase())}`), {
      signal: controller.signal,
    })
      .then((response) => {
        if (response.status === 404) {
          return null
        }
        if (!response.ok) {
          throw new Error('Latest roadmap request failed')
        }
        return response.json()
      })
      .then((data: RoadmapResponse | null) => {
        if (!data) {
          setLatestRoadmap(null)
          return
        }
        setLatestRoadmap(data)
        setDashboard(data)
        setTargetRole(data.target_role)
        setRoadmapState((current) => (current === 'saving' ? current : 'ready'))
        setRoadmapMessage('Loaded the latest saved roadmap for this email.')
      })
      .catch((error) => {
        if (error instanceof DOMException && error.name === 'AbortError') {
          return
        }
        setRoadmapState((current) => (current === 'saving' ? current : 'error'))
        setRoadmapMessage('Could not load the latest saved roadmap.')
      })

    return () => controller.abort()
  }, [email])

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
            <p className="eyebrow">Pathway to {targetRole || dashboard.target_role}</p>
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

        <section className="onboarding-progress" aria-label="Onboarding progress">
          {onboardingSteps.map((step, index) => (
            <span
              key={step.id}
              className={`${step.id === onboardingStep ? 'active' : ''} ${
                index < activeStepIndex ? 'complete' : ''
              }`}
            >
              {index < activeStepIndex ? <Check size={16} /> : <span>{index + 1}</span>}
              {step.label}
            </span>
          ))}
        </section>

        {onboardingStep === 'upload' && (
          <UploadCv
            onExtract={setExtractedCv}
            onClear={() => setExtractedCv(null)}
            onNext={handleInterviewStart}
          />
        )}

        {onboardingStep === 'roadmap' && (
          <section className="roadmap-builder" aria-labelledby="roadmap-builder-title">
            <div className="section-heading builder-heading">
              <div>
                <p className="eyebrow">Personalized roadmap</p>
                <h2 id="roadmap-builder-title">Build from your CV and interview answers</h2>
              </div>
              {latestRoadmap && (
                <span className="saved-roadmap-pill">
                  Saved {new Date(latestRoadmap.created_at).toLocaleDateString()}
                </span>
              )}
            </div>

            {jobSearchState === 'ready' && jobPositions.length > 0 && (
              <div className="selected-jobs-panel">
                <div className="selected-jobs-strip">
                  <span>{Math.min(jobPositions.length, 5)} latest matched roles</span>
                  <strong>{jobPositions.length} total found</strong>
                </div>
                <ol className="compact-job-list">
                  {jobPositions.slice(0, 5).map((job, index) => (
                    <li key={`${job.title}-${job.company ?? 'company'}-${index}`} className="compact-job-card">
                      <div className="compact-job-main">
                        <span className="job-number">#{index + 1}</span>
                        <div>
                          <h3>{job.title}</h3>
                          <p>
                            {job.company ?? 'Company not listed'}
                            <span>{job.salary}</span>
                          </p>
                        </div>
                      </div>
                      <p className="compact-job-description">{job.description}</p>
                      <div className="compact-job-footer">
                        <div className="job-keywords">
                          {job.keywords.slice(0, 4).map((keyword) => (
                            <span key={keyword}>{keyword}</span>
                          ))}
                        </div>
                        {job.url && (
                          <a href={job.url} target="_blank" rel="noopener noreferrer">
                            {job.site_name ?? 'View role'}
                          </a>
                        )}
                      </div>
                    </li>
                  ))}
                </ol>
              </div>
            )}

            <div className="builder-grid">
              <label>
                Email
                <input
                  type="email"
                  value={email}
                  onChange={(event) => handleEmailChange(event.target.value)}
                  placeholder="you@example.com"
                />
              </label>
              <label>
                Name
                <input
                  type="text"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Optional"
                />
              </label>
              <label>
                Target role
                <input
                  type="text"
                  value={targetRole}
                  onChange={(event) => handleTargetRoleChange(event.target.value)}
                  placeholder="Junior Backend Engineer"
                />
              </label>
            </div>

            <div className="builder-status-grid">
              <span className={isEmailReady(email) ? 'ready' : ''}>Email</span>
              <span className={extractedCv?.text.trim() ? 'ready' : ''}>CV extracted</span>
              <span className={isInterviewComplete ? 'ready' : ''}>Interview complete</span>
              <span className={targetRole.trim().length > 1 ? 'ready' : ''}>Target role</span>
            </div>

            <div className="builder-actions">
              <div className="button-row">
                <button
                  type="button"
                  className="generate-button"
                  onClick={handleGenerateRoadmap}
                  disabled={!canGenerateRoadmap}
                >
                  {roadmapState === 'saving' ? (
                    <>
                      <Loader2 size={18} className="spin" />
                      Generating roadmap
                    </>
                  ) : (
                    <>
                      <Sparkles size={18} />
                      Generate roadmap
                    </>
                  )}
                </button>
                {latestRoadmap && (
                  <button
                    type="button"
                    className="action-button secondary"
                    onClick={() => setIsRoadmapDialogOpen(true)}
                  >
                    View roadmap
                  </button>
                )}
                <button
                  type="button"
                  className="action-button secondary"
                  onClick={() => setOnboardingStep('match')}
                >
                  Back to matches
                </button>
              </div>
              {roadmapMessage && (
                <p className={`roadmap-message ${roadmapState === 'error' ? 'error' : ''}`}>
                  {roadmapMessage}
                </p>
              )}
            </div>
          </section>
        )}

        {onboardingStep === 'interview' && (
          <section id="micro-interview" className="micro-interview" aria-labelledby="micro-interview-title">
            <div className="section-heading interview-heading">
              <div>
                <p className="eyebrow">Start micro-interview</p>
                <h2 id="micro-interview-title">{jobPosition}</h2>
              </div>
              <div
                className="interview-score"
                aria-label={
                  isInterviewAnalyzing
                    ? 'Analyzing interview data'
                    : isInterviewComplete
                      ? `${interviewScore}% black box score`
                      : `${answeredCount} of ${interviewQuestions.length} questions answered`
                }
              >
                <Target size={18} />
                <span>
                  {isInterviewAnalyzing
                    ? 'Analyzing...'
                    : isInterviewComplete
                      ? `${interviewScore}%`
                      : `${answeredCount}/${interviewQuestions.length}`}
                </span>
              </div>
            </div>

            {interviewState === 'loading' && (
              <div className="questions-list">
                <article className="question-card">
                  <p className="question-prompt">Analyzing...</p>
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

            <div className="interview-summary">
              <div>
                <p className="eyebrow">Current signal</p>
                <h3>
                  {isInterviewComplete
                    ? `${strongestSkill?.skill ?? 'Soft-skill fit'} is strongest so far`
                    : isInterviewAnalyzing
                      ? 'Analyzing...'
                      : `${answeredCount} of ${interviewQuestions.length} answered`}
                </h3>
                <p>
                  {isInterviewAnalyzing
                    ? 'Preparing role-specific interview questions from the available profile data.'
                    : isInterviewComplete
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

        {onboardingStep === 'match' && (
          <section className="micro-interview" aria-labelledby="skill-match-title">
            <div className="section-heading interview-heading">
              <div>
                <p className="eyebrow">Role-matched soft skills</p>
                <h2 id="skill-match-title">{microInterview.fit_title}</h2>
              </div>
              <div className="interview-score" aria-label={`${interviewScore}% black box score`}>
                <Target size={18} />
                <span>{interviewScore}%</span>
              </div>
            </div>

            <div className="skill-match-panel">
              <div>
                <p className="eyebrow">Skill match</p>
                <h3>{strongestSkill?.skill ?? 'Soft-skill fit'} is strongest</h3>
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

            <div className="builder-actions">
              <div className="button-row">
                <button
                  type="button"
                  className="generate-button"
                  onClick={handleJobSearch}
                  disabled={jobSearchState === 'loading'}
                >
                  {jobSearchState === 'loading' ? (
                    <>
                      <Loader2 size={18} className="spin" />
                      Finding roles
                    </>
                  ) : (
                    <>
                      <Sparkles size={18} />
                      Find job positions
                    </>
                  )}
                </button>
                {jobSearchState === 'ready' && (
                  <button
                    type="button"
                    className="action-button secondary"
                    onClick={() => setOnboardingStep('roadmap')}
                  >
                    Continue to roadmap
                  </button>
                )}
              </div>
              {jobSearchState === 'error' && (
                <p className="roadmap-message error">Could not load job listings. Please try again.</p>
              )}
            </div>
          </section>
        )}

        {isRoadmapDialogOpen && (
          <div className="modal-overlay" onClick={() => setIsRoadmapDialogOpen(false)}>
            <div className="modal-content roadmap-dialog" onClick={(e) => e.stopPropagation()}>
              <button
                type="button"
                className="close-dialog-button"
                onClick={() => setIsRoadmapDialogOpen(false)}
                aria-label="Close roadmap"
              >
                <X size={24} />
              </button>
              <div className="dialog-scroll-area">
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
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
