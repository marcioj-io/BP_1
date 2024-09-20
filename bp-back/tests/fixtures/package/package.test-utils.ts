import { PrismaClient, StatusEnum } from '@prisma/client';

/**
 * Reverts Package to their initial state by updating their data in the database.
 *
 * @param {PrismaClient} prisma - The PrismaClient instance.
 * @param {string} module_lcId - The id of the Package to revert.
 */
export const revertPackageToInitialState = async (
  prisma: PrismaClient,
  module_lcId: string,
) => {
  await prisma.package.update({
    where: { id: module_lcId },
    data: { deletedAt: null, status: StatusEnum.ACTIVE, version: 1 },
  });
};
