import { IsNotEmpty, IsString, MinLength, MaxLength } from 'class-validator';

export class LoginDto {
  @IsNotEmpty({ message: 'Username should not be empty' })
  @IsString()
  @MinLength(3)
  @MaxLength(20)
  userName: string;

  @IsNotEmpty({ message: 'Password should not be empty' })
  @IsString()
  @MinLength(6)
  @MaxLength(20)
  password: string;
}
