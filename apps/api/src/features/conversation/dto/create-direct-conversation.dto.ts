import { IsNotEmpty, IsString } from 'class-validator';

export class CreateDirectConversationDto {
  @IsString()
  @IsNotEmpty()
  partnerUserId: string;
}
