import { useState } from 'react'
import type { StudySeed } from '../types'
import { studySeeds } from '../data/seeds'

const modes = [
  {
    id: 'surface',
    index: '01',
    title: 'Surface bounce',
    pols: 'HH · VV',
    product: 'GCOV',
    sees: 'Open water, wet soil, bare ground',
    body: 'A smooth surface throws the microwave pulse away like a mirror, so calm floodwater often returns dark. Rough soil sends more energy home. Water also raises the dielectric constant, which is why wet ground and inundation change the brightness even when the eye sees only brown earth.',
  },
  {
    id: 'double',
    index: '02',
    title: 'Double bounce',
    pols: 'HH often bright',
    product: 'GCOV',
    sees: 'Flooded trunks, walls, embankments',
    body: 'The pulse strikes a vertical face, then the ground, and comes back strong. Mangroves standing in water and the hard edges of a city can flare for this reason. Brightness here is geometry meeting water — a wetland signal people can learn to see.',
  },
  {
    id: 'volume',
    index: '03',
    title: 'Volume scatter',
    pols: 'HV · VH',
    product: 'GCOV',
    sees: 'Canopy, crops, burn scars',
    body: 'Inside leaves and branches the pulse scatters many times. Cross-polarised channels carry that tangled return. NISAR’s L-band wavelength is about 24 centimetres, long enough to reach deeper into vegetation than shorter radar bands, so forest structure, crops, and fire scars rewrite the echo.',
  },
  {
    id: 'phase',
    index: '04',
    title: 'Repeat-pass phase',
    pols: 'Coherent pair',
    product: 'GUNW',
    sees: 'Ground motion, once processed',
    body: 'Two passes on the same orbit compare the phase of the echo. A shift of a fraction of a wavelength can become centimetres of line-of-sight motion. That conversion needs the GUNW science layers, a stable reference, and an uncertainty check. The Quetta quicklook is the notation for one 12-day bar of that music.',
  },
] as const

function ScatterMark({ id }: { id: (typeof modes)[number]['id'] }) {
  if (id === 'surface') {
    return (
      <svg viewBox="0 0 160 120" aria-hidden="true">
        <path d="M12 78 C40 70 70 86 148 74" />
        <path d="M28 28 L58 62 M46 24 L78 66" />
        <circle cx="118" cy="40" r="3" />
      </svg>
    )
  }
  if (id === 'double') {
    return (
      <svg viewBox="0 0 160 120" aria-hidden="true">
        <path d="M18 96 H142" />
        <path d="M78 96 V28" />
        <path d="M36 24 L78 70 L122 96" />
        <circle cx="36" cy="24" r="3" />
      </svg>
    )
  }
  if (id === 'volume') {
    return (
      <svg viewBox="0 0 160 120" aria-hidden="true">
        <path d="M80 100 V46" />
        <path d="M80 62 C48 48 36 30 34 22 M80 54 C112 40 124 28 128 18 M80 74 C52 70 40 86 28 90 M80 70 C108 78 124 74 140 84" />
        <circle cx="34" cy="22" r="3" />
        <circle cx="128" cy="18" r="3" />
      </svg>
    )
  }
  return (
    <svg viewBox="0 0 160 120" aria-hidden="true">
      <path d="M18 78 C48 40 78 96 112 52 C128 34 140 40 148 36" />
      <path d="M18 92 C48 54 78 110 112 66 C128 48 140 54 148 50" />
      <circle cx="112" cy="52" r="3" />
    </svg>
  )
}

export function ScatteringStage({ onUseSeed }: { onUseSeed: (seed: Omit<StudySeed, 'nonce'>) => void }) {
  const [modeId, setModeId] = useState<(typeof modes)[number]['id']>('phase')
  const mode = modes.find((item) => item.id === modeId) ?? modes[3]

  return (
    <section className="scatter-section section-pad" id="scattering" aria-labelledby="scatter-title">
      <div className="section-topline">
        <span className="section-index">03 <i>/</i> HOW A PULSE SCATTERS</span>
        <span className="section-note">Polarization chooses the question</span>
      </div>
      <div className="scatter-intro">
        <div>
          <p className="overline"><span className="overline-dot overline-dot--amber" />L-BAND · ABOUT 24 CM</p>
          <h2 id="scatter-title">The same ground,<br /><em>four ways of listening.</em></h2>
        </div>
        <p>Radar is sensitive to roughness and to the dielectric constant. Polarization tells you which part of that physics you are hearing. Pick a scattering path, then aim it at a real place as a catalog search — coverage still has to be confirmed in ASF.</p>
      </div>

      <div className="scatter-layout">
        <div className="scatter-picker" role="tablist" aria-label="Scattering mechanisms">
          {modes.map((item) => (
            <button key={item.id} type="button" role="tab" aria-selected={item.id === modeId} onClick={() => setModeId(item.id)}>
              <span>{item.index}</span>
              <strong>{item.title}</strong>
              <small>{item.pols}</small>
            </button>
          ))}
        </div>
        <article className="scatter-panel" role="tabpanel">
          <div className={`scatter-mark scatter-mark--${mode.id}`}>
            <ScatterMark id={mode.id} />
          </div>
          <p className="scatter-kicker">{mode.product} · {mode.pols}</p>
          <h3>{mode.sees}</h3>
          <p>{mode.body}</p>
        </article>
      </div>

      <div className="seed-block">
        <div className="seed-heading">
          <p>Aim the instrument</p>
          <span>Search seeds · a footprint is confirmed only in the catalog</span>
        </div>
        <div className="seed-grid">
          {studySeeds.map((seed) => (
            <article key={seed.id} className="seed-card">
              <header>
                <span>{seed.product}</span>
                <small>{seed.country}</small>
              </header>
              <h3>{seed.name}</h3>
              <p>{seed.question}</p>
              <button type="button" onClick={() => onUseSeed(seed)}>Use as search seed</button>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
