import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { BlacklistService } from '../api/auth/black_list.service';
import { I18nUtils } from 'src/helper/utils/i18n-utils';
import { LanguageRequest } from 'src/helper/constants/lang.constant';

@Injectable()
export class JwtBlacklistGuard implements CanActivate {
    constructor(
        private readonly blacklistService: BlacklistService,
        private readonly i18nUtils: I18nUtils
    ) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const lang = LanguageRequest();

        let token: string | undefined;
        const authHeader = request.headers?.authorization || request.headers?.Authorization;
        if (authHeader && typeof authHeader === 'string' && authHeader.startsWith('Bearer ')) {
            token = authHeader.substring(7);
        }

        if (!token && request.query?.token) {
            token = request.query.token as string;
        }

        if (token) {
            const isBlacklisted = await this.blacklistService.isBlacklisted(token, lang);
            if (isBlacklisted) {
                throw new UnauthorizedException(this.i18nUtils.translate('validation.auth.token_invalid', {}, lang));
            }
        }

        return true;
    }
}
