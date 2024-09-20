export const MaskMoney = (
  value: string,
  applyDivision: boolean = true
): string => {
  if (value === '0') {
    return 'R$ 00,00'
  }

  const numericValue = value.replace(/\D/g, '')
  const parsedValue = parseInt(numericValue, 10)

  if (isNaN(parsedValue)) {
    return ''
  }

  const amount = applyDivision ? parsedValue / 100 : parsedValue
  const formattedAmount = amount.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  })

  return formattedAmount
}
