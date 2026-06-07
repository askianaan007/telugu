export interface OfficeLocation {
  id: string
  city: string
  country: string
  badge?: string
  description: string
  image: string
  coords: { lat: string; lng: string }
  cardHeading: string
  cardSubtitle?: string
  flagSvg: string
}

export const OFFICE_LOCATIONS: OfficeLocation[] = [
  {
    id: 'india',
    city: 'India',
    country: 'Head Office',
    badge: 'INDIA',
    description:
      'Serving as the central hub for our operations, the head office in India oversees a wide range of activities, including the management of domestic charter services and the execution of significant infrastructure projects that enhance our service offerings across the country.',
    image: '/images/aviation-cockpit.jpg',
    coords: { lat: '17.385044° N', lng: '78.486671° E' },
    cardHeading: 'India',
    cardSubtitle: 'Head Office',
    flagSvg: '/images/India Flag.svg',
  },
  {
    id: 'dubai',
    city: 'Dubai',
    country: 'UAE',
    description:
      'Positioned as a vital strategic hub, our Dubai office facilitates seamless connections between clients in the Middle East and our comprehensive Indian aviation services, thereby expanding our reach and enhancing customer engagement in this dynamic region.',
    image: '/images/helicopter-coastline.jpg',
    coords: { lat: '25.276987° N', lng: '55.296249° E' },
    cardHeading: 'Dubai, UAE',
    flagSvg: '/images/UAE Flag.svg',
  },
  {
    id: 'newyork',
    city: 'New York',
    country: 'USA',
    description:
      'Our New York office plays a crucial role in fostering international partnerships and exploring investment opportunities, allowing us to tap into the North American market and strengthen our global network through collaborative ventures and strategic alliances.',
    image: '/images/charter-luxury-interior.jpg',
    coords: { lat: '40.712776° N', lng: '74.005974° W' },
    cardHeading: 'New York, USA',
    flagSvg: '/images/USA Flag.svg',
  },
]
