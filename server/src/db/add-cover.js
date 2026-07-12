const pool = require('./index')

async function migrate() {
  try {
    await pool.query(`
      ALTER TABLE playlists
      ADD COLUMN IF NOT EXISTS cover TEXT
    `)
    console.log('✓ Cover column added successfully')
    process.exit(0)
  } catch (err) {
    console.error('Migration failed:', err)
    process.exit(1)
  }
}

migrate()