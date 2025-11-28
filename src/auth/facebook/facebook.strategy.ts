import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Profile, Strategy } from 'passport-facebook';
import { VerifyCallback } from 'passport-google-oauth20';

@Injectable()
export class FacebookStrategy extends PassportStrategy(Strategy, 'facebook') {
  constructor() {
    super({
      clientID: process.env.FACEBOOK_APP_ID!,
      clientSecret: process.env.FACEBOOK_APP_SECRET!,
      callbackURL: process.env.FACEBOOK_CALLBACK_URL!,
      //   scope: ['email'],
      profileFields: ['emails', 'name', 'photos'],
    });
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  async validate(
    accessToken: string,
    refreshToken: string,
    profile: Profile,
    done: VerifyCallback,
  ): Promise<any> {
    const { name, emails, photos } = profile;
    const user = {
      email: emails?.[0]?.value || null,
      firstName: name?.givenName || null,
      lastName: name?.familyName || null,
      picture: photos?.[0]?.value || null,
      accessToken,
    };
    done(null, user);
  }
}
