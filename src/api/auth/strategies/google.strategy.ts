import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { Strategy, StrategyOptions, VerifyCallback } from 'passport-google-oauth20';
import { ConfigService } from '@nestjs/config';
import { linkCallBack } from 'src/helper/constants/link.constant';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
    constructor(
        private readonly configService: ConfigService,
    ) {
        super({
            clientID: configService.get<string>('GOOGLE_CLIENT_ID'),
            clientSecret: configService.get<string>('GOOGLE_CLIENT_SECRET'),
            callbackURL: linkCallBack,
            scope: ['email', 'profile'],
        } as StrategyOptions);
    }

    async validate(accessToken: string, refreshToken: string, profile: any, done: VerifyCallback): Promise<any> {
        if (!profile) {
            return done(new UnauthorizedException('Google profile not found'), false);
          }
        
          const { name, emails } = profile;
          if (!emails || emails.length === 0) {
            return done(new UnauthorizedException('Google email not found'), false);
          }

        const user = {
            email: emails[0].value,
            userName: name.givenName + ' ' + name.familyName,
        };
        done(null, user);
    }
}
