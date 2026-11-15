import { useState } from 'react'
import { ArrowDownRight, ArrowUpRight, Download, Share2 } from 'lucide-react'
import type { StoryLocation } from '../types'
import { MoveMark } from './MoveMark'

interface DanceCardProps {
  location: StoryLocation
}

function formatSampleDate(date: string) {
  return new Date(`${date}T12:00:00Z`).toLocaleDateString('en', {
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  })
}

function wrapCanvasText(context: CanvasRenderingContext2D, text: string, x: number, y: number, maxWidth: number, lineHeight: number) {
  const words = text.split(/\s+/)
  let line = ''
  let currentY = y
  for (const word of words) {
    const nextLine = line ? `${line} ${word}` : word
    if (context.measureText(nextLine).width > maxWidth && line) {
      context.fillText(line, x, currentY)
      line = word
      currentY += lineHeight
    } else {
      line = nextLine
    }
  }
  if (line) context.fillText(line, x, currentY)
}

export function DanceCard({ location }: DanceCardProps) {
  const [periodIndex, setPeriodIndex] = useState(0)
  const [split, setSplit] = useState(48)
  const [shareState, setShareState] = useState('')
  const period = location.periods[periodIndex] ?? location.periods[0]

  async function downloadStoryCard() {
    setShareState('Preparing your story card…')
    const canvas = document.createElement('canvas')
    canvas.width = 1200
    canvas.height = 630
    const context = canvas.getContext('2d')
    if (!context) {
      setShareState('Your browser could not create the image.')
      return
    }

    const background = context.createLinearGradient(0, 0, 1200, 630)
    background.addColorStop(0, '#071211')
    background.addColorStop(0.58, '#10251f')
    background.addColorStop(1, '#132b22')
    context.fillStyle = background
    context.fillRect(0, 0, canvas.width, canvas.height)

    context.strokeStyle = 'rgba(105, 224, 190, 0.24)'
    context.lineWidth = 1
    for (let index = 0; index < 4; index += 1) {
      context.beginPath()
      context.ellipse(1020, 80, 190 + index * 48, 64 + index * 17, -0.42, 0, Math.PI * 2)
      context.stroke()
    }
    context.fillStyle = '#b8f18d'
    context.beginPath()
    context.arc(1028, 64, 5, 0, Math.PI * 2)
    context.fill()

    context.fillStyle = '#7fe1c5'
    context.font = '600 18px "DM Sans", sans-serif'
    context.letterSpacing = '3px'
    context.fillText('EARTH CHOREOGRAPHER  /  FIELD NOTE 01', 72, 82)
    context.letterSpacing = '0px'
    context.fillStyle = '#f5f0e7'
    context.font = '600 72px "Playfair Display", Georgia, serif'
    context.fillText(location.name, 70, 190)
    context.font = '500 26px "DM Sans", sans-serif'
    context.fillStyle = '#a7b9b0'
    context.fillText(`${location.country}   ·   ${location.changeType}`, 74, 239)

    context.fillStyle = '#eab974'
    context.font = '600 16px "DM Sans", sans-serif'
    context.letterSpacing = '2px'
    context.fillText('ILLUSTRATIVE SAMPLE DATA', 74, 308)
    context.letterSpacing = '0px'
    context.fillStyle = '#f5f0e7'
    context.font = '500 33px "Playfair Display", Georgia, serif'
    context.fillText(period.headline, 72, 360, 1020)
    context.fillStyle = '#b4c1bc'
    context.font = '400 20px "DM Sans", sans-serif'
    wrapCanvasText(context, location.what, 74, 408, 1000, 30)

    context.fillStyle = 'rgba(4, 10, 10, 0.38)'
    context.beginPath()
    context.roundRect(72, 522, 1056, 52, 20)
    context.fill()
    context.fillStyle = '#c6d2cb'
    context.font = '500 16px "DM Sans", sans-serif'
    context.fillText(`${formatSampleDate(period.date)}  ·  Illustrative sample date  ·  Not a measured NISAR product`, 94, 555)

    canvas.toBlob((blob) => {
      if (!blob) {
        setShareState('The image could not be prepared. Please try again.')
        return
      }
      const url = URL.createObjectURL(blob)
      const anchor = document.createElement('a')
      anchor.href = url
      anchor.download = `earth-choreographer-${location.id}-illustrative-story.png`
      anchor.click()
      URL.revokeObjectURL(url)
      setShareState('Story card downloaded.')
      window.setTimeout(() => setShareState(''), 4200)
    }, 'image/png')
  }

  return (
    <article className="dance-card" aria-labelledby="dance-card-title">
      <div className="card-headerline">
        <span className="section-index">THE DANCE CARD <span>·</span> 01</span>
        <span className="sample-pill"><span />{location.sampleLabel}</span>
      </div>

      <div className="card-title-row">
        <MoveMark move={location.move} />
        <div>
          <p className="card-eyebrow">{location.changeType}</p>
          <h3 id="dance-card-title">{location.name}<span className="title-apostrophe">’</span>s ground in slow descent</h3>
          <p className="card-location">{location.name}, {location.country} <span>·</span> illustrative story</p>
        </div>
      </div>

      <div className="comparison-block">
        <div className="comparison-heading">
          <span>BEFORE / AFTER STUDY</span>
          <span className="comparison-sample"><span className="live-dot live-dot--amber" /> Illustrative sample data</span>
        </div>
        <div className="sar-scene" role="img" aria-label={`Illustrative sample comparison, ${location.comparison.beforeLabel} and ${location.comparison.afterLabel}. This is not satellite imagery.`}>
          <div className="sar-scene__half sar-scene__before">
            <span className="scene-label">{location.comparison.beforeLabel}</span>
            <span className="scene-wave scene-wave--one" />
            <span className="scene-wave scene-wave--two" />
            <span className="scene-wave scene-wave--three" />
            <span className="scene-target scene-target--one" />
            <span className="scene-target scene-target--two" />
            <span className="scene-target scene-target--three" />
            <span className="scene-corner-label">SAR / SAMPLE</span>
          </div>
          <div className="sar-scene__half sar-scene__after" style={{ clipPath: `inset(0 0 0 ${split}%)` }}>
            <span className="scene-label">{location.comparison.afterLabel}</span>
            <span className="scene-wave scene-wave--one" />
            <span className="scene-wave scene-wave--two" />
            <span className="scene-wave scene-wave--three" />
            <span className="scene-target scene-target--one" />
            <span className="scene-target scene-target--two" />
            <span className="scene-target scene-target--three" />
            <span className="scene-corner-label">SAR / SAMPLE</span>
          </div>
          <div className="split-handle" style={{ left: `${split}%` }} aria-hidden="true"><span><ArrowDownRight size={13} /><ArrowUpRight size={13} /></span></div>
        </div>
        <label className="range-label" htmlFor="comparison-range"><span>Drag the split to compare</span><span>{split}%</span></label>
        <input
          id="comparison-range"
          className="story-range comparison-range"
          type="range"
          min="8"
          max="92"
          value={split}
          onChange={(event) => setSplit(Number(event.target.value))}
          aria-label="Before and after image comparison split"
        />
      </div>

      <div className="timeline-block">
        <div className="timeline-heading">
          <div><span className="micro-label">TIME SLIDER</span><strong>{period.headline}</strong></div>
          <span className="date-value">{formatSampleDate(period.date)}<small>Illustrative sample date</small></span>
        </div>
        <input
          className="story-range timeline-range"
          type="range"
          min="0"
          max={location.periods.length - 1}
          step="1"
          value={periodIndex}
          onChange={(event) => setPeriodIndex(Number(event.target.value))}
          aria-label="Move through illustrative sample dates"
        />
        <div className="timeline-labels"><span>{formatSampleDate(location.periods[0].date)}</span><span>{formatSampleDate(location.periods[location.periods.length - 1].date)}</span></div>
        <p className="timeline-caption">{period.caption} <span>· {location.sampleLabel}</span></p>
      </div>

      <div className="story-details">
        <div className="story-detail story-detail--what">
          <span className="detail-label"><span className="detail-number">01</span> WHAT IS CHANGING</span>
          <p>{location.what}</p>
        </div>
        <div className="story-detail story-detail--measure">
          <span className="detail-label"><span className="detail-number">02</span> HOW MUCH</span>
          <strong>{location.howMuch.value}</strong>
          <small>{location.howMuch.label} · {location.howMuch.unit}</small>
          <span className="micro-sample">{location.sampleLabel}</span>
        </div>
        <div className="story-detail">
          <span className="detail-label"><span className="detail-number">03</span> WHY IT MAY HAPPEN</span>
          <ul>{location.drivers.map((driver) => <li key={driver}>{driver}</li>)}</ul>
        </div>
        <div className="story-detail">
          <span className="detail-label"><span className="detail-number">04</span> RADAR CHANNEL</span>
          <strong className="detail-strong">{location.radarChannel.name}</strong>
          <p>{location.radarChannel.description}</p>
        </div>
        <div className="story-detail story-detail--affected">
          <span className="detail-label"><span className="detail-number">05</span> WHO MAY BE AFFECTED</span>
          <p>{location.affected}</p>
        </div>
      </div>

      <div className="share-row">
        <div className="share-context"><span className="share-icon"><Share2 size={16} /></span><span>Carry this place with you<small>Export a story card image</small></span></div>
        <button className="share-button" type="button" onClick={downloadStoryCard}><span>Share this place</span><Download size={15} /></button>
      </div>
      <p className="share-status" aria-live="polite">{shareState}</p>
    </article>
  )
}
