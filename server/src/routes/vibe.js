const express = require('express')
const authMiddleware = require('../middleware/auth')
const { getVibeSearchFromLLM } = require('../services/llm')
const { verifySongsOnItunes } = require('../services/itunes')

const router = express.Router()

router.post('/search', authMiddleware, async (req, res) => {
  const { vibe } = req.body

  if (!vibe) {
    return res.status(400).json({ error: 'Vibe is required' })
  }

  try {
    // Step 1: ask the LLM for songs matching the vibe
    const suggestions = await getVibeSearchFromLLM(vibe)

    if (suggestions.length === 0) {
      return res.json({ results: [] })
    }

    // Step 2: verify each on iTunes for playable data
    const results = await verifySongsOnItunes(suggestions)

    console.log('Vibe results with tags:', JSON.stringify(results.slice(0, 2), null, 2))

    res.json({ results })

  } catch (err) {
    console.error('Vibe search error:', err)
    res.status(500).json({ error: 'Vibe search failed' })
  }
})

module.exports = router