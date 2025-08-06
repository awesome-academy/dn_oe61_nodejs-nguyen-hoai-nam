import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { MeSuccessResponseDto } from 'src/validation/api_document/auth/me/success_response.validation';
import { ErrorResponseDto } from 'src/validation/api_document/error/error.validation';

export function ApiResponseMe() {
    return applyDecorators(
        ApiOperation({
            summary: 'Thông tin người dùng sau khi đăng nhập thành công',
            description: 'Cho phép lấy thông tin đăng nhập khi người dùng đăng nhập thành công nhằm hiển thị thông tin phục vụ cho mục đích UX/UI',
        }),

        ApiResponse({
            status: 200,
            description: 'Thành công',
            type: MeSuccessResponseDto,
        }),

        ApiResponse({
            status: 404,
            description:
                'Lỗi xác thực. Các lỗi khác cũng trả về định dạng giống, chỉ thay đổi `status`, `message`, `code`, `path`',
            type: ErrorResponseDto,
        }),
    );
}
