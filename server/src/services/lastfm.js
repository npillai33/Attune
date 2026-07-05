const axios = require('axios')
const pool = require('../db/index')

const LASTFM_BASE = 'https://ws.audioscrobbler.com/2.0/'

async function getOrFetchSongTags(title, artist, songId) {
  const existing = await pool.query(
    `SELECT t.name, st.weight FROM song_tags st
     JOIN tags t ON t.id = st.tag_id
     WHERE st.song_id = $1`,
    [songId]
  )

  if (existing.rows.length > 0) {
    return existing.rows
  }

  try {
    const res = await axios.get(LASTFM_BASE, {
      params: {
        method: 'track.getTopTags',
        artist,
        track: title,
        api_key: process.env.LASTFM_API_KEY,
        format: 'json'
      }
    })

    const tags = res.data?.toptags?.tag?.slice(0, 10) || []

    for (const tag of tags) {
      const tagName = tag.name.toLowerCase().trim()
      if (!tagName || tag.count < 5) continue

      const tagResult = await pool.query(
        `INSERT INTO tags (name) VALUES ($1)
         ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name
         RETURNING id`,
        [tagName]
      )

      const tagId = tagResult.rows[0].id

      await pool.query(
        `INSERT INTO song_tags (song_id, tag_id, weight)
         VALUES ($1, $2, $3)
         ON CONFLICT (song_id, tag_id) DO NOTHING`,
        [songId, tagId, tag.count]
      )
    }

    return tags.map(t => ({ name: t.name.toLowerCase(), weight: t.count }))
  } catch (err) {
    console.error('Last.fm fetch failed:', err.message)
    return []
  }
}

async function getSimilarTracks(title, artist) {
  try {
    const res = await axios.get(LASTFM_BASE, {
      params: {
        method: 'track.getSimilar',
        artist,
        track: title,
        api_key: process.env.LASTFM_API_KEY,
        format: 'json',
        limit: 20
      }
    })

    return res.data?.similartracks?.track || []
  } catch (err) {
    console.error('Last.fm similar tracks failed:', err.message)
    return []
  }
}

module.exports = { getOrFetchSongTags, getSimilarTracks }