import { ApiProperty } from '@nestjs/swagger';

export class ErrorResponseDto {
    @ApiProperty({ example: 'Thông báo lỗi cụ thể' })
    message: string;

    @ApiProperty({ example: 400, description: 'Mã lỗi HTTP, có thể là 400, 401, 403, 404,...', })
    code: number;

    @ApiProperty({
        example: '2025-08-06T02:30:46.913Z',
        format: 'date-time',
    })
    timestamp: string;

    @ApiProperty({ example: '/duong-dan-api' })
    path: string;
}
