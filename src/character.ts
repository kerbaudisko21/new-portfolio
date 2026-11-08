import * as THREE from 'three'
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js'

export type Action = 'wave' | 'clipboard' | 'phone' | 'laptop' | 'think' | 'letter' | 'dangle' | 'talk'
type V3 = [number, number, number]

export const CHARACTER_HEIGHT = 3.4

const JOINTS = ['torso', 'head', 'shA', 'elA', 'shB', 'elB', 'hipA', 'knA', 'hipB', 'knB'] as const
type JointName = (typeof JOINTS)[number]
type Pose = Partial<Record<JointName, V3>> & { lift?: number }

const COLORS = {
  skin: '#F3CDAA',
  hair: '#23232B',
  suit: '#33405A',
  suitDark: '#2A3550',
  shirt: '#FBFBF8',
  tie: '#3C9A76',
  shoe: '#4A3A33',
  cheek: '#F0A79A',
  wood: '#E3B77F',
  paper: '#FFFFFF',
  metal: '#D6DCE5',
  screen: '#8FD6BA',
  pouf: '#B9CFE6',
  flap: '#F4D489',
}

const material = (color: string) => new THREE.MeshStandardMaterial({ color, roughness: 0.68 })

function shaded<T extends THREE.Object3D>(object: T) {
  object.castShadow = true
  object.receiveShadow = true
  return object
}

function ball(color: string, radius: number, scale: V3 = [1, 1, 1], position: V3 = [0, 0, 0]) {
  const mesh = shaded(new THREE.Mesh(new THREE.SphereGeometry(radius, 32, 24), material(color)))
  mesh.scale.set(...scale)
  mesh.position.set(...position)
  return mesh
}

function limb(color: string, radius: number, length: number, y: number) {
  const mesh = shaded(new THREE.Mesh(new THREE.CapsuleGeometry(radius, length, 8, 16), material(color)))
  mesh.position.y = y
  return mesh
}

function block(color: string, size: V3, position: V3 = [0, 0, 0], radius = 0.03) {
  const mesh = shaded(new THREE.Mesh(new RoundedBoxGeometry(size[0], size[1], size[2], 3, radius), material(color)))
  mesh.position.set(...position)
  return mesh
}

function group(position: V3 = [0, 0, 0], ...children: THREE.Object3D[]) {
  const g = new THREE.Group()
  g.position.set(...position)
  if (children.length) g.add(...children)
  return g
}

function buildArm(side: 1 | -1) {
  const hand = ball(COLORS.skin, 0.135, [1, 1, 1], [0, -0.45, 0])
  const cuff = limb(COLORS.shirt, 0.102, 0.03, -0.33)
  const elbow = group([0, -0.42, 0], limb(COLORS.suit, 0.105, 0.2, -0.13), cuff, hand)
  const shoulder = group([side * 0.5, 0.93, 0], limb(COLORS.suit, 0.125, 0.26, -0.2), elbow)
  return { shoulder, elbow }
}

function buildLeg(side: 1 | -1) {
  const shoe = ball(COLORS.shoe, 0.17, [0.92, 0.62, 1.35], [0, -0.42, 0.07])
  const knee = group([0, -0.4, 0], limb(COLORS.suitDark, 0.13, 0.2, -0.14), shoe)
  const hip = group([side * 0.2, 0, 0], limb(COLORS.suitDark, 0.15, 0.22, -0.2), knee)
  return { hip, knee }
}

function buildHead() {
  const head = group([0, 1.3, 0])
  const center = 0.58
  const radii: V3 = [0.76, 0.69, 0.69]
  const onFace = (x: number, y: number, lift = 0): V3 => {
    const z = radii[2] * Math.sqrt(Math.max(0.02, 1 - (x / radii[0]) ** 2 - (y / radii[1]) ** 2))
    return [x, center + y, z + lift]
  }

  head.add(ball(COLORS.skin, 1, radii, [0, center, 0]))
  head.add(ball(COLORS.skin, 0.15, [0.72, 1.05, 0.72], [0.76, center - 0.02, 0.02]))
  head.add(ball(COLORS.skin, 0.15, [0.72, 1.05, 0.72], [-0.76, center - 0.02, 0.02]))

  const eyes = [-0.27, 0.27].map((x) => {
    const eye = group(onFace(x, -0.02, -0.02), ball(COLORS.hair, 0.1, [0.92, 1.2, 0.5]))
    eye.add(ball(COLORS.paper, 0.032, [1, 1, 0.5], [0.028, 0.05, 0.05]))
    head.add(eye)
    return eye
  })

  ;[-0.27, 0.27].forEach((x) => {
    const brow = shaded(new THREE.Mesh(new THREE.CapsuleGeometry(0.024, 0.13, 6, 10), material(COLORS.hair)))
    brow.position.set(...onFace(x, 0.2, 0.012))
    brow.rotation.z = Math.PI / 2 + (x > 0 ? 0.14 : -0.14)
    head.add(brow)
    head.add(ball(COLORS.cheek, 0.12, [1.05, 0.6, 0.22], onFace(x * 1.55, -0.2, -0.015)))
  })

  head.add(ball('#EBB892', 0.05, [1, 0.8, 0.7], onFace(0, -0.12, 0.012)))
  const smile = new THREE.Mesh(new THREE.TorusGeometry(0.105, 0.021, 8, 24, Math.PI * 0.86), material('#9A4F45'))
  smile.position.set(...onFace(0, -0.2, 0.0))
  smile.rotation.z = Math.PI + Math.PI * 0.07
  head.add(smile)

  // Short, neat hair: a cap tilted back, with a side-swept fringe.
  const cap = shaded(new THREE.Mesh(new THREE.SphereGeometry(1, 40, 28, 0, Math.PI * 2, 0, 1.56), material(COLORS.hair)))
  cap.position.set(0, center + 0.01, -0.01)
  cap.scale.set(radii[0] * 1.05, radii[1] * 1.07, radii[2] * 1.06)
  cap.rotation.x = -0.5
  head.add(cap)
  const fringe = ball(COLORS.hair, 0.3, [1.5, 0.5, 0.42], onFace(-0.2, 0.42, -0.02))
  fringe.rotation.set(-0.5, 0, 0.42)
  head.add(fringe)
  const sweep = ball(COLORS.hair, 0.24, [1.45, 0.48, 0.42], onFace(0.34, 0.42, -0.03))
  sweep.rotation.set(-0.5, 0, -0.5)
  head.add(sweep)

  return { head, eyes, smile }
}

function buildClipboard() {
  const board = block(COLORS.wood, [0.66, 0.86, 0.04], [0, 0, 0], 0.018)
  const paper = block(COLORS.paper, [0.54, 0.7, 0.012], [0, -0.04, 0.03], 0.004)
  const clip = block(COLORS.metal, [0.24, 0.09, 0.05], [0, 0.42, 0.04], 0.016)
  const lines = [0.16, 0.04, -0.08, -0.2].map((y, i) => block(i === 0 ? COLORS.tie : COLORS.metal, [i === 3 ? 0.26 : 0.42, 0.028, 0.008], [i === 3 ? -0.08 : 0, y, 0.04], 0.003))
  return group([0, 0, 0], board, paper, clip, ...lines)
}

function buildLaptop() {
  const base = block(COLORS.metal, [1, 0.05, 0.66], [0, 0, 0], 0.02)
  // The hinge is on the far side, so visitors see the back of the lid and he sees the screen.
  const shell = block(COLORS.metal, [1, 0.5, 0.035], [0, 0.25, 0], 0.02)
  const glow = block(COLORS.screen, [0.9, 0.42, 0.006], [0, 0.25, -0.021], 0.002)
  const logo = ball(COLORS.tie, 0.07, [1, 1, 0.2], [0, 0.26, 0.02])
  const lid = group([0, 0.02, 0.32], shell, glow, logo)
  lid.rotation.x = 0.26
  return group([0, 0, 0], base, lid)
}

function buildLetter() {
  const body = block(COLORS.paper, [0.74, 0.5, 0.03], [0, 0, 0], 0.012)
  const flapShape = new THREE.Shape()
  flapShape.moveTo(-0.36, 0.24)
  flapShape.lineTo(0.36, 0.24)
  flapShape.lineTo(0, -0.05)
  flapShape.closePath()
  const flap = new THREE.Mesh(new THREE.ShapeGeometry(flapShape), material(COLORS.flap))
  flap.position.z = 0.018
  const seal = ball(COLORS.tie, 0.06, [1, 1, 0.3], [0, -0.04, 0.03])
  return group([0, 0, 0], body, flap, seal)
}

const NEUTRAL: Pose = {
  torso: [0, 0, 0],
  head: [0, 0, 0],
  shA: [0, 0, 0.13],
  elA: [-0.14, 0, 0],
  shB: [0, 0, -0.13],
  elB: [-0.14, 0, 0],
  hipA: [0, 0, 0.02],
  knA: [0, 0, 0],
  hipB: [0, 0, -0.02],
  knB: [0, 0, 0],
  lift: 0,
}

const POSES: Record<Action, (t: number) => Pose> = {
  talk(t) {
    return {
      shA: [-0.72, -0.2, 0.26],
      elA: [-1.2 + Math.sin(t * 3.1) * 0.2, 0, Math.sin(t * 1.9) * 0.12],
      head: [Math.sin(t * 2.4) * 0.05, Math.sin(t * 1.1) * 0.09, Math.sin(t * 1.7) * 0.035],
    }
  },
  dangle(t) {
    const kick = Math.sin(t * 11) * 0.42
    return {
      shA: [0, 0, 2.5],
      elA: [0, 0, 0.3],
      shB: [0, 0, -2.5],
      elB: [0, 0, -0.3],
      hipA: [kick, 0, 0.08],
      knA: [0.5 + kick * 0.5, 0, 0],
      hipB: [-kick, 0, -0.08],
      knB: [0.5 - kick * 0.5, 0, 0],
      head: [0.14, 0, Math.sin(t * 5) * 0.08],
    }
  },
  wave(t) {
    const cycle = t % 6.4
    if (cycle > 2.8) return {}
    return {
      shB: [0, 0, -2.5],
      elB: [-0.25, 0, Math.sin(t * 9.5) * 0.42],
      torso: [0, 0, -0.05],
      head: [0, 0, -0.1],
    }
  },
  clipboard(t) {
    return {
      shA: [-0.82, -0.32, 0.12],
      elA: [-1.3, 0.1, 0],
      shB: [-0.82, 0.42, -0.08],
      elB: [-1.18 + Math.sin(t * 8) * 0.07, 0, Math.sin(t * 4) * 0.08],
      head: [0.3 + Math.sin(t * 0.8) * 0.03, 0, 0.04],
    }
  },
  phone(t) {
    return {
      shA: [-0.9, -0.38, 0.1],
      elA: [-1.45, 0.1, 0],
      head: [0.3, 0.06, 0.06 + Math.sin(t * 1.3) * 0.03],
      torso: [0.03, 0, 0],
    }
  },
  laptop(t) {
    const typeA = Math.sin(t * 15) * 0.09
    const typeB = Math.sin(t * 13 + 1.4) * 0.09
    return {
      lift: -0.36,
      hipA: [-1.5, 0, 0.1],
      knA: [1.5, 0, 0],
      hipB: [-1.5, 0, -0.1],
      knB: [1.5, 0, 0],
      shA: [-0.62, -0.1, 0.12],
      elA: [-0.92 + typeA, 0, 0],
      shB: [-0.62, 0.1, -0.12],
      elB: [-0.92 + typeB, 0, 0],
      torso: [0.1, 0, 0],
      head: [0.26 + Math.sin(t * 7) * 0.012, 0, 0],
    }
  },
  think(t) {
    return {
      shA: [-1.15, -0.55, 0.2],
      elA: [-2.15, 0.1, 0],
      head: [-0.12, 0.2 * Math.sin(t * 0.6), 0.14],
      torso: [0, 0, 0.03],
    }
  },
  letter(t) {
    const cycle = t % 5
    return {
      shA: [-1.75, 0, 0.32],
      elA: [-0.32, 0, 0],
      shB: cycle < 2.6 ? [0, 0, -2.5] : [0, 0, -0.13],
      elB: cycle < 2.6 ? [-0.25, 0, Math.sin(t * 9.5) * 0.42] : [-0.14, 0, 0],
      head: [-0.06, 0, 0.05],
    }
  },
}

const PROPS_FOR: Record<Action, string[]> = {
  wave: [],
  clipboard: ['clipboard', 'pen'],
  phone: ['phone'],
  laptop: ['laptop', 'pouf'],
  think: ['orbit'],
  letter: ['letter'],
  dangle: [],
  talk: [],
}

export class Character {
  readonly root = new THREE.Group()
  private readonly pelvis: THREE.Group
  private readonly joints: Record<JointName, THREE.Object3D>
  private readonly eyes: THREE.Group[]
  private readonly smile: THREE.Mesh
  private readonly props: Record<string, THREE.Group> = {}
  private readonly orbiters: THREE.Object3D[] = []
  private nextBlink = 2
  private blinkUntil = 0

  constructor() {
    const armA = buildArm(1)
    const armB = buildArm(-1)
    const legA = buildLeg(1)
    const legB = buildLeg(-1)
    const { head, eyes, smile } = buildHead()
    this.eyes = eyes
    this.smile = smile

    const jacket = ball(COLORS.suit, 1, [0.5, 0.74, 0.4], [0, 0.56, 0])
    const neck = limb(COLORS.skin, 0.15, 0.1, 1.22)

    const vShape = new THREE.Shape()
    vShape.moveTo(-0.2, 0.42)
    vShape.lineTo(0.2, 0.42)
    vShape.lineTo(0, -0.14)
    vShape.closePath()
    const shirt = new THREE.Mesh(new THREE.ExtrudeGeometry(vShape, { depth: 0.04, bevelEnabled: false }), material(COLORS.shirt))
    shirt.position.set(0, 0.76, 0.372)
    shirt.rotation.x = -0.31

    const tieKnot = block(COLORS.tie, [0.12, 0.1, 0.06], [0, 1.1, 0.3], 0.02)
    tieKnot.rotation.x = -0.31
    const tieShape = new THREE.Shape()
    tieShape.moveTo(-0.045, 0.24)
    tieShape.lineTo(0.045, 0.24)
    tieShape.lineTo(0.065, -0.08)
    tieShape.lineTo(0, -0.18)
    tieShape.lineTo(-0.065, -0.08)
    tieShape.closePath()
    const tie = new THREE.Mesh(new THREE.ExtrudeGeometry(tieShape, { depth: 0.02, bevelEnabled: false }), material(COLORS.tie))
    tie.position.set(0, 0.8, 0.383)
    tie.rotation.x = -0.31

    const lapelA = block(COLORS.suitDark, [0.11, 0.52, 0.035], [0.15, 0.92, 0.355], 0.015)
    lapelA.rotation.set(-0.31, 0, 0.34)
    const lapelB = block(COLORS.suitDark, [0.11, 0.52, 0.035], [-0.15, 0.92, 0.355], 0.015)
    lapelB.rotation.set(-0.31, 0, -0.34)

    const torso = group([0, 0, 0], jacket, neck, shirt, tie, tieKnot, lapelA, lapelB, armA.shoulder, armB.shoulder, head)
    this.pelvis = group([0, 0.78, 0], legA.hip, legB.hip, torso)
    this.root.add(this.pelvis)

    this.joints = {
      torso,
      head,
      shA: armA.shoulder,
      elA: armA.elbow,
      shB: armB.shoulder,
      elB: armB.elbow,
      hipA: legA.hip,
      knA: legA.knee,
      hipB: legB.hip,
      knB: legB.knee,
    }

    this.addProps(armA.elbow, armB.elbow, head)
  }

  private addProp(name: string, parent: THREE.Object3D, prop: THREE.Group) {
    prop.scale.setScalar(0.001)
    prop.visible = false
    parent.add(prop)
    this.props[name] = prop
  }

  private addProps(handA: THREE.Object3D, handB: THREE.Object3D, head: THREE.Object3D) {
    const clipboard = group([0.02, -0.54, 0.2], buildClipboard())
    clipboard.rotation.set(1.05, 0.12, 0.28)
    this.addProp('clipboard', handA, clipboard)

    const pen = group([0, -0.5, 0.04], shaded(new THREE.Mesh(new THREE.CapsuleGeometry(0.02, 0.32, 4, 8), material(COLORS.tie))))
    pen.rotation.set(0.9, 0, 0.5)
    this.addProp('pen', handB, pen)

    const phone = group([0, -0.55, 0.07], block('#3A4660', [0.3, 0.56, 0.04], [0, 0, 0], 0.016), block(COLORS.screen, [0.25, 0.48, 0.006], [0, 0, 0.023], 0.002))
    phone.rotation.set(1.15, 0, 0.1)
    this.addProp('phone', handA, phone)

    const laptop = group([0, 0.72, 0.62], buildLaptop())
    this.addProp('laptop', this.root, laptop)

    const pouf = group([0, 0.2, -0.05], ball(COLORS.pouf, 0.6, [1.08, 0.5, 1.08]))
    this.addProp('pouf', this.root, pouf)

    const letter = group([0, -0.6, 0.27], buildLetter())
    letter.rotation.set(2.07, 0, 0)
    this.addProp('letter', handA, letter)

    const colors = [COLORS.tie, COLORS.flap, COLORS.pouf]
    this.orbiters.push(...colors.map((color) => block(color, [0.3, 0.3, 0.3], [0, 0, 0], 0.07)))
    this.addProp('orbit', head, group([0, 1.75, 0], ...this.orbiters))
  }

  /** Advances the rig. `walk` is 0 when still and 1 when fully walking. */
  update(dt: number, time: number, action: Action, actionTime: number, walk: number, stride: number, look: { x: number; y: number }) {
    const standing = walk > 0.05
    const pose: Pose = { ...NEUTRAL, ...(standing ? {} : POSES[action](actionTime)) }

    const swing = Math.sin(stride)
    const walkPose: Pose = {
      hipA: [-swing * 0.72, 0, 0.02],
      hipB: [swing * 0.72, 0, -0.02],
      knA: [Math.max(0, Math.sin(stride + 1.2)) * 0.95, 0, 0],
      knB: [Math.max(0, -Math.sin(stride + 1.2)) * 0.95, 0, 0],
      shA: [swing * 0.55, 0, 0.1],
      shB: [-swing * 0.55, 0, -0.1],
      elA: [-0.42, 0, 0],
      elB: [-0.42, 0, 0],
      torso: [0.06, 0, 0],
      lift: Math.abs(Math.cos(stride)) * 0.06 - 0.03,
    }

    const blend = 1 - Math.exp(-dt * (standing ? 18 : 11))
    for (const name of JOINTS) {
      const joint = this.joints[name].rotation
      let [x, y, z] = pose[name] ?? NEUTRAL[name]!
      const walking = walkPose[name]
      if (walking && walk > 0) {
        x += (walking[0] - x) * walk
        y += (walking[1] - y) * walk
        z += (walking[2] - z) * walk
      }
      if (name === 'head') {
        x += look.y
        y += look.x
      }
      if (name === 'torso') x += Math.sin(time * 1.7) * 0.012
      joint.x += (x - joint.x) * blend
      joint.y += (y - joint.y) * blend
      joint.z += (z - joint.z) * blend
    }

    const targetLift = (pose.lift ?? 0) + (walkPose.lift! - (pose.lift ?? 0)) * walk
    const breathe = Math.sin(time * 1.7) * 0.012
    this.pelvis.position.y += (0.78 + targetLift + breathe - this.pelvis.position.y) * blend

    if (time > this.nextBlink) {
      this.blinkUntil = time + 0.13
      this.nextBlink = time + 2 + Math.random() * 3.2
    }
    const open = time < this.blinkUntil ? 0.1 : 1
    this.eyes.forEach((eye) => {
      eye.scale.y += (open - eye.scale.y) * (1 - Math.exp(-dt * 40))
    })

    const speaking = action === 'talk' && !standing
    const mouthY = speaking ? 1 + Math.abs(Math.sin(time * 11)) * 0.9 : 1
    this.smile.scale.y += (mouthY - this.smile.scale.y) * (1 - Math.exp(-dt * 30))

    const wanted = standing ? [] : PROPS_FOR[action]
    for (const [name, prop] of Object.entries(this.props)) {
      const target = wanted.includes(name) ? 1 : 0.001
      prop.scale.setScalar(prop.scale.x + (target - prop.scale.x) * (1 - Math.exp(-dt * 13)))
      prop.visible = prop.scale.x > 0.01
    }

    this.orbiters.forEach((cube, i) => {
      const angle = time * 1.25 + (i * Math.PI * 2) / this.orbiters.length
      cube.position.set(Math.cos(angle) * 0.82, Math.sin(time * 2 + i) * 0.1, Math.sin(angle) * 0.6)
      cube.rotation.set(time + i, time * 0.8, 0)
    })
  }
}
