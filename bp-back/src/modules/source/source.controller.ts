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
  ApiBody,
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
import { ActionEnum } from './dto/request/client.alter-status.dto';
import { SourceCreateDto } from './dto/request/source.create.dto';
import { SourceUpdateDto } from './dto/request/source.update.dto';
import { SourcePaginationResponse } from './dto/response/source.pagination.response';
import { SourceEntity } from './entity/source.entity';
import { SourceTypeMap } from './entity/source.type.map';
import { SourceService } from './source.service';

@Controller('sources')
@ApiTags('Source')
export class SourceController extends BaseController<
  SourceTypeMap,
  SourceCreateDto,
  SourceUpdateDto
> {
  constructor(protected readonly service: SourceService) {
    super(service);
  }

  @ApiOperation({ summary: 'Get filtered Source' })
  @ApiOkResponsePaginated(SourcePaginationResponse)
  @ApiExceptionResponse()
  @Assignments({
    assignments: [AssignmentsEnum.SOURCE],
    permissions: [AssignmentPermission.READ],
  })
  @Get()
  async getFilteredAsync(
    @AuthenticatedUser() currentUser: UserPayload,
    @Res() response: Response,
    @Query() filter: DefaultFilter<SourceTypeMap>,
    @Request() request: RequestModel,
  ) {
    const filteredData = await this.service.findFilteredAsync(
      filter,
      currentUser,
      getLanguage(request.headers['accept-language']),
    );

    return response.status(HttpStatus.OK).json(filteredData);
  }

  @ApiOperation({ summary: 'Get one Source' })
  @HttpCode(HttpStatus.OK)
  @ApiResponse({
    status: HttpStatus.OK,
    type: SourceEntity,
  })
  @ApiParam({
    name: 'id',
    type: String,
    required: true,
  })
  @ApiExceptionResponse()
  @Assignments({
    assignments: [AssignmentsEnum.SOURCE],
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

  @ApiOperation({ summary: 'Create Source' })
  @ApiResponse({
    status: HttpStatus.CREATED,
  })
  @ApiBody({ type: SourceCreateDto })
  @ApiExceptionResponse()
  @Assignments({
    assignments: [AssignmentsEnum.SOURCE],
    permissions: [AssignmentPermission.CREATE],
  })
  @Post()
  protected async createAsync(
    @AuthenticatedUser() currentUser: UserPayload,
    @Res() response: Response,
    @Body() dto: SourceCreateDto,
    @Request() request: RequestModel,
  ) {
    const data = await this.service.createAsync(
      dto,
      currentUser,
      getLanguage(request.headers['accept-language']),
    );

    return response.status(HttpStatus.CREATED).json(data.id);
  }

  @ApiOperation({ summary: 'Update Source' })
  @ApiResponse({
    status: HttpStatus.OK,
  })
  @ApiBody({ type: SourceUpdateDto })
  @ApiExceptionResponse()
  @Assignments({
    assignments: [AssignmentsEnum.SOURCE],
    permissions: [AssignmentPermission.UPDATE],
  })
  @Put('/:id')
  protected async updateAsync(
    @AuthenticatedUser() currentUser: UserPayload,
    @Res() response: Response,
    @Param('id') id: string,
    @Body() dto: SourceUpdateDto,
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

  @ApiOperation({ summary: 'Delete Source' })
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
    assignments: [AssignmentsEnum.SOURCE],
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
  @ApiOperation({ summary: 'Active or deactivate a source' })
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
