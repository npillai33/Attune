import { useNavigate } from 'react-router-dom'

export default function Welcome() {
  const navigate = useNavigate()

  return (
    <div style={styles.page}>
      <div style={styles.hero}>
        <h1 style={styles.logo}>attune</h1>
        <p style={styles.tagline}>
          playlists that build themselves around your vibe
        </p>
        <p style={styles.subtext}>
          add a few songs and get recommendations that match the mood, energy, and feel of your playlist — not just the last song you added.
        </p>

        <div style={styles.buttons}>
          <button style={styles.primaryBtn} onClick={() => navigate('/register')}>
            get started
          </button>
          <button style={styles.secondaryBtn} onClick={() => navigate('/login')}>
            log in
          </button>
        </div>
      </div>
    </div>
  )
}

const styles = {
  page: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#f8f8fc',
    padding: '24px',
  },
  hero: {
    textAlign: 'center',
    maxWidth: '520px',
  },
  logo: {
    fontSize: '56px',
    fontWeight: '700',
    letterSpacing: '-0.04em',
    color: '#5B5FEF',
    marginBottom: '20px',
  },
  tagline: {
    fontSize: '24px',
    fontWeight: '600',
    color: '#16161A',
    marginBottom: '16px',
    letterSpacing: '-0.02em',
    lineHeight: '1.3',
  },
  subtext: {
    fontSize: '16px',
    color: '#6B6B76',
    lineHeight: '1.6',
    marginBottom: '36px',
  },
  buttons: {
    display: 'flex',
    gap: '12px',
    justifyContent: 'center',
  },
  primaryBtn: {
    height: '52px',
    padding: '0 32px',
    borderRadius: '12px',
    background: '#5B5FEF',
    color: '#ffffff',
    fontSize: '15px',
    fontWeight: '600',
  },
  secondaryBtn: {
    height: '52px',
    padding: '0 32px',
    borderRadius: '12px',
    background: '#EFEFFC',
    color: '#5B5FEF',
    fontSize: '15px',
    fontWeight: '600',
  },
}