// Script para testar diretamente a interação com o Supabase para salvar data de aniversário

// Importar o cliente Supabase diretamente
import { createClient } from '@supabase/supabase-js';

// Configuração do Supabase (substituir com suas credenciais reais)
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://seu-projeto.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'sua-chave-anonima';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testSupabaseBirthday() {
  console.log('=== Teste de Interação Direta com Supabase ===');
  
  // Dados de teste
  const testData = {
    nome: 'Teste Supabase',
    endereco: 'Rua Teste Supabase, 123',
    telefone: '(11) 88888-0000',
    aniversario: '1985-03-10', // Formato YYYY-MM-DD
    foto: ''
  };
  
  console.log('Dados a serem inseridos:');
  console.log(testData);
  
  try {
    // Inserir dados diretamente no Supabase
    console.log('\n1. Inserindo dados diretamente no Supabase...');
    const { data, error } = await supabase
      .from('Membro')
      .insert([testData])
      .select()
      .single();
    
    if (error) {
      console.error('Erro ao inserir dados:', error);
      return;
    }
    
    console.log('Dados inseridos com sucesso:');
    console.log(data);
    
    // Verificar se a data de aniversário foi salva corretamente
    console.log('\n2. Verificando data de aniversário salva:');
    if (data.aniversario) {
      console.log('Data de aniversário:', data.aniversario);
      console.log('Tipo:', typeof data.aniversario);
      
      // Verificar o formato da data
      const dateObj = new Date(data.aniversario);
      if (!isNaN(dateObj.getTime())) {
        console.log('Data válida:', dateObj.toISOString().split('T')[0]);
      } else {
        console.log('Data inválida');
      }
    } else {
      console.log('Data de aniversário NÃO FOI SALVA!');
    }
    
    // Recuperar os dados para verificar
    console.log('\n3. Recuperando dados do Supabase...');
    const { data: retrievedData, error: retrieveError } = await supabase
      .from('Membro')
      .select('*')
      .eq('id', data.id)
      .single();
    
    if (retrieveError) {
      console.error('Erro ao recuperar dados:', retrieveError);
      return;
    }
    
    console.log('Dados recuperados:');
    console.log(retrievedData);
    
    // Verificar a data recuperada
    console.log('\n4. Verificando data recuperada:');
    if (retrievedData.aniversario) {
      console.log('Data de aniversário recuperada:', retrievedData.aniversario);
      console.log('Tipo:', typeof retrievedData.aniversario);
    } else {
      console.log('Data de aniversário NÃO FOI RECUPERADA!');
    }
    
    // Limpar dados de teste
    console.log('\n5. Removendo dados de teste...');
    const { error: deleteError } = await supabase
      .from('Membro')
      .delete()
      .eq('id', data.id);
    
    if (deleteError) {
      console.error('Erro ao remover dados de teste:', deleteError);
    } else {
      console.log('Dados de teste removidos com sucesso.');
    }
    
    console.log('\n=== Teste concluído ===');
    
  } catch (error) {
    console.error('Erro durante o teste:', error);
  }
}

// Executar o teste
testSupabaseBirthday();