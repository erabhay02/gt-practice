import type { ButtonHTMLAttributes } from 'react'

type Variant = 'primary' | 'sun' | 'white'

const VARIANTS: Record<Variant, string> = {
  primary: 'bg-sprout-500 text-white shadow-[0_5px_0_var(--color-sprout-700)]',
  sun: 'bg-sun-400 text-ink shadow-[0_5px_0_var(--color-sun-600)]',
  white: 'bg-white text-ink border-2 border-sprout-200 shadow-[0_5px_0_var(--color-sprout-200)]',
}

/** Chunky, pressable button for kid screens (moves down when pressed). */
export function KidButton({
  variant = 'primary',
  className = '',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return (
    <button
      {...props}
      className={`rounded-2xl px-6 py-3.5 font-display text-lg font-semibold transition-transform active:translate-y-1 active:shadow-none disabled:opacity-40 ${VARIANTS[variant]} ${className}`}
    />
  )
}

export const kidLinkClass = (variant: Variant = 'primary') =>
  `inline-flex items-center justify-center rounded-2xl px-6 py-3.5 font-display text-lg font-semibold transition-transform active:translate-y-1 active:shadow-none ${VARIANTS[variant]}`
