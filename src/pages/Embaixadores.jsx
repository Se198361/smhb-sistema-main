import { useEffect, useRef, useState, useCallback } from 'react'
import { getJson, postJson, delJson, putJson } from '../lib/api'

export default function Embaixadores() {
  const [lista, setLista] = useState([])
  const [nome, setNome] = useState('')
  const [idade, setIdade] = useState('')
  const [telefone, setTelefone] = useState('')
  const [foto, setFoto] = useState('')
  const [pai, setPai] = useState('')
  const [mae, setMae] = useState('')
  const [q, setQ] = useState('')
  const [loading, setLoading] = useState(false)
  const [savingBadge, setSavingBadge] = useState(false)
  const [crachasEmbaixadores, setCrachasEmbaixadores] = useState([])

  const [templateImg, setTemplateImg] = useState('')
  const [templateName, setTemplateName] = useState('')
  const [backImg, setBackImg] = useState('')
  const [backName, setBackName] = useState('')
  // Listas e seleção de templates (Neon)
  const [templatesFront, setTemplatesFront] = useState([])
  const [templatesBack, setTemplatesBack] = useState([])
  const [selectedFrontId, setSelectedFrontId] = useState(null)
  const [selectedBackId, setSelectedBackId] = useState(null)
  const selectedFront = templatesFront.find(t => t.id === selectedFrontId) || null
  const selectedBack = templatesBack.find(t => t.id === selectedBackId) || null
  const frontImg = selectedFront?.img || templateImg
  const backImgSel = selectedBack?.img || backImg

  const badgeRef = useRef(null)
  const backRef = useRef(null)
  const opRef = useRef(0)

  const logoSrc = import.meta.env.VITE_EMBAIXADORES_LOGO_URL || '/er-logo.png'
  const logoStyle = (import.meta.env.VITE_EMBAIXADORES_LOGO_STYLE || 'poster').toLowerCase()
  const isPoster = !(logoStyle === 'suave' || logoStyle === 'watermark')

  useEffect(() => {
    carregar(1)
  }, [])


  // Carregar modelos de crachá específicos da página Embaixadores (separado de Crachás)
  useEffect(() => {
    try {
      const raw = localStorage.getItem('embaixadores-template')
      if (raw) {
        const { img, name } = JSON.parse(raw)
        if (img) setTemplateImg(img)
        if (name) setTemplateName(name)
      }
      const backRaw = localStorage.getItem('embaixadores-back')
      if (backRaw) {
        const { img: bimg, name: bname } = JSON.parse(backRaw)
        if (bimg) setBackImg(bimg)
        if (bname) setBackName(bname)
      }
      const feitosRaw = localStorage.getItem('crachas-embaixadores-v1')
      if (feitosRaw) {
        const arr = JSON.parse(feitosRaw)
        if (Array.isArray(arr)) setCrachasEmbaixadores(arr)
      }
    } catch { /* erro ignorado intencionalmente */ }
  }, [selectedFrontId, selectedBackId])

  // Carregar templates do backend (Neon) para a página Embaixadores e preencher seletores
  useEffect(() => {
    let cancelled = false
    async function loadTemplates() {
      try {
        const res = await getJson('/api/templates?page=EMBAIXADORES')
        const all = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : []
        const fronts = all.filter(t => String(t.lado || '').toLowerCase() === 'front')
        const backs = all.filter(t => String(t.lado || '').toLowerCase() === 'back')
        if (!cancelled) {
          setTemplatesFront(fronts)
          setTemplatesBack(backs)
          if (!selectedFrontId && fronts.length) setSelectedFrontId(fronts[0].id)
          if (!selectedBackId && backs.length) setSelectedBackId(backs[0].id)
          if (!fronts.length) {
            const front = all.find(t => String(t.lado || '').toLowerCase() === 'front')
            if (front?.img) {
              setTemplateImg(front.img)
              setTemplateName(front.name || '')
            }
          }
          if (!backs.length) {
            const back = all.find(t => String(t.lado || '').toLowerCase() === 'back')
            if (back?.img) {
              setBackImg(back.img)
              setBackName(back.name || '')
            }
          }
        }
      } catch (e) {
        if (e?.name === 'AbortError' || /aborted/i.test(e?.message || '')) return
        if (import.meta.env.VITE_DEBUG_LOGS === 'true') console.warn('Falha ao carregar templates do backend, usando cache local se existir:', e)
      }
    }
    loadTemplates()
    return () => { cancelled = true }
  }, [selectedFrontId, selectedBackId])

  // Carregar crachás feitos desta página via backend (origem=EMBAIXADORES), com fallback local
  useEffect(() => {
    let cancelled = false
    async function loadBadges() {
      try {
        const res = await getJson('/api/crachas?page=1&pageSize=50&origem=EMBAIXADORES')
        const list = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : []
        if (!cancelled && list && list.length) setCrachasEmbaixadores(list)
      } catch (e) {
        if (e?.name === 'AbortError' || /aborted/i.test(e?.message || '')) return
        if (import.meta.env.VITE_DEBUG_LOGS === 'true') console.warn('Falha ao carregar crachás (Embaixadores) do backend, usando cache local:', e)
      }
    }
    loadBadges()
    return () => { cancelled = true }
  }, [])

  const carregar = useCallback(async (page = 1) => {
    const opId = ++opRef.current
    setLoading(true)
    try {
      const res = await getJson(`/api/embaixadores?page=${page}&pageSize=20&q=${encodeURIComponent(q || '')}`)
      const arr = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : []
      if (opRef.current === opId) setLista(arr)
    } catch (e) {
      if (e?.name === 'AbortError' || /aborted/i.test(e?.message || '')) return
      if (import.meta.env.VITE_DEBUG_LOGS === 'true') console.warn('Falha ao carregar embaixadores:', e)
    } finally {
      if (opRef.current === opId) setLoading(false)
    }
  }, [q])


  function handleFotoChange(e) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => setFoto(String(reader.result || ''))
    reader.readAsDataURL(file)
  }

  async function handleTemplateChange(e) {
    const file = e.target.files?.[0]
    if (!file) return
    const name = file.name
    setTemplateName(name)
    if (file.type === 'application/pdf') {
      const img = await renderPdfToImage(file)
      if (img) {
        setTemplateImg(img)
        try {
          localStorage.setItem('embaixadores-template', JSON.stringify({ img, name }))
          const saved = await postJson('/api/templates', { page: 'EMBAIXADORES', lado: 'front', name, img })
          setTemplatesFront(prev => [saved, ...prev])
          setSelectedFrontId(saved.id)
        } catch { /* falha ao salvar template (front) ignorada */ }
      }
      return
    }
    const reader = new FileReader()
    reader.onload = async () => {
      const url = String(reader.result || '')
      setTemplateImg(url)
      try {
        localStorage.setItem('embaixadores-template', JSON.stringify({ img: url, name }))
        const saved = await postJson('/api/templates', { page: 'EMBAIXADORES', lado: 'front', name, img: url })
        setTemplatesFront(prev => [saved, ...prev])
        setSelectedFrontId(saved.id)
      } catch { /* falha ao salvar template (front) ignorada */ }
    }
    reader.readAsDataURL(file)
  }

  async function handleBackChange(e) {
    const file = e.target.files?.[0]
    if (!file) return
    const name = file.name
    setBackName(name)
    if (file.type === 'application/pdf') {
      const img = await renderPdfToImage(file)
      if (img) {
        setBackImg(img)
        try {
          localStorage.setItem('embaixadores-back', JSON.stringify({ img, name }))
          const saved = await postJson('/api/templates', { page: 'EMBAIXADORES', lado: 'back', name, img })
          setTemplatesBack(prev => [saved, ...prev])
          setSelectedBackId(saved.id)
        } catch { /* falha ao salvar template (back) ignorada */ }
      }
      return
    }
    const reader = new FileReader()
    reader.onload = async () => {
      const url = String(reader.result || '')
      setBackImg(url)
      try {
        localStorage.setItem('embaixadores-back', JSON.stringify({ img: url, name }))
        const saved = await postJson('/api/templates', { page: 'EMBAIXADORES', lado: 'back', name, img: url })
        setTemplatesBack(prev => [saved, ...prev])
        setSelectedBackId(saved.id)
      } catch { /* falha ao salvar template (back) ignorada */ }
    }
    reader.readAsDataURL(file)
  }

  async function adicionar(e) {
    e?.preventDefault?.()
    const payload = {
      nome: nome.trim(),
      idade: idade ? Number(idade) : null,
      telefone: telefone || null,
      foto: foto || null,
      pai: pai || null,
      mae: mae || null,
    }
    if (!payload.nome) { alert('Informe o nome'); return }
    try {
      const created = await postJson('/api/embaixadores', payload)
      setLista(prev => [created, ...prev])
      setNome(''); setIdade(''); setTelefone(''); setFoto(''); setPai(''); setMae('')
    } catch (e) {
      alert('Falha ao salvar: ' + (e?.message || 'tente novamente'))
    }
  }

  async function excluir(id) {
    if (!confirm('Excluir este embaixador?')) return
    try { await delJson(`/api/embaixadores/${id}`); setLista(prev => prev.filter(x => x.id !== id)) } 
    catch (e) { alert('Falha ao excluir: ' + (e?.message || 'tente novamente')) }
  }

  // Capturas do crachá
  async function captureFront() {
    try {
      const html2canvas = await ensureHtml2Canvas()
      const node = badgeRef.current
      if (!node) return ''
      const canvas = await html2canvas(node, { scale: 2, useCORS: true, backgroundColor: null })
      return canvas.toDataURL('image/png')
    } catch { return '' }
  }

  async function captureBack() {
    try {
      const html2canvas = await ensureHtml2Canvas()
      const node = backRef.current
      if (!node) return ''
      const canvas = await html2canvas(node, { scale: 2, useCORS: true, backgroundColor: null })
      return canvas.toDataURL('image/png')
    } catch { return '' }
  }

  // Salvar crachá (preenche preview com dados do embaixador antes de capturar)
  async function salvarCracha(emb) {
    try {
      setSavingBadge(true)
      // Guardar estados atuais
      const old = { nome, idade, telefone, foto, pai, mae }
      // Aplicar dados do embaixador ao preview
      if (emb) {
        setNome(emb.nome || '')
        setIdade(emb.idade ?? '')
        setTelefone(emb.telefone || '')
        setFoto(emb.foto || '')
        setPai(emb.pai || '')
        setMae(emb.mae || '')
      }
      // Vincular templates selecionados ao embaixador (se houver id)
      if (emb?.id) {
        try {
          await putJson(`/api/embaixadores/${emb.id}`, { templateFrontId: selectedFrontId || null, templateBackId: selectedBackId || null })
        } catch (e) {
          if (import.meta.env.VITE_DEBUG_LOGS === 'true') console.warn('Falha ao vincular templates ao embaixador:', e)
        }
      }
      // Aguardar o DOM atualizar
      await new Promise(r => setTimeout(r, 80))

      const imgFront = await captureFront()
      const imgBack = await captureBack()

      // Restaurar estados originais
      setNome(old.nome)
      setIdade(old.idade)
      setTelefone(old.telefone)
      setFoto(old.foto)
      setPai(old.pai)
      setMae(old.mae)

      // Tentar persistir no backend (origem=EMBAIXADORES), com fallback local
      try {
        const created = await postJson('/api/crachas', { nome: (emb?.nome || old.nome || 'Embaixador'), front: imgFront, back: imgBack, origem: 'EMBAIXADORES', embaixadorId: emb?.id ?? null })
        setCrachasEmbaixadores(prev => [created, ...prev].slice(0, 100))
        alert('Crachá salvo no backend! Veja também na página Crachás (filtrando por origem).')
      } catch (err) {
        if (import.meta.env.VITE_DEBUG_LOGS === 'true') console.warn('Falha ao salvar crachá no backend, usando armazenamento local:', err)
        const item = { id: Date.now(), nome: (emb?.nome || old.nome || 'Embaixador'), front: imgFront, back: imgBack, createdAt: new Date().toISOString() }
        setCrachasEmbaixadores(prev => {
          const next = [item, ...prev].slice(0, 100)
          try { localStorage.setItem('crachas-embaixadores-v1', JSON.stringify(next)) } catch { /* falha ao salvar no localStorage ignorada */ }
          return next
        })
        alert('Crachá salvo localmente nesta página (fallback).')
      }
    } catch (e) {
      alert('Falha ao salvar crachá: ' + (e?.message || 'tente novamente'))
    } finally { setSavingBadge(false) }
  }

  async function ensureHtml2Canvas() {
    if (window.html2canvas) return window.html2canvas
    await new Promise((resolve, reject) => {
      const s = document.createElement('script')
      s.src = 'https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.min.js'
      s.onload = resolve
      s.onerror = reject
      document.head.appendChild(s)
    })
    return window.html2canvas
  }

  async function ensureJsPDF() {
    if (window.jspdf) return window.jspdf
    await new Promise((resolve, reject) => {
      const s = document.createElement('script')
      s.src = 'https://cdn.jsdelivr.net/npm/jspdf@2.5.1/dist/jspdf.umd.min.js'
      s.onload = resolve
      s.onerror = reject
      document.head.appendChild(s)
    })
    return window.jspdf
  }

  async function ensurePdfJs() {
    if (window.pdfjsLib) return window.pdfjsLib
    await new Promise((resolve, reject) => {
      const s = document.createElement('script')
      s.src = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.min.js'
      s.onload = () => {
        window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.worker.min.js'
        resolve()
      }
      s.onerror = reject
      document.head.appendChild(s)
    })
    return window.pdfjsLib
  }

  async function renderPdfToImage(file) {
    try {
      const pdfjsLib = await ensurePdfJs()
      const arrayBuffer = await file.arrayBuffer()
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
      const page = await pdf.getPage(1)
      const viewport = page.getViewport({ scale: 2 })
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      canvas.width = viewport.width
      canvas.height = viewport.height
      await page.render({ canvasContext: ctx, viewport }).promise
      return canvas.toDataURL('image/png')
    } catch (err) {
      if (import.meta.env.VITE_DEBUG_LOGS === 'true') console.warn('Falha ao renderizar PDF:', err)
      return ''
    }
  }

  // Exportar / Imprimir crachá
  async function handleExportPdf() {
    try {
      const jspdf = await ensureJsPDF()
      const { jsPDF } = jspdf
      const imgFront = await captureFront()
      const imgBack = await captureBack()
      const pdf = new jsPDF({ unit: 'mm', format: [54, 86], orientation: 'portrait' })
      if (imgFront) pdf.addImage(imgFront, 'PNG', 0, 0, 54, 86)
      pdf.addPage()
      if (imgBack) pdf.addImage(imgBack, 'PNG', 0, 0, 54, 86)
      pdf.save(`cracha-embaixador-${(nome || 'nome').replace(/\s+/g,'-')}.pdf`)
    } catch (e) {
      alert('Falha ao exportar PDF: ' + (e?.message || 'tente novamente'))
    }
  }

  async function handlePrintBadge() {
    try {
      const imgFront = await captureFront()
      const imgBack = await captureBack()
      const html = `<!doctype html><html><head><meta charset="utf-8"><title>Imprimir Crachá</title>
        <style> body{margin:0;padding:10mm;background:#f0f0f0;font-family:sans-serif;} .page{width:86mm;height:54mm;margin:0 auto 10mm;background:#fff;display:flex;align-items:center;justify-content:center;box-shadow:0 0 4mm rgba(0,0,0,.2);} img{width:86mm;height:54mm;object-fit:cover;} @media print{body{background:#fff} .page{box-shadow:none;margin:0 0 0}} </style>
      </head><body>
        <div class="page">${imgFront ? `<img src="${imgFront}" />` : ''}</div>
        <div class="page">${imgBack ? `<img src="${imgBack}" />` : ''}</div>
        <script>window.print(); setTimeout(()=>window.close(), 500);</script>
      </body></html>`
      const blob = new Blob([html], { type: 'text/html' })
      const url = URL.createObjectURL(blob)
      const w = window.open(url, '_blank')
      if (!w) alert('Permita pop-ups para imprimir.')
      setTimeout(() => URL.revokeObjectURL(url), 10000)
    } catch (e) {
      alert('Falha ao imprimir crachá: ' + (e?.message || 'tente novamente'))
    }
  }

  // Imprimir dados cadastrados dos Embaixadores
  async function imprimirDadosEmbaixadores() {
    try {
      const jspdf = await ensureJsPDF()
      const { jsPDF } = jspdf
      const pdf = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' })
      let y = 15
      pdf.setFontSize(14)
      pdf.text('Dados dos Embaixadores', 10, y)
      y += 8
      pdf.setFontSize(10)
      const line = (txt) => { pdf.text(txt, 10, y); y += 6 }
      lista.forEach((emb, idx) => {
        if (y > 280) { pdf.addPage(); y = 15 }
        line(`${idx+1}. Nome: ${emb.nome} | Idade: ${emb.idade ?? '-'} | Tel: ${emb.telefone || '-'} | Pai: ${emb.pai || '-'} | Mãe: ${emb.mae || '-'}`)
      })
      pdf.save('embaixadores-dados.pdf')
    } catch (e) {
      alert('Falha ao exportar dados: ' + (e?.message || 'tente novamente'))
    }
  }
  // Exportar um crachá salvo da lista local
  async function exportCrachaItem(item) {
    try {
      const jspdf = await ensureJsPDF()
      const { jsPDF } = jspdf
      const imgFront = item?.front || ''
      const imgBack = item?.back || ''
      if (!imgFront) {
        alert('Não há imagem da frente para exportar.')
        return
      }
      const pdf = new jsPDF({ unit: 'mm', format: [54, 86], orientation: 'portrait' })
      pdf.addImage(imgFront, 'PNG', 0, 0, 54, 86)
      pdf.addPage()
      if (imgBack) pdf.addImage(imgBack, 'PNG', 0, 0, 54, 86)
      const slug = String(item?.nome || 'embaixador').replace(/\s+/g, '_')
      pdf.save(`cracha_${slug}.pdf`)
    } catch (e) {
      alert('Falha ao exportar: ' + (e?.message || 'tente novamente'))
    }
  }

  // Excluir um crachá salvo da lista local
  async function excluirCrachaItem(id) {
    try {
      const ok = window.confirm('Excluir este crachá salvo?')
      if (!ok) return
      try { await delJson(`/api/crachas/${id}`) } catch (e) { if (import.meta.env.VITE_DEBUG_LOGS === 'true') console.warn('Falha ao excluir no backend, removendo local:', e) }
      setCrachasEmbaixadores(prev => {
        const next = prev.filter(x => x.id !== id)
        try { localStorage.setItem('crachas-embaixadores-v1', JSON.stringify(next)) } catch { /* falha ao atualizar localStorage ignorada */ }
        return next
      })
    } catch { /* falha ao excluir crachá local ignorada */ }
  }

  return (
    <div
      className="relative rounded-xl overflow-hidden"
      style={{
        backgroundColor: '#FFDF00',
        filter: 'contrast(1.08) saturate(1.06)',
      }}
    >
      {/* Watermark emblema em camada inferior */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `url(${logoSrc})`,
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center',
          backgroundSize: isPoster ? 'cover' : 'contain',
          opacity: isPoster ? 0.6 : 0.25,
          filter: isPoster ? 'contrast(1.12) saturate(1.08)' : 'contrast(1.03) saturate(1.02)',
          pointerEvents: 'none',
        }}
      />
      <div className="relative p-6">
        <h1 className="font-montserrat text-2xl font-bold text-[#111] drop-shadow-sm">Embaixadores</h1>
        <p className="text-sm text-[#222] mb-4">Cadastro de embaixadores, com suporte a crachá.</p>

        {/* Formulário */}
        <form onSubmit={adicionar} className="card bg-white/85 shadow-md border border-yellow-300">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold text-[#111] mb-1">Nome</label>
              <input value={nome} onChange={e=>setNome(e.target.value)} className="input text-[#111]" placeholder="Nome completo" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-[#111] mb-1">Idade</label>
              <input value={idade} onChange={e=>setIdade(e.target.value)} className="input text-[#111]" type="number" min="0" placeholder="Idade" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-[#111] mb-1">Telefone (opcional)</label>
              <input value={telefone} onChange={e=>setTelefone(e.target.value)} className="input text-[#111]" placeholder="(00) 00000-0000" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-[#111] mb-1">Nome do Pai</label>
              <input value={pai} onChange={e=>setPai(e.target.value)} className="input text-[#111]" placeholder="Pai" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-[#111] mb-1">Nome da Mãe</label>
              <input value={mae} onChange={e=>setMae(e.target.value)} className="input text-[#111]" placeholder="Mãe" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-[#111] mb-1">Foto</label>
              <input onChange={handleFotoChange} className="input text-[#111]" type="file" accept="image/*" />
            </div>
          </div>
          <div className="mt-4 flex gap-3">
            <button type="submit" className="btn-neon">Adicionar</button>
            <button type="button" onClick={() => { setNome(''); setIdade(''); setTelefone(''); setFoto(''); setPai(''); setMae('') }} className="btn-neon bg-danger/80">Limpar</button>
          </div>
        </form>

        {/* Modelo de Crachá: upload frente e costa */}
        <div className="mt-6 card bg-white/85 shadow-md border border-yellow-300 p-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-[#111] mb-1">Modelo Frente (Imagem/PDF)</label>
              <input type="file" accept="application/pdf,image/*" onChange={handleTemplateChange} className="text-[#111]" />
              {templateName && <p className="text-xs text-[#222] mt-1">Carregado: {templateName}</p>}
              <label className="block text-xs font-semibold text-[#111] mt-2">Escolher modelo salvo</label>
              <select value={selectedFrontId ?? ''} onChange={e => setSelectedFrontId(e.target.value ? Number(e.target.value) : null)} className="input text-[#111]">
                <option value="">Selecione um modelo...</option>
                {templatesFront.map(t => (
                  <option key={t.id} value={t.id}>{t.name || `Modelo #${t.id}`}</option>
                ))}
              </select>
              {selectedFront && <p className="text-xs text-[#222] mt-1">Selecionado: {selectedFront.name || `Modelo #${selectedFront.id}`}</p>}
            </div>
            <div>
              <label className="block text-sm font-semibold text-[#111] mb-1">Modelo Costa (Imagem/PDF)</label>
              <input type="file" accept="application/pdf,image/*" onChange={handleBackChange} className="text-[#111]" />
              {backName && <p className="text-xs text-[#222] mt-1">Carregado: {backName}</p>}
              <label className="block text-xs font-semibold text-[#111] mt-2">Escolher modelo salvo</label>
              <select value={selectedBackId ?? ''} onChange={e => setSelectedBackId(e.target.value ? Number(e.target.value) : null)} className="input text-[#111]">
                <option value="">Selecione um modelo...</option>
                {templatesBack.map(t => (
                  <option key={t.id} value={t.id}>{t.name || `Modelo #${t.id}`}</option>
                ))}
              </select>
              {selectedBack && <p className="text-xs text-[#222] mt-1">Selecionado: {selectedBack.name || `Modelo #${selectedBack.id}`}</p>}
            </div>
          </div>
        </div>

        {/* Preview do crachá (frente e costa) */}
        <div className="mt-6 flex flex-wrap gap-6 items-start">
          <div>
            <div ref={badgeRef} className="relative w-[320px] h-[480px] rounded-xl border border-yellow-500 bg-[#FFF59D] shadow-md overflow-hidden">
              {/* Fundo (usa templateImg quando disponível) */}
              <div style={{ position: 'absolute', inset: 0, background: frontImg ? `url(${frontImg}) center/cover no-repeat` : '#FFF59D' }} />
              
              {/* Conteúdo */}
              <div className="absolute inset-0 p-4 flex flex-col items-center justify-center text-[#0b1a3a]">
                <div className="mt-24 w-32 h-32 rounded-full overflow-hidden">
                  {foto ? <img src={foto} alt="foto" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-xs text-gray-500">Foto</div>}
                </div>
                <div className="mt-8 text-center">
                  <div className="font-black text-2xl tracking-wide">{nome || 'Embaixador'}</div>
                  <div className="text-base font-semibold">{idade ? `${idade} anos` : 'Idade'}</div>
                  <div className="text-lg uppercase tracking-widest font-black mt-2">EMBAIXADOR</div>
                </div>
              </div>
            </div>
          </div>
          <div>
            <div ref={backRef} className="relative w-[320px] h-[480px] rounded-xl border border-yellow-500 bg-[#FFF59D] shadow-md overflow-hidden">

              <div style={{ position: 'absolute', inset: 0, background: backImgSel ? `url(${backImgSel}) center/cover no-repeat` : '#FFF59D' }} />
              <div className="absolute inset-0 p-4 text-[#1d1d1d] flex items-center justify-center">
                <div className="text-xs text-center">Costa do crachá</div>
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <button type="button" className="btn-neon" onClick={handlePrintBadge}>Imprimir Crachá</button>
            <button type="button" className="btn-neon" onClick={handleExportPdf}>Exportar PDF</button>
            <button type="button" className="btn-neon" onClick={() => salvarCracha({ nome })} disabled={savingBadge}>Salvar Crachá</button>
          </div>
        </div>

        {/* Lista */}
        <div className="mt-8">
          <div className="flex items-center gap-2 mb-3">
            <input value={q} onChange={e=>setQ(e.target.value)} onKeyDown={e=>{ if(e.key==='Enter'){carregar(1)} }} className="input w-64 text-[#111]" placeholder="Buscar por nome/telefone" />
            <button className="btn-neon" onClick={() => carregar(1)}>Buscar</button>
            <button className="btn-neon" onClick={imprimirDadosEmbaixadores}>Imprimir dados (PDF)</button>
          </div>
          {loading ? <div>Carregando...</div> : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {lista.map(emb => (
                <div key={emb.id} className="card bg-white/90 border border-yellow-300">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full overflow-hidden border bg-white">
                      {emb.foto ? <img src={emb.foto} alt="foto" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-xs text-gray-500">Foto</div>}
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-[#111]">{emb.nome}</div>
                      <div className="text-xs text-gray-700">{emb.idade ? `${emb.idade} anos` : 'Sem idade'}</div>
                      <div className="text-xs text-gray-700">{emb.telefone || ''}</div>
                      <div className="text-xs text-gray-700">Filiação: {emb.pai || '-'} / {emb.mae || '-'}</div>
                    </div>
                  </div>
                  <div className="mt-3 flex gap-2">
                    <button onClick={() => salvarCracha(emb)} disabled={savingBadge} className="btn-neon">Salvar crachá</button>
                    <button onClick={() => excluir(emb.id)} className="btn-neon bg-danger/80">Excluir</button>
                  </div>
                </div>
              ))}
              {lista.length === 0 && !loading && (<div className="text-sm text-[#222]">Nenhum embaixador cadastrado.</div>)}
            </div>
          )}
        </div>
        {/* Crachás feitos (Embaixadores) */}
        <div className="mt-8">
          <h2 className="font-montserrat text-lg font-bold text-[#111]">Crachás (Embaixadores)</h2>
          {crachasEmbaixadores.length === 0 ? (
            <p className="text-sm text-[#222] mt-2">Nenhum crachá salvo nesta página.</p>
          ) : (
            <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-3">
              {crachasEmbaixadores.map(item => (
                <div key={item.id} className="border rounded-md p-2 bg-white/90 border-yellow-300">
                  <div className="w-full h-40 overflow-hidden rounded bg-[#FFF59D] border">
                    {item.front && <img src={item.front} alt="Frente" className="w-full h-full object-cover" />}
                  </div>
                  <div className="mt-2 text-sm font-semibold text-[#111] truncate">{item.nome}</div>
                  <div className="mt-2 flex gap-2">
                    <button className="btn-neon text-xs px-2 py-1" onClick={() => exportCrachaItem(item)}>Exportar PDF</button>
                    <button className="btn-neon text-xs px-2 py-1 bg-danger/80" onClick={() => excluirCrachaItem(item.id)}>Excluir</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
