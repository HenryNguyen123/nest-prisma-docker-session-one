import { HttpException, HttpStatus } from '@nestjs/common';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';

interface SignJwtType {
  payload: object;
  secret: string;
  expiresIn: JwtSignOptions['expiresIn'];
}
const jwt = new JwtService();
export const signJWT = async (data: SignJwtType) => {
  try {
    const token = await jwt.signAsync(data.payload, {
      secret: data.secret,
      expiresIn: data.expiresIn ?? 900,
    });
    return token;
  } catch (error: unknown) {
    console.log(error);
    throw new HttpException(
      { message: 'verify password error' },
      HttpStatus.UNAUTHORIZED,
    );
  }
};

export const verifyJWT = async (token: string, key: string) => {
  try {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return await jwt.verifyAsync(token, {
      secret: key,
    });
  } catch (error: unknown) {
    console.log(error);
    return false;
  }
};
