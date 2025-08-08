import { applyDecorators } from "@nestjs/common";
import { ApiOperation, ApiParam, ApiResponse } from "@nestjs/swagger";
import { ErrorResponseDto } from "src/validation/api_document/error/error.validation";
import { ServerErrorResponseDto } from "src/validation/api_document/error/server_error.validation";
import { CompleteTaskSuccessDto } from "src/validation/api_document/user_task/success_user_task";

export function ApiResponseCompleteTask() {
    return applyDecorators(
        ApiOperation({
            summary: "Báo cáo hoàn thành 1 nhiệm vụ",
            description: "Báo cáo khi người dùng hoàn thành 1 nhiệm vụ (Hoàn thành 1 nhiệm vụ trong bài học), Khi hoàn thành tất cả các nhiệm vụ thì khoá học đó sẽ tự đồng hoàn thành,"
        }),

        ApiParam({
            name: 'taskId',
            description: "Nhập id nhiệm vụ muốn hoàn thành",
            type: Number,
            example: 4,
            required: true
        }),

        ApiResponse({
            status: 200,
            description: 'Thành công',
            type: CompleteTaskSuccessDto
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
