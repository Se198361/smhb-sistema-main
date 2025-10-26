// Script para verificar se as correções da data de aniversário estão funcionando

// Funções de formatação atualizadas
function formatBR(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) {
    // Se não for uma data válida, tentar parsear como string no formato YYYY-MM-DD
    const [y, m, day] = String(iso).split('-')
    if (y && m && day) {
      return `${String(day).padStart(2, '0')}/${String(m).padStart(2, '0')}/${y}`
    }
    return iso
  }
  const dd = String(d.getDate()).padStart(2, '0')
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const yyyy = d.getFullYear()
  return `${dd}/${mm}/${yyyy}`
}

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

// Testes
console.log('=== Testes de Formatação de Data ===');

// Teste 1: Data no formato ISO
const isoDate = '1990-05-15';
console.log(`Data ISO (${isoDate}):`, formatBR(isoDate));

// Teste 2: Objeto Date
const dateObj = new Date('1990-05-15');
console.log(`Objeto Date:`, formatBR(dateObj));

// Teste 3: Data inválida
const invalidDate = 'invalid-date';
console.log(`Data inválida:`, formatBR(invalidDate));

console.log('\n=== Testes de Cálculo de Próximo Aniversário ===');

// Teste 4: Aniversário futuro este ano
const futureBirthday = '2025-12-25';
const nextFuture = nextBirthdayDate(futureBirthday);
console.log(`Aniversário futuro (${futureBirthday}):`, nextFuture ? formatBR(nextFuture) : 'Inválido');

// Teste 5: Aniversário passado este ano
const pastBirthday = '2025-01-01';
const nextPast = nextBirthdayDate(pastBirthday);
console.log(`Aniversário passado (${pastBirthday}):`, nextPast ? formatBR(nextPast) : 'Inválido');

// Teste 6: Aniversário hoje
const today = new Date();
const todayStr = today.toISOString().split('T')[0];
const nextToday = nextBirthdayDate(todayStr);
console.log(`Aniversário hoje (${todayStr}):`, nextToday ? formatBR(nextToday) : 'Inválido');

console.log('\n=== Teste de Integração ===');

// Teste 7: Processo completo de um membro
const memberData = {
  nome: 'João Silva',
  aniversario: '1990-05-15'
};

console.log(`Membro: ${memberData.nome}`);
console.log(`Data de aniversário original: ${memberData.aniversario}`);
console.log(`Formatada: ${formatBR(memberData.aniversario)}`);

const nextBirthday = nextBirthdayDate(memberData.aniversario);
if (nextBirthday) {
  console.log(`Próximo aniversário: ${formatBR(nextBirthday)}`);
  
  const today = new Date();
  const timeDiff = nextBirthday.getTime() - today.getTime();
  const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
  console.log(`Dias até o aniversário: ${daysDiff}`);
}

console.log('\n=== Todos os testes concluídos ===');