import {
  IsNotEmpty,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

const usernameRegex = /^[a-zA-Z0-9_]{3,16}$/;

export class UpdateProfileDto {
  @IsString()
  @MinLength(2)
  @MaxLength(80)
  name: string;

  @IsNotEmpty()
  @Matches(usernameRegex, {
    message:
      'Username must be 3-16 characters. Letters, numbers, underscores only.',
  })
  username: string;
}
