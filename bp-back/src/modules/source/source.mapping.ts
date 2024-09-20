import { createMap, forMember, mapFrom, Mapper } from '@automapper/core';
import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';
import { Injectable } from '@nestjs/common';

import { SourceDto } from './dto/response/source.dto';
import { SourceEntity } from './entity/source.entity';

@Injectable()
export class SourceMapping extends AutomapperProfile {
  constructor(@InjectMapper() mapper: Mapper) {
    super(mapper);
  }

  override get profile() {
    return (mapper: Mapper) => {
      const baseMapper = createMap(
        mapper,
        SourceEntity,
        SourceDto,
        forMember(
          destination => destination.id,
          mapFrom(source => source.id),
        ),
      );
    };
  }
}
