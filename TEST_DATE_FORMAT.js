// Script simples para testar a formatação da data

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

// Testes
console.log('=== Testes de Formatação de Data ===');

// Teste 1: Data no formato ISO
const isoDate = '1990-05-15';
console.log(`Data ISO (${isoDate}):`, formatBR(isoDate));

// Teste 2: Data com dia de um dígito
const isoDate2 = '1990-05-05';
console.log(`Data ISO (${isoDate2}):`, formatBR(isoDate2));

// Teste 3: Data com mês de um dígito
const isoDate3 = '1990-01-15';
console.log(`Data ISO (${isoDate3}):`, formatBR(isoDate3));

// Teste 4: Objeto Date
const dateObj = new Date('1990-05-15');
console.log(`Objeto Date:`, formatBR(dateObj));

console.log('\n=== Testes concluídos ===');