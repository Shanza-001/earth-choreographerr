import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import './MoveLab.css'

type LabKey = 'subsidence' | 'glacier' | 'flood' | 'flash'

interface MoveLabProps {
  /** Optional. Pass the selected place's `move` to keep the lab in sync with the globe. */
  move?: string
}

interface Out {
  y: number
  d: number
}

interface LabScene {
  key: LabKey
  name: string
  color: string
  read: string
  height: (x: number, z: number, t: number, out: Out) => void
  paint: (c: THREE.Color, y: number, d: number, x: number, z: number, t: number, time: number) => void
}

const SEGMENTS = 120

function rock(c: THREE.Color, h: number, g = 0.42) {
  c.setRGB(g + h * 0.18, g * 0.86 + h * 0.12, g * 0.7 + h * 0.08)
}

const SCENES: LabScene[] = [
  {
    key: 'subsidence',
    name: 'Subsidence',
    color: '#f1bb74',
    read: 'Each rainbow band is about 12 cm of ground motion along the satellite’s line of sight (half an L-band wavelength). As the land sinks, bands appear and multiply. This is an interferogram forming.',
    height(x, z, t, out) {
      const base = 0.12 * Math.sin(x * 1.3) * Math.cos(z * 1.1)
      const d = t * Math.exp(-(x * x + z * z) / 1.8)
      out.y = base - d * 0.85
      out.d = d
    },
    paint(c, y, d) {
      rock(c, y + 0.3)
      const a = Math.min(1, d * 5)
      if (a > 0) {
        const r = c.r
        const g = c.g
        const b = c.b
        c.setHSL((d * 7) % 1, 0.85, 0.52)
        c.r = r + (c.r - r) * a
        c.g = g + (c.g - g) * a
        c.b = b + (c.b - b) * a
      }
    },
  },
  {
    key: 'glacier',
    name: 'Glacier flow',
    color: '#8fd8ff',
    read: 'Ice flows fastest down the middle of the valley and slowest at the edges. Radar speckle tracking follows these stripes between passes to measure speed.',
    height(x, z, _t, out) {
      out.y = 0.32 * z * z - 0.28 * x + 0.07 * Math.sin(x * 2.4)
      out.d = 0
    },
    paint(c, y, _d, x, z, t) {
      if (Math.abs(z) < 1.25) {
        const speed = 1 - (z / 1.4) ** 2
        const s = Math.sin((x - t * 2.6 * speed) * 5 + Math.sin(z * 3))
        c.setRGB(0.62 + 0.2 * s, 0.82 + 0.1 * s, 1)
      } else {
        rock(c, y * 0.4 + 0.3, 0.36)
      }
    },
  },
  {
    key: 'flood',
    name: 'Flood and wetland',
    color: '#5fe0cf',
    read: 'Rain fills the lowest ground first. Calm water reflects radar away from the satellite, so floods show up as dark patches, even through cloud and at night.',
    height(x, z, t, out) {
      const ground = 0.08 * (x * x + z * z) + 0.1 * Math.sin(x * 2.1) * Math.sin(z * 1.7) - 0.5
      const level = -0.55 + t * 0.95
      out.y = Math.max(ground, level)
      out.d = level - ground
    },
    paint(c, y, d) {
      if (d > 0) c.setRGB(0.04, 0.35 - Math.min(0.2, d * 0.3), 0.55 + Math.min(0.4, d))
      else rock(c, y + 0.5, 0.3 + 0.1 * Math.sin(y * 9))
    },
  },
  {
    key: 'flash',
    name: 'Fire scar',
    color: '#ff6a45',
    read: 'A burn front sweeps outward, then fades. Burned forest loses the rough, leafy texture radar likes, so the scar appears as a change in backscatter.',
    height(x, z, _t, out) {
      out.y = 0.25 * Math.sin(x * 0.9) * Math.cos(z * 0.8) + 0.1 * Math.sin(x * 3) * Math.sin(z * 2.7)
      out.d = 0
    },
    paint(c, y, _d, x, z, t, time) {
      const r = Math.hypot(x - 0.3, z + 0.2) + 0.28 * Math.sin(Math.atan2(z + 0.2, x - 0.3) * 5)
      const front = t * 3.6
      if (r < front - 0.3) {
        c.setRGB(0.07 + 0.03 * Math.sin(x * 9), 0.06, 0.06)
      } else if (r < front) {
        const k = 0.6 + 0.4 * Math.sin(time * 14)
        c.setRGB(1, 0.35 + 0.4 * k, 0.1)
      } else {
        c.setRGB(0.08, 0.3 + y * 0.4, 0.12)
      }
    },
  },
]

function keyFor(move?: string): LabKey {
  const m = (move ?? '').toLowerCase()
  if (m.includes('glac')) return 'glacier'
  if (m.includes('flood') || m.includes('wet')) return 'flood'
  if (m.includes('flash') || m.includes('fire')) return 'flash'
  return 'subsidence'
}

export function MoveLab({ move }: MoveLabProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const rangeRef = useRef<HTMLInputElement>(null)
  const [tab, setTab] = useState<LabKey>(keyFor(move))
  const [playing, setPlaying] = useState(() => !window.matchMedia('(prefers-reduced-motion: reduce)').matches)

  // The render loop reads these without re-creating the scene.
  const tabRef = useRef<LabKey>(tab)
  const playRef = useRef(playing)
  const timeRef = useRef(0)

  useEffect(() => {
    tabRef.current = tab
    timeRef.current = 0
    if (rangeRef.current) rangeRef.current.value = '0'
  }, [tab])
  useEffect(() => {
    playRef.current = playing
  }, [playing])
  useEffect(() => {
    if (move) setTab(keyFor(move))
  }, [move])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const host = canvas.parentElement
    if (!host) return

    let renderer: THREE.WebGLRenderer
    try {
      renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'low-power' })
    } catch {
      host.dataset.labError = 'webgl'
      return
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5))

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 50)
    camera.position.set(4.2, 4.4, 6.2)
    scene.add(new THREE.AmbientLight(0x8fa4d8, 1.1))
    const sun = new THREE.DirectionalLight(0xffffff, 2.2)
    sun.position.set(-3, 5, 3)
    scene.add(sun)

    const geometry = new THREE.PlaneGeometry(6, 6, SEGMENTS, SEGMENTS)
    geometry.rotateX(-Math.PI / 2)
    const position = geometry.attributes.position as THREE.BufferAttribute
    const count = position.count
    const colors = new Float32Array(count * 3)
    const colorAttr = new THREE.BufferAttribute(colors, 3)
    geometry.setAttribute('color', colorAttr)
    const xs = new Float32Array(count)
    const zs = new Float32Array(count)
    for (let i = 0; i < count; i++) {
      xs[i] = position.getX(i)
      zs[i] = position.getZ(i)
    }
    const material = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.9 })
    const terrain = new THREE.Mesh(geometry, material)
    scene.add(terrain)

    const controls = new OrbitControls(camera, canvas)
    controls.enablePan = false
    controls.enableZoom = false
    controls.enableDamping = true
    controls.target.set(0, -0.2, 0)
    controls.minPolarAngle = 0.35
    controls.maxPolarAngle = 1.35
    controls.autoRotate = !window.matchMedia('(prefers-reduced-motion: reduce)').matches
    controls.autoRotateSpeed = 0.9

    const color = new THREE.Color()
    const out: Out = { y: 0, d: 0 }
    const update = (time: number) => {
      const lab = SCENES.find((s) => s.key === tabRef.current) ?? SCENES[0]
      const t = Math.min(1, timeRef.current)
      for (let i = 0; i < count; i++) {
        lab.height(xs[i], zs[i], t, out)
        position.setY(i, out.y)
        lab.paint(color, out.y, out.d, xs[i], zs[i], t, time)
        colors[i * 3] = color.r
        colors[i * 3 + 1] = color.g
        colors[i * 3 + 2] = color.b
      }
      position.needsUpdate = true
      colorAttr.needsUpdate = true
      geometry.computeVertexNormals()
    }

    const resize = () => {
      const { width, height } = host.getBoundingClientRect()
      if (width === 0 || height === 0) return
      renderer.setSize(width, height, false)
      camera.aspect = width / height
      camera.updateProjectionMatrix()
    }
    const resizeObserver = new ResizeObserver(resize)
    resizeObserver.observe(host)
    resize()

    let disposed = false
    let visible = false
    let frameId = 0
    let last = performance.now()
    const draw = (now: number) => {
      if (disposed || !visible) {
        frameId = 0
        return
      }
      const dt = Math.min(0.05, (now - last) / 1000)
      last = now
      if (playRef.current) {
        timeRef.current = (timeRef.current + dt * 0.18) % 1.15 // short hold at the end of each loop
        if (rangeRef.current) rangeRef.current.value = String(Math.min(1, timeRef.current) * 100)
      }
      update(now * 0.001)
      controls.update()
      renderer.render(scene, camera)
      frameId = window.requestAnimationFrame(draw)
    }
    const visibilityObserver = new IntersectionObserver(([entry]) => {
      visible = entry?.isIntersecting ?? false
      if (visible && frameId === 0) {
        last = performance.now()
        frameId = window.requestAnimationFrame(draw)
      }
    })
    visibilityObserver.observe(host)

    return () => {
      disposed = true
      if (frameId !== 0) window.cancelAnimationFrame(frameId)
      resizeObserver.disconnect()
      visibilityObserver.disconnect()
      controls.dispose()
      geometry.dispose()
      material.dispose()
      renderer.dispose()
    }
  }, [])

  const lab = SCENES.find((s) => s.key === tab) ?? SCENES[0]

  return (
    <section className="mlab" id="move-lab" aria-labelledby="mlab-title">
      <h2 id="mlab-title">Scrub time. See what radar sees.</h2>
      <p className="mlab__lead">
        Each dance move is a different kind of surface change. Drag the slider to run time forward on a sample
        landscape and see how it shows up in radar. Drag the terrain to look around.
      </p>
      <div className="mlab__stage">
        <canvas
          ref={canvasRef}
          className="mlab__canvas"
          role="img"
          aria-label={`3D sample terrain showing ${lab.name} changing over time`}
        />
        <span className="mlab__badge">Illustrative terrain · not NISAR data</span>
      </div>
      <div className="mlab__bar">
        <div className="mlab__tabs" role="group" aria-label="Choose a dance move">
          {SCENES.map((s) => (
            <button
              key={s.key}
              type="button"
              className="mlab__tab"
              style={{ ['--tab' as string]: s.color }}
              aria-pressed={tab === s.key}
              onClick={() => setTab(s.key)}
            >
              {s.name}
            </button>
          ))}
        </div>
        <button
          type="button"
          className="mlab__play"
          aria-label={playing ? 'Pause animation' : 'Play animation'}
          onClick={() => setPlaying((p) => !p)}
        >
          {playing ? '❚❚' : '▶'}
        </button>
        <input
          ref={rangeRef}
          className="mlab__range"
          type="range"
          min={0}
          max={100}
          defaultValue={0}
          aria-label="Time"
          onInput={(e) => {
            timeRef.current = Number((e.target as HTMLInputElement).value) / 100
            setPlaying(false)
          }}
        />
      </div>
      <p className="mlab__read" aria-live="polite">{lab.read}</p>
    </section>
  )
}