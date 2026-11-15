import { useState } from 'react'
import type { PointerEvent } from 'react'
import type { NisarBrowseRecord } from '../types'

const readings = [
  {
    id: 'fields',
    kicker: '01 / BROAD COLOR',
    title: 'A slow spatial phrase',
    body: 'Wide fields of related color are the first thing a reader should notice. In a geocoded unwrapped interferogram, that pattern is interferometric phase across the ground. Phase can become line-of-sight motion after a reference point, atmospheric checks, and the HDF5 science layers. The PNG itself has no centimetre scale.',
  },
  {
    id: 'texture',
    kicker: '02 / MOTTLED TEXTURE',
    title: 'Where the echo loses lock',
    body: 'Speckled, broken color often means the two passes stopped agreeing — vegetation, water, steep slopes, or a low-coherence pixel. Those places are questions, not a sink rate. Coherence and the unwrapped-phase layer live in the science product, and this viewer does not decode them.',
  },
  {
    id: 'gaps',
    kicker: '03 / DARK GAPS',
    title: 'The instrument’s own geometry',
    body: 'The black bands are pixels without a quicklook value: swath and burst structure, masking, or no-data. They belong to the product footprint. A catalog intersection with Quetta says this frame covers the search point. It does not say the ground there subsided.',
  },
]

function formatUtc(value: string) {
  return new Date(value).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  })
}

export function EchoReader({ record }: { record: NisarBrowseRecord }) {
  const [readingId, setReadingId] = useState(readings[0].id)
  const [lens, setLens] = useState<{ x: number; y: number } | null>(null)
  const reading = readings.find((item) => item.id === readingId) ?? readings[0]

  function trackLens(event: PointerEvent<HTMLImageElement>) {
    if (event.pointerType !== 'mouse') return
    const image = event.currentTarget
    const width = image.clientWidth || 1
    const height = image.clientHeight || 1
    setLens({
      x: Math.min(1, Math.max(0, event.nativeEvent.offsetX / width)),
      y: Math.min(1, Math.max(0, event.nativeEvent.offsetY / height)),
    })
  }

  return (
    <section className="echo-section section-pad" id="echo" aria-labelledby="echo-title">
      <div className="section-topline">
        <span className="section-index">02 <i>/</i> THE REAL ECHO</span>
        <span className="section-note">One ASF browse · read, don’t invent</span>
      </div>
      <div className="echo-intro">
        <div>
          <p className="overline"><span className="overline-dot" />QUETTA · 6 OCT TO 18 OCT 2026</p>
          <h2 id="echo-title">Twelve days.<br /><em>One pair of pulses.</em></h2>
        </div>
        <p>NISAR is built to revisit the same ground every 12 days, day or night, through cloud. This is the project’s measured artifact: an unaltered ASF quicklook of a provisional L-band GUNW product whose footprint intersects Quetta. The colors are the dance notation. The centimetres come later, from the science file.</p>
      </div>

      <div className="echo-stage">
        <figure className="echo-frame">
          <img
            src={record.browseImage}
            alt="Unaltered ASF browse of a provisional NISAR L2 GUNW product. A tilted radar frame shows blue, white, and copper phase colors divided by dark no-data bands. This quicklook is not a displacement map."
            width={1458}
            height={1429}
            draggable={false}
            onPointerMove={trackLens}
            onPointerLeave={() => setLens(null)}
          />
          {lens && (
            <span
              className="echo-lens"
              aria-hidden="true"
              style={{
                left: `${lens.x * 100}%`,
                top: `${lens.y * 100}%`,
                backgroundImage: `url(${record.browseImage})`,
                backgroundPosition: `${lens.x * 100}% ${lens.y * 100}%`,
              }}
            />
          )}
          <figcaption>
            <span>ASF LATLON browse · provisional GUNW · shown unaltered</span>
            <span>Hover to inspect · desktop</span>
          </figcaption>
        </figure>

        <div className="echo-readout">
          <ol className="echo-beat" aria-label="Twelve-day acquisition pair">
            <li>
              <span>Pass A</span>
              <strong>{formatUtc(record.startTime)}</strong>
              <small>14:12 UTC</small>
            </li>
            <li className="echo-beat__span" aria-hidden="true">
              <i />
              <em>12-day repeat</em>
            </li>
            <li>
              <span>Pass B</span>
              <strong>{formatUtc(record.stopTime)}</strong>
              <small>14:13 UTC</small>
            </li>
          </ol>

          <div className="echo-legend" aria-hidden="true">
            <span />
            <div><small>Phase color in the browse</small><b>A visual scale lives in the HDF5, not in this PNG</b></div>
          </div>

          <div className="echo-readings" role="tablist" aria-label="How to read the quicklook">
            {readings.map((item) => (
              <button key={item.id} type="button" role="tab" aria-selected={item.id === readingId} onClick={() => setReadingId(item.id)}>
                {item.kicker}
              </button>
            ))}
          </div>
          <article className="echo-reading" role="tabpanel">
            <h3>{reading.title}</h3>
            <p>{reading.body}</p>
          </article>
          <p className="echo-limit">Maturity on this granule is provisional. Pair it only with products processed to the same standard, and confirm the live ASF record before a briefing.</p>
        </div>
      </div>
    </section>
  )
}
