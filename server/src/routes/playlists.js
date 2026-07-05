const express = require('express')
const pool = require('../db/index')
const authMiddleware = require('../middleware/auth')

const router = express.Router()

// Get all playlists for logged in user
router.get('/', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT p.id, p.name, p.created_at,
        COUNT(ps.song_id) as song_count
       FROM playlists p
       LEFT JOIN playlist_songs ps ON ps.playlist_id = p.id
       WHERE p.user_id = $1
       GROUP BY p.id
       ORDER BY p.created_at DESC`,
      [req.user.userId]
    )
    res.json({ playlists: result.rows })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to fetch playlists' })
  }
})

// Get a single playlist with its songs
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const playlist = await pool.query(
      'SELECT * FROM playlists WHERE id = $1 AND user_id = $2',
      [req.params.id, req.user.userId]
    )

    if (playlist.rows.length === 0) {
      return res.status(404).json({ error: 'Playlist not found' })
    }

    const songs = await pool.query(
      `SELECT s.*, ps.position FROM songs s
       JOIN playlist_songs ps ON ps.song_id = s.id
       WHERE ps.playlist_id = $1
       ORDER BY ps.position ASC`,
      [req.params.id]
    )

    res.json({ playlist: playlist.rows[0], songs: songs.rows })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to fetch playlist' })
  }
})

// Create or update a playlist with songs
router.post('/', authMiddleware, async (req, res) => {
  const { name, songs } = req.body

  if (!name || !songs || songs.length === 0) {
    return res.status(400).json({ error: 'Name and songs are required' })
  }

  try {
    // Create the playlist
    const playlistResult = await pool.query(
      `INSERT INTO playlists (user_id, name)
       VALUES ($1, $2)
       RETURNING *`,
      [req.user.userId, name]
    )

    const playlist = playlistResult.rows[0]

    // Save each song and link to playlist
    for (let i = 0; i < songs.length; i++) {
      const song = songs[i]

      // Upsert song into songs table
      const songResult = await pool.query(
        `INSERT INTO songs (itunes_track_id, title, artist, album, artwork_url, preview_url, spotify_search_url)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         ON CONFLICT (itunes_track_id) DO UPDATE SET title = EXCLUDED.title
         RETURNING id`,
        [song.itunes_track_id, song.title, song.artist, song.album,
         song.artwork_url, song.preview_url, song.spotify_search_url]
      )

      const songId = songResult.rows[0].id

      // Link song to playlist with position
      await pool.query(
        `INSERT INTO playlist_songs (playlist_id, song_id, position)
         VALUES ($1, $2, $3)
         ON CONFLICT DO NOTHING`,
        [playlist.id, songId, i]
      )
    }

    res.status(201).json({ playlist })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to save playlist' })
  }
})

// Delete a playlist
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    await pool.query(
      'DELETE FROM playlists WHERE id = $1 AND user_id = $2',
      [req.params.id, req.user.userId]
    )
    res.json({ message: 'Playlist deleted' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to delete playlist' })
  }
})

module.exports = router