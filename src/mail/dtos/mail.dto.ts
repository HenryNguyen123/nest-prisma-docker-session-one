import { IsEmail, IsNotEmpty } from 'class-validator';

export class ForgetDto {
  @IsNotEmpty({ message: 'Email should not be empty' })
  @IsEmail({}, { message: 'Invalid email address' })
  mail: string;
}
