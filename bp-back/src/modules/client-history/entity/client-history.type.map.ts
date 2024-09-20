import { Prisma } from '@prisma/client';

import { CrudTypeMap } from '../../base/interfaces/ICrudTypeMap';

export class ClientHistoryTypeMap implements CrudTypeMap {
  aggregate: Prisma.ClientHistoryAggregateArgs;
  count: Prisma.ClientHistoryCountArgs;
  create: Prisma.ClientHistoryCreateInput;
  createUnchecked: Prisma.ClientHistoryUncheckedCreateInput;
  delete: Prisma.ClientHistoryDeleteArgs;
  deleteMany: Prisma.ClientHistoryDeleteManyArgs;
  findFirst: Prisma.ClientHistoryFindFirstArgs;
  findMany: Prisma.ClientHistoryFindManyArgs;
  findUnique: Prisma.ClientHistoryFindUniqueArgs;
  update: Prisma.ClientHistoryUpdateInput;
  updateMany: Prisma.ClientHistoryUpdateManyArgs;
  upsert: Prisma.ClientHistoryUpsertArgs;
  where: Prisma.ClientHistoryWhereInput;
  select: Prisma.ClientHistorySelect;
  orderBy: Prisma.ClientHistoryOrderByWithRelationInput;
}
