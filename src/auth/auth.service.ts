import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { RegisterDto, LoginDto } from './dtos/auth.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { responseSuccess, responseError } from '../utils/response.utils';
import type { RegisterType } from '../auth/types/auth.type';
interface IResponse {
  EM: string;
  EC: number;
  DT: any;
}
@Injectable()
export class AuthService {
  constructor(
    private prismaService: PrismaService,
    private jwtService: JwtService,
  ) {}
  async register(dataUser: RegisterDto): Promise<IResponse> {
    try {
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
      const res: RegisterType = await this.prismaService.user.create({
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

      return responseSuccess('created user successfully!', 0, res);
    } catch (error: unknown) {
      console.log(error);
      return responseError('Internal server error', -500);
    }
  }
  async login(dataLogin: LoginDto): Promise<IResponse> {
    try {
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
      return responseSuccess('Login user successfully!', 0, {
        access_token: accessToken,
        reset_token: resetToken,
        data: payload,
      });
    } catch (error: unknown) {
      console.log(error);
      return responseError('Internal server error', -500);
    }
  }
}
