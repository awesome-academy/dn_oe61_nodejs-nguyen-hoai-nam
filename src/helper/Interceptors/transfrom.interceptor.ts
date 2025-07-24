import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from "@nestjs/common";
import { map, Observable } from "rxjs";
import { StatusCodes } from "../constants/status_code.constant";
import { ApiResponse } from "../interface/api.interface";
import { LanguageRequest } from "../constants/lang.constant";
import { I18nUtils } from "../utils/i18n-utils";

@Injectable()
export class TransformResponse<T> implements NestInterceptor<T, any> {
    constructor(private readonly i18n: I18nUtils) {}

    intercept(context: ExecutionContext, next: CallHandler<T>): Observable<any> {
        const lang = LanguageRequest();
        return next.handle().pipe(
            map((data): ApiResponse => ({
                code: (data as ApiResponse)?.code || StatusCodes.SUCCESS,
                success: (data as ApiResponse)?.success || true,
                message: (data as ApiResponse)?.message || this.i18n.translate('validation.response_api.success',{},lang),
                data: (data as ApiResponse)?.data ?? undefined
            }))
        );
    }
}
