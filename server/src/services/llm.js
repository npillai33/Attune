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

// Ask the LLM to pick a mood cover for a playlist based on its songs
async function getCoverMoodFromLLM(songs) {
  const songList = songs.map(s => `"${s.title}" by ${s.artist}`).join(', ')
  const moods = ['euphoria', 'dreamy', 'moody', 'upbeat', 'smooth', 'electric', 'mellow', 'soulful', 'hype', 'dark']

  const prompt = `Given this playlist, pick the single mood that best represents its overall vibe.

Playlist: ${songList}

Choose exactly ONE from this list: ${moods.join(', ')}

Return ONLY the single mood word, nothing else. No punctuation, no explanation.`

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-5-20250929',
    max_tokens: 20,
    messages: [{ role: 'user', content: prompt }]
  })

  const mood = response.content[0].text.trim().toLowerCase()
  return moods.includes(mood) ? mood : 'smooth'
}

module.exports = { getRecommendationsFromLLM, getVibeSearchFromLLM, getCoverMoodFromLLM }