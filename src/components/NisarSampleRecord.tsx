import { ArrowUpRight, CalendarDays, Fingerprint, MapPin, Radar, ShieldAlert } from 'lucide-react'
import type { NisarBrowseRecord } from '../types'

function formatUtc(value: string) {
  return new Date(value).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  })
}

function formatPoint([longitude, latitude]: [number, number]) {
  const latitudeLabel = `${Math.abs(latitude).toFixed(4)}° ${latitude >= 0 ? 'N' : 'S'}`
  const longitudeLabel = `${Math.abs(longitude).toFixed(4)}° ${longitude >= 0 ? 'E' : 'W'}`
  return `${latitudeLabel}, ${longitudeLabel}`
}

export function NisarSampleRecord({ record }: { record: NisarBrowseRecord }) {
  const pairLabel = `${formatUtc(record.startTime)} → ${formatUtc(record.stopTime)}`
  const headingId = `nisar-sample-${record.productId}`
  const sampleAnchorId = `nisar-${record.productFamily.toLowerCase()}-${record.startTime.slice(0, 10)}`

  return (
    <article id={sampleAnchorId} aria-labelledby={headingId} className="mt-8 scroll-mt-8 overflow-hidden rounded-2xl border border-[#e9b574]/25 bg-[#101a19] shadow-[0_24px_90px_rgba(0,0,0,.25)]">
      <div className="grid lg:grid-cols-[1.08fr_.92fr]">
        <figure className="relative flex min-h-[260px] flex-col border-b border-white/10 bg-[#050809] lg:border-b-0 lg:border-r">
          <a href={record.browseUrl} target="_blank" rel="noreferrer" className="group flex min-h-[260px] flex-1 items-center justify-center overflow-hidden focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-4px] focus-visible:outline-[#83dfc2]" aria-label="Open the original ASF NISAR browse image">
            <img
              src={record.browseImage}
              alt={`ASF ${record.level} ${record.maturity} NISAR ${record.productFamily} unwrapped-interferogram browse for the ${formatUtc(record.startTime)} to ${formatUtc(record.stopTime)} acquisition pair. Quicklook only, not a displacement scale.`}
              width="1458"
              height="1429"
              loading="lazy"
              decoding="async"
              className="max-h-[520px] w-full object-contain transition duration-500 group-hover:scale-[1.01]"
            />
          </a>
          <figcaption className="flex flex-wrap items-center justify-between gap-2 border-t border-white/10 px-4 py-3 text-[9px] uppercase tracking-[.14em] text-[#89978f] sm:px-5">
            <span>Original ASF LATLON browse · shown unaltered</span>
            <span>Click image to open source</span>
          </figcaption>
          <span className="absolute left-3 top-3 rounded-md border border-[#e9b574]/30 bg-[#101614]/90 px-2.5 py-1.5 font-mono text-[9px] tracking-[.12em] text-[#f2c58e]">REAL ASF RECORD · {record.maturity}</span>
        </figure>

        <div className="flex flex-col justify-center p-5 sm:p-7 lg:p-8">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[#83dfc2]/20 bg-[#83dfc2]/[.06] px-2.5 py-1.5 text-[9px] font-semibold uppercase tracking-[.12em] text-[#b8ecd6]"><Radar size={12} aria-hidden="true" />L-band · {record.productFamily} · {record.level}</span>
            <span className="rounded-full border border-[#e9b574]/25 bg-[#e9b574]/[.06] px-2.5 py-1.5 text-[9px] font-semibold uppercase tracking-[.12em] text-[#f0c38c]">{record.maturity} · not validated</span>
          </div>
          <p className="mt-5 text-[9px] font-semibold uppercase tracking-[.2em] text-[#9aa9a2]">A dated catalog match · Quetta sample point only</p>
          <h3 id={headingId} className="mt-2 font-display text-2xl leading-tight text-[#e8ede8] sm:text-3xl">A real NISAR product footprint intersects this point.</h3>
          <p className="mt-3 text-xs leading-6 text-[#a1b0a7]">{record.note}</p>

          <div className="mt-5 grid gap-2 sm:grid-cols-2">
            <div className="rounded-xl border border-white/10 bg-white/[.025] p-3.5">
              <p className="flex items-center gap-2 text-[9px] font-semibold uppercase tracking-[.13em] text-[#86958c]"><CalendarDays size={12} aria-hidden="true" />Acquisition pair</p>
              <p className="mt-2 text-xs font-medium text-[#e3ebe3]">{pairLabel}</p>
              <p className="mt-1 text-[10px] text-[#7f8e85]">UTC · 12-day repeat interval</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/[.025] p-3.5">
              <p className="flex items-center gap-2 text-[9px] font-semibold uppercase tracking-[.13em] text-[#86958c]"><MapPin size={12} aria-hidden="true" />Catalog point intersection</p>
              <p className="mt-2 text-xs font-medium text-[#e3ebe3]">{formatPoint(record.intersectsPoint)}</p>
              <p className="mt-1 text-[10px] text-[#7f8e85]">Search checked {formatUtc(record.catalogCheckedOn)}</p>
            </div>
          </div>

          <div className="mt-4 rounded-xl border border-white/10 bg-[#080e0e] p-3.5">
            <p className="flex items-center gap-2 text-[9px] font-semibold uppercase tracking-[.13em] text-[#86958c]"><Fingerprint size={12} aria-hidden="true" />ASF granule filename</p>
            <code className="mt-2 block break-all font-mono text-[10px] leading-5 text-[#bdd4c7]">{record.fileName}</code>
          </div>

          <div className="mt-4 flex gap-2.5 rounded-xl border border-[#e9b574]/15 bg-[#e9b574]/[.04] p-3.5 text-[10px] leading-5 text-[#b7b7a8]">
            <ShieldAlert size={14} className="mt-0.5 shrink-0 text-[#e9b574]" aria-hidden="true" />
            <p>The card is pinned to the original Quetta example; it does not follow the editable search coordinates above. The image is an ASF browse visualization of a GUNW product, not a scaled displacement result. It does not validate the illustrative groundwater/subsidence story.</p>
          </div>

          <div className="mt-5 flex flex-wrap gap-2.5">
            <a href={record.browseUrl} target="_blank" rel="noreferrer" className="inline-flex min-h-10 items-center gap-2 rounded-lg bg-[#83dfc2] px-3.5 text-[10px] font-bold text-[#071011] transition hover:bg-[#adf2d6] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#e8ede8]">Open original ASF browse <ArrowUpRight size={13} aria-hidden="true" /></a>
            <a href={record.catalogUrl} target="_blank" rel="noreferrer" className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-white/15 px-3.5 text-[10px] font-medium text-[#d1ddd4] transition hover:border-white/30 hover:bg-white/[.04] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#83dfc2]">Open exact ASF query <ArrowUpRight size={13} aria-hidden="true" /></a>
          </div>
        </div>
      </div>
    </article>
  )
}
