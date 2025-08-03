import { applyDecorators } from "@nestjs/common";
import { ApiOperation, ApiParam, ApiResponse } from "@nestjs/swagger";
import { GetByIdCourseSuccessResponseDto } from "src/validation/api_document/course/success_get_by_id";
import { ErrorResponseDto } from "src/validation/api_document/error/error.validation";
import { ServerErrorResponseDto } from "src/validation/api_document/error/server_error.validation";

export function ApiResponseGetByIdCourse() {
    return applyDecorators(
        ApiOperation({
            summary: "Xem chi tiết khoá học được chọn",
            description: 'Cho phép người dùng xem được chi tiết khoá học mà mình đã đăng ký hoặc được người giám sát thêm vào.'
        }),

        ApiParam({
            name: 'courseId',
            description: "Nhập id khoá học muốn xem",
            type: Number,
            example: 1,
            required: true
        }),

        ApiResponse({
            status: 200,
            description: 'Thành công',
            type: GetByIdCourseSuccessResponseDto
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
