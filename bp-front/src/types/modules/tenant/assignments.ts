export const assignmentNames = {
  COST_CENTER: 'Centro de Custo',
  USER: 'Usuário',
  CLIENT: 'Cliente',
  PACKAGE: 'Pacote',
  SOURCE: 'Fonte',
  EVENT: 'Evento',
  CLIENT_HISTORY: 'Histórico do Cliente'
} as const

export interface IAssignment {
  id: string
  name: string
}
