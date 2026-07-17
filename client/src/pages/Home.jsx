import { useState } from 'react'
import axios from 'axios'
import api from '../api'
import Navbar from '../components/Navbar'
import SongCard from '../components/SongCard'
import { useAuth } from '../context/AuthContext'
import BackgroundNotes from '../components/BackgroundNotes'

export default function Home() {
  const [query, setQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [playlist, setPlaylist] = useState([])
  const [searching, setSearching] = useState(false)
  const [recommendations, setRecommendations] = useState([])
  const [loadingRecs, setLoadingRecs] = useState(false)
  const [playlistName, setPlaylistName] = useState('my playlist')
  const [vibeMode, setVibeMode] = useState(false)
  const [editingName, setEditingName] = useState(false)

  const { token } = useAuth()

  const handleSearch = async () => {
    if (!query.trim()) return
    setSearching(true)
    try {
      const res = await axios.get(`https://itunes.apple.com/search`, {
        params: {
          term: query,
          media: 'music',
          limit: 10
        }
      })
      const songs = res.data.results.map(track => ({
        itunes_track_id: String(track.trackId),
        title: track.trackName,
        artist: track.artistName,
        album: track.collectionName,
        artwork_url: track.artworkUrl100,
        preview_url: track.previewUrl,
        spotify_search_url: `https://open.spotify.com/search/${encodeURIComponent(track.trackName + ' ' + track.artistName)}`
      }))
      setSearchResults(songs)
    } catch (err) {
      console.error('Search failed:', err)
    } finally {
      setSearching(false)
    }
  }

  const handleVibeSearch = async () => {
  if (!query.trim()) return
  setSearching(true)
  try {
    const res = await api.post(
      '/api/vibe/search',
      { vibe: query },
      { headers: { Authorization: `Bearer ${token}` } }
    )
    setSearchResults(res.data.results)
  } catch (err) {
    console.error('Vibe search failed:', err)
  } finally {
    setSearching(false)
  }
}

  const fetchRecommendations = async (updatedPlaylist) => {
  if (updatedPlaylist.length === 0) {
    setRecommendations([])
    return
  }
  setLoadingRecs(true)
  try {
    const res = await api.post(
      '/api/recommendations/playlist',
      { songs: updatedPlaylist },
      { headers: { Authorization: `Bearer ${token}` } }
    )
    setRecommendations(res.data.recommendations)
  } catch (err) {
    console.error('Recommendations failed:', err)
  } finally {
    setLoadingRecs(false)
  }
}

const savePlaylist = async () => {
  if (playlist.length === 0) return
  try {
    await api.post(
      '/api/playlists',
      { name: playlistName, songs: playlist },
      { headers: { Authorization: `Bearer ${token}` } }
    )
    alert('Playlist saved!')
  } catch (err) {
    console.error('Save failed:', err)
    alert('Failed to save playlist')
  }
}

  const addToPlaylist = (song) => {
  if (playlist.find(s => s.itunes_track_id === song.itunes_track_id)) return
  const updated = [...playlist, song]
  setPlaylist(updated)
  fetchRecommendations(updated)
}

const removeFromPlaylist = (trackId) => {
  const updated = playlist.filter(s => s.itunes_track_id !== trackId)
  setPlaylist(updated)
  fetchRecommendations(updated)
}

  const isInPlaylist = (song) => {
    return playlist.some(s => s.itunes_track_id === song.itunes_track_id)
  }

  return (
    <div style={styles.page}>
      <BackgroundNotes />
      <Navbar />

      <div style={styles.content}>

        <div style={styles.searchSection}>
          <div style={styles.toggleRow}>
            <button
              style={{
                ...styles.toggleBtn,
                background: !vibeMode ? 'var(--mint)' : 'transparent',
                color: !vibeMode ? '#0F0325' : 'var(--mint)',
                border: !vibeMode ? 'none' : '1.5px solid rgba(127,227,216,0.5)',
                boxShadow: !vibeMode ? '0 0 18px rgba(127,227,216,0.35)' : 'none',
              }}
              onClick={() => {
                setVibeMode(false)
                setSearchResults([])
                setQuery('')
              }}
            >
              song search
            </button>
            <button
              style={{
                ...styles.toggleBtn,
                background: vibeMode ? 'var(--berry)' : 'transparent',
                color: vibeMode ? '#FFFFFF' : 'var(--berry)',
                border: vibeMode ? 'none' : '1.5px solid rgba(243,22,81,0.5)',
                boxShadow: vibeMode ? '0 0 18px rgba(243,22,81,0.4)' : 'none',
              }}
              onClick={() => {
                setVibeMode(true)
                setSearchResults([])
                setQuery('')
              }}
            >
              vibe search ✦
            </button>
          </div>

          <div style={styles.searchBar}>
            <input
              style={styles.searchInput}
              placeholder={vibeMode ? 'try "sad rainy day" or "angry workout"...' : 'search for a song or artist...'}
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  vibeMode ? handleVibeSearch() : handleSearch()
                }
              }}
            />
            <button
            style={{
              ...styles.searchBtn,
              background: vibeMode ? 'var(--berry)' : 'var(--mint)',
              color: vibeMode ? '#FFFFFF' : '#0F0325',
              boxShadow: vibeMode ? '0 0 18px rgba(243,22,81,0.4)' : '0 0 18px rgba(127,227,216,0.35)',
            }}
            onClick={vibeMode ? handleVibeSearch : handleSearch}
          >
            {searching ? '...' : 'search'}
          </button>
          </div>

          <div style={styles.results}>
            {searchResults.map(song => (
              <SongCard
                key={song.itunes_track_id}
                song={song}
                onAdd={addToPlaylist}
                isAdded={isInPlaylist(song)}
              />
            ))}
          </div>
        </div>

      <div style={styles.sidebar}>
          <div style={styles.panel}>
            <div style={styles.panelHeader}>
              <div style={styles.panelHeaderLeft}>
                {editingName ? (
                  <input
                    style={styles.playlistNameInput}
                    value={playlistName}
                    onChange={e => setPlaylistName(e.target.value)}
                    onBlur={() => setEditingName(false)}
                    onKeyDown={e => e.key === 'Enter' && setEditingName(false)}
                    autoFocus
                  />
                ) : (
                  <span style={styles.playlistNameText}>{playlistName}</span>
                )}
                <span
                  style={styles.pencilIcon}
                  onClick={() => setEditingName(!editingName)}
                >✎</span>
              </div>
              <span style={styles.countLabel}>{playlist.length} songs</span>
            </div>

            {playlist.length === 0 && (
              <p style={styles.empty}>search for songs and add them here</p>
            )}

            {playlist.map(song => (
              <div key={song.itunes_track_id} style={styles.playlistItem}>
                <img src={song.artwork_url} alt={song.title} style={styles.smallArt} />
                <div style={styles.itemInfo}>
                  <div style={styles.itemTitle}>{song.title}</div>
                  <div style={styles.itemArtist}>{song.artist}</div>
                </div>
                <button
                  style={styles.removeBtn}
                  onClick={() => removeFromPlaylist(song.itunes_track_id)}
                >✕</button>
              </div>
            ))}

            {playlist.length > 0 && (
              <div style={styles.saveRow}>
                <button style={styles.saveBtn} onClick={savePlaylist}>
                  save playlist
                </button>
              </div>
            )}
          </div>

          <div style={styles.panel}>
            <div style={styles.panelHeader}>
              <span style={styles.panelTitle}>recommended</span>
              <span style={styles.countLabel}>
                {loadingRecs ? 'finding...' : `${recommendations.length} matches`}
              </span>
            </div>

            {loadingRecs && <p style={styles.empty}>analyzing your playlist vibe...</p>}

            {recommendations.map(song => (
              <SongCard
                key={song.itunes_track_id}
                song={song}
                onAdd={addToPlaylist}
                isAdded={isInPlaylist(song)}
                actionLabel="add"
                compact
              />
            ))}

            {!loadingRecs && recommendations.length === 0 && playlist.length > 0 && (
              <p style={styles.empty}>no matches found, try adding more songs</p>
            )}
            {playlist.length === 0 && (
              <p style={styles.empty}>add songs to see recommendations</p>
            )}
          </div>
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
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 1fr) 520px',
    gap: '24px',
    padding: '32px',
    maxWidth: '1320px',
    margin: '0 auto',
    position: 'relative',
    zIndex: 1,
  },
  searchSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  toggleRow: {
    display: 'flex',
    gap: '10px',
    marginBottom: '4px',
  },
  toggleBtn: {
    padding: '12px 26px',
    borderRadius: '999px',
    fontSize: '16px',
    fontWeight: '600',
    letterSpacing: '0.03em',
    border: 'none',
    cursor: 'pointer',
  },
  searchBar: {
    display: 'flex',
    gap: '10px',
  },
  searchInput: {
    flex: 1,
    height: '56px',
    borderRadius: '12px',
    border: '2px solid var(--wisteria)',
    padding: '0 20px',
    fontSize: '17px',
    fontWeight: '400',
    background: 'rgba(78,38,130,0.9)',
    color: '#FFFFFF',
    boxShadow: '0 0 20px rgba(188,150,230,0.35), inset 0 2px 8px rgba(15,3,37,0.5)',
  },
  searchBtn: {
    height: '56px',
    padding: '0 32px',
    borderRadius: '12px',
    background: 'var(--mint)',
    color: '#0F0325',
    fontSize: '17px',
    fontWeight: '600',
    letterSpacing: '0.03em',
    boxShadow: '0 0 16px rgba(127,227,216,0.25)',
  },
  results: {
    display: 'flex',
    flexDirection: 'column',
  },
  sidebar: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  panel: {
    position: 'relative',
    background: 'var(--glass-bg)',
    backdropFilter: 'blur(16px) saturate(1.6)',
    WebkitBackdropFilter: 'blur(16px) saturate(1.6)',
    borderRadius: '16px',
    padding: '18px',
    border: '1px solid var(--glass-border)',
    boxShadow: 'var(--glass-sheen)',
    overflow: 'hidden',
  },
  panelHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '14px',
  },
  panelHeaderLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    flex: 1,
    minWidth: 0,
  },
  panelTitle: {
    fontFamily: 'var(--font-display)',
    fontSize: '20px',
    color: 'var(--text-on-glass)',
  },
  countLabel: {
    fontSize: '14px',
    fontWeight: '600',
    color: 'var(--text-on-glass-muted)',
    flexShrink: 0,
  },
  panelSubtitle: {
    fontSize: '15px',
    fontWeight: '600',
    color: 'var(--text-on-glass)',
    marginBottom: '18px',
    opacity: 0.75,
  },
  playlistNameRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '6px',
  },
  playlistNameText: {
    fontFamily: 'var(--font-display)',
    fontSize: '20px',
    color: 'var(--text-on-glass)',
    minWidth: 0,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  playlistNameInput: {
    fontFamily: 'var(--font-display)',
    fontSize: '20px',
    color: 'var(--text-on-glass)',
    background: 'rgba(255,255,255,0.5)',
    border: '1.5px solid var(--berry)',
    borderRadius: '7px',
    padding: '3px 8px',
    outline: 'none',
    flex: 0.5,
    minWidth: 0,
  },
  pencilIcon: {
    fontSize: '20px',
    color: 'var(--berry)',
    flexShrink: 0,
    cursor: 'pointer',
  },
  saveRow: {
    display: 'flex',
    justifyContent: 'flex-end',
    marginTop: '14px',
  },
  empty: {
    fontSize: '14px',
    fontWeight: '400',
    color: 'var(--text-on-glass-muted)',
    textAlign: 'center',
    padding: '24px 0',
  },
  playlistItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '11px',
    padding: '8px 0',
    borderBottom: '1px solid rgba(26,7,51,0.1)',
  },
  saveBtn: {
    padding: '12px 22px',
    borderRadius: '8px',
    background: 'var(--mint)',
    color: '#0F0325',
    fontFamily: 'var(--font-display)',
    fontSize: '13px',
    letterSpacing: '0.02em',
    boxShadow: '0 0 14px rgba(127,227,216,0.3)',
  },
  smallArt: {
    width: '55px',
    height: '50px',
    borderRadius: '5px',
    objectFit: 'cover',
    flexShrink: 0,
  },
  itemInfo: {
    flex: 1,
    minWidth: 0,
  },
  itemTitle: {
    fontSize: '16px',
    fontWeight: '500',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    color: 'var(--text-on-glass)',
  },
  itemArtist: {
    fontSize: '14px',
    fontWeight: '500',
    color: 'var(--text-on-glass-muted)',
  },
  removeBtn: {
    background: 'rgba(243,22,81,0.15)',
    color: 'var(--berry)',
    fontSize: '18px',
    fontWeight: '700',
    width: '32px',
    height: '32px',
    borderRadius: '8px',
    border: '1.5px solid rgba(243,22,81,0.4)',
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    lineHeight: 1,
  }
}