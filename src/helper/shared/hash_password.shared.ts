import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';

@Injectable()
export class hashPassword {
    constructor(private readonly configService: ConfigService) { }

    async hashPassword(passwordInput: string): Promise<string> {
        const saltRoundsRaw = this.configService.get<string>('AUTH_SALT_ROUNDS');
        const saltRounds = saltRoundsRaw ? parseInt(saltRoundsRaw, 10) : 10;

        const finalSaltRounds = isNaN(saltRounds) || saltRounds <= 0 ? 10 : saltRounds;

        const result = await bcrypt.hash(passwordInput, finalSaltRounds);
        return result;
    }
}
