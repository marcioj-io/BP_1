import { Module } from '@nestjs/common';

import { PrismaModule } from '../../database/prisma/prisma.module';
import { PackageController } from './package.controller';
import { PackageMapping } from './package.mapping';
import { PackageRepository } from './package.repository';
import { PackageService } from './package.service';

@Module({
  controllers: [PackageController],
  providers: [PackageService, PackageMapping, PackageRepository],
  imports: [PrismaModule],
  exports: [PackageService, PackageRepository],
})
export class PackageModule {}
