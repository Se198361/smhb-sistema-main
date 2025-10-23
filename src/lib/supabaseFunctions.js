import { supabase } from './supabase'

// Funções de autenticação
export async function registerUser(nome, email, password) {
  try {
    // Verificar se o email já existe
    const { data: existingUser, error: existingUserError } = await supabase
      .from('Usuario')
      .select('id')
      .eq('email', email)
      .single()

    if (existingUser && !existingUserError) {
      throw new Error('Email já cadastrado')
    }

    // Criar usuário no Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          nome
        }
      }
    })

    if (authError) throw authError

    // Criar registro na tabela Usuario
    const { data: userData, error: userError } = await supabase
      .from('Usuario')
      .insert([
        {
          email,
          nome,
          senhaHash: authData.user.id // Usar o ID do usuário como senhaHash temporário
        }
      ])
      .select()
      .single()

    if (userError) throw userError

    return {
      user: {
        id: userData.id,
        email: userData.email,
        nome: userData.nome
      }
    }
  } catch (error) {
    console.error('Erro no registro:', error)
    throw error
  }
}

export async function loginUser(email, password) {
  try {
    // Login no Supabase Auth
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (error) throw error

    // Buscar dados do usuário na tabela Usuario
    const { data: userData, error: userError } = await supabase
      .from('Usuario')
      .select('id, email, nome')
      .eq('email', email)
      .single()

    if (userError) throw userError

    return {
      user: {
        id: userData.id,
        email: userData.email,
        nome: userData.nome
      },
      session: data.session
    }
  } catch (error) {
    console.error('Erro no login:', error)
    throw error
  }
}

export async function getCurrentUser() {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      throw new Error('Usuário não autenticado')
    }

    // Buscar dados adicionais do usuário na tabela Usuario
    const { data: userData, error } = await supabase
      .from('Usuario')
      .select('id, email, nome')
      .eq('email', user.email)
      .single()

    if (error) throw error

    return {
      id: userData.id,
      email: userData.email,
      nome: userData.nome
    }
  } catch (error) {
    console.error('Erro ao buscar usuário atual:', error)
    throw error
  }
}

export async function logoutUser() {
  try {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
    return true
  } catch (error) {
    console.error('Erro no logout:', error)
    throw error
  }
}

// Funções para Avisos
export async function getAvisos(page = 1, pageSize = 10, search = '') {
  try {
    let query = supabase
      .from('Aviso')
      .select('*', { count: 'exact' })
      .order('id', { ascending: false })
      .range((page - 1) * pageSize, page * pageSize - 1)

    if (search) {
      query = query.or(`titulo.ilike.%${search}%,conteudo.ilike.%${search}%,descricao.ilike.%${search}%`)
    }

    const { data, count, error } = await query

    if (error) throw error

    return {
      data: data || [],
      page,
      pageSize,
      total: count || 0,
      hasMore: page * pageSize < (count || 0)
    }
  } catch (error) {
    console.error('Erro ao buscar avisos:', error)
    return {
      data: [],
      page,
      pageSize,
      total: 0,
      hasMore: false
    }
  }
}

export async function createAviso(avisoData) {
  try {
    const { data, error } = await supabase
      .from('Aviso')
      .insert([avisoData])
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Erro ao criar aviso:', error)
    throw error
  }
}

export async function deleteAviso(id) {
  try {
    const { error } = await supabase
      .from('Aviso')
      .delete()
      .eq('id', id)

    if (error) throw error
    return true
  } catch (error) {
    console.error('Erro ao deletar aviso:', error)
    throw error
  }
}

// Funções para Membros
export async function getMembros(page = 1, pageSize = 10, search = '') {
  try {
    let query = supabase
      .from('Membro')
      .select('*', { count: 'exact' })
      .order('id', { ascending: false })
      .range((page - 1) * pageSize, page * pageSize - 1)

    if (search) {
      query = query.or(`nome.ilike.%${search}%,endereco.ilike.%${search}%,telefone.ilike.%${search}%`)
    }

    const { data, count, error } = await query

    if (error) throw error

    return {
      data: data || [],
      page,
      pageSize,
      total: count || 0,
      hasMore: page * pageSize < (count || 0)
    }
  } catch (error) {
    console.error('Erro ao buscar membros:', error)
    return {
      data: [],
      page,
      pageSize,
      total: 0,
      hasMore: false
    }
  }
}

export async function getMembroById(id) {
  try {
    const { data, error } = await supabase
      .from('Membro')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Erro ao buscar membro:', error)
    throw error
  }
}

export async function createMembro(membroData) {
  try {
    const { data, error } = await supabase
      .from('Membro')
      .insert([membroData])
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Erro ao criar membro:', error)
    throw error
  }
}

export async function updateMembro(id, membroData) {
  try {
    const { data, error } = await supabase
      .from('Membro')
      .update(membroData)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Erro ao atualizar membro:', error)
    throw error
  }
}

export async function deleteMembro(id) {
  try {
    const { error } = await supabase
      .from('Membro')
      .delete()
      .eq('id', id)

    if (error) throw error
    return true
  } catch (error) {
    console.error('Erro ao deletar membro:', error)
    throw error
  }
}

// Funções para Eventos
export async function getEventos(page = 1, pageSize = 10, search = '') {
  try {
    let query = supabase
      .from('Evento')
      .select('*', { count: 'exact' })
      .order('data', { ascending: true })
      .range((page - 1) * pageSize, page * pageSize - 1)

    if (search) {
      query = query.ilike('titulo', `%${search}%`)
    }

    const { data, count, error } = await query

    if (error) throw error

    return {
      data: data || [],
      page,
      pageSize,
      total: count || 0,
      hasMore: page * pageSize < (count || 0)
    }
  } catch (error) {
    console.error('Erro ao buscar eventos:', error)
    return {
      data: [],
      page,
      pageSize,
      total: 0,
      hasMore: false
    }
  }
}

export async function getEventoById(id) {
  try {
    const { data, error } = await supabase
      .from('Evento')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Erro ao buscar evento:', error)
    throw error
  }
}

export async function createEvento(eventoData) {
  try {
    const { data, error } = await supabase
      .from('Evento')
      .insert([eventoData])
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Erro ao criar evento:', error)
    throw error
  }
}

export async function updateEvento(id, eventoData) {
  try {
    const { data, error } = await supabase
      .from('Evento')
      .update(eventoData)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Erro ao atualizar evento:', error)
    throw error
  }
}

export async function deleteEvento(id) {
  try {
    const { error } = await supabase
      .from('Evento')
      .delete()
      .eq('id', id)

    if (error) throw error
    return true
  } catch (error) {
    console.error('Erro ao deletar evento:', error)
    throw error
  }
}

// Funções para Diretoria
export async function getDiretoria() {
  try {
    const { data, error } = await supabase
      .from('Diretoria')
      .select('*')
      .order('id', { ascending: false })

    if (error) throw error
    return { data: data || [] }
  } catch (error) {
    console.error('Erro ao buscar diretoria:', error)
    return { data: [] }
  }
}

export async function createDiretor(diretorData) {
  try {
    const { data, error } = await supabase
      .from('Diretoria')
      .insert([diretorData])
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Erro ao criar diretor:', error)
    throw error
  }
}

export async function deleteDiretor(id) {
  try {
    const { error } = await supabase
      .from('Diretoria')
      .delete()
      .eq('id', id)

    if (error) throw error
    return true
  } catch (error) {
    console.error('Erro ao deletar diretor:', error)
    throw error
  }
}

// Funções para Finanças
export async function getFinancas(page = 1, pageSize = 20, tipo = '') {
  try {
    let query = supabase
      .from('Financa')
      .select('*', { count: 'exact' })
      .order('data', { ascending: false })
      .range((page - 1) * pageSize, page * pageSize - 1)

    if (tipo) {
      query = query.eq('tipo', tipo)
    }

    const { data, count, error } = await query

    if (error) throw error

    return {
      data: data || [],
      page,
      pageSize,
      total: count || 0,
      hasMore: page * pageSize < (count || 0)
    }
  } catch (error) {
    console.error('Erro ao buscar finanças:', error)
    return {
      data: [],
      page,
      pageSize,
      total: 0,
      hasMore: false
    }
  }
}

export async function getFinancaById(id) {
  try {
    const { data, error } = await supabase
      .from('Financa')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Erro ao buscar finança:', error)
    throw error
  }
}

export async function createFinanca(financaData) {
  try {
    const { data, error } = await supabase
      .from('Financa')
      .insert([financaData])
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Erro ao criar finança:', error)
    throw error
  }
}

export async function deleteFinanca(id) {
  try {
    const { error } = await supabase
      .from('Financa')
      .delete()
      .eq('id', id)

    if (error) throw error
    return true
  } catch (error) {
    console.error('Erro ao deletar finança:', error)
    throw error
  }
}

export async function deleteFinancasByTipo(tipo) {
  try {
    const { error } = await supabase
      .from('Financa')
      .delete()
      .eq('tipo', tipo)

    if (error) throw error
    return true
  } catch (error) {
    console.error('Erro ao deletar finanças por tipo:', error)
    throw error
  }
}

// Funções para Conteúdos
export async function getConteudos(page = 1, pageSize = 20, search = '') {
  try {
    let query = supabase
      .from('Conteudo')
      .select('*', { count: 'exact' })
      .order('data', { ascending: false })
      .range((page - 1) * pageSize, page * pageSize - 1)

    if (search) {
      query = query.or(`tipo.ilike.%${search}%,titulo.ilike.%${search}%`)
    }

    const { data, count, error } = await query

    if (error) throw error

    return {
      data: data || [],
      page,
      pageSize,
      total: count || 0,
      hasMore: page * pageSize < (count || 0)
    }
  } catch (error) {
    console.error('Erro ao buscar conteúdos:', error)
    return {
      data: [],
      page,
      pageSize,
      total: 0,
      hasMore: false
    }
  }
}

export async function getConteudoById(id) {
  try {
    const { data, error } = await supabase
      .from('Conteudo')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Erro ao buscar conteúdo:', error)
    throw error
  }
}

export async function createConteudo(conteudoData) {
  try {
    const { data, error } = await supabase
      .from('Conteudo')
      .insert([conteudoData])
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Erro ao criar conteúdo:', error)
    throw error
  }
}

export async function updateConteudo(id, conteudoData) {
  try {
    const { data, error } = await supabase
      .from('Conteudo')
      .update(conteudoData)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Erro ao atualizar conteúdo:', error)
    throw error
  }
}

export async function deleteConteudo(id) {
  try {
    const { error } = await supabase
      .from('Conteudo')
      .delete()
      .eq('id', id)

    if (error) throw error
    return true
  } catch (error) {
    console.error('Erro ao deletar conteúdo:', error)
    throw error
  }
}

// Funções para Templates de Crachá
export async function getTemplates(page = '', lado = '') {
  try {
    let query = supabase
      .from('BadgeTemplate')
      .select('*')
      .order('id', { ascending: false })

    if (page) {
      query = query.eq('page', page)
    }

    if (lado) {
      query = query.eq('lado', lado)
    }

    const { data, error } = await query

    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Erro ao buscar templates:', error)
    return []
  }
}

export async function createOrUpdateTemplate(templateData) {
  try {
    let result
    if (templateData.id) {
      // Atualizar template existente
      const { data, error } = await supabase
        .from('BadgeTemplate')
        .update(templateData)
        .eq('id', templateData.id)
        .select()
        .single()

      if (error) throw error
      result = data
    } else {
      // Criar novo template
      const { data, error } = await supabase
        .from('BadgeTemplate')
        .insert([templateData])
        .select()
        .single()

      if (error) throw error
      result = data
    }
    return result
  } catch (error) {
    console.error('Erro ao criar/atualizar template:', error)
    throw error
  }
}

// Funções para Crachás
export async function getCrachas(page = 1, pageSize = 20, origem = '') {
  try {
    let query = supabase
      .from('Cracha')
      .select('*', { count: 'exact' })
      .order('id', { ascending: false })
      .range((page - 1) * pageSize, page * pageSize - 1)

    if (origem) {
      query = query.eq('origem', origem)
    }

    const { data, count, error } = await query

    if (error) throw error

    return {
      data: data || [],
      page,
      pageSize,
      total: count || 0,
      hasMore: page * pageSize < (count || 0)
    }
  } catch (error) {
    console.error('Erro ao buscar crachás:', error)
    return {
      data: [],
      page,
      pageSize,
      total: 0,
      hasMore: false
    }
  }
}

export async function createCracha(crachaData) {
  try {
    const { data, error } = await supabase
      .from('Cracha')
      .insert([crachaData])
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Erro ao criar crachá:', error)
    throw error
  }
}

export async function updateCracha(id, crachaData) {
  try {
    const { data, error } = await supabase
      .from('Cracha')
      .update(crachaData)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Erro ao atualizar crachá:', error)
    throw error
  }
}

export async function deleteCracha(id) {
  try {
    const { error } = await supabase
      .from('Cracha')
      .delete()
      .eq('id', id)

    if (error) throw error
    return true
  } catch (error) {
    console.error('Erro ao deletar crachá:', error)
    throw error
  }
}

// Funções para Embaixadores
export async function getEmbaixadores(page = 1, pageSize = 10, search = '') {
  try {
    let query = supabase
      .from('Embaixador')
      .select('*', { count: 'exact' })
      .order('id', { ascending: false })
      .range((page - 1) * pageSize, page * pageSize - 1)

    if (search) {
      query = query.or(`nome.ilike.%${search}%,telefone.ilike.%${search}%,pai.ilike.%${search}%,mae.ilike.%${search}%`)
    }

    const { data, count, error } = await query

    if (error) throw error

    return {
      data: data || [],
      page,
      pageSize,
      total: count || 0,
      hasMore: page * pageSize < (count || 0)
    }
  } catch (error) {
    console.error('Erro ao buscar embaixadores:', error)
    return {
      data: [],
      page,
      pageSize,
      total: 0,
      hasMore: false
    }
  }
}

export async function createEmbaixador(embaixadorData) {
  try {
    const { data, error } = await supabase
      .from('Embaixador')
      .insert([embaixadorData])
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Erro ao criar embaixador:', error)
    throw error
  }
}

export async function updateEmbaixador(id, embaixadorData) {
  try {
    const { data, error } = await supabase
      .from('Embaixador')
      .update(embaixadorData)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Erro ao atualizar embaixador:', error)
    throw error
  }
}

export async function deleteEmbaixador(id) {
  try {
    const { error } = await supabase
      .from('Embaixador')
      .delete()
      .eq('id', id)

    if (error) throw error
    return true
  } catch (error) {
    console.error('Erro ao deletar embaixador:', error)
    throw error
  }
}