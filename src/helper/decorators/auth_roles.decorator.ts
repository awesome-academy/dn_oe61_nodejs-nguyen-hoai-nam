import { applyDecorators, UseGuards } from '@nestjs/common';
import { Roles } from './metadata.decorator';
import { RolesGuard } from 'src/middleware/decentralization.middleware';
import { Role } from 'src/database/dto/user.dto';

export function AuthRoles(...roles: Role[]) {
    return applyDecorators(
        UseGuards(RolesGuard),
        Roles(...roles)
    );
}
