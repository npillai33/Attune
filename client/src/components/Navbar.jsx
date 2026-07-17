import { useAuth } from '../context/AuthContext'
import { useNavigate, Link } from 'react-router-dom'
import Logo from './Logo'

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <div style={styles.nav}>
      <Link to="/home" style={styles.logoLink}>
        <Logo size="nav" />
      </Link>
      <div style={styles.right}>
        <Link to="/playlists" style={styles.playlistsBtn}>
          my playlists
        </Link>
        <div style={styles.divider} />
        <span style={styles.username}>{user?.username}</span>
        <button style={styles.logout} onClick={handleLogout}>log out</button>
      </div>
    </div>
  )
}

const styles = {
  nav: {
    height: '92px',
    borderBottom: '1.5px solid rgba(188,150,230,0.4)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 40px',
    background: 'linear-gradient(90deg, #2A1055 0%, #1A1450 100%)',
    position: 'sticky',
    top: 0,
    zIndex: 10,
    boxShadow: '0 6px 28px rgba(0,0,0,0.45)',
  },
  logoLink: {
    display: 'flex',
    alignItems: 'center',
  },
  right: {
    display: 'flex',
    alignItems: 'center',
    gap: '18px',
  },
  playlistsBtn: {
    fontSize: '17px',
    fontWeight: '600',
    color: '#0F0325',
    background: 'var(--mint)',
    padding: '13px 26px',
    borderRadius: '10px',
    letterSpacing: '0.03em',
    boxShadow: '0 0 16px rgba(127,227,216,0.3)',
  },
  divider: {
    width: '1px',
    height: '26px',
    background: 'rgba(188,150,230,0.25)',
  },
  username: {
    fontSize: '17px',
    fontWeight: '500',
    color: 'var(--text-on-dark)',
  },
  logout: {
    fontSize: '16px',
    fontWeight: '600',
    color: 'var(--bubblegum)',
    background: 'rgba(255,143,199,0.12)',
    padding: '9px 18px',
    borderRadius: '8px',
    border: '1.5px solid rgba(255,143,199,0.45)',
    letterSpacing: '0.02em',
  },
}