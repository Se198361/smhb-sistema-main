import { supabase } from './supabase'
import * as supabaseFunctions from './supabaseFunctions'

let AUTH_TOKEN = null

export function setAuthToken(token) {
  AUTH_TOKEN = token || null
}

// Manter as funções de parseError para compatibilidade
async function parseError(res, method, url) {
  let detail = ''
  try {
    const data = await res.json()
    detail = data?.error || data?.message || ''
  } catch { /* ignore parseError JSON parsing */ }
  if (!detail) {
    try { detail = await res.text() } catch { /* ignore parseError text parsing */ }
  }
  const status = res.status
  const statusText = res.statusText || ''
  if (detail && typeof detail === 'string' && detail.trim()) {
    throw new Error(detail)
  }
  if (statusText) {
    throw new Error(`${method} ${url} falhou: ${status} - ${statusText}`)
  }
  throw new Error(`${method} ${url} falhou: ${status}`)
}

// Exportar todas as funções do Supabase
export const api = {
  // Autenticação
  register: supabaseFunctions.registerUser,
  login: supabaseFunctions.loginUser,
  getCurrentUser: supabaseFunctions.getCurrentUser,
  logout: supabaseFunctions.logoutUser,
  
  // Avisos
  getAvisos: supabaseFunctions.getAvisos,
  createAviso: supabaseFunctions.createAviso,
  deleteAviso: supabaseFunctions.deleteAviso,
  
  // Membros
  getMembros: supabaseFunctions.getMembros,
  getMembroById: supabaseFunctions.getMembroById,
  createMembro: supabaseFunctions.createMembro,
  updateMembro: supabaseFunctions.updateMembro,
  deleteMembro: supabaseFunctions.deleteMembro,
  
  // Eventos
  getEventos: supabaseFunctions.getEventos,
  getEventoById: supabaseFunctions.getEventoById,
  createEvento: supabaseFunctions.createEvento,
  updateEvento: supabaseFunctions.updateEvento,
  deleteEvento: supabaseFunctions.deleteEvento,
  
  // Diretoria
  getDiretoria: supabaseFunctions.getDiretoria,
  createDiretor: supabaseFunctions.createDiretor,
  deleteDiretor: supabaseFunctions.deleteDiretor,
  
  // Finanças
  getFinancas: supabaseFunctions.getFinancas,
  getFinancaById: supabaseFunctions.getFinancaById,
  createFinanca: supabaseFunctions.createFinanca,
  deleteFinanca: supabaseFunctions.deleteFinanca,
  deleteFinancasByTipo: supabaseFunctions.deleteFinancasByTipo,
  
  // Conteúdos
  getConteudos: supabaseFunctions.getConteudos,
  getConteudoById: supabaseFunctions.getConteudoById,
  createConteudo: supabaseFunctions.createConteudo,
  updateConteudo: supabaseFunctions.updateConteudo,
  deleteConteudo: supabaseFunctions.deleteConteudo,
  
  // Templates de Crachá
  getTemplates: supabaseFunctions.getTemplates,
  createOrUpdateTemplate: supabaseFunctions.createOrUpdateTemplate,
  
  // Crachás
  getCrachas: supabaseFunctions.getCrachas,
  createCracha: supabaseFunctions.createCracha,
  updateCracha: supabaseFunctions.updateCracha,
  deleteCracha: supabaseFunctions.deleteCracha,
  
  // Embaixadores
  getEmbaixadores: supabaseFunctions.getEmbaixadores,
  createEmbaixador: supabaseFunctions.createEmbaixador,
  updateEmbaixador: supabaseFunctions.updateEmbaixador,
  deleteEmbaixador: supabaseFunctions.deleteEmbaixador
}

// Manter as funções antigas para compatibilidade com páginas existentes
export async function getJson(url, opts = {}) {
  const { signal, headers: extraHeaders, ...rest } = opts || {}
  
  try {
    if (signal?.aborted) {
      const abortErr = new Error('Aborted')
      abortErr.name = 'AbortError'
      throw abortErr
    }
    
    // Mapear URLs para funções do Supabase
    if (url === '/api/auth/me') {
      const user = await supabaseFunctions.getCurrentUser()
      return { user }
    }
    
    if (url.startsWith('/api/avisos')) {
      const params = new URLSearchParams(url.split('?')[1] || '')
      const page = parseInt(params.get('page')) || 1
      const pageSize = parseInt(params.get('pageSize')) || 10
      const q = params.get('q') || ''
      return await supabaseFunctions.getAvisos(page, pageSize, q)
    }
    
    if (url.startsWith('/api/membros')) {
      const match = url.match(/\/api\/membros\/(\d+)/)
      if (match) {
        const id = parseInt(match[1])
        const membro = await supabaseFunctions.getMembroById(id)
        return membro
      }
      
      const params = new URLSearchParams(url.split('?')[1] || '')
      const page = parseInt(params.get('page')) || 1
      const pageSize = parseInt(params.get('pageSize')) || 10
      const q = params.get('q') || ''
      return await supabaseFunctions.getMembros(page, pageSize, q)
    }
    
    if (url.startsWith('/api/eventos')) {
      const match = url.match(/\/api\/eventos\/(\d+)/)
      if (match) {
        const id = parseInt(match[1])
        const evento = await supabaseFunctions.getEventoById(id)
        return evento
      }
      
      const params = new URLSearchParams(url.split('?')[1] || '')
      const page = parseInt(params.get('page')) || 1
      const pageSize = parseInt(params.get('pageSize')) || 10
      const q = params.get('q') || ''
      return await supabaseFunctions.getEventos(page, pageSize, q)
    }
    
    if (url === '/api/diretoria') {
      return await supabaseFunctions.getDiretoria()
    }
    
    if (url.startsWith('/api/financas')) {
      const match = url.match(/\/api\/financas\/(\d+)/)
      if (match) {
        const id = parseInt(match[1])
        const financa = await supabaseFunctions.getFinancaById(id)
        return financa
      }
      
      const params = new URLSearchParams(url.split('?')[1] || '')
      const page = parseInt(params.get('page')) || 1
      const pageSize = parseInt(params.get('pageSize')) || 20
      const tipo = params.get('tipo') || ''
      return await supabaseFunctions.getFinancas(page, pageSize, tipo)
    }
    
    if (url.startsWith('/api/conteudos')) {
      const match = url.match(/\/api\/conteudos\/(\d+)/)
      if (match) {
        const id = parseInt(match[1])
        const conteudo = await supabaseFunctions.getConteudoById(id)
        return conteudo
      }
      
      const params = new URLSearchParams(url.split('?')[1] || '')
      const page = parseInt(params.get('page')) || 1
      const pageSize = parseInt(params.get('pageSize')) || 20
      const q = params.get('q') || ''
      return await supabaseFunctions.getConteudos(page, pageSize, q)
    }
    
    if (url.startsWith('/api/templates')) {
      const params = new URLSearchParams(url.split('?')[1] || '')
      const page = params.get('page') || ''
      const lado = params.get('lado') || ''
      return await supabaseFunctions.getTemplates(page, lado)
    }
    
    if (url.startsWith('/api/crachas')) {
      const params = new URLSearchParams(url.split('?')[1] || '')
      const page = parseInt(params.get('page')) || 1
      const pageSize = parseInt(params.get('pageSize')) || 20
      const origem = params.get('origem') || ''
      return await supabaseFunctions.getCrachas(page, pageSize, origem)
    }
    
    if (url.startsWith('/api/embaixadores')) {
      const match = url.match(/\/api\/embaixadores\/(\d+)/)
      if (match) {
        const id = parseInt(match[1])
        const embaixador = await supabaseFunctions.getEmbaixadorById(id)
        return embaixador
      }
      
      const params = new URLSearchParams(url.split('?')[1] || '')
      const page = parseInt(params.get('page')) || 1
      const pageSize = parseInt(params.get('pageSize')) || 10
      const q = params.get('q') || ''
      return await supabaseFunctions.getEmbaixadores(page, pageSize, q)
    }
    
    // Para outras URLs, lançar um erro
    throw new Error(`URL não suportada: ${url}`)
  } catch (e) {
    // Silenciar/normalizar abortos: converte para AbortError para os chamadores tratarem
    if (signal?.aborted || e?.name === 'AbortError' || (typeof DOMException !== 'undefined' && e instanceof DOMException && e.name === 'AbortError')) {
      const abortErr = new Error('Aborted')
      abortErr.name = 'AbortError'
      throw abortErr
    }
    // Alguns ambientes retornam TypeError: Failed to fetch em abort; normalizar somente se o sinal foi abortado
    if (signal?.aborted && String(e?.message || '').toLowerCase().includes('failed to fetch')) {
      const abortErr = new Error('Aborted')
      abortErr.name = 'AbortError'
      throw abortErr
    }
    throw e
  }
}

export async function postJson(url, body, opts = {}) {
  const { signal, headers: extraHeaders, ...rest } = opts || {}
  
  try {
    // Mapear URLs para funções do Supabase
    if (url === '/api/auth/register') {
      const { nome, email, password } = body
      return await supabaseFunctions.registerUser(nome, email, password)
    }
    
    if (url === '/api/auth/login') {
      const { email, password } = body
      return await supabaseFunctions.loginUser(email, password)
    }
    
    if (url === '/api/auth/reset/request') {
      // Implementar solicitação de redefinição de senha
      throw new Error('Função não implementada')
    }
    
    if (url === '/api/auth/reset/confirm') {
      // Implementar confirmação de redefinição de senha
      throw new Error('Função não implementada')
    }
    
    if (url === '/api/avisos') {
      return await supabaseFunctions.createAviso(body)
    }
    
    if (url === '/api/membros') {
      return await supabaseFunctions.createMembro(body)
    }
    
    if (url === '/api/eventos') {
      return await supabaseFunctions.createEvento(body)
    }
    
    if (url === '/api/diretoria') {
      return await supabaseFunctions.createDiretor(body)
    }
    
    if (url === '/api/financas') {
      return await supabaseFunctions.createFinanca(body)
    }
    
    if (url === '/api/conteudos') {
      return await supabaseFunctions.createConteudo(body)
    }
    
    if (url === '/api/templates') {
      return await supabaseFunctions.createOrUpdateTemplate(body)
    }
    
    if (url === '/api/crachas') {
      return await supabaseFunctions.createCracha(body)
    }
    
    if (url === '/api/embaixadores') {
      return await supabaseFunctions.createEmbaixador(body)
    }
    
    // Para outras URLs, lançar um erro
    throw new Error(`URL não suportada: ${url}`)
  } catch (error) {
    throw error
  }
}

export async function putJson(url, body, opts = {}) {
  const { signal, headers: extraHeaders, ...rest } = opts || {}
  
  try {
    // Mapear URLs para funções do Supabase
    const membroMatch = url.match(/\/api\/membros\/(\d+)/)
    if (membroMatch) {
      const id = parseInt(membroMatch[1])
      return await supabaseFunctions.updateMembro(id, body)
    }
    
    const eventoMatch = url.match(/\/api\/eventos\/(\d+)/)
    if (eventoMatch) {
      const id = parseInt(eventoMatch[1])
      return await supabaseFunctions.updateEvento(id, body)
    }
    
    const conteudoMatch = url.match(/\/api\/conteudos\/(\d+)/)
    if (conteudoMatch) {
      const id = parseInt(conteudoMatch[1])
      return await supabaseFunctions.updateConteudo(id, body)
    }
    
    const crachaMatch = url.match(/\/api\/crachas\/(\d+)/)
    if (crachaMatch) {
      const id = parseInt(crachaMatch[1])
      return await supabaseFunctions.updateCracha(id, body)
    }
    
    const embaixadorMatch = url.match(/\/api\/embaixadores\/(\d+)/)
    if (embaixadorMatch) {
      const id = parseInt(embaixadorMatch[1])
      return await supabaseFunctions.updateEmbaixador(id, body)
    }
    
    // Para outras URLs, lançar um erro
    throw new Error(`URL não suportada: ${url}`)
  } catch (error) {
    throw error
  }
}

export async function delJson(url, opts = {}) {
  const { signal, headers: extraHeaders, ...rest } = opts || {}
  
  try {
    // Mapear URLs para funções do Supabase
    const avisoMatch = url.match(/\/api\/avisos\/(\d+)/)
    if (avisoMatch) {
      const id = parseInt(avisoMatch[1])
      await supabaseFunctions.deleteAviso(id)
      return null
    }
    
    const membroMatch = url.match(/\/api\/membros\/(\d+)/)
    if (membroMatch) {
      const id = parseInt(membroMatch[1])
      await supabaseFunctions.deleteMembro(id)
      return null
    }
    
    const eventoMatch = url.match(/\/api\/eventos\/(\d+)/)
    if (eventoMatch) {
      const id = parseInt(eventoMatch[1])
      await supabaseFunctions.deleteEvento(id)
      return null
    }
    
    const diretorMatch = url.match(/\/api\/diretoria\/(\d+)/)
    if (diretorMatch) {
      const id = parseInt(diretorMatch[1])
      await supabaseFunctions.deleteDiretor(id)
      return null
    }
    
    const financaMatch = url.match(/\/api\/financas\/(\d+)/)
    if (financaMatch) {
      const id = parseInt(financaMatch[1])
      await supabaseFunctions.deleteFinanca(id)
      return null
    }
    
    const financasBatchMatch = url.match(/\/api\/financas/)
    if (financasBatchMatch) {
      const params = new URLSearchParams(url.split('?')[1] || '')
      const tipo = params.get('tipo')
      if (tipo) {
        await supabaseFunctions.deleteFinancasByTipo(tipo)
        return { ok: true, deletedCount: 0 } // Contagem precisa ser implementada
      }
    }
    
    const conteudoMatch = url.match(/\/api\/conteudos\/(\d+)/)
    if (conteudoMatch) {
      const id = parseInt(conteudoMatch[1])
      await supabaseFunctions.deleteConteudo(id)
      return null
    }
    
    const crachaMatch = url.match(/\/api\/crachas\/(\d+)/)
    if (crachaMatch) {
      const id = parseInt(crachaMatch[1])
      await supabaseFunctions.deleteCracha(id)
      return null
    }
    
    const embaixadorMatch = url.match(/\/api\/embaixadores\/(\d+)/)
    if (embaixadorMatch) {
      const id = parseInt(embaixadorMatch[1])
      await supabaseFunctions.deleteEmbaixador(id)
      return null
    }
    
    // Para outras URLs, lançar um erro
    throw new Error(`URL não suportada: ${url}`)
  } catch (error) {
    throw error
  }
}