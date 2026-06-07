export interface FaqItem {
  id: string
  question: string
  answer: string
}

export const FAQ_ITEMS: FaqItem[] = [
  {
    id: 'services',
    question: 'What services does Telugu Airlines offer?',
    answer:
      'Telugu Airlines provides premium helicopter charter services for private travel, corporate transfers, pilgrimage journeys, aerial experiences, and regional connectivity. We also support heliport infrastructure development and aviation-related mobility solutions across India.',
  },
  {
    id: 'helicopter-charter',
    question: 'Can I book a private helicopter charter?',
    answer:
      'Yes, Telugu Airlines offers private helicopter charter services for individuals, families, business executives, VIP guests, and organizations. Each journey is planned based on your route, schedule, passenger count, and travel requirements.',
  },
  {
    id: 'operations',
    question: 'Where does Telugu Airlines operate?',
    answer:
      'Telugu Airlines is focused on providing aviation services across India, with an emphasis on regional connectivity, city-to-city transfers, tourist routes, pilgrimage destinations, and strategic heliport locations.',
  },
  {
    id: 'booking-request',
    question: 'How do I request a flight booking?',
    answer:
      'You can submit a flight request through the website by sharing your departure location, destination, preferred date, passenger count, and contact details. Our team will review the request and get in touch with availability, route planning, and pricing details.',
  },
  {
    id: 'helicopter-advance',
    question: 'How far in advance should I book a helicopter charter?',
    answer:
      'We recommend booking as early as possible to ensure aircraft availability, route permissions, landing approvals, and smooth coordination. For urgent travel, you may still submit a request and our team will assist based on availability.',
  },
  {
    id: 'helicopter-capacity',
    question: 'How many passengers can travel in one helicopter?',
    answer:
      'Passenger capacity depends on the aircraft selected. For example, aircraft like the Robinson R44 typically accommodate up to 3 passengers plus pilot, while larger helicopters such as Airbus H125 or Bell 407 may accommodate more passengers depending on configuration and operating conditions.',
  },
  {
    id: 'corporate-travel',
    question: 'Is Telugu Airlines suitable for corporate travel?',
    answer:
      'Yes. Our helicopter charter services are ideal for corporate travel, executive movement, site visits, investor visits, business meetings, and time-sensitive transfers where speed, privacy, and convenience are important.',
  },
]
