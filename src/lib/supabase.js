import { createClient } from '@supabase/supabase-js'

// Espera chaves em .env: VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

let supabase

if (typeof supabaseUrl === 'string' && supabaseUrl && typeof supabaseAnonKey === 'string' && supabaseAnonKey) {
  // Configurar o cliente Supabase com schema explícito 'public' e parâmetros adicionais de autenticação
  supabase = createClient(supabaseUrl, supabaseAnonKey, {
    db: {
      schema: 'public'
    },
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true
    }
  })
} else {
  if (import.meta.env.VITE_DEBUG_LOGS === 'true') console.warn('Supabase: variáveis de ambiente ausentes. Usando cliente mock para evitar falhas.')
  const mockAuth = {
    getSession: async () => ({ data: { session: null }, error: null }),
    onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
    signInWithPassword: async () => ({ data: null, error: new Error('Supabase não configurado') }),
    signUp: async () => ({ data: null, error: new Error('Supabase não configurado') }),
    signOut: async () => ({ error: null }),
    resetPasswordForEmail: async () => ({ data: null, error: new Error('Supabase não configurado') }),
  }
  const mockStorage = {
    from: () => ({
      list: async () => ({ data: [], error: null }),
      download: async () => ({ data: null, error: new Error('Supabase não configurado') }),
      upload: async () => ({ data: null, error: new Error('Supabase não configurado') }),
      remove: async () => ({ data: null, error: new Error('Supabase não configurado') }),
      getPublicUrl: () => ({ data: { publicUrl: '' }, error: new Error('Supabase não configurado') }),
    }),
  }
  // manter apenas auth para que páginas detectem ausência de supabase.from
  supabase = { auth: mockAuth, storage: mockStorage }
}

export { supabase }