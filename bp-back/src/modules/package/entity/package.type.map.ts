import { Prisma } from '@prisma/client';

import { CrudTypeMap } from '../../base/interfaces/ICrudTypeMap';

export class PackageTypeMap implements CrudTypeMap {
  aggregate: Prisma.PackageAggregateArgs;
  count: Prisma.PackageCountArgs;
  create: Prisma.PackageCreateInput;
  createUnchecked: Prisma.PackageUncheckedCreateInput;
  delete: Prisma.PackageDeleteArgs;
  deleteMany: Prisma.PackageDeleteManyArgs;
  findFirst: Prisma.PackageFindFirstArgs;
  findMany: Prisma.PackageFindManyArgs;
  findUnique: Prisma.PackageFindUniqueArgs;
  update: Prisma.PackageUpdateInput;
  updateMany: Prisma.PackageUpdateManyArgs;
  upsert: Prisma.PackageUpsertArgs;
  where: Prisma.PackageWhereInput;
  select: Prisma.PackageSelect;
  orderBy: Prisma.PackageOrderByWithRelationInput;
}
