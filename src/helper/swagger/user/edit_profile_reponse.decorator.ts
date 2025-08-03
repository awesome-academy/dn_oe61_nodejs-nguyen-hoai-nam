import { applyDecorators } from "@nestjs/common";
import { ApiBody, ApiOperation, ApiResponse } from "@nestjs/swagger";
import { ErrorResponseDto } from "src/validation/api_document/error/error.validation";
import { ServerErrorResponseDto } from "src/validation/api_document/error/server_error.validation";
import { EditProfileResponseDto } from "src/validation/api_document/user/success_edit_profile";
import { UpdateUserDto } from "src/validation/class_validation/user.validation";

export function ApiResponseEditProfile() {
    return applyDecorators(
        ApiOperation({
            summary: "Chỉnh sửa hồ sơ thông tin cá nhân của mình",
            description: 'Cho phép người dùng chỉnh sửa hồ sơ của mình để cập nhật thông tin mới'
        }),

        ApiBody({
            type: UpdateUserDto,
            description: 'Nhập các thông tin mà người dùng muốn cập nhật ( Không bắt buộc nhập đẩy đủ các trường )',
            examples: {
                example1: {
                    summary: 'Ví dụ cập nhật người dùng cho userName và email',
                    value: {
                        userName: "trainee1 nè bạn",
                        email: "trainee1@gmail.com"
                    },
                    
                },
                example2: {
                    summary: 'Ví dụ cập nhật người dùng cho userName',
                    value: {
                        userName: "trainee1 nè bạn",
                    },
                    
                },
            },
        }),

        ApiResponse({
            status: 200,
            description: 'Cập nhật thành công',
            type: EditProfileResponseDto
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
    )
}
