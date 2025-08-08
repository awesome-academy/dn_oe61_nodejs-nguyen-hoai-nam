import { applyDecorators, Body } from "@nestjs/common";
import { ApiBody, ApiOperation, ApiParam, ApiResponse } from "@nestjs/swagger";
import { ErrorResponseDto } from "src/validation/api_document/error/error.validation";
import { ServerErrorResponseDto } from "src/validation/api_document/error/server_error.validation";
import { SearchCourseSuccessResponseDto } from "src/validation/api_document/user_course/success_search_course";
import { SearchCourseDto } from "src/validation/class_validation/user_course.validation";

export function ApiResponseSearchCourses() {
    return applyDecorators(
        ApiOperation({
            summary: "Tìm kiếm khoá học theo tên",
            description: "Cho phép người dùng tìm kiếm khoá học theo tên"
        }),

        ApiBody({
            description: 'Dữ liệu tìm kiếm khoá học (theo tên)',
            type: SearchCourseDto,
        }),

        ApiResponse({
            status: 200,
            description: 'Thành công',
            type: SearchCourseSuccessResponseDto
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
