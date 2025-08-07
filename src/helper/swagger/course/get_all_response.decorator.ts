import { applyDecorators } from "@nestjs/common";
import { ApiOperation, ApiResponse } from "@nestjs/swagger";
import { GetAllCourseSuccessResponseDto } from "src/validation/api_document/course/success_get_all";
import { ErrorResponseDto } from "src/validation/api_document/error/error.validation";
import { ServerErrorResponseDto } from "src/validation/api_document/error/server_error.validation";

export function ApiResponseGetAllCourse() {
    return applyDecorators(
        ApiOperation({
            summary: "Xem danh sách khoá học",
            description: 'Cho phép người dùng xem được danh sách khoá học mà mình đã đăng ký hoặc được người giám sát thêm vào.'
        }),

        ApiResponse({
            status: 200,
            description: 'Thành công',
            type: GetAllCourseSuccessResponseDto
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
