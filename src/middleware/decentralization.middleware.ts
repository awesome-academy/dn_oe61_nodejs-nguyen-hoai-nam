import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { Observable } from "rxjs";
import { Role } from "src/database/dto/user.dto";
import { LanguageRequest } from "src/helper/constants/lang.constant";
import { ROLE_KEY } from "src/helper/decorators/metadata.decorator";
import { I18nUtils } from "src/helper/utils/i18n-utils";

@Injectable()
export class RolesGuard implements CanActivate {
    constructor(
        private readonly reflector: Reflector,
        private readonly i18nUtils: I18nUtils
    ) { }

    canActivate(context: ExecutionContext): boolean {
        const requireRoles: Role[] | undefined = this.reflector.getAllAndOverride<Role[]>(ROLE_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);

        if (!requireRoles || requireRoles.length === 0) {
            return true;
        }

        const request = context.switchToHttp().getRequest();
        const requestRole: Role | null = request.user?.role ?? null;
        const lang = LanguageRequest();

        if (!requestRole || !Array.isArray(requireRoles) || !requireRoles.includes(requestRole)) {
            throw new ForbiddenException(this.i18nUtils.translate('validation.auth.access_denied', {}, lang))
        }

        return true;
    }
}
