import { supabase } from './supabase'

// Função para verificar se as tabelas existem
export async function checkTables() {
  try {
    // Verificar se a tabela Usuario existe
    const { data: usuarioTable, error: usuarioError } = await supabase
      .from('information_schema.tables')
      .select('*')
      .eq('table_schema', 'public')
      .eq('table_name', 'Usuario')
    
    console.log('Tabela Usuario encontrada:', !!usuarioTable?.length)
    
    if (usuarioError) {
      console.error('Erro ao verificar tabela Usuario:', usuarioError)
    }
    
    // Verificar todas as tabelas esperadas
    const expectedTables = [
      'Usuario', 'Aviso', 'Membro', 'Evento', 'Diretoria', 
      'Financa', 'Conteudo', 'Cracha', 'Embaixador', 'BadgeTemplate'
    ]
    
    const tableChecks = {}
    
    for (const tableName of expectedTables) {
      try {
        const { data, error } = await supabase
          .from('information_schema.tables')
          .select('*')
          .eq('table_schema', 'public')
          .eq('table_name', tableName)
        
        tableChecks[tableName] = {
          exists: !!data?.length,
          error: error
        }
        
        if (error) {
          console.error(`Erro ao verificar tabela ${tableName}:`, error)
        }
      } catch (err) {
        tableChecks[tableName] = {
          exists: false,
          error: err
        }
        console.error(`Erro ao verificar tabela ${tableName}:`, err)
      }
    }
    
    return tableChecks
  } catch (error) {
    console.error('Erro geral ao verificar tabelas:', error)
    throw error
  }
}

// Função para verificar as colunas de uma tabela específica
export async function checkTableColumns(tableName) {
  try {
    const { data, error } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type, is_nullable')
      .eq('table_schema', 'public')
      .eq('table_name', tableName)
      .order('ordinal_position')
    
    if (error) {
      console.error(`Erro ao verificar colunas da tabela ${tableName}:`, error)
      throw error
    }
    
    console.log(`Colunas da tabela ${tableName}:`, data)
    return data
  } catch (error) {
    console.error(`Erro ao verificar colunas da tabela ${tableName}:`, error)
    throw error
  }
}

// Função para testar a conexão e consultar dados
export async function testConnection() {
  try {
    // Testar consulta simples
    const { data, error } = await supabase
      .from('Usuario')
      .select('id')
      .limit(1)
    
    if (error) {
      console.error('Erro no teste de conexão:', error)
      return { success: false, error }
    }
    
    console.log('Teste de conexão bem-sucedido')
    return { success: true, data }
  } catch (error) {
    console.error('Erro no teste de conexão:', error)
    return { success: false, error }
  }
}

// Função para forçar atualização do cache de schema
export async function refreshSchemaCache() {
  try {
    // Executar uma consulta que força a atualização do cache
    const { data, error } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .limit(1)
    
    if (error) {
      console.error('Erro ao atualizar cache de schema:', error)
      return { success: false, error }
    }
    
    console.log('Cache de schema atualizado')
    return { success: true, data }
  } catch (error) {
    console.error('Erro ao atualizar cache de schema:', error)
    return { success: false, error }
  }
}