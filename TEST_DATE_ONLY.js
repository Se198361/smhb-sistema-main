// Script simples para testar o formato de data

// Testar o formato de data que o input date retorna
const testDate = '2000-12-25'; // Formato YYYY-MM-DD

console.log('=== Teste de Formato de Data ===');
console.log('Data do input:', testDate);
console.log('Tipo:', typeof testDate);

// Verificar se está no formato correto
const isCorrectFormat = /^\d{4}-\d{2}-\d{2}$/.test(testDate);
console.log('Formato correto (YYYY-MM-DD):', isCorrectFormat);

// Tratar a data como string primeiro para evitar problemas de fuso horário
console.log('Formato brasileiro direto da string:', `${testDate.split('-')[2]}/${testDate.split('-')[1]}/${testDate.split('-')[0]}`);

// Testar conversão para objeto Date com fuso horário UTC
const dateObj = new Date(testDate + 'T00:00:00Z'); // Forçar UTC
console.log('Objeto Date criado (UTC):', dateObj);
console.log('Data válida:', !isNaN(dateObj.getTime()));

// Testar formatação brasileira
if (!isNaN(dateObj.getTime())) {
  const day = String(dateObj.getUTCDate()).padStart(2, '0');
  const month = String(dateObj.getUTCMonth() + 1).padStart(2, '0');
  const year = dateObj.getUTCFullYear();
  console.log('Formato brasileiro (UTC):', `${day}/${month}/${year}`);
}

console.log('\n=== Teste concluído ===');