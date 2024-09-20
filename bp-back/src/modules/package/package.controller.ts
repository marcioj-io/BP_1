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
import { PackageCreateDto } from './dto/request/package.create.dto';
import { PackageUpdateDto } from './dto/request/package.update.dto';
import { PackagePaginationResponse } from './dto/response/package.pagination.response';
import { PackageEntity } from './entity/package.entity';
import { PackageTypeMap } from './entity/package.type.map';
import { PackageService } from './package.service';

@Controller('packages')
@ApiTags('Package')
export class PackageController extends BaseController<
  PackageTypeMap,
  PackageCreateDto,
  PackageUpdateDto
> {
  constructor(protected readonly service: PackageService) {
    super(service);
  }

  @ApiOperation({ summary: 'Get filtered Package' })
  @ApiOkResponsePaginated(PackagePaginationResponse)
  @ApiExceptionResponse()
  @Assignments({
    assignments: [AssignmentsEnum.PACKAGE],
    permissions: [AssignmentPermission.READ],
  })
  @Get()
  async getFilteredAsync(
    @AuthenticatedUser() currentUser: UserPayload,
    @Res() response: Response,
    @Query() filter: DefaultFilter<PackageTypeMap>,
    @Request() request: RequestModel,
  ) {
    const filteredData = await this.service.findFilteredAsync(
      filter,
      currentUser,
      getLanguage(request.headers['accept-language']),
    );

    return response.status(HttpStatus.OK).json(filteredData);
  }

  @ApiOperation({ summary: 'Get one Package' })
  @HttpCode(HttpStatus.OK)
  @ApiResponse({
    status: HttpStatus.OK,
    type: PackageEntity,
  })
  @ApiParam({
    name: 'id',
    type: String,
    required: true,
  })
  @ApiExceptionResponse()
  @Assignments({
    assignments: [AssignmentsEnum.PACKAGE],
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

  @ApiOperation({ summary: 'Create Package' })
  @ApiResponse({
    status: HttpStatus.CREATED,
  })
  @ApiBody({ type: PackageCreateDto })
  @ApiExceptionResponse()
  @Assignments({
    assignments: [AssignmentsEnum.PACKAGE],
    permissions: [AssignmentPermission.CREATE],
  })
  @Post()
  protected async createAsync(
    @AuthenticatedUser() currentUser: UserPayload,
    @Res() response: Response,
    @Body() dto: PackageCreateDto,
    @Request() request: RequestModel,
  ) {
    const data = await this.service.createAsync(
      dto,
      currentUser,
      getLanguage(request.headers['accept-language']),
    );

    return response.status(HttpStatus.CREATED).json(data.id);
  }

  @ApiOperation({ summary: 'Update Package' })
  @ApiResponse({
    status: HttpStatus.OK,
  })
  @ApiBody({ type: PackageUpdateDto })
  @ApiExceptionResponse()
  @Assignments({
    assignments: [AssignmentsEnum.PACKAGE],
    permissions: [AssignmentPermission.UPDATE],
  })
  @Put('/:id')
  protected async updateAsync(
    @AuthenticatedUser() currentUser: UserPayload,
    @Res() response: Response,
    @Param('id') id: string,
    @Body() dto: PackageUpdateDto,
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

  @ApiOperation({ summary: 'Delete Package' })
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
    assignments: [AssignmentsEnum.PACKAGE],
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
