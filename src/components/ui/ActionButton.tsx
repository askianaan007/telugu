'use client'

import { ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { useId, useMemo } from 'react'
import { cn } from '@/lib/utils'
import type { ButtonHTMLAttributes, ReactNode, CSSProperties } from 'react'

type ActionButtonProps = {
  href?: string
  onClick?: () => void
  type?: 'button' | 'submit'
  form?: string
  label?: string
  icon?: ReactNode
  tone?: 'primary' | 'dark'
  variant?: 'default' | 'inverted' | 'request'
  fullWidth?: boolean
  noShadow?: boolean
  className?: string
} & Pick<ButtonHTMLAttributes<HTMLButtonElement>, 'disabled'>

const fullWidthClassName =
  'relative w-full justify-end [&>span:first-of-type]:pointer-events-none [&>span:first-of-type]:absolute [&>span:first-of-type]:left-1/2 [&>span:first-of-type]:top-1/2 [&>span:first-of-type]:-translate-x-1/2 [&>span:first-of-type]:-translate-y-1/2'

const baseClassName =
  'group inline-flex cursor-pointer items-center gap-3 rounded-full py-2 pr-2 pl-6 transition-transform duration-300 hover:-translate-y-0.5 disabled:cursor-not-allowed'

const GOLD_FILL_GRADIENT = 'linear-gradient(90deg, #ca8b37 0%, #f9e67e 50%, #ca8b37 100%)'
const GOLD_BORDER = 'linear-gradient(to right, #FFFFD5, #CE9840)'
const BASE_SHADOW = `
  0.44px 0.44px 0.63px -0.75px rgba(0, 0, 0, 0.26),
  5.9px 5.9px 8.35px -3px rgba(0, 0, 0, 0.192),
  14px 14px 21.21px -3.75px rgba(0, 0, 0, 0.20)
`

const STYLE_CACHE = new Map<string, CSSProperties>()

function gradientBorderStyle(
  fillColor: string,
  options?: { fillIsGradient?: boolean; noShadow?: boolean }
): CSSProperties {
  const key = `${fillColor}|${options?.fillIsGradient}|${options?.noShadow}`
  if (STYLE_CACHE.has(key)) return STYLE_CACHE.get(key)!

  const fillLayer = options?.fillIsGradient
    ? fillColor
    : `linear-gradient(${fillColor}, ${fillColor})`

  const style: CSSProperties = {
    border: '1px solid transparent',
    backgroundImage: `${fillLayer}, ${GOLD_BORDER}`,
    backgroundOrigin: 'padding-box, border-box',
    backgroundClip: 'padding-box, border-box',
    ...(options?.noShadow ? {} : { boxShadow: BASE_SHADOW }),
  }

  STYLE_CACHE.set(key, style)
  return style
}

function resolveFillColor(
  tone: 'primary' | 'dark',
  variant: 'default' | 'inverted' | 'request'
): string {
  if (variant === 'inverted') return GOLD_FILL_GRADIENT
  if (tone === 'primary') return '#14202F'
  return '#0A0A0A'
}

function RequestGradientArrow({ className }: { className?: string }) {
  const gradientId = useId().replace(/:/g, '')

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
      className={cn(
        'h-5 w-5 shrink-0 transition-transform duration-300 group-hover:translate-x-0.5',
        className
      )}
    >
      <defs>
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ca8b37" />
          <stop offset="50%" stopColor="#f9e67e" />
          <stop offset="100%" stopColor="#ca8b37" />
        </linearGradient>
      </defs>
      <path
        d="M5 12h14M12 5l7 7-7 7"
        stroke={`url(#${gradientId})`}
        strokeWidth="2.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function ActionButtonContent({
  label,
  icon,
  variant,
}: Pick<ActionButtonProps, 'label' | 'icon' | 'variant'>) {
  const isInverted = variant === 'inverted'
  const isRequest = variant === 'request'

  return (
    <>
      <span
        className={cn(
          'font-mono text-[14px] leading-none font-medium tracking-wide uppercase',
          isRequest && 'text-brand-white',
          isInverted && 'text-brand-navy',
          !isRequest && !isInverted && 'text-brand-white'
        )}
      >
        {label ?? 'Book Now'}
      </span>
      {isRequest ? (
        (icon ?? <RequestGradientArrow />)
      ) : (
        <span
          className={cn(
            'flex h-8 w-8 shrink-0 items-center justify-center rounded-full',
            isInverted
              ? 'bg-brand-navy'
              : 'bg-gradient-to-r from-[#ca8b37] via-[#f9e67e] to-[#ca8b37]'
          )}
        >
          {icon ?? (
            <ArrowRight
              className={cn(
                'h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5',
                isInverted ? 'text-brand-white' : 'text-brand-button'
              )}
              aria-hidden
              strokeWidth={2.25}
            />
          )}
        </span>
      )}
    </>
  )
}

export function ActionButton({
  href,
  onClick,
  type = 'button',
  form,
  label = 'Book Now',
  icon,
  tone = 'primary',
  variant = 'default',
  fullWidth = false,
  noShadow = false,
  className,
  disabled,
}: ActionButtonProps) {
  const isRequest = variant === 'request'
  const isInverted = variant === 'inverted'
  const fillColor = resolveFillColor(tone, variant)

  const style = useMemo(
    () => isRequest ? undefined : gradientBorderStyle(fillColor, { fillIsGradient: isInverted, noShadow }),
    [isRequest, fillColor, isInverted, noShadow]
  )

  const pillClassName = cn(
    baseClassName,
    isRequest && 'rounded-none bg-transparent py-0 pl-0 pr-0 shadow-none hover:-translate-y-0',
    fullWidth && fullWidthClassName,
    className
  )

  if (href) {
    return (
      <Link href={href} className={pillClassName} style={style}>
        <ActionButtonContent label={label} icon={icon} variant={variant} />
      </Link>
    )
  }

  return (
    <button
      type={type}
      form={form}
      onClick={onClick}
      disabled={disabled}
      className={pillClassName}
      style={style}
    >
      <ActionButtonContent label={label} icon={icon} variant={variant} />
    </button>
  )
}

export { ActionButton as HeroBookButton }