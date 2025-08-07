import { applyDecorators } from "@nestjs/common";
import { ApiOperation, ApiParam, ApiResponse } from "@nestjs/swagger";
import { ErrorResponseDto } from "src/validation/api_document/error/error.validation";
import { ServerErrorResponseDto } from "src/validation/api_document/error/server_error.validation";
import { registerToCourseSuccessResponseDto } from "src/validation/api_document/user_course/success_user_course";

export function ApiResponseRegisterToCourse() {
    return applyDecorators(
        ApiOperation({
            summary: "Học viên gia nhập khóa học (Trainee joins Course)",
            description: `* Điều kiện để đăng ký khoá học: \n
            - Người dùng chưa đăng ký khoá học đang chọn. \n
            - Chưa đăng ký khoá học nào đã bắt đầu ( Mỗi người dùng chỉ được tham gia vào 1 khoá học đã bắt đầu).\n
            - Khi người dùng đăng ký thành công vào khoá học được chọn, hệ thống sẽ tạo mới 1 bản ghi vào bảng user_course với trạng thái đăng ký.\n
            - Đồng thời sẽ nhận được email đăng ký thành công khoá học.`
        }),

        ApiParam({
            name: 'courseId',
            description: "Nhập id khoá học muốn đăng ký",
            type: Number,
            example: 14,
            required: true
        }),

        ApiResponse({
            status: 200,
            description: 'Thành công',
            type: registerToCourseSuccessResponseDto
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
