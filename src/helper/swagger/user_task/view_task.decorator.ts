import { applyDecorators } from "@nestjs/common";
import { ApiOperation, ApiResponse } from "@nestjs/swagger";
import { ErrorResponseDto } from "src/validation/api_document/error/error.validation";
import { ServerErrorResponseDto } from "src/validation/api_document/error/server_error.validation";
import { ViewTaskSuccessDto } from "src/validation/api_document/user_task/success_user_task";

export function ApiResponseViewTask() {
    return applyDecorators(
        ApiOperation({
            summary: "Xem thông tin bài học",
            description: "Cho phép người dùng xem thông tin chi tiết bài học đã chọn"
        }),

        ApiResponse({
            status: 200,
            description: 'Thành công',
            type: ViewTaskSuccessDto
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
