const axios = require('axios')

const delay = ms => new Promise(resolve => setTimeout(resolve, ms))

// Takes LLM suggestions [{title, artist}] and verifies each on iTunes
// Returns full song objects with artwork, preview, etc.
async function verifySongsOnItunes(suggestions) {
  const verified = []
  const seen = new Set()

  for (const suggestion of suggestions) {
    try {
      // Small delay between calls to avoid rate limiting
      await delay(120)

      const res = await axios.get('https://itunes.apple.com/search', {
        params: {
          term: `${suggestion.title} ${suggestion.artist}`,
          media: 'music',
          entity: 'song',
          limit: 1
        }
      })

      const result = res.data.results?.[0]
      if (!result) continue

      const key = String(result.trackId)
      if (seen.has(key)) continue
      seen.add(key)

      verified.push({
        itunes_track_id: key,
        title: result.trackName,
        artist: result.artistName,
        album: result.collectionName,
        artwork_url: result.artworkUrl100,
        preview_url: result.previewUrl,
        spotify_search_url: `https://open.spotify.com/search/${encodeURIComponent(result.trackName + ' ' + result.artistName)}`
      })
    } catch (err) {
      console.error(`iTunes verify failed for ${suggestion.title}:`, err.message)
    }
  }

  return verified
}

module.exports = { verifySongsOnItunes }