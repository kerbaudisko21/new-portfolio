import { useEffect, useRef, useState } from 'react'
import type { Action } from './character'
import { BUBBLES, CHOICES, QUESTIONS, type SpotId } from './data'
import { createStage, type StageHandle, type Theme } from './stage'

function goTo(target: SpotId) {
  const element = document.querySelector(`[data-spot="${target}"]`)
  const narrow = window.innerWidth < 860
  element?.scrollIntoView({ block: narrow || target === 'hero' || target === 'casestudy' ? 'start' : 'center' })
}

// 'none' shows the usual bubble, 'menu' lists the questions, and a number shows that answer.
type Conversation = 'none' | 'menu' | number

interface Stage3DProps {
  spot: SpotId
  theme: Theme
  /** What the character says and does while the case study is on screen. */
  say: string
  action: Action
  celebrations: number
  onNext?: () => void
}

export default function Stage3D({ spot, theme, say, action, celebrations, onNext }: Stage3DProps) {
  const host = useRef<HTMLDivElement>(null)
  const bubble = useRef<HTMLDivElement>(null)
  const hit = useRef<HTMLButtonElement>(null)
  const handle = useRef<StageHandle | null>(null)
  const latest = useRef({ spot, theme })
  const firstTheme = useRef(true)
  const [failed, setFailed] = useState(false)
  const [grabbed, setGrabbed] = useState(false)
  const [conversation, setConversation] = useState<Conversation>('none')
  const [themeNote, setThemeNote] = useState<string | null>(null)
  latest.current = { spot, theme }

  useEffect(() => {
    try {
      handle.current = createStage(host.current!, { bubble: bubble.current!, hit: hit.current! }, latest.current.spot, setGrabbed, latest.current.theme)
    } catch {
      setFailed(true)
    }
    return () => {
      handle.current?.dispose()
      handle.current = null
    }
  }, [])

  useEffect(() => {
    handle.current?.setSpot(spot)
    setConversation('none')
  }, [spot])

  useEffect(() => {
    handle.current?.setAction(action)
  }, [action])

  useEffect(() => {
    if (celebrations > 0) handle.current?.celebrate()
  }, [celebrations])

  useEffect(() => {
    handle.current?.setTalking(typeof conversation === 'number')
  }, [conversation])

  useEffect(() => {
    handle.current?.setTheme(theme)
    if (firstTheme.current) {
      firstTheme.current = false
      return
    }
    handle.current?.celebrate()
    setThemeNote(theme === 'dark' ? 'Lights off. Much cozier.' : 'Good morning!')
    const timer = window.setTimeout(() => setThemeNote(null), 2400)
    return () => window.clearTimeout(timer)
  }, [theme])

  if (failed) return null

  const inCase = spot === 'casestudy'
  const answering = typeof conversation === 'number'
  let line = inCase ? say : BUBBLES[spot]
  if (conversation === 'menu') line = 'What would you like to know?'
  if (answering) line = QUESTIONS[conversation].a
  if (themeNote) line = themeNote
  if (grabbed) line = 'Whoa, put me down!'

  return (
    <>
      <div ref={host} className="stage" aria-hidden="true" />
      <button ref={hit} type="button" className="buddy-hit" aria-label="Wave at the character" />
      <nav ref={bubble} className="bubble" aria-label="Page navigation and questions" data-show="false">
        <span key={line} className="bubble-text" data-answer={answering && !themeNote && !grabbed} aria-live="polite">{line}</span>
        {!grabbed && (
          <div className="choices">
            {conversation === 'none' && (
              <>
                <button type="button" className="choice choice-ask" onClick={() => setConversation('menu')}>Ask me something</button>
                {inCase && onNext && (
                  <button type="button" className="choice" onClick={onNext}>Next step</button>
                )}
                {CHOICES[spot].map((choice) => (
                  <button
                    type="button"
                    className="choice"
                    key={choice.label}
                    onClick={() => {
                      handle.current?.closeMenu()
                      goTo(choice.to)
                    }}
                  >
                    {choice.label}
                  </button>
                ))}
              </>
            )}
            {conversation === 'menu' && (
              <>
                {QUESTIONS.map((item, index) => (
                  <button type="button" className="choice" key={item.q} onClick={() => setConversation(index)}>{item.q}</button>
                ))}
                <button type="button" className="choice" onClick={() => setConversation('none')}>Never mind</button>
              </>
            )}
            {answering && (
              <>
                <button type="button" className="choice choice-ask" onClick={() => setConversation('menu')}>Ask another</button>
                <button type="button" className="choice" onClick={() => setConversation('none')}>Done</button>
              </>
            )}
          </div>
        )}
      </nav>
    </>
  )
}
