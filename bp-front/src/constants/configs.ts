export const STORAGE_KEYS = {
  TOKEN: 'accessToken',
  REFRESH_TOKEN: 'refreshToken',
  USER: 'userData',
  AUTH_DATA: 'aginco@authData'
}

export const PERMISSIONS_VALUES = {
  create: 'create',
  read: 'read',
  update: 'update',
  delete: 'delete'
}

export const PERMISSIONS_MODULES = {
  USER: 'USER'
}

export const ASSIGNMENTS = [PERMISSIONS_MODULES.USER]

export const HTTP_STATUS_CODES = {
  SUCCESS: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500
}
