const express = require('express')
const cors = require('cors')
require('dotenv').config()

const app = express()

const authRoutes = require('./routes/auth')
const recommendationRoutes = require('./routes/recommendations')
const playlistRoutes = require('./routes/playlists')

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}))
app.use(express.json())

app.use('/api/auth', authRoutes)
app.use('/api/recommendations', recommendationRoutes)
app.use('/api/playlists', playlistRoutes)

app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Attune API is running' })
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Attune server running on port ${PORT}`)
})