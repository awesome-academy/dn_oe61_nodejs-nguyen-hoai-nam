import { ArgumentsHost, Catch, ExceptionFilter, HttpException } from "@nestjs/common";
import { StatusCodes } from "../constants/status_code.constant";

@Catch(HttpException)
export class AllExceptionFilter implements ExceptionFilter {
    catch(exception: any, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const request = ctx.getRequest();
        const response = ctx.getResponse();

        const status =
            exception instanceof HttpException
                ? exception.getStatus()
                : StatusCodes.ERROR;

        const responseData =
            exception instanceof HttpException
                ? exception.getResponse()
                : 'Internal server error';

        let errorMessage: string;

        if (typeof responseData === 'string') {
            errorMessage = responseData;
        } else if (typeof responseData === 'object' && responseData !== null) {
            errorMessage =
                (responseData as any).message ||
                (responseData as any).error ||
                'Internal server error';
        } else {
            errorMessage = 'Internal server error';
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
