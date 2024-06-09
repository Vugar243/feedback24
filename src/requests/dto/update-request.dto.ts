import { IsOptional, IsString } from 'class-validator';

export class UpdateRequestDto {
  @IsOptional()
  @IsString()
  status: 'Active' | 'Resolved';

  @IsOptional()
  @IsString()
  comment: string;
}
