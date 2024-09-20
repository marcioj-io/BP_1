import { Prisma } from '@prisma/client';

import { CrudTypeMap } from '../../base/interfaces/ICrudTypeMap';

export class SourceTypeMap implements CrudTypeMap {
  aggregate: Prisma.SourceAggregateArgs;
  count: Prisma.SourceCountArgs;
  create: Prisma.SourceCreateInput;
  createUnchecked: Prisma.SourceUncheckedCreateInput;
  delete: Prisma.SourceDeleteArgs;
  deleteMany: Prisma.SourceDeleteManyArgs;
  findFirst: Prisma.SourceFindFirstArgs;
  findMany: Prisma.SourceFindManyArgs;
  findUnique: Prisma.SourceFindUniqueArgs;
  update: Prisma.SourceUpdateInput;
  updateMany: Prisma.SourceUpdateManyArgs;
  upsert: Prisma.SourceUpsertArgs;
  where: Prisma.SourceWhereInput;
  select: Prisma.SourceSelect;
  orderBy: Prisma.SourceOrderByWithRelationInput;
}
