const express = require('express')
const authMiddleware = require('../middleware/auth')
const { getRecommendationsFromLLM } = require('../services/llm')
const { verifySongsOnItunes } = require('../services/itunes')

const router = express.Router()

router.post('/playlist', authMiddleware, async (req, res) => {
  const { songs } = req.body

  if (!songs || songs.length === 0) {
    return res.json({ recommendations: [] })
  }

  try {
    // Step 1: ask the LLM for song suggestions based on the whole playlist
    const suggestions = await getRecommendationsFromLLM(songs)

    if (suggestions.length === 0) {
      return res.json({ recommendations: [] })
    }

    // Step 2: verify each suggestion on iTunes to get playable data
    const verified = await verifySongsOnItunes(suggestions)

    // Step 3: filter out any songs already in the playlist
    const playlistIds = new Set(songs.map(s => s.itunes_track_id))
    const recommendations = verified.filter(s => !playlistIds.has(s.itunes_track_id))

    res.json({ recommendations })

  } catch (err) {
    console.error('Recommendation error:', err)
    res.status(500).json({ error: 'Failed to get recommendations' })
  }
})

module.exports = router