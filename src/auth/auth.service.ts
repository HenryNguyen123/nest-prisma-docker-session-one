import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { RegisterDto, LoginDto } from './dtos/auth.dto';
// import { User } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private prismaService: PrismaService,
    private jwtService: JwtService,
  ) {}
  async register(dataUser: RegisterDto): Promise<any> {
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
  async login(dataLogin: LoginDto): Promise<any> {
    // check user
    const user = await this.prismaService.user.findUnique({
      where: { userName: dataLogin.userName },
    });
    if (!user) {
      throw new HttpException(
        { message: 'Accout is not exist' },
        HttpStatus.UNAUTHORIZED,
      );
    }
    //check pass
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    const verify: boolean = await bcrypt.compare(
      dataLogin.password,
      user.password,
    );
    if (!verify) {
      throw new HttpException(
        { message: 'password doese not correct' },
        HttpStatus.UNAUTHORIZED,
      );
    }
    // generate access-token and refresh token
    const payload = {
      userName: user.userName,
      firstName: user.firstName,
      lastName: user.lastName,
      avatar: user.avatar,
      age: user.age,
    };
    const accessToken = await this.jwtService.signAsync(payload, {
      secret: process.env.JWT_SECRET_KEY,
      expiresIn: '1h',
    });
    const resetToken = await this.jwtService.signAsync(payload, {
      secret: process.env.JWT_SECRET_KEY_RESET,
      expiresIn: '7d',
    });
    return {
      accessToken,
      resetToken,
    };
  }
}
