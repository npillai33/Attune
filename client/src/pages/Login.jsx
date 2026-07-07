import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' })
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
      const res = await axios.post('http://localhost:3001/api/auth/login', form)
      login(res.data.user, res.data.token)
      navigate('/home')
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.logo}>attune</h1>
        <p style={styles.subtitle}>welcome back</p>

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
            type="password"
            name="password"
            placeholder="password"
            value={form.password}
            onChange={handleChange}
          />
          <button
            style={styles.button}
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? 'logging in...' : 'log in'}
          </button>
        </div>

        <p style={styles.switch}>
          don't have an account?{' '}
          <Link to="/register" style={styles.link}>sign up</Link>
        </p>
      </div>
    </div>
  )
}

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#f8f8fc',
  },
  card: {
    background: '#ffffff',
    borderRadius: '16px',
    padding: '48px 40px',
    width: '100%',
    maxWidth: '400px',
    border: '1px solid #ECECEF',
  },
  logo: {
    fontSize: '28px',
    fontWeight: '600',
    letterSpacing: '-0.03em',
    color: '#5B5FEF',
    marginBottom: '8px',
  },
  subtitle: {
    fontSize: '14px',
    color: '#9A9AA6',
    marginBottom: '32px',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  input: {
    height: '48px',
    borderRadius: '10px',
    border: '1.5px solid #E4E4EC',
    padding: '0 16px',
    fontSize: '14px',
    background: '#FAFAFC',
    color: '#16161A',
    width: '100%',
    boxSizing: 'border-box',
  },
  button: {
    height: '48px',
    borderRadius: '10px',
    background: '#5B5FEF',
    color: '#ffffff',
    fontSize: '14px',
    fontWeight: '500',
    marginTop: '8px',
  },
  error: {
    background: '#FEF2F2',
    color: '#B91C1C',
    padding: '12px 16px',
    borderRadius: '8px',
    fontSize: '13px',
    marginBottom: '16px',
  },
  switch: {
    textAlign: 'center',
    fontSize: '13px',
    color: '#9A9AA6',
    marginTop: '24px',
  },
  link: {
    color: '#5B5FEF',
    fontWeight: '500',
  },
}