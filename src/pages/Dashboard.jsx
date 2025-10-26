import { useEffect, useState, useCallback, useRef } from 'react'
import { getJson } from '../lib/api'

export default function Dashboard() {
  const [avisos, setAvisos] = useState([])
  const [index, setIndex] = useState(0)
  const [animIn, setAnimIn] = useState(true)
  const [financeLoading, setFinanceLoading] = useState(true)
  const [totalReceitas, setTotalReceitas] = useState(0)
  const [totalDespesas, setTotalDespesas] = useState(0)
  const [saldo, setSaldo] = useState(0)
  const [upcomingBirthdays, setUpcomingBirthdays] = useState([])
  const [upcomingEvents, setUpcomingEvents] = useState([])
  const loadedOnceRef = useRef(false)

  function formatBR(iso) {
    if (!iso) return ''
    
    // Se for uma string no formato YYYY-MM-DD (com ou sem hora), parsear diretamente
    if (typeof iso === 'string') {
      // Extrair apenas a parte da data (YYYY-MM-DD)
      const datePart = iso.split('T')[0];
      if (datePart && datePart.match(/^\d{4}-\d{2}-\d{2}/)) {
        const [y, m, day] = datePart.split('-')
        if (y && m && day) {
          return `${String(day).padStart(2, '0')}/${String(m).padStart(2, '0')}/${y}`
        }
      }
    }
    
    // Para outros formatos, usar o objeto Date
    const d = new Date(iso)
    if (Number.isNaN(d.getTime())) {
      return iso
    }
    
    const dd = String(d.getDate()).padStart(2, '0')
    const mm = String(d.getMonth() + 1).padStart(2, '0')
    const yyyy = d.getFullYear()
    return `${dd}/${mm}/${yyyy}`
  }

  function formatTime(hhmm) {
    if (!hhmm) return ''
    const [h, m] = String(hhmm).split(':')
    if (!h || !m) return String(hhmm)
    return `${h.padStart(2,'0')}:${m.padStart(2,'0')}`
  }

  const loadUpcomingEvents = useCallback(async () => {
    try {
      const res = await getJson('/api/eventos?page=1&pageSize=100')
      const list = res?.data || []
      const todayMid = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate()).getTime()
      const toDateTime = (ev) => {
        const base = ev?.data ? String(ev.data) : ''
        const time = ev?.horario ? String(ev.horario) : ''
        const iso = time ? `${base}T${time}` : base
        const d = new Date(iso)
        return Number.isNaN(d.getTime()) ? new Date(ev?.data) : d
      }
      const upcoming = (list || [])
        .filter(e => e && e.titulo && e.data)
        .map(e => ({ ...e, dataObj: toDateTime(e) }))
        .filter(e => !Number.isNaN(e.dataObj.getTime()) && e.dataObj.getTime() >= todayMid)
        .sort((a, b) => a.dataObj.getTime() - b.dataObj.getTime())
        .slice(0, 5)
      setUpcomingEvents(upcoming)
    } catch (e) {
      if (e?.name === 'AbortError' || /aborted/i.test(e?.message || '')) return
      if (import.meta.env.VITE_DEBUG_LOGS === 'true') console.warn('Falha ao carregar eventos próximos:', e)
      setUpcomingEvents([])
    }
  }, [])

  function resolveCreatedDate(a) {
    return a?.criadoEm || a?.created_at || a?.createdAt || a?.created || a?.inserted_at || ''
  }

  function nextBirthdayDate(iso) {
    if (!iso) return null
    let month, day, year

    // Tratar strings (podem vir como YYYY-MM-DD ou YYYY-MM-DDTHH:mm:ssZ)
    if (typeof iso === 'string') {
      const datePart = iso.split('T')[0]
      const match = datePart.match(/^(\d{4})-(\d{2})-(\d{2})$/)
      if (match) {
        year = Number(match[1])
        month = Number(match[2])
        day = Number(match[3])
      } else {
        const d = new Date(iso)
        if (Number.isNaN(d.getTime())) return null
        year = d.getFullYear()
        month = d.getMonth() + 1
        day = d.getDate()
      }
    } else {
      // Tratar como objeto Date
      const d = new Date(iso)
      if (Number.isNaN(d.getTime())) return null
      year = d.getFullYear()
      month = d.getMonth() + 1
      day = d.getDate()
    }

    if (!month || !day) return null
    const today = new Date()
    const currentYear = today.getFullYear()

    // Criar data de aniversário para este ano
    let candidate = new Date(currentYear, month - 1, day)

    // Se o aniversário já passou este ano, usar o próximo ano
    const todayMid = new Date(today.getFullYear(), today.getMonth(), today.getDate())
    if (candidate < todayMid) {
      candidate = new Date(currentYear + 1, month - 1, day)
    }

    return candidate
  }

  const loadBirthdays = useCallback(async () => {
    try {
      const today = new Date()
      const msDay = 24 * 60 * 60 * 1000
      const res = await getJson('/api/membros?page=1&pageSize=100')
      const list = res?.data || []
      
      if (import.meta.env.VITE_DEBUG_LOGS === 'true') {
        console.log('Membros carregados para aniversariantes:', list)
      }
      
      const upcoming = (list || [])
        .filter(m => m && m.nome && m.aniversario)
        .map(m => {
          if (import.meta.env.VITE_DEBUG_LOGS === 'true') {
            console.log(`Processando aniversário de ${m.nome}:`, m.aniversario, typeof m.aniversario)
          }
          
          const next = nextBirthdayDate(m.aniversario)
          if (!next) return null
          const days = Math.ceil((next.getTime() - today.getTime()) / msDay)
          return { nome: m.nome, data: next, dias: days, aniversarioOriginal: m.aniversario }
        })
        .filter(Boolean)
        .sort((a, b) => a.data.getTime() - b.data.getTime())
        .slice(0, 5)
      
      if (import.meta.env.VITE_DEBUG_LOGS === 'true') {
        console.log('Aniversariantes processados:', upcoming)
      }
      
      setUpcomingBirthdays(upcoming)
    } catch (e) {
      if (e?.name === 'AbortError' || /aborted/i.test(e?.message || '')) return
      if (import.meta.env.VITE_DEBUG_LOGS === 'true') console.warn('Falha ao carregar aniversariantes:', e)
      setUpcomingBirthdays([])
    }
  }, [])

  useEffect(() => {
    let cancelled = false
    async function fetchAvisos() {
      try {
        const res = await getJson('/api/avisos?page=1&pageSize=10')
        setAvisos(res?.data || [])
      } catch (e) {
        if (e?.name === 'AbortError' || /aborted/i.test(e?.message || '')) return
        if (import.meta.env.VITE_DEBUG_LOGS === 'true') console.error('Erro ao carregar avisos recentes:', e)
      }
    }
    fetchAvisos()
    const refetch = setInterval(fetchAvisos, 15000)
    return () => { clearInterval(refetch) }
  }, [])

  useEffect(() => {
    loadBirthdays()
    loadUpcomingEvents()
    // Atualizar aniversariantes periodicamente para manter as 5 próximas corretas
    const refetchBirthdays = setInterval(loadBirthdays, 60 * 60 * 1000) // a cada 1h
    // Atualizar ao retornar ao foco/visibilidade
    const onVisibility = () => { if (!document.hidden) loadBirthdays() }
    document.addEventListener('visibilitychange', onVisibility)
    return () => {
      clearInterval(refetchBirthdays)
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [loadBirthdays, loadUpcomingEvents])

  useEffect(() => {
    let cancelled = false

    // Carregar resumo de finanças do cache local para evitar ficar em \"Carregando...\" na primeira renderização
    try {
      const raw = localStorage.getItem('finance-summary')
      if (raw) {
        const s = JSON.parse(raw)
        if (!cancelled) {
          const receitas = Number(s?.receitas) || 0
          const despesas = Number(s?.despesas) || 0
          const sl = Number(s?.saldo) || (receitas - despesas)
          setTotalReceitas(receitas)
          setTotalDespesas(despesas)
          setSaldo(sl)
          setFinanceLoading(false)
          loadedOnceRef.current = true
        }
      }
    } catch { /* ignore cache parse errors */ }

    // Removido AbortController para evitar abortos de /api/financas
    async function fetchFinance() {
      let autoClear
      try {
        // Exibir loading apenas na primeira montagem
        if (!loadedOnceRef.current) {
          setFinanceLoading(true)
          autoClear = setTimeout(() => {
            if (!cancelled) setFinanceLoading(false)
          }, 5000)
        }

        const res = await getJson('/api/financas?page=1&pageSize=100')
        const data = Array.isArray(res?.data) ? res.data : []
        const toNum = (v) => {
          if (typeof v === 'string') {
            const n = Number(v.replace(/\./g, '').replace(',', '.'))
            return Number.isNaN(n) ? 0 : n
          }
          const n = Number(v || 0)
          return Number.isNaN(n) ? 0 : n
        }
        const receitas = data.filter(i => String(i.tipo) !== 'despesa').reduce((acc, i) => acc + toNum(i.valor), 0)
        const despesas = data.filter(i => String(i.tipo) === 'despesa').reduce((acc, i) => acc + toNum(i.valor), 0)
        if (!cancelled) {
          setTotalReceitas(receitas)
          setTotalDespesas(despesas)
          setSaldo(receitas - despesas)
          loadedOnceRef.current = true
          try { localStorage.setItem('finance-summary', JSON.stringify({ receitas, despesas, saldo: receitas - despesas, at: Date.now() })) } catch { /* ignore cache set errors */ }
        }
      } catch (e) {
        if (e?.name === 'AbortError' || /aborted/i.test(e?.message || '')) return
        if (import.meta.env.VITE_DEBUG_LOGS === 'true') console.error('Erro ao carregar finanças:', e)
        // Após a primeira tentativa (mesmo com erro), não reativar loader em refetches
        loadedOnceRef.current = true
      } finally {
        if (autoClear) clearTimeout(autoClear)
        if (!cancelled) setFinanceLoading(false)
      }
    }

    // Primeiro carregamento
    fetchFinance()

    // Atualizações periódicas (não reativam loader)
    const refetch = setInterval(fetchFinance, 20000)

    // Atualização imediata quando Financas.jsx altera dados
    const onUpdated = () => { fetchFinance() }
    window.addEventListener('financas:updated', onUpdated)

    return () => { 
      cancelled = true
      clearInterval(refetch)
      window.removeEventListener('financas:updated', onUpdated)
    }
  }, [])

  useEffect(() => {
    if (!avisos.length) return
    setIndex(0)
    setAnimIn(true)
    const interval = setInterval(() => {
      setAnimIn(false)
      setTimeout(() => {
        setIndex((prev) => (prev + 1) % avisos.length)
        setAnimIn(true)
      }, 450) // tempo de saída antes da entrada
    }, 4000)
    return () => clearInterval(interval)
  }, [avisos])

  const current = avisos.length ? avisos[index] : null

  return (
    <div className="grid md:grid-cols-3 gap-6">
      <div className="card">
        <h2 className="font-montserrat font-semibold text-primary dark:text-light">Resumo Financeiro</h2>
        {financeLoading ? (
          <p className="text-sm text-gray-600 dark:text-gray-300">Carregando...</p>
        ) : (
          <div className="mt-2">
            <p className="text-xs text-gray-600 dark:text-gray-300">Em caixa atual</p>
            <p className={`text-lg font-semibold ${saldo >= 0 ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'}`}>R$ {saldo.toFixed(2)}</p>
            <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">Receitas: R$ {totalReceitas.toFixed(2)} | Despesas: R$ {totalDespesas.toFixed(2)}</p>
          </div>
        )}
      </div>
      <div className="card">
        <h2 className="font-montserrat font-semibold text-primary dark:text-light">Eventos Próximos</h2>
        {upcomingEvents.length === 0 ? (
          <p className="text-sm text-gray-600 dark:text-gray-300">Nenhum evento próximo</p>
        ) : (
          <ul className="text-sm text-gray-600 dark:text-gray-300 list-disc ml-6">
            {upcomingEvents.map((e) => (
              <li key={`${e.id}-${e.data}-${e.horario || ''}`}>
                <span className="dark:text-gray-100 font-medium">{e.titulo}</span> — {formatBR(e.dataObj)}{e.horario ? ` ${formatTime(e.horario)}h` : ''}
                {e.local ? <span className="text-xs text-gray-500 dark:text-gray-400"> • {e.local}</span> : null}
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className="card">
        <h2 className="font-montserrat font-semibold text-primary dark:text-light">Aniversariantes</h2>
        {upcomingBirthdays.length === 0 ? (
          <p className="text-sm text-gray-600 dark:text-gray-300">Nenhum aniversariante próximo</p>
        ) : (
          <ul className="text-sm text-gray-600 dark:text-gray-300 list-disc ml-6">
            {upcomingBirthdays.map((b) => (
              <li key={`${b.nome}-${b.data.toISOString()}`}>
                <span className="dark:text-gray-100">{b.nome}</span> — {formatBR(b.aniversarioOriginal)}
                {import.meta.env.VITE_DEBUG_LOGS === 'true' && (
                  <span className="text-xs text-gray-500 dark:text-gray-400"> 
                    {" "}(Calculado: {formatBR(b.data)})
                  </span>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className="md:col-span-3 card">
        <h2 className="font-montserrat font-semibold text-primary dark:text-light">Avisos Recentes</h2>
        {!current ? (
          <p className="text-sm text-gray-600 dark:text-gray-300">Sem avisos por enquanto</p>
        ) : (
          <div className="mt-2 overflow-hidden h-14">
            <style>{`
              @keyframes fadeSlideIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
              @keyframes fadeSlideOut { from { opacity: 1; transform: translateY(0); } to { opacity: 0; transform: translateY(-6px); } }
              .ticker-in { animation: fadeSlideIn 0.45s ease forwards; }
              .ticker-out { animation: fadeSlideOut 0.45s ease forwards; }
            `}</style>
            <div className={`${animIn ? 'ticker-in' : 'ticker-out'} flex items-center justify-between`}> 
              <span className="font-medium dark:text-gray-100 truncate max-w-[70%]">{current.titulo}</span>
              <span className="text-xs text-gray-500 dark:text-gray-400">Criado em: {formatBR(resolveCreatedDate(current))}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}