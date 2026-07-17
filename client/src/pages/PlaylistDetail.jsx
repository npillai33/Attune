import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'
import Navbar from '../components/Navbar'
import { COVERS, COVER_LABELS, COVER_KEYS, getCoverStyle, buildCustomCover } from '../covers'
import BackgroundNotes from '../components/BackgroundNotes'

export default function PlaylistDetail() {
  const [playlist, setPlaylist] = useState(null)
  const [songs, setSongs] = useState([])
  const [loading, setLoading] = useState(true)
  const [editingName, setEditingName] = useState(false)
  const [nameValue, setNameValue] = useState('')
  const [showPicker, setShowPicker] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [c1, setC1] = useState('#BC96E6')
  const [c2, setC2] = useState('#7FE3D8')
  const [angle, setAngle] = useState(135)

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
        { songs, name: playlist?.name },
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
      <BackgroundNotes />
      <Navbar />
      <p style={styles.empty}>loading...</p>
    </div>
  )

  return (
    <div style={styles.page}>
      <BackgroundNotes />
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
            <div style={styles.pickerGrid}>

              <div style={styles.pickerLeft}>
                <div style={styles.sectionTitle}>Set the mood</div>
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

              <div style={styles.columnDivider} />

              <div style={styles.pickerRight}>

                <div style={styles.aiBlock}>
                  <div style={styles.sectionTitle}>✦ let attune design it ✦</div>
                  <p style={styles.sectionDesc}>
                    reads your tracklist and tunes a gradient to match
                  </p>
                  <button
                    style={{ ...styles.generateBtn, opacity: songs.length === 0 ? 0.4 : 1 }}
                    onClick={generateCover}
                    disabled={generating || songs.length === 0}
                  >
                    {generating ? 'tuning...' : 'Spin it'}
                  </button>
                </div>

                <div style={styles.customBlock}>
                  <div style={styles.sectionTitle}>make your own</div>
                  <div style={styles.customRow}>
                    <div
                      style={{
                        ...styles.customPreview,
                        background: `linear-gradient(${angle}deg, ${c1}, ${c2})`,
                      }}
                    />
                    <div style={styles.customControls}>
                      <div style={styles.colorRow}>
                        <input
                          type="color"
                          value={c1}
                          onChange={e => setC1(e.target.value)}
                          style={styles.colorInput}
                        />
                        <input
                          type="color"
                          value={c2}
                          onChange={e => setC2(e.target.value)}
                          style={styles.colorInput}
                        />
                      </div>
                      <div style={styles.angleRow}>
                        <span style={styles.angleLabel}>angle</span>
                        <input
                          type="range"
                          min="0"
                          max="360"
                          value={angle}
                          onChange={e => setAngle(Number(e.target.value))}
                          style={styles.angleSlider}
                        />
                      </div>
                    </div>
                  </div>
                  <button
                    style={styles.applyBtn}
                    onClick={() => setCover(buildCustomCover(c1, c2, angle))}
                  >
                    use this
                  </button>
                </div>

              </div>
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
    background: 'var(--bg)',
    position: 'relative',
  },
  content: {
    maxWidth: '900px',
    margin: '0 auto',
    padding: '36px 32px',
    position: 'relative',
    zIndex: 1,
  },
  backBtn: {
    background: 'var(--bubblegum)',
    fontSize: '16px',
    fontWeight: '600',
    color: '#FFFFFF',
    padding: '11px 22px',
    borderRadius: '9px',
    border: 'none',
    marginBottom: '26px',
    letterSpacing: '0.02em',
    boxShadow: '0 0 20px rgba(255,143,199,0.5)',
  },
  header: {
    marginBottom: '26px',
    display: 'flex',
    alignItems: 'center',
    gap: '24px',
  },
  cover: {
    width: '140px',
    height: '140px',
    borderRadius: '18px',
    flexShrink: 0,
    cursor: 'pointer',
    position: 'relative',
    display: 'flex',
    alignItems: 'flex-end',
    justifyContent: 'flex-end',
    padding: '10px',
    boxShadow: '0 6px 28px rgba(15,3,37,0.5)',
  },
  coverEdit: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#FFFFFF',
    background: 'rgba(15,3,37,0.55)',
    borderRadius: '7px',
    padding: '4px 9px',
  },
  headerInfo: {
    flex: 1,
    minWidth: 0,
  },
  nameRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  title: {
    fontFamily: 'var(--font-display)',
    fontSize: '32px',
    color: 'var(--text-on-dark)',
    textShadow: '0 0 24px rgba(188,150,230,0.4)',
  },
  nameInput: {
    fontFamily: 'var(--font-display)',
    fontSize: '32px',
    color: 'var(--text-on-dark)',
    background: 'rgba(78,38,130,0.9)',
    border: '2px solid var(--wisteria)',
    borderRadius: '10px',
    padding: '4px 12px',
    outline: 'none',
  },
  pencilIcon: {
    fontSize: '20px',
    color: 'var(--wisteria)',
    cursor: 'pointer',
    flexShrink: 0,
  },
  meta: {
    fontSize: '16px',
    fontWeight: '400',
    color: 'var(--text-on-dark-muted)',
    marginTop: '8px',
  },
  picker: {
    position: 'relative',
    background: 'var(--glass-bg)',
    backdropFilter: 'blur(16px) saturate(1.6)',
    WebkitBackdropFilter: 'blur(16px) saturate(1.6)',
    borderRadius: '18px',
    border: '1px solid var(--glass-border)',
    boxShadow: 'var(--glass-sheen)',
    padding: '24px',
    marginBottom: '26px',
    overflow: 'hidden',
  },
  pickerGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1px 320px',
    gap: '24px',
    alignItems: 'start',
  },
  pickerLeft: {
    minWidth: 0,
  },
  columnDivider: {
    width: '1px',
    height: '100%',
    background: 'rgba(26,7,51,0.15)',
  },
  pickerRight: {
    display: 'flex',
    flexDirection: 'column',
    gap: '22px',
  },
  sectionTitle: {
    fontFamily: 'var(--font-display)',
    fontSize: '15px',
    color: 'var(--text-on-glass)',
    marginBottom: '10px',
  },
  sectionDesc: {
    fontSize: '14px',
    fontWeight: '500',
    color: 'var(--text-on-glass-muted)',
    lineHeight: '1.45',
    marginBottom: '12px',
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
    boxShadow: '0 3px 10px rgba(15,3,37,0.25)',
  },
  swatchLabel: {
    fontSize: '12px',
    fontWeight: '500',
    color: 'var(--text-on-glass)',
  },
  aiBlock: {
    paddingBottom: '20px',
    borderBottom: '1px solid rgba(26,7,51,0.15)',
  },
  customBlock: {

  },
  customRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '12px',
  },
  customPreview: {
    width: '64px',
    height: '64px',
    borderRadius: '11px',
    flexShrink: 0,
    boxShadow: '0 3px 12px rgba(15,3,37,0.25)',
  },
  customControls: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    minWidth: 0,
  },
  colorRow: {
    display: 'flex',
    gap: '8px',
  },
  colorInput: {
    width: '42px',
    height: '32px',
    borderRadius: '7px',
    border: '1.5px solid rgba(26,7,51,0.25)',
    background: 'transparent',
    cursor: 'pointer',
    padding: '2px',
  },
  angleRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  angleLabel: {
    fontSize: '13px',
    fontWeight: '600',
    color: 'var(--text-on-glass-muted)',
    flexShrink: 0,
  },
  angleSlider: {
    flex: 1,
    minWidth: 0,
    accentColor: 'var(--berry)',
    cursor: 'pointer',
  },
  applyBtn: {
    width: '100%',
    padding: '10px 18px',
    borderRadius: '9px',
    background: 'var(--bubblegum)',
    color: '#1A0733',
    fontFamily: 'var(--font-display)',
    fontSize: '13px',
  },
  generateBtn: {
    fontSize: '15px',
    fontWeight: '700',
    color: 'var(--mint-bright)',
    background: '#1A0733',
    padding: '9px 16px',
    borderRadius: '10px',
    boxShadow: '0 3px 14px rgba(26,7,51,0.4)',
  },
  songList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  songRow: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    padding: '14px 18px',
    background: 'var(--glass-bg)',
    backdropFilter: 'blur(16px) saturate(1.6)',
    WebkitBackdropFilter: 'blur(16px) saturate(1.6)',
    borderRadius: '16px',
    border: '1px solid var(--glass-border)',
    boxShadow: 'var(--glass-sheen)',
    overflow: 'hidden',
  },
  position: {
    fontSize: '15px',
    fontWeight: '600',
    color: 'var(--text-on-glass-muted)',
    width: '24px',
    textAlign: 'center',
    flexShrink: 0,
  },
  artwork: {
    width: '52px',
    height: '52px',
    borderRadius: '10px',
    objectFit: 'cover',
    flexShrink: 0,
  },
  info: {
    flex: 1,
    minWidth: 0,
  },
  songTitle: {
    fontSize: '17px',
    fontWeight: '600',
    color: 'var(--text-on-glass)',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  songArtist: {
    fontSize: '15px',
    fontWeight: '400',
    color: 'var(--text-on-glass-muted)',
    marginTop: '2px',
  },
  audio: {
    height: '32px',
    width: '130px',
    flexShrink: 0,
  },
  spotifyLink: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#FFFFFF',
    background: 'var(--berry)',
    padding: '9px 14px',
    borderRadius: '9px',
    flexShrink: 0,
    whiteSpace: 'nowrap',
    boxShadow: '0 2px 10px rgba(243,22,81,0.35)',
  },
  empty: {
    fontSize: '17px',
    fontWeight: '500',
    color: 'var(--text-on-dark-muted)',
    textAlign: 'center',
    padding: '56px 0',
  },
  columnDivider: {
    width: '1px',
    height: '100%',
    background: 'rgba(26,7,51,0.15)',
  },
}