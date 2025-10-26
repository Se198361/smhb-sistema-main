// Script para debugar o processo de salvamento da data de aniversário

// Simular o formato que o input date retorna
const testBirthday = '2000-12-25'; // Formato YYYY-MM-DD

console.log('=== Debug do Salvamento de Data de Aniversário ===');
console.log('Data do input (formato YYYY-MM-DD):', testBirthday);
console.log('Tipo da data:', typeof testBirthday);

// Verificar se a data está no formato correto
const isCorrectFormat = testBirthday && typeof testBirthday === 'string' && testBirthday.match(/^\d{4}-\d{2}-\d{2}/);
console.log('Formato correto (YYYY-MM-DD):', isCorrectFormat);

// Simular o processo de formatação
let formattedAniversario = testBirthday;
if (isCorrectFormat) {
  console.log('A data já está no formato correto, não precisa de formatação adicional');
  formattedAniversario = testBirthday;
} else {
  console.log('A data precisa de formatação adicional');
}

// Dados que seriam enviados para o backend
const memberData = {
  nome: 'Teste',
  endereco: 'Rua Teste',
  telefone: '123456789',
  aniversario: formattedAniversario,
  foto: ''
};

console.log('\nDados a serem enviados para o backend:');
console.log(JSON.stringify(memberData, null, 2));

// Verificar se a data está presente nos dados
console.log('\nVerificação da data nos dados:');
console.log('Aniversário presente:', !!memberData.aniversario);
console.log('Valor da data:', memberData.aniversario);
console.log('Tipo da data:', typeof memberData.aniversario);

console.log('\n=== Fim do Debug ===');