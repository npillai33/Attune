import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'
import Navbar from '../components/Navbar'
import BackgroundNotes from '../components/BackgroundNotes'
import { getCoverStyle } from '../covers'

export default function Playlists() {
  const [playlists, setPlaylists] = useState([])
  const [loading, setLoading] = useState(true)
  const { token } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    fetchPlaylists()
  }, [])

  const fetchPlaylists = async () => {
    try {
      const res = await axios.get('http://localhost:3001/api/playlists', {
        headers: { Authorization: `Bearer ${token}` }
      })
      setPlaylists(res.data.playlists)
    } catch (err) {
      console.error('Failed to fetch playlists:', err)
    } finally {
      setLoading(false)
    }
  }

  const deletePlaylist = async (e, id) => {
    e.stopPropagation()
    try {
      await axios.delete(`http://localhost:3001/api/playlists/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setPlaylists(playlists.filter(p => p.id !== id))
    } catch (err) {
      console.error('Failed to delete playlist:', err)
    }
  }

  return (
    <div style={styles.page}>
      <BackgroundNotes />
      <Navbar />
      <div style={styles.content}>
        <div style={styles.header}>
          <h1 style={styles.title}>your playlists</h1>
          <button style={styles.newBtn} onClick={() => navigate('/home')}>
            + new playlist
          </button>
        </div>

        {loading && <p style={styles.empty}>loading...</p>}

        {!loading && playlists.length === 0 && (
          <div style={styles.emptyCard}>
            <p style={styles.emptyText}>no playlists yet</p>
            <p style={styles.emptySub}>build one on the home page and save it here</p>
          </div>
        )}

        <div style={styles.grid}>
          {playlists.map(playlist => (
            <div
              key={playlist.id}
              style={styles.card}
              onClick={() => navigate(`/playlists/${playlist.id}`)}
            >
              <div style={styles.cardLeft}>
                <div style={{ ...styles.cardIcon, background: getCoverStyle(playlist.cover) }} />
                <div style={styles.cardInfo}>
                  <p style={styles.cardName}>{playlist.name}</p>
                  <p style={styles.cardMeta}>{playlist.song_count} songs</p>
                </div>
              </div>
              <button
                style={styles.deleteBtn}
                onClick={(e) => deletePlaylist(e, playlist.id)}
              >
                delete
              </button>
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
    background: 'var(--bg)',
    position: 'relative',
  },
  content: {
    maxWidth: '860px',
    margin: '0 auto',
    padding: '36px 32px',
    position: 'relative',
    zIndex: 1,
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '28px',
  },
  title: {
    fontFamily: 'var(--font-display)',
    fontSize: '30px',
    color: 'var(--text-on-dark)',
    textShadow: '0 0 24px rgba(188,150,230,0.4)',
  },
  newBtn: {
    height: '48px',
    padding: '0 26px',
    borderRadius: '11px',
    background: 'var(--mint)',
    color: '#0F0325',
    fontSize: '17px',
    fontWeight: '600',
    letterSpacing: '0.03em',
    boxShadow: '0 0 20px rgba(127,227,216,0.4)',
  },
  grid: {
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
  },
  card: {
    position: 'relative',
    background: 'var(--glass-bg)',
    backdropFilter: 'blur(16px) saturate(1.6)',
    WebkitBackdropFilter: 'blur(16px) saturate(1.6)',
    borderRadius: '18px',
    padding: '20px',
    border: '1px solid var(--glass-border)',
    boxShadow: 'var(--glass-sheen)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    cursor: 'pointer',
    overflow: 'hidden',
  },
  cardLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '18px',
    minWidth: 0,
  },
  cardIcon: {
    width: '62px',
    height: '62px',
    borderRadius: '12px',
    flexShrink: 0,
    boxShadow: '0 3px 12px rgba(15,3,37,0.3)',
  },
  cardInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '3px',
    minWidth: 0,
  },
  cardName: {
    fontFamily: 'var(--font-display)',
    fontSize: '19px',
    color: 'var(--text-on-glass)',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  cardMeta: {
    fontSize: '15px',
    fontWeight: '500',
    color: 'var(--text-on-glass-muted)',
  },
  deleteBtn: {
    fontSize: '15px',
    fontWeight: '600',
    color: '#FFFFFF',
    background: 'var(--berry)',
    padding: '10px 20px',
    borderRadius: '9px',
    border: 'none',
    flexShrink: 0,
    letterSpacing: '0.02em',
    boxShadow: '0 2px 10px rgba(243,22,81,0.4)',
  },
  emptyCard: {
    position: 'relative',
    background: 'var(--glass-bg)',
    backdropFilter: 'blur(16px) saturate(1.6)',
    WebkitBackdropFilter: 'blur(16px) saturate(1.6)',
    borderRadius: '18px',
    padding: '56px 24px',
    border: '1px solid var(--glass-border)',
    boxShadow: 'var(--glass-sheen)',
    textAlign: 'center',
    overflow: 'hidden',
  },
  emptyText: {
    fontFamily: 'var(--font-display)',
    fontSize: '20px',
    color: 'var(--text-on-glass)',
    marginBottom: '8px',
  },
  emptySub: {
    fontSize: '16px',
    fontWeight: '400',
    color: 'var(--text-on-glass-muted)',
  },
  empty: {
    fontSize: '17px',
    fontWeight: '500',
    color: 'var(--text-on-dark-muted)',
    textAlign: 'center',
    padding: '56px 0',
  },
}