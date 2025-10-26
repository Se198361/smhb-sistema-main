// Script para testar a exibição correta da data de aniversário

// Funções de formatação
function formatBR(iso) {
  if (!iso) return ''
  
  // Se for uma string no formato YYYY-MM-DD (com ou sem hora), parsear diretamente
  if (typeof iso === 'string') {
    // Extrair apenas a parte da data (YYYY-MM-DD)
    const datePart = iso.split('T')[0];
    if (datePart && datePart.match(/^\d{4}-\d{2}-\d{2}/)) {
      const [y, m, day] = datePart.split('-')
      if (y && m && day) {
        return `${String(day).padStart(2, '0')}/${String(m).padStart(2, '0')}/${y}`
      }
    }
  }
  
  // Para outros formatos, usar o objeto Date
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) {
    return iso
  }
  
  const dd = String(d.getDate()).padStart(2, '0')
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const yyyy = d.getFullYear()
  return `${dd}/${mm}/${yyyy}`
}

// Função para calcular a próxima data de aniversário
function nextBirthdayDate(iso) {
  if (!iso) return null
  let month, day, year
  
  // Verificar se é uma string de data no formato YYYY-MM-DD
  if (typeof iso === 'string' && iso.match(/^\d{4}-\d{2}-\d{2}/)) {
    const [y, m, dd] = iso.split('-')
    year = Number(y)
    month = Number(m)
    day = Number(dd)
  } else {
    // Tratar como objeto Date
    const d = new Date(iso)
    if (Number.isNaN(d.getTime())) return null
    year = d.getFullYear()
    month = d.getMonth() + 1
    day = d.getDate()
  }
  
  if (!month || !day) return null
  const today = new Date()
  const currentYear = today.getFullYear()
  
  // Criar data de aniversário para este ano
  let candidate = new Date(currentYear, month - 1, day)
  
  // Se o aniversário já passou este ano, usar o próximo ano
  const todayMid = new Date(today.getFullYear(), today.getMonth(), today.getDate())
  if (candidate < todayMid) {
    candidate = new Date(currentYear + 1, month - 1, day)
  }
  
  return candidate
}

// Teste
console.log('=== Teste de Exibição de Aniversário ===');

// Dados de exemplo de um membro
const member = {
  nome: 'João Silva',
  aniversario: '1990-05-15'
};

console.log(`Membro: ${member.nome}`);
console.log(`Data de aniversário original: ${member.aniversario}`);
console.log(`Formatada: ${formatBR(member.aniversario)}`);

// Calcular próxima data de aniversário
const nextBirthday = nextBirthdayDate(member.aniversario);
if (nextBirthday) {
  console.log(`Próximo aniversário (calculado): ${formatBR(nextBirthday)}`);
  
  // Exibição correta - deve mostrar a data original, não a calculada
  console.log(`Exibição correta na Dashboard: ${formatBR(member.aniversario)}`);
}

console.log('\n=== Teste concluído ===');