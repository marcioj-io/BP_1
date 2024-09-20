import { AutoMap } from '@automapper/classes';
import { ApiProperty } from '@nestjs/swagger';
import { Client, Package, Prisma } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';
import { BaseEntity } from 'src/modules/base/base.entity';

class AddressDto {
  @ApiProperty({ example: 'SP', description: 'State' })
  @AutoMap()
  state: string;

  @ApiProperty({ example: 'Sao Paulo', description: 'City' })
  @AutoMap()
  city: string;

  @ApiProperty({ example: 'Santana', description: 'Neighborhood' })
  @AutoMap()
  neighborhood: string;

  @ApiProperty({ example: 'R. Anibal Benevolo', description: 'Street' })
  @AutoMap()
  street: string;

  @ApiProperty({ example: '94', description: 'Number' })
  @AutoMap()
  number: string;

  @ApiProperty({ example: '2 Andar', description: 'Complement' })
  @AutoMap()
  complement: string;

  @ApiProperty({ example: '02016040', description: 'Zip Code' })
  @AutoMap()
  zipCode: string;
}
class ObservationDto {
  @ApiProperty({ example: 'Lorem ipsum', description: 'Observation' })
  @AutoMap()
  observation: string;
}
export class ClientEntity extends BaseEntity implements Client {
  @ApiProperty({ example: 'Legal Name', description: 'Legal Name' })
  @AutoMap()
  name: string;

  blocked: boolean;
  ip: string;
  id: string;

  @ApiProperty({ example: 'dsada321djksaj', description: 'Primary Address' })
  @AutoMap()
  primaryAddressId: string;

  @ApiProperty({ example: 'dsada321djksaj', description: 'Billing Address' })
  @AutoMap()
  billingAddressId: string;

  @ApiProperty({ example: 'Legal Name', description: 'Legal Name' })
  @AutoMap()
  legalName: string;

  @ApiProperty({ example: '10000000101', description: 'CNPJ' })
  @AutoMap()
  cnpj: string;

  @ApiProperty({ example: '123', description: 'State Registration' })
  @AutoMap()
  stateRegistration: string;

  @ApiProperty({ example: '123', description: 'Municipal Registration' })
  @AutoMap()
  municipalRegistration: string;

  @ApiProperty({ example: '5511999999999', description: 'Contact Phone' })
  @AutoMap()
  contactPhone: string;

  @ApiProperty({ example: 'user@mail.com', description: 'Contact Email' })
  @AutoMap()
  contactEmail: string;

  @ApiProperty({ example: 'Rafael', description: 'Primary Contact Person' })
  @AutoMap()
  primaryContactPerson: string;

  @ApiProperty({
    example: 'Diretor',
    description: 'Primary Contact Person Title',
  })
  @AutoMap()
  primaryContactPersonTitle: string;

  @ApiProperty({ example: true, description: 'Use Tax Invoice' })
  @AutoMap()
  useTaxInvoice: boolean;

  @ApiProperty({ example: 'Lorem ipsum', description: 'General Note' })
  @AutoMap()
  generalNote: string;

  @ApiProperty({ example: 30, description: 'Billing Cycle Day' })
  @AutoMap()
  billingCycleDay: number;

  @ApiProperty({ example: 0.05, description: 'Discount' })
  @AutoMap()
  discount: Prisma.Decimal;

  @ApiProperty({ type: AddressDto, description: 'Primary Address' })
  @AutoMap(() => AddressDto)
  primaryAddress?: AddressDto;

  @ApiProperty({ type: AddressDto, description: 'Billing Address' })
  @AutoMap(() => AddressDto)
  billingAddress?: AddressDto;

  @ApiProperty({ type: [ObservationDto], description: 'Observations' })
  @AutoMap(() => ObservationDto)
  observations?: ObservationDto[];

  @ApiProperty({ type: [String], description: 'Packages' })
  @AutoMap()
  packages?: Package[];

  @ApiProperty({ example: 1, description: 'Version' })
  @AutoMap()
  version: number;
}
