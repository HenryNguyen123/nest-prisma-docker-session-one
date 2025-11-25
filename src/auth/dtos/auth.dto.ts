import {
  IsEmail,
  IsNotEmpty,
  IsString,
  Matches,
  MinLength,
  MaxLength,
  IsOptional,
  IsNumber,
} from 'class-validator';
import { Type } from 'class-transformer';

export class RegisterDto {
  @IsNotEmpty({ message: 'Email should not be empty' })
  @IsEmail({}, { message: 'Invalid email address' })
  email: string;

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

  @IsNotEmpty({ message: 'Phone number should not be empty' })
  @Matches(/^\d{10,15}$/, { message: 'Invalid phone number' })
  phone: string;

  @IsOptional()
  @IsString()
  firstName?: string;

  @IsOptional()
  @IsString()
  lastName?: string;

  @IsOptional()
  @IsString()
  avatar?: string;

  @IsOptional()
  @IsNumber()
  age?: number;

  @IsOptional()
  @Type(() => Date)
  dob?: Date;
}

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

export class ForgetDto {
  @IsNotEmpty({ message: 'Email should not be empty' })
  @IsEmail({}, { message: 'Invalid email address' })
  email: string;
}
