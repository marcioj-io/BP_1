import { Transform } from 'class-transformer';
import { IsIn } from 'class-validator';

export enum ActionEnum {
  ACTIVATE = 'activate',
  DEACTIVATE = 'deactivate',
}

export class ActionDto {
  @Transform(({ value }) => value.toLowerCase())
  @IsIn([ActionEnum.ACTIVATE, ActionEnum.DEACTIVATE])
  action: ActionEnum;
}
