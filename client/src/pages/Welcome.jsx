import { useNavigate } from 'react-router-dom'
import Logo from '../components/Logo'
import BackgroundNotes from '../components/BackgroundNotes'

export default function Welcome() {
  const navigate = useNavigate()

  return (
    <div style={styles.page}>
      <BackgroundNotes />
      <div style={styles.hero}>
        <Logo size="large" />

        <h1 style={styles.tagline}>
          playlists that build themselves around your vibe
        </h1>
        <p style={styles.subtext}>
          add a few songs and get recommendations that match the mood, energy, and feel of your whole playlist — not just the last song you added.
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
    background: 'var(--bg)',
    padding: '24px',
    position: 'relative',
  },
  hero: {
    textAlign: 'center',
    maxWidth: '620px',
    position: 'relative',
    zIndex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  tagline: {
    fontFamily: 'var(--font-display)',
    fontSize: '32px',
    color: 'var(--text-on-dark)',
    marginTop: '32px',
    marginBottom: '20px',
    lineHeight: '1.35',
    textShadow: '0 0 28px rgba(188,150,230,0.45)',
  },
  subtext: {
    fontSize: '19px',
    fontWeight: '300',
    color: 'var(--text-on-dark-muted)',
    lineHeight: '1.65',
    marginBottom: '42px',
  },
  buttons: {
    display: 'flex',
    gap: '14px',
    justifyContent: 'center',
  },
  primaryBtn: {
    height: '58px',
    padding: '0 40px',
    borderRadius: '12px',
    background: 'var(--mint)',
    color: '#0F0325',
    fontFamily: 'var(--font-display)',
    fontSize: '16px',
    letterSpacing: '0.02em',
    boxShadow: '0 0 30px rgba(127,227,216,0.5)',
  },
  secondaryBtn: {
    height: '58px',
    padding: '0 40px',
    borderRadius: '12px',
    background: 'transparent',
    color: 'var(--bubblegum)',
    fontFamily: 'var(--font-display)',
    fontSize: '16px',
    letterSpacing: '0.02em',
    border: '2px solid rgba(255,143,199,0.55)',
  },
}