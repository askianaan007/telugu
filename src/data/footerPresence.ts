/** Global presence cards — footer boarding-pass layout (copy per design). */
export type FooterPresenceCard = {
  id: string
  /** Large Halant title (e.g. India, Dubai, New York) */
  title: string
  address: string
  phone: string
  email: string
}

export const FOOTER_PRESENCE_CARDS: FooterPresenceCard[] = [
  {
    id: 'india',
    title: 'India',
    address: 'Hyderabad, India',
    phone: '+91 98765 43210',
    email: 'info@teluguairlines.com',
  },
  {
    id: 'dubai',
    title: 'Dubai',
    address: 'Dubai, UAE',
    phone: '+971 50 123 4567',
    email: 'dubai@teluguairlines.com',
  },
  {
    id: 'newyork',
    title: 'New York',
    address: 'New York, USA',
    phone: '+1 (212) 555-7890',
    email: 'usa@teluguairlines.com',
  },
]
