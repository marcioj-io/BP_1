import { Languages } from 'src/utils/language-preference';

/**
 * @description
 * This helper file contains all the messages used in the application.
 *
 * It is used to centralize the messages and make it easier to change them.
 */
export const MessagesHelper = {
  PASSWORD_OR_EMAIL_INVALID: {
    'en-US':
      'Invalid email and/or password or the user does not have system access.',
    'pt-BR':
      'E-mail e/ou senha inválidos ou o usuário se encontra sem acesso ao sistema.',
  },
  USER_LOGGED: {
    'en-US': 'User successfully logged in!',
    'pt-BR': 'Usuário logado com sucesso!',
  },
  NEW_TOKEN_GENERATED: {
    'en-US': 'New refresh token successfully generated!',
    'pt-BR': 'Novo refresh token gerado com sucesso!',
  },
  MULTIPLE_LOGIN_ERROR: {
    'en-US':
      'User X was logged out from the previous session because another user logged in with their credentials!',
    'pt-BR':
      'Usuário X foi deslogado da sessão anterior porque outro usuário logou com suas credenciais!',
  },
  MULTIPLE_LOGIN_MESSAGE: {
    'en-US':
      'Active session on another device or the user was logged out by another session!',
    'pt-BR':
      'Sessão ativa em outro dispositivo ou o usuário foi deslogado por outra sessão!',
  },
  IP_REQUESTER_NOT_FOUND: {
    'en-US': 'Requester IP missing in request header',
    'pt-BR': 'Ip do requisitante faltando no header da requisição',
  },
  PASSWORD_CHANGED: {
    'en-US': 'User X password successfully changed!',
    'pt-BR': 'Senha do usuário X alterada com successo!',
  },
  PASSWORD_CHANGED_ERROR: {
    'en-US': 'User X password was not changed!',
    'pt-BR': 'Senha do usuário X não foi alterada!',
  },
  CREATE_USER_SUCCESS: {
    'en-US': 'User X successfully created!',
    'pt-BR': 'Usuário X criado com sucesso!',
  },
  CREATE_USER_ERROR: {
    'en-US': 'User X could not be created!',
    'pt-BR': 'Usuário X não conseguiu ser criado!',
  },
  INACTIVE_ERROR: {
    'en-US': 'User X could not be deactivated!',
    'pt-BR': 'Usuário X não conseguiu ser inativado!',
  },
  INACTIVE_SUCCESS: {
    'en-US': 'User X successfully deactivated!',
    'pt-BR': 'Usuário X inativado com sucesso!',
  },
  USER_UPDATED_SUCCESS: {
    'en-US': 'User X successfully updated!',
    'pt-BR': 'Usuário X atualizado com sucesso!',
  },
  USER_UPDATED_ERROR: {
    'en-US': 'Error updating User X!',
    'pt-BR': 'Erro ao atualizar usuário X!',
  },
  USER_UPDATE_YOURSELF: {
    'en-US': 'You are not allowed to update your own user!',
    'pt-BR': 'Não é permitido atualizar seu próprio usuário!',
  },
  USER_DELETED_SUCCESS: {
    'en-US': 'User X successfully deleted!',
    'pt-BR': 'Usuário X deletado com sucesso!',
  },
  USER_DELETED_ERROR: {
    'en-US': 'Error deleting User X!',
    'pt-BR': 'Erro ao deletar usuário X!',
  },
  USER_BLOCKED: {
    'en-US':
      'User X blocked due to excessive attempts, please contact an administrator!',
    'pt-BR':
      'Usuário X bloqueado por excesso de tentativas, procure um administrador!',
  },
  USER_BLOCKED_MESSAGE: {
    'en-US':
      'User blocked due to excessive attempts, please contact an administrator!',
    'pt-BR':
      'Usuário bloqueado por excesso de tentativas, procure um administrador!',
  },
  USER_BLOCKED_BY_ADMIN: {
    'en-US': 'User(s) X blocked by a system administrator!',
    'pt-BR': 'Usuário(s) X bloqueado por um administrador do sistema!',
  },
  USER_BLOCKED_BY_ADMIN_MESSAGE: {
    'en-US': 'User blocked by an administrator!',
    'pt-BR': 'Usuário bloqueado por um administrador!',
  },
  USER_NOT_AUTHORIZED: {
    'en-US': 'User X does not have permission to take this action!',
    'pt-BR': 'Usuário X não tem permissões para tomar a ação!',
  },
  NOT_AUTHORIZED_RESOURCE: {
    'en-US': 'User not authorized to use this resource!',
    'pt-BR': 'Usuário não autorizado a utilizar esse recurso!',
  },
  NO_PERMISSION: {
    'en-US': 'User does not have permission to access this data!',
    'pt-BR': 'Usuário não tem permissão para buscar esse dado!',
  },
  USER_BLOCKED_TRYING_ACCESS: {
    'en-US': 'User X blocked trying to access the system!',
    'pt-BR': 'Usuário X bloqueado tentando acessar o sistema!',
  },
  USER_INACTIVE_TRYING_ACCESS: {
    'en-US': 'Inactive User X trying to access the system!',
    'pt-BR': 'Usuário X inativo tentando acessar o sistema!',
  },
  USER_UNBLOCKED_SUCCESS: {
    'en-US': 'User X successfully unblocked!',
    'pt-BR': 'Usuários X desbloqueado com sucesso!',
  },
  USER_UNBLOCKED_ERROR: {
    'en-US': 'User(s) X could not be unblocked!',
    'pt-BR': 'Usuário(s) X não conseguiu ser desbloqueado!',
  },
  USER_NOT_FOUND: {
    'en-US': 'User X not found!',
    'pt-BR': 'Usuário X não encontrado!',
  },
  USERS_NOT_FOUND: {
    'en-US': 'Users not found!',
    'pt-BR': 'Usuários não encontrados!',
  },
  LOGIN_SUCCESS: {
    'en-US': 'User X successfully logged in!',
    'pt-BR': 'Login do usuário X efetuado com sucesso!',
  },
  LOGIN_ERROR: {
    'en-US': 'Error logging in User X, invalid user and/or password!',
    'pt-BR':
      'Erro ao efetuar login do usuário X, usuário e/ou senha inválidos!',
  },
  USER_LOGGED_OUT: {
    'en-US': 'User X successfully logged out!',
    'pt-BR': 'Usuário X deslogado com sucesso!',
  },
  REFRESH_TOKEN: {
    'en-US': 'Refresh token for User X successfully generated!',
    'pt-BR': 'Refresh token do usuário X gerado com sucesso!',
  },
  REFRESH_TOKEN_ERROR: {
    'en-US': 'Failed to generate refresh token for User X!',
    'pt-BR': 'Refresh token do usuário X não conseguiu ser gerado com sucesso!',
  },
  RESET_PASSWORD_SUCCESS: {
    'en-US': 'User X password reset successfully!',
    'pt-BR': 'Senha do usuário X resetada com sucesso!',
  },
  RESET_PASSWORD_ERROR: {
    'en-US': 'Error resetting User X password!',
    'pt-BR': 'Erro ao resetar senha do usuário X!',
  },
  REACTIVE_USER_SUCCESS: {
    'en-US': 'User X reactivated successfully!',
    'pt-BR': 'Usuário X reativado com sucesso!',
  },
  REACTIVE_USER_ERROR: {
    'en-US': 'Failed to reactivate User X!',
    'pt-BR': 'Usuário X não conseguiu ser reativado com sucesso!',
  },
  REFRESH_TOKEN_NOT_PRESENT: {
    'en-US': 'Refresh token not present in the request',
    'pt-BR': 'Refresh token não presente na requisição',
  },
  USER_ALREADY_REGISTERED: {
    'en-US': 'User already exists in the system',
    'pt-BR': 'Usuário já existe no sistema',
  },
  SUCCESS_SENDING_EMAIL: {
    'en-US': 'Email sent successfully',
    'pt-BR': 'Email enviado com sucesso',
  },
  FAIL_SENDING_EMAIL: {
    'en-US': 'Unable to send the email',
    'pt-BR': 'Não foi possível enviar o email',
  },
  ACCOUNT_DISABLED: {
    'en-US': 'This account is disabled',
    'pt-BR': 'Esta conta está desativada',
  },
  USER_INACTIVE: {
    'en-US': 'User X is inactive',
    'pt-BR': 'Usuário X está inativo',
  },
  EMAIL_ALREADY_IN_USE: {
    'en-US': 'Email is already in use',
    'pt-BR': 'Email já está em uso',
  },
  SESSION_EXPIRED: {
    'en-US': 'Session expired',
    'pt-BR': 'Sessão expirada',
  },
  PERSONAL_INFORMATION_UPDATED: {
    'en-US': 'User X personal information updated',
    'pt-BR': 'Informações pessoais do usuário X atualizadas',
  },
  PERSONAL_INFORMATION_UPDATED_ERROR: {
    'en-US': 'Error updating User X personal information',
    'pt-BR': 'Erro ao atualizar informações pessoais do usuário X',
  },
  TOKEN_INVALID: {
    'en-US': 'Invalid token',
    'pt-BR': 'Token inválido',
  },
  RECOVERY_PASSWORD_TOKEN_USED: {
    'en-US': 'Recovery password token already used',
    'pt-BR': 'Token de recuperação de senha já utilizado',
  },
  REFRESH_TOKEN_INVALID: {
    'en-US': 'Invalid refresh token',
    'pt-BR': 'Refresh token inválido',
  },
  EMAIL_NOT_PRESENT: {
    'en-US': 'Email not present in the request',
    'pt-BR': 'Email não presente na requisição',
  },
  INVALID_TOKEN: {
    'en-US': 'Invalid token',
    'pt-BR': 'Token inválido',
  },
  ACCESS_DENIED: {
    'en-US': 'Access denied',
    'pt-BR': 'Acesso negado',
  },
  USER_ALREADY_ACTIVED: {
    'en-US': 'User already active',
    'pt-BR': 'Usuário já está ativo',
  },
  BLOCK_ERROR: {
    'en-US': 'Error blocking the user',
    'pt-BR': 'Erro ao bloquear o usuário',
  },
  UNBLOCK_ERROR: {
    'en-US': 'Error unblocking the user',
    'pt-BR': 'Erro ao desbloquear o usuário',
  },
  PASSWORD_UNMATCH: {
    'en-US': 'Password does not match',
    'pt-BR': 'Senha não confere',
  },
  PASSWORD_ARE_EQUALS: {
    'en-US': 'New password must be different from the current one',
    'pt-BR': 'Nova senha deve ser diferente da atual',
  },
  DATA_PAGINATION_ERROR: {
    'en-US': 'Error in data pagination',
    'pt-BR': 'Erro ao paginar os dados',
  },
  NOT_FOUND: {
    'en-US': 'Data not found',
    'pt-BR': 'Dado não encontrado',
  },
  ID_REQUIRED: {
    'en-US': 'ID is required',
    'pt-BR': 'Id é obrigatório',
  },
  VERSION_REQUIRED: {
    'en-US': 'Version is required',
    'pt-BR': 'Versão é obrigatória',
  },
  EMAIL_ALREADY_EXISTS: {
    'en-US': 'Email already registered in the system',
    'pt-BR': 'Email já cadastrado no sistema',
  },
  MODULE_NAME_AND_ROLE_ID_REQUIRED: {
    'en-US': 'Module name and role id are required',
    'pt-BR': 'Nome do módulo e id da função são obrigatórios',
  },
  MODULE_NOT_FOUND_OR_INACCESSIBLE: {
    'en-US': 'Module not found or inaccessible',
    'pt-BR': 'Módulo não encontrado ou inacessível',
  },
  ASSIGNMENTS_NOT_FOUND: {
    'en-US': 'Assignments not found',
    'pt-BR': 'Atribuições não encontradas',
  },
  MODULE_NAME_REQUIRED: {
    'en-US': 'Module name is required',
    'pt-BR': 'Nome do módulo é obrigatório',
  },
  MODULE_NOT_FOUND: {
    'en-US': 'Module not found',
    'pt-BR': 'Módulo não encontrado',
  },
  ROLE_NOT_FOUND: {
    'en-US': 'Roles not found',
    'pt-BR': 'Funções não encontradas',
  },
  ASSIGNMENT_NOT_PERMITTED_FOR_ROLE: {
    'en-US': 'There ara any assignment not permitted for role',
    'pt-BR': 'Existem atribuições não permitidas para a função',
  },
  ROLE_NOT_PERMITTED_TO_UPSERT_USER_WITH_ROLE: {
    'en-US': 'Role not permitted to create or update user with role',
    'pt-BR':
      'Função não permitida para criar ou atualizar usuário com essa função',
  },
  USER_WITHOUT_ASSIGNMENTS: {
    'en-US': 'User without assignments',
    'pt-BR': 'Usuário sem atribuições',
  },
  USER_WITHOUT_PERMISSION_TO_DELETE_USER: {
    'en-US': 'User without permission to delete',
    'pt-BR': 'Usuário sem permissão para deletar',
  },
  USER_WITHOUT_PERMISSION_TO_UPDATE_USER: {
    'en-US': 'User without permission to update',
    'pt-BR': 'Usuário sem permissão para atualizar',
  },
  USER_WITHOUT_PERMISSION_TO_FIND_USER: {
    'en-US': 'User without permission to find',
    'pt-BR': 'Usuário sem permissão para buscar',
  },
  USER_WITHOUT_PERMISSION_TO_CREATE_USER: {
    'en-US': 'User without permission to create',
    'pt-BR': 'Usuário sem permissão para criar',
  },
  CURRENT_MODULE_REQUIRED: {
    'en-US': 'Current module is required',
    'pt-BR': 'Módulo atual é obrigatório',
  },
  INVALID_MODULE: {
    'en-US': 'Invalid module',
    'pt-BR': 'Módulo inválido',
  },
  GENERIC_ERROR: {
    'en-US': 'Error in the system',
    'pt-BR': 'Erro no sistema',
  },
  USER_DELETE_YOURSELF: {
    'en-US': 'User cannot delete itself',
    'pt-BR': 'Usuário não pode deletar a si mesmo',
  },
  FILTER_ROLE_NOT_PERMITTED_TO_MODULE: {
    'en-US': 'Filter of this role is not permitted to this module',
    'pt-BR': 'Filtro dessa função não permitido para esse módulo',
  },
  USER_ID_MISMATCH: {
    'en-US': 'User ID mismatch',
    'pt-BR': 'Id do usuário não confere',
  },
  INVALID_FILE_TYPE: {
    'en-US': 'Invalid file type',
    'pt-BR': 'Tipo de arquivo inválido',
  },
  FILE_TOO_LARGE: {
    'en-US': 'File too large',
    'pt-BR': 'Arquivo muito grande',
  },
  CLIENT_ALREADY_EXISTS: {
    'en-US': 'Client already exists',
    'pt-BR': 'Cliente já existe',
  },
  PACKAGE_NOT_FOUND: {
    'en-US': 'Packages not found',
    'pt-BR': 'Pacotes não encontrado',
  },
  CHANGE_YOUR_OWN_STATUS: {
    'en-US': 'You cannot change your own status',
    'pt-BR': 'Você não pode alterar seu próprio status',
  },
  CLIENT_NOT_FOUND: {
    'en-US': 'Client not found',
    'pt-BR': 'Cliente não encontrado',
  },
  COST_CENTER_NOT_FOUND: {
    'en-US': 'Cost center not found',
    'pt-BR': 'Centro de custo não encontrado',
  },
  LINKED_USERS: {
    'en-US': 'Cost center contains users',
    'pt-BR': 'Centro de custo contém usuário(s)',
  },
};

export enum MessagesHelperKey {
  PASSWORD_OR_EMAIL_INVALID = 'PASSWORD_OR_EMAIL_INVALID',
  USER_LOGGED = 'USER_LOGGED',
  NEW_TOKEN_GENERATED = 'NEW_TOKEN_GENERATED',
  MULTIPLE_LOGIN_ERROR = 'MULTIPLE_LOGIN_ERROR',
  MULTIPLE_LOGIN_MESSAGE = 'MULTIPLE_LOGIN_MESSAGE',
  IP_REQUESTER_NOT_FOUND = 'IP_REQUESTER_NOT_FOUND',
  PASSWORD_CHANGED = 'PASSWORD_CHANGED',
  PASSWORD_CHANGED_ERROR = 'PASSWORD_CHANGED_ERROR',
  CREATE_USER_SUCCESS = 'CREATE_USER_SUCCESS',
  CREATE_USER_ERROR = 'CREATE_USER_ERROR',
  INACTIVE_ERROR = 'INACTIVE_ERROR',
  INACTIVE_SUCCESS = 'INACTIVE_SUCCESS',
  USER_UPDATED_SUCCESS = 'USER_UPDATED_SUCCESS',
  USER_UPDATED_ERROR = 'USER_UPDATED_ERROR',
  USER_UPDATE_YOURSELF = 'USER_UPDATE_YOURSELF',
  USER_BLOCKED = 'USER_BLOCKED',
  USER_DELETED_SUCCESS = 'USER_DELETED_SUCCESS',
  USER_DELETED_ERROR = 'USER_DELETED_ERROR',
  USER_BLOCKED_MESSAGE = 'USER_BLOCKED_MESSAGE',
  USER_BLOCKED_BY_ADMIN = 'USER_BLOCKED_BY_ADMIN',
  USER_BLOCKED_BY_ADMIN_MESSAGE = 'USER_BLOCKED_BY_ADMIN_MESSAGE',
  USER_NOT_AUTHORIZED = 'USER_NOT_AUTHORIZED',
  NOT_AUTHORIZED_RESOURCE = 'NOT_AUTHORIZED_RESOURCE',
  USER_BLOCKED_TRYING_ACCESS = 'USER_BLOCKED_TRYING_ACCESS',
  USER_INACTIVE_TRYING_ACCESS = 'USER_INACTIVE_TRYING_ACCESS',
  USER_UNBLOCKED_SUCCESS = 'USER_UNBLOCKED_SUCCESS',
  USER_UNBLOCKED_ERROR = 'USER_UNBLOCKED_ERROR',
  USER_NOT_FOUND = 'USER_NOT_FOUND',
  USERS_NOT_FOUND = 'USERS_NOT_FOUND',
  USER_DELETE_YOURSELF = 'USER_DELETE_YOURSELF',
  LOGIN_SUCCESS = 'LOGIN_SUCCESS',
  LOGIN_ERROR = 'LOGIN_ERROR',
  USER_LOGGED_OUT = 'USER_LOGGED_OUT',
  REFRESH_TOKEN = 'REFRESH_TOKEN',
  REFRESH_TOKEN_ERROR = 'REFRESH_TOKEN_ERROR',
  RESET_PASSWORD_SUCCESS = 'RESET_PASSWORD_SUCCESS',
  RESET_PASSWORD_ERROR = 'RESET_PASSWORD_ERROR',
  REACTIVE_USER_SUCCESS = 'REACTIVE_USER_SUCCESS',
  REACTIVE_USER_ERROR = 'REACTIVE_USER_ERROR',
  REFRESH_TOKEN_NOT_PRESENT = 'REFRESH_TOKEN_NOT_PRESENT',
  USER_ALREADY_REGISTERED = 'USER_ALREADY_REGISTERED',
  SUCCESS_SENDING_EMAIL = 'SUCCESS_SENDING_EMAIL',
  FAIL_SENDING_EMAIL = 'FAIL_SENDING_EMAIL',
  ACCOUNT_DISABLED = 'ACCOUNT_DISABLED',
  USER_INACTIVE = 'USER_INACTIVE',
  EMAIL_ALREADY_IN_USE = 'EMAIL_ALREADY_IN_USE',
  SESSION_EXPIRED = 'SESSION_EXPIRED',
  PERSONAL_INFORMATION_UPDATED = 'PERSONAL_INFORMATION_UPDATED',
  PERSONAL_INFORMATION_UPDATED_ERROR = 'PERSONAL_INFORMATION_UPDATED_ERROR',
  TOKEN_INVALID = 'TOKEN_INVALID',
  RECOVERY_PASSWORD_TOKEN_USED = 'RECOVERY_PASSWORD_TOKEN_USED',
  REFRESH_TOKEN_INVALID = 'REFRESH_TOKEN_INVALID',
  EMAIL_NOT_PRESENT = 'EMAIL_NOT_PRESENT',
  INVALID_TOKEN = 'INVALID_TOKEN',
  ACCESS_DENIED = 'ACCESS_DENIED',
  USER_ALREADY_ACTIVED = 'USER_ALREADY_ACTIVED',
  BLOCK_ERROR = 'BLOCK_ERROR',
  UNBLOCK_ERROR = 'UNBLOCK_ERROR',
  PASSWORD_UNMATCH = 'PASSWORD_UNMATCH',
  PASSWORD_ARE_EQUALS = 'PASSWORD_ARE_EQUALS',
  DATA_PAGINATION_ERROR = 'DATA_PAGINATION_ERROR',
  NOT_FOUND = 'NOT_FOUND',
  ID_REQUIRED = 'ID_REQUIRED',
  VERSION_REQUIRED = 'VERSION_REQUIRED',
  EMAIL_ALREADY_EXISTS = 'EMAIL_ALREADY_EXISTS',
  MODULE_NAME_AND_ROLE_ID_REQUIRED = 'MODULE_NAME_AND_ROLE_ID_REQUIRED',
  MODULE_NOT_FOUND_OR_INACCESSIBLE = 'MODULE_NOT_FOUND_OR_INACCESSIBLE',
  ASSIGNMENTS_NOT_FOUND = 'ASSIGNMENTS_NOT_FOUND',
  MODULE_NAME_REQUIRED = 'MODULE_NAME_REQUIRED',
  MODULE_NOT_FOUND = 'MODULE_NOT_FOUND',
  ROLE_NOT_FOUND = 'ROLE_NOT_FOUND',
  NO_PERMISSION = 'NO_PERMISSION',
  ASSIGNMENT_NOT_PERMITTED_FOR_ROLE = 'ASSIGNMENT_NOT_PERMITTED_FOR_ROLE',
  FILTER_ROLE_NOT_PERMITTED_TO_MODULE = 'FILTER_ROLE_NOT_PERMITTED_TO_MODULE',
  ROLE_NOT_PERMITTED_TO_UPSERT_USER_WITH_ROLE = 'ROLE_NOT_PERMITTED_TO_UPSERT_USER_WITH_ROLE',
  USER_WITHOUT_PERMISSION_TO_CREATE_USER = 'USER_WITHOUT_PERMISSION_TO_CREATE_USER',
  USER_WITHOUT_PERMISSION_TO_DELETE_USER = 'USER_WITHOUT_PERMISSION_TO_DELETE_USER',
  USER_WITHOUT_PERMISSION_TO_UPDATE_USER = 'USER_WITHOUT_PERMISSION_TO_UPDATE_USER',
  USER_WITHOUT_PERMISSION_TO_FIND_USER = 'USER_WITHOUT_PERMISSION_TO_FIND_USER',
  CURRENT_MODULE_REQUIRED = 'CURRENT_MODULE_REQUIRED',
  INVALID_MODULE = 'INVALID_MODULE',
  GENERIC_ERROR = 'GENERIC_ERROR',
  USER_WITHOUT_ASSIGNMENTS = 'USER_WITHOUT_ASSIGNMENT',
  USER_ID_MISMATCH = 'USER_ID_MISMATCH',
  INVALID_FILE_TYPE = 'INVALID_FILE_TYPE',
  FILE_TOO_LARGE = 'FILE_TOO_LARGE',
  CLIENT_ALREADY_EXISTS = 'CLIENT_ALREADY_EXISTS',
  PACKAGE_NOT_FOUND = 'PACKAGE_NOT_FOUND',
  CHANGE_YOUR_OWN_STATUS = 'CHANGE_YOUR_OWN_STATUS',
  CLIENT_NOT_FOUND = 'CLIENT_NOT_FOUND',
  COST_CENTER_NOT_FOUND = 'COST_CENTER_NOT_FOUND',
  COST_CENTER_EMPTY = 'COST_CENTER_EMPTY',
  SOURCE_EMPTY = 'SOURCE_EMPTY',
  SOURCE_NOT_FOUND = 'SOURCE_NOT_FOUND',
  LINKED_USERS = 'LINKED_USERS',
}

/**
 * Retrieves a localized message based on the given key and language. If the specified language
 * is not available, it defaults to Portuguese ('pt-BR').
 *
 * @param {string} key - The key corresponding to the message in the MessagesHelper object.
 * @param {string} [language='pt-BR'] - The language code for the message. Defaults to 'pt-BR' if not specified.
 * @returns {string} The localized message corresponding to the given key and language.
 * @throws {Error} Throws an error if the message key is not found in the MessagesHelper object.
 *
 * @example
 * // Example usage
 * const message = getMessage(MessagesHelperKey.PASSWORD_OR_EMAIL_INVALID, 'en-US');
 */
export const getMessage = (key: string, language: Languages): string => {
  const message = MessagesHelper[key];
  if (!message) {
    return `Message key '${key}' not found in MessagesHelper`;
  }

  return message[language.toLowerCase()] || message['pt-BR'];
};

/**
 * Formats a message string by replacing a placeholder with a specified value and optionally appending a reason.
 *
 * @param {string} message - The message template containing a placeholder 'X' to be replaced.
 * @param {string} replace - The string to replace the 'X' placeholder in the message.
 * @param {string} [reason] - Optional additional reason to be appended to the message.
 * @returns {string} The formatted message string.
 *
 * @description
 * This function takes a message string with a 'X' placeholder and replaces it with the provided 'replace' string.
 * Optionally, if a 'reason' is provided, it appends this reason to the message, enhancing its descriptive nature.
 * This utility is useful for creating dynamic and descriptive messages in logs or user-facing interfaces.
 *
 * @example
 * // Example of using setMessage
 * const formattedMessage = setMessage('User X not found', 'John Doe', 'User record missing');
 * // formattedMessage will be 'User John Doe not found - description: User record missing'
 */
export const setMessage = (
  message: string,
  replace: string,
  reason?: string,
): string => {
  return (
    message.replace('X', replace) + (reason ? ` - description: ${reason}` : '')
  );
};
