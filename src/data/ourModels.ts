export type OurModelId = 'robinson-r44' | 'airbus-h125' | 'bell-407'

export type OurModelStat = {
  value: string
  label: string
}

export type OurModel = {
  id: OurModelId
  name: string
  tagline: string
  shortDescription: string
  overviewImageSrc: string
  seats: OurModelStat
  kts: OurModelStat
  nm: OurModelStat
  ft: OurModelStat
}

export const OUR_MODELS: readonly OurModel[] = [
  {
    id: 'robinson-r44',
    name: 'Robinson R44',
    tagline: 'Agile private charter helicopter for short regional journeys and executive travel.',
    shortDescription:
      'A refined four-seat helicopter suited for private transfers, aerial visits, and flexible short-distance travel.',
    overviewImageSrc: '/images/our-models-airbus-h125.png',
    seats: { value: '4', label: 'Seats' },
    kts: { value: '113', label: 'KTS' },
    nm: { value: '348', label: 'NM' },
    ft: { value: '14,000', label: 'FT' },
  },
  {
    id: 'airbus-h125',
    name: 'Airbus H125',
    tagline: 'Built for performance across challenging routes.',
    shortDescription:
      'A versatile single-engine helicopter designed for charter, utility, and high-altitude operations.',
    overviewImageSrc: '/images/our-models-robinson-r44.png',
    seats: { value: '5', label: 'Seats' },
    kts: { value: '130', label: 'KTS' },
    nm: { value: '360', label: 'NM' },
    ft: { value: 'High', label: 'FT' },
  },
  {
    id: 'bell-407',
    name: 'Bell 407',
    tagline: 'Executive comfort for premium regional travel.',
    shortDescription:
      'A turbine helicopter crafted for corporate movement, luxury transfers, and smooth point-to-point missions.',
    overviewImageSrc: '/images/our-models-bell-407.png',
    seats: { value: '5', label: 'Seats' },
    kts: { value: '133', label: 'KTS' },
    nm: { value: '337', label: 'NM' },
    ft: { value: '20,000', label: 'FT' },
  },
] as const

export function getOurModelIndex(id: OurModelId): number {
  return OUR_MODELS.findIndex((m) => m.id === id)
}
