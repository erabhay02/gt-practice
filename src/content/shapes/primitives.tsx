import type { ReactNode } from 'react'
import type { ShapeSpec } from '../types'

const SIZE_PX: Record<ShapeSpec['size'], number> = {
  small: 32,
  medium: 48,
  large: 64,
}

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

function fillProps(spec: ShapeSpec, patternId: string): { fill: string; stroke: string; strokeWidth: number } {
  if (spec.fill === 'outline') {
    return { fill: 'none', stroke: spec.color, strokeWidth: 4 }
  }
  if (spec.fill === 'striped' || spec.fill === 'dotted') {
    return { fill: `url(#${patternId})`, stroke: spec.color, strokeWidth: 2 }
  }
  return { fill: spec.color, stroke: spec.color, strokeWidth: 2 }
}

export function ShapeRenderer({ spec, className, scale = 1 }: { spec: ShapeSpec; className?: string; scale?: number }) {
  const box = SIZE_PX[spec.size]
  const half = box / 2
  const r = half * 0.85
  const patternId = `pat-${spec.color.replace('#', '')}-${spec.fill}`
  const { fill, stroke, strokeWidth } = fillProps(spec, patternId)

  let shapeEl: ReactNode
  switch (spec.type) {
    case 'circle':
      shapeEl = <circle cx={half} cy={half} r={r} fill={fill} stroke={stroke} strokeWidth={strokeWidth} />
      break
    case 'square':
      shapeEl = (
        <rect
          x={half - r}
          y={half - r}
          width={r * 2}
          height={r * 2}
          fill={fill}
          stroke={stroke}
          strokeWidth={strokeWidth}
        />
      )
      break
    case 'triangle':
      shapeEl = <polygon points={polygonPoints(3, r, half, half)} fill={fill} stroke={stroke} strokeWidth={strokeWidth} />
      break
    case 'pentagon':
      shapeEl = <polygon points={polygonPoints(5, r, half, half)} fill={fill} stroke={stroke} strokeWidth={strokeWidth} />
      break
    case 'hexagon':
      shapeEl = <polygon points={polygonPoints(6, r, half, half)} fill={fill} stroke={stroke} strokeWidth={strokeWidth} />
      break
    case 'star':
      shapeEl = (
        <polygon points={starPoints(half, half, r, r * 0.45)} fill={fill} stroke={stroke} strokeWidth={strokeWidth} />
      )
      break
    case 'cross': {
      const arm = r * 0.4
      shapeEl = (
        <path
          d={`M ${half - arm} ${half - r} H ${half + arm} V ${half - arm} H ${half + r} V ${half + arm} H ${half + arm} V ${half + r} H ${half - arm} V ${half + arm} H ${half - r} V ${half - arm} H ${half - arm} Z`}
          fill={fill}
          stroke={stroke}
          strokeWidth={strokeWidth}
        />
      )
      break
    }
    case 'arrow':
      shapeEl = (
        <path
          d={`M ${half - r} ${half - r * 0.25} H ${half + r * 0.1} V ${half - r * 0.65} L ${half + r} ${half} L ${half + r * 0.1} ${half + r * 0.65} V ${half + r * 0.25} H ${half - r} Z`}
          fill={fill}
          stroke={stroke}
          strokeWidth={strokeWidth}
          strokeLinejoin="round"
        />
      )
      break
    default:
      shapeEl = null
  }

  return (
    <svg
      viewBox={`0 0 ${box} ${box}`}
      width={box * scale}
      height={box * scale}
      className={className}
      style={{ transform: `rotate(${spec.rotation}deg)` }}
    >
      <defs>
        <pattern id={patternId} width="6" height="6" patternUnits="userSpaceOnUse">
          <rect width="6" height="6" fill="white" />
          {spec.fill === 'striped' && <path d="M0,6 L6,0" stroke={spec.color} strokeWidth="2" />}
          {spec.fill === 'dotted' && <circle cx="3" cy="3" r="1.5" fill={spec.color} />}
        </pattern>
      </defs>
      {shapeEl}
    </svg>
  )
}
