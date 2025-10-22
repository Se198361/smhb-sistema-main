import { useEffect, useState } from 'react'
import { getJson, postJson, setAuthToken } from '../lib/api'
import { AuthContext } from './authContext'

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const devBypass = import.meta.env.VITE_DEV_AUTH_BYPASS === 'true'
    if (devBypass) {
      setUser({ id: 'dev-user', email: 'dev@example.com', nome: 'Dev' })
      setLoading(false)
      return
    }

    const token = localStorage.getItem('token')
    if (token) {
      setAuthToken(token)
      getJson('/api/auth/me')
        .then(({ user }) => setUser(user))
        .catch(() => {
          localStorage.removeItem('token')
          setAuthToken(null)
          setUser(null)
        })
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [])

  async function login(email, password) {
    const { token, user } = await postJson('/api/auth/login', { email, password })
    localStorage.setItem('token', token)
    setAuthToken(token)
    setUser(user)
    return user
  }

  async function register(nome, email, password) {
    const { token, user } = await postJson('/api/auth/register', { nome, email, password })
    localStorage.setItem('token', token)
    setAuthToken(token)
    setUser(user)
    return user
  }

  async function signOut() {
    localStorage.removeItem('token')
    setAuthToken(null)
    setUser(null)
  }

  const value = { user, loading, login, register, signOut }
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}