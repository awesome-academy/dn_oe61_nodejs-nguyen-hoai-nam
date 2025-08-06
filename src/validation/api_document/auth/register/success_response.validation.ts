import { ApiProperty } from '@nestjs/swagger';

export class RegisterSuccessResponseDto {
    @ApiProperty({ example: true })
    success: boolean;

    @ApiProperty({ example: 'Đăng ký thành công' })
    message: string;

    @ApiProperty({
        example: {
            id: 4,
            name: 'trainee',
            email: "trainee@gmail.com",
            role: 'TRAINEE',
            status: 'ACTIVE'
        },
    })
    data: {
        id: number;
        name: string;
        email: string;
        role: string;
        status: string
    };
}
