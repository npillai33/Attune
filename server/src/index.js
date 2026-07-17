const express = require('express')
const cors = require('cors')
require('dotenv').config()

const app = express()

const authRoutes = require('./routes/auth')
const recommendationRoutes = require('./routes/recommendations')
const playlistRoutes = require('./routes/playlists')
const vibeRoutes = require('./routes/vibe')

const allowedOrigins = [
  'http://localhost:5173',
  process.env.CLIENT_URL,
].filter(Boolean)

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true)
    if (allowedOrigins.includes(origin)) return callback(null, true)
    callback(new Error('Not allowed by CORS'))
  },
  credentials: true
}))

app.use(express.json())

app.use('/api/auth', authRoutes)
app.use('/api/recommendations', recommendationRoutes)
app.use('/api/playlists', playlistRoutes)
app.use('/api/vibe', vibeRoutes)

app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Attune API is running' })
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Attune server running on port ${PORT}`)
})