import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
} from "@nestjs/common";
import { StatusCodes } from "../constants/status_code.constant";
import { LanguageRequest } from "../constants/lang.constant";
import { I18nUtils } from "../utils/i18n-utils";

@Catch(HttpException)
export class AllExceptionFilter implements ExceptionFilter {
  constructor(private readonly i18n: I18nUtils) {}

  private resolveMessage(responseData: any, lang: string): string {
    if (typeof responseData === 'string') {
      return this.i18n.translate(responseData, {}, lang);
    }

    if (responseData && typeof responseData === 'object') {
      let rawMessage =
        (responseData as any).message ||
        (responseData as any).error ||
        'validation.server.internal_server_error';

      if (Array.isArray(rawMessage)) {
        return rawMessage[0];
      }

      if (typeof rawMessage === 'string') {
        return this.i18n.translate(rawMessage, {}, lang);
      }
    }

    return this.i18n.translate('validation.server.internal_server_error', {}, lang);
  }

  async catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest();
    const response = ctx.getResponse();
    const lang = LanguageRequest();

    const status = exception instanceof HttpException
      ? exception.getStatus()
      : StatusCodes.ERROR;

    const responseData = exception instanceof HttpException
      ? exception.getResponse()
      : 'validation.server.internal_server_error';

    const errorMessage = this.resolveMessage(responseData, lang);

    response.status(status).json({
      success: false,
      code: status,
      message: errorMessage,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
