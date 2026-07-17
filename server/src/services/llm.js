const Anthropic = require('@anthropic-ai/sdk')

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
})

// Ask the LLM for song suggestions given a list of songs (recommendations)
async function getRecommendationsFromLLM(songs) {
  const songList = songs.map(s => `"${s.title}" by ${s.artist}`).join(', ')

  const prompt = `You are a music recommendation engine. Given this playlist, suggest 15 songs that match the overall vibe, mood, and genre blend of the collection. Consider the playlist as a whole, not just individual songs.

    Playlist: ${songList}

    For each suggestion, include a short reason (max 8 words) explaining why it fits this specific playlist's vibe.

    Return ONLY a JSON array of objects, each with "title", "artist", and "reason" fields. No other text, no markdown, no explanation. Do not suggest songs already in the playlist.

    Example format:
    [{"title": "Song Name", "artist": "Artist Name", "reason": "matches the mellow late-night energy"}]`

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

For each song, include 3 mood/genre tags describing it (single words or short phrases, lowercase).

Return ONLY a JSON array of objects, each with "title", "artist", and "tags" fields. The "tags" field should be an array of 3 strings. No other text, no markdown, no explanation.

Example format:
[{"title": "Song Name", "artist": "Artist Name", "tags": ["upbeat", "pop", "energetic"]}]`

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

// Ask the LLM to design a gradient cover from the playlist's vibe
async function getCoverMoodFromLLM(songs, playlistName = '') {
  const songList = songs.map(s => `"${s.title}" by ${s.artist}`).join(', ')

  const prompt = `You are designing album cover art for a playlist.

Playlist name: ${playlistName || 'untitled'}
Songs: ${songList}

Design a two-color linear gradient that captures the overall mood, energy, and feel of this playlist. Use the full color spectrum — pick whatever colors genuinely fit the vibe. Consider genre, era, and emotional tone.

Return ONLY a JSON object with:
- "color1": hex string like "#1A2B3C" (the gradient start)
- "color2": hex string like "#4D5E6F" (the gradient end)
- "angle": integer 0-360 (gradient direction)
- "name": a 1-2 word evocative name for this gradient, lowercase

No other text, no markdown.

Example: {"color1": "#2E1A47", "color2": "#F76B8A", "angle": 135, "name": "dusk fever"}`

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-5-20250929',
    max_tokens: 200,
    messages: [{ role: 'user', content: prompt }]
  })

  try {
    const cleaned = response.content[0].text.replace(/```json/g, '').replace(/```/g, '').trim()
    const parsed = JSON.parse(cleaned)

    const HEX = /^#[0-9A-Fa-f]{6}$/
    if (!HEX.test(parsed.color1) || !HEX.test(parsed.color2)) {
      return { cover: 'smooth', name: 'smooth' }
    }

    const angle = Number.parseInt(parsed.angle, 10)
    const safeAngle = Number.isFinite(angle) ? Math.max(0, Math.min(360, angle)) : 135

    return {
      cover: `custom:${parsed.color1}:${parsed.color2}:${safeAngle}`,
      name: parsed.name || 'custom',
    }
  } catch (err) {
    console.error('Cover generation parse failed:', err.message)
    return { cover: 'smooth', name: 'smooth' }
  }
}

module.exports = { getRecommendationsFromLLM, getVibeSearchFromLLM, getCoverMoodFromLLM }