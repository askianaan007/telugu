import {
  Award,
  BadgeCheck,
  CalendarClock,
  Headset,
  Leaf,
  Plane,
  ShieldCheck,
  Sparkles,
  Tag,
  Users,
} from 'lucide-react'

import type { LucideIcon } from 'lucide-react'

export interface ReasonFeature {
  title: string
  description: string
  icon: LucideIcon
}

export const WHY_CHOOSE_REASONS: ReasonFeature[] = [
  {
    title: 'Unwavering Safety',
    description:
      'We prioritize safety above all else, ensuring strict compliance with international aviation safety regulations and standards to guarantee a secure flying experience for all passengers.',
    icon: ShieldCheck,
  },
  {
    title: 'State-of-the-Art Fleet',
    description:
      'Our fleet consists of modern, well-maintained helicopters equipped with the latest technology, providing reliability and comfort during every flight.',
    icon: Plane,
  },
  {
    title: 'Highly Qualified Personnel',
    description:
      'Our team comprises experienced pilots, engineers, and aviation specialists who bring a wealth of knowledge and expertise to every aspect of our operations.',
    icon: Users,
  },
  {
    title: 'Personalized Services',
    description:
      'We offer customized solutions tailored to the unique requirements of our clients, ensuring that each service meets their specific needs and preferences.',
    icon: Sparkles,
  },
  {
    title: 'Comprehensive Expertise',
    description:
      'Our capabilities extend beyond charter operations, encompassing all facets of aviation, including infrastructure development and maintenance services.',
    icon: BadgeCheck,
  },
  {
    title: 'Exceptional Customer Support',
    description:
      'We pride ourselves on delivering outstanding customer service, with a dedicated support team available to assist clients at every stage of their journey.',
    icon: Headset,
  },
  {
    title: 'Flexible Scheduling',
    description:
      'We understand the importance of time, which is why we offer flexible scheduling options to accommodate the varying needs of our clients.',
    icon: CalendarClock,
  },
  {
    title: 'Environmental Responsibility',
    description:
      'We are committed to sustainable practices, actively working to minimize our environmental impact through eco-friendly initiatives and efficient operations.',
    icon: Leaf,
  },
  {
    title: 'Competitive Pricing',
    description:
      'Our services are competitively priced, providing clients with exceptional value without compromising on quality or safety.',
    icon: Tag,
  },
  {
    title: 'Proven Track Record',
    description:
      'With a history of successful operations and satisfied clients, Telugu Airlines has established itself as a trusted name in the aviation industry, known for reliability and excellence.',
    icon: Award,
  },
]
