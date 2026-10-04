import type { ReactNode } from 'react'

export type MascotMood = 'happy' | 'cheer' | 'think' | 'oops'

const INK = '#1f2a37'

function Eyes({ mood }: { mood: MascotMood }) {
  if (mood === 'cheer') {
    // Happy closed eyes: ^ ^
    return (
      <g stroke={INK} strokeWidth={3.5} strokeLinecap="round" fill="none">
        <path d="M44 61 Q49 55 54 61" />
        <path d="M66 61 Q71 55 76 61" />
      </g>
    )
  }
  const lookUp = mood === 'think' ? -3 : 0
  return (
    <g>
      <circle cx={49} cy={60 + lookUp} r={5} fill={INK} />
      <circle cx={71} cy={60 + lookUp} r={5} fill={INK} />
      <circle cx={50.6} cy={58.2 + lookUp} r={1.7} fill="white" />
      <circle cx={72.6} cy={58.2 + lookUp} r={1.7} fill="white" />
    </g>
  )
}

function Mouth({ mood }: { mood: MascotMood }) {
  switch (mood) {
    case 'cheer':
      return (
        <g>
          <path d="M50 69 Q60 84 70 69 Z" fill={INK} />
          <path d="M55 76 Q60 80 65 76 Q60 73 55 76 Z" fill="#ff8fab" />
        </g>
      )
    case 'think':
      return <circle cx={63} cy={73} r={3} fill="none" stroke={INK} strokeWidth={3} />
    case 'oops':
      return <path d="M52 75 Q56 71 60 75 Q64 79 68 75" fill="none" stroke={INK} strokeWidth={3} strokeLinecap="round" />
    default:
      return <path d="M51 70 Q60 79 69 70" fill="none" stroke={INK} strokeWidth={3.5} strokeLinecap="round" />
  }
}

/** Sprout, the ThinkSprout mascot. */
export function Mascot({ mood = 'happy', size = 96, float = false }: { mood?: MascotMood; size?: number; float?: boolean }) {
  return (
    <svg
      viewBox="0 0 120 120"
      width={size}
      height={size}
      role="img"
      aria-label="Sprout the mascot"
      className={float ? 'animate-float' : undefined}
    >
      {mood === 'cheer' && (
        <g fill="var(--color-sun-400)">
          <path d="M14 30 l3 7 7 3 -7 3 -3 7 -3 -7 -7 -3 7 -3z" />
          <path d="M104 26 l2.4 5.6 5.6 2.4 -5.6 2.4 -2.4 5.6 -2.4 -5.6 -5.6 -2.4 5.6 -2.4z" />
          <path d="M100 70 l2 4.5 4.5 2 -4.5 2 -2 4.5 -2 -4.5 -4.5 -2 4.5 -2z" />
        </g>
      )}
      {/* pot */}
      <path d="M34 92 H86 L80 116 H40 Z" fill="#e07a5f" />
      <rect x={30} y={86} width={60} height={10} rx={4} fill="#c96a50" />
      {/* stem + leaves */}
      <path d="M60 38 V24" stroke="var(--color-sprout-600)" strokeWidth={4} strokeLinecap="round" />
      <ellipse cx={48} cy={20} rx={13} ry={7} transform="rotate(-25 48 20)" fill="var(--color-sprout-500)" />
      <ellipse cx={72} cy={20} rx={13} ry={7} transform="rotate(25 72 20)" fill="var(--color-sprout-400)" />
      {/* arms (raised when cheering) */}
      {mood === 'cheer' ? (
        <g fill="var(--color-sprout-500)">
          <ellipse cx={26} cy={46} rx={10} ry={5} transform="rotate(-50 26 46)" />
          <ellipse cx={94} cy={46} rx={10} ry={5} transform="rotate(50 94 46)" />
        </g>
      ) : (
        <g fill="var(--color-sprout-500)">
          <ellipse cx={29} cy={72} rx={9} ry={5} transform="rotate(30 29 72)" />
          <ellipse cx={91} cy={72} rx={9} ry={5} transform="rotate(-30 91 72)" />
        </g>
      )}
      {/* body */}
      <ellipse cx={60} cy={64} rx={31} ry={29} fill="var(--color-sprout-300)" stroke="var(--color-sprout-600)" strokeWidth={3} />
      <circle cx={41} cy={71} r={4.5} fill="#ffb3c7" opacity={0.75} />
      <circle cx={79} cy={71} r={4.5} fill="#ffb3c7" opacity={0.75} />
      <Eyes mood={mood} />
      <Mouth mood={mood} />
    </svg>
  )
}

/** Mascot with a speech bubble. */
export function MascotSays({ mood = 'happy', children, size = 72 }: { mood?: MascotMood; children: ReactNode; size?: number }) {
  return (
    <div className="flex items-end gap-2">
      <div className="shrink-0">
        <Mascot mood={mood} size={size} float />
      </div>
      <div className="relative mb-4 rounded-2xl rounded-bl-sm bg-white px-4 py-2.5 font-display text-lg leading-snug text-ink shadow-sm">
        {children}
      </div>
    </div>
  )
}
