import { useState } from 'react'
import { useAuth } from '../context/authContext'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(email, password)
      navigate('/dashboard')
    } catch (err) {
      const msg = err?.message || 'Falha ao entrar'
      if (msg.toLowerCase().includes('email not confirmed')) {
        setError('Seu e-mail não está confirmado. Reenvie a confirmação ou confirme pelo link enviado.')
      } else {
        setError(msg)
      }
    } finally {
      setLoading(false)
    }
  }

  async function handleResendConfirmation() {
    setError('')
    if (!email) {
      setError('Informe seu e-mail para reenviar a confirmação.')
      return
    }
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email,
        options: { emailRedirectTo: window.location.origin + '/login' }
      })
      if (error) throw error
      alert('Se o e-mail existir, reenviamos o link de confirmação.')
    } catch (err) {
      setError(err?.message || 'Falha ao reenviar confirmação')
    }
  }

  return (
    <div className="max-w-md mx-auto card">
      <h1 className="font-montserrat text-2xl font-bold mb-4 text-primary dark:text-light">Entrar</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1 dark:text-gray-200">E-mail</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} required className="w-full" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1 dark:text-gray-200">Senha</label>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} required className="w-full" />
        </div>
        {error && <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>}
        <button disabled={loading} className="w-full btn-neon">
          {loading ? 'Entrando...' : 'Entrar'}
        </button>
        <div className="flex justify-between text-sm mt-2">
          <button type="button" onClick={handleResendConfirmation} className="soft-link">Reenviar confirmação</button>
          <a href="/cadastro" className="soft-link">Criar conta</a>
        </div>
      </form>
    </div>
  )
}