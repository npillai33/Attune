export default function Logo({ size = 'small' }) {
  const sizes = {
    nav: { s: 88, fontSize: 22, glowSize: 84 },
    large: { s: 220, fontSize: 36, glowSize: 210 },
    small: { s: 58, fontSize: 11, glowSize: 54 },
  }
  const { s, fontSize, glowSize } = sizes[size] || sizes.nav

  return (
    <div style={{ ...styles.wrap, width: s, height: s }}>
      <style>{`
        @keyframes attuneSpin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes attuneCoreGlow {
          0%, 100% { opacity: 0.6; transform: translate(-50%, -50%) scale(0.94); }
          50% { opacity: 1; transform: translate(-50%, -50%) scale(1.12); }
        }
        @keyframes attuneLabelPulse {
          0%, 100% { opacity: 0.38; }
          50% { opacity: 0.62; }
        }
        .attune-spin { animation: attuneSpin 10s linear infinite; transform-origin: center; }
        .attune-core { animation: attuneCoreGlow 3.2s ease-in-out infinite; }
        .attune-label { animation: attuneLabelPulse 3.2s ease-in-out infinite; }
      `}</style>

      <div
        className="attune-core"
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          width: glowSize,
          height: glowSize,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(127,227,216,0.75) 0%, rgba(127,227,216,0.4) 22%, rgba(188,150,230,0.22) 45%, transparent 68%)',
          pointerEvents: 'none',
        }}
      />

      <svg className="attune-spin" viewBox="0 0 160 160" style={{ ...styles.svg, width: s, height: s }}>
        <circle cx="80" cy="80" r="76" fill="#150730" stroke="#7FE3D8" strokeWidth="1.6" opacity="0.8" />
        <circle cx="80" cy="80" r="68" fill="none" stroke="#BC96E6" strokeWidth="0.7" opacity="0.38" />
        <circle cx="80" cy="80" r="61" fill="none" stroke="#BC96E6" strokeWidth="0.7" opacity="0.32" />
        <circle cx="80" cy="80" r="54" fill="none" stroke="#BC96E6" strokeWidth="0.7" opacity="0.26" />
        <circle cx="80" cy="80" r="47" fill="none" stroke="#BC96E6" strokeWidth="0.7" opacity="0.2" />
        <circle className="attune-label" cx="80" cy="80" r="34" fill="#7FE3D8" opacity="0.38" />
        <circle cx="80" cy="80" r="34" fill="none" stroke="#7FE3D8" strokeWidth="1.2" opacity="0.9" />
      </svg>

      <svg viewBox="0 0 160 160" style={{ ...styles.svg, width: s, height: s, overflow: 'visible', filter: 'drop-shadow(0 0 4px rgba(188,150,230,0.5))' }}>
        <circle cx="146" cy="18" r="7.5" fill="#1A0838" stroke="#BC96E6" strokeWidth="1.8" />
        <circle cx="146" cy="18" r="2" fill="#BC96E6" />
        <line x1="143" y1="23" x2="112" y2="54" stroke="#BC96E6" strokeWidth="2.8" strokeLinecap="round" />
        <path d="M112 54 L105 63" stroke="#D6FFF6" strokeWidth="4.5" strokeLinecap="round" />
        <circle cx="104" cy="64" r="2" fill="#F31651" />
      </svg>

      <div style={{ ...styles.word, fontSize }}>attune</div>
    </div>
  )
}

const styles = {
  wrap: {
    position: 'relative',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  svg: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  word: {
    fontFamily: 'var(--font-logo)',
    color: '#FFFFFF',
    lineHeight: 1.4,
    position: 'relative',
    zIndex: 2,
    textShadow: '0 0 8px rgba(15,3,37,1), 0 0 20px rgba(15,3,37,0.85)',
    whiteSpace: 'nowrap',
  },
}