import { useEffect, useRef, useState } from 'react'
import { getJson, postJson, putJson, delJson } from '../lib/api'

// Normaliza caminhos de imagem vindos do banco (nome de arquivo -> /templates/)
function resolveAsset(src) {
  if (!src) return ''
  const s = String(src)
  if (s.startsWith('data:') || /^https?:\/\//.test(s)) return s
  if (s.startsWith('/')) return s
  return `/templates/${s}`
}

export default function Crachas() {
  const [nome, setNome] = useState('')
  const [ts, setTs] = useState('')
  const [idNumero, setIdNumero] = useState('')
  const [batismo, setBatismo] = useState('')
  const [igreja, setIgreja] = useState('')
  const [foto, setFoto] = useState('')
  const [cargo, setCargo] = useState('MEMBRO')
  const [templateImg, setTemplateImg] = useState('')
  const [templateName, setTemplateName] = useState('')
  const [backImg, setBackImg] = useState('')
  const [backName, setBackName] = useState('')
  const [loadingPdf, setLoadingPdf] = useState(false)
  const [crachasFeitos, setCrachasFeitos] = useState([])
  const badgeRef = useRef(null)
  const backRef = useRef(null)
  const [templatesFront, setTemplatesFront] = useState([])
  const [templatesBack, setTemplatesBack] = useState([])
  const [selectedFrontId, setSelectedFrontId] = useState(null)
  const [selectedBackId, setSelectedBackId] = useState(null)
  const selectedFront = templatesFront.find(t => t.id === selectedFrontId) || null
  const selectedBack = templatesBack.find(t => t.id === selectedBackId) || null
  const frontImg = selectedFront?.img || templateImg
  const backImgSel = selectedBack?.img || backImg

  useEffect(() => {
    try {
      const raw = localStorage.getItem('badge-template')
      if (raw) {
        const { img, name } = JSON.parse(raw)
        if (img) setTemplateImg(img)
        if (name) setTemplateName(name)
      }
      const backRaw = localStorage.getItem('badge-back')
      if (backRaw) {
        const { img: bimg, name: bname } = JSON.parse(backRaw)
        if (bimg) setBackImg(bimg)
        if (bname) setBackName(bname)
      }
    } catch { /* erro ao ler localStorage ignorado */ }
  }, [])

  // Load templates from API (front/back)
  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const [fronts, backs] = await Promise.all([
          getJson('/api/templates?page=CRACHAS&lado=front'),
          getJson('/api/templates?page=CRACHAS&lado=back'),
        ])
        if (!cancelled) {
          setTemplatesFront(Array.isArray(fronts) ? fronts : fronts?.data || [])
          setTemplatesBack(Array.isArray(backs) ? backs : backs?.data || [])
        }
      } catch (e) {
        if (e?.name === 'AbortError' || /aborted/i.test(e?.message || '')) return
        if (import.meta.env.VITE_DEBUG_LOGS === 'true') console.warn('Falha ao carregar templates:', e)
      }
    })()
    return () => { cancelled = true }
  }, [])

  // Carregar crachás do backend (com fallback e migração dos itens locais antigos)
  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const res = await getJson('/api/crachas?page=1&pageSize=50&origem=CRACHAS')
        const list = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : []
        if (!cancelled) setCrachasFeitos(list)
        // Migração: se houver itens locais e o backend estiver vazio, importar rapidamente
        const localRaw = localStorage.getItem('crachas-feitos-v1')
        if (localRaw && (!list || list.length === 0)) {
          const arr = JSON.parse(localRaw)
          if (Array.isArray(arr) && arr.length) {
            const imported = []
            for (const old of arr.slice(0, 50)) {
              try {
                const created = await postJson('/api/crachas', {
                  nome: old.nome || 'Membro',
                  front: old.front || old.thumb || '',
                  back: old.back || '',
                  origem: 'CRACHAS'
                })
                imported.push(created)
              } catch { /* falha ao importar item local ignorada */ }
            }
            if (imported.length) {
              if (!cancelled) setCrachasFeitos(imported)
              try { localStorage.removeItem('crachas-feitos-v1') } catch { /* erro ao limpar localStorage ignorado */ }
            }
          }
        }
      } catch (e) {
        if (e?.name === 'AbortError' || /aborted/i.test(e?.message || '')) return
        if (import.meta.env.VITE_DEBUG_LOGS === 'true') console.warn('Falha ao carregar crachás da API; usando cache local.', e)
        try {
          const feitosRaw = localStorage.getItem('crachas-feitos-v1')
          const arr = feitosRaw ? JSON.parse(feitosRaw) : []
          if (!cancelled) setCrachasFeitos(Array.isArray(arr) ? arr : [])
        } catch { /* erro ao ler cache local ignorado */ }
      }
    }
    load()
    return () => { cancelled = true }
  }, [])

  // Persistência local via localStorage; sem integração com storage externo

  // Sincroniza localStorage quando estiver usando URLs públicas (não dataURL)
  useEffect(() => {
    try {
      if (templateImg && !String(templateImg).startsWith('data:')) {
        localStorage.setItem('badge-template', JSON.stringify({ img: templateImg, name: templateName || 'template.png' }))
      }
      if (backImg && !String(backImg).startsWith('data:')) {
        localStorage.setItem('badge-back', JSON.stringify({ img: backImg, name: backName || 'back.png' }))
      }
    } catch { /* erro ao sincronizar localStorage ignorado */ }
  }, [templateImg, backImg, templateName, backName])

  function handleFotoChange(e) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => setFoto(String(reader.result || ''))
    reader.readAsDataURL(file)
  }

  async function ensurePdfJs() {
    // Carrega pdf.js via CDN somente quando necessário
    if (window.pdfjsLib) return window.pdfjsLib
    await new Promise((resolve, reject) => {
      const s = document.createElement('script')
      s.src = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.min.js'
      s.onload = resolve
      s.onerror = reject
      document.head.appendChild(s)
    })
    // worker
    const w = document.createElement('script')
    w.src = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.worker.min.js'
    document.head.appendChild(w)
    window.pdfjsLib.GlobalWorkerOptions.workerSrc = w.src
    return window.pdfjsLib
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

  async function saveCrachaFeito(frontThumbDataUrl, backThumbDataUrl) {
    const payload = {
      nome: nome || 'Membro',
      front: frontThumbDataUrl || '',
      back: backThumbDataUrl || '',
      origem: 'CRACHAS'
    }
    try {
      const created = await postJson('/api/crachas', payload)
      const merged = { ...created, front: created?.front || payload.front, back: created?.back ?? payload.back }
      setCrachasFeitos(prev => [merged, ...prev].slice(0, 50))
    } catch (err) {
      if (import.meta.env.VITE_DEBUG_LOGS === 'true') console.warn('API indisponível, salvando local:', err)
      try {
        const item = { id: Date.now(), ...payload, createdAt: new Date().toISOString() }
        setCrachasFeitos(prev => {
          const next = [item, ...prev].slice(0, 50)
          localStorage.setItem('crachas-feitos-v1', JSON.stringify(next))
          return next
        })
      } catch { /* erro ao salvar fallback local ignorado */ }
    }
  }


  async function captureFront() {
    try {
      const html2canvas = await ensureHtml2Canvas()
      const node = badgeRef.current
      if (!node) return ''
      const canvas = await html2canvas(node, { scale: 1, useCORS: true, backgroundColor: null })
      return canvas.toDataURL('image/png')
    } catch { return '' }
  }

  async function captureBack() {
    try {
      const html2canvas = await ensureHtml2Canvas()
      const node = backRef.current
      if (!node) return ''
      const canvas = await html2canvas(node, { scale: 1, useCORS: true, backgroundColor: null })
      return canvas.toDataURL('image/png')
    } catch { return '' }
  }

  async function handleExportPdf() {
    try {
      const html2canvas = await ensureHtml2Canvas()
      const jspdf = await ensureJsPDF()
      const nodeFront = badgeRef.current
      const nodeBack = backRef.current
      if (!nodeFront) {
        alert('Preview não encontrado.')
        return
      }
      const canvasFront = await html2canvas(nodeFront, { scale: 2, useCORS: true, backgroundColor: null })
      const imgFront = canvasFront.toDataURL('image/png')
      let imgBack = ''
      if (nodeBack) {
        const canvasBack = await html2canvas(nodeBack, { scale: 2, useCORS: true, backgroundColor: null })
        imgBack = canvasBack.toDataURL('image/png')
      }
      // Não registrar automaticamente ao exportar PDF
      const { jsPDF } = jspdf
      // Documento em milímetros para CR-80 86x54mm (modo paisagem ou retrato). Usaremos retrato 54x86.
      const pdf = new jsPDF({ unit: 'mm', format: [54, 86], orientation: 'portrait' })
      // O preview é 320x480px; mapeamos para 54x86mm preenchendo completamente mantendo proporção
      pdf.addImage(imgFront, 'PNG', 0, 0, 54, 86)
      // Costa
      pdf.addPage()
      if (imgBack) {
        pdf.addImage(imgBack, 'PNG', 0, 0, 54, 86)
      } else {
        // Se não houver costa, preencher com um fundo padrão
        // Criamos uma página em branco com o mesmo gradiente padrão
        // jsPDF não desenha gradiente nativamente, mas poderíamos inserir um retângulo colorido.
        // Para simplicidade, repetimos a frente sem conteúdo capturando o fundo do preview.
        pdf.addImage(imgFront, 'PNG', 0, 0, 54, 86)
      }
      pdf.save(`cracha_${(nome || 'membro').replace(/\s+/g,'_')}.pdf`)
    } catch (e) {
      alert('Falha ao exportar PDF: ' + (e?.message || 'tente novamente'))
    }
  }

  // Nova ação: salvar crachá e mostrar miniatura imediatamente
  async function handleSalvarCracha() {
    try {
      const [front, back] = await Promise.all([captureFront(), captureBack()])
      if (!front) {
        alert('Não foi possível capturar a frente do crachá. Verifique o modelo e tente novamente.')
        return
      }
      await saveCrachaFeito(front, back)
    } catch (e) {
      alert('Falha ao salvar o crachá: ' + (e?.message || 'tente novamente'))
    }
  }

  async function renderPdfToImage(file) {
    setLoadingPdf(true)
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
      const dataUrl = canvas.toDataURL('image/png')
      return dataUrl
    } catch {
      alert('Falha ao processar PDF do modelo. Envie uma imagem (PNG/JPG) como alternativa.')
      return ''
    } finally {
      setLoadingPdf(false)
    }
  }

  async function handleTemplateChange(e) {
    const file = e.target.files?.[0]
    if (!file) return
    const name = file.name
    let imgData = ''
    if (file.type === 'application/pdf') {
      imgData = await renderPdfToImage(file)
    } else {
      imgData = await new Promise((resolve) => {
        const reader = new FileReader()
        reader.onload = () => resolve(String(reader.result || ''))
        reader.readAsDataURL(file)
      })
    }
    if (!imgData) return
    setTemplateName(name)
    setTemplateImg(imgData)
    try {
      const saved = await postJson('/api/templates', { page: 'CRACHAS', lado: 'front', name, img: imgData })
      setTemplatesFront(prev => [saved, ...prev])
      setSelectedFrontId(saved.id)
    } catch (err) {
      if (import.meta.env.VITE_DEBUG_LOGS === 'true') console.warn('Falha ao salvar template (frente), mantendo apenas local:', err)
    }
    try { localStorage.setItem('badge-template', JSON.stringify({ img: imgData, name })) } catch { /* erro ao salvar no localStorage (template frente) ignorado */ }
  }

  async function handleBackChange(e) {
    const file = e.target.files?.[0]
    if (!file) return
    const name = file.name
    let imgData = ''
    if (file.type === 'application/pdf') {
      imgData = await renderPdfToImage(file)
    } else {
      imgData = await new Promise((resolve) => {
        const reader = new FileReader()
        reader.onload = () => resolve(String(reader.result || ''))
        reader.readAsDataURL(file)
      })
    }
    if (!imgData) return
    setBackName(name)
    setBackImg(imgData)
    try {
      const saved = await postJson('/api/templates', { page: 'CRACHAS', lado: 'back', name, img: imgData })
      setTemplatesBack(prev => [saved, ...prev])
      setSelectedBackId(saved.id)
    } catch (err) {
      if (import.meta.env.VITE_DEBUG_LOGS === 'true') console.warn('Falha ao salvar template (verso), mantendo apenas local:', err)
    }
    try { localStorage.setItem('badge-back', JSON.stringify({ img: imgData, name })) } catch { /* erro ao salvar no localStorage (template costa) ignorado */ }
  }

  // Removido: upload para serviço de storage externo

  async function removeCrachaFeito(id) {
    try {
      if (!id) return
      const ok = window.confirm('Excluir este crachá da lista?')
      if (!ok) return
      try { await delJson(`/api/crachas/${id}`) } catch (e) { if (import.meta.env.VITE_DEBUG_LOGS === 'true') console.warn('Falha ao excluir no backend, removendo local:', e) }
      setCrachasFeitos(prev => {
        const next = prev.filter(x => x.id !== id)
        try { localStorage.setItem('crachas-feitos-v1', JSON.stringify(next)) } catch { /* erro ao atualizar localStorage ignorado */ }
        return next
      })
    } catch { /* falha ao excluir local ignorada */ }
  }

  async function updateCrachaNome(id, novoNome) {
    try {
      const name = String(novoNome || '').trim() || 'Membro'
      const updated = await putJson(`/api/crachas/${id}`, { nome: name })
      setCrachasFeitos(prev => prev.map(it => it.id === id ? { ...it, nome: updated.nome } : it))
    } catch (err) {
      alert('Falha ao atualizar nome: ' + (err?.message || 'tente novamente'))
    }
  }

  async function reprintCrachaFeito(item) {
    try {
      let imgFront = item?.front || item?.thumb || ''
      let imgBack = item?.back || ''
      if (!imgFront) imgFront = await captureFront()
      if (!imgBack) imgBack = await captureBack()
      const html = `<!doctype html><html><head><meta charset="utf-8"><title>Imprimir Crachá</title>
        <style> body{margin:0;padding:10mm;background:#f0f0f0;font-family:sans-serif;} .page{width:86mm;height:54mm;margin:0 auto 10mm;background:#fff;display:flex;align-items:center;justify-content:center;box-shadow:0 0 4mm rgba(0,0,0,.2);} img{width:86mm;height:54mm;object-fit:cover;} @media print{ body{padding:0;background:#fff;} .page{box-shadow:none;margin:0 auto;} } </style>
      </head><body>
        <div class="page">${imgFront ? `<img src="${imgFront}" />` : ''}</div>
        <div class="page">${imgBack ? `<img src="${imgBack}" />` : ''}</div>
        <script>window.print(); setTimeout(()=>window.close(), 600);</script>
      </body></html>`
      const blob = new Blob([html], { type: 'text/html' })
      const url = URL.createObjectURL(blob)
      const w = window.open(url, '_blank')
      if (!w) alert('Permita pop-ups para imprimir.')
      setTimeout(() => URL.revokeObjectURL(url), 10000)
    } catch (e) {
      alert('Falha ao reimprimir o crachá: ' + (e?.message || 'tente novamente'))
    }
  }

  async function regenerateFront(item) {
    try {
      const imgFront = await captureFront()
      if (!imgFront) {
        alert('Não foi possível capturar a frente do crachá. Verifique se o modelo da frente está carregado e tente novamente.')
        return
      }
      const updated = await putJson(`/api/crachas/${item.id}`, { front: imgFront })
      setCrachasFeitos(prev => prev.map(it => it.id === item.id ? { ...it, front: updated.front } : it))
    } catch (e) {
      alert('Falha ao atualizar a frente: ' + (e?.message || 'tente novamente'))
    }
  }

  async function exportCrachaFeito(item) {
    try {
      const jspdf = await ensureJsPDF()
      let imgFront = item?.front || item?.thumb || ''
      let imgBack = item?.back || ''
      if (!imgBack) imgBack = await captureBack()
      if (!imgFront) imgFront = await captureFront()
      if (!imgFront) {
        alert('Não foi possível obter a imagem da frente para exportar.')
        return
      }
      const { jsPDF } = jspdf
      const pdf = new jsPDF({ unit: 'mm', format: [54, 86], orientation: 'portrait' })
      pdf.addImage(imgFront, 'PNG', 0, 0, 54, 86)
      pdf.addPage()
      if (imgBack) {
        pdf.addImage(imgBack, 'PNG', 0, 0, 54, 86)
      } else {
        pdf.addImage(imgFront, 'PNG', 0, 0, 54, 86)
      }
      const slug = String(item?.nome || nome || 'membro').replace(/\s+/g, '_')
      pdf.save(`cracha_${slug}.pdf`)
    } catch (e) {
      alert('Falha ao exportar o crachá: ' + (e?.message || 'tente novamente'))
    }
  }

  function formatBR(iso) {
    if (!iso) return ''
    const str = String(iso)
    const m = str.match(/^(\d{4})-(\d{2})-(\d{2})/)
    if (m) {
      const [, y, mm, dd] = m
      return `${dd}/${mm}/${y}`
    }
    const dt = new Date(str)
    if (!Number.isNaN(dt.getTime())) {
      const dd = String(dt.getUTCDate()).padStart(2, '0')
      const mm = String(dt.getUTCMonth() + 1).padStart(2, '0')
      const yyyy = dt.getUTCFullYear()
      return `${dd}/${mm}/${yyyy}`
    }
    return ''
  }

  function handlePrint() {
    // Não registrar automaticamente ao imprimir; apenas abrir diálogo de impressão
    // Conversão aproximada: Preview 320x480px -> CR-80 86x54mm (orientação retrato)
    // Usaremos layout em mm com proporção semelhante: largura 54mm, altura 86mm
    const bgFront = resolveAsset(frontImg)
    const html = `<!doctype html>
    <html lang="pt-BR">
    <head>
      <meta charset="utf-8" />
      <title>Cracha</title>
      <style>
        * { box-sizing: border-box; }
        @page { size: 54mm 86mm; margin: 0; }
        html, body { height: 100%; }
        body { margin: 0; padding: 0; background: #fff; }
        .print-root { display: flex; align-items: center; justify-content: center; min-height: 100vh; }
        .badge { position: relative; width: 54mm; height: 86mm; overflow: hidden; border-radius: 2mm; }
        .bg { position: absolute; inset: 0; background: ${frontImg ? `url('${resolveAsset(frontImg)}') center/cover no-repeat` : 'linear-gradient(180deg,#11558a 0%,#0a3560 100%)'}; }
        .content { position: absolute; inset: 0; padding: 4mm 4mm; display: flex; flex-direction: column; align-items: center; color: #fff; font-family: Montserrat, Arial, sans-serif; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        .brand { text-align:center; margin-top: 2mm; padding: 1mm 2mm; border-radius: 2mm; display: inline-block; }
        .brand .title { font-size: 6mm; margin: 0; letter-spacing: 0.3mm; color: #001f4d; font-weight: 800; }
        .brand .sub { font-size: 3mm; margin: 0; color: #001f4d; font-weight: 700; }
        .photo-wrap { margin-top: 4mm; height: 20mm; width: 20mm; border-radius: 50%; overflow: hidden; border: 1mm solid rgba(255,255,255,0.6); box-shadow: 0 0 0 0.5mm rgba(255,255,255,0.25); }
        .photo-wrap img { height: 100%; width: 100%; object-fit: cover; }
        .name { margin-top: 4mm; font-size: 6mm; font-weight: 800; text-align: center; }
        .role { font-size: 3.2mm; opacity: 0.9; }
        .grid { margin-top: 3mm; width: 100%; font-size: 3mm; }
        .row { display: grid; grid-template-columns: auto 1fr; gap: 2mm; padding: 1mm 0; border-top: 0.3mm solid rgba(255,255,255,0.2); }
        .row:first-child { border-top: none; }
        .label { opacity: 0.9; }
        .value { font-weight: 600; white-space: normal; word-break: break-word; overflow: visible; text-overflow: clip; }
        @media print {
          .badge { box-shadow: none; }
        }
      </style>
    </head>
    <body>
      <div class="print-root">
        <div class="badge">
          <div class="bg"></div>
          <div class="content">
            <div class="brand">
              <div class="title">SMHB</div>
              <div class="sub">REMIDOS DO SENHOR</div>
            </div>
            <div class="photo-wrap">${foto ? `<img src="${foto}" />` : ''}</div>
            <div class="name">${nome || 'NOME DO MEMBRO'}</div>
            <div class="role">${cargo || 'MEMBRO'}</div>
            <div class="grid">
              <div class="row"><div class="label">ID</div><div class="value">${idNumero || ''}</div></div>
              <div class="row"><div class="label">T.S</div><div class="value">${ts || ''}</div></div>
              <div class="row"><div class="label">BATISMO</div><div class="value">${formatBR(batismo) || ''}</div></div>
              <div class="row"><div class="label">IGREJA</div><div class="value">${igreja || ''}</div></div>
            </div>
          </div>
        </div>
      </div>
      <script>window.onload = () => window.print();</script>
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
      setTimeout(() => { URL.revokeObjectURL(url); document.body.removeChild(iframe) }, 5000)
    } catch { /* erro ao preparar impressão ignorado */ }
  }

  return (
    <div className="space-y-6">
      <h1 className="font-montserrat text-2xl font-bold text-primary dark:text-light">Crachás</h1>
      <div className="card">
        <div className="grid md:grid-cols-2 gap-6">
          <form className="space-y-3">
            <div>
              <label className="block text-sm font-medium mb-1 dark:text-gray-200">Nome</label>
              <input type="text" value={nome} onChange={e => setNome(e.target.value)} className="w-full" placeholder="Ex.: DAVID ANDREWS" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium mb-1 dark:text-gray-200">ID</label>
                <input type="text" value={idNumero} onChange={e => setIdNumero(e.target.value)} className="w-full" placeholder="Ex.: 123 000 000 000" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 dark:text-gray-200">T.S</label>
                <input type="text" value={ts} onChange={e => setTs(e.target.value)} className="w-full" placeholder="Ex.: AB" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium mb-1 dark:text-gray-200">Batismo</label>
                <input type="date" value={batismo} onChange={e => setBatismo(e.target.value)} className="w-full" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 dark:text-gray-200">Igreja</label>
                <input type="text" value={igreja} onChange={e => setIgreja(e.target.value)} className="w-full" placeholder="Ex.: IGREJA BATISTA DO NOBRE" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 dark:text-gray-200">Cargo</label>
              <input type="text" value={cargo} onChange={e => setCargo(e.target.value)} className="w-full" placeholder="Ex.: MEMBRO, DIÁCONO, LÍDER" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 dark:text-gray-200">Foto do membro</label>
              <input type="file" accept="image/*" onChange={handleFotoChange} />
              {foto && (<div className="mt-2"><img src={foto} alt="Foto" className="h-24 w-24 object-cover rounded" /></div>)}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 dark:text-gray-200">Modelo do crachá (PDF/Imagem)</label>
              <input type="file" accept="application/pdf,image/*" onChange={handleTemplateChange} />
              <select
                className="mt-2 w-full"
                value={selectedFrontId ?? ''}
                onChange={e => setSelectedFrontId(e.target.value ? Number(e.target.value) : null)}
              >
                <option value="">Modelo salvo (frente)</option>
                {templatesFront.map(t => (
                  <option key={t.id} value={t.id}>{t.name || `Modelo #${t.id}`}</option>
                ))}
              </select>
              {loadingPdf && <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">Processando PDF...</p>}
              {(frontImg || templateImg) && <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">Modelo carregado: {templateName || selectedFront?.name || 'imagem'}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 dark:text-gray-200">Costa do crachá (PDF/Imagem)</label>
              <input type="file" accept="application/pdf,image/*" onChange={handleBackChange} />
              <select
                className="mt-2 w-full"
                value={selectedBackId ?? ''}
                onChange={e => setSelectedBackId(e.target.value ? Number(e.target.value) : null)}
              >
                <option value="">Costa salva (verso)</option>
                {templatesBack.map(t => (
                  <option key={t.id} value={t.id}>{t.name || `Costa #${t.id}`}</option>
                ))}
              </select>
              {loadingPdf && <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">Processando PDF...</p>}
              {(backImgSel || backImg) && <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">Costa carregada: {backName || selectedBack?.name || 'imagem'}</p>}
            </div>
            <div className="flex gap-2 mt-2">
              <button type="button" className="btn-neon" onClick={handleSalvarCracha}>Salvar Crachá</button>
              <button type="button" className="btn-neon" onClick={handlePrint}>Imprimir Crachá</button>
              <button type="button" className="btn-neon" onClick={handleExportPdf}>Exportar PDF</button>
            </div>
          </form>
          <div>
            <div ref={badgeRef} className="relative overflow-hidden rounded-lg border border-primary/40 shadow-md" style={{ width: 320, height: 480 }}>
              {/* Background template */}
              <div style={{ position: 'absolute', inset: 0, background: frontImg ? `url(${resolveAsset(frontImg)}) center/cover no-repeat` : 'linear-gradient(180deg,#11558a 0%,#0a3560 100%)' }} />
              {/* Overlay content */}
              <div className="absolute inset-0 px-4 py-3 flex flex-col items-center text-white">
                <div className="mt-2 text-center inline-block rounded px-2 py-1">
                  <div className="text-lg font-extrabold tracking-wider text-[#001f4d]">SMHB</div>
                  <div className="text-xs font-bold text-[#001f4d]">REMIDOS DO SENHOR</div>
                </div>
                <div className="mt-4 h-32 w-32 rounded-full overflow-hidden ring-4 ring-white/60 shadow">
                  {foto && <img src={foto} alt="Foto" className="h-full w-full object-cover" />}
                </div>
                <div className="mt-4 text-xl font-extrabold text-center">{nome || 'NOME DO MEMBRO'}</div>
                <div className="text-sm opacity-90">{cargo || 'MEMBRO'}</div>
                <div className="mt-3 w-full text-xs">
                  <div className="grid grid-cols-[auto_1fr] gap-2 py-1 border-t border-white/20">
                    <div className="opacity-90">ID</div>
                    <div className="font-semibold">{idNumero}</div>
                  </div>
                  <div className="grid grid-cols-[auto_1fr] gap-2 py-1 border-t border-white/20">
                    <div className="opacity-90">T.S</div>
                    <div className="font-semibold">{ts}</div>
                  </div>
                  <div className="grid grid-cols-[auto_1fr] gap-2 py-1 border-t border-white/20">
                    <div className="opacity-90">BATISMO</div>
                    <div className="font-semibold">{formatBR(batismo)}</div>
                  </div>
                  <div className="grid grid-cols-[auto_1fr] gap-2 py-1 border-t border-white/20">
                    <div className="opacity-90">IGREJA</div>
                    <div className="font-semibold whitespace-normal break-words">{igreja}</div>
                  </div>
                </div>
              </div>
            </div>
            <p className="text-xs text-gray-300 mt-2">Preview aproximado do crachá. O PDF final usa dimensões reais.</p>
            <div ref={backRef} className="relative overflow-hidden rounded-lg border border-primary/40 shadow-md mt-4" style={{ width: 320, height: 480 }}>
              {/* Background back side */}
              <div style={{ position: 'absolute', inset: 0, background: backImgSel ? `url(${resolveAsset(backImgSel)}) center/cover no-repeat` : 'linear-gradient(180deg,#11558a 0%,#0a3560 100%)' }} />
            </div>
            <p className="text-xs text-gray-300 mt-2">Preview da costa (verso) do crachá.</p>
          </div>
        </div>
      </div>
      <div className="card mt-4">
        <div className="p-4">
          <h2 className="font-montserrat text-lg font-semibold dark:text-gray-100">Crachás feitos</h2>
          {crachasFeitos.length === 0 ? (
            <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">Nenhum crachá registrado ainda.</p>
          ) : (
            <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-3">
              {crachasFeitos.map(item => (
                <div key={item.id} className="border rounded-md p-2 bg-white dark:bg-slate-800 dark:border-slate-700">
                  <div className="flex items-center gap-3 justify-between">
                    <div className="overflow-hidden rounded-sm border dark:border-slate-700" style={{ width: 90, height: 135 }}>
                       {String(item.front || item.thumb || '').startsWith('data:') && (
                         <img src={item.front || item.thumb} alt={`Miniatura de ${item.nome}`} className="h-full w-full object-cover" />
                       )}
                     </div>
                    <div className="flex-1">
                      <input
                        type="text"
                        value={item.nome || ''}
                        onChange={e => setCrachasFeitos(prev => prev.map(it => it.id === item.id ? { ...it, nome: e.target.value } : it))}
                        onBlur={e => updateCrachaNome(item.id, e.target.value)}
                        className="w-full text-sm font-medium dark:text-gray-100 bg-transparent border border-slate-300 dark:border-slate-700 rounded px-1 py-0.5"
                        placeholder="Nome"
                      />
                      <div className="text-xs text-gray-500 dark:text-gray-400">{item.createdAt ? new Date(item.createdAt).toLocaleString('pt-BR') : ''}</div>
                    </div>
                    <div className="flex-shrink-0 flex items-center gap-2">
                      {!String(item.front || item.thumb || '').startsWith('data:') && (
                         <button type="button" className="btn-neon text-xs px-2 py-1" onClick={() => regenerateFront(item)}>Regerar frente</button>
                       )}
                      <button type="button" className="btn-neon text-xs px-2 py-1" onClick={() => reprintCrachaFeito(item)}>Reimprimir</button>
                      <button type="button" className="btn-neon text-xs px-2 py-1" onClick={() => exportCrachaFeito(item)}>Exportar</button>
                      <button type="button" className="btn-neon text-xs px-2 py-1" onClick={() => removeCrachaFeito(item.id)}>Excluir</button>
                    </div>
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