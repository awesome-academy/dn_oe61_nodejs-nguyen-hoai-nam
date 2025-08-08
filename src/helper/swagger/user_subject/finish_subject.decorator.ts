import { applyDecorators } from "@nestjs/common";
import { ApiOperation, ApiParam, ApiResponse } from "@nestjs/swagger";
import { ErrorResponseDto } from "src/validation/api_document/error/error.validation";
import { ServerErrorResponseDto } from "src/validation/api_document/error/server_error.validation";
import { FinishSubjectSuccessDto } from "src/validation/api_document/user_subject/finish_subject_sccess";

export function ApiResponseFinishSubject() {
    return applyDecorators(
        ApiOperation({
            summary: "Hoàn thành 1 môn học đuộc chọn",
            description: "Cho phép người dùng hoàn thành môn học được chọn nếu tất cả nhiệm vụ trong bài học đó đã được hoàn thành"
        }),

        ApiParam({
            name: 'userSubjectId',
            description: 'Mã môn học',
            type: Number,
            example: '2',
            required: true
        }),

        ApiResponse({
            status: 200,
            description: 'Thành công',
            type: FinishSubjectSuccessDto
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
