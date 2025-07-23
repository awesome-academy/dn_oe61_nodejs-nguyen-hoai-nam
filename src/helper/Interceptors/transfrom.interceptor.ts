import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from "@nestjs/common";
import { map, Observable } from "rxjs";
import { StatusCodes } from "../constants/status_code.constant";
import { ApiResponse } from "../interface/api.interface";

@Injectable()
export class TransfromResponse<T> implements NestInterceptor<T, any> {
    intercept(contetx: ExecutionContext, next: CallHandler<T>): Observable<any> {
        return next.handle().pipe(
            map((data):ApiResponse => ({
                code: (data as any)?.code || StatusCodes.SUCCESS,
                success: true,
                message: (data as any)?.message || 'Success',
                data: (data as any)?.data ?? data
            }))
        );
    }
}
