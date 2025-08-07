import { applyDecorators } from "@nestjs/common";
import { ApiOperation, ApiParam, ApiResponse } from "@nestjs/swagger";
import { ErrorResponseDto } from "src/validation/api_document/error/error.validation";
import { ServerErrorResponseDto } from "src/validation/api_document/error/server_error.validation";
import { getCourseActiveSuccessResponseDto } from "src/validation/api_document/user_course/success_user_course";

export function ApiResponseGetActiveCourse() {
    return applyDecorators(
        ApiOperation({
            summary: "Xem khóa học đang tham gia của học viên (View Active Course)",
            description: "Cho phép người dùng xem được thông tin chi tiết khoá học đang hoạt động của mình."
        }),

        ApiParam({
            name: 'traineeId',
            description: "Nhập id người dùng",
            type: Number,
            example: 14,
            required: true
        }),

        ApiResponse({
            status: 200,
            description: 'Thành công',
            type: getCourseActiveSuccessResponseDto
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
