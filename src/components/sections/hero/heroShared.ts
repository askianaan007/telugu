export const HERO_PRIMARY_WORDS_LINE1 = ['Elevating', 'Aviation'] as const
export const HERO_PRIMARY_WORDS_LINE2 = ['Excellence'] as const
export const HERO_MAIN_COLUMN_LAYOUT  = 'mx-auto w-full px-3 sm:px-5 md:px-6'
export const HERO_WORD_MASK_CLASS     = 'relative -m-[0.15em] inline-block overflow-hidden p-[0.15em] align-top'

export const EASE_SMOOTH = [0.22, 1, 0.36, 1] as const

export const mobileFadeIn = {
    hidden:  { opacity: 0, y: 14 },
    visible: { opacity: 1, y: 0  },
} as const

export const mobileFadeInNoY = {
    hidden:  { opacity: 0 },
    visible: { opacity: 1 },
} as const

export const mTrans = (delay: number) =>
    ({ duration: 0.52, ease: EASE_SMOOTH, delay }) as const

export const mTransNoY = (delay: number) =>
    ({ duration: 0.6, ease: EASE_SMOOTH, delay }) as const

export const cardBorderStyle = {
    borderColor: 'transparent',
    backgroundImage:
        'linear-gradient(#f0f1f2, #f0f1f2), linear-gradient(180deg, #ffffff 0%, #f0f1f2 100%)',
    backgroundOrigin: 'padding-box, border-box',
    backgroundClip:  'padding-box, border-box',
} as const

export const mobileSkyGradient =
    'linear-gradient(168deg, #3d7eb5 0%, #4d8ec4 18%, #5B9FD4 38%, #74b2df 58%, #a4cfee 78%, #d8edf8 100%)'

export const mobileBottomFade =
    'linear-gradient(to top, #f0f1f2 0%, #f0f1f2 10%, rgba(240,241,242,0.97) 24%, rgba(240,241,242,0.85) 44%, rgba(240,241,242,0.45) 68%, transparent 100%)'

export const desktopBottomFade =
    'linear-gradient(to top, #f0f1f2 0%, #f0f1f2 18%, rgba(240,241,242,0.95) 40%, rgba(240,241,242,0.6) 65%, transparent 100%)'