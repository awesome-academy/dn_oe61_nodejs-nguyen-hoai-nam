import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { BlacklistedToken } from 'src/database/entities/blacklisted_token.entity';
import { LessThan, Repository } from 'typeorm';
import { I18nUtils } from '../../helper/utils/i18n-utils';
import { Cron } from '@nestjs/schedule';
import { CronExpression } from 'src/helper/constants/cron_expression.constant';

@Injectable()
export class BlacklistService {
    private readonly logger = new Logger(BlacklistService.name);

    constructor(
        @InjectRepository(BlacklistedToken)
        private readonly blacklistRepo: Repository<BlacklistedToken>,
        private readonly jwtService: JwtService,
        private readonly i18nUtils: I18nUtils
    ) { }

    async addToBlacklist(token: string, lang: string): Promise<void> {
        try {
            const exists = await this.blacklistRepo.findOne({ where: { token } });
            if (exists) {
                return;
            }

            const decoded = this.jwtService.decode(token) as { exp: number };
            if (!decoded || !decoded.exp) {
                return;
            }

            const expiresAt = new Date(decoded.exp * 1000);
            const blacklistedToken = this.blacklistRepo.create({ token, expiresAt });
            await this.blacklistRepo.save(blacklistedToken);
        } catch {
            throw new InternalServerErrorException(this.i18nUtils.translate('validation.server.internal_server_error', {}, lang))
        }
    }

    async isBlacklisted(token: string, lang: string): Promise<boolean> {
        const found = await this.blacklistRepo.findOne({ where: { token } });
        return !!found;
    }

    @Cron(CronExpression.DAILY, {name: "black-list-token"})
    async handleCron(): Promise<void> {
        const now = new Date();

        try {
            const { affected } = await this.blacklistRepo.delete({
                expiresAt: LessThan(now),
            });

            this.logger.log(`Xóa ${affected ?? 0} token hết hạn khỏi blacklist.`);
        } catch (error) {
            this.logger.error('Lỗi khi xóa token hết hạn:', error);
        }
    }
}
