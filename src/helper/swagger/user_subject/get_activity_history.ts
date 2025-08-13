import { applyDecorators } from "@nestjs/common";
import { ApiOperation, ApiResponse } from "@nestjs/swagger";
import { ErrorResponseDto } from "src/validation/api_document/error/error.validation";
import { ServerErrorResponseDto } from "src/validation/api_document/error/server_error.validation";
import { GetActivityHistorySuccessDto } from "src/validation/api_document/user_subject/get_activity_history";

export function ApiResponseGetActivityHistory() {
    return applyDecorators(
        ApiOperation({
            summary: "Xem toàn bộ lịch sử tiến độ trong các khóa/ chủ đề.",
            description: "Cho phép người dùng xem được lịch sử đăng ký và kết thúc của bài học, ngày giờ tương ứng, và trạng thái từng chủ đề trong khóa."
        }),

        ApiResponse({
            status: 200,
            description: 'Thành công',
            type: GetActivityHistorySuccessDto
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
