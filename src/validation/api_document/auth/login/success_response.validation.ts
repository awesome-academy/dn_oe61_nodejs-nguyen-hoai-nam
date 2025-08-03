import { ApiProperty } from '@nestjs/swagger';

export class LoginSuccessResponseDto {
  @ApiProperty({ example: 200 })
  code: number;

  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ example: 'Đăng nhập thành công' })
  message: string;

  @ApiProperty({
    example: {
      user: {
        id: 4,
        name: 'Admin',
        role: 'ADMIN',
      },
      token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    },
  })
  data: {
    user: {
      id: number;
      name: string;
      role: string;
    };
    token: string;
  };
}
