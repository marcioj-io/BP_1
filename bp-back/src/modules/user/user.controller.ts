import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Put,
  Query,
  Request,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiHeader,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AssignmentsEnum, RoleEnum } from '@prisma/client';
import { Response } from 'express';
import { AuthService } from 'src/auth/auth.service';
import { Assignments } from 'src/auth/decorators/assignments.decorator';
import { AuthenticatedUser } from 'src/auth/decorators/current-user.decorator';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { UserRegisteredResponse } from 'src/auth/dto/response/UserToken';
import { RequestModel } from 'src/auth/models/Request';
import { UserPayload } from 'src/auth/models/UserPayload';
import { DefaultFilter } from 'src/filters/DefaultFilter';
import { AuditLogRequestInformation } from 'src/middlewares/interface/logger';
import { AssignmentPermission } from 'src/utils/constants';
import { getIpAddress, getLanguage } from 'src/utils/get-ip-address';
import {
  ApiExceptionResponse,
  ApiOkResponsePaginated,
} from 'src/utils/swagger-schemas/SwaggerSchema';
import { fileInterceptor } from 'src/utils/validators/FileValidator';

import { DefaultFilterUser } from './dto/request/filters.personal.dto';
import { UpdateUserPersonalData } from './dto/request/update.personal.data.dto';
import { UpdateUserPassword } from './dto/request/update.personal.password.dto';
import { UserRestrictionBody } from './dto/request/user.block.dto';
import { UserCreateDto } from './dto/request/user.create.dto';
import { UserUpdateDto } from './dto/request/user.update.dto';
import { RoleForFilterDto } from './dto/response/assignments.dto';
import { UserResponseDto } from './dto/response/user.dto';
import { UserPaginationResponse } from './dto/response/user.pagination.response';
import { UserEntity } from './entity/user.entity';
import { UserTypeMap } from './entity/user.type.map';
import { UserService } from './user.service';

@Controller('user')
@ApiTags('User')
@ApiBearerAuth()
@ApiHeader({
  name: 'x-forwarded-for',
  required: false,
  description: 'O endereço IP original do cliente conectado',
  schema: { type: 'string' },
})
@ApiHeader({
  name: 'accept-language',
  required: false,
  description: 'Linguagem de preferência do usuário',
  schema: {
    type: 'string',
    enum: ['en-US', 'pt-BR'],
    default: 'pt',
  },
})
export class UserController {
  constructor(
    protected readonly service: UserService,
    protected readonly authService: AuthService,
  ) {
    this.service = service;
  }

  @ApiOperation({ summary: 'Get filtered user' })
  @ApiOkResponsePaginated(UserPaginationResponse)
  @ApiExceptionResponse()
  @ApiQuery({
    name: 'module',
    type: String,
    required: true,
  })
  @Assignments({
    assignments: [AssignmentsEnum.USER],
    permissions: [AssignmentPermission.READ],
  })
  @Get()
  async getFilteredAsync(
    @AuthenticatedUser() currentUser: UserPayload,
    @Res() response: Response,
    @Query() filter: DefaultFilterUser,
    @Request() request: RequestModel,
    @Query('module') currentModule: string,
  ) {
    const filteredData = await this.service.findFilteredAsync(
      filter,
      currentUser,
      getLanguage(request.headers['accept-language']),
      {
        currentModule,
      },
    );

    return response.status(HttpStatus.OK).json(filteredData);
  }

  @ApiOperation({ summary: 'Get one user' })
  @HttpCode(HttpStatus.OK)
  @ApiResponse({
    status: HttpStatus.OK,
    type: UserEntity,
  })
  @ApiParam({
    name: 'id',
    type: String,
    required: true,
  })
  @ApiExceptionResponse()
  @Assignments({
    assignments: [AssignmentsEnum.USER],
    permissions: [AssignmentPermission.READ],
  })
  @ApiQuery({
    name: 'module',
    type: String,
    required: true,
  })
  @Get('/:id')
  protected async findByIdAsync(
    @AuthenticatedUser() currentUser: UserPayload,
    @Res() response: Response,
    @Param('id') id: string,
    @Request() request: RequestModel,
    @Query('module') currentModule: string,
  ) {
    const userById = await this.service.findByIdAsync(
      id,
      currentUser,
      getLanguage(request.headers['accept-language']),
      {
        currentModule,
        mapper: {
          sourceClass: UserEntity,
          destinationClass: UserResponseDto,
        },
      },
    );

    return response.status(HttpStatus.OK).json(userById);
  }

  @ApiOperation({ summary: 'Create user' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    type: UserRegisteredResponse,
  })
  @ApiBody({ type: UserCreateDto })
  @ApiExceptionResponse()
  @Assignments({
    assignments: [AssignmentsEnum.USER],
    permissions: [AssignmentPermission.CREATE],
  })
  @Post()
  protected async createAsync(
    @AuthenticatedUser() currentUser: UserPayload,
    @Res() response: Response,
    @Body() dto: UserCreateDto,
    @Request() request: RequestModel,
    @Query('module') currentModule: string,
  ) {
    const data = await this.authService.register(
      dto,
      currentUser,
      new AuditLogRequestInformation(
        getIpAddress(request.headers['x-forwarded-for']),
        request.url,
        request.method,
      ),
      getLanguage(request.headers['accept-language']),
      currentModule,
    );

    return response.status(HttpStatus.CREATED).json(data.id);
  }

  @ApiOperation({ summary: 'Update user' })
  @ApiResponse({
    status: HttpStatus.OK,
  })
  @ApiBody({ type: UserUpdateDto })
  @ApiExceptionResponse()
  @Assignments({
    assignments: [AssignmentsEnum.USER],
    permissions: [AssignmentPermission.UPDATE],
  })
  @ApiQuery({
    name: 'module',
    type: String,
    required: true,
  })
  @Put('/:id')
  protected async updateAsync(
    @AuthenticatedUser() currentUser: UserPayload,
    @Res() response: Response,
    @Param('id') id: string,
    @Body() dto: UserUpdateDto,
    @Request() request: RequestModel,
    @Query('module') currentModule: string,
  ) {
    await this.service.updateAsync(
      id,
      dto,
      currentUser,
      getLanguage(request.headers['accept-language']),
      {
        currentModule,
      },
    );

    return response.status(HttpStatus.OK).json(id);
  }

  @ApiOperation({ summary: 'Delete user' })
  @ApiParam({
    name: 'id',
    type: String,
    required: true,
  })
  @ApiQuery({
    name: 'version',
    type: Number,
    required: true,
  })
  @ApiResponse({
    status: HttpStatus.OK,
  })
  @ApiExceptionResponse()
  @Assignments({
    assignments: [AssignmentsEnum.USER],
    permissions: [AssignmentPermission.DELETE],
  })
  @ApiQuery({
    name: 'module',
    type: String,
    required: true,
  })
  @Delete('/:id')
  protected async deleteAsync(
    @AuthenticatedUser() currentUser: UserPayload,
    @Res() response: Response,
    @Param('id') id: string,
    @Query('version') version: number,
    @Request() request: RequestModel,
    @Query('module') currentModule: string,
  ) {
    await this.service.deleteAsync(
      id,
      version,
      currentUser,
      getLanguage(request.headers['accept-language']),
      {
        currentModule,
      },
    );

    return response.status(HttpStatus.OK).json(id);
  }

  @ApiOperation({ summary: 'Block users' })
  @ApiResponse({
    status: HttpStatus.OK,
  })
  @ApiBody({ type: UserRestrictionBody })
  @ApiExceptionResponse()
  @Roles(RoleEnum.ADMIN)
  @Patch('block')
  protected async blockUsers(
    @AuthenticatedUser() currentUser: UserPayload,
    @Body() body: UserRestrictionBody,
    @Res() response: Response,
    @Request() request: RequestModel,
  ) {
    await this.service.blockUsers(
      body,
      currentUser,
      new AuditLogRequestInformation(
        getIpAddress(request.headers['x-forwarded-for']),
        request.url,
        request.method,
      ),
      getLanguage(request.headers['accept-language']),
    );

    return response.status(HttpStatus.OK).send();
  }

  @ApiOperation({ summary: 'Unblock users' })
  @ApiResponse({
    status: HttpStatus.OK,
  })
  @ApiBody({ type: UserRestrictionBody })
  @ApiExceptionResponse()
  @Roles(RoleEnum.ADMIN)
  @Patch('unblock')
  protected async unblockUsers(
    @AuthenticatedUser() currentUser: UserPayload,
    @Body() body: UserRestrictionBody,
    @Res() response: Response,
    @Request() request: RequestModel,
  ) {
    await this.service.unblockUsers(
      body,
      currentUser,
      new AuditLogRequestInformation(
        getIpAddress(request.headers['x-forwarded-for']),
        request.url,
        request.method,
      ),
      getLanguage(request.headers['accept-language']),
    );

    return response.status(HttpStatus.OK).send();
  }

  @ApiOperation({ summary: 'Change personal password' })
  @ApiResponse({
    status: HttpStatus.OK,
  })
  @ApiExceptionResponse()
  @Patch('personal/password')
  protected async changePersonalPassword(
    @AuthenticatedUser() currentUser: UserPayload,
    @Body() body: UpdateUserPassword,
    @Res() response: Response,
    @Request() request: RequestModel,
  ) {
    await this.service.updateUserPassword(
      body,
      currentUser,
      new AuditLogRequestInformation(
        getIpAddress(request.headers['x-forwarded-for']),
        request.url,
        request.method,
      ),
      getLanguage(request.headers['accept-language']),
    );

    return response.status(HttpStatus.OK).send();
  }

  @ApiOperation({ summary: 'Change personal data' })
  @ApiResponse({
    status: HttpStatus.OK,
  })
  @ApiExceptionResponse()
  @Patch('personal/data')
  protected async changePersonalData(
    @AuthenticatedUser() currentUser: UserPayload,
    @Body() body: UpdateUserPersonalData,
    @Res() response: Response,
    @Request() request: RequestModel,
  ) {
    await this.service.updateUserPersonalData(
      body,
      currentUser,
      new AuditLogRequestInformation(
        getIpAddress(request.headers['x-forwarded-for']),
        request.url,
        request.method,
      ),
      getLanguage(request.headers['accept-language']),
    );

    return response.status(HttpStatus.OK).send();
  }

  @ApiOperation({ summary: 'Get roles to use on list page filter' })
  @ApiResponse({
    status: HttpStatus.OK,
    type: [RoleForFilterDto],
  })
  @ApiExceptionResponse()
  @Assignments({
    assignments: [AssignmentsEnum.USER],
    permissions: [AssignmentPermission.READ],
  })
  @ApiQuery({
    name: 'module',
    type: String,
    required: true,
  })
  @Get('filter/roles')
  protected async getRoles(
    @AuthenticatedUser() currentUser: UserPayload,
    @Res() response: Response,
    @Request() request: RequestModel,
    @Query('module') moduleName: string,
  ) {
    const roles = await this.service.getRolesForFilter(
      moduleName,
      currentUser,
      getLanguage(request.headers['accept-language']),
    );

    return response.status(HttpStatus.OK).json(roles);
  }

  @ApiOperation({ summary: 'Upload new avatar' })
  @ApiResponse({
    status: HttpStatus.OK,
    type: [RoleForFilterDto],
  })
  @ApiExceptionResponse()
  @Assignments({
    assignments: [AssignmentsEnum.USER],
    permissions: [AssignmentPermission.UPDATE],
  })
  @ApiQuery({
    name: 'module',
    type: String,
    required: true,
  })
  @ApiParam({
    name: 'id',
    type: String,
    required: true,
  })
  @ApiQuery({
    name: 'version',
    type: Number,
    required: true,
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'The file in jpg, jpeg, or png format',
        },
      },
    },
  })
  @Post('/:id/avatar')
  @UseInterceptors(
    fileInterceptor('file', 2000000, ['image/jpeg', 'image/png']),
  )
  protected async uploadAvatar(
    @AuthenticatedUser() currentUser: UserPayload,
    @Res() response: Response,
    @Request() request: RequestModel,
    @UploadedFile() file: Express.Multer.File,
    @Param('id') id: string,
    @Query('version') version: number,
  ) {
    const roles = await this.service.uploadAvatar(
      id,
      file,
      currentUser,
      getLanguage(request.headers['accept-language']),
      version,
    );

    return response.status(HttpStatus.OK).json(roles);
  }
}
