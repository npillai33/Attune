import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'
import Navbar from '../components/Navbar'
import { COVERS, COVER_LABELS, COVER_KEYS, getCoverStyle } from '../covers'

export default function PlaylistDetail() {
  const [playlist, setPlaylist] = useState(null)
  const [songs, setSongs] = useState([])
  const [loading, setLoading] = useState(true)
  const [editingName, setEditingName] = useState(false)
  const [nameValue, setNameValue] = useState('')
  const [showPicker, setShowPicker] = useState(false)
  const [generating, setGenerating] = useState(false)
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
      setNameValue(res.data.playlist.name)
      setSongs(res.data.songs)
    } catch (err) {
      console.error('Failed to fetch playlist:', err)
    } finally {
      setLoading(false)
    }
  }

  const saveName = async () => {
    setEditingName(false)
    if (nameValue.trim() === playlist.name) return
    try {
      const res = await axios.patch(
        `http://localhost:3001/api/playlists/${id}`,
        { name: nameValue.trim() },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setPlaylist(res.data.playlist)
    } catch (err) {
      console.error('Rename failed:', err)
    }
  }

  const setCover = async (coverKey) => {
    try {
      const res = await axios.patch(
        `http://localhost:3001/api/playlists/${id}`,
        { cover: coverKey },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setPlaylist(res.data.playlist)
      setShowPicker(false)
    } catch (err) {
      console.error('Cover update failed:', err)
    }
  }

  const generateCover = async () => {
    if (songs.length === 0) return
    setGenerating(true)
    try {
      const res = await axios.post(
        'http://localhost:3001/api/playlists/generate-cover',
        { songs },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      await setCover(res.data.cover)
    } catch (err) {
      console.error('Generate cover failed:', err)
    } finally {
      setGenerating(false)
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
        <button style={styles.backBtn} onClick={() => navigate('/playlists')}>
          ← back
        </button>

        <div style={styles.header}>
          <div
            style={{ ...styles.cover, background: getCoverStyle(playlist?.cover) }}
            onClick={() => setShowPicker(!showPicker)}
          >
            <span style={styles.coverEdit}>✎</span>
          </div>

          <div style={styles.headerInfo}>
            <div style={styles.nameRow}>
              {editingName ? (
                <input
                  style={styles.nameInput}
                  value={nameValue}
                  onChange={e => setNameValue(e.target.value)}
                  onBlur={saveName}
                  onKeyDown={e => e.key === 'Enter' && saveName()}
                  autoFocus
                />
              ) : (
                <h1 style={styles.title}>{playlist?.name}</h1>
              )}
              <span
                style={styles.pencilIcon}
                onClick={() => setEditingName(!editingName)}
              >✎</span>
            </div>
            <p style={styles.meta}>{songs.length} songs</p>
          </div>
        </div>

        {showPicker && (
          <div style={styles.picker}>
            <div style={styles.pickerHeader}>
              <span style={styles.pickerTitle}>choose a vibe</span>
              <button
                style={styles.generateBtn}
                onClick={generateCover}
                disabled={generating || songs.length === 0}
              >
                {generating ? 'generating...' : '✦ generate from playlist'}
              </button>
            </div>
            <div style={styles.swatches}>
              {COVER_KEYS.map(key => (
                <div
                  key={key}
                  style={styles.swatchWrap}
                  onClick={() => setCover(key)}
                >
                  <div style={{ ...styles.swatch, background: COVERS[key] }} />
                  <span style={styles.swatchLabel}>{COVER_LABELS[key]}</span>
                </div>
              ))}
            </div>
          </div>
        )}

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
  backBtn: {
    background: 'none',
    fontSize: '14px',
    color: '#6B6B76',
    padding: '0',
    marginBottom: '24px',
  },
  header: {
    marginBottom: '24px',
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
  },
  cover: {
    width: '120px',
    height: '120px',
    borderRadius: '16px',
    flexShrink: 0,
    cursor: 'pointer',
    position: 'relative',
    display: 'flex',
    alignItems: 'flex-end',
    justifyContent: 'flex-end',
    padding: '8px',
  },
  coverEdit: {
    fontSize: '14px',
    color: 'rgba(255,255,255,0.9)',
    background: 'rgba(0,0,0,0.2)',
    borderRadius: '6px',
    padding: '2px 6px',
  },
  headerInfo: {
    flex: 1,
    minWidth: 0,
  },
  nameRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  title: {
    fontSize: '28px',
    fontWeight: '600',
    color: '#16161A',
    letterSpacing: '-0.02em',
  },
  nameInput: {
    fontSize: '28px',
    fontWeight: '600',
    color: '#16161A',
    background: '#ffffff',
    border: '1.5px solid #5B5FEF',
    borderRadius: '8px',
    padding: '2px 10px',
    outline: 'none',
  },
  pencilIcon: {
    fontSize: '16px',
    color: '#9A9AA6',
    cursor: 'pointer',
    flexShrink: 0,
  },
  meta: {
    fontSize: '14px',
    color: '#9A9AA6',
    marginTop: '6px',
  },
  picker: {
    background: '#ffffff',
    borderRadius: '16px',
    border: '1px solid #ECECEF',
    padding: '20px',
    marginBottom: '24px',
  },
  pickerHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '16px',
  },
  pickerTitle: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#16161A',
  },
  generateBtn: {
    fontSize: '13px',
    fontWeight: '500',
    color: '#5B5FEF',
    background: '#EFEFFC',
    padding: '8px 14px',
    borderRadius: '8px',
  },
  swatches: {
    display: 'grid',
    gridTemplateColumns: 'repeat(5, 1fr)',
    gap: '12px',
  },
  swatchWrap: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '6px',
    cursor: 'pointer',
  },
  swatch: {
    width: '100%',
    aspectRatio: '1',
    borderRadius: '10px',
  },
  swatchLabel: {
    fontSize: '11px',
    color: '#6B6B76',
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