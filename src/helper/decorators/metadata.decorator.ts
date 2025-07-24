import { SetMetadata } from "@nestjs/common"
import { Role } from "src/database/dto/user.dto";

export const IS_PUBLIC_KEY = 'isPublic'
export const Public = () => SetMetadata(IS_PUBLIC_KEY,true);

export const ROLE_KEY = 'roles';
export const Roles = (...roles:Role[]) => SetMetadata(ROLE_KEY,roles);
