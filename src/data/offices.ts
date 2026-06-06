// src/data/offices.ts
// ───────────────────
// Office locations data for GlobalPresenceSection.

export type OfficeLocation = {
    id: string
    cardHeading: string
    cardSubtitle?: string
    description: string
    flagSvg: string
}

export const OFFICE_LOCATIONS: OfficeLocation[] = [
    {
        id: 'india',
        cardHeading: 'India',
        cardSubtitle: 'Headquarters',
        description:
            'Our home base in India serves as the operational hub for all domestic helicopter charter services and heliport infrastructure development across the subcontinent.',
        flagSvg: '/images/in_flag.png',
    },
    {
        id: 'uae',
        cardHeading: 'United Arab Emirates',
        cardSubtitle: 'Middle East Office',
        description:
            'Our UAE office bridges premium aviation services across the Gulf region, connecting clients to world-class charter solutions in one of the world\'s busiest aviation markets.',
        flagSvg: '/images/ua_flag.png',
    },
    {
        id: 'usa',
        cardHeading: 'United States',
        cardSubtitle: 'North America Office',
        description:
            'Strategically positioned in the USA, our North American office expands our global reach and facilitates partnerships with leading aviation organizations worldwide.',
        flagSvg: '/images/us_flag.png',
    },
]