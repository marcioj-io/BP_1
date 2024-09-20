import { Controller } from '@nestjs/common';
import { Get, Query, Res, HttpStatus, Request } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiHeader,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AssignmentsEnum } from '@prisma/client';
import { Response } from 'express';
import { Assignments } from 'src/auth/decorators/assignments.decorator';
import { AuthenticatedUser } from 'src/auth/decorators/current-user.decorator';
import { RequestModel } from 'src/auth/models/Request';
import { UserPayload } from 'src/auth/models/UserPayload';
import { AssignmentPermission } from 'src/utils/constants';
import { getLanguage } from 'src/utils/get-ip-address';
import { ApiExceptionResponse } from 'src/utils/swagger-schemas/SwaggerSchema';

import { AssignmentsDto, RoleDto } from '../user/dto/response/assignments.dto';
import { TenantService } from './tenant.service';

@Controller('tenant')
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
@ApiTags('Tenant')
export class TenantController {
  constructor(private readonly service: TenantService) {}

  @ApiOperation({ summary: 'Get assignments' })
  @ApiResponse({
    status: HttpStatus.OK,
    type: [AssignmentsDto],
  })
  @ApiExceptionResponse()
  @Assignments({
    assignments: [AssignmentsEnum.USER],
    permissions: [AssignmentPermission.CREATE, AssignmentPermission.UPDATE],
  })
  @ApiQuery({
    name: 'module',
    type: String,
    required: true,
  })
  @ApiQuery({
    name: 'role',
    type: String,
    required: true,
  })
  @Get('assignments')
  protected async getAssignments(
    @AuthenticatedUser() currentUser: UserPayload,
    @Res() response: Response,
    @Request() request: RequestModel,
    @Query('module') moduleName: string,
    @Query('role') roleId: string,
  ) {
    const assignments = await this.service.getAssignments(
      moduleName,
      roleId,
      currentUser,
      getLanguage(request.headers['accept-language']),
    );

    return response.status(HttpStatus.OK).json(assignments);
  }

  @ApiOperation({ summary: 'Get roles' })
  @ApiResponse({
    status: HttpStatus.OK,
    type: [RoleDto],
  })
  @ApiExceptionResponse()
  @Assignments({
    assignments: [AssignmentsEnum.USER],
    permissions: [AssignmentPermission.CREATE, AssignmentPermission.UPDATE],
  })
  @ApiQuery({
    name: 'module',
    type: String,
    required: true,
  })
  @Get('roles')
  protected async getRoles(
    @AuthenticatedUser() currentUser: UserPayload,
    @Res() response: Response,
    @Request() request: RequestModel,
    @Query('module') moduleName: string,
  ) {
    const roles = await this.service.getRoles(
      moduleName,
      currentUser,
      getLanguage(request.headers['accept-language']),
    );

    return response.status(HttpStatus.OK).json(roles);
  }
}
