import { createMap, forMember, mapFrom, Mapper } from '@automapper/core';
import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';
import { Injectable } from '@nestjs/common';

import { ClientHistoryDto } from './dto/response/client-history.dto';
import { ClientHistoryEntity } from './entity/client-history.entity';

@Injectable()
export class ClientHistoryMapping extends AutomapperProfile {
  constructor(@InjectMapper() mapper: Mapper) {
    super(mapper);
  }

  override get profile() {
    return (mapper: Mapper) => {
      const baseMapper = createMap(
        mapper,
        ClientHistoryEntity,
        ClientHistoryDto,
        forMember(
          destination => destination.id,
          mapFrom(source => source.id),
        ),
      );
    };
  }
}
