import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'
import Navbar from '../components/Navbar'

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

  const deletePlaylist = async (id) => {
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
      <Navbar />
      <div style={styles.content}>
        <div style={styles.header}>
          <h1 style={styles.title}>your playlists</h1>
          <button style={styles.newBtn} onClick={() => navigate('/')}>
            + new playlist
          </button>
        </div>

        {loading && <p style={styles.empty}>loading...</p>}

        {!loading && playlists.length === 0 && (
          <p style={styles.empty}>no playlists yet — build one on the home page</p>
        )}

        <div style={styles.grid}>
          {playlists.map(playlist => (
            <div
              key={playlist.id}
              style={styles.card}
              onClick={() => navigate(`/playlists/${playlist.id}`)}
            >
              <div style={styles.cardLeft}>
                <div style={styles.cardIcon}>♪</div>
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
    background: '#f8f8fc',
  },
  content: {
    maxWidth: '800px',
    margin: '0 auto',
    padding: '32px',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '24px',
  },
  title: {
    fontSize: '22px',
    fontWeight: '600',
    color: '#16161A',
    letterSpacing: '-0.02em',
  },
  newBtn: {
    height: '40px',
    padding: '0 20px',
    borderRadius: '10px',
    background: '#5B5FEF',
    color: '#ffffff',
    fontSize: '14px',
    fontWeight: '500',
  },
  grid: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  card: {
    background: '#ffffff',
    borderRadius: '12px',
    padding: '20px',
    border: '1px solid #ECECEF',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    cursor: 'pointer',
    transition: 'border-color 0.15s ease',
  },
  cardLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },
  cardIcon: {
    width: '48px',
    height: '48px',
    borderRadius: '10px',
    background: '#EFEFFC',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '20px',
    color: '#5B5FEF',
    flexShrink: 0,
  },
  cardInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  cardName: {
    fontSize: '15px',
    fontWeight: '600',
    color: '#16161A',
  },
  cardMeta: {
    fontSize: '13px',
    color: '#9A9AA6',
  },
  deleteBtn: {
    fontSize: '13px',
    color: '#9A9AA6',
    background: 'none',
    padding: '6px 12px',
    borderRadius: '8px',
    border: '1px solid #ECECEF',
  },
  empty: {
    fontSize: '14px',
    color: '#C4C4CC',
    textAlign: 'center',
    padding: '48px 0',
  },
}