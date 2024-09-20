import { PrismaClient, StatusEnum } from '@prisma/client';

/**
 * Reverts Source to their initial state by updating their data in the database.
 *
 * @param {PrismaClient} prisma - The PrismaClient instance.
 * @param {string} module_lcId - The id of the Source to revert.
 */
export const revertSourceToInitialState = async (
  prisma: PrismaClient,
  module_lcId: string,
) => {
  await prisma.source.update({
    where: { id: module_lcId },
    data: { deletedAt: null, status: StatusEnum.ACTIVE, version: 1 },
  });
};
