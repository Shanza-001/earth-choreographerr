export type ArtworkKey = 'hero' | 'subsidence' | 'glacier' | 'flood' | 'fire'

type ArtworkAsset = {
  managed: string
  local: string
}

const artwork: Record<ArtworkKey, ArtworkAsset> = {
  hero: {
    managed: '/manus-storage/async-images/Px6xRm82CgGb5ohCNsuOdL/image-1.webp',
    local: '/assets/hero-earth-horizon.webp',
  },
  subsidence: {
    managed: '/manus-storage/async-images/Px6xRm82CgGb5ohCNsuOdL/image-2.webp',
    local: '/assets/move-subsidence.webp',
  },
  glacier: {
    managed: '/manus-storage/async-images/Px6xRm82CgGb5ohCNsuOdL/image-3.webp',
    local: '/assets/move-glacier.webp',
  },
  flood: {
    managed: '/manus-storage/async-images/Px6xRm82CgGb5ohCNsuOdL/image-4.webp',
    local: '/assets/move-flood-wetland.webp',
  },
  fire: {
    managed: '/manus-storage/async-images/Px6xRm82CgGb5ohCNsuOdL/image-5.webp',
    local: '/assets/move-fire-farming.webp',
  },
}

/** Use stable managed assets in Cloud Preview and the packaged files in local VS Code runs. */
export function artworkSrc(key: ArtworkKey): string {
  if (typeof window === 'undefined') return artwork[key].local
  return window.location.hostname.endsWith('.manus.computer') ? artwork[key].managed : artwork[key].local
}
