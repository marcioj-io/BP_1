import { createMap, forMember, mapFrom, Mapper } from '@automapper/core';
import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';
import { Injectable } from '@nestjs/common';

import { EventDto } from './dto/response/event.dto';
import { EventEntity } from './entity/event.entity';

@Injectable()
export class EventMapping extends AutomapperProfile {
  constructor(@InjectMapper() mapper: Mapper) {
    super(mapper);
  }

  override get profile() {
    return (mapper: Mapper) => {
      const baseMapper = createMap(
        mapper,
        EventEntity,
        EventDto,
        forMember(
          destination => destination.id,
          mapFrom(source => source.id),
        ),
      );
    };
  }
}
