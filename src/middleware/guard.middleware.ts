import { CanActivate, ExecutionContext, Inject, Injectable, Request, UnauthorizedException } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { JwtService } from "@nestjs/jwt";
import { JWT_SECRET } from "src/helper/constants/jwt_token.constant";
import { LanguageRequest } from "src/helper/constants/lang.constant";
import { IS_PUBLIC_KEY } from "src/helper/decorators/metadata.decorator";
import { I18nUtils } from "src/helper/utils/i18n-utils";


export interface RequestWithCookies {
    cookies?: Record<string, string>;
    headers?: Record<string, string>;
    [key: string]: any;
}

@Injectable()
export class AuthGuard implements CanActivate {
    constructor(
        private readonly reflector: Reflector,
        private readonly jwtToken: JwtService,
        private readonly I18nUtils: I18nUtils
    ) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);

        if (isPublic) return true;

        const request = context.switchToHttp().getRequest<RequestWithCookies>();
        const token = this.checkTokenFromHeader(request);
        const lang = LanguageRequest();

        if (!token) {
            throw new UnauthorizedException(this.I18nUtils.translate('validation.auth.token_missing', {}, lang));
        }

        try {
            const payLoad = await this.jwtToken.verifyAsync(token, { secret: JWT_SECRET });
            request.user = payLoad;
        } catch {
            throw new UnauthorizedException(this.I18nUtils.translate('validation.auth.token_invalid', {}, lang));
        }

        return true
    }

    private checkTokenFromHeader(request: RequestWithCookies): string | undefined {
        const authHeader = request.cookies?.['token'];

        if (!authHeader || typeof authHeader !== 'string') {
            return undefined;
        }
        return authHeader
    }
}

