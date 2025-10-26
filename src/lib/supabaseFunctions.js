import { supabase } from './supabase'

// Função auxiliar para tratamento de erros detalhado
function handleSupabaseError(error, operation, table = '') {
  if (!error) return null;
  
  console.error(`[Supabase Error] ${operation} em ${table || 'operação'}:`, {
    code: error.code,
    message: error.message,
    details: error.details,
    hint: error.hint
  });
  
  // Tratamento específico para erros de schema
  if (error.message && error.message.includes('could not find the table')) {
    return new Error(`Tabela '${table}' não encontrada. Verifique se ela foi criada corretamente no Supabase.`);
  }
  
  return error;
}

// Funções de autenticação
export async function registerUser(nome, email, password) {
  try {
    // Criar usuário no Supabase Auth (sem criar registro em Usuario ainda)
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: window.location.origin + '/login',
        data: { nome }
      }
    })

    if (authError) {
      // Mensagem amigável quando e-mail já existe no Auth
      if (authError.message && authError.message.toLowerCase().includes('already registered')) {
        throw new Error('E-mail já cadastrado. Vá para Login e use “Reenviar confirmação”.')
      }
      throw authError
    }

    // Não criar Usuario aqui; aguardamos confirmação e primeiro login
    return { status: 'pending_email_confirmation', user: null }
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

    const authUser = data.user

    // Buscar ou criar dados do usuário na tabela Usuario após login (confirmado)
    let usuario
    const { data: userData, error: userError } = await supabase
      .from('Usuario')
      .select('id, email, nome')
      .eq('email', email)
      .single()

    if (userError) {
      // Se não encontrado, criar registro
      if (userError.code === 'PGRST116') {
        const nome = authUser?.user_metadata?.nome || ''
        const { data: created, error: createError } = await supabase
          .from('Usuario')
          .insert([{ email, nome, senhaHash: authUser.id }])
          .select('id, email, nome')
          .single()
        if (createError) {
          const handledError = handleSupabaseError(createError, 'Criação de usuário após login', 'Usuario');
          throw handledError;
        }
        usuario = created
      } else {
        const handledError = handleSupabaseError(userError, 'Busca de usuário', 'Usuario');
        throw handledError;
      }
    } else {
      usuario = userData
    }

    return {
      user: {
        id: usuario.id,
        email: usuario.email,
        nome: usuario.nome
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

    if (error) {
      const handledError = handleSupabaseError(error, 'Busca de usuário atual', 'Usuario');
      throw handledError;
    }

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

    if (error) {
      const handledError = handleSupabaseError(error, 'Busca de avisos', 'Aviso');
      throw handledError;
    }

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

    if (error) {
      const handledError = handleSupabaseError(error, 'Criação de aviso', 'Aviso');
      throw handledError;
    }
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

    if (error) {
      const handledError = handleSupabaseError(error, 'Exclusão de aviso', 'Aviso');
      throw handledError;
    }
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

    if (error) {
      const handledError = handleSupabaseError(error, 'Busca de membros', 'Membro');
      throw handledError;
    }

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

    if (error) {
      const handledError = handleSupabaseError(error, 'Busca de membro por ID', 'Membro');
      throw handledError;
    }
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

    if (error) {
      const handledError = handleSupabaseError(error, 'Criação de membro', 'Membro');
      throw handledError;
    }
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

    if (error) {
      const handledError = handleSupabaseError(error, 'Atualização de membro', 'Membro');
      throw handledError;
    }
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

    if (error) {
      const handledError = handleSupabaseError(error, 'Exclusão de membro', 'Membro');
      throw handledError;
    }
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

    if (error) {
      const handledError = handleSupabaseError(error, 'Busca de eventos', 'Evento');
      throw handledError;
    }

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

    if (error) {
      const handledError = handleSupabaseError(error, 'Busca de evento por ID', 'Evento');
      throw handledError;
    }
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

    if (error) {
      const handledError = handleSupabaseError(error, 'Criação de evento', 'Evento');
      throw handledError;
    }
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

    if (error) {
      const handledError = handleSupabaseError(error, 'Atualização de evento', 'Evento');
      throw handledError;
    }
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

    if (error) {
      const handledError = handleSupabaseError(error, 'Exclusão de evento', 'Evento');
      throw handledError;
    }
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

    if (error) {
      const handledError = handleSupabaseError(error, 'Busca de diretoria', 'Diretoria');
      throw handledError;
    }
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

    if (error) {
      const handledError = handleSupabaseError(error, 'Criação de diretor', 'Diretoria');
      throw handledError;
    }
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

    if (error) {
      const handledError = handleSupabaseError(error, 'Exclusão de diretor', 'Diretoria');
      throw handledError;
    }
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

    if (error) {
      const handledError = handleSupabaseError(error, 'Busca de finanças', 'Financa');
      throw handledError;
    }

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

    if (error) {
      const handledError = handleSupabaseError(error, 'Busca de finança por ID', 'Financa');
      throw handledError;
    }
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

    if (error) {
      const handledError = handleSupabaseError(error, 'Criação de finança', 'Financa');
      throw handledError;
    }
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

    if (error) {
      const handledError = handleSupabaseError(error, 'Exclusão de finança', 'Financa');
      throw handledError;
    }
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

    if (error) {
      const handledError = handleSupabaseError(error, 'Exclusão de finanças por tipo', 'Financa');
      throw handledError;
    }
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

    if (error) {
      const handledError = handleSupabaseError(error, 'Busca de conteúdos', 'Conteudo');
      throw handledError;
    }

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

    if (error) {
      const handledError = handleSupabaseError(error, 'Busca de conteúdo por ID', 'Conteudo');
      throw handledError;
    }
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

    if (error) {
      const handledError = handleSupabaseError(error, 'Criação de conteúdo', 'Conteudo');
      throw handledError;
    }
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

    if (error) {
      const handledError = handleSupabaseError(error, 'Atualização de conteúdo', 'Conteudo');
      throw handledError;
    }
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

    if (error) {
      const handledError = handleSupabaseError(error, 'Exclusão de conteúdo', 'Conteudo');
      throw handledError;
    }
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

    if (error) {
      const handledError = handleSupabaseError(error, 'Busca de templates', 'BadgeTemplate');
      throw handledError;
    }
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

      if (error) {
        const handledError = handleSupabaseError(error, 'Atualização de template', 'BadgeTemplate');
        throw handledError;
      }
      result = data
    } else {
      // Criar novo template
      const { data, error } = await supabase
        .from('BadgeTemplate')
        .insert([templateData])
        .select()
        .single()

      if (error) {
        const handledError = handleSupabaseError(error, 'Criação de template', 'BadgeTemplate');
        throw handledError;
      }
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

    if (error) {
      const handledError = handleSupabaseError(error, 'Busca de crachás', 'Cracha');
      throw handledError;
    }

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

    if (error) {
      const handledError = handleSupabaseError(error, 'Criação de crachá', 'Cracha');
      throw handledError;
    }
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

    if (error) {
      const handledError = handleSupabaseError(error, 'Atualização de crachá', 'Cracha');
      throw handledError;
    }
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

    if (error) {
      const handledError = handleSupabaseError(error, 'Exclusão de crachá', 'Cracha');
      throw handledError;
    }
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

    if (error) {
      const handledError = handleSupabaseError(error, 'Busca de embaixadores', 'Embaixador');
      throw handledError;
    }

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

    if (error) {
      const handledError = handleSupabaseError(error, 'Criação de embaixador', 'Embaixador');
      throw handledError;
    }
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

    if (error) {
      const handledError = handleSupabaseError(error, 'Atualização de embaixador', 'Embaixador');
      throw handledError;
    }
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

    if (error) {
      const handledError = handleSupabaseError(error, 'Exclusão de embaixador', 'Embaixador');
      throw handledError;
    }
    return true
  } catch (error) {
    console.error('Erro ao deletar embaixador:', error)
    throw error
  }
}