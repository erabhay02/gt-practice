import { COLORS as BEAD_COLORS } from '../generators/shapePalette'
import type { ContentSpec, FoldLine, Hole, LineStroke, PaperRegion, Point } from '../types'
import { ShapeRenderer } from './primitives'

type TileSize = 'small' | 'medium' | 'large'

const GROUP_COLS: Record<number, string> = {
  1: 'grid-cols-1',
  2: 'grid-cols-2',
  3: 'grid-cols-3',
  4: 'grid-cols-4',
}

function groupColumns(count: number): number {
  if (count <= 1) return 1
  if (count <= 4) return 2
  if (count <= 9) return 3
  return 4
}

function GroupTile({ emoji, count }: { emoji: string; count: number }) {
  const cols = groupColumns(count)
  const textSize = count > 9 ? 'text-base' : count > 4 ? 'text-lg' : 'text-2xl'
  return (
    <div className={`grid ${GROUP_COLS[cols]} place-items-center gap-0.5 leading-none ${textSize}`}>
      {Array.from({ length: count }, (_, i) => (
        <span key={i}>{emoji}</span>
      ))}
    </div>
  )
}

function AbacusTile({ counts }: { counts: (number | null)[] }) {
  const rodGap = 22
  const width = counts.length * rodGap + 12
  const height = 132
  const baseY = 122
  return (
    <svg viewBox={`0 0 ${width} ${height}`} width={width} height={height}>
      <rect x={2} y={baseY} width={width - 4} height={8} rx={2} fill="#78716c" />
      {counts.map((count, i) => {
        const cx = 6 + rodGap / 2 + i * rodGap
        return (
          <g key={i}>
            <line x1={cx} y1={8} x2={cx} y2={baseY} stroke="#a8a29e" strokeWidth={3} />
            {count === null ? (
              <text x={cx} y={70} textAnchor="middle" fontSize={22} fontWeight={700} fill="#64748b">
                ?
              </text>
            ) : (
              // A small gap after every 5th bead makes counts readable at a glance.
              Array.from({ length: count }, (_, b) => (
                <ellipse
                  key={b}
                  cx={cx}
                  cy={baseY - 6 - b * 10 - (b >= 5 ? 5 : 0)}
                  rx={9}
                  ry={5.5}
                  fill={BEAD_COLORS[i % BEAD_COLORS.length]}
                  stroke="#1e293b"
                  strokeWidth={0.75}
                />
              ))
            )}
          </g>
        )
      })}
    </svg>
  )
}

function HoleMark({ hole }: { hole: Hole }) {
  const props = { fill: '#ffffff', stroke: '#1e293b', strokeWidth: 1.5 }
  if (hole.cut === 'square') return <rect x={hole.x - 4} y={hole.y - 4} width={8} height={8} {...props} />
  if (hole.cut === 'triangle') {
    // Narrow isosceles triangle so its pointing direction is obvious.
    const a = ((hole.angle ?? 0) * Math.PI) / 180
    const pt = (r: number, da: number) => `${hole.x + r * Math.cos(a + da)},${hole.y + r * Math.sin(a + da)}`
    return <polygon points={`${pt(7, 0)} ${pt(6, 2.45)} ${pt(6, -2.45)}`} {...props} strokeLinejoin="round" />
  }
  return <circle cx={hole.x} cy={hole.y} r={4} {...props} />
}

function PaperTile({
  region,
  polygon,
  holes,
  foldLines,
  px,
}: {
  region: PaperRegion
  polygon?: Point[]
  holes: Hole[]
  foldLines?: FoldLine[]
  px: number
}) {
  const isFull = !polygon && region.w === 64 && region.h === 64
  const line = (x1: number, y1: number, x2: number, y2: number) => (
    <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#475569" strokeWidth={1.5} strokeDasharray="4 3" />
  )
  return (
    <svg viewBox="-2 -2 68 68" width={px} height={px}>
      {!isFull && (
        <rect x={0} y={0} width={64} height={64} fill="none" stroke="#cbd5e1" strokeWidth={1.5} strokeDasharray="3 3" />
      )}
      {polygon ? (
        <polygon points={polygon.map((p) => `${p.x},${p.y}`).join(' ')} fill="#e2e8f0" stroke="#475569" strokeWidth={2} strokeLinejoin="round" />
      ) : (
        <rect x={region.x} y={region.y} width={region.w} height={region.h} fill="#e2e8f0" stroke="#475569" strokeWidth={2} />
      )}
      {foldLines?.includes('vertical') && line(region.x + region.w / 2, region.y, region.x + region.w / 2, region.y + region.h)}
      {foldLines?.includes('horizontal') && line(region.x, region.y + region.h / 2, region.x + region.w, region.y + region.h / 2)}
      {foldLines?.includes('diagonal') && line(0, 0, 64, 64)}
      {foldLines?.includes('anti-diagonal') && line(64, 0, 0, 64)}
      {holes.map((h, i) => (
        <HoleMark key={i} hole={h} />
      ))}
    </svg>
  )
}

/** A grid of colored squares; `hole` is left blank with a dashed outline. */
function PatternTile({ cells, hole, px }: { cells: string[][]; hole?: { row: number; col: number; size: number }; px: number }) {
  const rows = cells.length
  const cols = cells[0]?.length ?? 0
  const unit = 10
  const inHole = (r: number, c: number) =>
    !!hole && r >= hole.row && r < hole.row + hole.size && c >= hole.col && c < hole.col + hole.size
  return (
    <svg viewBox={`-1 -1 ${cols * unit + 2} ${rows * unit + 2}`} width={px} height={(px * rows) / cols}>
      {cells.flatMap((row, r) =>
        row.map((color, c) =>
          inHole(r, c) ? null : (
            <rect key={`${r}-${c}`} x={c * unit} y={r * unit} width={unit} height={unit} fill={color} stroke="#1e293b" strokeWidth={0.4} />
          ),
        ),
      )}
      {hole && (
        <rect
          x={hole.col * unit}
          y={hole.row * unit}
          width={hole.size * unit}
          height={hole.size * unit}
          fill="#ffffff"
          stroke="#64748b"
          strokeWidth={0.8}
          strokeDasharray="2 1.5"
        />
      )}
      <rect x={0} y={0} width={cols * unit} height={rows * unit} fill="none" stroke="#1e293b" strokeWidth={0.8} />
    </svg>
  )
}

const STROKE_PATHS: Record<LineStroke, string> = {
  top: 'M8 8 H56',
  bottom: 'M8 56 H56',
  left: 'M8 8 V56',
  right: 'M56 8 V56',
  diag: 'M8 8 L56 56',
  antidiag: 'M56 8 L8 56',
  vmid: 'M32 8 V56',
  hmid: 'M8 32 H56',
  ring: 'M32 20 a12 12 0 1 0 0.01 0',
}

/** A line figure: the chosen strokes inside a faint square guide. */
function LinesTile({ strokes, px }: { strokes: LineStroke[]; px: number }) {
  return (
    <svg viewBox="0 0 64 64" width={px} height={px}>
      <rect x={8} y={8} width={48} height={48} fill="none" stroke="#e2e8f0" strokeWidth={1} />
      {strokes.map((s) => (
        <path key={s} d={STROKE_PATHS[s]} fill="none" stroke="#1e3a8a" strokeWidth={3.5} strokeLinecap="round" />
      ))}
    </svg>
  )
}

/** Emoji laid out in rows, so "above", "between" and "last" are easy to see. */
function SceneTile({ rows, size }: { rows: string[][]; size: TileSize }) {
  const text = size === 'small' ? 'text-lg' : size === 'large' ? 'text-3xl' : 'text-2xl'
  return (
    <div className={`flex flex-col items-center gap-0.5 leading-none ${text}`}>
      {rows.map((row, r) => (
        <div key={r} className="flex gap-1">
          {row.map((e, c) => (
            <span key={c}>{e}</span>
          ))}
        </div>
      ))}
    </div>
  )
}

/** A sentence with its "___" drawn as a fill-in line. */
function SentenceText({ text }: { text: string }) {
  const parts = text.split('___')
  return (
    <p className="text-left font-display text-xl leading-relaxed text-ink">
      {parts.map((part, i) => (
        <span key={i}>
          {part}
          {i < parts.length - 1 && (
            <span className="mx-1 inline-block w-16 border-b-[3px] border-ink align-baseline" aria-label="blank">
              &nbsp;
            </span>
          )}
        </span>
      ))}
    </p>
  )
}

export function ContentTile({ content, size = 'medium' }: { content: ContentSpec; size?: TileSize }) {
  const emojiSizeClass = size === 'large' ? 'text-5xl' : size === 'small' ? 'text-2xl' : 'text-4xl'

  switch (content.kind) {
    case 'emoji':
      return <span className={emojiSizeClass}>{content.value}</span>
    case 'shape': {
      const count = content.spec.count ?? 1
      if (count === 1) return <ShapeRenderer spec={content.spec} />
      return (
        <div className="flex items-center gap-0.5">
          {Array.from({ length: count }, (_, i) => (
            <ShapeRenderer key={i} spec={content.spec} scale={count === 2 ? 0.6 : 0.45} />
          ))}
        </div>
      )
    }
    case 'text':
      return <span className={`${size === 'small' ? 'text-xl' : 'text-2xl'} font-bold text-slate-800`}>{content.value}</span>
    case 'word':
      return (
        <span className={`break-words text-center font-display font-semibold leading-tight text-ink ${size === 'small' ? 'text-base' : 'text-xl'}`}>
          {content.value}
        </span>
      )
    case 'sentence':
      return <SentenceText text={content.value} />
    case 'blank':
      return (
        <div
          className={`flex items-center justify-center rounded-lg border-2 border-dashed border-slate-300 text-slate-400 ${
            size === 'small' ? 'h-10 w-10 text-xl' : 'h-12 w-12 text-2xl'
          }`}
        >
          ?
        </div>
      )
    case 'group':
      return <GroupTile emoji={content.emoji} count={content.count} />
    case 'abacus':
      return <AbacusTile counts={content.counts} />
    case 'pattern': {
      // The full design is shown big; answer pieces (2x2/3x3 blocks) small.
      const big = content.cells.length > 3
      return <PatternTile cells={content.cells} hole={content.hole} px={big ? (size === 'small' ? 120 : 168) : size === 'small' ? 40 : 56} />
    }
    case 'lines':
      return <LinesTile strokes={content.strokes} px={size === 'large' ? 60 : size === 'small' ? 40 : 52} />
    case 'scene':
      return <SceneTile rows={content.rows} size={size} />
    case 'paper':
      return (
        <PaperTile
          region={content.region}
          polygon={content.polygon}
          holes={content.holes}
          foldLines={content.foldLines}
          px={size === 'large' ? 72 : size === 'small' ? 48 : 60}
        />
      )
    default:
      return null
  }
}
