import { useRef, useState, useEffect } from 'react'

export default function ScrollingText({ children, style }) {
  const wrapRef = useRef(null)
  const textRef = useRef(null)
  const [overflows, setOverflows] = useState(false)
  const [distance, setDistance] = useState(0)

  useEffect(() => {
    const wrap = wrapRef.current
    const text = textRef.current
    if (!wrap || !text) return

    const over = text.scrollWidth - wrap.clientWidth
    setOverflows(over > 2)
    setDistance(over + 8)
  }, [children])

  const duration = Math.max(2.5, distance / 40)

  return (
    <div ref={wrapRef} style={{ ...style, overflow: 'hidden', whiteSpace: 'nowrap' }}>
      <style>{`
        .scroll-text {
          display: inline-block;
          transition: transform 0.2s ease;
        }
        .scroll-wrap:hover .scroll-text.can-scroll {
          animation: scrollText var(--dur) linear infinite alternate;
        }
        @keyframes scrollText {
          0%   { transform: translateX(0); }
          15%  { transform: translateX(0); }
          85%  { transform: translateX(calc(var(--dist) * -1px)); }
          100% { transform: translateX(calc(var(--dist) * -1px)); }
        }
      `}</style>
      <span
        ref={textRef}
        className={`scroll-text ${overflows ? 'can-scroll' : ''}`}
        style={{ '--dist': distance, '--dur': `${duration}s` }}
      >
        {children}
      </span>
    </div>
  )
}