const express = require('express')
const axios = require('axios')
const authMiddleware = require('../middleware/auth')

const router = express.Router()

router.post('/search', authMiddleware, async (req, res) => {
  const { vibe } = req.body

  if (!vibe) {
    return res.status(400).json({ error: 'Vibe is required' })
  }

  try {
    const words = vibe.toLowerCase().trim().split(/\s+/)

    // Step 1: get top artists for each tag word from Last.fm
    const artistNames = new Set()

    for (const word of words) {
      try {
        const tagRes = await axios.get('https://ws.audioscrobbler.com/2.0/', {
          params: {
            method: 'tag.getTopArtists',
            tag: word,
            api_key: process.env.LASTFM_API_KEY,
            format: 'json',
            limit: 8
          }
        })

        const artists = tagRes.data?.topartists?.artist || []
        artists.forEach(a => artistNames.add(a.name))
      } catch (err) {
        console.error(`Last.fm tag artists failed for ${word}:`, err.message)
      }
    }

    if (artistNames.size === 0) {
      // fallback: search iTunes directly with the vibe phrase
      const fallback = await axios.get('https://itunes.apple.com/search', {
        params: {
          term: vibe,
          media: 'music',
          limit: 12
        }
      })

      const results = fallback.data.results.map(track => ({
        itunes_track_id: String(track.trackId),
        title: track.trackName,
        artist: track.artistName,
        album: track.collectionName,
        artwork_url: track.artworkUrl100,
        preview_url: track.previewUrl,
        spotify_search_url: `https://open.spotify.com/search/${encodeURIComponent(track.trackName + ' ' + track.artistName)}`
      }))

      return res.json({ results })
    }

    // Step 2: for each artist, search iTunes for their songs
    const results = []
    const seenTracks = new Set()

    for (const artistName of [...artistNames].slice(0, 10)) {
      try {
        const itunesRes = await axios.get('https://itunes.apple.com/search', {
          params: {
            term: artistName,
            media: 'music',
            entity: 'song',
            limit: 3,
            sort: 'popular'
          }
        })

        for (const track of itunesRes.data.results) {
          const key = `${track.trackName}-${track.artistName}`.toLowerCase()
          if (seenTracks.has(key)) continue
          seenTracks.add(key)

          results.push({
            itunes_track_id: String(track.trackId),
            title: track.trackName,
            artist: track.artistName,
            album: track.collectionName,
            artwork_url: track.artworkUrl100,
            preview_url: track.previewUrl,
            spotify_search_url: `https://open.spotify.com/search/${encodeURIComponent(track.trackName + ' ' + track.artistName)}`
          })
        }
      } catch (err) {
        console.error(`iTunes search failed for ${artistName}:`, err.message)
      }
    }

    res.json({ results: results.slice(0, 15) })
  } catch (err) {
    console.error('Vibe search error:', err)
    res.status(500).json({ error: 'Vibe search failed' })
  }
})

module.exports = router