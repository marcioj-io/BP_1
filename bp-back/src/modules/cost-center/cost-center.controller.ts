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
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
  ApiBearerAuth,
  ApiHeader,
} from '@nestjs/swagger';
import { AssignmentsEnum } from '@prisma/client';
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

import { CostCenterService } from './cost-center.service';
import { CostCenterCreateDto } from './dto/request/cost-center.create.dto';
import { DefaultFilterCostCenter } from './dto/request/cost-center.filter.dto';
import { CostCenterUpdateDto } from './dto/request/cost-center.update.dto';
import { CostCenterPaginationResponse } from './dto/response/cost-center.pagination.response';
import { CostCenterEntity } from './entity/cost-center.entity';

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
@Controller('clients/:clientId/cost-centers')
@ApiTags('CostCenter')
export class CostCenterController {
  constructor(protected readonly service: CostCenterService) {
    this.service = service;
  }

  @ApiOperation({ summary: 'Get filtered CostCenter' })
  @ApiOkResponsePaginated(CostCenterPaginationResponse)
  @ApiExceptionResponse()
  @Assignments({
    assignments: [AssignmentsEnum.COST_CENTER],
    permissions: [AssignmentPermission.READ],
  })
  @Get()
  async getFilteredAsync(
    @AuthenticatedUser() currentUser: UserPayload,
    @Res() response: Response,
    @Query() filter: DefaultFilterCostCenter,
    @Param('clientId') clientId: string,
    @Request() request: RequestModel,
  ) {
    const filteredData = await this.service.findFilteredAsync(
      clientId,
      filter,
      currentUser,
      getLanguage(request.headers['accept-language']),
    );

    return response.status(HttpStatus.OK).json(filteredData);
  }

  @ApiOperation({ summary: 'Get one CostCenter' })
  @HttpCode(HttpStatus.OK)
  @ApiResponse({
    status: HttpStatus.OK,
    type: CostCenterEntity,
  })
  @ApiParam({
    name: 'id',
    type: String,
    required: true,
  })
  @ApiExceptionResponse()
  @Assignments({
    assignments: [AssignmentsEnum.COST_CENTER],
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
      clientId,
      id,
      currentUser,
      getLanguage(request.headers['accept-language']),
    );

    return response.status(HttpStatus.OK).json(data);
  }

  @ApiOperation({ summary: 'Create CostCenter' })
  @ApiResponse({
    status: HttpStatus.CREATED,
  })
  @ApiBody({ type: CostCenterCreateDto })
  @ApiExceptionResponse()
  @Assignments({
    assignments: [AssignmentsEnum.COST_CENTER],
    permissions: [AssignmentPermission.CREATE],
  })
  @Post()
  protected async createAsync(
    @AuthenticatedUser() currentUser: UserPayload,
    @Res() response: Response,
    @Body() dto: CostCenterCreateDto,
    @Param('clientId') clientId: string,
    @Request() request: RequestModel,
  ) {
    const data = await this.service.createAsync(
      clientId,
      dto,
      currentUser,
      getLanguage(request.headers['accept-language']),
    );

    return response.status(HttpStatus.CREATED).json(data.id);
  }

  @ApiOperation({ summary: 'Update CostCenter' })
  @ApiResponse({
    status: HttpStatus.OK,
  })
  @ApiBody({ type: CostCenterUpdateDto })
  @ApiExceptionResponse()
  @Assignments({
    assignments: [AssignmentsEnum.COST_CENTER],
    permissions: [AssignmentPermission.UPDATE],
  })
  @Put('/:id')
  protected async updateAsync(
    @AuthenticatedUser() currentUser: UserPayload,
    @Res() response: Response,
    @Param('id') id: string,
    @Body() dto: CostCenterUpdateDto,
    @Param('clientId') clientId: string,
    @Request() request: RequestModel,
  ) {
    await this.service.updateAsync(
      clientId,
      id,
      dto,
      currentUser,
      getLanguage(request.headers['accept-language']),
    );

    return response.status(HttpStatus.OK).json(id);
  }

  @ApiOperation({ summary: 'Delete CostCenter' })
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
    assignments: [AssignmentsEnum.COST_CENTER],
    permissions: [AssignmentPermission.DELETE],
  })
  @Delete('/:id')
  protected async deleteAsync(
    @AuthenticatedUser() currentUser: UserPayload,
    @Res() response: Response,
    @Param('id') id: string,
    @Query('version', ParseIntPipe) version: number,
    @Param('clientId') clientId: string,
    @Request() request: RequestModel,
  ) {
    await this.service.deleteAsync(
      clientId,
      id,
      version,
      currentUser,
      getLanguage(request.headers['accept-language']),
    );

    return response.status(HttpStatus.OK).json(id);
  }
}
