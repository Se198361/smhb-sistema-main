import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { postJson } from '../lib/api'

export default function RedefinirSenha() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const [token, setToken] = useState('')
  const [password, setPassword] = useState('')
  const [password2, setPassword2] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [ok, setOk] = useState(false)

  useEffect(() => {
    const t = params.get('token')
    if (t) setToken(t)
  }, [params])

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (!token) {
      setError('Token ausente. Solicite novamente a redefinição.')
      return
    }
    if (!password || password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres')
      return
    }
    if (password !== password2) {
      setError('As senhas não coincidem')
      return
    }
    setLoading(true)
    try {
      const res = await postJson('/api/auth/reset/confirm', { token, newPassword: password })
      if (res?.ok) {
        setOk(true)
        setTimeout(() => navigate('/login'), 2000)
      } else {
        setError(res?.error || 'Falha ao redefinir senha')
      }
    } catch (err) {
      setError(err?.message || 'Erro ao redefinir senha')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto card">
      <h1 className="font-montserrat text-2xl font-bold mb-4 text-primary dark:text-light">Redefinir senha</h1>
      {!token && (
        <p className="text-sm mb-3">Nenhum token encontrado. <Link className="soft-link" to="/login">Voltar ao login</Link></p>
      )}
      {ok ? (
        <p className="text-green-600 dark:text-green-400">Senha redefinida com sucesso! Redirecionando...</p>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1 dark:text-gray-200">Nova senha</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required className="w-full" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 dark:text-gray-200">Confirmar senha</label>
            <input type="password" value={password2} onChange={e => setPassword2(e.target.value)} required className="w-full" />
          </div>
          {error && <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>}
          <button disabled={loading} className="w-full btn-neon">
            {loading ? 'Redefinindo...' : 'Redefinir senha'}
          </button>
        </form>
      )}
    </div>
  )
}