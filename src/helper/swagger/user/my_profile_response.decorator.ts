import { applyDecorators } from "@nestjs/common";
import { ApiOperation, ApiResponse } from "@nestjs/swagger";
import { ErrorResponseDto } from "src/validation/api_document/error/error.validation";
import { ServerErrorResponseDto } from "src/validation/api_document/error/server_error.validation";
import { MyProfileSuccessResponseDto } from "src/validation/api_document/user/success_my_profile";

export function ApiResponseMyProfile() {
    return applyDecorators(
        ApiOperation({
            summary: "Xem hồ sơ thông tin cá nhân của mình",
            description: 'Cho phép người dùng xem hồ sơ của mình nhằm phục vụ các thao tác với thông tin mà người dùng muốn'
        }),

        ApiResponse({
            status: 200,
            description: 'Lấy thông tin người dùng thành công',
            type: MyProfileSuccessResponseDto
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
