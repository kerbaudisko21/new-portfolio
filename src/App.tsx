import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import { CaseStudy } from './CaseStudy'
import { CASE_STEPS } from './caseContent'
import { BACKGROUND, LINKS, PROJECTS, ROLES, SKILLS, type SpotId, type Stat } from './data'

const Stage3D = lazy(() => import('./Stage3D'))

const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches

function StatItem({ stat }: { stat: Stat }) {
  const ref = useRef<HTMLParagraphElement>(null)
  const [shown, setShown] = useState(stat.value)

  useEffect(() => {
    if (reducedMotion()) return
    let frame = 0
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return
      observer.disconnect()
      const start = performance.now()
      const tick = (now: number) => {
        const progress = Math.min(Math.max((now - start) / 1100, 0), 1)
        setShown(Math.round(stat.value * (1 - Math.pow(1 - progress, 4))))
        if (progress < 1) frame = requestAnimationFrame(tick)
      }
      frame = requestAnimationFrame(tick)
    }, { threshold: 0.4 })
    observer.observe(ref.current!)
    return () => {
      observer.disconnect()
      cancelAnimationFrame(frame)
    }
  }, [stat.value])

  return (
    <div className="stat">
      <p ref={ref} className="stat-value">{shown.toLocaleString('en-US')}{stat.suffix}</p>
      <p className="stat-label">{stat.label}</p>
    </div>
  )
}

export default function App() {
  const [spot, setSpot] = useState<SpotId>('hero')
  const [copied, setCopied] = useState(false)
  const [caseStep, setCaseStep] = useState(0)
  const [celebrations, setCelebrations] = useState(0)
  const [passed, setPassed] = useState(false)
  const [theme, setTheme] = useState<'light' | 'dark'>(() => (document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light'))
  const timeline = useRef<HTMLDivElement>(null)
  const railFill = useRef<HTMLDivElement>(null)

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    try {
      localStorage.setItem('theme', theme)
    } catch {
      // Private browsing can block storage. The theme still applies for this visit.
    }
  }, [theme])

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) setSpot((entry.target as HTMLElement).dataset.spot as SpotId)
      })
    }, { rootMargin: '-50% 0px -50% 0px' })
    document.querySelectorAll('[data-spot]').forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    let frame = 0
    const update = () => {
      frame = 0
      const box = timeline.current!.getBoundingClientRect()
      const progress = Math.min(Math.max((window.innerHeight * 0.5 - box.top) / box.height, 0), 1)
      railFill.current!.style.transform = `scaleY(${progress})`
    }
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update)
    }
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      cancelAnimationFrame(frame)
    }
  }, [])

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(LINKS.email)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2000)
    } catch {
      window.location.href = `mailto:${LINKS.email}`
    }
  }

  return (
    <>
      <button type="button" className="theme-toggle" aria-pressed={theme === 'dark'} onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
        <span className="theme-icon" aria-hidden="true" />
        {theme === 'dark' ? 'Day mode' : 'Night mode'}
      </button>

      <Suspense fallback={null}>
        <Stage3D
          spot={spot}
          theme={theme}
          say={passed && caseStep === CASE_STEPS.length - 1 ? 'Ready for UAT!' : CASE_STEPS[caseStep].say}
          action={CASE_STEPS[caseStep].action}
          celebrations={celebrations}
          onNext={caseStep < CASE_STEPS.length - 1 ? () => setCaseStep(caseStep + 1) : undefined}
        />
      </Suspense>

      <main id="top">
        <section className="hero" data-spot="hero">
          <div className="hero-text">
            <h1>Hi, I'm Wilbert.</h1>
            <p className="hero-role">System Analyst at Bank Mandiri</p>
            <p className="hero-lead">I turn what the business needs into specifications developers can build from.</p>
            <div className="actions">
              <a className="button button-solid" href="#work">See my work</a>
              <a className="button" href={LINKS.resume} download>Download resume</a>
            </div>
          </div>
        </section>

        <section id="work" className="work" aria-labelledby="work-title">
          <h2 id="work-title" className="section-title">Where I've worked</h2>
          <div className="timeline" ref={timeline}>
            <div className="rail" aria-hidden="true"><div className="rail-fill" ref={railFill} /></div>
            {ROLES.map((role) => (
              <article className="role" data-spot={role.spot} key={role.company + role.dates}>
                <span className="role-dot" aria-hidden="true" />
                <p className="role-dates">{role.dates}</p>
                <h3 className="role-title">{role.title}</h3>
                <p className="role-company">{role.company}</p>
                <p className="role-context">{role.context}</p>
                <div className="stats">
                  {role.stats.map((stat) => <StatItem stat={stat} key={stat.label} />)}
                </div>
                <ul className="role-points">
                  {role.points.map((point) => <li key={point}>{point}</li>)}
                </ul>
              </article>
            ))}
          </div>
        </section>

        <CaseStudy
          step={caseStep}
          onStep={(next) => { setPassed(false); setCaseStep(next) }}
          onComplete={() => { setPassed(true); setCelebrations((count) => count + 1) }}
        />

        <section id="projects" className="projects" data-spot="projects">
          <h2 className="section-title">Competition projects</h2>
          <p className="projects-intro">Built with my team for hackathons and competitions.</p>
          <div className="project-grid">
            {PROJECTS.map((project) => (
              <article className="project" key={project.name} data-featured={Boolean(project.result)}>
                <div className="project-top">
                  <h3 className="project-name">{project.name}</h3>
                  {project.result && (project.resultHref
                    ? <a className="project-result" href={project.resultHref} target="_blank" rel="noreferrer">{project.result}</a>
                    : <span className="project-result">{project.result}</span>)}
                </div>
                <p className="project-tagline">{project.tagline}</p>
                <p className="project-role">My role: {project.role}</p>
                {project.detail && <p className="project-detail">{project.detail}</p>}
                {project.tech.length > 0 && (
                  <ul className="project-tech">
                    {project.tech.map((item) => <li key={item}>{item}</li>)}
                  </ul>
                )}
                {(project.live || project.code) && (
                  <div className="project-links">
                    {project.live && <a href={project.live} target="_blank" rel="noreferrer">Open demo<span className="sr-only"> of {project.name}</span></a>}
                    {project.code && <a href={project.code} target="_blank" rel="noreferrer">View code<span className="sr-only"> of {project.name}</span></a>}
                  </div>
                )}
              </article>
            ))}
          </div>
        </section>

        <section id="skills" className="skills" data-spot="skills">
          <h2 className="section-title">What I work with</h2>
          {SKILLS.map((group) => (
            <div className="skill-group" key={group.title}>
              <h3 className="skill-title">{group.title}</h3>
              <ul className="chips">
                {group.items.map((item) => <li className="chip" key={item}>{item}</li>)}
              </ul>
            </div>
          ))}
          <div className="background">
            {BACKGROUND.map((item) => (
              <div key={item.title}>
                <p className="background-title">{item.title}</p>
                <p className="background-detail">{item.detail}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="contact" className="contact" data-spot="contact">
          <h2 className="section-title">Let's talk</h2>
          <a className="email" href={`mailto:${LINKS.email}`}>{LINKS.email}</a>
          <div className="actions">
            <button type="button" className="button button-solid" onClick={copyEmail} aria-live="polite">
              {copied ? 'Email copied' : 'Copy email'}
            </button>
            <a className="button" href={LINKS.linkedin} target="_blank" rel="noreferrer">LinkedIn</a>
            <a className="button" href={LINKS.github} target="_blank" rel="noreferrer">GitHub</a>
            <a className="button" href={LINKS.resume} download>Download resume</a>
          </div>
        </section>
      </main>
    </>
  )
}
