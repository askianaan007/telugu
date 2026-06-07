export interface CharterServiceCard {
  id: string
  title: string
  summary: string
  image: string
}

export const CHARTER_SERVICES: CharterServiceCard[] = [
  {
    id: 'corporate',
    title: 'Corporate Travel Streamlined transportation',
    summary:
      'solutions for executives, significantly minimizing travel time and enhancing overall productivity.',
    image: '/images/services-corporate-travel.png',
  },
  {
    id: 'events',
    title: 'Event Transportation Customized helicopter',
    summary:
      'charters for special events, ensuring timely arrivals for weddings, corporate gatherings, and other significant occasions.',
    image: '/images/services-event-transportation.png',
  },
  {
    id: 'vip',
    title: 'VIP & Luxury Charters Exclusive helicopter services',
    summary:
      'catering to high-net-worth individuals, celebrities, and dignitaries, ensuring a luxurious and private travel experience.',
    image: '/images/services-vip-and-luxury-charters.png',
  },
  {
    id: 'search-rescue',
    title: 'Search and Rescue Operations Rapid deployment',
    summary:
      'for search and rescue missions, providing critical support in emergency situations and natural disasters.',
    image: '/images/services-search-and-rescue-operations.png',
  },
  {
    id: 'pilgrimage',
    title: 'Pilgrimage & Tourism Flights Effortless access to',
    summary:
      'remote and popular destinations throughout India, facilitating spiritual journeys and tourism adventures.',
    image: '/images/services-pilgrimage-and-tourism-flights.png',
  },
  {
    id: 'scenic',
    title: 'Scenic Tours Breathtaking aerial tours showcasing',
    summary:
      "stunning landscapes and landmarks, offering a unique perspective of the region's beauty.",
    image: '/images/services-scenic-tours.png',
  },
  {
    id: 'medevac',
    title: 'Medical Evacuation (Air Ambulance) Swift and',
    summary:
      'efficient air transport for medical emergencies, equipped with advanced medical facilities and professional healthcare personnel onboard.',
    image: '/images/services-medical-evacuation-air-ambulance.png',
  },
  {
    id: 'cargo',
    title: 'Cargo Transport Efficient transportation of goods',
    summary:
      'and equipment to hard-to-reach locations, ensuring timely delivery for various industries.',
    image: '/images/services-cargo-transport.png',
  },
  {
    id: 'aerial',
    title: 'Aerial Surveys & Utility Services Comprehensive',
    summary:
      'support for infrastructure development, including powerline inspections, aerial mapping, and other utility-related services.',
    image: '/images/services-aerial-surveys-and-utility-services.png',
  },
  {
    id: 'training',
    title: 'Training and Pilot Services Professional training',
    summary:
      'programs for aspiring pilots, along with charter services that include experienced pilots for various missions.',
    image: '/images/services-training-and-pilot-services.png',
  },
]
