export type DanceMove = 'subsidence' | 'glacier' | 'flood' | 'flash'
export type NisarProductFamily = 'GUNW' | 'GCOV' | 'GOFF'

export interface StudySeed {
  id: string
  nonce: number
  name: string
  country: string
  latitude: number
  longitude: number
  product: NisarProductFamily
  question: string
}

export interface StoryPeriod {
  date: string
  label: string
  headline: string
  caption: string
}

export interface NisarBrowseRecord {
  productId: string
  productFamily: 'GUNW' | 'GCOV' | 'GOFF'
  level: string
  maturity: 'VALIDATED' | 'PROVISIONAL'
  fileName: string
  startTime: string
  stopTime: string
  catalogCheckedOn: string
  intersectsPoint: [number, number]
  browseImage: string
  browseUrl: string
  catalogUrl: string
  note: string
}

export interface StoryLocation {
  id: string
  name: string
  country: string
  coordinates: [number, number]
  changeType: string
  move: DanceMove
  sampleLabel: string
  periods: StoryPeriod[]
  what: string
  howMuch: {
    label: string
    value: string
    unit: string
  }
  drivers: string[]
  radarChannel: {
    name: string
    description: string
  }
  affected: string
  comparison: {
    beforeLabel: string
    afterLabel: string
  }
  nisarBrowseRecords?: NisarBrowseRecord[]
}
