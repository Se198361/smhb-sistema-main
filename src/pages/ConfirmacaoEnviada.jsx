import { Link } from 'react-router-dom'

export default function ConfirmacaoEnviada() {
  return (
    <div className="max-w-lg mx-auto card">
      <h1 className="font-montserrat text-2xl font-bold mb-3 text-primary dark:text-light">Confirmação enviada</h1>
      <p className="mb-2 text-gray-800 dark:text-gray-200">
        Enviamos um e-mail de confirmação para o endereço informado.
      </p>
      <ul className="list-disc ml-5 space-y-1 text-gray-700 dark:text-gray-300">
        <li>Abra sua caixa de entrada e clique no link de confirmação.</li>
        <li>Se não encontrar, verifique a pasta de spam ou promoções.</li>
        <li>Após confirmar, acesse a página de Login para entrar.</li>
      </ul>
      <div className="mt-4 flex gap-3">
        <Link to="/login" className="btn-neon">Ir para Login</Link>
        <a href="mailto:" className="soft-link">Alterar e-mail</a>
      </div>
      <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
        Caso não receba o e-mail, confirme manualmente no painel do Supabase (Authentication → Users) ou reenvie a confirmação pela página de Login.
      </div>
    </div>
  )
}