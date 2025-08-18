import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common';
import { TraineeService } from './trainee.service';
import { CreateUserDto, UpdateUserDto, userIdDto } from 'src/validation/class_validation/user.validation';
import { Language } from 'src/helper/decorators/language.decorator';
import { Role } from 'src/database/dto/user.dto';
import { AuthRoles } from 'src/helper/decorators/auth_roles.decorator';
import { ApiExcludeController} from '@nestjs/swagger';

@ApiExcludeController()
@Controller('trainee')
export class TraineeController {
    constructor(
        private readonly traineeService: TraineeService,
    ) { }

    @AuthRoles(Role.ADMIN,Role.SUPERVISOR)
    @Get()
    async getAll (@Language() lang: string, @Query() query: { page?: number, pageSize?: number }) {
        const result = await this.traineeService.getAll(lang, query.page, query.pageSize);
        return result;
    }

    @AuthRoles(Role.ADMIN,Role.SUPERVISOR)
    @Get(':userId')
    async getById (@Param() traineeId:userIdDto,@Language() lang: string) {
        const result = await this.traineeService.getById(traineeId.userId,lang);
        return result;
    }

    @AuthRoles(Role.ADMIN,Role.SUPERVISOR)
    @Post()
    async create(@Body() traineeInput: CreateUserDto, @Language() lang: string) {
        const result = await this.traineeService.create(traineeInput,lang);
        return result;
    }

    @AuthRoles(Role.ADMIN,Role.SUPERVISOR)
    @Delete(':userId')
    async delete(@Param() traineeId: userIdDto, @Language() lang:string) {
        const result = await this.traineeService.delete(traineeId.userId,lang);
        return result;
    }

    @AuthRoles(Role.ADMIN,Role.SUPERVISOR)
    @Put(':userId')
    async update(@Param() traineeId: userIdDto,@Body() traineeInput:UpdateUserDto, @Language() lang:string) {
        const result = await this.traineeService.update(traineeId.userId,traineeInput,lang);
        return result;
    }

}
