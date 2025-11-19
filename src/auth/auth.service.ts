import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { RegisterDto } from './dtos/auth.dto';
import { User } from '@prisma/client';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(private prismaService: PrismaService) {}
  async register(dataUser: RegisterDto): Promise<User> {
    //check user
    const user = await this.prismaService.user.findUnique({
      where: { email: dataUser.email },
    });
    if (user) {
      throw new HttpException(
        { message: 'this email has been used' },
        HttpStatus.BAD_REQUEST,
      );
    }
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    const salt = await bcrypt.genSalt(10);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    const hashPassword = await bcrypt.hash(dataUser.password, salt);

    // step3: create user
    const res = await this.prismaService.user.create({
      data: {
        email: dataUser.email,
        userName: dataUser.userName,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        password: hashPassword,
        phone: Number(dataUser.phone),
        firstName: dataUser.firstName ?? '',
        lastName: dataUser.lastName ?? '',
        avatar: dataUser.avatar,
        age: dataUser.age,
        dob: dataUser.dob ? new Date(dataUser.dob) : undefined,
        role: 'USER',
      },
    });

    return res;
  }
}
