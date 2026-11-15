import { useEffect, useMemo, useState, type ChangeEvent } from 'react'
import { ArrowDownRight, ArrowRight, Check, Clipboard, Database, ExternalLink, FileImage, Info, LockKeyhole, ShieldCheck, Upload, Waves } from 'lucide-react'
import type { StoryLocation, StudySeed } from '../types'
import { NisarSampleRecord } from './NisarSampleRecord'

type Maturity = 'VALIDATED' | 'PROVISIONAL'
type ProductKey = 'GUNW' | 'GCOV' | 'GOFF'
type SceneSide = 'before' | 'after'

const maturityInfo: Record<Maturity, { date: string; coverage: string; note: string; vertex: string }> = {
  VALIDATED: {
    date: '06 NOV 2026',
    coverage: 'L-band · Levels 0–2 · acquisitions from 21 Oct 2026',
    note: 'Fully calibrated and validated collections are released for L0–L2 acquisitions from 21 Oct 2026. The pinned Quetta example below is PROVISIONAL and does not confirm VALIDATED coverage for this point. Validated Level-3 Soil Moisture is not yet available.',
    vertex: 'https://search.asf.alaska.edu/#/?dataset=NISAR&prodConfig=PR&dataMaturity=VALIDATED',
  },
  PROVISIONAL: {
    date: '20 JUL 2026',
    coverage: 'L-band · Levels 0–3 · acquisitions from 17 Jun to partway through 23 Oct 2026',
    note: 'Calibrated and partially validated; product-specific known issues remain. There is an instrument data gap from 27 Jul to 10 Aug 2026. Provisional Level-3 Soil Moisture is not considered fully calibrated.',
    vertex: 'https://search.asf.alaska.edu/#/?dataset=NISAR&prodConfig=PR&dataMaturity=PROVISIONAL',
  },
}

const products: Array<{ id: ProductKey; title: string; theme: string; summary: string; use: string; icon: typeof Waves }> = [
  {
    id: 'GUNW', title: 'Ground motion', theme: 'SOLID EARTH · PHASE',
    summary: 'Geocoded Unwrapped Interferogram (Level 2). Repeat-pass interferometric phase used with processing and metadata to estimate line-of-sight ground displacement.',
    use: 'Subsidence · earthquakes · deformation', icon: Waves,
  },
  {
    id: 'GCOV', title: 'Water & land cover', theme: 'ECOSYSTEMS · BACKSCATTER',
    summary: 'Geocoded Polarimetric Covariance (Level 2). Terrain-corrected backscatter supports inundation, soil moisture, biomass, disturbance, and crop-area studies.',
    use: 'Floods · wetlands · crops · forests', icon: Database,
  },
  {
    id: 'GOFF', title: 'Ice & surface flow', theme: 'CRYOSPHERE · OFFSETS',
    summary: 'Geocoded Pixel Offsets (Level 2). Speckle-tracking offsets support studies of surface motion, especially cryosphere applications.',
    use: 'Glaciers · ice motion', icon: ArrowDownRight,
  },
]

const sourceLinks = [
  { label: 'NASA Earthdata Search', detail: 'Discover NASA Earth observation collections', href: 'https://search.earthdata.nasa.gov/search?q=nisar&fdc=Alaska%2BSatellite%2BFacility', kind: 'NASA' },
  { label: 'ASF Vertex', detail: 'Search NISAR L-band by area, dates, product and maturity', href: 'https://search.asf.alaska.edu/#/?dataset=NISAR&prodConfig=PR', kind: 'NASA / ASF' },
  { label: 'NISAR Data User Guide', detail: 'Availability, products, formats, access and known issues', href: 'https://nisar-docs.asf.alaska.edu/', kind: 'NASA / ASF' },
  { label: 'NISAR data release status', detail: 'NASA Earthdata notice on current public L-band products', href: 'https://www.earthdata.nasa.gov/data/alerts-outages/nisar-l-band-data-now-publicly-available', kind: 'NASA' },
  { label: 'NISAR StoryMaps', detail: 'Examples of SAR applications and public storytelling', href: 'https://science.nasa.gov/mission/nisar/arcgis-storymaps/', kind: 'NASA' },
  { label: 'NISAR applications white papers', detail: 'NASA papers on glaciers, earthquakes, floods, subsidence and more', href: 'https://science.nasa.gov/mission/nisar/societal-benefits/', kind: 'NASA' },
  { label: 'Intro to remote sensing', detail: 'Earth observation and instrument fundamentals', href: 'https://www.earthdata.nasa.gov/learn/earth-observation-data-basics', kind: 'NASA' },
  { label: 'Intro to SAR', detail: 'Wavelength, polarization, scattering and InSAR basics', href: 'https://www.earthdata.nasa.gov/learn/earth-observation-data-basics/sar', kind: 'NASA' },
  { label: 'NASA ARSET NISAR training', detail: 'Introductory access, visualization and analysis workflows', href: 'https://www.earthdata.nasa.gov/learn/trainings/harnessing-nisar-next-generation-radar-observations-earth-applications', kind: 'NASA' },
  { label: 'UAVSAR postcards', detail: 'JPL airborne SAR false-colour Earth-process examples · not NISAR', href: 'https://uavsar.jpl.nasa.gov/education/postcards.html', kind: 'NASA / JPL' },
  { label: 'NISAR white papers & documents', detail: 'ASF guide to mission, science and application papers', href: 'https://nisar-docs.asf.alaska.edu/documents/', kind: 'NASA / ASF' },
  { label: 'ISRO Bhoonidhi · S-band', detail: 'NISAR S-band products · separate from ASF L-band search', href: 'https://bhoonidhi.nrsc.gov.in/bhoonidhi/home.html', kind: 'ISRO' },
  { label: 'CSA RADARSAT Constellation data', detail: 'Supplemental Canadian SAR archive · review each product licence', href: 'https://donnees-data.asc-csa.gc.ca/en/dataset/rcm', kind: 'CSA' },
  { label: 'CSA SAR Python & QGIS tutorial', detail: 'Practical tutorial for accessing and visualizing SAR imagery', href: 'https://github.com/asc-csa/Synthetic_Aperture_Radar_Tutorial', kind: 'CSA' },
  { label: 'RADARSAT-1 data', detail: 'Canadian SAR archive · supplemental, not NISAR', href: 'https://donnees-data.asc-csa.gc.ca/en/dataset/radarsat1', kind: 'CSA' },
  { label: 'CONAE SAOCOM catalogue', detail: 'Argentina’s L-band SAR catalogue and search portal', href: 'https://catalog.saocom.conae.gov.ar/catalog/', kind: 'CONAE' },
  { label: 'CONAE catalogue registration', detail: 'Registration portal for SAOCOM One Click access', href: 'https://registro.conae.gov.ar/registracion/view/', kind: 'CONAE' },
]

function SceneUpload({ side, file, date, productId, polarization, onFile, onDate, onProductId, onPolarization }: {
  side: SceneSide
  file: File | null
  date: string
  productId: string
  polarization: string
  onFile: (file: File | null) => void
  onDate: (date: string) => void
  onProductId: (id: string) => void
  onPolarization: (value: string) => void
}) {
  const inputId = `quicklook-${side}`
  const sceneName = side === 'before' ? 'Earlier acquisition' : 'Later acquisition'
  function handleFile(event: ChangeEvent<HTMLInputElement>) {
    const selected = event.currentTarget.files?.[0] ?? null
    onFile(selected)
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-black/20 p-4 sm:p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[.22em] text-[#83dfc2]">{side === 'before' ? '01 / BASELINE' : '02 / COMPARISON'}</p>
          <h4 className="mt-1 font-display text-lg text-[#e8ede8]">{sceneName}</h4>
        </div>
        <FileImage className="h-5 w-5 text-[#9aa9a2]" aria-hidden="true" />
      </div>
      <label htmlFor={inputId} className="group flex min-h-28 cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-[#83dfc2]/30 bg-[#83dfc2]/[.035] px-4 py-5 text-center transition hover:border-[#83dfc2]/70 hover:bg-[#83dfc2]/[.08] focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-[#b9ed8e]">
        <Upload className="h-5 w-5 text-[#83dfc2] transition group-hover:-translate-y-0.5" aria-hidden="true" />
        <span className="text-sm font-medium text-[#e8ede8]">{file ? file.name : 'Choose a browse image'}</span>
        <span className="text-xs text-[#9aa9a2]">PNG or JPEG · selected file stays on this device</span>
      </label>
      <input id={inputId} className="sr-only" type="file" accept="image/png,image/jpeg" onChange={handleFile} aria-label={`Select ${side} NISAR product browse image`} />
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <label className="block text-xs text-[#aebbb4]">Acquisition date
          <input className="mt-1.5 min-h-11 w-full rounded-lg border border-white/10 bg-[#0a1414] px-3 text-sm text-[#e8ede8] outline-none transition placeholder:text-[#64736c] focus:border-[#83dfc2]/70" type="date" value={date} onChange={(event) => onDate(event.currentTarget.value)} required />
        </label>
        <label className="block text-xs text-[#aebbb4]">Polarization / mode
          <select className="mt-1.5 min-h-11 w-full rounded-lg border border-white/10 bg-[#0a1414] px-3 text-sm text-[#e8ede8] outline-none transition focus:border-[#83dfc2]/70" value={polarization} onChange={(event) => onPolarization(event.currentTarget.value)} required>
            <option value="">Choose from product metadata</option>
            <option value="HH">HH</option><option value="HV">HV</option><option value="VV">VV</option><option value="VH">VH</option><option value="Multi-pol / covariance">Multi-pol / covariance</option><option value="Other / see metadata">Other / see metadata</option>
          </select>
        </label>
        <label className="block text-xs text-[#aebbb4] sm:col-span-2">NISAR product identifier
          <input className="mt-1.5 min-h-11 w-full rounded-lg border border-white/10 bg-[#0a1414] px-3 text-sm text-[#e8ede8] outline-none transition placeholder:text-[#64736c] focus:border-[#83dfc2]/70" type="text" value={productId} onChange={(event) => onProductId(event.currentTarget.value)} placeholder="Copy the product / granule ID from ASF" required />
        </label>
      </div>
    </div>
  )
}

export function NisarWorkbench({ location, seed }: { location: StoryLocation; seed: StudySeed | null }) {
  const sampleRecord = location.nisarBrowseRecords?.[0]
  const [maturity, setMaturity] = useState<Maturity>('VALIDATED')
  const [selectedProduct, setSelectedProduct] = useState<ProductKey>('GUNW')
  const [studyName, setStudyName] = useState(location.name)
  const [studyCountry, setStudyCountry] = useState(location.country)
  const [latitude, setLatitude] = useState(String(location.coordinates[1]))
  const [longitude, setLongitude] = useState(String(location.coordinates[0]))
  const [beforeFile, setBeforeFile] = useState<File | null>(null)
  const [afterFile, setAfterFile] = useState<File | null>(null)
  const [beforeDate, setBeforeDate] = useState(sampleRecord?.startTime.slice(0, 10) ?? '')
  const [afterDate, setAfterDate] = useState(sampleRecord?.stopTime.slice(0, 10) ?? '')
  const [beforeId, setBeforeId] = useState(sampleRecord?.productId ?? '')
  const [afterId, setAfterId] = useState(sampleRecord?.productId ?? '')
  const [beforePolarization, setBeforePolarization] = useState('Other / see metadata')
  const [afterPolarization, setAfterPolarization] = useState('Other / see metadata')
  const [split, setSplit] = useState(50)
  const [status, setStatus] = useState('')
  const [copyStatus, setCopyStatus] = useState('')
  const beforeUrl = useMemo(() => beforeFile ? URL.createObjectURL(beforeFile) : '', [beforeFile])
  const afterUrl = useMemo(() => afterFile ? URL.createObjectURL(afterFile) : '', [afterFile])
  const latitudeValue = Number(latitude)
  const longitudeValue = Number(longitude)
  const coordinatesAreValid = latitude.trim() !== '' && longitude.trim() !== '' && Number.isFinite(latitudeValue) && Number.isFinite(longitudeValue) && latitudeValue >= -90 && latitudeValue <= 90 && longitudeValue >= -180 && longitudeValue <= 180
  const studyAreaLabel = `${studyName.trim() || 'Unnamed study area'}${studyCountry.trim() ? `, ${studyCountry.trim()}` : ''}`
  const currentMaturity = maturityInfo[maturity]
  const currentProduct = products.find((product) => product.id === selectedProduct) ?? products[0]

  useEffect(() => {
    if (!seed) return
    setStudyName(seed.name)
    setStudyCountry(seed.country)
    setLatitude(seed.latitude.toFixed(4))
    setLongitude(seed.longitude.toFixed(4))
    setSelectedProduct(seed.product)
    setCopyStatus(`Search seed set to ${seed.name}. Confirm a real footprint in ASF before treating it as a result.`)
  }, [seed])

  useEffect(() => () => { if (beforeUrl) URL.revokeObjectURL(beforeUrl) }, [beforeUrl])
  useEffect(() => () => { if (afterUrl) URL.revokeObjectURL(afterUrl) }, [afterUrl])

  async function copyCoordinates() {
    if (!coordinatesAreValid) {
      setCopyStatus('Enter a latitude from −90 to 90 and longitude from −180 to 180.')
      return
    }
    const coordinates = `${latitudeValue.toFixed(4)}, ${longitudeValue.toFixed(4)} (${studyAreaLabel}; latitude, longitude)`
    try {
      await navigator.clipboard.writeText(coordinates)
      setCopyStatus('Coordinates copied.')
    } catch {
      setCopyStatus(`Select to copy: ${coordinates}`)
    }
    window.setTimeout(() => setCopyStatus(''), 3500)
  }

  function downloadEvidence(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const evidence = {
      schema: 'earth-choreographer-evidence/v1',
      recordStatus: 'User-entered provenance; product IDs and values are not independently verified.',
      studyArea: { name: studyName.trim(), country: studyCountry.trim(), latitude: latitudeValue, longitude: longitudeValue, note: 'Search coordinates are a starting point, not a confirmed NISAR product footprint.' },
      productFamily: selectedProduct,
      maturity,
      scenes: [
        { role: 'earlier', productId: beforeId.trim(), acquisitionDate: beforeDate, polarizationOrMode: beforePolarization, localBrowseFilename: beforeFile?.name ?? null },
        { role: 'later', productId: afterId.trim(), acquisitionDate: afterDate, polarizationOrMode: afterPolarization, localBrowseFilename: afterFile?.name ?? null },
      ],
      display: 'Local browse-image visual comparison only. This application did not calculate a measurement or displacement from these images.',
      catalog: 'ASF DAAC / Vertex',
      sources: [maturityInfo[maturity].vertex, 'https://nisar-docs.asf.alaska.edu/products-overview/'],
    }
    const blob = new Blob([JSON.stringify(evidence, null, 2)], { type: 'application/json' })
    const objectUrl = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = objectUrl
    anchor.download = `earth-choreographer-${location.id}-evidence-note.json`
    anchor.click()
    window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1000)
    setStatus('Evidence note downloaded. Check its product IDs against the ASF record before presenting.')
  }

  function handleFile(side: SceneSide, file: File | null) {
    if (file && !['image/png', 'image/jpeg'].includes(file.type)) {
      setStatus('Choose a PNG or JPEG browse image. HDF5 science data is not read by this preview tool.')
      return
    }
    setStatus('')
    if (side === 'before') setBeforeFile(file)
    else setAfterFile(file)
  }

  return (
    <section id="nisar-data" className="relative scroll-mt-20 overflow-hidden border-y border-white/[.08] bg-[#081111] px-5 py-20 sm:px-8 sm:py-28 lg:px-[7.3vw] lg:py-36" aria-labelledby="nisar-title">
      <div className="pointer-events-none absolute -right-24 top-12 h-72 w-72 rounded-full bg-[#3bb98d]/[.08] blur-3xl" aria-hidden="true" />
      <div className="relative mx-auto max-w-[1440px]">
        <div className="mb-14 flex flex-wrap items-end justify-between gap-5 border-b border-white/10 pb-5">
          <div className="flex items-center gap-3 text-[10px] font-semibold uppercase tracking-[.2em] text-[#9aa9a2]"><span className="text-[#83dfc2]">02</span><span className="text-[#e9b574]">/</span><span>THE NISAR DATA DESK</span></div>
          <span className="inline-flex items-center gap-2 rounded-full border border-[#83dfc2]/20 bg-[#83dfc2]/[.06] px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[.12em] text-[#a9e7cf]"><span className="h-1.5 w-1.5 rounded-full bg-[#b9ed8e] shadow-[0_0_10px_#b9ed8e]" />Open science archive</span>
        </div>

        <div className="grid gap-10 lg:grid-cols-[1.1fr_.9fr] lg:items-end">
          <div>
            <p className="mb-4 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[.2em] text-[#83dfc2]"><span className="h-px w-7 bg-[#83dfc2]" />From radar product to public story</p>
            <h2 id="nisar-title" className="max-w-4xl font-display text-5xl leading-[.98] tracking-[-.055em] text-[#e8ede8] sm:text-6xl lg:text-7xl">Make the evidence<br /><em className="text-[#a6dcbf]">part of the story.</em></h2>
          </div>
          <p className="max-w-xl border-l border-[#83dfc2]/30 pl-5 text-sm leading-7 text-[#a3b2aa] sm:text-base">NISAR science products are public. Start with a clear question, choose the product that can answer it, check the actual acquisition record, and carry its provenance into the story. A context basemap is not the evidence.</p>
        </div>

        <div className="mt-12 grid overflow-hidden rounded-2xl border border-white/10 bg-[#101d1c] lg:grid-cols-[1.15fr_.85fr]">
          <div className="p-6 sm:p-8 lg:p-10">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[.2em] text-[#83dfc2]">L-BAND DATA MATURITY</p>
                <p className="mt-2 font-display text-3xl text-[#e8ede8]">{maturity}</p>
                <p className="mt-1 text-xs text-[#9aa9a2]">Release · {currentMaturity.date}</p>
              </div>
              <div className="inline-flex rounded-xl border border-white/10 bg-[#081111] p-1" role="group" aria-label="Select NISAR data maturity">
                {(['VALIDATED', 'PROVISIONAL'] as const).map((option) => <button key={option} type="button" onClick={() => setMaturity(option)} aria-pressed={maturity === option} className={`min-h-10 rounded-lg px-3 text-[10px] font-semibold tracking-[.08em] transition sm:px-4 ${maturity === option ? 'bg-[#83dfc2]/15 text-[#bbefd8] shadow-[inset_0_0_0_1px_rgba(131,223,194,.22)]' : 'text-[#88988f] hover:text-[#e8ede8]'}`}>{option}</button>)}
              </div>
            </div>
            <p className="mt-5 font-mono text-xs leading-6 text-[#c8d3cb]">{currentMaturity.coverage}</p>
            <p className="mt-4 flex gap-2 text-xs leading-6 text-[#9aa9a2]"><Info className="mt-0.5 h-4 w-4 shrink-0 text-[#e9b574]" aria-hidden="true" />{currentMaturity.note}</p>
          </div>
          <div className="flex flex-col justify-between gap-6 border-t border-white/10 bg-[#0b1716] p-6 sm:p-8 lg:border-l lg:border-t-0 lg:p-10">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[.2em] text-[#9aa9a2]">SELECTED STUDY AREA</p>
              <h3 className="mt-2 font-display text-2xl text-[#e8ede8]">{studyAreaLabel}</h3>
              <p className="mt-3 text-[10px] leading-4 text-[#87968e]">Edit the illustrative Quetta starting point or enter another place. These coordinates seed a search; they do not confirm a product footprint.</p>
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                <label className="block text-[10px] text-[#9aa9a2]">Place name
                  <input className="mt-1 min-h-10 w-full rounded-lg border border-white/10 bg-[#081111] px-3 text-xs text-[#e8ede8] outline-none focus:border-[#83dfc2]/70" value={studyName} onChange={(event) => setStudyName(event.currentTarget.value)} aria-label="Study area name" />
                </label>
                <label className="block text-[10px] text-[#9aa9a2]">Country / region
                  <input className="mt-1 min-h-10 w-full rounded-lg border border-white/10 bg-[#081111] px-3 text-xs text-[#e8ede8] outline-none focus:border-[#83dfc2]/70" value={studyCountry} onChange={(event) => setStudyCountry(event.currentTarget.value)} aria-label="Study area country or region" />
                </label>
                <label className="block text-[10px] text-[#9aa9a2]">Latitude
                  <input className="mt-1 min-h-10 w-full rounded-lg border border-white/10 bg-[#081111] px-3 font-mono text-xs text-[#e8ede8] outline-none focus:border-[#83dfc2]/70" type="number" min="-90" max="90" step="any" value={latitude} onChange={(event) => setLatitude(event.currentTarget.value)} aria-label="Study area latitude, between minus 90 and 90 degrees" />
                </label>
                <label className="block text-[10px] text-[#9aa9a2]">Longitude
                  <input className="mt-1 min-h-10 w-full rounded-lg border border-white/10 bg-[#081111] px-3 font-mono text-xs text-[#e8ede8] outline-none focus:border-[#83dfc2]/70" type="number" min="-180" max="180" step="any" value={longitude} onChange={(event) => setLongitude(event.currentTarget.value)} aria-label="Study area longitude, between minus 180 and 180 degrees" />
                </label>
              </div>
              <p className="mt-2 font-mono text-[10px] text-[#83dfc2]">{coordinatesAreValid ? `${Math.abs(latitudeValue).toFixed(4)}° ${latitudeValue < 0 ? 'S' : 'N'} · ${Math.abs(longitudeValue).toFixed(4)}° ${longitudeValue < 0 ? 'W' : 'E'}` : 'Check latitude / longitude bounds'}</p>
              <button type="button" onClick={copyCoordinates} disabled={!coordinatesAreValid} className="mt-2 inline-flex min-h-9 items-center gap-2 rounded-lg border border-white/10 px-3 text-xs text-[#c5d2ca] transition hover:border-[#83dfc2]/50 hover:text-[#b9ed8e] disabled:cursor-not-allowed disabled:opacity-40"><Clipboard size={13} />Copy search coordinates</button>
              <p className="mt-2 min-h-4 text-[11px] text-[#b9ed8e]" aria-live="polite">{copyStatus}</p>
            </div>
            <a href={currentMaturity.vertex} target="_blank" rel="noreferrer" className="nisar-primary-link inline-flex min-h-12 items-center justify-between gap-3 rounded-xl bg-[#b9ed8e] px-4 font-semibold text-[#071011] transition hover:bg-[#d0ffa6] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#b9ed8e]"><span>Search this maturity in ASF Vertex</span><ExternalLink size={16} /></a>
          </div>
        </div>

        <div className="mt-16 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div><p className="text-[10px] font-semibold uppercase tracking-[.2em] text-[#e9b574]">01 / MATCH THE QUESTION TO THE PRODUCT</p><h3 className="mt-2 font-display text-3xl text-[#e8ede8] sm:text-4xl">Choose what the radar can tell you.</h3></div>
          <p className="max-w-md text-xs leading-6 text-[#899990]">Select a path to see the relevant product and its scientific role. Choose the same product family and compatible acquisition settings for a defensible comparison.</p>
        </div>
        <div className="mt-6 grid gap-3 lg:grid-cols-3">
          {products.map((product) => {
            const Icon = product.icon
            const isSelected = selectedProduct === product.id
            return <button key={product.id} type="button" aria-pressed={isSelected} onClick={() => setSelectedProduct(product.id)} className={`group flex h-full flex-col rounded-2xl border p-5 text-left transition duration-200 sm:p-6 ${isSelected ? 'border-[#83dfc2]/45 bg-[#83dfc2]/[.08] shadow-[0_18px_60px_rgba(0,0,0,.2)]' : 'border-white/10 bg-white/[.025] hover:border-white/20 hover:bg-white/[.045]'}`}>
              <div className="flex w-full items-start justify-between gap-3"><span className={`grid h-11 w-11 place-items-center rounded-xl border ${isSelected ? 'border-[#83dfc2]/25 bg-[#83dfc2]/10 text-[#83dfc2]' : 'border-white/10 bg-white/[.04] text-[#96aaa0]'}`}><Icon size={18} aria-hidden="true" /></span><span className="rounded-md border border-white/10 px-2 py-1 font-mono text-[10px] text-[#b7c5bd]">{product.id} · L2</span></div>
              <p className="mt-5 text-[9px] font-semibold uppercase tracking-[.18em] text-[#9aa9a2]">{product.theme}</p>
              <h4 className="mt-2 font-display text-2xl text-[#e8ede8]">{product.title}</h4>
              <p className="mt-3 flex-1 text-xs leading-6 text-[#9aa9a2]">{product.summary}</p>
              <span className="mt-5 flex items-center justify-between border-t border-white/10 pt-4 text-xs text-[#b8c8be]"><span>{product.use}</span><ArrowRight className={`h-4 w-4 transition ${isSelected ? 'translate-x-0 text-[#b9ed8e]' : '-translate-x-1 text-[#6c8075] group-hover:translate-x-0'}`} /></span>
            </button>
          })}
        </div>
        <div className="mt-4 flex flex-wrap items-start gap-3 rounded-xl border border-[#e9b574]/15 bg-[#e9b574]/[.035] p-4 text-xs leading-6 text-[#aebbb2]"><span className="shrink-0 rounded-md bg-[#e9b574]/10 px-2 py-1 font-mono text-[10px] text-[#e9b574]">{currentProduct.id}</span><span><strong className="text-[#e4e9df]">Now selected: {currentProduct.title}.</strong> {currentProduct.summary} Product coverage and quality are location-, date-, and maturity-dependent. Inspect the granule metadata and current ASF known-issues page before interpreting it.</span></div>

        {location.nisarBrowseRecords?.map((record) => <NisarSampleRecord key={record.productId} record={record} />)}

        <div className="mt-20 grid gap-9 lg:grid-cols-[.7fr_1.3fr] lg:gap-14">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[.2em] text-[#83dfc2]">02 / BUILD A TRANSPARENT COMPARISON</p>
            <h3 className="mt-3 font-display text-3xl leading-tight text-[#e8ede8] sm:text-4xl">Bring the browse images.<br /><em className="text-[#a6dcbf]">Keep the source attached.</em></h3>
            <p className="mt-5 text-sm leading-7 text-[#9aa9a2]">Download NISAR product files from ASF Vertex, then select the associated PNG browse previews here. Record the product IDs, acquisition dates, and polarization from the metadata. This is a local visual comparison—not a calculation from the science data.</p>
            <div className="mt-6 space-y-3">
              <div className="flex gap-3 rounded-xl border border-white/10 bg-white/[.025] p-4"><span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-[#83dfc2]/10 font-mono text-[11px] text-[#83dfc2]">1</span><p className="text-xs leading-5 text-[#a3b2aa]">Search {studyName || 'your study area'} and a date range in ASF Vertex. Draw an area of interest around your coordinates, then filter by the selected product and maturity.</p></div>
              <div className="flex gap-3 rounded-xl border border-white/10 bg-white/[.025] p-4"><span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-[#83dfc2]/10 font-mono text-[11px] text-[#83dfc2]">2</span><p className="text-xs leading-5 text-[#a3b2aa]">Download the associated browse PNGs for visual review. The science measurements are in HDF5; Earthdata Login is required to download NISAR science data.</p></div>
              <div className="flex gap-3 rounded-xl border border-white/10 bg-white/[.025] p-4"><span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-[#83dfc2]/10 font-mono text-[11px] text-[#83dfc2]">3</span><p className="text-xs leading-5 text-[#a3b2aa]">For quantitative analysis, use the HDF5 science data and a scientific NISAR workflow. Do not read displacement or surface change from browse-image colour alone.</p></div>
            </div>
            <div className="mt-5 flex items-center gap-2 text-[11px] text-[#83dfc2]"><LockKeyhole size={13} /><span>Selected images never leave this browser session.</span></div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-[#0e1a19] p-4 sm:p-6 lg:p-7">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div><p className="text-[10px] font-semibold uppercase tracking-[.2em] text-[#e9b574]">LOCAL-ONLY · VISUAL QUICKLOOK</p><h3 className="mt-2 font-display text-2xl text-[#e8ede8] sm:text-3xl">Two acquisitions. One careful comparison.</h3></div>
              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 px-3 py-1.5 text-[9px] uppercase tracking-[.12em] text-[#9aa9a2]"><ShieldCheck size={12} className="text-[#83dfc2]" />No upload</span>
            </div>
            <p className="mt-3 text-xs leading-5 text-[#829189]">PNG/JPEG browse previews only. This tool does not open HDF5, GeoTIFF, SLC phase, or pixel values.</p>
            <div className="mt-5 grid gap-3 xl:grid-cols-2">
              <SceneUpload side="before" file={beforeFile} date={beforeDate} productId={beforeId} polarization={beforePolarization} onFile={(file) => handleFile('before', file)} onDate={setBeforeDate} onProductId={setBeforeId} onPolarization={setBeforePolarization} />
              <SceneUpload side="after" file={afterFile} date={afterDate} productId={afterId} polarization={afterPolarization} onFile={(file) => handleFile('after', file)} onDate={setAfterDate} onProductId={setAfterId} onPolarization={setAfterPolarization} />
            </div>
            {sampleRecord && <p className="mt-3 text-[11px] leading-5 text-[#b8c7bd]">Example metadata is prefilled from the pinned ASF sample above. Replace it with the date, product ID, and polarization from each browse image you add.</p>}

            <div className="mt-5 overflow-hidden rounded-xl border border-white/10 bg-[#050b0c]">
              <div className="flex items-center justify-between border-b border-white/10 px-4 py-3 text-[9px] font-semibold uppercase tracking-[.14em] text-[#95a49b]"><span>Browse comparison</span><span>{beforeFile && afterFile ? 'Ready · visual only' : 'Add two preview images'}</span></div>
              <div className="relative aspect-[16/8] min-h-48 overflow-hidden">
                {beforeUrl ? <img src={beforeUrl} alt="Earlier NISAR browse preview, selected locally" className="absolute inset-0 h-full w-full object-contain" /> : <div className="absolute inset-0 grid place-items-center bg-[radial-gradient(ellipse_at_center,rgba(23,77,69,.26),transparent_65%)]"><span className="text-xs text-[#6f8077]">Earlier browse image</span></div>}
                {afterUrl && <div className="absolute inset-0 overflow-hidden" style={{ clipPath: `inset(0 0 0 ${split}%)` }}><img src={afterUrl} alt="Later NISAR browse preview, selected locally" className="h-full w-full object-contain" /></div>}
                {!beforeFile && !afterFile && sampleRecord && <><img src={sampleRecord.browseImage} alt="Pinned ASF NISAR sample browse preview; upload two images to compare your own acquisitions" className="absolute inset-0 h-full w-full object-contain opacity-75" /><div className="absolute inset-0 grid place-items-center bg-[#071011]/25"><span className="rounded-md border border-white/20 bg-[#071011]/85 px-3 py-2 text-center text-[10px] uppercase tracking-[.12em] text-[#e8ede8]">Pinned ASF example · upload two images to compare</span></div></>}
                {beforeFile && afterFile && <div className="pointer-events-none absolute inset-y-0 w-px bg-[#dcecdf] shadow-[0_0_12px_rgba(180,245,213,.8)]" style={{ left: `${split}%` }}><span className="absolute left-1/2 top-1/2 grid h-9 w-9 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-white/40 bg-[#0a1715] text-[#e8ede8]">↔</span></div>}
                <span className="absolute left-3 top-3 rounded-md bg-[#071011]/80 px-2 py-1 text-[9px] text-white">EARLIER</span>
                <span className="absolute right-3 top-3 rounded-md bg-[#071011]/80 px-2 py-1 text-[9px] text-white">LATER</span>
              </div>
              <div className="flex items-center gap-3 border-t border-white/10 px-4 py-3"><span className="text-[10px] text-[#9aa9a2]">WIPE</span><input className="h-4 w-full accent-[#83dfc2] disabled:opacity-40" type="range" min="5" max="95" value={split} onChange={(event) => setSplit(Number(event.currentTarget.value))} disabled={!beforeFile || !afterFile} aria-label="Move the quicklook comparison split" /><span className="min-w-10 text-right font-mono text-[10px] text-[#c0d0c6]">{split}%</span></div>
            </div>
            <form className="mt-5" onSubmit={downloadEvidence}>
              <div className="flex flex-col gap-3 border-t border-white/10 pt-5 sm:flex-row sm:items-center sm:justify-between">
                <p className="max-w-sm text-[11px] leading-5 text-[#84938b]">Creates a JSON provenance note from your entries. It includes no image data and makes no claim that a product was independently verified.</p>
              <button type="submit" disabled={!coordinatesAreValid || !studyName.trim() || !studyCountry.trim() || !beforeFile || !afterFile || !beforeId.trim() || !afterId.trim() || !beforeDate || !afterDate || !beforePolarization || !afterPolarization} className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-[#83dfc2] px-4 text-xs font-bold text-[#071011] transition hover:bg-[#adf2d6] disabled:cursor-not-allowed disabled:bg-white/10 disabled:text-[#69776f]"><Check size={15} />Download evidence note</button>
              </div>
              <p role="status" aria-live="polite" className="mt-3 min-h-5 text-xs text-[#b9ed8e]">{status}</p>
            </form>
          </div>
        </div>

        <div className="mt-20 border-t border-white/10 pt-8">
          <div className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-[10px] font-semibold uppercase tracking-[.2em] text-[#83dfc2]">DATA & SOURCES</p><h3 className="mt-2 font-display text-3xl text-[#e8ede8]">Follow the record to the source.</h3></div><a href="https://nisar-docs.asf.alaska.edu/availability-overview/" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-xs text-[#b9ed8e] hover:text-[#d7ffc0]">Release history <ExternalLink size={13} /></a></div>
          <div className="mt-6 grid gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {sourceLinks.map((link) => <a key={link.label} href={link.href} target="_blank" rel="noreferrer" className="group flex min-h-24 flex-col justify-between rounded-xl border border-white/10 bg-white/[.025] p-4 transition hover:border-[#83dfc2]/35 hover:bg-[#83dfc2]/[.045]"><span className="flex items-start justify-between gap-3 text-sm font-medium text-[#dce6de]">{link.label}<ExternalLink size={13} className="mt-0.5 shrink-0 text-[#7f9187] group-hover:text-[#83dfc2]" /></span><span className="mt-3 text-[10px] leading-4 text-[#86958d]">{link.detail}<span className="ml-1 text-[#e9b574]">· {link.kind}</span></span></a>)}
          </div>
          <p className="mt-6 rounded-xl border border-[#e9b574]/15 bg-[#e9b574]/[.035] p-4 text-[11px] leading-6 text-[#9ea99f]">NASA does not endorse any non-U.S. Government entity and is not responsible for information contained on non-U.S. Government websites. For non-U.S. Government websites, participants must comply with any data use parameters of that specific website.</p>
          <div className="mt-5 flex flex-wrap items-center justify-between gap-3 text-[10px] text-[#687a71]"><span>NASA GIBS VIIRS = optical context · Blue Marble = static globe texture · neither is a NISAR measurement.</span><span>Source code: MIT License · Team: add your team name · GitHub: add repository URL</span></div>
        </div>
      </div>
    </section>
  )
}
