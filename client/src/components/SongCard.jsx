import ScrollingText from './ScrollingText'

export default function SongCard({ song, onAdd, actionLabel = 'add', isAdded = false, compact = false }) {
  const art = compact ? 56 : 60
  const btnW = compact ? 76 : 80
  const btnH = compact ? 36 : 36

  return (
    <div className="scroll-wrap" style={{ ...styles.card, minHeight: compact ? 'auto' : 92, padding: compact ? '14px' : '0 16px' }}>
      <img
        src={song.artwork_url || 'https://placehold.co/60x60?text=♪'}
        alt={song.title}
        style={{ ...styles.artwork, width: art, height: art }}
      />

      <div style={styles.info}>
        <ScrollingText style={{ ...styles.title, fontSize: compact ? 17 : 17 }}>
          {song.title}
        </ScrollingText>
        <div style={{ ...styles.artist, fontSize: compact ? 15 : 14 }}>{song.artist}</div>
        {song.reason && <div style={styles.reason}>✦ {song.reason}</div>}
        {song.tags && song.tags.length > 0 && (
          <div style={styles.tags}>
            {song.tags.map((tag, i) => (
              <span key={i} style={styles.tag}>{tag}</span>
            ))}
          </div>
        )}
      </div>

      <div style={styles.actions}>
        {song.preview_url && (
          <audio
            controls
            src={song.preview_url}
            style={{ ...styles.audio, width: compact ? 130 : 110 }}
          />
        )}
        <button
          style={{
            ...styles.addBtn,
            width: btnW,
            height: btnH,
            fontSize: compact ? 11 : 12,
            background: isAdded ? 'rgba(26,7,51,0.12)' : 'var(--bubblegum)',
            color: isAdded ? 'var(--text-on-glass-muted)' : '#1A0733',
            border: isAdded ? '1px solid rgba(26,7,51,0.22)' : 'none',
          }}
          onClick={() => onAdd(song)}
          disabled={isAdded}
        >
          {isAdded ? 'added' : actionLabel}
        </button>
      </div>
    </div>
  )
}

const styles = {
  card: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
    borderRadius: '14px',
    background: 'var(--glass-bg)',
    backdropFilter: 'blur(16px) saturate(1.6)',
    WebkitBackdropFilter: 'blur(16px) saturate(1.6)',
    border: '1px solid var(--glass-border)',
    boxShadow: 'var(--glass-sheen)',
    marginBottom: '8px',
  },
  artwork: {
    borderRadius: '6px',
    objectFit: 'cover',
    flexShrink: 0,
  },
  info: {
    flex: '0 1 auto',
    minWidth: 0,
    marginRight: 'auto',
    maxWidth: '340px',
  },
  title: {
    fontWeight: '600',
    color: 'var(--text-on-glass)',
  },
  artist: {
    fontWeight: '500',
    color: 'var(--text-on-glass-muted)',
    marginTop: '1px',
  },
  reason: {
    fontSize: '12px',
    fontWeight: '600',
    color: 'var(--berry-deep)',
    marginTop: '3px',
    lineHeight: '1.4',
  },
  tags: {
    display: 'flex',
    gap: '5px',
    marginTop: '6px',
    flexWrap: 'wrap',
  },
  tag: {
    fontSize: '11px',
    fontWeight: '600',
    padding: '3px 9px',
    borderRadius: '999px',
    background: 'rgba(122,63,158,0.16)',
    color: 'var(--text-on-glass-accent)',
  },
  actions: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    flexShrink: 0,
  },
  audio: {
    height: '32px',
    width: '110px',
  },
  addBtn: {
    borderRadius: '8px',
    fontFamily: 'var(--font-display)',
    letterSpacing: '0.02em',
    flexShrink: 0,
  },
}