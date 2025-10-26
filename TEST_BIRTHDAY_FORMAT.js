// Script para testar o formato da data de aniversário
import { supabase } from './src/lib/supabase';
import { createMembro, getMembros } from './src/lib/supabaseFunctions';

async function testBirthdayFormat() {
  console.log('Testando formato da data de aniversário...');
  
  // Testar criação de membro com data de aniversário
  const testData = {
    nome: 'Teste Aniversário',
    endereco: 'Rua Teste, 123',
    telefone: '(11) 99999-0000',
    aniversario: '1990-05-15', // Formato ISO
    foto: ''
  };
  
  try {
    console.log('Inserindo membro com data de aniversário:', testData.aniversario);
    const created = await createMembro(testData);
    console.log('Membro criado:', created);
    
    // Recuperar o membro
    const membros = await getMembros(1, 10, 'Teste Aniversário');
    console.log('Membros recuperados:', membros);
    
    if (membros.data && membros.data.length > 0) {
      const membro = membros.data[0];
      console.log('Data de aniversário recuperada:', membro.aniversario);
      
      // Testar formatação
      const formatted = formatBR(membro.aniversario);
      console.log('Data formatada:', formatted);
    }
    
    // Limpar dados de teste
    if (created && created.id) {
      await supabase.from('Membro').delete().eq('id', created.id);
      console.log('Membro de teste removido');
    }
  } catch (error) {
    console.error('Erro no teste:', error);
  }
}

function formatBR(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) {
    const [y, m, day] = String(iso).split('-');
    return `${day?.padStart(2, '0')}/${m?.padStart(2, '0')}/${y}`;
  }
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

// Executar o teste
testBirthdayFormat();