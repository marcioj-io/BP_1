import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Query,
  Request,
  Res,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiHeader,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AssignmentsEnum, EventEnum, EventTypeEnum } from '@prisma/client';
import { Response } from 'express';
import { Assignments } from 'src/auth/decorators/assignments.decorator';
import { AuthenticatedUser } from 'src/auth/decorators/current-user.decorator';
import { RequestModel } from 'src/auth/models/Request';
import { UserPayload } from 'src/auth/models/UserPayload';
import { AssignmentPermission } from 'src/utils/constants';
import { getLanguage } from 'src/utils/get-ip-address';
import {
  ApiExceptionResponse,
  ApiOkResponsePaginated,
} from 'src/utils/swagger-schemas/SwaggerSchema';

import { DefaultFilterEvent } from './dto/request/event.filtes.dto';
import { EventPaginationResponse } from './dto/response/event.pagination.response';
import { EventEntity } from './entity/event.entity';
import { EventService } from './event.service';

@Controller('event-logs')
@ApiTags('Event Logs')
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
export class EventController {
  constructor(protected readonly service: EventService) {
    this.service = service;
  }

  @ApiOperation({ summary: 'Get filtered Event' })
  @ApiOkResponsePaginated(EventPaginationResponse)
  @ApiExceptionResponse()
  @Assignments({
    assignments: [AssignmentsEnum.EVENT],
    permissions: [AssignmentPermission.READ],
  })
  @ApiQuery({ name: 'type', enum: EventTypeEnum, required: false })
  @ApiQuery({ name: 'event', enum: EventEnum, required: false })
  @ApiQuery({ name: 'startDate', type: Date, required: false })
  @ApiQuery({ name: 'endDate', type: Date, required: false })
  @Get()
  async getFilteredAsync(
    @AuthenticatedUser() currentUser: UserPayload,
    @Res() response: Response,
    @Query() filter: DefaultFilterEvent,
    @Request() request: RequestModel,
  ) {
    const filteredData = await this.service.findFilteredAsync(
      filter,
      currentUser,
      getLanguage(request.headers['accept-language']),
    );

    return response.status(HttpStatus.OK).json(filteredData);
  }

  @ApiOperation({ summary: 'Get one Event' })
  @HttpCode(HttpStatus.OK)
  @ApiResponse({
    status: HttpStatus.OK,
    type: EventEntity,
  })
  @ApiParam({
    name: 'id',
    type: String,
    required: true,
  })
  @ApiExceptionResponse()
  @Assignments({
    assignments: [AssignmentsEnum.EVENT],
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
}
