/* eslint-env node */
/* global process */
import express from 'express'
import dotenv from 'dotenv'
import pkg from '@prisma/client'
const { PrismaClient } = pkg
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import nodemailer from 'nodemailer'

dotenv.config()

const app = express()
const port = process.env.PORT || 3001
const isDev = process.env.NODE_ENV !== 'production'

// Prisma client
const prisma = new PrismaClient()

// parse JSON
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// CORS para permitir chamadas do frontend (localhost e rede)
app.use((req, res, next) => {
  const origin = req.headers.origin
  const allowed = new Set(
    [
      process.env.APP_BASE_URL || '',
      'http://localhost:5174',
      'http://localhost:5173',
      'http://localhost:4175',
      'http://192.168.18.3:5174',
      'http://192.168.18.3:4175',
    ].filter(Boolean)
  )
  if (origin && allowed.has(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin)
    res.setHeader('Vary', 'Origin')
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  res.setHeader('Access-Control-Allow-Credentials', 'true')
  if (req.method === 'OPTIONS') {
    return res.status(204).end()
  }
  next()
})

// Auth helpers
function signToken(payload, opts = {}) {
  const secret = process.env.JWT_SECRET || 'devsecret'
  const options = { expiresIn: '7d', ...opts }
  return jwt.sign(payload, secret, options)
}

/* eslint-env node */
function authMiddleware(req, res, next) {
  try {
    const header = req.headers['authorization'] || ''
    const [scheme, token] = header.split(' ')
    if (scheme !== 'Bearer' || !token) return res.status(401).json({ error: 'Unauthorized' })
    const secret = process.env.JWT_SECRET || 'devsecret'
    const decoded = jwt.verify(token, secret)
    req.user = decoded
    next()
  } catch {
    return res.status(401).json({ error: 'Unauthorized' })
  }
}

app.get('/health', async (_req, res) => {
  const dbUrl = process.env.DATABASE_URL || ''
  if (!dbUrl.trim()) {
    return res.status(500).json({ ok: false, message: 'DATABASE_URL ausente no .env' })
  }
  try {
    await prisma.$connect()
    // simples consulta para validar conexão
    const result = await prisma.$queryRaw`SELECT 1 as ok`
    res.json({ ok: true, result })
  } catch (err) {
    res.status(500).json({ ok: false, error: err?.message || String(err) })
  } finally {
    try { await prisma.$disconnect() } catch { /* erro ao desconectar ignorado */ }
  }
})

// Generic GET by id for core collections
app.get('/api/:collection/:id', async (req, res, next) => {
  try {
    const { collection, id } = req.params
    const numId = parseInt(id)
    let row = null
    if (collection === 'membros') {
      row = await prisma.membro.findUnique({ where: { id: numId } })
    } else if (collection === 'eventos') {
      row = await prisma.evento.findUnique({ where: { id: numId } })
    } else if (collection === 'financas') {
      row = await prisma.financa.findUnique({ where: { id: numId } })
    } else if (collection === 'conteudos') {
      row = await prisma.conteudo.findUnique({ where: { id: numId } })
    } else {
      return next()
    }
    if (!row) return res.status(404).json({ error: `${collection.slice(0,-1)} não encontrado` })
    res.json(row)
  } catch (err) {
    res.status(500).json({ ok: false, error: err?.message || String(err) })
  }
})

// Email helper (optional)
async function sendResetEmail(toEmail, resetLink) {
  const host = process.env.SMTP_HOST
  const port = parseInt(process.env.SMTP_PORT || '0') || 0
  const user = process.env.SMTP_USER
  const pass = process.env.SMTP_PASS
  const from = process.env.SMTP_FROM || 'no-reply@localhost'
  if (!host || !port || !user || !pass) {
    console.warn('SMTP não configurado. Link de redefinição:', resetLink)
    return false
  }
  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  })
  await transporter.sendMail({
    from,
    to: toEmail,
    subject: 'Redefinição de senha',
    html: `
      <p>Você solicitou a redefinição de senha.</p>
      <p>Clique no link abaixo para definir uma nova senha (válido por 1 hora):</p>
      <p><a href="${resetLink}">Redefinir senha</a></p>
    `,
  })
  return true
}

// API: Auth
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, nome } = req.body || {}
    const e = String(email || '').trim().toLowerCase()
    const p = String(password || '')
    if (!e || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)) {
      return res.status(400).json({ error: 'Email inválido' })
    }
    if (!p || p.length < 6) {
      return res.status(400).json({ error: 'Senha deve ter 6+ caracteres' })
    }
    const existing = await prisma.usuario.findUnique({ where: { email: e } })
    if (existing) {
      return res.status(409).json({ error: 'Email já cadastrado' })
    }
    const senhaHash = await bcrypt.hash(p, 10)
    const user = await prisma.usuario.create({ data: { email: e, senhaHash, nome: nome || null } })
    const token = signToken({ sub: user.id, email: user.email })
    res.status(201).json({ user: { id: user.id, email: user.email, nome: user.nome }, token })
  } catch (err) {
    console.error('Erro register:', err)
    res.status(500).json({ error: 'Erro ao registrar' })
  }
})

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body || {}
    const e = String(email || '').trim().toLowerCase()
    const p = String(password || '')
    const user = await prisma.usuario.findUnique({ where: { email: e } })
    if (!user) return res.status(401).json({ error: 'Email ou senha inválidos' })
    const ok = await bcrypt.compare(p, user.senhaHash)
    if (!ok) return res.status(401).json({ error: 'Email ou senha inválidos' })
    const token = signToken({ sub: user.id, email: user.email })
    res.json({ user: { id: user.id, email: user.email, nome: user.nome }, token })
  } catch (err) {
    console.error('Erro login:', err)
    res.status(500).json({ error: 'Erro ao logar' })
  }
})

app.get('/api/auth/me', authMiddleware, async (req, res) => {
  try {
    const id = req.user?.sub
    if (!id) return res.status(401).json({ error: 'Unauthorized' })
    const user = await prisma.usuario.findUnique({ where: { id } })
    if (!user) return res.status(404).json({ error: 'Usuário não encontrado' })
    res.json({ user: { id: user.id, email: user.email, nome: user.nome } })
  } catch {
    res.status(500).json({ error: 'Erro ao buscar usuário' })
  }
})

// API: Avisos
app.get('/api/avisos', async (req, res) => {
  try {
    const dbUrl = process.env.DATABASE_URL || ''
    if (!dbUrl.trim()) {
      if (isDev) {
        const page = Math.max(parseInt(req.query.page) || 1, 1)
        const pageSize = Math.min(Math.max(parseInt(req.query.pageSize) || 10, 1), 100)
        return res.json({ data: [], page, pageSize, total: 0, hasMore: false })
      }
      return res.status(500).json({ ok: false, message: 'DATABASE_URL ausente no .env' })
    }
    const page = Math.max(parseInt(req.query.page) || 1, 1)
    const pageSize = Math.min(Math.max(parseInt(req.query.pageSize) || 10, 1), 100)
    const q = (req.query.q || '').toString().trim()

    const where = q
      ? {
          OR: [
            { titulo: { contains: q, mode: 'insensitive' } },
            { conteudo: { contains: q, mode: 'insensitive' } },
            { descricao: { contains: q, mode: 'insensitive' } },
          ],
        }
      : {}

    const [data, total] = await Promise.all([
      prisma.aviso.findMany({
        where,
        orderBy: { id: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.aviso.count({ where }),
    ])

    res.json({ data, page, pageSize, total, hasMore: page * pageSize < total })
  } catch (err) {
    const isDev = process.env.NODE_ENV !== 'production'
    if (isDev) {
      const page = Math.max(parseInt(req.query.page) || 1, 1)
      const pageSize = Math.min(Math.max(parseInt(req.query.pageSize) || 10, 1), 100)
      return res.json({ data: [], page, pageSize, total: 0, hasMore: false })
    }
    res.status(500).json({ ok: false, error: err?.message || String(err) })
  }
})

// Delete aviso
app.delete('/api/avisos/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id)
    await prisma.aviso.delete({ where: { id } })
    res.status(204).end()
  } catch (err) {
    res.status(500).json({ ok: false, error: err?.message || String(err) })
  }
})

app.post('/api/avisos', async (req, res) => {
  try {
    const dbUrl = process.env.DATABASE_URL || ''
    if (!dbUrl.trim()) {
      return res.status(500).json({ ok: false, message: 'DATABASE_URL ausente no .env' })
    }
    const { titulo, conteudo, descricao, inicio, fim } = req.body || {}
    if (!titulo || typeof titulo !== 'string') {
      return res.status(400).json({ ok: false, error: 'titulo é obrigatório' })
    }
    const created = await prisma.aviso.create({
      data: {
        titulo,
        conteudo: conteudo ?? null,
        descricao: descricao ?? null,
        inicio: inicio ? new Date(inicio) : null,
        fim: fim ? new Date(fim) : null,
      },
    })
    res.status(201).json(created)
  } catch (err) {
    res.status(500).json({ ok: false, error: err?.message || String(err) })
  }
})

// API: Membros
app.get('/api/membros', async (req, res) => {
  try {
    const dbUrl = process.env.DATABASE_URL || ''
    if (!dbUrl.trim()) {
      if (isDev) {
        const page = Math.max(parseInt(req.query.page) || 1, 1)
        const pageSize = Math.min(Math.max(parseInt(req.query.pageSize) || 10, 1), 100)
        return res.json({ data: [], page, pageSize, total: 0, hasMore: false })
      }
      return res.status(500).json({ ok: false, message: 'DATABASE_URL ausente no .env' })
    }
    const page = Math.max(parseInt(req.query.page) || 1, 1)
    const pageSize = Math.min(Math.max(parseInt(req.query.pageSize) || 10, 1), 100)
    const q = (req.query.q || '').toString().trim()

    const where = q
      ? { OR: [
            { nome: { contains: q, mode: 'insensitive' } },
            { endereco: { contains: q, mode: 'insensitive' } },
            { telefone: { contains: q, mode: 'insensitive' } },
          ] }
      : {}

    const [data, total] = await Promise.all([
      prisma.membro.findMany({
        where,
        orderBy: { id: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.membro.count({ where }),
    ])
    res.json({ data, page, pageSize, total, hasMore: page * pageSize < total })
  } catch (err) {
    if (isDev) {
      const page = Math.max(parseInt(req.query.page) || 1, 1)
      const pageSize = Math.min(Math.max(parseInt(req.query.pageSize) || 10, 1), 100)
      return res.json({ data: [], page, pageSize, total: 0, hasMore: false })
    }
    res.status(500).json({ ok: false, error: err?.message || String(err) })
  }
})

app.get('/api/membros/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id)
    const row = await prisma.membro.findUnique({ where: { id } })
    if (!row) return res.status(404).json({ error: 'Membro não encontrado' })
    res.json(row)
  } catch (err) {
    res.status(500).json({ ok: false, error: err?.message || String(err) })
  }
})

app.post('/api/membros', async (req, res) => {
  try {
    const { nome, endereco, telefone, aniversario, foto } = req.body || {}
    if (!nome || !endereco || !telefone) {
      return res.status(400).json({ ok: false, error: 'nome, endereco e telefone são obrigatórios' })
    }
    const created = await prisma.membro.create({
      data: {
        nome,
        endereco,
        telefone,
        aniversario: aniversario ? new Date(aniversario) : null,
        foto: foto ?? null,
      },
    })
    res.status(201).json(created)
  } catch (err) {
    res.status(500).json({ ok: false, error: err?.message || String(err) })
  }
})

app.put('/api/membros/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id)
    const { nome, endereco, telefone, aniversario, foto } = req.body || {}
    const updated = await prisma.membro.update({
      where: { id },
      data: {
        nome,
        endereco,
        telefone,
        aniversario: aniversario ? new Date(aniversario) : null,
        foto: foto ?? null,
      },
    })
    res.json(updated)
  } catch (err) {
    res.status(500).json({ ok: false, error: err?.message || String(err) })
  }
})

app.delete('/api/membros/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id)
    await prisma.membro.delete({ where: { id } })
    res.status(204).end()
  } catch (err) {
    res.status(500).json({ ok: false, error: err?.message || String(err) })
  }
})

// API: Eventos
app.get('/api/eventos', async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page) || 1, 1)
    const pageSize = Math.min(Math.max(parseInt(req.query.pageSize) || 10, 1), 100)
    const q = (req.query.q || '').toString().trim()

    const where = q ? { titulo: { contains: q, mode: 'insensitive' } } : {}
    const [data, total] = await Promise.all([
      prisma.evento.findMany({
        where,
        orderBy: { data: 'asc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.evento.count({ where }),
    ])
    res.json({ data, page, pageSize, total, hasMore: page * pageSize < total })
  } catch (err) {
    if (isDev) {
      const page = Math.max(parseInt(req.query.page) || 1, 1)
      const pageSize = Math.min(Math.max(parseInt(req.query.pageSize) || 10, 1), 100)
      return res.json({ data: [], page, pageSize, total: 0, hasMore: false })
    }
    res.status(500).json({ ok: false, error: err?.message || String(err) })
  }
})

app.get('/api/eventos/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id)
    const row = await prisma.evento.findUnique({ where: { id } })
    if (!row) return res.status(404).json({ error: 'Evento não encontrado' })
    res.json(row)
  } catch (err) {
    res.status(500).json({ ok: false, error: err?.message || String(err) })
  }
})

app.post('/api/eventos', async (req, res) => {
  try {
    const { titulo, data, horario, local, comparecido } = req.body || {}
    if (!titulo || !data || !local) {
      return res.status(400).json({ ok: false, error: 'titulo, data e local são obrigatórios' })
    }
    const created = await prisma.evento.create({
      data: {
        titulo,
        data: new Date(data),
        horario: horario ?? null,
        local,
        comparecido: Boolean(comparecido ?? false),
      },
    })
    res.status(201).json(created)
  } catch (err) {
    res.status(500).json({ ok: false, error: err?.message || String(err) })
  }
})

app.put('/api/eventos/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id)
    const { titulo, data, horario, local, comparecido } = req.body || {}
    const updated = await prisma.evento.update({
      where: { id },
      data: {
        titulo,
        data: data ? new Date(data) : undefined,
        horario: horario ?? null,
        local,
        comparecido: comparecido == null ? undefined : Boolean(comparecido),
      },
    })
    res.json(updated)
  } catch (err) {
    res.status(500).json({ ok: false, error: err?.message || String(err) })
  }
})

app.delete('/api/eventos/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id)
    await prisma.evento.delete({ where: { id } })
    res.status(204).end()
  } catch (err) {
    res.status(500).json({ ok: false, error: err?.message || String(err) })
  }
})

// API: Diretoria
app.get('/api/diretoria', async (_req, res) => {
  try {
    const data = await prisma.diretoria.findMany({ orderBy: { id: 'desc' } })
    res.json({ data })
  } catch (err) {
    if (isDev) {
      return res.json({ data: [] })
    }
    res.status(500).json({ ok: false, error: err?.message || String(err) })
  }
})

app.post('/api/diretoria', async (req, res) => {
  try {
    const { nome, cargo, foto } = req.body || {}
    if (!nome || !cargo) {
      return res.status(400).json({ ok: false, error: 'nome e cargo são obrigatórios' })
    }
    const created = await prisma.diretoria.create({
      data: { nome, cargo, foto: foto ?? null },
    })
    res.status(201).json(created)
  } catch (err) {
    res.status(500).json({ ok: false, error: err?.message || String(err) })
  }
})

app.delete('/api/diretoria/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id)
    await prisma.diretoria.delete({ where: { id } })
    res.status(204).end()
  } catch (err) {
    res.status(500).json({ ok: false, error: err?.message || String(err) })
  }
})

// API: Finanças
app.get('/api/financas', async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page) || 1, 1)
    const pageSize = Math.min(Math.max(parseInt(req.query.pageSize) || 20, 1), 100)
    const tipo = (req.query.tipo || '').toString().trim()

    const where = tipo ? { tipo } : {}
    const [data, total] = await Promise.all([
      prisma.financa.findMany({
        where,
        orderBy: { data: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.financa.count({ where }),
    ])
    res.json({ data, page, pageSize, total, hasMore: page * pageSize < total })
  } catch (err) {
    if (isDev) {
      const page = Math.max(parseInt(req.query.page) || 1, 1)
      const pageSize = Math.min(Math.max(parseInt(req.query.pageSize) || 20, 1), 100)
      return res.json({ data: [], page, pageSize, total: 0, hasMore: false })
    }
    res.status(500).json({ ok: false, error: err?.message || String(err) })
  }
})

app.get('/api/financas/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id)
    const row = await prisma.financa.findUnique({ where: { id } })
    if (!row) return res.status(404).json({ error: 'Lançamento não encontrado' })
    res.json(row)
  } catch (err) {
    res.status(500).json({ ok: false, error: err?.message || String(err) })
  }
})

app.post('/api/financas', async (req, res) => {
  try {
    const { tipo, valor, data, pagante, uso } = req.body || {}
    const t = String(tipo || '').trim()
    const requirePagante = t !== 'despesa'

    if (!t || valor == null || !data || (requirePagante && !String(pagante || '').trim())) {
      return res.status(400).json({ ok: false, error: 'tipo, valor e data são obrigatórios; pagante apenas para receitas' })
    }
    const created = await prisma.financa.create({
      data: {
        tipo: t,
        valor: Number(valor),
        data: new Date(data),
        // Para despesas, permitir vazio
        pagante: requirePagante ? String(pagante).trim() : '',
        // Uso continua opcional no backend; frontend exige para despesas
        uso: uso ?? null,
      },
    })
    res.status(201).json(created)
  } catch (err) {
    res.status(500).json({ ok: false, error: err?.message || String(err) })
  }
})

app.delete('/api/financas/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id)
    await prisma.financa.delete({ where: { id } })
    res.status(204).end()
  } catch (err) {
    res.status(500).json({ ok: false, error: err?.message || String(err) })
  }
})

app.delete('/api/financas', async (req, res) => {
  try {
    const { tipo } = req.query
    if (!tipo) {
      return res.status(400).json({ ok: false, error: 'tipo é obrigatório para apagar em lote' })
    }
    const result = await prisma.financa.deleteMany({ where: { tipo: String(tipo) } })
    res.json({ ok: true, deletedCount: result.count })
  } catch (err) {
    res.status(500).json({ ok: false, error: err?.message || String(err) })
  }
})

// API: Conteúdos
app.get('/api/conteudos', async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page) || 1, 1)
    const pageSize = Math.min(Math.max(parseInt(req.query.pageSize) || 20, 1), 200)
    const q = (req.query.q || '').toString().trim()

    const where = q
      ? {
          OR: [
            { tipo: { contains: q, mode: 'insensitive' } },
            { titulo: { contains: q, mode: 'insensitive' } },
          ],
        }
      : {}

    const [data, total] = await Promise.all([
      prisma.conteudo.findMany({
        where,
        orderBy: { data: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.conteudo.count({ where }),
    ])

    res.json({ data, page, pageSize, total, hasMore: page * pageSize < total })
  } catch (err) {
    if (isDev) {
      const page = Math.max(parseInt(req.query.page) || 1, 1)
      const pageSize = Math.min(Math.max(parseInt(req.query.pageSize) || 20, 1), 200)
      return res.json({ data: [], page, pageSize, total: 0, hasMore: false })
    }
    res.status(500).json({ ok: false, error: err?.message || String(err) })
  }
})

app.get('/api/conteudos/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id)
    const row = await prisma.conteudo.findUnique({ where: { id } })
    if (!row) return res.status(404).json({ error: 'Conteúdo não encontrado' })
    res.json(row)
  } catch (err) {
    res.status(500).json({ ok: false, error: err?.message || String(err) })
  }
})

app.post('/api/conteudos', async (req, res) => {
  try {
    const { tipo, titulo, data } = req.body || {}
    if (!tipo || !titulo || !data) {
      return res.status(400).json({ ok: false, error: 'tipo, titulo e data são obrigatórios' })
    }
    const created = await prisma.conteudo.create({
      data: { tipo, titulo, data: new Date(data) },
    })
    res.status(201).json(created)
  } catch (err) {
    res.status(500).json({ ok: false, error: err?.message || String(err) })
  }
})

app.put('/api/conteudos/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id)
    const { tipo, titulo, data } = req.body || {}
    const updated = await prisma.conteudo.update({
      where: { id },
      data: {
        tipo,
        titulo,
        data: data ? new Date(data) : undefined,
      },
    })
    res.json(updated)
  } catch (err) {
    res.status(500).json({ ok: false, error: err?.message || String(err) })
  }
})

app.delete('/api/conteudos/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id)
    await prisma.conteudo.delete({ where: { id } })
    res.status(204).end()
  } catch (err) {
    res.status(500).json({ ok: false, error: err?.message || String(err) })
  }
})

// API: Templates de Crachá
// GET /api/templates?page=EMBAIXADORES&lado=front|back
app.get('/api/templates', async (req, res) => {
  try {
    const page = (req.query.page || '').toString().trim()
    const lado = (req.query.lado || '').toString().trim()
    const where = {}
    if (page) where.page = page
    if (lado) where.lado = lado
    const templates = await prisma.badgeTemplate.findMany({ where, orderBy: { id: 'desc' } })
    res.json(templates)
  } catch (err) {
    if (isDev) {
      return res.json([])
    }
    res.status(500).json({ ok: false, error: err?.message || String(err) })
  }
})

// POST /api/templates  { id?, page, lado, name?, img }
// Create or update by optional id; supports multiple templates per page/lado
app.post('/api/templates', async (req, res) => {
  try {
    const { id, page, lado, name, img } = req.body || {}
    if (!page || !lado || !img) {
      return res.status(400).json({ ok: false, error: 'page, lado e img são obrigatórios' })
    }
    let saved
    if (id) {
      saved = await prisma.badgeTemplate.update({
        where: { id: Number(id) },
        data: { page, lado, name: name || null, img },
      })
    } else {
      saved = await prisma.badgeTemplate.create({
        data: { page, lado, name: name || null, img },
      })
    }
    res.status(id ? 200 : 201).json(saved)
  } catch (err) {
    res.status(500).json({ ok: false, error: err?.message || String(err) })
  }
})

// API: Crachás feitos
app.get('/api/crachas', async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page) || 1, 1)
    const pageSize = Math.min(Math.max(parseInt(req.query.pageSize) || 20, 1), 100)
    const origem = (req.query.origem || '').toString().trim()
    const where = origem ? { origem } : {}
    const [data, total] = await Promise.all([
      prisma.cracha.findMany({ where, orderBy: { id: 'desc' }, skip: (page - 1) * pageSize, take: pageSize }),
      prisma.cracha.count({ where }),
    ])
    res.json({ data, page, pageSize, total, hasMore: page * pageSize < total })
  } catch (err) {
    if (isDev) {
      const page = Math.max(parseInt(req.query.page) || 1, 1)
      const pageSize = Math.min(Math.max(parseInt(req.query.pageSize) || 20, 1), 100)
      return res.json({ data: [], page, pageSize, total: 0, hasMore: false })
    }
    res.status(500).json({ ok: false, error: err?.message || String(err) })
  }
})

app.post('/api/crachas', async (req, res) => {
  try {
    const { nome, front, back, origem, embaixadorId } = req.body || {}
    if (!nome || !front) {
      return res.status(400).json({ ok: false, error: 'nome e front são obrigatórios' })
    }
    const created = await prisma.cracha.create({
      data: {
        nome,
        front,
        back: back ?? null,
        origem: origem || 'CRACHAS',
        embaixadorId: embaixadorId == null ? null : Number(embaixadorId),
      },
    })
    res.status(201).json(created)
  } catch (err) {
    res.status(500).json({ ok: false, error: err?.message || String(err) })
  }
})

app.put('/api/crachas/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id)
    const { nome, front, back, origem, embaixadorId } = req.body || {}
    const updated = await prisma.cracha.update({
      where: { id },
      data: {
        nome,
        front: front ?? undefined,
        back: back == null ? undefined : back,
        origem: origem ?? undefined,
        embaixadorId: embaixadorId === undefined ? undefined : (embaixadorId == null ? null : Number(embaixadorId)),
      },
    })
    res.json(updated)
  } catch (err) {
    res.status(500).json({ ok: false, error: err?.message || String(err) })
  }
})

app.delete('/api/crachas/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id)
    await prisma.cracha.delete({ where: { id } })
    res.status(204).end()
  } catch (err) {
    res.status(500).json({ ok: false, error: err?.message || String(err) })
  }
})

app.listen(port, () => {
  console.log(`Server de saúde rodando em http://localhost:${port}/health`)
})

// API: Embaixadores
app.get('/api/embaixadores', async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page) || 1, 1)
    const pageSize = Math.min(Math.max(parseInt(req.query.pageSize) || 10, 1), 100)
    const q = (req.query.q || '').toString().trim()
    const pattern = `%${q}%`
    let data, countRows
    if (q) {
      data = await prisma.$queryRaw`SELECT * FROM "Embaixador" WHERE "nome" ILIKE ${pattern} OR "telefone" ILIKE ${pattern} OR "pai" ILIKE ${pattern} OR "mae" ILIKE ${pattern} ORDER BY "id" DESC LIMIT ${pageSize} OFFSET ${(page - 1) * pageSize}`
      countRows = await prisma.$queryRaw`SELECT COUNT(*)::int as count FROM "Embaixador" WHERE "nome" ILIKE ${pattern} OR "telefone" ILIKE ${pattern} OR "pai" ILIKE ${pattern} OR "mae" ILIKE ${pattern}`
    } else {
      data = await prisma.$queryRaw`SELECT * FROM "Embaixador" ORDER BY "id" DESC LIMIT ${pageSize} OFFSET ${(page - 1) * pageSize}`
      countRows = await prisma.$queryRaw`SELECT COUNT(*)::int as count FROM "Embaixador"`
    }
    const total = Array.isArray(countRows) ? (countRows[0]?.count || 0) : (countRows?.count || 0)
    res.json({ data, page, pageSize, total, hasMore: page * pageSize < total })
  } catch (err) {
    res.status(500).json({ ok: false, error: err?.message || String(err) })
  }
})

app.post('/api/embaixadores', async (req, res) => {
  try {
    const { nome, idade, telefone, foto, pai, mae } = req.body || {}
    if (!nome || typeof nome !== 'string') {
      return res.status(400).json({ ok: false, error: 'nome é obrigatório' })
    }
    const createdRows = await prisma.$queryRaw`INSERT INTO "Embaixador" ("nome","idade","telefone","foto","pai","mae","createdAt","updatedAt") VALUES (${nome}, ${idade == null ? null : Number(idade)}, ${telefone ?? null}, ${foto ?? null}, ${pai ?? null}, ${mae ?? null}, NOW(), NOW()) RETURNING *`
    const created = Array.isArray(createdRows) ? createdRows[0] : createdRows
    res.status(201).json(created)
  } catch (err) {
    res.status(500).json({ ok: false, error: err?.message || String(err) })
  }
})

// Atualizar embaixador (inclui seleção de templates)
app.put('/api/embaixadores/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id)
    const { nome, idade, telefone, foto, pai, mae, templateFrontId, templateBackId } = req.body || {}
    const updated = await prisma.embaixador.update({
      where: { id },
      data: {
        nome: nome ?? undefined,
        idade: idade === undefined ? undefined : (idade == null ? null : Number(idade)),
        telefone: telefone ?? undefined,
        foto: foto ?? undefined,
        pai: pai ?? undefined,
        mae: mae ?? undefined,
        templateFrontId: templateFrontId === undefined ? undefined : (templateFrontId == null ? null : Number(templateFrontId)),
        templateBackId: templateBackId === undefined ? undefined : (templateBackId == null ? null : Number(templateBackId)),
      },
    })
    res.json(updated)
  } catch (err) {
    res.status(500).json({ ok: false, error: err?.message || String(err) })
  }
})

app.delete('/api/embaixadores/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id)
    const result = await prisma.$executeRaw`DELETE FROM "Embaixador" WHERE "id" = ${id}`
    if ((result || 0) > 0) return res.status(204).end()
    return res.status(404).json({ ok: false, error: 'Embaixador não encontrado' })
  } catch (err) {
    res.status(500).json({ ok: false, error: err?.message || String(err) })
  }
})// Request password reset
app.post('/api/auth/reset/request', async (req, res) => {
  try {
    const { email } = req.body || {}
    const e = String(email || '').trim().toLowerCase()
    if (!e || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)) {
      return res.status(400).json({ error: 'Email inválido' })
    }
    const user = await prisma.usuario.findUnique({ where: { email: e } })
    // Always respond 200 to avoid email enumeration
    const baseUrl = process.env.APP_BASE_URL || 'http://localhost:5173'
    if (user) {
      const token = signToken({ sub: user.id, email: user.email, type: 'reset' }, { expiresIn: '1h' })
      const link = `${baseUrl}/redefinir-senha?token=${encodeURIComponent(token)}`
      const sent = await sendResetEmail(user.email, link)
      const dev = !sent
      // In dev (SMTP not configured), return the link to allow testing
      return res.json({ ok: true, devResetLink: dev ? link : undefined })
    }
    return res.json({ ok: true })
  } catch (err) {
    console.error('Erro reset request:', err)
    res.status(500).json({ error: 'Erro ao solicitar redefinição' })
  }
})

// Confirm password reset
app.post('/api/auth/reset/confirm', async (req, res) => {
  try {
    const { token, newPassword } = req.body || {}
    const p = String(newPassword || '')
    if (!p || p.length < 6) {
      return res.status(400).json({ error: 'Senha deve ter 6+ caracteres' })
    }
    const secret = process.env.JWT_SECRET || 'devsecret'
    let decoded
    try {
      decoded = jwt.verify(token, secret)
    } catch {
      return res.status(400).json({ error: 'Token inválido ou expirado' })
    }
    if (decoded?.type !== 'reset' || !decoded?.sub) {
      return res.status(400).json({ error: 'Token inválido' })
    }
    const id = decoded.sub
    const senhaHash = await bcrypt.hash(p, 10)
    const updated = await prisma.usuario.update({ where: { id }, data: { senhaHash } })
    return res.json({ ok: true, user: { id: updated.id, email: updated.email, nome: updated.nome } })
  } catch (err) {
    console.error('Erro reset confirm:', err)
    res.status(500).json({ error: 'Erro ao redefinir senha' })
  }
})
app.use((err, req, res, next) => {
  console.error('Erro não tratado:', err)
  if (res.headersSent) return next(err)
  const status = typeof err?.status === 'number' ? err.status : 500
  const message = err?.message || 'Erro interno do servidor'
  res.status(status).json({ ok: false, error: message })
})