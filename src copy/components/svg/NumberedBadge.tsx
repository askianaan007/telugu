import type { SVGProps } from 'react'

interface NumberedBadgeProps extends Omit<SVGProps<SVGSVGElement>, 'children'> {
  index: number
}

export function NumberedBadge({ index, ...props }: NumberedBadgeProps) {
  const display = String(index).padStart(2, '0')
  return (
    <svg
      viewBox="0 0 96 96"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      {...props}
    >
      <defs>
        <linearGradient id={`numbered-badge-grad-${index}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#CA8B37" />
          <stop offset="55%" stopColor="#F9E67E" />
          <stop offset="100%" stopColor="#CA8B37" />
        </linearGradient>
      </defs>
      <circle
        cx="48"
        cy="48"
        r="46"
        stroke={`url(#numbered-badge-grad-${index})`}
        strokeWidth="1"
      />
      <circle cx="48" cy="48" r="36" fill="rgba(202, 139, 55, 0.08)" />
      <text
        x="50%"
        y="55%"
        textAnchor="middle"
        fontFamily="var(--font-satoshi, sans-serif)"
        fontWeight="700"
        fontSize="28"
        fill={`url(#numbered-badge-grad-${index})`}
      >
        {display}
      </text>
    </svg>
  )
}
