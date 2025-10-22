import { useEffect, useState } from 'react'
import { getJson, postJson, putJson, delJson } from '../lib/api'

export default function Eventos() {
  const [eventos, setEventos] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [titulo, setTitulo] = useState('')
  const [data, setData] = useState('')
  const [horario, setHorario] = useState('')
  const [local, setLocal] = useState('')
  const [editingId, setEditingId] = useState(null)

  useEffect(() => {
    let cancelled = false
    async function load() {
      if (!cancelled) setLoading(true)
      try {
        const res = await getJson('/api/eventos?page=1&pageSize=100')
        if (!cancelled) setEventos(res?.data || [])
      } catch (e) {
        if (e?.name === 'AbortError' || /aborted/i.test(e?.message || '')) return
        if (import.meta.env.VITE_DEBUG_LOGS === 'true') console.error('Erro ao carregar eventos:', e)
        if (!cancelled) setEventos([])
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [])

  function eventDateTime(ev) {
    try {
      const base = ev?.data ? String(ev.data) : ''
      const time = ev?.horario ? String(ev.horario) : ''
      const iso = time ? `${base}T${time}` : base
      const d = new Date(iso)
      return d
    } catch {
      try { return new Date(ev?.data) } catch { return new Date() }
    }
  }

  async function handleAdd(e) {
    e.preventDefault()
    if (!titulo.trim() || !data || !horario || !local.trim()) {
      alert('Informe título, data, horário e local do evento.')
      return
    }
    try {
      if (editingId !== null) {
        const updated = await putJson(`/api/eventos/${editingId}`, { titulo, data, horario, local })
        setEventos(prev => {
          const next = prev.map(ev => ev.id === editingId ? { ...updated, comparecido: Boolean(updated.comparecido) } : ev)
          next.sort((a, b) => eventDateTime(a) - eventDateTime(b))
          return next
        })
      } else {
        const created = await postJson('/api/eventos', { titulo, data, horario, local })
        setEventos(prev => {
          const next = [...prev, { ...created, comparecido: Boolean(created.comparecido) }]
          next.sort((a, b) => eventDateTime(a) - eventDateTime(b))
          return next
        })
      }
      setTitulo('')
      setData('')
      setHorario('')
      setLocal('')
      setEditingId(null)
      setShowForm(false)
    } catch (err) {
      alert('Erro ao salvar evento: ' + (err?.message || 'tente novamente'))
    }
  }

  async function handleDelete(id) {
    if (!id) return
    try {
      await delJson(`/api/eventos/${id}`)
      setEventos(prev => {
        const next = prev.filter(e => e.id !== id)
        next.sort((a, b) => eventDateTime(a) - eventDateTime(b))
        return next
      })
    } catch (err) {
      alert('Erro ao excluir evento: ' + (err?.message || 'tente novamente'))
    }
  }

  function startEdit(ev) {
    if (!ev) return
    try {
      setEditingId(ev.id)
      setTitulo(ev.titulo || '')
      setData(ev.data || '')
      setHorario(ev.horario || '')
      setLocal(ev.local || '')
      setShowForm(true)
    } catch {
      // Erro ignorado intencionalmente
    }
  }

  async function toggleComparecido(ev) {
    if (!ev?.id) return
    try {
      const updated = await putJson(`/api/eventos/${ev.id}`, { comparecido: !ev.comparecido })
      setEventos(prev => {
        const next = prev.map(e => e.id === ev.id ? { ...e, comparecido: Boolean(updated.comparecido) } : e)
        next.sort((a, b) => eventDateTime(a) - eventDateTime(b))
        return next
      })
    } catch (err) {
      alert('Falha ao atualizar presença: ' + (err?.message || 'tente novamente'))
    }
  }

  function formatBR(d) {
    try {
      const date = new Date(d)
      return date.toLocaleDateString('pt-BR')
    } catch { return String(d) }
  }

  function handlePrint() {
    const items = eventos || []
    const genDate = new Date().toLocaleDateString('pt-BR')
    const genTime = new Date().toLocaleTimeString('pt-BR')
    const rows = `
      <table style="width:100%; border-collapse:collapse; margin-top:8px;">
        <thead>
          <tr>
            <th style="border:1px solid #ddd; padding:6px; text-align:left; background:#f7f7f7;">Título</th>
            <th style="border:1px solid #ddd; padding:6px; text-align:left; background:#f7f7f7;">Data</th>
            <th style="border:1px solid #ddd; padding:6px; text-align:left; background:#f7f7f7;">Horário</th>
            <th style="border:1px solid #ddd; padding:6px; text-align:left; background:#f7f7f7;">Local</th>
            <th style="border:1px solid #ddd; padding:6px; text-align:left; background:#f7f7f7;">Presença</th>
          </tr>
        </thead>
        <tbody>
          ${items.map(e => `
            <tr>
              <td style="border:1px solid #ddd; padding:6px;">${String(e.titulo).replace(/</g,'&lt;').replace(/>/g,'&gt;')}</td>
              <td style="border:1px solid #ddd; padding:6px;">${formatBR(e.data)}</td>
              <td style="border:1px solid #ddd; padding:6px;">${e.horario || ''}</td>
              <td style="border:1px solid #ddd; padding:6px;">${String(e.local).replace(/</g,'&lt;').replace(/>/g,'&gt;')}</td>
              <td style="border:1px solid #ddd; padding:6px;">${e.comparecido ? 'Comparecido' : 'Não comparecido'}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `
    const html = `<!doctype html>
    <html lang="pt-BR">
    <head>
      <meta charset="utf-8" />
      <title>Eventos - Impressão</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 24px; color: #111; }
        h1 { margin: 0 0 8px 0; font-size: 20px; }
        .meta { color: #555; font-size: 12px; margin-bottom: 16px; }
        @media print { body { margin: 8mm; } }
      </style>
    </head>
    <body>
      <h1>Eventos</h1>
      <div class="meta">Gerado em: ${genDate} ${genTime}</div>
      ${items.length === 0 ? '<p>Nenhum evento.</p>' : rows}
      <script>window.onload = () => setTimeout(() => window.print(), 200);</script>
    </body>
    </html>`
    const w = window.open('', '_blank')
    if (w && w.document) {
      w.document.open(); w.document.write(html); w.document.close()
    } else {
      const iframe = document.createElement('iframe')
      iframe.style.position = 'fixed'; iframe.style.right = '0'; iframe.style.bottom = '0'; iframe.style.width = '0'; iframe.style.height = '0'; iframe.style.border = '0'
      document.body.appendChild(iframe)
      const doc = iframe.contentWindow?.document
      if (doc) { doc.open(); doc.write(html); doc.close(); setTimeout(() => { try { iframe.contentWindow?.print() } catch { /* Erro de impressão ignorado */ }; setTimeout(() => { document.body.removeChild(iframe) }, 2000) }, 200) }
    }
  }
  return (
    <div className="space-y-6">
      <h1 className="font-montserrat text-2xl font-bold text-primary dark:text-light">Eventos</h1>
      <div className="card p-0">
        <table className="w-full">
          <thead>
            <tr className="text-left">
              <th className="p-3">Título</th>
              <th className="p-3">Data</th>
              <th className="p-3">Horário</th>
              <th className="p-3">Local</th>
              <th className="p-3">Presença</th>
              <th className="p-3">Ações</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td className="p-3" colSpan={6}>Carregando...</td></tr>
            ) : eventos.length === 0 ? (
              <tr><td className="p-3" colSpan={6}>Nenhum evento cadastrado.</td></tr>
            ) : eventos.map((e) => (
              <tr
                key={e.id}
                className={`border-t ${e.comparecido ? 'bg-green-50 dark:bg-green-900/20' : ''}`}
              >
                <td className="p-3 dark:text-gray-100">{e.titulo}</td>
                <td className="p-3 dark:text-gray-100">{e.data}</td>
                <td className="p-3 dark:text-gray-100">{e.horario || ''}</td>
                <td className="p-3 dark:text-gray-100">{e.local}</td>
                {/* selo visual de comparecido ao lado do título */}
                {e.comparecido && (
                  <td className="p-3">
                    <div className="inline-block rounded px-2 py-0.5 text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                      Comparecido
                    </div>
                  </td>
                )}
                <td className="p-3 dark:text-gray-100">
                  {e.comparecido ? 'Comparecido' : 'Não comparecido'}
                </td>
                <td className="p-3">
                  <div className="flex gap-2">
                    <button className="btn-neon text-sm px-3 py-1" onClick={() => startEdit(e)}>Editar</button>
                    <button className="btn-neon text-sm px-3 py-1" onClick={() => handleDelete(e.id)}>Excluir</button>
                    <button className="btn-neon text-sm px-3 py-1" onClick={() => toggleComparecido(e)}>
                      {e.comparecido ? 'Marcar não comparecido' : 'Marcar comparecido'}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {showForm ? (
        <form onSubmit={handleAdd} className="card space-y-3">
          <div>
            <label className="block text-sm font-medium mb-1 dark:text-gray-200">Título</label>
            <input type="text" value={titulo} onChange={e => setTitulo(e.target.value)} className="w-full" placeholder="Ex.: Culto de Domingo" />
          </div>
          <div className="grid md:grid-cols-4 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1 dark:text-gray-200">Data</label>
              <input type="date" value={data} onChange={e => setData(e.target.value)} className="w-full" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 dark:text-gray-200">Horário</label>
              <input type="time" value={horario} onChange={e => setHorario(e.target.value)} className="w-full" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1 dark:text-gray-200">Local</label>
              <input type="text" value={local} onChange={e => setLocal(e.target.value)} className="w-full" placeholder="Ex.: Santuário" />
            </div>
          </div>
          <div className="flex gap-2">
            <button type="submit" className="btn-neon">Salvar</button>
            <button type="button" className="btn-neon" onClick={() => { setShowForm(false); setTitulo(''); setData(''); setHorario(''); setLocal(''); setEditingId(null); }}>Cancelar</button>
          </div>
        </form>
      ) : (
        <div className="flex gap-2">
          <button className="btn-neon" onClick={() => { setShowForm(true); setEditingId(null); }}>Novo Evento</button>
          <button type="button" className="btn-neon" onClick={handlePrint}>Imprimir</button>
        </div>
      )}
    </div>
  )
}