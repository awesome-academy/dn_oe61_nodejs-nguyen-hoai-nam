import { ArgumentsHost, Catch, ExceptionFilter, HttpException, Inject } from "@nestjs/common";
import { StatusCodes } from "../constants/status_code.constant";
import { langConstant, LanguageRequest } from "../constants/lang.constant";
import { I18nUtils } from "../utils/i18n-utils";
import { asyncLocalStorage } from "src/middleware/language.middleware";

@Catch(HttpException)
export class AllExceptionFilter implements ExceptionFilter {
  constructor(private readonly i18n: I18nUtils) { }

  async catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest();
    const response = ctx.getResponse();
    const lang = LanguageRequest()
    
    const status = exception instanceof HttpException
      ? exception.getStatus()
      : StatusCodes.ERROR;

    const responseData = exception instanceof HttpException
      ? exception.getResponse()
      : this.i18n.translate('server.internal_server_error', {}, lang);

    let errorMessage: string;

    if (typeof responseData === 'string') {
      errorMessage = responseData;
    } else if (typeof responseData === 'object' && responseData !== null) {
      const rawMessage =
        (responseData as any).message ||
        (responseData as any).error ||
        'server.internal_server_error';
      errorMessage = this.i18n.translate(rawMessage, {}, lang);
    } else {
      errorMessage = this.i18n.translate('server.internal_server_error', {}, lang);
    }

    response.status(status).json({
      success: false,
      code: status,
      message: errorMessage,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
