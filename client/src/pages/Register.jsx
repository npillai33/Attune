import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'
import Logo from '../components/Logo'
import BackgroundNotes from '../components/BackgroundNotes'

export default function Register() {
  const [form, setForm] = useState({ email: '', username: '', password: '' })
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const res = await axios.post('http://localhost:3001/api/auth/register', form)
      login(res.data.user, res.data.token)
      navigate('/home')
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={styles.page}>
      <BackgroundNotes />
      <div style={styles.card}>
        <div style={styles.logoWrap}>
          <Logo size="nav" />
        </div>
        <h2 style={styles.subtitle}>create your account</h2>

        {error && <div style={styles.error}>{error}</div>}

        <div style={styles.form}>
          <input
            style={styles.input}
            type="email"
            name="email"
            placeholder="email"
            value={form.email}
            onChange={handleChange}
          />
          <input
            style={styles.input}
            type="text"
            name="username"
            placeholder="username"
            value={form.username}
            onChange={handleChange}
          />
          <input
            style={styles.input}
            type="password"
            name="password"
            placeholder="password"
            value={form.password}
            onChange={handleChange}
            onKeyDown={e => e.key === 'Enter' && handleSubmit(e)}
          />
          <button
            style={{ ...styles.button, opacity: loading ? 0.6 : 1 }}
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? 'creating account...' : 'create account'}
          </button>
        </div>

        <p style={styles.switch}>
          already have an account?{' '}
          <Link to="/login" style={styles.link}>log in</Link>
        </p>
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
  card: {
    position: 'relative',
    zIndex: 1,
    background: 'var(--glass-bg)',
    backdropFilter: 'blur(16px) saturate(1.6)',
    WebkitBackdropFilter: 'blur(16px) saturate(1.6)',
    borderRadius: '22px',
    padding: '40px',
    width: '100%',
    maxWidth: '440px',
    border: '1px solid var(--glass-border)',
    boxShadow: 'var(--glass-sheen)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    overflow: 'hidden',
  },
  logoWrap: {
    marginBottom: '4px',
  },
  subtitle: {
    fontFamily: 'var(--font-display)',
    fontSize: '22px',
    color: 'var(--text-on-glass)',
    marginBottom: '28px',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
    width: '100%',
  },
  input: {
    height: '52px',
    borderRadius: '11px',
    border: '2px solid rgba(26,7,51,0.25)',
    padding: '0 18px',
    fontSize: '17px',
    fontWeight: '400',
    background: 'rgba(255,255,255,0.5)',
    color: 'var(--text-on-glass)',
    width: '100%',
  },
  button: {
    height: '52px',
    borderRadius: '11px',
    background: '#1A0733',
    color: 'var(--mint-bright)',
    fontSize: '18px',
    fontWeight: '600',
    letterSpacing: '0.03em',
    marginTop: '8px',
    boxShadow: '0 3px 14px rgba(26,7,51,0.4)',
  },
  error: {
    background: 'rgba(243,22,81,0.15)',
    color: 'var(--berry-deep)',
    padding: '12px 16px',
    borderRadius: '9px',
    fontSize: '15px',
    fontWeight: '500',
    marginBottom: '16px',
    border: '1.5px solid rgba(243,22,81,0.35)',
    width: '100%',
    textAlign: 'center',
  },
  switch: {
    textAlign: 'center',
    fontSize: '15px',
    fontWeight: '400',
    color: 'var(--text-on-glass-muted)',
    marginTop: '26px',
  },
  link: {
    color: 'var(--berry)',
    fontWeight: '600',
  },
}