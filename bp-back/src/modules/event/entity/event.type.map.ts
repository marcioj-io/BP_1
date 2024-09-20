import { Prisma } from '@prisma/client';

import { CrudTypeMap } from '../../base/interfaces/ICrudTypeMap';

export class EventTypeMap implements CrudTypeMap {
  aggregate: Prisma.EventAggregateArgs;
  count: Prisma.EventCountArgs;
  create: Prisma.EventCreateInput;
  createUnchecked: Prisma.EventUncheckedCreateInput;
  delete: Prisma.EventDeleteArgs;
  deleteMany: Prisma.EventDeleteManyArgs;
  findFirst: Prisma.EventFindFirstArgs;
  findMany: Prisma.EventFindManyArgs;
  findUnique: Prisma.EventFindUniqueArgs;
  update: Prisma.EventUpdateInput;
  updateMany: Prisma.EventUpdateManyArgs;
  upsert: Prisma.EventUpsertArgs;
  where: Prisma.EventWhereInput;
  select: Prisma.EventSelect;
  orderBy: Prisma.EventOrderByWithRelationInput;
}
