import { useEffect, useState } from 'react'
import { ArrowRight, BookOpen, Check, X } from 'lucide-react'

const guideSteps = [
  {
    label: 'Orient',
    title: 'Start with one place',
    body: 'Use the Earth and explorer to choose a study area. The map is optical context; the NISAR evidence is clearly labelled below.',
  },
  {
    label: 'Read',
    title: 'Inspect the real echo',
    body: 'Open the ASF quicklook and use the three reading lenses to understand phase color, texture, and no-data gaps.',
  },
  {
    label: 'Listen',
    title: 'Match the question to the product',
    body: 'Choose GUNW for repeat-pass motion, GCOV for surface and vegetation signals, or GOFF for ice and pixel-offset movement.',
  },
  {
    label: 'Act',
    title: 'Carry the evidence forward',
    body: 'Use the data desk to record coordinates, maturity, product IDs, and browse images. Never call a browse color a displacement number.',
  },
]

interface FirstVisitGuideProps {
  onNavigate: (id: string) => void
}

export function FirstVisitGuide({ onNavigate }: FirstVisitGuideProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [stepIndex, setStepIndex] = useState(0)
  const [isFirstVisit, setIsFirstVisit] = useState(false)
  const step = guideSteps[stepIndex]
  const isLastStep = stepIndex === guideSteps.length - 1

  useEffect(() => {
    const hasSeenGuide = window.localStorage.getItem('earth-choreographer-guide-seen') === 'true'
    if (!hasSeenGuide) {
      setIsFirstVisit(true)
      setIsOpen(true)
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setIsOpen(false)
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  function closeGuide() {
    window.localStorage.setItem('earth-choreographer-guide-seen', 'true')
    setIsOpen(false)
    setIsFirstVisit(false)
  }

  function openGuide() {
    setStepIndex(0)
    setIsOpen(true)
  }

  function nextStep() {
    if (isLastStep) {
      closeGuide()
      onNavigate('nisar-data')
      return
    }
    setStepIndex((current) => current + 1)
  }

  return (
    <>
      <button
        type="button"
        className="inline-flex min-h-9 items-center gap-2 whitespace-nowrap rounded-full border border-[#83dfc2]/25 bg-[#83dfc2]/[.06] px-3 text-[10px] font-semibold uppercase tracking-[.13em] text-[#b8ecd6] transition hover:border-[#83dfc2]/60 hover:bg-[#83dfc2]/[.12] focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-[#b9ed8e]"
        onClick={openGuide}
        aria-label="Open the first-time user guide"
      >
        <BookOpen size={13} aria-hidden="true" />
        How to use
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-[#020707]/80 p-4 backdrop-blur-md" role="presentation" onMouseDown={(event) => {
          if (event.currentTarget === event.target) closeGuide()
        }}>
          <section
            className="relative w-full max-w-2xl overflow-hidden rounded-2xl border border-[#83dfc2]/20 bg-[#0a1716] text-[#e8ede8] shadow-2xl shadow-black/50"
            role="dialog"
            aria-modal="true"
            aria-labelledby="guide-title"
          >
            <div className="absolute -right-20 -top-20 h-56 w-56 rounded-full bg-[#3bb98d]/10 blur-3xl" aria-hidden="true" />
            <div className="relative border-b border-white/10 px-6 pb-5 pt-6 sm:px-8 sm:pt-8">
              <button type="button" className="absolute right-4 top-4 rounded-full p-2 text-[#91a59a] transition hover:bg-white/10 hover:text-white focus-visible:outline-2 focus-visible:outline-[#b9ed8e]" onClick={closeGuide} aria-label="Close guide">
                <X size={17} />
              </button>
              <p className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[.2em] text-[#83dfc2]"><span className="h-1.5 w-1.5 rounded-full bg-[#b9ed8e]" />FIRST-TIME FIELD GUIDE</p>
              <h2 id="guide-title" className="mt-4 max-w-lg font-display text-4xl leading-none tracking-[-.05em] sm:text-5xl">Read the Earth<br /><em className="text-[#a6dcbf]">in four moves.</em></h2>
              <p className="mt-4 max-w-xl text-sm leading-6 text-[#a3b2aa]">A short orientation before you explore the NISAR story. You can reopen this guide from the navigation at any time.</p>
            </div>

            <div className="relative grid gap-7 px-6 py-6 sm:px-8 sm:py-8 md:grid-cols-[150px_1fr]">
              <div className="flex gap-2 md:flex-col" role="tablist" aria-label="Guide steps">
                {guideSteps.map((item, index) => (
                  <button
                    key={item.label}
                    type="button"
                    role="tab"
                    aria-selected={index === stepIndex}
                    aria-label={`Step ${index + 1}: ${item.label}`}
                    onClick={() => setStepIndex(index)}
                    className={`flex min-h-10 flex-1 items-center gap-2 rounded-lg px-2 text-left text-[10px] font-semibold uppercase tracking-[.12em] transition md:flex-none ${index === stepIndex ? 'bg-[#83dfc2]/10 text-[#b9ed8e]' : 'text-[#71857b] hover:bg-white/[.04] hover:text-[#c7d7cd]'}`}
                  >
                    <span className="font-mono text-[9px]">{String(index + 1).padStart(2, '0')}</span>
                    <span className="hidden sm:inline md:inline">{item.label}</span>
                  </button>
                ))}
              </div>

              <div className="min-h-44 rounded-xl border border-white/10 bg-white/[.025] p-5 sm:p-6" role="tabpanel">
                <p className="text-[10px] font-semibold uppercase tracking-[.2em] text-[#e9b574]">STEP {String(stepIndex + 1).padStart(2, '0')} / {step.label}</p>
                <h3 className="mt-3 font-display text-3xl tracking-[-.04em] text-[#e8ede8]">{step.title}</h3>
                <p className="mt-3 max-w-lg text-sm leading-7 text-[#a3b2aa]">{step.body}</p>
              </div>
            </div>

            <div className="relative flex flex-wrap items-center justify-between gap-4 border-t border-white/10 px-6 py-4 sm:px-8">
              <label className="flex items-center gap-2 text-xs text-[#8fa197]">
                <input type="checkbox" checked={!isFirstVisit} onChange={(event) => {
                  if (event.currentTarget.checked) closeGuide()
                  else setIsFirstVisit(true)
                }} className="accent-[#b9ed8e]" />
                Don’t show automatically again
              </label>
              <button type="button" className="inline-flex min-h-10 items-center gap-2 rounded-lg bg-[#b9ed8e] px-4 text-xs font-semibold uppercase tracking-[.08em] text-[#071011] transition hover:bg-[#d0ffa6] focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-[#b9ed8e]" onClick={nextStep}>
                {isLastStep ? <Check size={14} /> : <ArrowRight size={14} />}
                {isLastStep ? 'Open the data desk' : 'Next step'}
              </button>
            </div>
          </section>
        </div>
      )}
    </>
  )
}
