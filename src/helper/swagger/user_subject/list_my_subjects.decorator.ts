import { applyDecorators } from "@nestjs/common";
import { ApiOperation, ApiResponse } from "@nestjs/swagger";
import { ErrorResponseDto } from "src/validation/api_document/error/error.validation";
import { ServerErrorResponseDto } from "src/validation/api_document/error/server_error.validation";
import { ListMySubjectSuccessDto } from "src/validation/api_document/user_subject/list_my_subjects";

export function ApiResponseListMySubjects() {
    return applyDecorators(
        ApiOperation({
            summary: "Danh sách môn học của tôi",
            description: "Cho phép người dùng xem danh sách môn học thuộc khoá học đang học"
        }),

        ApiResponse({
            status: 200,
            description: 'Thành công',
            type: ListMySubjectSuccessDto
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
