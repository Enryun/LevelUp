import {
  ArrowRight,
  Check,
  Map,
  Quote,
  Sparkles,
  Target,
} from 'lucide-react'
import './LandingPage.css'

const stats = [
  { value: '12,400+', label: 'Students' },
  { value: '120+', label: 'Roles in DB' },
  { value: '4.8/5', label: 'Rating' },
  { value: '5 min', label: 'Avg. time' },
]

const resultRoles = [
  { role: 'Product Designer', match: 92 },
  { role: 'UX Researcher', match: 87 },
  { role: 'Frontend Developer', match: 81 },
  { role: 'Brand Strategist', match: 76 },
  { role: 'Content Marketer', match: 72 },
]

const deliverables = [
  'Top 5 roles with a % match score based on your answers',
  'Real average salary ranges for the VN market in 2025',
  '0-3, 3-6, 6-12 month roadmap with free resources',
  'Common interview questions for each role',
]

const differences = [
  {
    icon: <Target size={22} />,
    title: 'Top 5 job matches',
    copy: 'Realistic roles for the Vietnam market - not textbook theory.',
  },
  {
    icon: <Map size={22} />,
    title: 'Skill roadmap',
    copy: 'Three clear phases: 0-3, 3-6, 6-12 months. Free resources.',
  },
  {
    icon: <Sparkles size={22} />,
    title: 'Personal, not generic',
    copy: 'Like talking to a smart older friend, not a counselor.',
  },
]

const testimonials = [
  {
    quote:
      'I was stuck between marketing and data. LevelUp pointed me at Marketing Analyst - exactly the missing skill set I needed to pivot. The roadmap is super clear.',
    name: 'Linh Nguyen',
    detail: 'Foreign Trade University - Class of 2025',
    avatar: 'LN',
  },
  {
    quote:
      "I thought studying IT meant being a dev forever. Turns out I'm a much better fit for DevOps. Five minutes solved six months of overthinking.",
    name: 'Minh Tran',
    detail: 'HUST - Class of 2026',
    avatar: 'MT',
  },
  {
    quote:
      "Generic career tests just told me I'm creative. LevelUp said Brand Strategist with realistic VN salary ranges. Way more useful.",
    name: 'Ha Pham',
    detail: 'RMIT - Final year',
    avatar: 'HP',
  },
]

export function LandingPage() {
  return (
    <main className="landing-page">
      <section className="hero-section">
        <nav className="landing-nav" aria-label="Main navigation">
          <a className="landing-brand" href="/">
            <span className="brand-mark">L</span>
            <span>LevelUp AI</span>
          </a>
          <a className="nav-cta" href="#get-started">
            Get started
            <ArrowRight size={18} />
          </a>
        </nav>

        <div className="hero-content" id="get-started">
          <span className="hero-pill">
            <Sparkles size={16} />
            AI career coach for Vietnamese students
          </span>
          <h1>
            You&apos;re graduating soon.
            <span>But what job are you actually built for?</span>
          </h1>
          <p>
            5 minutes to discover your top 5 job matches - and the exact skill
            roadmap to get there.
          </p>
          <a className="hero-button" href="#results">
            Find Out Now
            <ArrowRight size={22} />
          </a>
          <div className="social-proof" aria-label="Student rating">
            <div className="avatar-stack" aria-hidden="true">
              <span>LN</span>
              <span>MT</span>
              <span>HP</span>
            </div>
            <div>
              <div className="stars" aria-label="Five star rating">
                <span>★</span>
                <span>★</span>
                <span>★</span>
                <span>★</span>
                <span>★</span>
              </div>
              <strong>12,400+ students</strong> have tried it
            </div>
          </div>
          <p className="hero-note">No login. No fluff. Just answers.</p>
        </div>
      </section>

      <section className="stat-strip" aria-label="LevelUp numbers">
        {stats.map((stat) => (
          <div key={stat.label}>
            <strong>{stat.value}</strong>
            <span>{stat.label}</span>
          </div>
        ))}
      </section>

      <section id="results" className="results-section">
        <div className="section-copy">
          <p className="section-kicker">What you get</p>
          <h2>No theory. Stuff you can actually use this week.</h2>
          <p>
            After a 5-minute chat, you get your top 5 matched roles based on
            your personality and the Vietnam market - plus a concrete skill
            roadmap across 3 phases.
          </p>
          <ul>
            {deliverables.map((item) => (
              <li key={item}>
                <Check size={17} />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="result-card" aria-label="Demo results card">
          <div className="result-card-header">
            <span>Your results</span>
            <strong>Demo</strong>
          </div>
          <h3>Top 5 matched roles</h3>
          <div className="role-list">
            {resultRoles.map((role) => (
              <div key={role.role} className="role-match">
                <div>
                  <strong>{role.role}</strong>
                  <span>{role.match}% match</span>
                </div>
                <span className="match-track">
                  <span style={{ width: `${role.match}%` }} />
                </span>
              </div>
            ))}
          </div>
          <div className="roadmap-callout">
            <span>Roadmap - months 0-3</span>
            <p>
              Learn Figma fundamentals, ship 2 redesign case studies for VN
              apps, and write about the process on LinkedIn.
            </p>
          </div>
        </div>
      </section>

      <section className="difference-section">
        <div className="center-heading">
          <h2>How is this different from a Google search?</h2>
          <p>
            Generic advice doesn&apos;t know you. LevelUp asks the right
            questions, gives the right answers.
          </p>
        </div>
        <div className="difference-grid">
          {differences.map((item) => (
            <article key={item.title} className="difference-card">
              <span>{item.icon}</span>
              <h3>{item.title}</h3>
              <p>{item.copy}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="testimonial-section">
        <div className="center-heading">
          <p className="section-kicker">What students say</p>
          <h2>12,000+ students have found their direction</h2>
        </div>
        <div className="testimonial-grid">
          {testimonials.map((testimonial) => (
            <article key={testimonial.name} className="student-card">
              <Quote size={28} />
              <p>&quot;{testimonial.quote}&quot;</p>
              <div className="student-meta">
                <span className="student-avatar">{testimonial.avatar}</span>
                <div>
                  <strong>{testimonial.name}</strong>
                  <span>{testimonial.detail}</span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  )
}
