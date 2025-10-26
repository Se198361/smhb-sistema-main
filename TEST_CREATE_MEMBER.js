// Script para testar a criação de membro com data de aniversário

// Importar as funções necessárias
import { createMembro, getMembroById } from './src/lib/supabaseFunctions.js';

async function testCreateMemberWithBirthday() {
  console.log('=== Teste de Criação de Membro com Data de Aniversário ===');
  
  // Dados de teste
  const testData = {
    nome: 'Membro Teste',
    endereco: 'Rua Teste, 123',
    telefone: '(11) 99999-0000',
    aniversario: '1990-05-15', // Formato YYYY-MM-DD
    foto: ''
  };
  
  console.log('Dados a serem enviados:');
  console.log(JSON.stringify(testData, null, 2));
  
  try {
    // Criar o membro
    console.log('\n1. Criando membro...');
    const createdMember = await createMembro(testData);
    console.log('Membro criado com sucesso:');
    console.log(createdMember);
    
    // Verificar se a data de aniversário foi salva
    console.log('\n2. Verificando data de aniversário salva:');
    if (createdMember.aniversario) {
      console.log('Data de aniversário:', createdMember.aniversario);
      console.log('Tipo:', typeof createdMember.aniversario);
    } else {
      console.log('Data de aniversário NÃO FOI SALVA!');
    }
    
    // Recuperar o membro do banco para verificar
    console.log('\n3. Recuperando membro do banco de dados...');
    const memberId = createdMember.id;
    const retrievedMember = await getMembroById(memberId);
    console.log('Membro recuperado:');
    console.log(retrievedMember);
    
    if (retrievedMember.aniversario) {
      console.log('Data de aniversário recuperada:', retrievedMember.aniversario);
      console.log('Tipo:', typeof retrievedMember.aniversario);
    } else {
      console.log('Data de aniversário NÃO FOI RECUPERADA!');
    }
    
    // Limpar o membro de teste
    console.log('\n4. Limpando membro de teste...');
    // Aqui você pode adicionar código para deletar o membro de teste se necessário
    
    console.log('\n=== Teste concluído ===');
    
  } catch (error) {
    console.error('Erro durante o teste:', error);
  }
}

// Executar o teste
testCreateMemberWithBirthday();