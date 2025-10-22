import { useEffect, useState } from 'react'
import { getJson, postJson, putJson, delJson } from '../lib/api'

export default function Conteudo() {
  const [itens, setItens] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [tipo, setTipo] = useState('')
  const [titulo, setTitulo] = useState('')
  const [data, setData] = useState('')
  const [editingId, setEditingId] = useState(null)

  function formatBR(dateStr) {
    if (!dateStr) return ''
    try {
      const [y, m, d] = dateStr.slice(0, 10).split('-')
      if (y && m && d) return `${d}/${m}/${y}`
      const dt = new Date(dateStr)
      const dd = String(dt.getDate()).padStart(2, '0')
      const mm = String(dt.getMonth() + 1).padStart(2, '0')
      const yy = String(dt.getFullYear())
      return `${dd}/${mm}/${yy}`
    } catch {
      return dateStr
    }
  }

  useEffect(() => {
    async function load() {
      try {
        const res = await getJson('/api/conteudos')
        const list = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : []
        setItens(list)
        try { localStorage.setItem('conteudos-list', JSON.stringify(list)) } catch { /* erro ao salvar cache local ignorado */ }
      } catch (e) {
        if (import.meta.env.VITE_DEBUG_LOGS === 'true') console.warn('Falha ao carregar conteúdos da API, usando cache local:', e)
        const raw = localStorage.getItem('conteudos-list')
        const list = raw ? JSON.parse(raw) : []
        setItens(Array.isArray(list) ? list : [])
      }
    }
    load()
  }, [])

  async function handleAdd(e) {
    e.preventDefault()
    if (!tipo.trim() || !titulo.trim() || !data) {
      alert('Informe o tipo, o título e a data do conteúdo.')
      return
    }
    try {
      if (editingId !== null) {
        const updated = await putJson(`/api/conteudos/${editingId}`, { tipo, titulo, data })
        setItens(prev => {
          const next = prev.map(c => c.id === editingId ? updated : c)
          try { localStorage.setItem('conteudos-list', JSON.stringify(next)) } catch { /* erro ao salvar lista atualizada no cache ignorado */ }
          return next
        })
      } else {
        const created = await postJson('/api/conteudos', { tipo, titulo, data })
        setItens(prev => {
          const next = [created, ...prev]
          try { localStorage.setItem('conteudos-list', JSON.stringify(next)) } catch { /* erro ao salvar lista após criação ignorado */ }
          return next
        })
      }
    } catch (err) {
      if (import.meta.env.VITE_DEBUG_LOGS === 'true') console.error(err)
      alert('Falha ao salvar conteúdo.')
    }
    setTipo('')
    setTitulo('')
    setData('')
    setEditingId(null)
    setShowForm(false)
  }

  async function handleDelete(id) {
    if (!id) return
    const ok = window.confirm('Excluir este conteúdo?')
    if (!ok) return
    try {
      await delJson(`/api/conteudos/${id}`)
      setItens(prev => {
        const next = prev.filter(c => c.id !== id)
        try { localStorage.setItem('conteudos-list', JSON.stringify(next)) } catch { /* erro ao salvar lista após exclusão ignorado */ }
        return next
      })
    } catch (err) {
      alert('Erro ao excluir conteúdo: ' + (err?.message || 'tente novamente'))
    }
  }

  function startEdit(c) {
    if (!c) return
    try {
      setEditingId(c.id)
      setTipo(c.tipo || '')
      setTitulo(c.titulo || '')
      setData(c.data ? String(c.data).slice(0,10) : '')
      setShowForm(true)
    } catch { /* erro ao preparar edição ignorado */ }
  }

  function handlePrint() {
    try {
      const items = Array.isArray(itens) ? itens : []
      const generatedAt = new Date()
      const genDate = `${String(generatedAt.getDate()).padStart(2,'0')}/${String(generatedAt.getMonth()+1).padStart(2,'0')}/${generatedAt.getFullYear()}`
      const genTime = `${String(generatedAt.getHours()).padStart(2,'0')}:${String(generatedAt.getMinutes()).padStart(2,'0')}`
      const rows = items.map((c) => {
        const safeTitulo = (c.titulo || '').replace(/</g, '&lt;').replace(/>/g, '&gt;')
        const safeTipo = (c.tipo || '').replace(/</g, '&lt;').replace(/>/g, '&gt;')
        const dt = c.data ? formatBR(c.data) : '-'
        return `
          <div class="item">
            <div class="header">
              <span class="titulo">${safeTitulo}</span>
              <span class="meta">${safeTipo} • Data: ${dt}</span>
            </div>
          </div>
        `
      }).join('\n')

      const html = `<!doctype html>
        <html lang="pt-BR">
        <head>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <title>Conteúdos - Impressão</title>
          <link rel="preconnect" href="https://fonts.googleapis.com">
          <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
          <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@600;700&family=Roboto:wght@400;500;700&display=swap" rel="stylesheet">
          <style>
            * { box-sizing: border-box; }
            body { font-family: Roboto, Arial, sans-serif; color: #111827; margin: 24px; }
            .print-header { display:flex; align-items:center; justify-content:space-between; margin-bottom: 16px; }
            .print-title { font-family: Montserrat, Roboto, Arial, sans-serif; font-size: 20px; font-weight:700; color: #071722; }
            .print-meta { text-align:right; font-size:12px; color: #6b7280; }
            .logo { height: 40px; }
            .item { border: 1px solid #e5e7eb; padding: 12px; margin-bottom: 10px; border-radius: 6px; }
            .header { display: flex; justify-content: space-between; align-items: baseline; }
            .titulo { font-weight: 600; }
            .meta { font-size: 12px; color: #6b7280; }
            @media print {
              body { margin: 8mm; }
              .item { page-break-inside: avoid; }
            }
          </style>
        </head>
        <body>
          <div class="print-header">
            <div style="display:flex; align-items:center; gap:12px;">
              <img src="/smhb-logo.png" alt="SMHB" class="logo" onerror="this.style.display='none'" />
              <div class="print-title">Encontro da SMHB/Sextas Feiras</div>
            </div>
            <div class="print-meta">
              <div>Gerado em: ${genDate} ${genTime}</div>
            </div>
          </div>
          ${items.length === 0 ? '<p>Nenhum conteúdo.</p>' : rows}
          <script>
            window.onload = function(){
              setTimeout(function(){ window.print(); }, 200);
            };
          </script>
        </body>
        </html>`

      const printWindow = window.open('', '_blank', 'width=800,height=900')
      if (!printWindow) {
        alert('Pop-up bloqueado. Permita pop-ups para imprimir.')
        return
      }
      printWindow.document.open()
      printWindow.document.write(html)
      printWindow.document.close()
    } catch (err) {
      alert('Erro ao preparar impressão: ' + (err?.message || 'tente novamente'))
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="font-montserrat text-2xl font-bold text-primary dark:text-light">Encontro da SMHB/Sextas Feiras</h1>
      <div className="grid md:grid-cols-2 gap-4">
        {itens.map((c) => (
          <div key={c.id} className="card">
            <div className="flex items-center justify-between">
              <p className="text-xs text-gray-500 dark:text-gray-400">{c.tipo}</p>
              {c.data && <div className="text-xs text-gray-500 dark:text-gray-400">Data: {formatBR(c.data)}</div>}
            </div>
            <h2 className="font-montserrat font-semibold text-primary dark:text-light">{c.titulo}</h2>
            <div className="mt-3 flex gap-2">
              <button className="btn-neon" onClick={() => startEdit(c)}>Editar</button>
              <button className="btn-neon" onClick={() => handleDelete(c.id)}>Excluir</button>
            </div>
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <button type="button" className="btn-neon" onClick={handlePrint}>Imprimir PDF</button>
      </div>
      {showForm ? (
        <form onSubmit={handleAdd} className="card space-y-3">
          <div>
            <label className="block text-sm font-medium mb-1 dark:text-gray-200">Tipo</label>
            <input type="text" value={tipo} onChange={e => setTipo(e.target.value)} className="w-full" placeholder="Ex.: Devocional, Sermão" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 dark:text-gray-2 00">Título</label>
            <input type="text" value={titulo} onChange={e => setTitulo(e.target.value)} className="w-full" placeholder="Digite o título" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 dark:text-gray-200">Data</label>
            <input type="date" value={data} onChange={e => setData(e.target.value)} />
          </div>
          <div className="flex gap-2">
            <button type="submit" className="btn-neon">{editingId !== null ? 'Salvar alterações' : 'Salvar'}</button>
            <button type="button" className="btn-neon" onClick={() => { setShowForm(false); setTipo(''); setTitulo(''); setData('') }}>Cancelar</button>
          </div>
        </form>
      ) : (
        <button className="btn-neon" onClick={() => setShowForm(true)}>Adicionar Conteúdo</button>
      )}
    </div>
  )
}