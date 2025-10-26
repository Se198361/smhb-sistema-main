// Script para testar o salvamento e recuperação da data de aniversário

import { createMembro, getMembroById, updateMembro, deleteMembro } from './src/lib/supabaseFunctions.js';

async function testBirthdaySave() {
  console.log('=== Teste de Salvamento de Data de Aniversário ===');
  
  // Dados de teste
  const testData = {
    nome: 'Teste Aniversário',
    endereco: 'Rua Teste, 123',
    telefone: '(11) 99999-0000',
    aniversario: '1990-05-15', // Formato YYYY-MM-DD
    foto: ''
  };
  
  try {
    // 1. Criar um membro de teste
    console.log('1. Criando membro de teste...');
    const createdMember = await createMembro(testData);
    console.log('Membro criado:', createdMember);
    
    const memberId = createdMember.id;
    
    // 2. Recuperar o membro para verificar se a data foi salva
    console.log('\n2. Recuperando membro criado...');
    const retrievedMember = await getMembroById(memberId);
    console.log('Membro recuperado:', retrievedMember);
    
    if (retrievedMember.aniversario) {
      console.log('Data de aniversário salva:', retrievedMember.aniversario);
      console.log('Tipo da data:', typeof retrievedMember.aniversario);
    } else {
      console.log('Data de aniversário NÃO FOI SALVA!');
    }
    
    // 3. Atualizar a data de aniversário
    console.log('\n3. Atualizando data de aniversário...');
    const updatedData = {
      aniversario: '1995-12-25' // Nova data
    };
    
    const updatedMember = await updateMembro(memberId, updatedData);
    console.log('Membro atualizado:', updatedMember);
    
    if (updatedMember.aniversario) {
      console.log('Nova data de aniversário:', updatedMember.aniversario);
    } else {
      console.log('Nova data de aniversário NÃO FOI SALVA!');
    }
    
    // 4. Recuperar novamente para confirmar a atualização
    console.log('\n4. Recuperando membro atualizado...');
    const finalMember = await getMembroById(memberId);
    console.log('Membro final:', finalMember);
    
    if (finalMember.aniversario) {
      console.log('Data de aniversário final:', finalMember.aniversario);
    }
    
    // 5. Limpar dados de teste
    console.log('\n5. Removendo membro de teste...');
    await deleteMembro(memberId);
    console.log('Membro de teste removido.');
    
    console.log('\n=== Teste concluído ===');
    
  } catch (error) {
    console.error('Erro durante o teste:', error);
  }
}

// Executar o teste
testBirthdaySave();