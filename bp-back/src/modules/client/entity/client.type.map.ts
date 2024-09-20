import { Prisma } from '@prisma/client';

import { CrudTypeMap } from '../../base/interfaces/ICrudTypeMap';

export class ClientTypeMap implements CrudTypeMap {
  aggregate: Prisma.ClientAggregateArgs;
  count: Prisma.ClientCountArgs;
  create: Prisma.ClientCreateInput;
  createUnchecked: Prisma.ClientUncheckedCreateInput;
  delete: Prisma.ClientDeleteArgs;
  deleteMany: Prisma.ClientDeleteManyArgs;
  findFirst: Prisma.ClientFindFirstArgs;
  findMany: Prisma.ClientFindManyArgs;
  findUnique: Prisma.ClientFindUniqueArgs;
  update: Prisma.ClientUpdateInput;
  updateMany: Prisma.ClientUpdateManyArgs;
  upsert: Prisma.ClientUpsertArgs;
  where: Prisma.ClientWhereInput;
  select: Prisma.ClientSelect;
  orderBy: Prisma.ClientOrderByWithRelationInput;
}
