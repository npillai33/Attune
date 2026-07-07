const Anthropic = require('@anthropic-ai/sdk')

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
})

// Ask the LLM for song suggestions given a list of songs (recommendations)
async function getRecommendationsFromLLM(songs) {
  const songList = songs.map(s => `"${s.title}" by ${s.artist}`).join(', ')

  const prompt = `You are a music recommendation engine. Given this playlist, suggest 12 songs that match the overall vibe, mood, and genre blend of the collection. Consider the playlist as a whole, not just individual songs.

Playlist: ${songList}

Return ONLY a JSON array of objects, each with "title" and "artist" fields. No other text, no markdown, no explanation. Do not suggest songs already in the playlist.

Example format:
[{"title": "Song Name", "artist": "Artist Name"}]`

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-5-20250929',
    max_tokens: 1024,
    messages: [{ role: 'user', content: prompt }]
  })

  return parseSongJSON(response.content[0].text)
}

// Ask the LLM for songs matching a free-text vibe (vibe search)
async function getVibeSearchFromLLM(vibe) {
  const prompt = `You are a music discovery engine. A user is searching for songs matching this vibe or mood: "${vibe}"

Suggest 15 real, popular songs that match this vibe. Include a mix of well-known and slightly deeper cuts, all real songs that exist.

Return ONLY a JSON array of objects, each with "title" and "artist" fields. No other text, no markdown, no explanation.

Example format:
[{"title": "Song Name", "artist": "Artist Name"}]`

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-5-20250929',
    max_tokens: 1024,
    messages: [{ role: 'user', content: prompt }]
  })

  return parseSongJSON(response.content[0].text)
}

// Safely parse the LLM's JSON response
function parseSongJSON(text) {
  try {
    // Strip any markdown code fences if present
    const cleaned = text.replace(/```json/g, '').replace(/```/g, '').trim()
    const parsed = JSON.parse(cleaned)
    if (!Array.isArray(parsed)) return []
    return parsed.filter(s => s.title && s.artist)
  } catch (err) {
    console.error('Failed to parse LLM response:', err.message)
    console.error('Raw response:', text)
    return []
  }
}

module.exports = { getRecommendationsFromLLM, getVibeSearchFromLLM }