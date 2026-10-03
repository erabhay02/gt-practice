import type { ReactNode } from 'react'
import type { ShapeSpec, ShapeType } from '../types'

const SIZE_PX: Record<ShapeSpec['size'], number> = {
  small: 32,
  medium: 48,
  large: 64,
}

const MARK_COLOR = '#1e293b'

function polygonPoints(sides: number, r: number, cx: number, cy: number, rotationDeg = -90) {
  const pts: string[] = []
  for (let i = 0; i < sides; i++) {
    const angle = (rotationDeg + (360 / sides) * i) * (Math.PI / 180)
    pts.push(`${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`)
  }
  return pts.join(' ')
}

function starPoints(cx: number, cy: number, rOuter: number, rInner: number) {
  const pts: string[] = []
  for (let i = 0; i < 10; i++) {
    const r = i % 2 === 0 ? rOuter : rInner
    const angle = (-90 + 36 * i) * (Math.PI / 180)
    pts.push(`${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`)
  }
  return pts.join(' ')
}

interface Paint {
  fill: string
  stroke: string
  strokeWidth: number
}

function shapeElement(type: ShapeType, c: number, r: number, paint: Paint): ReactNode {
  const common = { ...paint, strokeLinejoin: 'round' as const }
  switch (type) {
    case 'circle':
      return <circle cx={c} cy={c} r={r} {...common} />
    case 'square':
      return <rect x={c - r * 0.85} y={c - r * 0.85} width={r * 1.7} height={r * 1.7} {...common} />
    case 'triangle':
      return <polygon points={polygonPoints(3, r, c, c)} {...common} />
    case 'pentagon':
      return <polygon points={polygonPoints(5, r, c, c)} {...common} />
    case 'hexagon':
      return <polygon points={polygonPoints(6, r, c, c)} {...common} />
    case 'star':
      return <polygon points={starPoints(c, c, r, r * 0.45)} {...common} />
    case 'cross': {
      const arm = r * 0.4
      return (
        <path
          d={`M ${c - arm} ${c - r} H ${c + arm} V ${c - arm} H ${c + r} V ${c + arm} H ${c + arm} V ${c + r} H ${c - arm} V ${c + arm} H ${c - r} V ${c - arm} H ${c - arm} Z`}
          {...common}
        />
      )
    }
    case 'arrow':
      return (
        <path
          d={`M ${c - r} ${c - r * 0.25} H ${c + r * 0.1} V ${c - r * 0.65} L ${c + r} ${c} L ${c + r * 0.1} ${c + r * 0.65} V ${c + r * 0.25} H ${c - r} Z`}
          {...common}
        />
      )
  }
}

function paintFor(spec: ShapeSpec, patternId: string, halfId: string): Paint {
  switch (spec.fill) {
    case 'outline':
      return { fill: 'white', stroke: spec.color, strokeWidth: 4 }
    case 'striped':
    case 'dotted':
      return { fill: `url(#${patternId})`, stroke: spec.color, strokeWidth: 2 }
    case 'half':
      return { fill: `url(#${halfId})`, stroke: spec.color, strokeWidth: 2.5 }
    default:
      return { fill: spec.color, stroke: spec.color, strokeWidth: 2 }
  }
}

// Marks get a white halo underneath so they stay visible on patterned fills.
function InnerMark({ mark, c, r }: { mark: ShapeSpec['inner']; c: number; r: number }) {
  const len = r * 0.38
  const lines = (color: string, width: number) => {
    const props = { stroke: color, strokeWidth: width, strokeLinecap: 'round' as const }
    if (mark === 'line') return <line x1={c} y1={c - len} x2={c} y2={c + len} {...props} />
    return (
      <g {...props}>
        <line x1={c - len * 0.7} y1={c - len * 0.7} x2={c + len * 0.7} y2={c + len * 0.7} />
        <line x1={c - len * 0.7} y1={c + len * 0.7} x2={c + len * 0.7} y2={c - len * 0.7} />
      </g>
    )
  }
  switch (mark) {
    case 'dot': {
      const dotR = Math.max(3, r * 0.16)
      return (
        <g>
          <circle cx={c} cy={c} r={dotR + 2} fill="white" />
          <circle cx={c} cy={c} r={dotR} fill={MARK_COLOR} />
        </g>
      )
    }
    case 'line':
    case 'x':
      return (
        <g>
          {lines('white', 6.5)}
          {lines(MARK_COLOR, 3)}
        </g>
      )
    default:
      return null
  }
}

export function ShapeRenderer({ spec, className, scale = 1 }: { spec: ShapeSpec; className?: string; scale?: number }) {
  const box = SIZE_PX[spec.size]
  const c = box / 2
  const r = c * 0.85
  const colorKey = spec.color.replace('#', '')
  const patternId = `pat-${colorKey}-${spec.fill}`
  const halfId = `half-${colorKey}`
  const paint = paintFor(spec, patternId, halfId)

  return (
    <svg
      viewBox={`0 0 ${box} ${box}`}
      width={box * scale}
      height={box * scale}
      className={className}
      style={{ transform: `rotate(${spec.rotation}deg)` }}
    >
      <defs>
        {/* Bold, widely spaced tiles so stripes vs dots stay distinguishable on small shapes and printouts. */}
        <pattern id={patternId} width="9" height="9" patternUnits="userSpaceOnUse">
          <rect width="9" height="9" fill="white" />
          {spec.fill === 'striped' && (
            <path d="M-2,2 L2,-2 M0,9 L9,0 M7,11 L11,7" stroke={spec.color} strokeWidth="2.6" />
          )}
          {spec.fill === 'dotted' && <circle cx="4.5" cy="4.5" r="2.2" fill={spec.color} />}
        </pattern>
        <linearGradient id={halfId} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0.5" stopColor={spec.color} />
          <stop offset="0.5" stopColor="white" />
        </linearGradient>
      </defs>
      {shapeElement(spec.type, c, r, paint)}
      {spec.nested && shapeElement(spec.nested, c, r * 0.38, { fill: 'white', stroke: MARK_COLOR, strokeWidth: 2 })}
      {!spec.nested && <InnerMark mark={spec.inner} c={c} r={r} />}
    </svg>
  )
}
