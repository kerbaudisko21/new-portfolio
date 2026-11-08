import * as THREE from 'three'
import { CHARACTER_HEIGHT, Character, type Action } from './character'
import type { SpotId } from './data'

export const prefersReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches

interface Spot {
  x: number
  y: number
  h: number
  action: Action
  face: number
  disc: string
  tint: string
}

// x and y are viewport positions from -1 to 1. h is the character's share of viewport height.
const SPOTS: Record<SpotId, Spot> = {
  hero: { x: 0.5, y: -0.84, h: 0.76, action: 'wave', face: -0.22, disc: '#C9E2D5', tint: '#E9F2ED' },
  mandiri: { x: 0.64, y: -0.84, h: 0.64, action: 'clipboard', face: -0.3, disc: '#C7DDEF', tint: '#EBF2F8' },
  diksha: { x: 0.68, y: -0.84, h: 0.64, action: 'phone', face: -0.3, disc: '#D9D2EE', tint: '#F1EEF8' },
  indocyber: { x: 0.64, y: -0.84, h: 0.64, action: 'clipboard', face: -0.3, disc: '#C7DDEF', tint: '#EBF2F8' },
  unggul: { x: 0.68, y: -0.84, h: 0.64, action: 'laptop', face: -0.34, disc: '#C9E2D5', tint: '#E9F2ED' },
  phincon: { x: 0.64, y: -0.84, h: 0.64, action: 'laptop', face: -0.34, disc: '#F0DDB0', tint: '#F4F2E8' },
  casestudy: { x: 0.72, y: -0.84, h: 0.58, action: 'think', face: -0.3, disc: '#C7DDEF', tint: '#EBF2F8' },
  projects: { x: -0.66, y: -0.84, h: 0.64, action: 'laptop', face: 0.34, disc: '#D9D2EE', tint: '#F1EEF8' },
  skills: { x: 0.66, y: -0.84, h: 0.64, action: 'think', face: -0.24, disc: '#C7DDEF', tint: '#EBF2F8' },
  contact: { x: 0.56, y: -0.84, h: 0.72, action: 'letter', face: -0.26, disc: '#C9E2D5', tint: '#E9F2ED' },
}

export type Theme = 'light' | 'dark'

// Each daytime colour has a calm night partner.
const NIGHT: Record<string, string> = {
  '#E9F2ED': '#1B2A29', '#C9E2D5': '#2B423D',
  '#EBF2F8': '#1C2633', '#C7DDEF': '#2C3D53',
  '#F1EEF8': '#242236', '#D9D2EE': '#3A3656',
  '#F4F2E8': '#2A2720', '#F0DDB0': '#46402D',
}

export interface StageRefs {
  bubble: HTMLElement
  hit: HTMLElement
}

export interface StageHandle {
  setSpot(id: SpotId): void
  closeMenu(): void
  setTheme(theme: Theme): void
  setTalking(talking: boolean): void
  setAction(action: Action | null): void
  celebrate(): void
  dispose(): void
}

export function createStage(host: HTMLElement, refs: StageRefs, initial: SpotId, onGrab: (grabbed: boolean) => void, initialTheme: Theme): StageHandle {
  const reduced = prefersReducedMotion()
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75))
  renderer.toneMapping = THREE.NoToneMapping
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = THREE.PCFShadowMap
  host.appendChild(renderer.domElement)

  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(22, 1, 1, 80)
  camera.position.set(0, 0, 30)
  const worldHeight = 2 * 30 * Math.tan(THREE.MathUtils.degToRad(11))

  let theme = initialTheme
  const paletteColor = (color: string) => (theme === 'dark' ? (NIGHT[color] ?? color) : color)
  const LIGHTING = {
    light: { sky: new THREE.Color(0xffffff), ground: new THREE.Color(0xd9e3dc), sun: new THREE.Color(0xfff4e6), hemi: 2.25, direct: 1.55 },
    dark: { sky: new THREE.Color(0xc4d2ff), ground: new THREE.Color(0x2f3a55), sun: new THREE.Color(0xe2e8ff), hemi: 2, direct: 1.25 },
  }
  const hemi = new THREE.HemisphereLight(LIGHTING[theme].sky, LIGHTING[theme].ground, LIGHTING[theme].hemi)
  scene.add(hemi)
  const sun = new THREE.DirectionalLight(LIGHTING[theme].sun, LIGHTING[theme].direct)
  sun.position.set(-6, 10, 12)
  sun.castShadow = true
  sun.shadow.mapSize.set(1024, 1024)
  sun.shadow.radius = 6
  sun.shadow.bias = -0.0006
  sun.shadow.camera.left = -12
  sun.shadow.camera.right = 12
  sun.shadow.camera.top = 12
  sun.shadow.camera.bottom = -12
  scene.add(sun)

  const discMaterial = new THREE.MeshBasicMaterial({ color: paletteColor(SPOTS[initial].disc) })
  const disc = new THREE.Mesh(new THREE.CircleGeometry(1, 72), discMaterial)
  disc.position.z = -4
  scene.add(disc)

  // Small stars appear on the backdrop at night.
  const starMaterial = new THREE.MeshBasicMaterial({ color: 0xf6f0d0, transparent: true, opacity: theme === 'dark' ? 0.9 : 0 })
  const STAR_SPOTS = [[-0.72, 0.38, 1], [-0.52, 0.66, 0.7], [-0.82, -0.05, 0.6], [-0.3, 0.86, 1.1], [0.32, 0.87, 0.7], [0.62, 0.62, 1.2], [0.8, 0.3, 0.7], [0.86, -0.12, 1], [-0.68, -0.42, 0.8], [0.7, -0.5, 0.7], [-0.05, 0.94, 0.6], [0.47, 0.42, 0.55], [-0.46, 0.2, 0.55]]
  STAR_SPOTS.forEach(([x, y, size]) => {
    const star = new THREE.Mesh(new THREE.CircleGeometry(0.014 * size, 10), starMaterial)
    star.position.set(x, y, 0.01)
    disc.add(star)
  })

  const blobCanvas = document.createElement('canvas')
  blobCanvas.width = blobCanvas.height = 128
  const blobContext = blobCanvas.getContext('2d')!
  const gradient = blobContext.createRadialGradient(64, 64, 4, 64, 64, 62)
  gradient.addColorStop(0, 'rgba(31,47,42,0.34)')
  gradient.addColorStop(1, 'rgba(31,47,42,0)')
  blobContext.fillStyle = gradient
  blobContext.fillRect(0, 0, 128, 128)
  const blobTexture = new THREE.CanvasTexture(blobCanvas)
  const blob = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: blobTexture, transparent: true, depthWrite: false }))
  scene.add(blob)

  const character = new Character()
  scene.add(character.root)

  let spotId = initial
  let width = 1
  let height = 1
  let aspect = 1
  let compact = false
  let posX = 0
  let posY = 0
  let scale = 1
  let facing = 0
  let walk = 0
  let stride = 0
  let hop = 0
  let hopVelocity = 0
  let actionStart = performance.now() / 1000
  let arrived = false
  let hoverUntil = 0
  let pointerX = 0
  let pointerY = 0
  let hasPointer = false
  let pressed = false
  let dragging = false
  let dragX = 0
  let dragY = 0
  let downX = 0
  let downY = 0
  let tilt = 0
  let menuOpen = false
  let actionOverride: Action | null = null
  let talking = false
  const discColor = new THREE.Color(paletteColor(SPOTS[initial].disc))

  function target() {
    const spot = SPOTS[spotId]
    if (compact) {
      if (spotId === 'hero') return { x: -0.46, y: -0.95, h: 0.36, showBubble: true, spot }
      return { x: 0.72, y: -0.97, h: 0.2, showBubble: menuOpen, spot }
    }
    return { x: spot.x, y: spot.y, h: spot.h, showBubble: true, spot }
  }

  const worldX = (x: number) => (x * worldHeight * aspect) / 2
  const worldY = (y: number) => (y * worldHeight) / 2

  function resize() {
    width = host.clientWidth
    height = host.clientHeight
    if (!width || !height) return
    renderer.setSize(width, height)
    aspect = width / height
    camera.aspect = aspect
    camera.updateProjectionMatrix()
    compact = width < 860
    if (reduced) settle()
  }

  function settle() {
    const next = target()
    posX = worldX(next.x)
    posY = worldY(next.y)
    scale = (next.h * worldHeight) / CHARACTER_HEIGHT
    facing = next.spot.face
    discColor.set(paletteColor(next.spot.disc))
    update(10, 1, 0.5)
    render()
  }

  function render() {
    renderer.render(scene, camera)
  }

  function project(x: number, y: number) {
    const vector = new THREE.Vector3(x, y, 0).project(camera)
    return { x: ((vector.x + 1) / 2) * width, y: ((1 - vector.y) / 2) * height }
  }

  function update(dt: number, time: number, actionTime: number) {
    const next = target()
    const wantX = worldX(next.x)
    const wantY = worldY(next.y)
    const wantScale = (next.h * worldHeight) / CHARACTER_HEIGHT

    if (dragging) {
      const before = posX
      const follow = 1 - Math.exp(-dt * 18)
      posX += (((dragX / width) * 2 - 1) * ((worldHeight * aspect) / 2) - posX) * follow
      const reach = (1 - (dragY / height) * 2) * (worldHeight / 2) - posY - scale * 2.7
      hop = Math.max(0, hop + (reach - hop) * follow)
      hopVelocity = 0
      const sway = THREE.MathUtils.clamp(((posX - before) / Math.max(dt, 0.001)) * -0.05, -0.45, 0.45)
      tilt += (sway - tilt) * (1 - Math.exp(-dt * 10))
    } else {
      tilt -= tilt * (1 - Math.exp(-dt * 8))
    }

    const distance = wantX - posX
    const moving = Math.abs(distance) > 0.06 && hop === 0 && !dragging
    if (moving && !reduced) {
      const speed = Math.max(worldHeight * aspect * 0.42, 6)
      const step = Math.sign(distance) * Math.min(Math.abs(distance), speed * dt)
      posX += step
      stride += dt * 10.5
      arrived = false
    } else if (hop === 0 && !dragging) {
      posX = wantX
      if (!arrived) {
        arrived = true
        actionStart = time
        actionTime = 0
      }
    }
    posY += (wantY - posY) * (1 - Math.exp(-dt * 6))
    scale += (wantScale - scale) * (1 - Math.exp(-dt * 6))
    walk += ((moving ? 1 : 0) - walk) * (1 - Math.exp(-dt * 12))

    const wantFacing = dragging ? 0 : moving ? Math.sign(distance) * 1.2 : next.spot.face
    facing += (wantFacing - facing) * (1 - Math.exp(-dt * 9))

    if (!dragging) {
      hopVelocity -= 34 * dt * scale
      hop += hopVelocity * dt
      if (hop <= 0) {
        hop = 0
        hopVelocity = 0
      }
    }

    const root = character.root
    root.position.set(posX, posY + hop, 0)
    root.scale.setScalar(scale)
    root.rotation.y = facing
    root.rotation.z = tilt

    const center = project(posX, posY + scale * 2.6)
    const look = { x: 0, y: 0 }
    if (hasPointer && !reduced) {
      look.x = THREE.MathUtils.clamp((pointerX - center.x) / (width * 0.42), -0.55, 0.55) - facing * 0.6
      look.y = THREE.MathUtils.clamp((pointerY - center.y) / (height * 0.7), -0.28, 0.32)
    } else {
      look.x = -facing * 0.5
    }

    const action: Action = dragging ? 'dangle' : time < hoverUntil ? 'wave' : talking ? 'talk' : (spotId === 'casestudy' && actionOverride) || next.spot.action
    character.update(dt, time, action, dragging ? time : time < hoverUntil ? 0.3 + time : actionTime, walk, stride, look)

    const fade = 1 - Math.exp(-dt * 5)
    discColor.lerp(new THREE.Color(paletteColor(next.spot.disc)), fade)
    const lighting = LIGHTING[theme]
    hemi.color.lerp(lighting.sky, fade)
    hemi.groundColor.lerp(lighting.ground, fade)
    hemi.intensity += (lighting.hemi - hemi.intensity) * fade
    sun.color.lerp(lighting.sun, fade)
    sun.intensity += (lighting.direct - sun.intensity) * fade
    starMaterial.opacity += ((theme === 'dark' ? 0.9 : 0) - starMaterial.opacity) * fade
    discMaterial.color.copy(discColor)
    const discRadius = scale * 1.95
    disc.position.set(posX, posY + scale * 1.75, -4)
    disc.scale.setScalar(discRadius * 1.12)
    blob.position.set(posX, posY + scale * 0.02, 0.5)
    blob.scale.set(scale * 2.5 * (1 - Math.min(hop / (scale * 3), 0.5)), scale * 0.62, 1)

    placeOverlays(dragging || (next.showBubble && walk < 0.3 && hop < scale * 0.4))
  }

  function placeOverlays(showBubble: boolean) {
    // The bubble sits beside the head, on whichever side has room.
    const head = project(posX, posY + hop + scale * 2.9)
    const gap = project(posX + scale * 1.05, posY).x - project(posX, posY).x
    const bubbleWidth = refs.bubble.offsetWidth
    const bubbleHeight = refs.bubble.offsetHeight
    const fitsRight = head.x + gap + bubbleWidth < width - 12
    // Past the first screen the sides hold content, so on wide screens the bubble goes above his head.
    const above = !compact && spotId !== 'hero' && !dragging
    const crown = project(posX, posY + hop + scale * CHARACTER_HEIGHT)
    const bubbleX = above
      ? THREE.MathUtils.clamp(crown.x - bubbleWidth / 2, 12, width - bubbleWidth - 12)
      : fitsRight ? head.x + gap : Math.max(12, head.x - gap - bubbleWidth)
    const bubbleY = above
      ? Math.max(12, crown.y - bubbleHeight - 12)
      : THREE.MathUtils.clamp(head.y - bubbleHeight * 0.75, 12, height - bubbleHeight - 12)
    refs.bubble.style.transform = `translate(${bubbleX}px, ${bubbleY}px)`
    refs.bubble.dataset.show = String(showBubble)
    refs.bubble.dataset.side = above ? 'above' : fitsRight ? 'right' : 'left'

    const feet = project(posX, posY)
    const top = project(posX, posY + scale * CHARACTER_HEIGHT)
    const boxHeight = feet.y - top.y
    refs.hit.style.transform = `translate(${feet.x - boxHeight * 0.3}px, ${top.y}px)`
    refs.hit.style.width = `${boxHeight * 0.6}px`
    refs.hit.style.height = `${boxHeight}px`
  }

  // Slow devices lose the soft shadows and extra resolution.
  let sampled = 0
  let sampledTime = 0
  let degraded = false
  function trackPerformance(dt: number) {
    if (degraded || sampled > 150) return
    sampled += 1
    sampledTime += dt
    if (sampled === 150 && sampledTime / sampled > 1 / 26) {
      degraded = true
      sun.castShadow = false
      renderer.setPixelRatio(1)
      resize()
    }
  }

  let frame = 0
  let previous = performance.now()
  function loop(now: number) {
    frame = requestAnimationFrame(loop)
    if (document.hidden) {
      previous = now
      return
    }
    const dt = Math.min((now - previous) / 1000, 0.5)
    previous = now
    const time = now / 1000
    trackPerformance(dt)
    update(dt, time, time - actionStart)
    render()
  }

  const onPointer = (event: PointerEvent) => {
    hasPointer = true
    pointerX = event.clientX
    pointerY = event.clientY
  }
  const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches
  if (fine && !reduced) window.addEventListener('pointermove', onPointer, { passive: true })

  const onHitEnter = () => {
    hoverUntil = performance.now() / 1000 + 2.4
  }
  const tap = () => {
    if (compact && spotId !== 'hero') menuOpen = !menuOpen
    if (reduced) {
      settle()
      return
    }
    if (hop === 0) hopVelocity = scale * 9
    hoverUntil = performance.now() / 1000 + 2.4
  }
  const onHitDown = (event: PointerEvent) => {
    pressed = true
    downX = dragX = event.clientX
    downY = dragY = event.clientY
    refs.hit.setPointerCapture(event.pointerId)
  }
  const onHitMove = (event: PointerEvent) => {
    if (!pressed) return
    dragX = event.clientX
    dragY = event.clientY
    if (!dragging && !reduced && Math.hypot(dragX - downX, dragY - downY) > 8) {
      dragging = true
      onGrab(true)
    }
  }
  const onHitUp = () => {
    if (!pressed) return
    pressed = false
    if (dragging) {
      dragging = false
      onGrab(false)
    } else {
      tap()
    }
  }
  // Keyboard activation has no pointer events, and reports a click with detail 0.
  const onHitClick = (event: MouseEvent) => {
    if (event.detail === 0) tap()
  }
  refs.hit.addEventListener('pointerenter', onHitEnter)
  refs.hit.addEventListener('pointerdown', onHitDown)
  refs.hit.addEventListener('pointermove', onHitMove)
  refs.hit.addEventListener('pointerup', onHitUp)
  refs.hit.addEventListener('pointercancel', onHitUp)
  refs.hit.addEventListener('click', onHitClick)

  function applyTint() {
    document.documentElement.style.setProperty('--tint', paletteColor(SPOTS[spotId].tint))
  }
  applyTint()

  const resizer = new ResizeObserver(resize)
  resizer.observe(host)
  resize()

  if (reduced) {
    settle()
  } else {
    const start = target()
    scale = (start.h * worldHeight) / CHARACTER_HEIGHT
    posX = worldX(1) + scale * 1.6
    posY = worldY(start.y)
    frame = requestAnimationFrame(loop)
  }

  return {
    setSpot(id) {
      if (id === spotId) return
      spotId = id
      arrived = false
      applyTint()
      if (reduced) settle()
    },
    setTheme(next) {
      if (next === theme) return
      theme = next
      applyTint()
      if (reduced) settle()
    },
    setTalking(next) {
      if (next === talking) return
      talking = next
      actionStart = performance.now() / 1000
      if (reduced) settle()
    },
    setAction(action) {
      if (action === actionOverride) return
      actionOverride = action
      actionStart = performance.now() / 1000
      if (reduced) settle()
    },
    celebrate() {
      if (reduced) return
      if (hop === 0) hopVelocity = scale * 9
      hoverUntil = performance.now() / 1000 + 2.8
    },
    closeMenu() {
      menuOpen = false
      if (reduced) settle()
    },
    dispose() {
      cancelAnimationFrame(frame)
      window.removeEventListener('pointermove', onPointer)
      refs.hit.removeEventListener('pointerenter', onHitEnter)
      refs.hit.removeEventListener('pointerdown', onHitDown)
      refs.hit.removeEventListener('pointermove', onHitMove)
      refs.hit.removeEventListener('pointerup', onHitUp)
      refs.hit.removeEventListener('pointercancel', onHitUp)
      refs.hit.removeEventListener('click', onHitClick)
      resizer.disconnect()
      scene.traverse((object) => {
        if (object instanceof THREE.Mesh) {
          object.geometry.dispose()
          const materials = Array.isArray(object.material) ? object.material : [object.material]
          materials.forEach((m: THREE.Material) => m.dispose())
        }
      })
      blobTexture.dispose()
      renderer.dispose()
      renderer.domElement.remove()
    },
  }
}
