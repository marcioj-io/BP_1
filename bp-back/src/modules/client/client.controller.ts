import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  Request,
  Res,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiHeader,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AssignmentsEnum } from '@prisma/client';
import { Response } from 'express';
import { AuthService } from 'src/auth/auth.service';
import { Assignments } from 'src/auth/decorators/assignments.decorator';
import { AuthenticatedUser } from 'src/auth/decorators/current-user.decorator';
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

import { ClientService } from './client.service';
import { ActionEnum } from './dto/request/client.alter-status.dto';
import { ClientCreateDto } from './dto/request/client.create.dto';
import { ClientUpdateDto } from './dto/request/client.update.dto';
import { ClientPaginationResponse } from './dto/response/client.pagination.response';
import { ClientEntity } from './entity/client.entity';
import { ClientTypeMap } from './entity/client.type.map';

@Controller('clients')
@ApiTags('Clients')
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
export class ClientController {
  constructor(protected readonly service: ClientService) {
    this.service = service;
  }

  @ApiOperation({ summary: 'Get filtered Client' })
  @ApiOkResponsePaginated(ClientPaginationResponse)
  @ApiExceptionResponse()
  @Assignments({
    assignments: [AssignmentsEnum.CLIENT],
    permissions: [AssignmentPermission.READ],
  })
  @Get()
  async getFilteredAsync(
    @AuthenticatedUser() currentUser: UserPayload,
    @Res() response: Response,
    @Query() filter: DefaultFilter<ClientTypeMap>,
    @Request() request: RequestModel,
  ) {
    const filteredData = await this.service.findFilteredAsync(
      filter,
      currentUser,
      getLanguage(request.headers['accept-language']),
    );

    return response.status(HttpStatus.OK).json(filteredData);
  }

  @ApiOperation({ summary: 'Get one Client' })
  @HttpCode(HttpStatus.OK)
  @ApiResponse({
    status: HttpStatus.OK,
    type: ClientEntity,
  })
  @ApiParam({
    name: 'id',
    type: String,
    required: true,
  })
  @ApiExceptionResponse()
  @Assignments({
    assignments: [AssignmentsEnum.CLIENT],
    permissions: [AssignmentPermission.READ],
  })
  @Get('/:id')
  protected async findByIdAsync(
    @AuthenticatedUser() currentUser: UserPayload,
    @Res() response: Response,
    @Param('id') id: string,
    @Request() request: RequestModel,
  ) {
    const data = await this.service.findByIdAsync(
      id,
      currentUser,
      getLanguage(request.headers['accept-language']),
    );

    return response.status(HttpStatus.OK).json(data);
  }

  @ApiOperation({ summary: 'Create Client' })
  @ApiResponse({
    status: HttpStatus.CREATED,
  })
  @ApiBody({ type: ClientCreateDto })
  @ApiExceptionResponse()
  @Assignments({
    assignments: [AssignmentsEnum.CLIENT],
    permissions: [AssignmentPermission.CREATE],
  })
  @Post()
  protected async createAsync(
    @AuthenticatedUser() currentUser: UserPayload,
    @Res() response: Response,
    @Body() dto: ClientCreateDto,
    @Request() request: RequestModel,
  ) {
    const data = await this.service.createAsync(
      dto,
      new AuditLogRequestInformation(
        getIpAddress(request.headers['x-forwarded-for']),
        request.url,
        request.method,
      ),
      currentUser,
      getLanguage(request.headers['accept-language']),
    );

    return response.status(HttpStatus.CREATED).json(data.id);
  }

  @ApiOperation({ summary: 'Update Client' })
  @ApiResponse({
    status: HttpStatus.OK,
  })
  @ApiBody({ type: ClientUpdateDto })
  @ApiExceptionResponse()
  @Assignments({
    assignments: [AssignmentsEnum.CLIENT],
    permissions: [AssignmentPermission.UPDATE],
  })
  @Put('/:id')
  protected async updateAsync(
    @AuthenticatedUser() currentUser: UserPayload,
    @Res() response: Response,
    @Param('id') id: string,
    @Body() dto: ClientUpdateDto,
    @Request() request: RequestModel,
  ) {
    await this.service.updateAsync(
      id,
      dto,
      currentUser,
      getLanguage(request.headers['accept-language']),
    );

    return response.status(HttpStatus.OK).json(id);
  }

  @ApiOperation({ summary: 'Delete Client' })
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
    assignments: [AssignmentsEnum.CLIENT],
    permissions: [AssignmentPermission.DELETE],
  })
  @Delete('/:id')
  protected async deleteAsync(
    @AuthenticatedUser() currentUser: UserPayload,
    @Res() response: Response,
    @Param('id') id: string,
    @Query('version', ParseIntPipe) version: number,
    @Request() request: RequestModel,
  ) {
    await this.service.deleteAsync(
      id,
      version,
      currentUser,
      getLanguage(request.headers['accept-language']),
    );

    return response.status(HttpStatus.OK).json(id);
  }
  @ApiOperation({ summary: 'Active or deactivate a client' })
  @ApiParam({
    name: 'id',
    type: String,
    required: true,
  })
  @ApiParam({
    name: 'action',
    type: String,
    required: true,
    example: 'activate or deactivate',
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
    assignments: [AssignmentsEnum.CLIENT],
    permissions: [AssignmentPermission.UPDATE],
  })
  @Post('/:id/status/:action')
  protected async alterStatus(
    @AuthenticatedUser() currentUser: UserPayload,
    @Res() response: Response,
    @Param('id') id: string,
    @Param('action') action: ActionEnum,
    @Query('version', ParseIntPipe)
    version: number,
    @Request() request: RequestModel,
  ) {
    await this.service.alterStatusAsync(
      action,
      id,
      version,
      currentUser,
      getLanguage(request.headers['accept-language']),
    );

    return response.status(HttpStatus.OK).json(id);
  }
}
