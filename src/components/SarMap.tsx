import { useEffect, useRef, useState } from 'react'
import maplibregl from 'maplibre-gl'
import type { StoryLocation } from '../types'

interface SarMapProps {
  locations: StoryLocation[]
  activeId: string
  onSelect: (id: string) => void
}

const mapStyle = {
  version: 8 as const,
  sources: {
    nasaGibs: {
      type: 'raster' as const,
      tiles: ['https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/VIIRS_SNPP_CorrectedReflectance_TrueColor/default/default/GoogleMapsCompatible_Level9/{z}/{y}/{x}.jpg'],
      tileSize: 256,
      attribution: 'Imagery © NASA GIBS / NASA EOSDIS',
    },
  },
  layers: [{ id: 'nasa-gibs-viirs', type: 'raster' as const, source: 'nasaGibs' }],
}

export function SarMap({ locations, activeId, onSelect }: SarMapProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const onSelectRef = useRef(onSelect)
  const activeIdRef = useRef(activeId)
  const markerButtonsRef = useRef(new Map<string, HTMLButtonElement>())
  const [mapIssue, setMapIssue] = useState(false)
  const selectedLocation = locations.find((location) => location.id === activeId)

  useEffect(() => {
    onSelectRef.current = onSelect
  }, [onSelect])

  useEffect(() => {
    activeIdRef.current = activeId
    markerButtonsRef.current.forEach((button, id) => button.classList.toggle('is-active', id === activeId))
  }, [activeId])

  useEffect(() => {
    const container = containerRef.current
    const firstLocation = locations[0]
    if (!container || !firstLocation) return

    const map = new maplibregl.Map({
      container,
      style: mapStyle,
      center: firstLocation.coordinates,
      zoom: 8,
      minZoom: 2,
      maxZoom: 9,
      cooperativeGestures: true,
    })

    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-right')
    map.on('error', () => setMapIssue(true))

    const markers = locations.map((location) => {
      const button = document.createElement('button')
      button.type = 'button'
      button.className = `map-marker${location.id === activeIdRef.current ? ' is-active' : ''}`
      button.setAttribute('aria-label', `Open ${location.name}, ${location.country} dance card`)
      button.setAttribute('title', `${location.name} · ${location.changeType}`)
      const pulse = document.createElement('span')
      pulse.className = 'map-marker__pulse'
      pulse.setAttribute('aria-hidden', 'true')
      const dot = document.createElement('span')
      dot.className = 'map-marker__dot'
      dot.setAttribute('aria-hidden', 'true')
      button.append(pulse, dot)
      markerButtonsRef.current.set(location.id, button)
      button.addEventListener('click', () => onSelectRef.current(location.id))
      return new maplibregl.Marker({ element: button, anchor: 'center' })
        .setLngLat(location.coordinates)
        .addTo(map)
    })

    const observer = new ResizeObserver(() => map.resize())
    observer.observe(container)

    return () => {
      observer.disconnect()
      markers.forEach((marker) => marker.remove())
      markerButtonsRef.current.clear()
      map.remove()
    }
  }, [locations])

  return (
    <div className="map-frame">
      <div className="map-topline">
        <span className="map-kicker"><span className="live-dot" /> NASA GIBS · VIIRS OPTICAL CONTEXT</span>
        <span className="map-coordinates">MAP CENTER · {selectedLocation?.name.toUpperCase() ?? 'LOCATION'}</span>
      </div>
      <div
        ref={containerRef}
        className="map-canvas"
        role="region"
        aria-label={`Interactive NASA GIBS VIIRS optical context map, not NISAR radar data, showing ${locations.length} illustrative story location`}
      />
      <div className="map-place-tag">
        <span className="map-place-tag__index">01</span>
        <span><strong>{locations.find((location) => location.id === activeId)?.name ?? 'Selected place'}</strong><small>Illustrative story location</small></span>
      </div>
        {mapIssue && <p className="map-note" role="status">NASA imagery may be temporarily unavailable. Switch to 3D Earth or try again shortly.</p>}
    </div>
  )
}
