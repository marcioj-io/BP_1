import { createMap, forMember, mapFrom, Mapper } from '@automapper/core';
import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';
import { Injectable } from '@nestjs/common';

import { PackageDto } from './dto/response/package.dto';
import { PackageEntity } from './entity/package.entity';

@Injectable()
export class PackageMapping extends AutomapperProfile {
  constructor(@InjectMapper() mapper: Mapper) {
    super(mapper);
  }

  override get profile() {
    return (mapper: Mapper) => {
      const baseMapper = createMap(
        mapper,
        PackageEntity,
        PackageDto,
        forMember(
          destination => destination.id,
          mapFrom(source => source.id),
        ),
      );
    };
  }
}
