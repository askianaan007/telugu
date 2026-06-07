'use client'

import { useSyncExternalStore } from 'react'
import { CommitmentDesktop } from './commitment/CommitmentDesktop'
import { CommitmentTablet }  from './commitment/CommitmentTablet'
import { CommitmentMobile }  from './commitment/CommitmentMobile'

type CommitTier = 'mobile' | 'tablet' | 'desktop'

function getCommitTier(): CommitTier {
    if (window.matchMedia('(min-width: 1024px)').matches) return 'desktop'
    if (window.matchMedia('(min-width: 768px)').matches)  return 'tablet'
    return 'mobile'
}

const commitTierMqs =
    typeof window !== 'undefined'
        ? [window.matchMedia('(min-width: 768px)'), window.matchMedia('(min-width: 1024px)')]
        : []

const subscribeCommitTier = (cb: () => void) => {
    commitTierMqs.forEach((mq) => mq.addEventListener('change', cb))
    return () => commitTierMqs.forEach((mq) => mq.removeEventListener('change', cb))
}

const commitTierSnapshot       = (): CommitTier => typeof window !== 'undefined' ? getCommitTier() : 'desktop'
const commitTierServerSnapshot = (): CommitTier => 'desktop'

export function CommitmentSection() {
    const tier = useSyncExternalStore(subscribeCommitTier, commitTierSnapshot, commitTierServerSnapshot)
    if (tier === 'desktop') return <CommitmentDesktop />
    if (tier === 'tablet')  return <CommitmentTablet  />
    return                         <CommitmentMobile  />
}