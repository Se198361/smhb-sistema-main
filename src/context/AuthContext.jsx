import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { AuthContext } from './authContext'
import { registerUser, loginUser, getCurrentUser, logoutUser } from '../lib/supabaseFunctions'

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Bypass de desenvolvimento desativado: sempre exigir autenticação real

    // Verificar sessão atual
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (session) {
          const userData = await getCurrentUser()
          setUser(userData)
        }
      } catch (error) {
        console.error('Erro ao verificar sessão:', error)
      } finally {
        setLoading(false)
      }
    }

    checkSession()

    // Escutar mudanças na autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        getCurrentUser().then(userData => {
          setUser(userData)
        }).catch(error => {
          console.error('Erro ao buscar usuário:', error)
          setUser(null)
        })
      } else {
        setUser(null)
      }
      setLoading(false)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  async function login(email, password) {
    try {
      const result = await loginUser(email, password)
      setUser(result.user)
      return result.user
    } catch (error) {
      throw error
    }
  }

  async function register(nome, email, password) {
    try {
      const result = await registerUser(nome, email, password)
      // Não autenticar aqui; aguardamos confirmação e primeiro login
      return result
    } catch (error) {
      throw error
    }
  }

  async function signOut() {
    try {
      await logoutUser()
      setUser(null)
    } catch (error) {
      console.error('Erro ao fazer logout:', error)
    }
  }

  const value = { user, loading, login, register, signOut }
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}