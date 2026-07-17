import { useMemo } from 'react'

const NOTES = ['♪', '♫', '✦', '♩', '♬', '✧', '★']

// Seeded RNG — same "random" layout every render, no re-scattering
function makeRandom(seed) {
  let s = seed
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296
    return s / 4294967296
  }
}

function generate(count, seed, config) {
  const rand = makeRandom(seed)
  return Array.from({ length: count }, () => ({
    left: `${rand() * 98}%`,
    top: `${rand() * 96}%`,
    size: config.minSize + rand() * (config.maxSize - config.minSize),
    delay: rand() * 6,
    dur: config.minDur + rand() * (config.maxDur - config.minDur),
    op: config.minOp + rand() * (config.maxOp - config.minOp),
    note: NOTES[Math.floor(rand() * NOTES.length)],
  }))
}

export default function BackgroundNotes() {
  const stars = useMemo(
    () => generate(90, 12345, { minSize: 1, maxSize: 3, minDur: 2.5, maxDur: 5.5, minOp: 0.4, maxOp: 1 }),
    []
  )
  const notes = useMemo(
    () => generate(28, 67890, { minSize: 16, maxSize: 42, minDur: 4.5, maxDur: 7.5, minOp: 0.3, maxOp: 0.6 }),
    []
  )

  return (
    <div style={styles.wrap} aria-hidden="true">
      <style>{`
        @keyframes twinkle {
          0%, 100% { opacity: var(--o); transform: scale(1); }
          50%      { opacity: calc(var(--o) * 0.25); transform: scale(0.7); }
        }
        @keyframes noteBreathe {
          0%, 100% { opacity: var(--o); transform: scale(1); }
          50%      { opacity: calc(var(--o) * 1.6); transform: scale(1.1); }
        }
      `}</style>

      {/* nebula wash */}
      <div style={styles.nebula1} />
      <div style={styles.nebula2} />
      <div style={styles.nebula3} />

      {/* stars */}
      {stars.map((s, i) => (
        <span
          key={`s${i}`}
          style={{
            position: 'absolute',
            left: s.left,
            top: s.top,
            width: s.size,
            height: s.size,
            borderRadius: '50%',
            background: '#FFFFFF',
            '--o': s.op,
            opacity: s.op,
            animation: `twinkle ${s.dur}s ease-in-out ${s.delay}s infinite`,
            boxShadow: `0 0 ${s.size * 3}px ${s.size}px rgba(214,255,246,0.5)`,
          }}
        />
      ))}

      {/* notes */}
      {notes.map((n, i) => (
        <span
          key={`n${i}`}
          style={{
            position: 'absolute',
            left: n.left,
            top: n.top,
            fontSize: n.size,
            color: 'var(--wisteria)',
            '--o': n.op,
            opacity: n.op,
            animation: `noteBreathe ${n.dur}s ease-in-out ${n.delay}s infinite`,
            textShadow: '0 0 18px rgba(188,150,230,0.9), 0 0 36px rgba(188,150,230,0.5)',
          }}
        >
          {n.note}
        </span>
      ))}
    </div>
  )
}

const styles = {
  wrap: {
    position: 'fixed',
    inset: 0,
    overflow: 'hidden',
    pointerEvents: 'none',
    zIndex: 0,
  },
  nebula1: {
    position: 'absolute',
    top: '-10%',
    left: '-5%',
    width: '55%',
    height: '65%',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(188,150,230,0.18) 0%, transparent 65%)',
    filter: 'blur(60px)',
  },
  nebula2: {
    position: 'absolute',
    bottom: '-15%',
    right: '-8%',
    width: '60%',
    height: '70%',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(127,227,216,0.13) 0%, transparent 65%)',
    filter: 'blur(70px)',
  },
  nebula3: {
    position: 'absolute',
    top: '35%',
    left: '40%',
    width: '45%',
    height: '50%',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(243,22,81,0.1) 0%, transparent 65%)',
    filter: 'blur(80px)',
  },
}