import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import type { StoryLocation } from '../types'

/* A hotspot only needs these fields, so any StoryLocation works. */
type Hotspot = Pick<StoryLocation, 'id' | 'name' | 'coordinates'> & { move?: string }

interface EarthGlobeProps {
  location: StoryLocation
  variant: 'hero' | 'explorer'
  /** Optional. Pass all places to show one animated hotspot per dance move. */
  locations?: Hotspot[]
  /** Optional. Id of the selected place; the camera flies to it. */
  activeId?: string
  /** Optional. Called when a hotspot is clicked. */
  onSelect?: (id: string) => void
}

type Style = 'sink' | 'glide' | 'ripple' | 'flash'

const textureUrl = '/assets/earth-blue-marble.webp'

const STYLE_COLOR: Record<Style, number> = {
  sink: 0xf1bb74,
  glide: 0x8fd8ff,
  ripple: 0x5fe0cf,
  flash: 0xff6a45,
}

function styleFor(move?: string): Style {
  const m = (move ?? '').toLowerCase()
  if (m.includes('glac')) return 'glide'
  if (m.includes('flood') || m.includes('wet')) return 'ripple'
  if (m.includes('flash') || m.includes('fire')) return 'flash'
  return 'sink'
}

function pointOnSphere(longitude: number, latitude: number, radius: number): THREE.Vector3 {
  const lat = THREE.MathUtils.degToRad(latitude)
  const lon = THREE.MathUtils.degToRad(longitude)
  return new THREE.Vector3(
    radius * Math.cos(lat) * Math.cos(lon),
    radius * Math.sin(lat),
    -radius * Math.cos(lat) * Math.sin(lon),
  )
}

function addOrbitGrid(group: THREE.Group) {
  const material = new THREE.LineBasicMaterial({
    color: 0x9de9d0,
    transparent: true,
    opacity: 0.15,
    depthWrite: false,
  })

  for (let latitude = -60; latitude <= 60; latitude += 30) {
    const points: THREE.Vector3[] = []
    for (let longitude = -180; longitude <= 180; longitude += 4) {
      points.push(pointOnSphere(longitude, latitude, 1.007))
    }
    group.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(points), material))
  }

  for (let longitude = -180; longitude < 180; longitude += 30) {
    const points: THREE.Vector3[] = []
    for (let latitude = -88; latitude <= 88; latitude += 4) {
      points.push(pointOnSphere(longitude, latitude, 1.007))
    }
    group.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(points), material))
  }
}

interface HotspotRig {
  id: string
  name: string
  style: Style
  anchor: THREE.Group
  core: THREE.Mesh
  rings: THREE.Mesh[]
  cones: THREE.Mesh[]
  hit: THREE.Mesh
}

export function EarthGlobe({ location, variant, locations, activeId, onSelect }: EarthGlobeProps) {
  const hostRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const pinRef = useRef<HTMLDivElement>(null)
  const pinLabelRef = useRef<HTMLElement>(null)
  const [ready, setReady] = useState(false)

  // Latest props are read inside the render loop without rebuilding the scene.
  const activeRef = useRef<string | undefined>(activeId)
  const selectRef = useRef<typeof onSelect>(onSelect)
  useEffect(() => {
    activeRef.current = activeId
  }, [activeId])
  useEffect(() => {
    selectRef.current = onSelect
  }, [onSelect])

  const spots: Hotspot[] = locations && locations.length > 0 ? locations : [location]
  const spotsKey = spots.map((s) => `${s.id}:${s.coordinates[0]},${s.coordinates[1]}:${s.move ?? ''}`).join('|')

  useEffect(() => {
    const host = hostRef.current
    const canvas = canvasRef.current
    if (!host || !canvas) return

    setReady(false)
    let renderer: THREE.WebGLRenderer
    try {
      renderer = new THREE.WebGLRenderer({
        canvas,
        alpha: true,
        antialias: true,
        powerPreference: 'low-power',
      })
    } catch {
      host.dataset.globeError = 'webgl'
      return
    }

    let disposed = false
    let inViewport = false
    let frameId = 0

    renderer.setClearColor(0x000000, 0)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5))
    renderer.outputColorSpace = THREE.SRGBColorSpace

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 30)
    camera.position.set(0, 0, variant === 'hero' ? 3.2 : 3.85)

    const globeGroup = new THREE.Group()
    const longitude = location.coordinates[0]
    globeGroup.rotation.y = -Math.PI / 2 - THREE.MathUtils.degToRad(longitude)
    scene.add(globeGroup)

    const texture = new THREE.TextureLoader().load(
      textureUrl,
      () => {
        if (!disposed) setReady(true)
      },
      undefined,
      () => {
        if (!disposed) host.dataset.globeError = 'texture'
      },
    )
    texture.colorSpace = THREE.SRGBColorSpace
    texture.anisotropy = renderer.capabilities.getMaxAnisotropy()

    const surfaceMaterial = new THREE.MeshStandardMaterial({
      map: texture,
      color: 0xe7f4e9,
      roughness: 0.94,
      metalness: 0.015,
      emissive: 0x102421,
      emissiveIntensity: 0.16,
    })
    const surface = new THREE.Mesh(new THREE.SphereGeometry(1, 96, 72), surfaceMaterial)
    globeGroup.add(surface)
    addOrbitGrid(globeGroup)

    const atmosphereMaterial = new THREE.ShaderMaterial({
      vertexShader: `
        varying vec3 vNormal;
        varying vec3 vViewPosition;
        void main() {
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          vViewPosition = -mvPosition.xyz;
          vNormal = normalize(normalMatrix * normal);
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        varying vec3 vNormal;
        varying vec3 vViewPosition;
        void main() {
          float rim = pow(max(0.0, 0.82 - dot(normalize(vNormal), normalize(vViewPosition))), 2.3);
          gl_FragColor = vec4(0.22, 0.78, 0.64, rim * 0.68);
        }
      `,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      side: THREE.FrontSide,
    })
    globeGroup.add(new THREE.Mesh(new THREE.SphereGeometry(1.05, 64, 48), atmosphereMaterial))

    /* ---------- one animated hotspot per place ---------- */
    const zAxis = new THREE.Vector3(0, 0, 1)
    const rigs: HotspotRig[] = spots.map((spot) => {
      const style = styleFor(spot.move)
      const color = STYLE_COLOR[style]
      const dir = pointOnSphere(spot.coordinates[0], spot.coordinates[1], 1).normalize()
      const anchor = new THREE.Group()
      anchor.position.copy(dir.clone().multiplyScalar(1.019))
      anchor.quaternion.setFromUnitVectors(zAxis, dir)

      const glow = () =>
        new THREE.MeshBasicMaterial({
          color,
          transparent: true,
          opacity: 0.8,
          side: THREE.DoubleSide,
          depthWrite: false,
          blending: THREE.AdditiveBlending,
        })

      const rings = [0, 1, 2].map(() => {
        const ring = new THREE.Mesh(new THREE.RingGeometry(0.9, 1, 48), glow())
        ring.scale.setScalar(0.04)
        anchor.add(ring)
        return ring
      })

      const core = new THREE.Mesh(new THREE.SphereGeometry(0.014, 16, 12), new THREE.MeshBasicMaterial({ color }))
      core.position.z = 0.004
      anchor.add(core)

      const cones = [0, 1, 2].map(() => {
        const cone = new THREE.Mesh(new THREE.ConeGeometry(0.011, 0.034, 10), glow())
        cone.rotation.z = -Math.PI / 2
        cone.position.z = 0.006
        cone.visible = style === 'glide'
        anchor.add(cone)
        return cone
      })

      // Invisible, larger target so small hotspots are easy to click.
      const hit = new THREE.Mesh(
        new THREE.SphereGeometry(0.07, 12, 8),
        new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false }),
      )
      hit.userData.id = spot.id
      anchor.add(hit)

      globeGroup.add(anchor)
      return { id: spot.id, name: spot.name, style, anchor, core, rings, cones, hit }
    })
    const mainRig = rigs.find((r) => r.id === location.id) ?? rigs[0]

    scene.add(new THREE.AmbientLight(0x79968b, 1.35))
    const sunlight = new THREE.DirectionalLight(0xfff1d5, 2.35)
    sunlight.position.set(-3.6, 2.1, 4.5)
    scene.add(sunlight)

    const starPositions = new Float32Array(420 * 3)
    for (let index = 0; index < starPositions.length; index += 3) {
      const y = Math.random() * 2 - 1
      const angle = Math.random() * Math.PI * 2
      const radius = 4.4 + Math.random() * 3.2
      const flatRadius = Math.sqrt(1 - y * y)
      starPositions[index] = Math.cos(angle) * flatRadius * radius
      starPositions[index + 1] = y * radius
      starPositions[index + 2] = Math.sin(angle) * flatRadius * radius
    }
    const starGeometry = new THREE.BufferGeometry()
    starGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3))
    const starField = new THREE.Points(
      starGeometry,
      new THREE.PointsMaterial({ color: 0xbadbd0, size: 0.014, sizeAttenuation: true, transparent: true, opacity: 0.8 }),
    )
    scene.add(starField)

    const sweepPivot = new THREE.Group()
    sweepPivot.rotation.x = 0.58
    sweepPivot.rotation.z = -0.18
    scene.add(sweepPivot)
    const orbitRing = new THREE.Mesh(
      new THREE.RingGeometry(1.16, 1.172, 160),
      new THREE.MeshBasicMaterial({
        color: 0x83dfc2,
        transparent: true,
        opacity: 0.28,
        side: THREE.DoubleSide,
        depthWrite: false,
      }),
    )
    orbitRing.rotation.x = Math.PI / 2
    sweepPivot.add(orbitRing)
    const beam = new THREE.Mesh(
      new THREE.RingGeometry(1.08, 1.34, 80, 1, 0.02, 0.62),
      new THREE.MeshBasicMaterial({
        color: 0xb9ed8e,
        transparent: true,
        opacity: variant === 'hero' ? 0.42 : 0.28,
        side: THREE.DoubleSide,
        depthWrite: false,
      }),
    )
    beam.rotation.x = Math.PI / 2
    sweepPivot.add(beam)
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    const controls = new OrbitControls(camera, canvas)
    controls.enableDamping = true
    controls.dampingFactor = 0.055
    controls.enablePan = false
    controls.enableZoom = variant === 'explorer'
    controls.autoRotate = !reduceMotion
    controls.autoRotateSpeed = variant === 'hero' ? 0.48 : 0.4
    controls.minDistance = variant === 'hero' ? 2.15 : 2.7
    controls.maxDistance = variant === 'hero' ? 4.5 : 6
    controls.listenToKeyEvents(canvas)

    /* ---------- fly the camera to the selected place ---------- */
    const flyTarget = new THREE.Vector3()
    let flying = false
    let lastActive: string | undefined
    const startFly = (id: string | undefined) => {
      const rig = rigs.find((r) => r.id === id)
      if (!rig) return
      globeGroup.updateMatrixWorld(true)
      rig.anchor.getWorldPosition(flyTarget).normalize()
      flying = true
      controls.autoRotate = false
    }

    /* ---------- click a hotspot to select it ---------- */
    const raycaster = new THREE.Raycaster()
    const pointer = new THREE.Vector2()
    let downX = 0
    let downY = 0
    const onPointerDown = (e: PointerEvent) => {
      downX = e.clientX
      downY = e.clientY
    }
    const onPointerUp = (e: PointerEvent) => {
      if (Math.hypot(e.clientX - downX, e.clientY - downY) > 5) return // it was a drag
      const rect = canvas.getBoundingClientRect()
      pointer.set(((e.clientX - rect.left) / rect.width) * 2 - 1, -((e.clientY - rect.top) / rect.height) * 2 + 1)
      raycaster.setFromCamera(pointer, camera)
      scene.updateMatrixWorld(true)
      const hits = raycaster.intersectObjects([surface, ...rigs.map((r) => r.hit)], false)
      const first = hits[0]?.object
      if (first && first !== surface && typeof first.userData.id === 'string') selectRef.current?.(first.userData.id)
    }
    canvas.addEventListener('pointerdown', onPointerDown)
    canvas.addEventListener('pointerup', onPointerUp)

    const worldPosition = new THREE.Vector3()
    const projectedPosition = new THREE.Vector3()
    const cameraPosition = new THREE.Vector3()
    let pinName = ''

    const updatePin = () => {
      const pin = pinRef.current
      if (!pin) return
      const rig = rigs.find((r) => r.id === activeRef.current) ?? mainRig
      if (pinLabelRef.current && pinName !== rig.name) {
        pinName = rig.name
        pinLabelRef.current.textContent = rig.name
      }
      rig.anchor.getWorldPosition(worldPosition)
      camera.getWorldPosition(cameraPosition)
      projectedPosition.copy(worldPosition).project(camera)
      const facingCamera = worldPosition.dot(cameraPosition.clone().sub(worldPosition)) > 0
      const visible = facingCamera && projectedPosition.z < 1 && projectedPosition.z > -1
      const width = host.clientWidth
      const height = host.clientHeight
      pin.style.left = `${(projectedPosition.x * 0.5 + 0.5) * width}px`
      pin.style.top = `${(-projectedPosition.y * 0.5 + 0.5) * height}px`
      pin.style.opacity = visible ? '1' : '0'
    }

    const resize = () => {
      const { width, height } = host.getBoundingClientRect()
      if (width === 0 || height === 0) return
      renderer.setSize(width, height, false)
      camera.aspect = width / height
      camera.updateProjectionMatrix()
    }

    const animateRigs = (t: number) => {
      rigs.forEach((rig) => {
        const active = rig.id === activeRef.current
        const k = active ? 1.6 : 1
        rig.core.scale.setScalar(k * (1 + 0.25 * Math.sin(t * 4)))
        rig.rings.forEach((ring, j) => {
          const p = (t * 0.5 + j / 3) % 1
          let size = 0.05
          let alpha = 0.5
          if (rig.style === 'sink') {
            size = 0.075 * (1 - p) + 0.01 // contracts inward: ground sinking
            alpha = p
          } else if (rig.style === 'ripple') {
            size = 0.012 + p * 0.085 // expands outward: water spreading
            alpha = 1 - p
          } else if (rig.style === 'flash') {
            size = 0.015 + 0.04 * ((p * 3) % 1) // quick flash then fade
            alpha = (t * 1.4 + j * 0.33) % 1 < 0.25 ? 1 : 0.06
          } else {
            size = 0.02 + 0.012 * j // glacier: steady rings
            alpha = 0.4
          }
          ring.scale.setScalar(size * k)
          ;(ring.material as THREE.MeshBasicMaterial).opacity = alpha * 0.9
        })
        if (rig.style === 'glide') {
          rig.cones.forEach((cone, j) => {
            const p = (t * 0.45 + j / 3) % 1
            cone.position.x = (-0.04 + p * 0.08) * k
            ;(cone.material as THREE.MeshBasicMaterial).opacity = Math.sin(p * Math.PI)
          })
        }
      })
    }

    const draw = () => {
      if (disposed || !inViewport) {
        frameId = 0
        return
      }
      const t = performance.now() * 0.001
      if (activeRef.current !== lastActive) {
        lastActive = activeRef.current
        startFly(lastActive)
      }
      if (flying) {
        const distance = camera.position.length()
        const dir = camera.position.clone().normalize().lerp(flyTarget, 0.07).normalize()
        camera.position.copy(dir.multiplyScalar(distance))
        if (dir.angleTo(flyTarget) < 0.01) flying = false
      }
      if (!reduceMotion) {
        beam.rotation.z += variant === 'hero' ? 0.0075 : 0.005
        animateRigs(t)
      }
      controls.update()
      globeGroup.updateMatrixWorld(true)
      scene.updateMatrixWorld(true)
      renderer.render(scene, camera)
      updatePin()
      frameId = window.requestAnimationFrame(draw)
    }

    const resizeObserver = new ResizeObserver(resize)
    resizeObserver.observe(host)
    resize()

    const visibilityObserver = new IntersectionObserver(([entry]) => {
      inViewport = entry?.isIntersecting ?? false
      if (inViewport && frameId === 0) frameId = window.requestAnimationFrame(draw)
      if (!inViewport && frameId !== 0) {
        window.cancelAnimationFrame(frameId)
        frameId = 0
      }
    })
    visibilityObserver.observe(host)

    return () => {
      disposed = true
      if (frameId !== 0) window.cancelAnimationFrame(frameId)
      resizeObserver.disconnect()
      visibilityObserver.disconnect()
      canvas.removeEventListener('pointerdown', onPointerDown)
      canvas.removeEventListener('pointerup', onPointerUp)
      controls.dispose()
      const geometries = new Set<THREE.BufferGeometry>()
      const materials = new Set<THREE.Material>()
      scene.traverse((object) => {
        if (object instanceof THREE.Mesh || object instanceof THREE.Line || object instanceof THREE.Points) {
          geometries.add(object.geometry)
          const objectMaterials = Array.isArray(object.material) ? object.material : [object.material]
          objectMaterials.forEach((material) => materials.add(material))
        }
      })
      geometries.forEach((geometry) => geometry.dispose())
      materials.forEach((material) => material.dispose())
      texture.dispose()
      renderer.dispose()
    }
    // spots is derived from spotsKey, so the scene rebuilds only when the places change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.coordinates, location.id, location.name, variant, spotsKey])

  return (
    <div
      ref={hostRef}
      className={`earth-globe earth-globe--${variant}${ready ? ' earth-globe--ready' : ''}`}
      role="region"
      aria-label={`Interactive 3D Earth globe centered near ${location.name}, ${location.country}`}
    >
      <div className="earth-globe__fallback" aria-hidden="true" />
      <canvas
        ref={canvasRef}
        className="earth-globe__canvas"
        tabIndex={variant === 'explorer' ? 0 : -1}
        aria-label={`3D Earth globe with animated hotspots; click a hotspot to select it, drag to rotate, use arrow keys when focused`}
      />
      <div ref={pinRef} className="earth-globe__pin" aria-hidden="true"><span /><b ref={pinLabelRef}>{location.name}</b></div>
      <span className="earth-globe__hint">{variant === 'hero' ? 'SLOW ORBIT · DRAG TO ROTATE' : 'SLOW ORBIT · DRAG TO ROTATE · SCROLL TO ZOOM'}</span>
    </div>
  )
}