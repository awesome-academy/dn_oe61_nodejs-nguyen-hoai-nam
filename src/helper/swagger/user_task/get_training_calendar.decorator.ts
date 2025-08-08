import { applyDecorators } from "@nestjs/common";
import { ApiOperation, ApiResponse } from "@nestjs/swagger";
import { ErrorResponseDto } from "src/validation/api_document/error/error.validation";
import { ServerErrorResponseDto } from "src/validation/api_document/error/server_error.validation";
import { GetTrainingCalendarSuccessDto } from "src/validation/api_document/user_task/success_user_task";

export function ApiResponseGetTraingCelendar() {
    return applyDecorators(
        ApiOperation({
            summary: "Tạo lịch học tự động cho người dùng cho từng task",
            description: "Tạo lịch học cho trainee bằng cách lập lịch động cho từng task dựa vào startedAt và finishedAt trong bảng user_subject và studyDuration trong bảng subject"
        }),

        ApiResponse({
            status: 200,
            description: 'Thành công',
            type: GetTrainingCalendarSuccessDto
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
