import { IsNotEmpty } from 'class-validator';

export class GoogleOAuthDto {
  @IsNotEmpty()
  idToken: string;
}
