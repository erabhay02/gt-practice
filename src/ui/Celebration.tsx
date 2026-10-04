import { useMemo } from 'react'

const COLORS = ['#ffc93c', '#4cc06a', '#4cc9f0', '#f15bb5', '#ff8f5a', '#a78bfa']

/** One-shot confetti burst; purely decorative. */
export function Confetti({ pieces = 60 }: { pieces?: number }) {
  const bits = useMemo(
    () =>
      Array.from({ length: pieces }, (_, i) => ({
        left: Math.random() * 100,
        delay: Math.random() * 0.8,
        duration: 2.2 + Math.random() * 1.6,
        color: COLORS[i % COLORS.length],
        size: 6 + Math.random() * 7,
        round: Math.random() < 0.4,
      })),
    [pieces],
  )
  return (
    <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden" aria-hidden="true">
      {bits.map((b, i) => (
        <span
          key={i}
          className="absolute top-0"
          style={{
            left: `${b.left}%`,
            width: b.size,
            height: b.round ? b.size : b.size * 0.45,
            background: b.color,
            borderRadius: b.round ? '9999px' : '2px',
            animation: `confetti-fall ${b.duration}s ${b.delay}s ease-in forwards`,
          }}
        />
      ))}
    </div>
  )
}
