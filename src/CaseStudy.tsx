import { useRef, useState, type KeyboardEvent } from 'react'
import { CASE_STEPS, CRITERIA, ENDPOINTS, FLOW_NODES, FLOW_SCENARIOS, NEED, TABLES } from './caseContent'

function Switcher({ options, value, onChange, label }: { options: string[]; value: number; onChange: (i: number) => void; label: string }) {
  return (
    <div className="switcher" role="group" aria-label={label}>
      {options.map((option, i) => (
        <button type="button" key={option} className="switch" aria-pressed={i === value} onClick={() => onChange(i)}>
          {option}
        </button>
      ))}
    </div>
  )
}

function Need() {
  return (
    <div className="case-need">
      <div>
        <h4>The problem</h4>
        <p>{NEED.problem}</p>
      </div>
      <div>
        <h4>The goal</h4>
        <p>{NEED.goal}</p>
      </div>
      <div className="case-columns">
        <div>
          <h4>In scope</h4>
          <ul className="case-list">{NEED.inScope.map((item) => <li key={item}>{item}</li>)}</ul>
        </div>
        <div>
          <h4>Out of scope</h4>
          <ul className="case-list">{NEED.outOfScope.map((item) => <li key={item}>{item}</li>)}</ul>
        </div>
      </div>
      <div>
        <h4>Questions I asked first</h4>
        <dl className="case-questions">
          {NEED.questions.map((item) => (
            <div key={item.q}>
              <dt>{item.q}</dt>
              <dd>{item.a}</dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  )
}

function Flow() {
  const [scenario, setScenario] = useState(0)
  const current = FLOW_SCENARIOS[scenario]
  const reach = FLOW_NODES.findIndex((node) => node.id === current.reach)

  return (
    <div>
      <Switcher options={FLOW_SCENARIOS.map((s) => s.label)} value={scenario} onChange={setScenario} label="Scenario to trace" />
      <ol className="flow">
        {FLOW_NODES.map((node, i) => {
          const on = i <= reach
          const branchOn = current.branch && node.id === current.reach
          return (
            <li className="flow-row" key={node.id} data-on={on} style={{ transitionDelay: `${i * 45}ms` }}>
              <span className="flow-node" data-decision={Boolean(node.no)} style={{ transitionDelay: `${i * 45}ms` }}>{node.label}</span>
              {node.no && (
                <span className="flow-branch" data-on={branchOn} style={{ transitionDelay: `${i * 45 + 60}ms` }}>
                  <span className="flow-no">No</span>{node.no}
                </span>
              )}
            </li>
          )
        })}
      </ol>
    </div>
  )
}

function Api() {
  const [index, setIndex] = useState(0)
  const endpoint = ENDPOINTS[index]
  return (
    <div>
      <Switcher options={ENDPOINTS.map((e) => e.label)} value={index} onChange={setIndex} label="API endpoint" />
      <div key={endpoint.label} className="case-swap">
        <p className="api-line"><b className="api-method">{endpoint.method}</b> <code>{endpoint.path}</code></p>
        <p className="case-note">{endpoint.purpose}</p>
        <div className="api-blocks">
          <div>
            <h4>Request</h4>
            <pre tabIndex={0}>{endpoint.request}</pre>
          </div>
          <div>
            <h4>Response</h4>
            <pre tabIndex={0}>{endpoint.response}</pre>
          </div>
        </div>
        <h4>Errors</h4>
        <ul className="api-errors">
          {endpoint.errors.map(([status, code, meaning]) => (
            <li key={code}><b>{status}</b> <code>{code}</code><span>{meaning}</span></li>
          ))}
        </ul>
      </div>
    </div>
  )
}

function Tables() {
  const [index, setIndex] = useState(0)
  const table = TABLES[index]
  return (
    <div>
      <Switcher options={TABLES.map((t) => t.name)} value={index} onChange={setIndex} label="Database table" />
      <div key={table.name} className="case-swap">
        <p className="case-note">{table.purpose}</p>
        <div className="table-wrap" tabIndex={0}>
          <table>
            <thead>
              <tr><th>Column</th><th>Type</th><th>Rule</th></tr>
            </thead>
            <tbody>
              {table.columns.map(([name, type, rule]) => (
                <tr key={name}><td><code>{name}</code></td><td><code>{type}</code></td><td>{rule}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="table-note">{table.note}</p>
      </div>
    </div>
  )
}

function Criteria({ onComplete }: { onComplete: () => void }) {
  const [checked, setChecked] = useState<boolean[]>(() => CRITERIA.map(() => false))
  const done = checked.filter(Boolean).length

  const toggle = (index: number) => {
    const next = checked.map((value, i) => (i === index ? !value : value))
    setChecked(next)
    if (next.every(Boolean)) onComplete()
  }

  return (
    <div>
      <p className="criteria-count" aria-live="polite">
        {done === CRITERIA.length ? 'All checks passed. Ready for UAT.' : `${done} of ${CRITERIA.length} checked. Tick each one as if you were testing it.`}
      </p>
      <ul className="criteria">
        {CRITERIA.map((item, i) => (
          <li key={item.given}>
            <label className="criterion" data-checked={checked[i]}>
              <input type="checkbox" checked={checked[i]} onChange={() => toggle(i)} />
              <span className="tick" aria-hidden="true" />
              <span>
                <b>Given</b> {item.given}, <b>when</b> {item.when}, <b>then</b> {item.then}.
              </span>
            </label>
          </li>
        ))}
      </ul>
    </div>
  )
}

interface CaseStudyProps {
  step: number
  onStep: (step: number) => void
  onComplete: () => void
}

export function CaseStudy({ step, onStep, onComplete }: CaseStudyProps) {
  const tabs = useRef<(HTMLButtonElement | null)[]>([])

  const onKeyDown = (event: KeyboardEvent) => {
    const move = event.key === 'ArrowRight' ? 1 : event.key === 'ArrowLeft' ? -1 : 0
    if (!move) return
    event.preventDefault()
    const next = (step + move + CASE_STEPS.length) % CASE_STEPS.length
    onStep(next)
    tabs.current[next]?.focus()
  }

  const last = step === CASE_STEPS.length - 1

  return (
    <section id="how-i-work" className="case" data-spot="casestudy" aria-labelledby="case-title">
      <h2 id="case-title" className="section-title">How I work</h2>
      <p className="case-intro">One feature, from the first question to the last test. A scheduled transfer, made up for this page, so nothing here comes from a real bank.</p>

      <div className="stepper" role="tablist" aria-label="Case study steps" onKeyDown={onKeyDown}>
        <div className="stepper-track" aria-hidden="true">
          <div className="stepper-fill" style={{ transform: `scaleX(${step / (CASE_STEPS.length - 1)})` }} />
        </div>
        {CASE_STEPS.map((item, i) => (
          <button
            key={item.id}
            ref={(el) => { tabs.current[i] = el }}
            type="button"
            role="tab"
            id={`case-tab-${item.id}`}
            aria-selected={i === step}
            aria-controls="case-panel"
            tabIndex={i === step ? 0 : -1}
            className="step"
            data-done={i < step}
            onClick={() => onStep(i)}
          >
            <span className="step-number">{i + 1}</span>
            <span className="step-label">{item.label}</span>
          </button>
        ))}
      </div>

      <div id="case-panel" role="tabpanel" aria-labelledby={`case-tab-${CASE_STEPS[step].id}`} className="case-panel">
        <div key={step} className="case-swap">
          {step === 0 && <Need />}
          {step === 1 && <Flow />}
          {step === 2 && <Api />}
          {step === 3 && <Tables />}
          {step === 4 && <Criteria onComplete={onComplete} />}
        </div>
      </div>

      <div className="case-nav">
        <button type="button" className="button" disabled={step === 0} onClick={() => onStep(step - 1)}>Previous step</button>
        {!last && (
          <button type="button" className="button button-solid" onClick={() => onStep(step + 1)}>
            Next: {CASE_STEPS[step + 1].label}
          </button>
        )}
      </div>
    </section>
  )
}
