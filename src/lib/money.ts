const brl = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })

/** Valores sempre em centavos inteiros; nunca ponto flutuante nos cálculos. */
export const formatBRL = (cents: number) => brl.format(cents / 100)

/** Converte "12,50" / "12.50" / "1.234,56" em centavos. Retorna null se inválido. */
export function parseBRLToCents(input: string): number | null {
  const raw = input.trim().replace(/[R$\s]/g, '')
  if (!raw) return null
  let normalized = raw
  if (raw.includes(',')) normalized = raw.replace(/\./g, '').replace(',', '.')
  if (!/^\d+(\.\d{1,2})?$/.test(normalized)) return null
  const [int, dec = ''] = normalized.split('.')
  return Number(int) * 100 + Number(dec.padEnd(2, '0'))
}

export const centsToInput = (cents?: number) =>
  cents === undefined ? '' : (cents / 100).toFixed(2).replace('.', ',')
