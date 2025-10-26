// Script para verificar como as datas de aniversário estão sendo armazenadas
import { createClient } from '@supabase/supabase-js';

// Configuração do Supabase (substituir com suas credenciais reais)
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://seu-projeto.supabase.co';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || 'sua-chave-anonima';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkBirthdayData() {
  try {
    console.log('Verificando dados de aniversário no banco de dados...\n');
    
    // Consultar alguns membros para verificar o formato da data
    const { data, error } = await supabase
      .from('Membro')
      .select('id, nome, aniversario')
      .limit(5);
    
    if (error) {
      console.error('Erro ao consultar membros:', error);
      return;
    }
    
    if (!data || data.length === 0) {
      console.log('Nenhum membro encontrado no banco de dados.');
      return;
    }
    
    console.log('Membros encontrados:');
    data.forEach((membro, index) => {
      console.log(`${index + 1}. ID: ${membro.id}`);
      console.log(`   Nome: ${membro.nome}`);
      console.log(`   Aniversário (bruto): ${membro.aniversario}`);
      console.log(`   Tipo: ${typeof membro.aniversario}`);
      
      if (membro.aniversario) {
        // Tentar diferentes formas de formatação
        const dateObj = new Date(membro.aniversario);
        if (!isNaN(dateObj.getTime())) {
          const formatted = formatDateBR(dateObj);
          console.log(`   Formatado como Date: ${formatted}`);
        } else {
          // Tentar parsear como string
          const parts = membro.aniversario.split('-');
          if (parts.length >= 3) {
            const [year, month, day] = parts;
            console.log(`   Parseado como string: ${day?.substring(0,2)}/${month}/${year}`);
          }
        }
      }
      console.log('');
    });
  } catch (error) {
    console.error('Erro ao executar o script:', error);
  }
}

function formatDateBR(date) {
  const dd = String(date.getDate()).padStart(2, '0');
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const yyyy = date.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

// Executar a verificação
checkBirthdayData();