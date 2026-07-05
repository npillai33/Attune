import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'
import Navbar from '../components/Navbar'

export default function PlaylistDetail() {
  const [playlist, setPlaylist] = useState(null)
  const [songs, setSongs] = useState([])
  const [loading, setLoading] = useState(true)
  const { token } = useAuth()
  const { id } = useParams()
  const navigate = useNavigate()

  useEffect(() => {
    fetchPlaylist()
  }, [id])

  const fetchPlaylist = async () => {
    try {
      const res = await axios.get(`http://localhost:3001/api/playlists/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setPlaylist(res.data.playlist)
      setSongs(res.data.songs)
    } catch (err) {
      console.error('Failed to fetch playlist:', err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return (
    <div style={styles.page}>
      <Navbar />
      <p style={styles.empty}>loading...</p>
    </div>
  )

  return (
    <div style={styles.page}>
      <Navbar />
      <div style={styles.content}>
        <div style={styles.header}>
          <button style={styles.backBtn} onClick={() => navigate('/playlists')}>
            ← back
          </button>
          <h1 style={styles.title}>{playlist?.name}</h1>
          <p style={styles.meta}>{songs.length} songs</p>
        </div>

        <div style={styles.songList}>
          {songs.length === 0 && (
            <p style={styles.empty}>no songs in this playlist</p>
          )}
          {songs.map((song, index) => (
            <div key={song.id} style={styles.songRow}>
              <span style={styles.position}>{index + 1}</span>
              <img
                src={song.artwork_url || 'https://placehold.co/48x48?text=♪'}
                alt={song.title}
                style={styles.artwork}
              />
              <div style={styles.info}>
                <div style={styles.songTitle}>{song.title}</div>
                <div style={styles.songArtist}>{song.artist}</div>
              </div>
              {song.preview_url && (
                <audio controls src={song.preview_url} style={styles.audio} />
              )}
              <a
                href={song.spotify_search_url}
                target="_blank"
                rel="noreferrer"
                style={styles.spotifyLink}
              >
                open in spotify ↗
            </a>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

const styles = {
  page: {
    minHeight: '100vh',
    background: '#f8f8fc',
  },
  content: {
    maxWidth: '800px',
    margin: '0 auto',
    padding: '32px',
  },
  header: {
    marginBottom: '32px',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  backBtn: {
    background: 'none',
    fontSize: '14px',
    color: '#6B6B76',
    padding: '0',
    alignSelf: 'flex-start',
    marginBottom: '8px',
  },
  title: {
    fontSize: '24px',
    fontWeight: '600',
    color: '#16161A',
    letterSpacing: '-0.02em',
  },
  meta: {
    fontSize: '14px',
    color: '#9A9AA6',
  },
  songList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  songRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    padding: '12px 16px',
    background: '#ffffff',
    borderRadius: '12px',
    border: '1px solid #ECECEF',
  },
  position: {
    fontSize: '13px',
    color: '#C4C4CC',
    width: '20px',
    textAlign: 'center',
    flexShrink: 0,
  },
  artwork: {
    width: '44px',
    height: '44px',
    borderRadius: '8px',
    objectFit: 'cover',
    flexShrink: 0,
  },
  info: {
    flex: 1,
    minWidth: 0,
  },
  songTitle: {
    fontSize: '14px',
    fontWeight: '500',
    color: '#16161A',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  songArtist: {
    fontSize: '12px',
    color: '#9A9AA6',
    marginTop: '2px',
  },
  audio: {
    height: '28px',
    width: '140px',
    flexShrink: 0,
  },
  spotifyLink: {
    fontSize: '12px',
    color: '#5B5FEF',
    fontWeight: '500',
    flexShrink: 0,
    whiteSpace: 'nowrap',
  },
  empty: {
    fontSize: '14px',
    color: '#C4C4CC',
    textAlign: 'center',
    padding: '48px 0',
  },
}