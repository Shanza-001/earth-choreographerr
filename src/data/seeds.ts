import type { StudySeed } from '../types'

export const studySeeds: Array<Omit<StudySeed, 'nonce'>> = [
  {
    id: 'quetta',
    name: 'Quetta',
    country: 'Pakistan',
    latitude: 30.1798,
    longitude: 66.975,
    product: 'GUNW',
    question: 'Did the city floor shift between two passes?',
  },
  {
    id: 'sundarbans',
    name: 'Sundarbans',
    country: 'Bangladesh',
    latitude: 21.9497,
    longitude: 89.1833,
    product: 'GCOV',
    question: 'Where is mangrove standing in floodwater?',
  },
  {
    id: 'baltoro',
    name: 'Baltoro Glacier',
    country: 'Pakistan',
    latitude: 35.737,
    longitude: 76.4,
    product: 'GOFF',
    question: 'How is the ice translating down-valley?',
  },
  {
    id: 'sorriso',
    name: 'Sorriso',
    country: 'Brazil',
    latitude: -12.5428,
    longitude: -55.7211,
    product: 'GCOV',
    question: 'Did crop structure change the echo?',
  },
]
