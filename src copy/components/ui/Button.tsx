import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { forwardRef, type ButtonHTMLAttributes } from 'react'

import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'group inline-flex items-center justify-center gap-2 rounded-full font-medium leading-none whitespace-nowrap transition-all duration-300 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-brand-pink disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        gold: 'bg-gold text-brand-black shadow-gold hover:shadow-[0_28px_70px_-18px_rgba(202,139,55,0.6)] hover:-translate-y-0.5',
        rose: 'bg-rose text-brand-white shadow-glow hover:-translate-y-0.5',
        dark: 'bg-brand-black text-brand-white hover:bg-brand-navy',
        outline:
          'border border-brand-black/20 bg-transparent text-brand-black hover:border-brand-black hover:bg-brand-black hover:text-brand-white',
        ghost: 'bg-transparent text-brand-black hover:bg-brand-black/5',
        glass:
          'border border-white/15 bg-white/5 text-brand-white backdrop-blur-xl hover:bg-white/10',
      },
      size: {
        sm: 'h-9 px-4 text-sm',
        md: 'h-11 px-6 text-sm',
        lg: 'h-12 px-7 text-base',
        xl: 'h-14 px-9 text-base',
      },
    },
    defaultVariants: {
      variant: 'gold',
      size: 'md',
    },
  }
)

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { className, variant, size, asChild = false, ...props },
  ref
) {
  const Comp = asChild ? Slot : 'button'
  return <Comp ref={ref} className={cn(buttonVariants({ variant, size }), className)} {...props} />
})

export { buttonVariants }
