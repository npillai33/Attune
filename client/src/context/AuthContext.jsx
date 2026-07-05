import { createContext, useContext, useState } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('attune_user')
    return stored ? JSON.parse(stored) : null
  })

  const [token, setToken] = useState(() => {
    return localStorage.getItem('attune_token') || null
  })

  const login = (userData, tokenData) => {
    setUser(userData)
    setToken(tokenData)
    localStorage.setItem('attune_user', JSON.stringify(userData))
    localStorage.setItem('attune_token', tokenData)
  }

  const logout = () => {
    setUser(null)
    setToken(null)
    localStorage.removeItem('attune_user')
    localStorage.removeItem('attune_token')
  }

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}