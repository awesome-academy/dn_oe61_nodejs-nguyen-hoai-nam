import { applyDecorators } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { RegisterSuccessResponseDto } from 'src/validation/api_document/auth/register/success_response.validation';
import { ErrorResponseDto } from 'src/validation/api_document/error/error.validation';
import { ServerErrorResponseDto } from 'src/validation/api_document/error/server_error.validation';
import { AuthDto } from 'src/validation/auth_validation/auth.validation';

export function ApiResponseRegister() {
    return applyDecorators(
        ApiOperation({
            summary: 'Đăng ký người dùng"',
            description: 'Cho phép đăng ký người dùng với các thông tin như email, name, password role là TRAINEE',
        }),

        ApiBody({
            type: AuthDto,
            description: 'Thông tin người dùng',
            examples: {
                example1: {
                    summary: 'Ví dụ đăng ký thông tin người dùng',
                    value: {
                        userName: 'trainee nè',
                        email: 'trainee123@gmail.com',
                        password: 'Namnam16@',
                    },
                },
            },
        }),

        ApiResponse({
            status: 200,
            description: 'Đăng ký thành công',
            type: RegisterSuccessResponseDto,
        }),

        ApiResponse({
            status: 400,
            description:
                'Lỗi xác thực. Các lỗi khác cũng trả về định dạng giống, chỉ thay đổi `status`, `message`, `code`, `path`',
            type: ErrorResponseDto,
        }),

        ApiResponse({
            status: 500,
            description: 'Lỗi hệ thống, có thể do server hoặc cơ sở dữ liệu',
            type: ServerErrorResponseDto,
        }),
    );
}
