import { Prisma } from '@prisma/client';

import { CrudTypeMap } from '../../base/interfaces/ICrudTypeMap';

export class CostCenterTypeMap implements CrudTypeMap {
  aggregate: Prisma.CostCenterAggregateArgs;
  count: Prisma.CostCenterCountArgs;
  create: Prisma.CostCenterCreateInput;
  createUnchecked: Prisma.CostCenterUncheckedCreateInput;
  delete: Prisma.CostCenterDeleteArgs;
  deleteMany: Prisma.CostCenterDeleteManyArgs;
  findFirst: Prisma.CostCenterFindFirstArgs;
  findMany: Prisma.CostCenterFindManyArgs;
  findUnique: Prisma.CostCenterFindUniqueArgs;
  update: Prisma.CostCenterUpdateInput;
  updateMany: Prisma.CostCenterUpdateManyArgs;
  upsert: Prisma.CostCenterUpsertArgs;
  where: Prisma.CostCenterWhereInput;
  select: Prisma.CostCenterSelect;
  orderBy: Prisma.CostCenterOrderByWithRelationInput;
}
