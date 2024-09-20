import { PrismaClient, StatusEnum } from '@prisma/client';

/**
 * Reverts Client to their initial state by updating their data in the database.
 *
 * @param {PrismaClient} prisma - The PrismaClient instance.
 * @param {string} module_lcId - The id of the Client to revert.
 */
export const revertClientToInitialState = async (
  prisma: PrismaClient,
  module_lcId: string,
) => {
  await prisma.client.update({
    where: { id: module_lcId },
    data: { deletedAt: null, status: StatusEnum.ACTIVE, version: 1 },
  });
};
