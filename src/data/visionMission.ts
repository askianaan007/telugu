/** Global vision scroll bands for which paragraph is active (P1 / P2 / P3). */
export const VISION_PARAGRAPH_BANDS = {
  starts: [0.05, 0.38, 0.62] as const,
  ends: [0.36, 0.6, 1.0] as const, // P3 now ends exactly at 1.0
} as const

export function getActiveParagraphIndex(visionProgress: number): number {
  if (visionProgress >= 0.62) return 2
  if (visionProgress >= 0.4) return 1
  return 0
}

/** 0–1 read progress inside the paragraph's scroll band. */
export function getVisionParagraphLocalProgress(
  visionProgress: number,
  paragraphIndex: number
): number {
  const start = VISION_PARAGRAPH_BANDS.starts[paragraphIndex] ?? 0
  const end = VISION_PARAGRAPH_BANDS.ends[paragraphIndex] ?? 1
  if (visionProgress <= start) return 0
  if (visionProgress >= end) return 1
  return (visionProgress - start) / (end - start)
}

/** End of the scroll band for a vision paragraph (0–1). */
export function getVisionParagraphBandEnd(paragraphIndex: number): number {
  return VISION_PARAGRAPH_BANDS.ends[paragraphIndex] ?? 1
}

const MISSION_BULLET_COUNT = 10


/** Which mission bullet is active from overall mission scroll progress (0–1). */
export function getActiveBulletIndex(missionProgress: number): number {
  if (missionProgress >= 1) return MISSION_BULLET_COUNT
  const index = Math.floor(missionProgress * MISSION_BULLET_COUNT)
  return Math.min(MISSION_BULLET_COUNT - 1, Math.max(0, index))
}

/** 0–1 read progress inside the bullet's equal scroll band. */
export function getMissionBulletLocalProgress(
  missionProgress: number,
  bulletIndex: number
): number {
  const bandSize = 1 / MISSION_BULLET_COUNT
  const start = bulletIndex * bandSize
  const end = (bulletIndex + 1) * bandSize
  if (missionProgress <= start) return 0
  if (missionProgress >= end) return 1
  return (missionProgress - start) / bandSize
}

/** End of the scroll band for a mission bullet (0–1). */
export function getMissionBulletBandEnd(bulletIndex: number): number {
  return (bulletIndex + 1) / MISSION_BULLET_COUNT
}

export type VisionParagraph = {
  id: string
  text: string
}

export const VISION_HEADING = 'Our Vision'

export const VISION_PARAGRAPHS: VisionParagraph[] = [
  {
    id: 'vision-p1',
    text: 'Our vision is to establish ourselves as a premier provider of aviation solutions, dedicated to fostering connections among individuals, industries, and opportunities. By leveraging advanced technologies and innovative practices, we aim to enhance the way people and goods move through the skies. Our commitment to safety and efficiency ensures that every flight experience is not only reliable but also tailored to meet the diverse needs of our clients.',
  },
  {
    id: 'vision-p2',
    text: 'In pursuit of this goal, we focus on developing air mobility services that are both cutting-edge and sustainable. By integrating state-of-the-art aircraft and operational methodologies, we strive to create a seamless travel experience that minimizes environmental impact while maximizing convenience. Our approach encompasses a wide range of services, from passenger transport to cargo logistics, all designed to facilitate the growth of industries and the connectivity of communities.',
  },
  {
    id: 'vision-p3',
    text: 'Ultimately, our mission is to redefine the landscape of air travel by providing innovative solutions that empower individuals and businesses alike. We believe that by prioritizing safety, efficiency, and innovation, we can unlock new opportunities for collaboration and growth in the aviation sector. As we continue to evolve and adapt to the changing demands of the market, we remain steadfast in our commitment to delivering exceptional air mobility services that connect people and industries across the globe.',
  },
]

export const MISSION_HEADING = 'Our Mission'

export const MISSION_BULLETS: readonly string[] = [
  'Provide exceptional helicopter charter services that prioritize safety above all else, ensuring a reliable and secure experience for all clients.',
  'Invest in cutting-edge heliport infrastructure to enhance and support the burgeoning aviation landscape in India, facilitating seamless operations and connectivity.',
  'Pursue international expansion while upholding the highest standards of service quality and operational effectiveness, ensuring consistency across all markets.',
  'Implement rigorous training programs for pilots and crew members to maintain superior safety protocols and operational excellence in every flight.',
  'Foster partnerships with local and international aviation stakeholders to create a robust network that enhances service offerings and operational capabilities.',
  'Leverage innovative technology to streamline booking processes and improve customer experience, making helicopter travel more accessible and efficient.',
  'Conduct regular assessments of safety measures and operational procedures to adapt to evolving industry standards and regulations, ensuring compliance and reliability.',
  'Promote environmental sustainability by integrating eco-friendly practices into operations, such as utilizing fuel-efficient helicopters and minimizing noise pollution.',
  'Enhance customer engagement through personalized services and tailored flight experiences, ensuring that each journey meets the unique needs of clients.',
  'Establish a dedicated customer support team available around the clock to address inquiries and provide assistance, reinforcing a commitment to exceptional service.',
] as const

export const VISION_MISSION_IMAGES = {
  vision: {
    src: '/images/our-vision.png',
    alt: 'Telugu Airlines vision — premium helicopter charter',
  },
  mission: {
    src: '/images/our-mission.png',
    alt: 'Helicopter flying between modern skyscrapers viewed from below',
  },
  bullet: {
    src: '/images/gradient-gold-circle.png',
    alt: '',
  },
} as const
