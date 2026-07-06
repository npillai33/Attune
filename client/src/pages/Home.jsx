import { useState } from 'react'
import axios from 'axios'
import Navbar from '../components/Navbar'
import SongCard from '../components/SongCard'
import { useAuth } from '../context/AuthContext'

export default function Home() {
  const [query, setQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [playlist, setPlaylist] = useState([])
  const [searching, setSearching] = useState(false)
  const [recommendations, setRecommendations] = useState([])
  const [loadingRecs, setLoadingRecs] = useState(false)
  const [playlistName, setPlaylistName] = useState('my playlist')
  const [vibeMode, setVibeMode] = useState(false)

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
    const res = await axios.post(
      'http://localhost:3001/api/vibe/search',
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
    const res = await axios.post(
      'http://localhost:3001/api/recommendations/playlist',
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
    await axios.post(
      'http://localhost:3001/api/playlists',
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
      <Navbar />

      <div style={styles.content}>

        <div style={styles.searchSection}>
          <div style={styles.toggleRow}>
            <button
              style={{
                ...styles.toggleBtn,
                background: !vibeMode ? '#5B5FEF' : '#EFEFFC',
                color: !vibeMode ? '#ffffff' : '#5B5FEF',
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
                background: vibeMode ? '#5B5FEF' : '#EFEFFC',
                color: vibeMode ? '#ffffff' : '#5B5FEF',
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
              style={styles.searchBtn}
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
            <input
              style={styles.playlistName}
              value={playlistName}
              onChange={e => setPlaylistName(e.target.value)}
            />
            <p style={styles.panelSubtitle}>{playlist.length} songs</p>

            <button
              style={{
                ...styles.searchBtn,
                width: '100%',
                marginBottom: '16px',
                opacity: playlist.length === 0 ? 0.5 : 1,
              }}
              onClick={savePlaylist}
              disabled={playlist.length === 0}
            >
              save playlist
            </button>

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
          </div>

          <div style={styles.panel}>
            <p style={styles.panelTitle}>recommended</p>
            <p style={styles.panelSubtitle}>
              {loadingRecs ? 'finding matches...' : `${recommendations.length} matches for this playlist`}
            </p>
            {loadingRecs && (
              <p style={styles.empty}>analyzing your playlist vibe...</p>
            )}
            {recommendations.map(song => (
              <SongCard
                key={song.itunes_track_id}
                song={song}
                onAdd={addToPlaylist}
                isAdded={isInPlaylist(song)}
                actionLabel="add"
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
    background: '#f8f8fc',
  },
  content: {
    display: 'grid',
    gridTemplateColumns: '1fr 360px',
    gap: '24px',
    padding: '24px 32px',
    maxWidth: '1200px',
    margin: '0 auto',
  },
  searchSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  searchBar: {
    display: 'flex',
    gap: '8px',
  },
  searchInput: {
    flex: 1,
    height: '48px',
    borderRadius: '12px',
    border: '1.5px solid #E4E4EC',
    padding: '0 20px',
    fontSize: '14px',
    background: '#ffffff',
    color: '#16161A',
  },
  searchBtn: {
    height: '48px',
    padding: '0 24px',
    borderRadius: '12px',
    background: '#5B5FEF',
    color: '#ffffff',
    fontSize: '14px',
    fontWeight: '500',
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
    background: '#ffffff',
    borderRadius: '16px',
    padding: '20px',
    border: '1px solid #ECECEF',
  },
  panelTitle: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#16161A',
    marginBottom: '4px',
  },
  panelSubtitle: {
    fontSize: '12px',
    color: '#9A9AA6',
    marginBottom: '16px',
  },
  playlistName: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#16161A',
    background: 'none',
    border: 'none',
    outline: 'none',
    width: '100%',
    marginBottom: '4px',
  },
  empty: {
    fontSize: '13px',
    color: '#C4C4CC',
    textAlign: 'center',
    padding: '24px 0',
  },
  playlistItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '8px 0',
    borderBottom: '1px solid #F5F5F7',
  },
  smallArt: {
    width: '36px',
    height: '36px',
    borderRadius: '6px',
    objectFit: 'cover',
  },
  itemInfo: {
    flex: 1,
    minWidth: 0,
  },
  itemTitle: {
    fontSize: '13px',
    fontWeight: '500',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    color: '#16161A',
  },
  itemArtist: {
    fontSize: '12px',
    color: '#9A9AA6',
  },
  removeBtn: {
    background: 'none',
    color: '#C4C4CC',
    fontSize: '14px',
    padding: '4px',
    flexShrink: 0,
  },
  toggleRow: {
  display: 'flex',
  gap: '8px',
  marginBottom: '12px',
},
toggleBtn: {
  padding: '8px 20px',
  borderRadius: '999px',
  fontSize: '13px',
  fontWeight: '500',
  border: 'none',
  cursor: 'pointer',
}
}