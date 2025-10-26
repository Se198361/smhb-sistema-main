import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/authContext'

export default function Cadastro() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')
  const [loading, setLoading] = useState(false)
  const { register } = useAuth()
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setInfo('')
    setLoading(true)
    try {
      const result = await register(name, email, password)
      // Orientar usuário a confirmar e usar Login
      setInfo('Cadastro iniciado. Enviamos a confirmação para seu e-mail. Após confirmar, acesse Login. Você também pode usar "Reenviar confirmação".')
      // Redirecionar para página de confirmação enviada
      navigate('/confirmacao-enviada')
    } catch (err) {
      const msg = err?.message || 'Falha ao cadastrar'
      // Mensagem amigável quando e-mail já existe
      if (msg.toLowerCase().includes('e-mail já cadastrado') || msg.toLowerCase().includes('already registered')) {
        setError('E-mail já cadastrado. Vá para Login e use "Reenviar confirmação".')
      } else {
        setError(msg)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto card">
      <h1 className="font-montserrat text-2xl font-bold mb-4 text-primary dark:text-light">Cadastro</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1 dark:text-gray-200">Nome</label>
          <input type="text" value={name} onChange={e => setName(e.target.value)} required className="w-full" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1 dark:text-gray-200">E-mail</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} required className="w-full" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1 dark:text-gray-200">Senha</label>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} required className="w-full" />
        </div>
        {error && <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>}
        {info && <p className="text-blue-600 dark:text-blue-400 text-sm">{info}</p>}
        <button disabled={loading} className="w-full btn-neon">
          {loading ? 'Cadastrando...' : 'Cadastrar'}
        </button>
      </form>
      <div className="mt-3 text-center text-sm">
        <span className="text-gray-700 dark:text-gray-300">Já tem cadastro? </span>
        <Link to="/login" className="soft-link">Entrar</Link>
      </div>
    </div>
  )
}