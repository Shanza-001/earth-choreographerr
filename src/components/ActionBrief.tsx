const beats = [
  { index: '01', title: 'Orbit', detail: 'Turn the Earth until Quetta’s marker faces you. The globe is NASA Blue Marble context. The sweep is our drawing of a repeat pass.' },
  { index: '02', title: 'Read', detail: 'Open the real ASF quicklook. Name the 12-day pair, the dark swath gaps, and the phase color. Stop before quoting centimetres.' },
  { index: '03', title: 'Choose', detail: 'Match the question to a product: GUNW for motion, GCOV for water and vegetation, GOFF for ice flow. Polarization is part of the choice.' },
  { index: '04', title: 'Act', detail: 'Hand a water office a next step: download the HDF5, keep the provenance, and validate against ground measurements before any public number.' },
]

const actions = [
  { who: 'A city water office', step: 'Treat the Quetta granule as proof that a provisional GUNW footprint intersects the city. Ask for line-of-sight displacement only after the science layers are processed and checked against wells, GNSS, or leveling.' },
  { who: 'An educator', step: 'Teach the 12-day repeat with the dated pair, then the three scattering paths. Students leave knowing a radar image is an instrument measurement with a legend, a maturity flag, and a limit.' },
  { who: 'A science team', step: 'Pull the same granule from ASF Vertex, extract the geocoded layers with the published GDAL workflow, and record maturity, track, and polarization beside every figure. The evidence note in the data desk is the public version of that habit.' },
]

export function ActionBrief() {
  return (
    <section className="brief-section section-pad" id="brief" aria-labelledby="brief-title">
      <div className="section-topline">
        <span className="section-index">05 <i>/</i> WHAT CHANGES ON MONDAY</span>
        <span className="section-note">Insight with a boundary</span>
      </div>
      <div className="brief-intro">
        <div>
          <p className="overline"><span className="overline-dot" />FOR THE ROOM THAT HAS TO DECIDE</p>
          <h2 id="brief-title">A number you can<br /><em>stand behind.</em></h2>
        </div>
        <p>Quetta sits in a basin where groundwater withdrawal can compact sediment. That is a physical hypothesis, and it is why this city is the right question for NISAR. The hypothesis becomes a public figure only when the unwrapped phase is processed, referenced, and checked on the ground. Until then, the honest product is the question, the granule, and the limit.</p>
      </div>

      <ol className="brief-beats">
        {beats.map((beat) => (
          <li key={beat.index}>
            <span>{beat.index}</span>
            <strong>{beat.title}</strong>
            <p>{beat.detail}</p>
          </li>
        ))}
      </ol>

      <div className="brief-actions">
        {actions.map((action) => (
          <article key={action.who}>
            <h3>{action.who}</h3>
            <p>{action.step}</p>
          </article>
        ))}
      </div>
    </section>
  )
}
