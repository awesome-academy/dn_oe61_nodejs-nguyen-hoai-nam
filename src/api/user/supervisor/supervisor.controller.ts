import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards, } from '@nestjs/common';
import { SupervisorService } from './supervisor.service';
import { CreateUserDto, UpdateUserDto, userIdDto } from 'src/validation/class_validation/user.validation';
import { AuthRoles } from 'src/helper/decorators/auth_roles.decorator';
import { Role } from 'src/database/dto/user.dto';
import { Language } from 'src/helper/decorators/language.decorator';
import { Public } from 'src/helper/decorators/metadata.decorator';
import { ChangePasswordDto } from 'src/validation/auth_validation/auth.validation';
import { JwtBlacklistGuard } from 'src/middleware/jwt_blacklist.guard';
import { ApiExcludeController } from '@nestjs/swagger';

@ApiExcludeController()
@Controller('supervisor')
export class SupervisorController {
    constructor(private readonly supervisorService: SupervisorService) { }

    @AuthRoles(Role.ADMIN)
    @Post('create')
    async create(@Body() supervisorInput: CreateUserDto, @Language() lang: string) {
        const result = await this.supervisorService.create(supervisorInput, lang);
        return result;
    }

    @Public()
    @UseGuards(JwtBlacklistGuard)
    @Get('confirm_account')
    async confirmAccount(@Query('token') token: string, @Language() lang: string) {
        const result = await this.supervisorService.confirmAccount(token, lang);
        return result;
    }

    @Public()
    @UseGuards(JwtBlacklistGuard)
    @Post('change_password')
    async changePassword(@Body() bodyInput: ChangePasswordDto, @Language() lang: string) {
        const result = await this.supervisorService.changePassword(bodyInput, lang);
        return result;
    }

    @AuthRoles(Role.ADMIN)
    @Get('')
    async getall(@Language() lang: string) {
        const result = await this.supervisorService.getAll(lang);
        return result;
    }

    @AuthRoles(Role.ADMIN)
    @Delete(':userId')
    async delete(@Param() supervisorId: userIdDto, @Language() lang: string) {
        const result = await this.supervisorService.delete(supervisorId.userId, lang);
        return result;
    }

    @AuthRoles(Role.ADMIN)
    @Put(':userId')
    async update(@Param() supervisorId: userIdDto, @Body() supervisorInput: UpdateUserDto, @Language() lang: string) {
        const result = await this.supervisorService.update(supervisorId.userId, supervisorInput, lang);
        return result;
    }

    @AuthRoles(Role.ADMIN)
    @Get(':userId')
    async getById(@Param() supervisorId: userIdDto, @Language() lang: string) {
        const result = await this.supervisorService.getById(supervisorId.userId, lang);
        return result;
    }
}
