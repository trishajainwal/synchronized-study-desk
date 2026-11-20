import type { ButtonHTMLAttributes } from 'react'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger'
type Size = 'sm' | 'md'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
}

const variants: Record<Variant, string> = {
  primary: 'bg-sage-500 text-charcoal-950 hover:bg-sage-400 disabled:hover:bg-sage-500',
  secondary:
    'border border-charcoal-700 bg-charcoal-850 text-parchment-100 hover:border-sage-600 hover:bg-charcoal-800',
  ghost: 'text-parchment-300 hover:bg-charcoal-800 hover:text-parchment-100',
  danger: 'border border-red-900/70 text-red-300 hover:bg-red-950/40',
}

const sizes: Record<Size, string> = {
  sm: 'h-8 px-3 text-xs',
  md: 'h-10 px-4 text-sm',
}

export function Button({
  variant = 'secondary',
  size = 'md',
  className = '',
  type = 'button',
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={`focus-ring inline-flex items-center justify-center gap-2 rounded-md font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    />
  )
}
