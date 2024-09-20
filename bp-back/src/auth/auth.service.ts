import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  Logger,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import {
  MethodEnum,
  LogStatusEnum,
  LogActionEnum,
  Prisma,
  StatusEnum,
  AssignmentsEnum,
  RoleEnum,
  ModuleEnum,
  EventTypeEnum,
  EventEnum,
} from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { randomUUID, verify } from 'crypto';
import { access, readFileSync } from 'fs';
import { Model } from 'mongoose';
import { join } from 'path';
import { PrismaService } from 'src/database/prisma/prisma.service';
import {
  MessagesHelperKey,
  getMessage,
  setMessage,
} from 'src/helpers/messages.helper';
import {
  AuditLog,
  AuditLogRequestInformation,
} from 'src/middlewares/interface/logger';
import { CrudType } from 'src/modules/base/interfaces/ICrudTypeMap';
import { EmailService } from 'src/modules/email/email.service';
import { EventService } from 'src/modules/event/event.service';
import { LogService } from 'src/modules/log/log.service';
import { MongoService } from 'src/modules/mongo/mongo.service';
import {
  WebsocketMongo,
  WebsocketSchemaName,
} from 'src/modules/mongo/websocket.model';
import { Action } from 'src/modules/tenant/rules/types';
import {
  getRoleAllowedAssignments,
  getRolesThatGivenCanBeCreatedBy,
  guardModule,
} from 'src/modules/tenant/tenant.helper';
import { UserCreateDto } from 'src/modules/user/dto/request/user.create.dto';
import { UserEntity } from 'src/modules/user/entity/user.entity';
import { UserTypeMap } from 'src/modules/user/entity/user.type.map';
import { UserRepository } from 'src/modules/user/user.repository';
import { UserService } from 'src/modules/user/user.service';
import {
  BLOCKED_BY_ADMIN,
  MAX_FAILED_LOGIN_ATTEMPTS,
} from 'src/utils/constants';
import { isDevelopmentEnviroment } from 'src/utils/environment';
import { generatePassword } from 'src/utils/generate-password';
import { guardUser } from 'src/utils/guards/guard-user';
import { hashData } from 'src/utils/hash';
import { Languages } from 'src/utils/language-preference';
import { recoverTemplateDataBind } from 'src/utils/templates/processors/recover-password-processor';
import { registrationTemplateDataBind } from 'src/utils/templates/processors/registration-processor';
import { handleError } from 'src/utils/treat.exceptions';

import { AuthRepository } from './auth.repository';
import { ChangePasswordByRecovery } from './dto/request/change-password-by-recovery.dto';
import { EmailDto } from './dto/request/email.dto';
import { LoginDto } from './dto/request/login.dto';
import { UserToken } from './dto/response/UserToken';
import { UserPayload } from './models/UserPayload';

@Injectable()
export class AuthService {
  private logger = new Logger(AuthService.name);

  constructor(
    private readonly authRepository: AuthRepository,
    private readonly logService: LogService,
    private readonly eventService: EventService,
    private readonly userService: UserService,
    private readonly userRepository: UserRepository,
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly emailService: EmailService,
    private mongoService: MongoService,
    @InjectModel(WebsocketSchemaName)
    private readonly mongoModel: Model<WebsocketMongo>,
  ) {}

  async validateIpRequest(
    token: string,
    request: AuditLogRequestInformation,
    languagePreference: Languages,
  ) {
    const identifierRequest = randomUUID();
    this.logger.log(`${identifierRequest} Validate IP Request`);

    const functionName = 'validateIpRequest';
    const decodedToken = this.jwtService.decode(token) as UserPayload;

    if (!decodedToken || !decodedToken.email || !decodedToken.id) {
      this.logger.debug(`${identifierRequest} Invalid token.`);
      throw new UnauthorizedException(
        getMessage(MessagesHelperKey.INVALID_TOKEN, languagePreference),
      );
    }

    const errorMessage = setMessage(
      getMessage(MessagesHelperKey.MULTIPLE_LOGIN_ERROR, languagePreference),
      decodedToken.email,
    );

    const websocketData: WebsocketMongo = await this.mongoService.findOne(
      { email: decodedToken.email },
      this.mongoModel,
    );

    if (
      websocketData &&
      websocketData?.ip !== null &&
      websocketData?.ip !== request.ip
    ) {
      await this.logService.createAuditLog(
        new AuditLog(
          functionName,
          request?.ip,
          request.url,
          MethodEnum[request.method],
          decodedToken.email,
          LogStatusEnum.ERROR,
          LogActionEnum.MULTIPLE_LOGIN,
          errorMessage,
        ),
        {
          identifierRequest,
        },
      );

      this.logger.debug(
        `${identifierRequest} Multiple login detected. IP to validate: Request: ${request?.ip} -> IP in database: ${websocketData?.ip}`,
      );

      throw new UnauthorizedException(
        getMessage(
          MessagesHelperKey.MULTIPLE_LOGIN_MESSAGE,
          languagePreference,
        ),
      );
    }
  }

  async validateUser(
    email: string,
    password: string,
    request: AuditLogRequestInformation,
    languagePreference: Languages,
  ) {
    const identifierRequest = randomUUID();
    this.logger.debug(`${identifierRequest} Validate User`);

    const functionName = 'validateUser';
    try {
      return await this.prisma.$transaction(
        async (transaction: Prisma.TransactionClient) => {
          const user = await this.userService.findByEmail(
            email,
            languagePreference,
            {
              transaction,
              identifierRequest,
            },
          );

          if (!user) {
            this.logger.debug(
              `${identifierRequest} Error login! user ${email} not exists`,
            );
            throw new UnauthorizedException(
              getMessage(
                MessagesHelperKey.PASSWORD_OR_EMAIL_INVALID,
                languagePreference,
              ),
            );
          }

          this.logger.debug(`${identifierRequest} User ${email} found`);

          const isPasswordValid = await bcrypt.compare(password, user.password);
          if (isPasswordValid) {
            const { password, ...userWithoutPassword } = user;
            return userWithoutPassword;
          } else {
            this.logger.debug(
              `${identifierRequest} Error login! password invalid`,
            );

            await this.authRepository.incrementLoginAttempts(
              email,
              transaction,
            );

            await this.logService.createAuditLog(
              new AuditLog(
                functionName,
                request.ip,
                request.url,
                MethodEnum[request.method],
                user.email,
                LogStatusEnum.ERROR,
                LogActionEnum.LOGIN,
                setMessage(
                  getMessage(MessagesHelperKey.LOGIN_ERROR, 'pt-BR'),
                  user.email,
                ),
              ),
              {
                identifierRequest,
                transaction,
              },
            );
          }
        },
      );
    } catch (error) {
      handleError(error, languagePreference, {
        identifierRequest,
      });
    }
  }

  async validateDisabledUserMiddleware(
    token: string,
    request: AuditLogRequestInformation,
    languagePreference: Languages,
  ) {
    const identifierRequest = randomUUID();

    const functionName = 'validateUnabledUserMiddleware';
    const decodedToken: UserPayload | any = this.jwtService.decode(token);

    if (!decodedToken) {
      this.logger.debug(`${identifierRequest} Invalid token.`);
      throw new UnauthorizedException(
        getMessage(MessagesHelperKey.TOKEN_INVALID, languagePreference),
        languagePreference,
      );
    }

    const user = await this.userService.findByEmail(
      decodedToken.email,
      languagePreference,
      {
        identifierRequest,
      },
    );

    if (user) {
      if (user.status === StatusEnum.INACTIVE || user.deletedAt != null) {
        await this.logService.createAuditLog(
          new AuditLog(
            functionName,
            request.ip,
            request.url,
            MethodEnum[request.method],
            user.email,
            LogStatusEnum.ERROR,
            LogActionEnum.DISABLED_USER,
            setMessage(
              getMessage(
                MessagesHelperKey.USER_INACTIVE_TRYING_ACCESS,
                'pt-BR',
              ),
              user.email,
            ),
          ),
          {
            identifierRequest,
          },
        );

        this.logger.debug(
          `${identifierRequest} Error login! user ${user.email} inactivated`,
        );
        throw new ForbiddenException(
          setMessage(
            getMessage(
              MessagesHelperKey.USER_INACTIVE_TRYING_ACCESS,
              languagePreference,
            ),
            user.email,
          ),
        );
      }
    }
  }

  async register(
    registerDto: UserCreateDto,
    currentUser: UserPayload,
    request: AuditLogRequestInformation,
    languagePreference: Languages,
    currentModule: string,
    transactionClient?: Prisma.TransactionClient,
  ): Promise<Partial<UserEntity>> {
    const identifierRequest = randomUUID();
    const functionName = 'register';
    this.logger.log('POST IN Auth Service - register');

    try {
      return await this.prisma.$transaction(
        async (transaction: Prisma.TransactionClient) => {
          this.logger.debug(
            `${identifierRequest} Verifying if the user with the email ${registerDto.email} already exists in the database`,
          );

          const roleToBeRegistered = await this.userRepository.findOneRole(
            {
              where: {
                id: registerDto.roleId,
              },
              select: {
                name: true,
              },
            },
            transactionClient ? transactionClient : transaction,
          );

          if (!roleToBeRegistered) {
            throw new BadRequestException(
              getMessage(MessagesHelperKey.ROLE_NOT_FOUND, languagePreference),
            );
          }

          guardModule(
            currentModule as ModuleEnum,
            currentUser.role as RoleEnum,
            Action.CREATE,
            currentUser?.assignments,
            {
              languagePreference,
              identifierRequest,
              logger: this.logger,
            },
            roleToBeRegistered.name as RoleEnum,
          );

          const creatingAdminUser = roleToBeRegistered.name === RoleEnum.ADMIN;

          if (!creatingAdminUser) {
            if (
              !registerDto.assignments ||
              registerDto.assignments.length === 0
            ) {
              throw new BadRequestException(
                getMessage(
                  MessagesHelperKey.USER_WITHOUT_ASSIGNMENTS,
                  languagePreference,
                ),
              );
            }

            // If there is create, update or delete permission without read permission, it will be added
            registerDto.assignments = registerDto.assignments.map(
              assignment => {
                if (
                  (assignment.create ||
                    assignment.update ||
                    assignment.delete) &&
                  !assignment.read
                ) {
                  assignment.read = true;
                }

                return assignment;
              },
            );

            const assignments = await this.userRepository.findManyAssignments(
              {
                where: {
                  id: {
                    in: registerDto.assignments.map(
                      assignment => assignment.assignmentId,
                    ),
                  },
                },
                select: {
                  name: true,
                },
              },
              transactionClient ? transactionClient : transaction,
            );

            if (
              !assignments.length ||
              assignments.length !== registerDto.assignments.length
            ) {
              throw new BadRequestException(
                getMessage(
                  MessagesHelperKey.ASSIGNMENTS_NOT_FOUND,
                  languagePreference,
                ),
              );
            }

            const requestAssignmentNames: AssignmentsEnum[] = assignments.map(
              assignment => assignment.name,
            );

            const permittedAssignments = getRoleAllowedAssignments(
              roleToBeRegistered.name,
            );

            // Check if all requested assignments are allowed for the role
            const allAssignmentsValid = requestAssignmentNames.every(
              assignmentName => permittedAssignments.includes(assignmentName),
            );

            if (!allAssignmentsValid) {
              throw new ForbiddenException(
                getMessage(
                  MessagesHelperKey.ASSIGNMENT_NOT_PERMITTED_FOR_ROLE,
                  languagePreference,
                ),
              );
            }
          }

          const userAlreadyExists = await this.userService.exists(
            {
              email: registerDto.email,
              deletedAt: null,
            },
            currentUser,
            languagePreference,
            {
              identifierRequest,
              transaction: transactionClient ? transactionClient : transaction,
            },
          );

          if (userAlreadyExists) {
            const message = `${identifierRequest} Email ${registerDto.email} already registered in the database.`;
            this.logger.debug(message);

            await this.logService.createAuditLog(
              new AuditLog(
                functionName,
                request.ip,
                request.url,
                MethodEnum[request.method],
                currentUser.email,
                LogStatusEnum.ERROR,
                LogActionEnum.CREATE,
                setMessage(
                  getMessage(MessagesHelperKey.CREATE_USER_ERROR, 'pt-BR'),
                  registerDto.email,
                  message,
                ),
              ),
              {
                identifierRequest,
              },
            );

            throw new ConflictException(
              setMessage(
                getMessage(
                  MessagesHelperKey.USER_ALREADY_REGISTERED,
                  languagePreference,
                ),
                registerDto.email,
                message,
              ),
            );
          }

          const currentUserIsNotAdmin = currentUser.role !== RoleEnum.ADMIN;

          if (currentUserIsNotAdmin) {
            // Check if the current user has permission to assign the role
            const hasPermissionToCreate = getRolesThatGivenCanBeCreatedBy(
              roleToBeRegistered.name as RoleEnum,
            ).includes(currentUser.role as RoleEnum);

            if (!hasPermissionToCreate) {
              throw new ForbiddenException(
                getMessage(
                  MessagesHelperKey.ROLE_NOT_PERMITTED_TO_UPSERT_USER_WITH_ROLE,
                  languagePreference,
                ),
              );
            }
          }

          const generatedPassword: string = generatePassword();
          const hash = await hashData(generatedPassword);

          this.logger.debug(
            `${identifierRequest} Password from user ${registerDto.email} hashed successfully`,
          );

          const createUserData: UserTypeMap[CrudType.CREATE] =
            this.userService.getCreateUserDataByModule(
              currentModule as ModuleEnum,
              registerDto,
              {
                passwordHash: hash,
                creatingAdminUser,
              },
            );

          let newUser: UserEntity;
          if (creatingAdminUser) {
            newUser = (await this.userService.createUserAdminAsync(
              registerDto.sources,
              creatingAdminUser,
              createUserData,
              currentUser,
              languagePreference,
              {
                transaction: transactionClient
                  ? transactionClient
                  : transaction,
                identifierRequest,
              },
            )) as UserEntity;
          } else if (!creatingAdminUser) {
            newUser = (await this.userService.createUserAsync(
              registerDto.clientId,
              registerDto.costCenters,
              registerDto?.ownsClient,
              creatingAdminUser,
              createUserData,
              currentUser,
              languagePreference,
              {
                transaction: transactionClient
                  ? transactionClient
                  : transaction,
                identifierRequest,
              },
            )) as UserEntity;
          }

          this.logger.debug(
            `${identifierRequest} User ${newUser.email} created`,
          );

          const tokens: UserToken = await this.getTokens(newUser, {
            identifierRequest,
          });

          await this.updateRt(newUser.id, tokens.refreshToken, {
            transaction: transactionClient ? transactionClient : transaction,
            identifierRequest,
          });

          await this.sendRegistrationEmail(
            {
              userEmail: newUser.email,
              generatedPassword,
            },
            currentUser,
            request,
            languagePreference,
            {
              identifierRequest,
              transaction: transactionClient ? transactionClient : transaction,
              resend: false,
            },
          );

          await this.logService.createAuditLog(
            new AuditLog(
              functionName,
              request.ip,
              request.url,
              MethodEnum[request.method],
              currentUser.email,
              LogStatusEnum.SUCCESS,
              LogActionEnum.CREATE,
              setMessage(
                getMessage(MessagesHelperKey.CREATE_USER_SUCCESS, 'pt-BR'),
                newUser.email,
              ),
            ),
            {
              identifierRequest,
            },
          );

          return {
            id: newUser.id,
          };
        },
      );
    } catch (error) {
      handleError(error, languagePreference, {
        identifierRequest,
      });
    }
  }

  async updateRt(
    userId: string,
    refreshToken: string,
    optionals?: {
      identifierRequest?: string;
      transaction?: Prisma.TransactionClient;
    },
  ) {
    const identifierRequest = optionals?.identifierRequest ?? randomUUID();
    this.logger.debug(`${identifierRequest} Service - updateRt`);

    const refreshTokenHash = await hashData(refreshToken);
    this.logger.debug(`${identifierRequest} refreshToken hashed ${userId}`);

    const user = await this.authRepository.updateRefreshToken(
      userId,
      refreshTokenHash,
      optionals?.transaction,
    );

    this.logger.debug(
      `${identifierRequest} Refresh token from ${user.email} updated`,
    );
  }

  async checkEmailAvailability(
    dto: EmailDto,
    currentUser: UserPayload,
    languagePreference: Languages,
  ): Promise<boolean> {
    const identifierRequest = randomUUID();
    this.logger.log(`${identifierRequest} checkEmail`);

    const alreadyExists = await this.userRepository.exists({
      email: dto.email,
      ...(dto.userBeingEditedId && { id: { not: dto.userBeingEditedId } }),
    });

    return alreadyExists == false;
  }

  async login(
    user: LoginDto,
    request: AuditLogRequestInformation,
    languagePreference: Languages,
  ) {
    const identifierRequest = randomUUID();
    const functionName = 'login';
    this.logger.log('POST in Auth Service - login');

    try {
      return await this.prisma.$transaction(
        async (transaction: Prisma.TransactionClient) => {
          const usuario = await this.userService.findByEmail(
            user.email,
            languagePreference,
            {
              transaction,
              identifierRequest,
            },
          );

          const tokens: UserToken = await this.getTokens(usuario, {
            identifierRequest,
          });

          this.logger.debug(
            `${identifierRequest} Tokens generated successfully`,
          );

          await this.updateRt(usuario.id, tokens.refreshToken, {
            identifierRequest,
            transaction,
          });

          if (usuario.status === StatusEnum.PENDING) {
            this.logger.debug(
              `${identifierRequest} User ${usuario.email} is pending, activating...`,
            );

            await this.authRepository.activeUser(usuario.id, transaction);
          }

          if (request?.ip) {
            await this.authRepository.updateIpUser(
              usuario.id,
              request?.ip,
              transaction,
            );

            this.logger.debug(
              `${identifierRequest} Updated ip ${request.ip} to user ${usuario.email}`,
            );
          }

          await this.logService.createAuditLog(
            new AuditLog(
              functionName,
              request.ip,
              request.url,
              MethodEnum[request.method],
              usuario.email,
              LogStatusEnum.SUCCESS,
              LogActionEnum.LOGIN,
              setMessage(
                getMessage(MessagesHelperKey.LOGIN_SUCCESS, 'pt-BR'),
                usuario.email,
              ),
            ),
            {
              identifierRequest,
              transaction,
            },
          );
          await this.eventService.createAsync(
            {
              type: EventTypeEnum.SYSTEM,
              event: EventEnum.LOGIN,
              ip: request.ip,
              description: 'Usuário fez login',
              userId: usuario.id,
              additionalData: {},
            },
            languagePreference,
            {
              identifierRequest,
              transaction,
            },
          );

          return tokens;
        },
      );
    } catch (error) {
      handleError(error, languagePreference, {
        identifierRequest,
      });
    }
  }

  async logout(
    currentUser: UserPayload,
    request: AuditLogRequestInformation,
    languagePreference: Languages,
  ) {
    const identifierRequest = randomUUID();
    const functionName = 'logout';
    const userId = currentUser.id;

    this.logger.log(`${identifierRequest} POST in Auth Service - logout`);

    try {
      return await this.prisma.$transaction(
        async (transaction: Prisma.TransactionClient) => {
          this.logger.debug(
            `${identifierRequest} Removing refreshToken from user ${userId} in the database`,
          );

          const user = await this.authRepository.logoutUser(
            userId,
            transaction,
          );

          await this.logService.createAuditLog(
            new AuditLog(
              functionName,
              request.ip,
              request.url,
              MethodEnum[request.method],
              user.email,
              LogStatusEnum.SUCCESS,
              LogActionEnum.LOGOUT,
              setMessage(
                getMessage(MessagesHelperKey.USER_LOGGED_OUT, 'pt-BR'),
                user.email,
              ),
            ),
            {
              identifierRequest,
              transaction,
            },
          );
        },
      );
    } catch (error) {
      handleError(error, languagePreference, {
        identifierRequest,
      });
    }
  }

  async refreshToken(
    currentUser: UserPayload,
    request: AuditLogRequestInformation,
    languagePreference: Languages,
  ) {
    const identifierRequest = randomUUID();
    const functionName = 'refreshToken';
    const refreshToken = currentUser.refreshToken;

    this.logger.log(`${identifierRequest} Refresh Token`);

    try {
      return await this.prisma.$transaction(
        async (transaction: Prisma.TransactionClient) => {
          const userDb = await this.userRepository.findByIdAsync(
            currentUser.id,
            transaction,
          );

          if (!userDb || !userDb.refreshToken) {
            this.logger.error(
              `${identifierRequest} User with id ${currentUser.id} not found or not have a refreshToken`,
            );

            await this.logService.createAuditLog(
              new AuditLog(
                functionName,
                request.ip,
                request.url,
                MethodEnum[request.method],
                currentUser.email,
                LogStatusEnum.ERROR,
                LogActionEnum.REFRESH_TOKEN,
                setMessage(
                  getMessage(MessagesHelperKey.REFRESH_TOKEN_ERROR, 'pt-BR'),
                  currentUser.email,
                ),
              ),
            ),
              {
                identifierRequest,
              };
            throw new ForbiddenException(
              getMessage(MessagesHelperKey.ACCESS_DENIED, languagePreference),
            );
          }

          this.logger.debug(
            `${identifierRequest} User ${userDb.email} with ID ${userDb.id} found`,
          );

          const rtMatches = await bcrypt.compare(
            refreshToken,
            userDb?.refreshToken,
          );

          if (!rtMatches) {
            this.logger.debug(
              `${identifierRequest} refreshToken from user ${userDb.email} doesn't match`,
            );

            await this.logService.createAuditLog(
              new AuditLog(
                functionName,
                request.ip,
                request.url,
                MethodEnum[request.method],
                userDb.email,
                LogStatusEnum.ERROR,
                LogActionEnum.REFRESH_TOKEN,
                setMessage(
                  getMessage(MessagesHelperKey.REFRESH_TOKEN_ERROR, 'pt-BR'),
                  userDb.email,
                ),
              ),
              {
                identifierRequest,
              },
            );

            throw new ForbiddenException(
              getMessage(MessagesHelperKey.ACCESS_DENIED, languagePreference),
            );
          }

          this.logger.debug(
            `${identifierRequest} refreshToken from user ${userDb.email} matches. Generating new accessToken and refreshToken`,
          );

          const tokens = await this.getTokens(userDb);

          this.logger.debug(
            `${identifierRequest} Tokens generated successfully. Updating refreshToken in the user's database`,
          );

          await this.updateRt(userDb.id, tokens.refreshToken, {
            transaction,
            identifierRequest,
          });

          this.logger.debug(
            `${identifierRequest} refreshToken updated successfully in the user's database. Returning tokens and exiting the service "refresh"`,
          );

          await this.logService.createAuditLog(
            new AuditLog(
              functionName,
              request.ip,
              request.url,
              MethodEnum[request.method],
              userDb.email,
              LogStatusEnum.SUCCESS,
              LogActionEnum.REFRESH_TOKEN,
              setMessage(
                getMessage(MessagesHelperKey.REFRESH_TOKEN, 'pt-BR'),
                userDb.email,
              ),
            ),
            {
              identifierRequest,
            },
          );

          return tokens;
        },
      );
    } catch (error) {
      handleError(error, languagePreference, {
        identifierRequest,
      });
    }
  }

  async sendRecoveryPasswordEmail(
    dto: EmailDto,
    request: AuditLogRequestInformation,
    languagePreference: Languages,
  ) {
    const identifierRequest = randomUUID();
    const functionName = 'sendRecoveryPasswordEmail';

    const userDb = await this.userService.findByEmail(
      dto.email,
      languagePreference,
      {
        identifierRequest,
      },
    );

    if (
      !userDb ||
      userDb.blocked ||
      userDb.status === StatusEnum.INACTIVE ||
      userDb.deletedAt != null
    ) {
      this.logger.warn(
        `Usuário ${dto.email} não está apto a receber o email de recuperação`,
      );

      return;
    }

    try {
      this.logger.log(
        `${identifierRequest} Sending recovery password email to: ${userDb.email} `,
      );

      const token = await this.userService.encodeEmailToken(
        userDb.email,
        userDb.id,
        languagePreference,
        {
          identifierRequest,
        },
      );

      await this.prisma.$transaction(
        async (transaction: Prisma.TransactionClient) => {
          let templatePath = '';

          const rootDir = process.cwd();

          templatePath = join(
            rootDir,
            'src/utils/templates/recover-password.html',
          );

          const templateHtml = readFileSync(templatePath).toString();

          if (!templateHtml || templateHtml == '') {
            this.logger.debug(`${identifierRequest} Template not found`);
            throw new Error(
              'Não foi possível encontrar o template de recuperação de email',
            );
          }

          const projectName = process.env.npm_package_name;

          const link = `${process.env.FRONTEND_RECOVER_PASSWORD_URL}?token=${token}`;

          const templateBody = recoverTemplateDataBind(templateHtml, {
            name: userDb.name,
            projectName,
            link,
          });

          const subject = 'Recuperação de senha';

          await this.emailService.sendEmail(
            templateBody,
            subject,
            userDb.email,
            languagePreference,
            {
              identifierRequest,
            },
          );

          const tokenEncrypted = await hashData(token);

          await this.userRepository.updateAsync(
            userDb.id,
            {
              recoveryToken: tokenEncrypted,
              version: userDb.version,
            },
            transaction,
          );

          await this.logService.createAuditLog(
            new AuditLog(
              functionName,
              request.ip,
              request.url,
              MethodEnum[request.method],
              userDb.email,
              LogStatusEnum.SUCCESS,
              LogActionEnum.SEND_EMAIL_RECOVERY_PASSWORD,
              setMessage(
                getMessage(MessagesHelperKey.SUCCESS_SENDING_EMAIL, 'pt-BR'),
                userDb.email,
              ),
            ),
            {
              identifierRequest,
              transaction,
            },
          );

          this.logger.debug('Recovery password email was sent');
        },
      );
    } catch (error) {
      this.logger.debug('Recovery password email was not sent');

      await this.logService.createAuditLog(
        new AuditLog(
          functionName,
          request.ip,
          request.url,
          MethodEnum[request.method],
          userDb.email,
          LogStatusEnum.ERROR,
          LogActionEnum.SEND_EMAIL_RECOVERY_PASSWORD,
          setMessage(
            getMessage(MessagesHelperKey.FAIL_SENDING_EMAIL, 'pt-BR'),
            userDb.email,
          ),
        ),
        {
          identifierRequest,
        },
      );

      handleError(error, languagePreference, {
        message: getMessage(
          MessagesHelperKey.FAIL_SENDING_EMAIL,
          languagePreference,
        ),
        identifierRequest,
      });
    }
  }

  async changePasswordByRecovery(
    dto: ChangePasswordByRecovery,
    request: AuditLogRequestInformation,
    languagePreference: Languages,
  ) {
    this.logger.log('POST in Auth Service - changePasswordByRecovery');

    const identifierRequest = randomUUID();

    // Public end point
    const currentUser = null;

    try {
      const userDataByToken: {
        sub: string;
        id: string;
        iat: number;
        exp: number;
      } = await this.decodeEmailToken(dto.accessToken, languagePreference, {
        identifierRequest,
      });

      const user = (await this.userService.findBy(
        {
          email: userDataByToken.sub,
        },
        {
          id: true,
          email: true,
          recoveryToken: true,
          blocked: true,
          status: true,
          deletedAt: true,
        },
        currentUser,
        languagePreference,
        {
          identifierRequest,
        },
      )) as {
        id: string;
        email: string;
        recoveryToken: string;
        blocked: boolean;
        status: StatusEnum;
        deletedAt: Date | null;
      };

      if (!user) {
        this.logger.debug(
          `${identifierRequest} User with email ${userDataByToken.sub} not found`,
        );

        throw new UnauthorizedException(
          setMessage(
            getMessage(MessagesHelperKey.USER_NOT_FOUND, languagePreference),
            userDataByToken.sub,
          ),
        );
      }

      guardUser(
        {
          blocked: user?.blocked,
          deletedAt: user?.deletedAt,
          email: user?.email,
          status: user?.status,
        },
        this.logger,
        languagePreference,
        {
          identifierRequest,
          requestUserEmail: user.email,
        },
      );

      let recoveryTokenIsValid = false;

      if (user?.recoveryToken) {
        recoveryTokenIsValid = await bcrypt.compare(
          dto.accessToken,
          user.recoveryToken,
        );
      }

      if (!recoveryTokenIsValid) {
        this.logger.debug(
          `${identifierRequest} Token is invalid. User ${userDataByToken.sub} already changed his password`,
        );

        throw new UnauthorizedException(
          setMessage(
            getMessage(
              MessagesHelperKey.RECOVERY_PASSWORD_TOKEN_USED,
              languagePreference,
            ),
            userDataByToken.sub,
          ),
        );
      }

      await this.prisma.$transaction(
        async (transaction: Prisma.TransactionClient) => {
          const hash = await hashData(dto.newPassword);

          await this.userRepository.updateUserPassword(
            user.id,
            hash,
            transaction,
          );

          await this.logService.createAuditLog(
            new AuditLog(
              'changePasswordByRecovery',
              request.ip,
              request.url,
              MethodEnum[request.method],
              user.email,
              LogStatusEnum.SUCCESS,
              LogActionEnum.CHANGE_PASSWORD,
              setMessage(
                getMessage(MessagesHelperKey.PASSWORD_CHANGED, 'pt-BR'),
                user.email,
              ),
            ),
            {
              identifierRequest,
              transaction,
            },
          );

          await this.eventService.createAsync(
            {
              type: EventTypeEnum.SYSTEM,
              event: EventEnum.PASSWORD_RESET,
              ip: request.ip,
              description: 'Usuário alterou a senha por recuperação de senha',
              userId: user.id,
              additionalData: {},
            },
            languagePreference,
            {
              identifierRequest,
              transaction,
            },
          );
          this.logger.debug(
            `${identifierRequest} Password from user ${user.email} changed successfully`,
          );
        },
      );
    } catch (error) {
      await this.logService.createAuditLog(
        new AuditLog(
          'changePasswordByRecovery',
          request.ip,
          request.url,
          MethodEnum[request.method],
          'unknown',
          LogStatusEnum.ERROR,
          LogActionEnum.CHANGE_PASSWORD,
          setMessage(
            getMessage(MessagesHelperKey.PASSWORD_CHANGED_ERROR, 'pt-BR'),
            'unknown',
          ),
        ),
        {
          identifierRequest,
        },
      );

      handleError(error, languagePreference, {
        identifierRequest,
      });
    }
  }

  async decodeEmailToken(
    accessToken: string,
    languagePreference: Languages,
    { identifierRequest },
  ) {
    this.logger.debug(`${identifierRequest} Service - decodeEmailToken`);

    let decodedToken: {
      sub: string;
      id: string;
      iat: number;
      exp: number;
    } | null;

    try {
      decodedToken = this.jwtService.verify(accessToken, {
        secret: process.env.TK_EMAIL_SECRET,
      });
    } catch (error) {
      this.logger.debug(`${identifierRequest} Invalid token.`);
      throw new UnauthorizedException(
        getMessage(MessagesHelperKey.INVALID_TOKEN, languagePreference),
      );
    }

    return decodedToken;
  }

  async sendRegistrationEmail(
    data: {
      userEmail: string;
      generatedPassword: string;
    },
    currentUser: UserPayload,
    request: AuditLogRequestInformation,
    languagePreference: Languages,
    optionals?: {
      identifierRequest?: string;
      transaction?: Prisma.TransactionClient;
      resend?: boolean;
    },
  ) {
    const identifierRequest = optionals?.identifierRequest ?? randomUUID();
    const functionName = 'sendRegistrationEmail';
    const { userEmail, generatedPassword } = data;

    try {
      this.logger.log(
        `${identifierRequest} ${
          optionals?.resend ? 'Resending' : 'Sending'
        } registration password email to: ${userEmail} `,
      );

      await this.guardResendEmail(
        optionals?.resend,
        userEmail,
        languagePreference,
        {
          identifierRequest,
          transaction: optionals?.transaction,
        },
      );

      if (isDevelopmentEnviroment()) {
        this.logger.debug(
          `${identifierRequest} [DEV] Password: ${generatedPassword}`,
        );
      }

      const userInDb = await this.userService.findByEmail(
        userEmail,
        languagePreference,
        {
          transaction: optionals?.transaction,
          identifierRequest,
        },
      );

      guardUser(
        {
          blocked: userInDb?.blocked,
          deletedAt: userInDb?.deletedAt,
          email: userInDb?.email,
          status: userInDb?.status,
        },
        this.logger,
        languagePreference,
        {
          identifierRequest,
          requestUserEmail: userEmail,
        },
      );

      let templatePath = '';

      const rootDir = process.cwd();
      templatePath = join(rootDir, 'src/utils/templates/registration.html');
      const templateHtml = readFileSync(templatePath).toString();

      if (!templateHtml || templateHtml == '') {
        this.logger.debug(`${identifierRequest} Template not found`);
        throw new Error(
          'Não foi possível encontrar o template de registro de email',
        );
      }

      const projectName = process.env.npm_package_name;

      const link = process.env.FRONT_END_URL;

      const templateBody = registrationTemplateDataBind(templateHtml, {
        name: userInDb.name,
        projectName,
        password: generatedPassword,
        link,
      });

      const subject = 'Email de confirmação de registro';

      await this.emailService.sendEmail(
        templateBody,
        subject,
        userEmail,
        languagePreference,
        {
          identifierRequest,
        },
      );

      await this.logService.createAuditLog(
        new AuditLog(
          functionName,
          request.ip,
          request.url,
          MethodEnum[request.method],
          currentUser.email,
          LogStatusEnum.SUCCESS,
          optionals?.resend
            ? LogActionEnum.RESEND_EMAIL
            : LogActionEnum.FIRST_ACCESS,
          setMessage(
            getMessage(MessagesHelperKey.SUCCESS_SENDING_EMAIL, 'pt-BR'),
            userEmail,
          ),
        ),
        {
          identifierRequest,
          transaction: optionals?.transaction,
        },
      );

      this.logger.debug(
        `${identifierRequest} ${
          optionals?.resend ? 'Resend' : 'Registration'
        } password email was sent`,
      );
    } catch (error) {
      this.logger.debug(
        `${identifierRequest} ${
          optionals?.resend ? 'Resend' : 'Registration'
        } password email was not sent ${error}`,
      );

      await this.logService.createAuditLog(
        new AuditLog(
          functionName,
          request.ip,
          request.url,
          MethodEnum[request.method],
          currentUser.email,
          LogStatusEnum.ERROR,
          optionals?.resend
            ? LogActionEnum.RESEND_EMAIL
            : LogActionEnum.FIRST_ACCESS,
          setMessage(
            getMessage(MessagesHelperKey.SUCCESS_SENDING_EMAIL, 'pt-BR'),
            userEmail,
          ),
        ),
        {
          identifierRequest,
        },
      );

      handleError(error, languagePreference, {
        message: getMessage(
          MessagesHelperKey.FAIL_SENDING_EMAIL,
          languagePreference,
        ),
        identifierRequest,
      });
    }
  }

  async guardResendEmail(
    resend: boolean,
    userEmail: string,
    languagePreference: Languages,
    optionals?: {
      identifierRequest?: string;
      transaction?: Prisma.TransactionClient;
    },
  ) {
    const identifierRequest = optionals?.identifierRequest ?? randomUUID();

    const user: UserEntity = await this.userService.findByEmail(
      userEmail,
      languagePreference,
      {
        transaction: optionals?.transaction,
        identifierRequest,
      },
    );

    guardUser(
      {
        blocked: user?.blocked,
        deletedAt: user?.deletedAt,
        email: user?.email,
        status: user?.status,
      },
      this.logger,
      languagePreference,
      {
        identifierRequest,
        requestUserEmail: userEmail,
      },
    );

    if (resend && user.status === StatusEnum.ACTIVE) {
      this.logger.debug(
        `${identifierRequest} User already activated. Resend email not allowed`,
      );

      throw new BadRequestException(
        getMessage(MessagesHelperKey.USER_ALREADY_ACTIVED, languagePreference),
      );
    }
  }

  async getTokens(
    user: UserEntity,
    optionals?: {
      identifierRequest?: string;
    },
  ) {
    const identifierRequest = optionals?.identifierRequest ?? randomUUID();
    this.logger.debug(`${identifierRequest} Service - getTokens`);

    const { password, Role, UserAssignment, ...userWithoutPassword } = user;

    const payload = {
      sub: user.id,
      role: Role?.name,
      assignments: UserAssignment.map(userAssignment => {
        return {
          assignment: userAssignment?.Assignment?.name,
          create: userAssignment?.create,
          read: userAssignment?.read,
          update: userAssignment?.update,
          delete: userAssignment?.delete,
        };
      }),
      ...userWithoutPassword,
    };

    const [at, rt] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: process.env.AT_SECRET,
        expiresIn: process.env.JWT_ACCESS_LIFETIME,
      }),
      this.jwtService.signAsync(payload, {
        secret: process.env.RT_SECRET,
        expiresIn: process.env.JWT_REFRESH_LIFETIME,
      }),
    ]);

    this.logger.debug(
      `${identifierRequest} Tokens generated successfully. Returning tokens and exiting the service "getTokens"`,
    );

    return {
      accessToken: at,
      refreshToken: rt,
    };
  }

  async getMe(currentUser: UserPayload, languagePreference: Languages) {
    this.logger.debug(`Getting me ${currentUser.email}`);

    const userDb = await this.userRepository.findByIdAsync(currentUser.id);

    const { password, Role, UserAssignment, Media, ...userWithoutPassword } =
      userDb;

    return {
      sub: currentUser.id,
      role: Role?.name,
      avatar: Media?.url,
      assignments: UserAssignment.map(userAssignment => {
        return {
          assignment: userAssignment?.Assignment?.name,
          create: userAssignment?.create,
          read: userAssignment?.read,
          update: userAssignment?.update,
          delete: userAssignment?.delete,
        };
      }),
      ...userWithoutPassword,
    };
  }
}
