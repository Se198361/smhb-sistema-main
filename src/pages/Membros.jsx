import { useEffect, useState } from 'react'
import { getJson, postJson, putJson, delJson } from '../lib/api'

export default function Membros() {
  const [query, setQuery] = useState('')
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [nome, setNome] = useState('')
  const [endereco, setEndereco] = useState('')
  const [telefone, setTelefone] = useState('')
  const [aniversario, setAniversario] = useState('')
  const [foto, setFoto] = useState('')
  const [editingId, setEditingId] = useState(null)

  // Helper para validar se a string é um SRC de imagem válido
  function isValidImageSrc(src) {
    if (!src) return false
    const s = String(src)
    if (s.startsWith('data:image/')) return true
    if (/^blob:/.test(s)) return true
    if (/^https?:\/\//.test(s) && /\.(png|jpe?g|gif|webp|bmp|svg)(\?.*)?$/i.test(s)) return true
    return false
  }

  function handleFotoChange(e) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      const url = String(reader.result || '')
      setFoto(url)
    }
    reader.readAsDataURL(file)
  }

  useEffect(() => {
    let cancelled = false
    async function load() {
      if (!cancelled) setLoading(true)
      try {
        const res = await getJson('/api/membros?page=1&pageSize=100')
        const list = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : []
        if (!cancelled) setMembers(list)
      } catch (e) {
        if (e?.name === 'AbortError' || /aborted/i.test(e?.message || '')) return
        if (import.meta.env.VITE_DEBUG_LOGS === 'true') console.error('Erro ao carregar membros:', e)
        if (!cancelled) setMembers([])
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [])

  async function handleAdd(e) {
    e.preventDefault()
    if (!nome.trim() || !endereco.trim() || !telefone.trim()) {
      alert('Informe nome, endereço e telefone do membro.')
      return
    }
    try {
      // Atualização de membro existente
      if (editingId !== null) {
        const updated = { nome, endereco, telefone, aniversario, foto }
        const row = await putJson(`/api/membros/${editingId}`, updated)
        const next = members.map(m => m.id === editingId ? row : m)
        setMembers(next)
        setEditingId(null)
        setNome('')
        setEndereco('')
        setTelefone('')
        setAniversario('')
        setFoto('')
        setShowForm(false)
        return
      }

      // Inserção de novo membro
      const created = await postJson('/api/membros', { nome, endereco, telefone, aniversario, foto })
      setMembers(prev => [created, ...prev])
      setNome('')
      setEndereco('')
      setTelefone('')
      setAniversario('')
      setFoto('')
      setShowForm(false)
    } catch (err) {
      if (import.meta.env.VITE_DEBUG_LOGS === 'true') console.error(err)
      alert('Falha ao salvar membro.')
    }
  }

  const filtered = members.filter(m => m.nome.toLowerCase().includes(query.toLowerCase()))

  function startEdit(m) {
    setEditingId(m.id ?? null)
    setNome(m.nome ?? '')
    setEndereco(m.endereco ?? m.grupo ?? '')
    setTelefone(m.telefone ?? '')
    setAniversario(m.aniversario ?? '')
    setFoto(m.foto ?? '')
    setShowForm(true)
  }

  async function handleDelete(id) {
    if (!id) return
    const ok = window.confirm('Excluir este membro?')
    if (!ok) return
    try {
      await delJson(`/api/membros/${id}`)
      setMembers(prev => prev.filter(m => m.id !== id))
      if (editingId === id) {
        setEditingId(null)
        setShowForm(false)
      }
    } catch (err) {
      if (import.meta.env.VITE_DEBUG_LOGS === 'true') console.error(err)
      alert('Falha ao excluir membro.')
    }
  }
  function formatBR(iso) {
    if (!iso) return ''
    const d = new Date(iso)
    if (Number.isNaN(d.getTime())) {
      const [y, m, day] = String(iso).split('-')
      return `${day?.padStart(2, '0')}/${m?.padStart(2, '0')}/${y}`
    }
    const dd = String(d.getDate()).padStart(2, '0')
    const mm = String(d.getMonth() + 1).padStart(2, '0')
    const yyyy = d.getFullYear()
    return `${dd}/${mm}/${yyyy}`
  }

  function handlePrint() {
    if (!members || members.length === 0) {
      alert('Não há membros para imprimir.')
      return
    }
    const genAt = new Date().toLocaleString('pt-BR')
    const html = `<!doctype html>
    <html lang="pt-BR">
    <head>
      <meta charset="utf-8" />
      <title>Membros</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 24px; color: #111; }
        h1 { margin: 0 0 8px 0; font-size: 20px; }
        .meta { color: #555; font-size: 12px; margin-bottom: 16px; }
        table { width: 100%; border-collapse: collapse; margin-top: 8px; }
        th, td { border: 1px solid #ddd; padding: 6px; font-size: 12px; }
        th { background: #f7f7f7; text-align: left; }
        img { height: 32px; width: 32px; object-fit: cover; border-radius: 4px; }
      </style>
    </head>
    <body>
      <h1>Lista de Membros</h1>
      <div class="meta">Gerado em: ${genAt}</div>
      <table>
        <thead>
          <tr>
            <th>Foto</th>
            <th>Nome</th>
            <th>Endereço</th>
            <th>Telefone</th>
            <th>Aniversário</th>
          </tr>
        </thead>
        <tbody>
          ${members.map(m => `
            <tr>
              <td>${isValidImageSrc(m.foto) ? `<img src="${m.foto}" />` : ''}</td>
              <td>${m.nome}</td>
              <td>${m.endereco ?? m.grupo ?? ''}</td>
              <td>${m.telefone}</td>
              <td>${m.aniversario ? formatBR(m.aniversario) : ''}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
      <script>
        window.onload = () => window.print();
      </script>
    </body>
    </html>`
    try {
      const blob = new Blob([html], { type: 'text/html' })
      const url = URL.createObjectURL(blob)
      const iframe = document.createElement('iframe')
      iframe.style.position = 'fixed'
      iframe.style.right = '0'
      iframe.style.bottom = '0'
      iframe.style.width = '0'
      iframe.style.height = '0'
      iframe.style.border = '0'
      iframe.src = url
      document.body.appendChild(iframe)
      setTimeout(() => {
        URL.revokeObjectURL(url)
        document.body.removeChild(iframe)
      }, 4000)
    } catch { /* erro ao preparar impressão ignorado */ }
  }
  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Buscar por nome" className="w-full" />
        <button className="btn-neon" onClick={() => { setEditingId(null); setNome(''); setEndereco(''); setTelefone(''); setAniversario(''); setFoto(''); setShowForm(true) }}>Adicionar Membro</button>
      </div>
      {showForm && (
        <form onSubmit={handleAdd} className="card space-y-3 mb-4">
          <div>
            <label className="block text-sm font-medium mb-1 dark:text-gray-200">Nome</label>
            <input type="text" value={nome} onChange={e => setNome(e.target.value)} className="w-full" placeholder="Nome completo" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 dark:text-gray-200">Endereço</label>
            <input type="text" value={endereco} onChange={e => setEndereco(e.target.value)} className="w-full" placeholder="Ex.: Rua Exemplo, 123" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 dark:text-gray-200">Telefone</label>
            <input type="text" value={telefone} onChange={e => setTelefone(e.target.value)} className="w-full" placeholder="(11) 99999-0000" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 dark:text-gray-200">Data de aniversário</label>
            <input type="date" value={aniversario} onChange={e => setAniversario(e.target.value)} className="w-full" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 dark:text-gray-200">Foto do membro</label>
            <input type="file" accept="image/*" onChange={handleFotoChange} />
            {foto && (<div className="mt-2">{isValidImageSrc(foto) ? <img src={foto} alt="Foto" className="h-24 w-24 object-cover rounded" /> : <span className="text-xs text-red-600">Imagem inválida</span>}</div>)}
          </div>
          <div className="flex gap-2">
            <button type="submit" className="btn-neon">Salvar</button>
            <button type="button" className="btn-neon" onClick={() => { setShowForm(false); setEditingId(null) }}>Cancelar</button>
          </div>
        </form>
      )}
      <div className="card">
        {loading ? (
          <div>Carregando...</div>
        ) : (
          <table className="w-full">
            <thead>
              <tr>
                <th className="p-2 text-left">Nome</th>
                <th className="p-2 text-left">Endereço</th>
                <th className="p-2 text-left">Telefone</th>
                <th className="p-2 text-left">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(m => (
                <tr key={m.id} className="border-t border-gray-200 dark:border-gray-700">
                  <td className="p-3 dark:text-gray-100">
                    <div className="flex items-center gap-2">
                      {isValidImageSrc(m.foto) && <img src={m.foto} alt="Foto" className="h-8 w-8 rounded object-cover" />}
                      <div>{m.nome}</div>
                    </div>
                  </td>
                  <td className="p-3 dark:text-gray-100">{m.endereco ?? m.grupo}</td>
                  <td className="p-3 dark:text-gray-100">{m.telefone}</td>
                  <td className="p-3">
                    <div className="flex gap-2">
                      <button className="btn-neon text-sm px-3 py-1" onClick={() => startEdit(m)}>Editar</button>
                      <button className="btn-neon text-sm px-3 py-1" onClick={() => handleDelete(m.id)}>Excluir</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      <div className="mt-2 flex gap-2">
        <button type="button" className="btn-neon" onClick={handlePrint}>Imprimir PDF</button>
      </div>
    </div>
  )
}