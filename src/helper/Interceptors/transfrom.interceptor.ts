import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from "@nestjs/common";
import { map, Observable } from "rxjs";
import { StatusCodes } from "../constants/status_code.constant";
import { ApiResponse } from "../interface/api.interface";
import { LanguageRequest } from "../constants/lang.constant";
import { I18nUtils } from "../utils/i18n-utils";

@Injectable()
export class TransformResponse<T> implements NestInterceptor<T, ApiResponse<T>> {
  constructor(private readonly i18n: I18nUtils) {}

  intercept(context: ExecutionContext, next: CallHandler<T>): Observable<ApiResponse<T>> {
    const lang = LanguageRequest();
    return next.handle().pipe(
      map((originalData): ApiResponse => {
        if (
          originalData &&
          typeof originalData === 'object' &&
          'success' in originalData
        ) {
          return originalData as ApiResponse;
        }

        return {
          code: StatusCodes.SUCCESS,
          success: true,
          message: this.i18n.translate('validation.response_api.success', {}, lang),
          data: originalData,
        };
      })
    );
  }
}

