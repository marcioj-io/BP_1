import { Controller } from '@nestjs/common';
import {
  Body,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  Res,
  ParseIntPipe,
  HttpCode,
  Request,
  HttpStatus,
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
import { Assignments } from 'src/auth/decorators/assignments.decorator';
import { AuthenticatedUser } from 'src/auth/decorators/current-user.decorator';
import { RequestModel } from 'src/auth/models/Request';
import { UserPayload } from 'src/auth/models/UserPayload';
import { DefaultFilter } from 'src/filters/DefaultFilter';
import { AssignmentPermission } from 'src/utils/constants';
import { getLanguage } from 'src/utils/get-ip-address';
import {
  ApiExceptionResponse,
  ApiOkResponsePaginated,
} from 'src/utils/swagger-schemas/SwaggerSchema';

import { BaseController } from '../base/base.controller';
import { ClientHistoryService } from './client-history.service';
import { ClientHistoryCreateDto } from './dto/request/client-history.create.dto';
import { DefaultFilterHistory } from './dto/request/client-history.filter.dto';
import { ClientHistoryUpdateDto } from './dto/request/client-history.update.dto';
import { ClientHistoryPaginationResponse } from './dto/response/client-history.pagination.response';
import { ClientHistoryEntity } from './entity/client-history.entity';
import { ClientHistoryTypeMap } from './entity/client-history.type.map';

@Controller('clients/:clientId/histories')
@ApiTags('ClientHistory')
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
export class ClientHistoryController {
  constructor(protected readonly service: ClientHistoryService) {
    this.service = service;
  }

  @ApiOperation({ summary: 'Get filtered ClientHistory' })
  @ApiOkResponsePaginated(ClientHistoryPaginationResponse)
  @ApiExceptionResponse()
  @Assignments({
    assignments: [AssignmentsEnum.CLIENT_HISTORY],
    permissions: [AssignmentPermission.READ],
  })
  @Get()
  async getFilteredAsync(
    @AuthenticatedUser() currentUser: UserPayload,
    @Res() response: Response,
    @Query() filter: DefaultFilterHistory,
    @Param('clientId') clientId: string,
    @Request() request: RequestModel,
  ) {
    const filteredData = await this.service.findFilteredAsync(
      filter,
      clientId,
      currentUser,
      getLanguage(request.headers['accept-language']),
    );

    return response.status(HttpStatus.OK).json(filteredData);
  }

  @ApiOperation({ summary: 'Get one ClientHistory' })
  @HttpCode(HttpStatus.OK)
  @ApiResponse({
    status: HttpStatus.OK,
    type: ClientHistoryEntity,
  })
  @ApiParam({
    name: 'id',
    type: String,
    required: true,
  })
  @ApiExceptionResponse()
  @Assignments({
    assignments: [AssignmentsEnum.CLIENT_HISTORY],
    permissions: [AssignmentPermission.READ],
  })
  @Get('/:id')
  protected async findByIdAsync(
    @AuthenticatedUser() currentUser: UserPayload,
    @Res() response: Response,
    @Param('id') id: string,
    @Param('clientId') clientId: string,
    @Request() request: RequestModel,
  ) {
    const data = await this.service.findByIdAsync(
      id,
      clientId,
      currentUser,
      getLanguage(request.headers['accept-language']),
    );

    return response.status(HttpStatus.OK).json(data);
  }

  @ApiOperation({ summary: 'Create ClientHistory' })
  @ApiResponse({
    status: HttpStatus.CREATED,
  })
  @ApiBody({ type: ClientHistoryCreateDto })
  @ApiExceptionResponse()
  @Assignments({
    assignments: [AssignmentsEnum.CLIENT_HISTORY],
    permissions: [AssignmentPermission.CREATE],
  })
  @Post()
  protected async createAsync(
    @AuthenticatedUser() currentUser: UserPayload,
    @Res() response: Response,
    @Body() dto: ClientHistoryCreateDto,
    @Param('clientId') clientId: string,
    @Request() request: RequestModel,
  ) {
    const data = await this.service.createAsync(
      dto,
      clientId,
      currentUser,
      getLanguage(request.headers['accept-language']),
    );

    return response.status(HttpStatus.CREATED).json(data.id);
  }

  @ApiOperation({ summary: 'Delete ClientHistory' })
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
    assignments: [AssignmentsEnum.CLIENT_HISTORY],
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
}
