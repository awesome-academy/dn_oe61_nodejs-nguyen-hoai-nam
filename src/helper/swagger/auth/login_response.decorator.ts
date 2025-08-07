import { applyDecorators } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { LoginSuccessResponseDto } from 'src/validation/api_document/auth/login/success_response.validation';
import { ErrorResponseDto } from 'src/validation/api_document/error/error.validation';
import { ServerErrorResponseDto } from 'src/validation/api_document/error/server_error.validation';
import { AuthDto } from 'src/validation/auth_validation/auth.validation';

export function ApiResponseLogin() {
    return applyDecorators(
        ApiOperation({
            summary: 'Đăng nhập người dùng',
            description: 'Xác thực người dùng bằng email và mật khẩu để nhận access token',
        }),

        ApiBody({
            type: AuthDto,
            description: 'Thông tin đăng nhập của người dùng',
            examples: {
                example1: {
                    summary: 'Ví dụ đăng nhập với tài khoản',
                    value: {
                        email: 'trainee1@gmail.com',
                        password: 'Namnam16@',
                    },
                },
            },
        }),

        ApiResponse({
            status: 200,
            description: 'Đăng nhập thành công',
            type: LoginSuccessResponseDto,
        }),

        ApiResponse({
            status: 400,
            description:
                'Lỗi xác thực. Các lỗi khác cũng trả về định dạng giống, chỉ thay đổi `status`, `message`, `code`, `path`',
            type: ErrorResponseDto
        }),

        ApiResponse({
            status: 500,
            description: 'Lỗi hệ thống, có thể do server hoặc cơ sở dữ liệu',
            type: ServerErrorResponseDto,
        }),
    );
}
