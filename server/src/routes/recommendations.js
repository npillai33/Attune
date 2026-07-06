const express = require('express')
const axios = require('axios')
const pool = require('../db/index')
const authMiddleware = require('../middleware/auth')
const { getOrFetchSongTags, getSimilarTracks } = require('../services/lastfm')

const router = express.Router()

router.post('/playlist', authMiddleware, async (req, res) => {
  const { songs } = req.body

  if (!songs || songs.length === 0) {
    return res.json({ recommendations: [] })
  }

  try {
    const playlistTagProfile = {}

    for (const song of songs) {
      let songRow = await pool.query(
        'SELECT id FROM songs WHERE itunes_track_id = $1',
        [song.itunes_track_id]
      )

      if (songRow.rows.length === 0) {
        songRow = await pool.query(
          `INSERT INTO songs (itunes_track_id, title, artist, album, artwork_url, preview_url, spotify_search_url)
           VALUES ($1, $2, $3, $4, $5, $6, $7)
           RETURNING id`,
          [song.itunes_track_id, song.title, song.artist, song.album,
           song.artwork_url, song.preview_url, song.spotify_search_url]
        )
      }

      const songId = songRow.rows[0].id
      const tags = await getOrFetchSongTags(song.title, song.artist, songId)

      for (const tag of tags) {
        const name = tag.name.toLowerCase().trim()
        playlistTagProfile[name] = (playlistTagProfile[name] || 0) + Number(tag.weight)
      }
    }

    if (Object.keys(playlistTagProfile).length === 0) {
      return res.json({ recommendations: [] })
    }

    const allSimilarTracks = []
    for (const song of songs) {
      const similar = await getSimilarTracks(song.title, song.artist)
      allSimilarTracks.push(...similar)
    }

    const seen = new Set()
    const candidates = allSimilarTracks
      .filter(track => {
        const key = `${track.name}-${track.artist.name}`.toLowerCase()
        if (seen.has(key)) return false
        seen.add(key)
        return true
      })
      .filter(track => !songs.find(s =>
        s.title.toLowerCase() === track.name.toLowerCase() &&
        s.artist.toLowerCase() === track.artist.name.toLowerCase()
      ))
      .slice(0, 20)

    const scored = []

    for (const track of candidates) {
      const searchRes = await axios.get('https://itunes.apple.com/search', {
        params: {
          term: `${track.name} ${track.artist.name}`,
          media: 'music',
          limit: 1
        }
      })

      const result = searchRes.data.results[0]
      if (!result) continue

      const candidate = {
        itunes_track_id: String(result.trackId),
        title: result.trackName,
        artist: result.artistName,
        album: result.collectionName,
        artwork_url: result.artworkUrl100,
        preview_url: result.previewUrl,
        spotify_search_url: `https://open.spotify.com/search/${encodeURIComponent(result.trackName + ' ' + result.artistName)}`
      }

      let candidateRow = await pool.query(
        'SELECT id FROM songs WHERE itunes_track_id = $1',
        [candidate.itunes_track_id]
      )

      if (candidateRow.rows.length === 0) {
        candidateRow = await pool.query(
          `INSERT INTO songs (itunes_track_id, title, artist, album, artwork_url, preview_url, spotify_search_url)
           VALUES ($1, $2, $3, $4, $5, $6, $7)
           RETURNING id`,
          [candidate.itunes_track_id, candidate.title, candidate.artist,
           candidate.album, candidate.artwork_url, candidate.preview_url,
           candidate.spotify_search_url]
        )
      }

      const candidateId = candidateRow.rows[0].id
      const candidateTags = await getOrFetchSongTags(candidate.title, candidate.artist, candidateId)

      const candidateProfile = {}
      for (const tag of candidateTags) {
        candidateProfile[tag.name.toLowerCase().trim()] = Number(tag.weight)
      }

      const score = cosineSimilarity(playlistTagProfile, candidateProfile)
      scored.push({ ...candidate, score })
    }

    scored.sort((a, b) => b.score - a.score)
    res.json({ recommendations: scored.slice(0, 6) })

  } catch (err) {
    console.error('Recommendation error:', err)
    res.status(500).json({ error: 'Failed to get recommendations' })
  }
})

function cosineSimilarity(vecA, vecB) {
  const keys = new Set([...Object.keys(vecA), ...Object.keys(vecB)])
  let dot = 0, magA = 0, magB = 0

  for (const key of keys) {
    const a = vecA[key] || 0
    const b = vecB[key] || 0
    dot += a * b
    magA += a * a
    magB += b * b
  }

  if (magA === 0 || magB === 0) return 0
  return dot / (Math.sqrt(magA) * Math.sqrt(magB))
}

module.exports = router