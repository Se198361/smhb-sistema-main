let AUTH_TOKEN = null
const API_BASE = import.meta.env.VITE_API_BASE || ''

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

export function setAuthToken(token) {
  AUTH_TOKEN = token || null
}

function withAuth(headers = {}) {
  const h = { ...headers }
  if (AUTH_TOKEN) h['Authorization'] = `Bearer ${AUTH_TOKEN}`
  return h
}

function resolveUrl(url) {
  if (API_BASE && typeof url === 'string' && url.startsWith('/api')) {
    return `${API_BASE}${url}`
  }
  return url
}

export async function getJson(url, opts = {}) {
  const u = resolveUrl(url)
  const { signal, headers: extraHeaders, ...rest } = opts || {}
  try {
    if (signal?.aborted) {
      const abortErr = new Error('Aborted')
      abortErr.name = 'AbortError'
      throw abortErr
    }
    const res = await fetch(u, { headers: withAuth(extraHeaders), signal, ...rest })
    if (!res.ok) await parseError(res, 'GET', u)
    return res.json()
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
  const u = resolveUrl(url)
  const { signal, headers: extraHeaders, ...rest } = opts || {}
  const res = await fetch(u, {
    method: 'POST',
    headers: withAuth({ 'Content-Type': 'application/json', 'Accept': 'application/json', ...extraHeaders }),
    body: JSON.stringify(body),
    signal,
    ...rest,
  })
  if (!res.ok) await parseError(res, 'POST', u)
  return res.json()
}

export async function putJson(url, body, opts = {}) {
  const u = resolveUrl(url)
  const { signal, headers: extraHeaders, ...rest } = opts || {}
  const res = await fetch(u, {
    method: 'PUT',
    headers: withAuth({ 'Content-Type': 'application/json', 'Accept': 'application/json', ...extraHeaders }),
    body: JSON.stringify(body),
    signal,
    ...rest,
  })
  if (!res.ok) await parseError(res, 'PUT', u)
  return res.json()
}

export async function delJson(url, opts = {}) {
  const u = resolveUrl(url)
  const { signal, headers: extraHeaders, ...rest } = opts || {}
  const res = await fetch(u, { method: 'DELETE', headers: withAuth(extraHeaders), signal, ...rest })
  if (!res.ok && res.status !== 204) await parseError(res, 'DELETE', u)
  return res.status === 204 ? null : res.json()
}