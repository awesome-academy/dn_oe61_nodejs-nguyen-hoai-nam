import { ArgumentsHost, Catch, ExceptionFilter, HttpException } from "@nestjs/common";
import { StatusCodes } from "../constants/status_code.constant";

@Catch()
export class allExceptionFilter implements ExceptionFilter {
    catch(exception: any, host: ArgumentsHost) {

        const ctx = host.switchToHttp();
        const request = ctx.getRequest();
        const response = ctx.getResponse();

        const status =
            exception instanceof HttpException
                ? exception.getStatus() : StatusCodes.ERROR;

        const message =
            exception instanceof HttpException
                ? exception.getResponse() : 'Internal server error';

        response.status(status).json({
            success: false,
            code: status,
            message: typeof message === 'string' ? message : (message as any).message,
            timestamp: new Date().toISOString(),
            path: request.url,
        })
    }
}
