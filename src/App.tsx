import { lazy, Suspense, useEffect, useRef, useState, type ReactNode } from 'react'
import { motion, useInView, useReducedMotion, useScroll, useTransform } from 'framer-motion'
import { ArrowDown, ArrowDownRight, ArrowRight, MoveUpRight } from 'lucide-react'
import stories from './data/locations.json'
import { artworkSrc } from './data/visuals'
import { ActionBrief } from './components/ActionBrief'
import { DanceCard } from './components/DanceCard'
import { EchoReader } from './components/EchoReader'
import { FirstVisitGuide } from './components/FirstVisitGuide'
import { MoveMark } from './components/MoveMark'
import { NisarWorkbench } from './components/NisarWorkbench'
import { ScatteringStage } from './components/ScatteringStage'
import './globe.css'
import './map-live.css'
import type { DanceMove, StoryLocation, StudySeed } from './types'
import { MoveLab } from './components/MoveLab'

const locations = stories as StoryLocation[]
const DeferredEarthGlobe = lazy(() => import('./components/EarthGlobe').then(({ EarthGlobe }) => ({ default: EarthGlobe })))
const DeferredSarMap = lazy(() => import('./components/SarMap').then(({ SarMap }) => ({ default: SarMap })))

const moveStories: Array<{ move: DanceMove; title: string; label: string; description: string; artwork: 'subsidence' | 'glacier' | 'flood' | 'fire' }> = [
  { move: 'subsidence', title: 'Subsidence', label: 'SLOW / DOWN', artwork: 'subsidence', description: 'A basin gives way in a quiet, downward pulse. The surface lowers; the rhythm is gradual.' },
  { move: 'glacier', title: 'Glacier flow', label: 'STEADY / GLIDE', artwork: 'glacier', description: 'Ice travels downhill like a long, unbroken phrase. The motion keeps its own pace.' },
  { move: 'flood', title: 'Flood & wetland', label: 'EXPAND / RETURN', artwork: 'flood', description: 'A waterline opens outward, then recedes. Each pass traces the changing edge.' },
  { move: 'flash', title: 'Fire & farming', label: 'FLASH / FADE', artwork: 'fire', description: 'A surface changes quickly, then settles into a new texture—one bright beat, then another.' },
]

const radarPrinciples = [
  { number: '01', term: 'Clouds part', detail: 'Microwave radar sees through most cloud, smoke, and haze.' },
  { number: '02', term: 'Night is no pause', detail: 'An active sensor sends its own pulse; sunlight is not required.' },
  { number: '03', term: 'Small shifts leave traces', detail: 'Repeat-pass phase can reveal centimetre-scale motion in suitable processed observations.' },
]

const heroWords = ['in motion.', 'under pressure.', 'changing shape.', 'worth listening to.']

function RotatingHeroWord() {
  const reduceMotion = useReducedMotion()
  const [wordIndex, setWordIndex] = useState(0)

  useEffect(() => {
    if (reduceMotion) return

    const timer = window.setInterval(() => {
      setWordIndex((current) => (current + 1) % heroWords.length)
    }, 2800)
    return () => window.clearInterval(timer)
  }, [reduceMotion])

  return (
    <motion.span
      key={heroWords[wordIndex]}
      className="hero-rotating-word"
      initial={reduceMotion ? false : { opacity: 0, y: 18 }}
      animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
      transition={{ duration: 0.55, ease: [0.2, 0.75, 0.2, 1] }}
      aria-live="polite"
    >
      {heroWords[wordIndex]}
    </motion.span>
  )
}

function Reveal({ children, className = '', delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  const reduceMotion = useReducedMotion()
  return (
    <motion.div
      className={className}
      initial={reduceMotion ? false : { opacity: 0, y: 22 }}
      whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.16 }}
      transition={{ duration: 0.7, delay, ease: [0.2, 0.75, 0.2, 1] }}
    >
      {children}
    </motion.div>
  )
}

function GlobeFallback({ variant }: { variant: 'hero' | 'explorer' }) {
  return (
    <div className={`earth-globe earth-globe--${variant}`} aria-hidden="true">
      <div className="earth-globe__fallback" />
      <span className="earth-globe__hint">LOADING 3D EARTH</span>
    </div>
  )
}

function MapLoading() {
  return (
    <div className="map-frame map-placeholder" aria-busy="true">
      <div className="map-topline"><span className="map-kicker"><span className="live-dot" /> NASA GIBS · VIIRS</span><span className="map-coordinates">QUETTA · LATEST AVAILABLE</span></div>
      <div className="map-canvas map-canvas--loading" role="status" aria-label="Loading NASA GIBS imagery">
        <span className="map-loading-orbit" aria-hidden="true"><i /></span>
        <span>Loading live imagery tiles</span>
      </div>
    </div>
  )
}

function DeferredMapSlot({ activeId, onSelect }: { activeId: string; onSelect: (id: string) => void }) {
  const slotRef = useRef<HTMLDivElement>(null)
  const isNearViewport = useInView(slotRef, { once: true, margin: '520px 0px' })
  return (
    <div className="map-slot" ref={slotRef}>
      {isNearViewport ? (
        <Suspense fallback={<MapLoading />}>
          <DeferredSarMap locations={locations} activeId={activeId} onSelect={onSelect} />
        </Suspense>
      ) : <MapLoading />}
    </div>
  )
}

function BrandMark() {
  return (
    <svg className="brand-mark" viewBox="0 0 42 42" aria-hidden="true">
      <circle cx="21" cy="21" r="11.5" />
      <ellipse cx="21" cy="21" rx="19" ry="7.5" transform="rotate(-31 21 21)" />
      <circle className="brand-mark__star" cx="32.8" cy="12.4" r="2.7" />
      <circle className="brand-mark__core" cx="21" cy="21" r="2.1" />
    </svg>
  )
}

export default function App() {
  const reduceMotion = useReducedMotion()
  const [activeId, setActiveId] = useState(locations[0]?.id ?? '')
  const [mapView, setMapView] = useState<'live' | 'globe'>('live')
  const [studySeed, setStudySeed] = useState<StudySeed | null>(null)
  const activeLocation = locations.find((location) => location.id === activeId) ?? locations[0]
  const quettaRecord = locations[0]?.nisarBrowseRecords?.[0]
  const { scrollYProgress } = useScroll()
  const artY = useTransform(scrollYProgress, [0, 0.18], [0, 72])
  const artOpacity = useTransform(scrollYProgress, [0, 0.18], [1, 0.35])

  function scrollTo(id: string) {
    document.getElementById(id)?.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' })
  }

  return (
    <div className="site-shell" id="top">
      <header className="site-nav">
        <a className="brand-lockup" href="#top" aria-label="Earth Choreographer home">
          <BrandMark />
          <span>Earth <i>Choreographer</i></span>
        </a>
        <nav aria-label="Main navigation">
          <a href="#why-radar"><span>01</span>Why radar</a>
          <a href="#echo"><span>02</span>The echo</a>
          <a href="#scattering"><span>03</span>Listen</a>
          <a href="#brief"><span>04</span>Act</a>
        </nav>
        <div className="flex items-center gap-3">
          <FirstVisitGuide onNavigate={scrollTo} />
          <button className="nav-indicator" type="button" onClick={() => scrollTo('nisar-data')} aria-label="Jump to the NISAR data desk"><span /> NISAR DATA · L-BAND</button>
        </div>
      </header>

      <main>
        <section className="hero" aria-labelledby="hero-title">
          <div className="hero-art-wrap">
            <motion.div className="hero-art" style={reduceMotion ? undefined : { y: artY, opacity: artOpacity }}>
              <Suspense fallback={<GlobeFallback variant="hero" />}>
                <DeferredEarthGlobe location={locations[0]} variant="hero" />
              </Suspense>
            </motion.div>
            <div className="hero-art-shade" />
          </div>
          <div className="hero-grain" aria-hidden="true" />
          <div className="hero-content page-gutter">
            <p className="hero-kicker"><span className="hero-kicker-line" />NISAR L-BAND · A 12-DAY REPEAT · QUETTA</p>
            <h1 id="hero-title">Earth is always<br /><em><RotatingHeroWord /></em></h1>
            <p className="hero-tagline">Every place on Earth is dancing.<br /><span>We make you see the moves.</span></p>
            <div className="hero-movement-ribbon" aria-label="Movement signals explored in this story">
              <span className="hero-movement-ribbon__live"><i />LIVE STORY ARC</span>
              <span>DOWNWARD PULSE</span><b>·</b><span>STEADY GLIDE</span><b>·</b><span>EXPAND / RETURN</span><b>·</b><span>FLASH / FADE</span>
            </div>
            <div className="hero-actions">
              <button className="primary-cta" type="button" onClick={() => scrollTo('echo')}><span>Read the real echo</span><ArrowDown size={16} /></button>
              <span className="hero-chapter">NASA SPACE APPS<br />DANCING WITH THE SARS</span>
            </div>
          </div>
          <div className="hero-art-credit"><span className="sample-pill sample-pill--hero"><span />NASA Blue Marble 2004 texture · drag to orbit · radar sweep is a drawing</span></div>
          <div className="hero-foot page-gutter"><span>FIELD NOTE 01</span><span>ONE REAL GUNW PAIR</span><span>SCROLL TO READ <ArrowDownRight size={13} /></span></div>
          <span className="hero-vertical-note">OBSERVING CHANGE · ALL THE TIME</span>
        </section>

        <section className="mission-brief section-pad" aria-labelledby="mission-brief-title">
          <span className="mission-brief__art-note">CONCEPT TERRAIN · NOT NISAR DATA</span>
          <div className="mission-brief__intro">
            <p className="overline"><span className="overline-dot overline-dot--amber" />THE 90-SECOND STORY</p>
            <h2 id="mission-brief-title">From a radar echo<br /><em>to a decision.</em></h2>
            <p className="mission-brief__lede">Earth Choreographer turns NISAR’s complex signal into a shared language for scientists, city teams, and curious citizens — without pretending a colorful browse is a measurement.</p>
            <button className="mission-brief__cta" type="button" onClick={() => scrollTo('echo')}>Start with the real echo <ArrowRight size={15} /></button>
          </div>
          <div className="mission-brief__steps">
            <article>
              <span>01</span>
              <div><strong>See the signal</strong><p>An unaltered ASF GUNW quicklook anchors the story in a real, dated NISAR product.</p></div>
            </article>
            <article>
              <span>02</span>
              <div><strong>Understand the physics</strong><p>Interactive scattering paths explain why roughness, water, vegetation, and phase change the echo.</p></div>
            </article>
            <article>
              <span>03</span>
              <div><strong>Know what to do next</strong><p>A product-matching data desk carries the source, maturity, and scientific limit into the brief.</p></div>
            </article>
          </div>
        </section>

        <section className="dance-section section-pad" id="dance-moves" aria-labelledby="moves-title">
          <div className="section-topline"><span className="section-index">01 <i>/</i> THE MOVEMENT LANGUAGE</span><span className="section-note">A small field guide to change</span></div>
          <div className="dance-intro">
            <Reveal className="dance-headline-wrap">
              <p className="overline"><span className="overline-dot" />EVERY SURFACE HAS A TEMPO</p>
              <h2 id="moves-title">The Earth<br />doesn’t stand <em>still.</em></h2>
            </Reveal>
            <Reveal className="dance-intro-aside" delay={0.1}>
              <p>Radar measures the echo of the ground. We translate its changing texture and motion into four gestures you can recognise at a glance.</p>
              <a href="#explorer" className="text-link">See one place in motion <ArrowRight size={15} /></a>
            </Reveal>
          </div>

          <div className="radar-principles" id="why-radar" aria-label="Why radar matters">
            {radarPrinciples.map((principle, index) => (
              <Reveal key={principle.number} className="radar-principle" delay={index * 0.07}>
                <span className="radar-principle__number">{principle.number}</span>
                <div><strong>{principle.term}</strong><p>{principle.detail}</p></div>
              </Reveal>
            ))}
          </div>
          <p className="signal-note"><span className="signal-note__mark"><ArrowDownRight size={13} /></span><span><b>How the echo becomes a story</b> Roughness and moisture shift the return; dielectric properties and polarization change how the pulse scatters. Compare repeat passes with InSAR and a subtle surface shift can become visible. Interpretation depends on the instrument, processing, and place.</span></p>

          <div className="move-grid" id="move-signatures">
            {moveStories.map((story, index) => (
              <Reveal key={story.move} className={`move-card move-card--${story.move}`} delay={index * 0.08}>
                <div className="move-card__top"><span>{String(index + 1).padStart(2, '0')}</span><span className="move-card__tempo">{story.label}</span></div>
                <div className="move-card__image">
                  <img src={artworkSrc(story.artwork)} alt="" aria-hidden="true" loading="lazy" decoding="async" onError={(event) => event.currentTarget.classList.add('is-unavailable')} />
                  <span className="move-card__image-label">CONCEPT ART</span>
                  <MoveMark move={story.move} />
                </div>
                <div className="move-card__copy"><h3>{story.title}</h3><p>{story.description}</p></div>
                <span className="move-card__orbit" aria-hidden="true" />
              </Reveal>
            ))}
          </div>
          <p className="visual-note"><span />Illustrative motion signatures and AI-generated concept art · the measured NISAR quicklook begins in the next section</p>
        </section>
           <MoveLab move={activeLocation?.move} />
        {quettaRecord && <EchoReader record={quettaRecord} />}
        <ScatteringStage onUseSeed={(seed) => {
          setStudySeed({ ...seed, nonce: Date.now() })
          scrollTo('nisar-data')
        }} />

        <NisarWorkbench location={activeLocation ?? locations[0]} seed={studySeed} />

        <section className="explorer-section section-pad" id="explorer" aria-labelledby="explorer-title">
          <div className="explorer-heading-row">
            <div>
              <div className="section-topline section-topline--explorer"><span className="section-index">04 <i>/</i> THE EXPLORER</span><span className="section-note">One place · one sample story</span></div>
              <Reveal>
                <p className="overline"><span className="overline-dot overline-dot--amber" />ZOOM IN ON A CHANGE</p>
                <h2 id="explorer-title">A place, in<br /><em>another light.</em></h2>
              </Reveal>
            </div>
            <Reveal className="explorer-aside" delay={0.1}>
              <p>Choose a point on the map. Follow its sample timeline, compare two illustrative scenes, and see what radar might help us ask.</p>
              <div className="explorer-status"><span className="status-pulse" />NISAR PRODUCT WORKFLOW <span className="status-divider">/</span> CONTEXT MAP</div>
            </Reveal>
          </div>

          <div className="explorer-grid">
            <Reveal className="map-column">
              <div className="map-view-toolbar">
                <div className="map-view-toggle" role="group" aria-label="Choose a map view">
                  <button type="button" aria-pressed={mapView === 'live'} onClick={() => setMapView('live')}>NASA context</button>
                  <button type="button" aria-pressed={mapView === 'globe'} onClick={() => setMapView('globe')}>3D Earth</button>
                </div>
                <span className="map-source-note">{mapView === 'live' ? 'NASA GIBS · VIIRS optical context · not NISAR' : 'NASA Blue Marble · 2004 reference texture'}</span>
              </div>
              {mapView === 'live' ? (
                <DeferredMapSlot activeId={activeId} onSelect={setActiveId} />
              ) : (
                <div className="globe-frame">
                  <Suspense fallback={<GlobeFallback variant="explorer" />}>
                    <DeferredEarthGlobe location={activeLocation ?? locations[0]} variant="explorer" />
                  </Suspense>
                  <span className="globe-frame-caption">Slowly rotating 3D globe · drag to orbit · Blue Marble is a static global composite, not live NISAR data</span>
                </div>
              )}
              <div className="map-caption"><span>01 / FIELD MARKER</span><strong>{activeLocation?.name}, {activeLocation?.country}</strong><button type="button" onClick={() => scrollTo('dance-card-title')} aria-label="Jump to selected location story">OPEN STORY <MoveUpRight size={12} /></button></div>
            </Reveal>
            <Reveal className="card-column" delay={0.08}>
              {activeLocation && <DanceCard key={activeLocation.id} location={activeLocation} />}
            </Reveal>
          </div>
          <div className="explorer-disclaimer"><span className="disclaimer-mark">i</span><p>The Dance Card’s location values, dates, and comparison scenes are <strong>Illustrative sample data</strong>. The measured artifact is the provisional GUNW browse in the echo section and the data desk. That record confirms a product-footprint intersection. Coordinates and NASA optical imagery support orientation.</p></div>
        </section>

        <ActionBrief />
      </main>

      <footer className="site-footer">
        <a className="brand-lockup brand-lockup--footer" href="#top"><BrandMark /><span>Earth <i>Choreographer</i></span></a>
        <div className="footer-credit"><span className="footer-note">NASA Space Apps · Dancing with the SARs</span><span className="footer-placeholder">TEAM NAME: ADD BEFORE SUBMISSION · MIT LICENSE · GITHUB URL: ADD REPOSITORY</span></div>
        <button type="button" className="back-to-top" onClick={() => scrollTo('top')}>BACK TO ORBIT <ArrowDown size={13} /></button>
      </footer>
    </div>
  )
}
