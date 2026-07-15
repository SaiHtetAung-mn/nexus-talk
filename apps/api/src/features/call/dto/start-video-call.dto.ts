import { IsNotEmpty, IsString } from 'class-validator';

export class StartVideoCallDto {
  @IsString()
  @IsNotEmpty()
  conversationId: string;
}
