import type { MouseEvent } from 'react'
import { ArrowLeft, ArrowRight, Check, Sparkles } from 'lucide-react'
import './SubscriptionPage.css'

type SubscriptionPageProps = {
  onBack: () => void
  onStart: () => void
}

const freeFeatures = [
  'Top 5 matching careers',
  'Fit scores',
  'Personality insights',
  'Salary preview',
  'Why this fits you',
]

const unlockFeatures = [
  'Exact roadmap',
  'Semester-by-semester actions',
  'Skills to learn',
  'Certifications',
  'English targets',
  'Projects to build',
  'Internships',
  'Extracurricular suggestions',
  'Portfolio roadmap',
  'Timeline',
]

const premiumFeatures = [
  'Roadmap tracking',
  'Weekly missions',
  'Accountability',
  'CV review',
  'Project scoring',
  'Internship prep',
]

export function SubscriptionPage({ onBack, onStart }: SubscriptionPageProps) {
  function handleBack(event: MouseEvent<HTMLAnchorElement>) {
    event.preventDefault()
    onBack()
  }

  function handleStart(event: MouseEvent<HTMLAnchorElement>) {
    event.preventDefault()
    onStart()
  }

  return (
    <main className="subscription-page">
      <header className="plans-header">
        <a className="plans-back" href="/" onClick={handleBack}>
          <ArrowLeft size={18} />
          Home
        </a>
        <div className="plans-title">
          <span className="plans-pill">
            <Sparkles size={16} />
            LevelUp pricing
          </span>
          <h1>Choose your growth plan</h1>
          <p>
            Start free, unlock your full roadmap for $1, or join Premium AI Coach for monthly guidance.
          </p>
        </div>
      </header>

      <section className="plan-grid" aria-label="Subscription plans">
        <article className="plan-card">
          <div className="plan-top">
            <h2>Free Tier</h2>
            <p className="plan-subtitle">Viral and shareable</p>
            <strong className="plan-price">$0</strong>
          </div>
          <ul>
            {freeFeatures.map((feature) => (
              <li key={feature}>
                <Check size={16} />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
          <a className="plan-button" href="/assessment" onClick={handleStart}>
            Start Free
            <ArrowRight size={18} />
          </a>
        </article>

        <article className="plan-card featured">
          <div className="plan-top">
            <h2>$1 Unlock</h2>
            <p className="plan-subtitle">One-time unlock</p>
            <strong className="plan-price">$1</strong>
          </div>
          <ul>
            {unlockFeatures.map((feature) => (
              <li key={feature}>
                <Check size={16} />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
          <button type="button" className="plan-button solid">
            Unlock for $1
            <ArrowRight size={18} />
          </button>
        </article>

        <article className="plan-card">
          <div className="plan-top">
            <h2>Premium AI Coach</h2>
            <p className="plan-subtitle">Monthly plan</p>
            <strong className="plan-price">Coming soon</strong>
          </div>
          <ul>
            {premiumFeatures.map((feature) => (
              <li key={feature}>
                <Check size={16} />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
          <button type="button" className="plan-button">
            Join waitlist
            <ArrowRight size={18} />
          </button>
        </article>
      </section>
    </main>
  )
}
