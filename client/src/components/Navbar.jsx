import { useAuth } from '../context/AuthContext'
import { useNavigate, Link } from 'react-router-dom'

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div style={styles.nav}>
      <div style={styles.logo}>attune</div>
      <div style={styles.right}>
        <Link to="/playlists" style={styles.navLink}>my playlists</Link>
        <span style={styles.username}>{user?.username}</span>
        <button style={styles.logout} onClick={handleLogout}>log out</button>
      </div>
    </div>
  )
}

const styles = {
  nav: {
    height: '60px',
    borderBottom: '1px solid #ECECEF',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 32px',
    background: '#ffffff',
    position: 'sticky',
    top: 0,
    zIndex: 10,
  },
  logo: {
    fontSize: '20px',
    fontWeight: '600',
    letterSpacing: '-0.03em',
    color: '#5B5FEF',
  },
  right: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },
  username: {
    fontSize: '14px',
    color: '#6B6B76',
  },
  logout: {
    fontSize: '13px',
    color: '#9A9AA6',
    background: 'none',
    padding: '6px 12px',
    borderRadius: '8px',
    border: '1px solid #ECECEF',
  }
}