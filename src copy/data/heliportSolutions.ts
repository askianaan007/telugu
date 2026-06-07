export type HeliportCardVariant = 'bg1' | 'bg2' | 'bg3'

export interface HeliportSolution {
  index: number
  title: string
  description: string
  variant: HeliportCardVariant
  iconSrc: string
  /** Staggered desktop grid: column 1–3 (Figma layout). */
  column: 1 | 2 | 3
  /** Vertical slot within the column (1 = top). */
  row: 1 | 2 | 3
}

export const HELIPORT_SOLUTIONS: HeliportSolution[] = [
  {
    index: 1,
    title: 'Regulatory Expertise',
    description:
      'Our team ensures that all heliport projects comply with the Directorate General of Civil Aviation (DGCA) regulations as well as international aviation standards, guaranteeing safety and operational efficiency.',
    variant: 'bg1',
    iconSrc: '/images/heliport-solutions-regulatory-expertise.svg',
    column: 1,
    row: 1,
  },
  {
    index: 2,
    title: 'Urban Heliport Development',
    description:
      'We focus on creating heliports in urban areas, enhancing connectivity and accessibility in bustling cities and industrial hubs, thereby facilitating efficient transportation.',
    variant: 'bg2',
    iconSrc: '/images/heliport-solutions-customizable-design-options.svg',
    column: 3,
    row: 1,
  },
  {
    index: 3,

    title: 'Customizable Design Options',
    description:
      'Our heliport designs are tailored to meet the specific needs of clients, taking into account factors such as location, traffic volume, and operational requirements.',
    variant: 'bg1',
    iconSrc: '/images/heliport-solutions-urban-heliport-development.svg',
    column: 2,
    row: 1,
  },
  {
    index: 4,
    title: 'Remote Heliport Initiatives',
    description:
      'Telugu Airlines is committed to developing heliport infrastructure in remote regions, bridging the gap between isolated areas and major urban centers, thus promoting regional development.',
    variant: 'bg3',
    iconSrc: '/images/heliport-solutions-remote-heliport-initiatives.svg',
    column: 1,
    row: 2,
  },
  {
    index: 5,
    title: 'Strategic Partnerships',
    description:
      'Telugu Airlines collaborates with various stakeholders, including government agencies and private entities, to ensure the successful implementation and operation of heliport projects across India.',
    variant: 'bg1',
    iconSrc: '/images/heliport-solutions-strategic-partnerships.svg',
    column: 3,
    row: 2,
  },
  {
    index: 6,
    title: 'Maintenance Services',
    description:
      'We offer ongoing maintenance and operational support to ensure the long-term reliability and functionality of heliport facilities, backed by our team of experienced professionals.',
    variant: 'bg1',
    iconSrc: '/images/heliport-solutions-maintenance-services.svg',
    column: 2,
    row: 2,
  },
  {
    index: 7,
    title: 'Environmental Considerations',
    description:
      'Our projects incorporate sustainable practices, minimizing environmental impact while maximizing operational efficiency and community benefits.',
    variant: 'bg2',
    iconSrc: '/images/heliport-solutions-environmental-considerations.svg',
    column: 3,
    row: 3,
  },
  {
    index: 8,
    title: 'Safety and Risk Management',
    description:
      'We prioritize safety in all aspects of heliport design and operation, implementing rigorous risk management protocols to mitigate potential hazards.',
    variant: 'bg1',
    iconSrc: '/images/heliport-solutions-safety-and-risk-management.svg',
    column: 1,
    row: 3,
  },
  {
    index: 9,
    title: 'Advanced Technology Integration',
    description:
      'We leverage cutting-edge technology in our heliport designs, including advanced navigation systems and communication tools, to enhance operational capabilities.',
    variant: 'bg3',
    iconSrc: '/images/heliport-solutions-advanced-technology-integration.svg',
    column: 2,
    row: 3,
  },
]

export function heliportSolutionsByColumn(column: 1 | 2 | 3) {
  return HELIPORT_SOLUTIONS.filter((s) => s.column === column).sort((a, b) => a.row - b.row)
}

/** md 2-column layout: left = odd indices, right = even (staggered pair). */
export function heliportSolutionsByMdColumn(column: 1 | 2) {
  return HELIPORT_SOLUTIONS.filter((s) =>
    column === 1 ? s.index % 2 === 1 : s.index % 2 === 0
  ).sort((a, b) => a.index - b.index)
}
