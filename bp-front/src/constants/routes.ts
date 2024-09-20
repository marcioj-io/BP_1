export const ROUTES = {
  AUTH: {
    LOGIN: '/auth/login',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RECOVER_PASSWORD: '/auth/recover-password'
  },
  PRIVATE: '/admin',
  USERS: {
    LIST: '/admin/usuarios',
    CREATE: '/admin/usuarios/novoCadastro',
    EDIT: '/admin/usuarios/editar',
    EDIT_ROUTE: '/admin/usuarios/editar/:id'
  },
  COST_CENTERS: {
    LIST: '/admin/centros-de-custo',
    CREATE: '/admin/centros-de-custo/novoCadastro',
    EDIT: '/admin/centros-de-custo/editar',
    EDIT_ROUTE: '/admin/centros-de-custo/editar/:id'
  },
  SYSTEM_LOGS: {
    LIST: '/admin/logs-do-sistema'
  },
  SOURCES: {
    LIST: '/admin/fonte-de-pesquisa',
    CREATE: '/admin/fonte-de-pesquisa/novoCadastro',
    EDIT: '/admin/fonte-de-pesquisa/editar',
    EDIT_ROUTE: '/admin/fonte-de-pesquisa/editar/:id'
  },
  PACKAGES: {
    LIST: '/admin/pacotes',
    CREATE: '/admin/pacotes/novoCadastro',
    EDIT: '/admin/pacotes/editar',
    EDIT_ROUTE: '/admin/pacotes/editar/:id'
  },
  DASHBOARD: {
    HOME: '/admin/dashboard'
  },
  CONFIG: {
    HOME: '/admin/config'
  },
  PUBLIC: {
    FORBIDDEN: '/forbidden'
  }
}
