// Script para debugar o salvamento da data de aniversário no frontend

// Simular o estado do componente
let aniversario = ''; // Estado inicial

// Função para simular a atualização do estado
function setAniversario(value) {
  console.log('Atualizando estado aniversario de', aniversario, 'para', value);
  aniversario = value;
}

// Simular a interação do usuário com o input date
console.log('=== Simulação de Interação com Input Date ===');

// Usuário seleciona uma data
const selectedDate = '2000-12-25'; // Formato que o input date retorna
console.log('Usuário selecionou a data:', selectedDate);

// Atualizar o estado do componente
setAniversario(selectedDate);

// Verificar o estado atual
console.log('Estado aniversario atual:', aniversario);
console.log('Tipo do estado:', typeof aniversario);

// Simular o processo de salvamento
console.log('\n=== Simulação do Processo de Salvamento ===');

// Verificar e formatar a data de aniversário se necessário
let formattedAniversario = aniversario;
if (aniversario && typeof aniversario === 'string' && aniversario.match(/^\d{4}-\d{2}-\d{2}/)) {
  console.log('A data já está no formato correto (YYYY-MM-DD)');
  formattedAniversario = aniversario;
}

// Dados que seriam enviados para o backend
const memberData = {
  nome: 'Teste',
  endereco: 'Rua Teste',
  telefone: '123456789',
  aniversario: formattedAniversario,
  foto: ''
};

console.log('Dados a serem enviados para o backend:');
console.log(JSON.stringify(memberData, null, 2));

// Verificar se a data está presente nos dados
console.log('\nVerificação da data nos dados:');
console.log('Aniversário presente:', !!memberData.aniversario);
console.log('Valor da data:', memberData.aniversario);
console.log('Tipo da data:', typeof memberData.aniversario);

// Testar a função de formatação brasileira
function formatBR(iso) {
  if (!iso) return '';
  
  // Se for uma string no formato YYYY-MM-DD (com ou sem hora), parsear diretamente
  if (typeof iso === 'string') {
    // Extrair apenas a parte da data (YYYY-MM-DD)
    const datePart = iso.split('T')[0];
    if (datePart && datePart.match(/^\d{4}-\d{2}-\d{2}/)) {
      const [y, m, day] = datePart.split('-');
      if (y && m && day) {
        return `${String(day).padStart(2, '0')}/${String(m).padStart(2, '0')}/${y}`;
      }
    }
  }
  
  // Para outros formatos, usar o objeto Date
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) {
    return iso;
  }
  
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

console.log('\nTeste de formatação brasileira:');
console.log('Data formatada:', formatBR(memberData.aniversario));

console.log('\n=== Fim da Simulação ===');