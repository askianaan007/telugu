export interface NavLink {
  label: string
  href: string
}

export const SITE_BRAND = {
  name: 'Telugu Airlines',
  tagline:
    'Premium helicopter charter and aviation solutions delivering safe, reliable, and modern air mobility services.',
  contactEmail: 'info@teluguairlines.com',
  contactPhone: '+91 98765 43210',
  address: 'Begumpet Heliport, Hyderabad, Telangana 500016',
} as const

export const NAV_LINKS: NavLink[] = [
  { label: 'Home', href: '/' },
  { label: 'about Us', href: '/#about' },
  { label: 'Services', href: '/#services' },
]

export const FOOTER_GROUPS: Array<{ title: string; links: NavLink[] }> = [
  {
    title: 'Quick Links',
    links: [
      { label: 'Home', href: '/' },
      { label: 'about Us', href: '/#about' },
      { label: 'Contact Us', href: '/#contact' },
    ],
  },
  {
    title: 'Our Services',
    links: [
      { label: 'Helicopter Charter Services', href: '/#services' },
      { label: 'Corporate Air Mobility', href: '/#services' },
      { label: 'VIP & Executive Travel', href: '/#services' },
      { label: 'Emergency Aviation Support', href: '/#services' },
      { label: 'Heliport Infrastructure Development', href: '/#services' },
      { label: 'Aviation Consulting Solutions', href: '/#services' },
    ],
  },
  {
    title: 'Global Presence',
    links: [
      { label: 'India', href: '/#presence-india' },
      { label: 'Dubai', href: '/#presence-dubai' },
      { label: 'New York', href: '/#presence-newyork' },
    ],
  },
  {
    title: 'Contact',
    links: [
      { label: 'info@teluguairlines.com', href: 'mailto:info@teluguairlines.com' },
      { label: '+91 98765 43210', href: 'tel:+919876543210' },
    ],
  },
]

export const SOCIAL_LINKS: Array<{ label: string; href: string }> = [
  { label: 'Instagram', href: 'https://instagram.com/teluguairlines' },
  { label: 'LinkedIn', href: 'https://linkedin.com/company/teluguairlines' },
  { label: 'Twitter', href: 'https://twitter.com/teluguairlines' },
  { label: 'YouTube', href: 'https://youtube.com/@teluguairlines' },
]
