import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/database/entities/user.entity';
import { ApiResponse } from 'src/helper/interface/api.interface';
import { AuthDto } from 'src/validation/auth_validation/auth.validation';
import { DatabaseValidation } from 'src/validation/existence/existence.validator';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { payLoadDataType } from 'src/helper/interface/pay_load.interface';
import { CreateUserDto } from 'src/validation/class_validation/user.validation';
import { Role } from 'src/database/dto/user.dto';

@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(User)
        private readonly userRepo: Repository<User>,
        private readonly databaseValidation: DatabaseValidation,
        private readonly jwtToken: JwtService
    ) { }

    async login(userInput: AuthDto): Promise<ApiResponse> {
        const email = userInput?.email?.trim();
        const passwordInput = userInput?.password?.trim();

        const user = await this.databaseValidation.checkEmailExists(this.userRepo, email);

        if (!user) {
            throw new UnauthorizedException('Email không hợp lệ');
        }

        const comparePassword = await this.comparePassword(passwordInput, user.password);

        if (!comparePassword) {
            throw new UnauthorizedException("Mật khẩu không hợp lệ")
        }

        const payLoad = {
            id: user.userId,
            userName: user.userName,
            email: user.email,
            role: user.role
        }

        const accessToken = await this.generateToken(payLoad);

        if (!accessToken) {
            throw new UnauthorizedException("Đăng nhập thất bại");
        }

        return {
            message: "Đăng nhập thành công",
            data: {
                user: {
                    id: user.userId,
                    name: user.userName,
                    role: user.role
                },
                token: accessToken,
            }
        }
    }

    async register(userInput: CreateUserDto): Promise<ApiResponse> {
        const emailInput = userInput?.email?.trim();
        const userNameInput = userInput?.user_name?.trim();
        const passwordInput = userInput?.password?.trim();

        const existingUser = await this.databaseValidation.checkEmailExists(this.userRepo, userInput.email.trim());
        if (existingUser) {
            throw new BadRequestException('Email đã được sử dụng');
        }

        const hashedPassword = await this.hashPassword(passwordInput, 10);
        if (!hashedPassword) {
            throw new UnauthorizedException("Mật khẩu không hợp lệ")
        }

        const newUser = this.userRepo.create({
            email: emailInput,
            userName: userNameInput,
            password: hashedPassword,
            role: Role.TRAINEE,
        });

        await this.userRepo.save(newUser);

        return {
            message: 'Đăng ký thành công',
            data: {
                id: newUser.userId,
                email: newUser.email,
                name: newUser.userName,
                role: newUser.role,
                status: newUser.status,
            }
        };
    }

    async comparePassword(passwordInput: string, userPassword: string) {
        const result = await bcrypt.compare(passwordInput, userPassword);
        return result;
    }

    async hashPassword(passwordInput: string, saltOrRounds: number) {
        const result = await bcrypt.hash(passwordInput, saltOrRounds);
        return result;
    }

    async generateToken(payload: payLoadDataType) {
        const accessToken = await this.jwtToken.signAsync(payload);
        return accessToken;
    }
}
