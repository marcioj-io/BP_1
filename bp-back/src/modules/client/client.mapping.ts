import { createMap, forMember, mapFrom, Mapper } from '@automapper/core';
import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';
import { Injectable } from '@nestjs/common';

import { ClientDto } from './dto/response/client.dto';
import { ClientEntity } from './entity/client.entity';

@Injectable()
export class ClientMapping extends AutomapperProfile {
  constructor(@InjectMapper() mapper: Mapper) {
    super(mapper);
  }

  override get profile() {
    return (mapper: Mapper) => {
      const baseMapper = createMap(
        mapper,
        ClientEntity,
        ClientDto,
        forMember(
          destination => destination.id,
          mapFrom(source => source.id),
        ),
      );
    };
  }
}
