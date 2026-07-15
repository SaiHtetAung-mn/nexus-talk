import { IsOptional, IsString, MaxLength } from 'class-validator';

export class DiscoverUsersDto {
  @IsOptional()
  @IsString()
  @MaxLength(80)
  q?: string;
}
