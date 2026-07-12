export default function SongCard({ song, onAdd, actionLabel = 'add', isAdded = false }) {
  return (
    <div style={styles.card}>
      <img
        src={song.artwork_url || 'https://placehold.co/48x48?text=♪'}
        alt={song.title}
        style={styles.artwork}
      />
      <div style={styles.info}>
        <div style={styles.title}>{song.title}</div>
        <div style={styles.artist}>{song.artist}</div>
        {song.reason && (
    <div style={styles.reason}>✦ {song.reason}</div>
    )}
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
          <audio controls src={song.preview_url} style={styles.audio} />
        )}
        <button
          style={{
            ...styles.addBtn,
            background: isAdded ? '#E6FAF6' : '#5B5FEF',
            color: isAdded ? '#00917D' : '#ffffff',
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
    gap: '12px',
    padding: '10px 12px',
    borderRadius: '10px',
    background: '#FAFAFC',
    marginBottom: '8px',
  },
  artwork: {
    width: '48px',
    height: '48px',
    borderRadius: '8px',
    objectFit: 'cover',
    flexShrink: 0,
  },
  info: {
    flex: 1,
    minWidth: 0,
  },
  title: {
    fontSize: '13px',
    fontWeight: '500',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    color: '#16161A',
  },
  artist: {
    fontSize: '12px',
    color: '#9A9AA6',
    marginTop: '2px',
  },
  reason: {
  fontSize: '11px',
  color: '#8A2BE2',
  marginTop: '3px',
  fontStyle: 'italic',
  },
  actions: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    flexShrink: 0,
  },
  audio: {
    height: '28px',
    width: '140px',
  },
  addBtn: {
    padding: '6px 14px',
    borderRadius: '8px',
    fontSize: '12px',
    fontWeight: '500',
    flexShrink: 0,
  },
  tags: {
  display: 'flex',
  gap: '6px',
  marginTop: '6px',
  flexWrap: 'wrap',
},
tag: {
  fontSize: '10px',
  padding: '3px 8px',
  borderRadius: '999px',
  background: '#EFEFFC',
  color: '#5B5FEF',
  fontWeight: '500',
}
}
