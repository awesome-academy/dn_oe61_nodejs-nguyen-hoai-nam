import { BadRequestException, Injectable } from '@nestjs/common';
import { urlencoded } from 'express';
import { User } from 'src/database/entities/user.entity';
import { I18nUtils } from 'src/helper/utils/i18n-utils';
import { FindManyOptions, FindOptionsWhere, Repository } from 'typeorm';

@Injectable()
export class DatabaseValidation {
    constructor(private readonly i18nUtils: I18nUtils) { }
    checkEmailExists<T extends hasEmail>(repo: Repository<T>, email: string): Promise<T | null> {
        return repo.findOneBy({ email } as FindOptionsWhere<T>);
    }

    checkIdExists<T extends hasId>(repo: Repository<T>, userId: number): Promise<T | null> {
        return repo.findOneBy({ userId } as FindOptionsWhere<T>);
    }

    async checkUserByCreator<T extends HasCreatorCourse>(repo: Repository<T>, alias: string, userRelation: string, userId: number, lang: string): Promise<void> {
        const course = await repo.createQueryBuilder(alias)
            .innerJoinAndSelect(`${alias}.${userRelation}`, userRelation)
            .where(`${userRelation}.userId = :userId`, { userId })
            .getMany();

        if (course.length > 0) {
            throw new BadRequestException(this.i18nUtils.translate('validation.crud.delete_not_allowed', {}, lang));
        }
    }

    async checkUserBySubject<T extends HasCreatorSubject>(repo: Repository<T>, alias: string, userRelation: string, userId: number, lang: string): Promise<void | null> {
        const subject = await repo.createQueryBuilder(alias)
            .innerJoinAndSelect(`${alias}.${userRelation}`, userRelation)
            .where(`${userRelation}.userId = :userId`, { userId })
            .getMany();

        if (subject.length > 0) {
            throw new BadRequestException(this.i18nUtils.translate('validation.crud.delete_not_allowed', {}, lang));
        }
    }

    async checkSupervisorByCourse<T extends HasSupervisorCourse>(repo: Repository<T>, alias: string, userRelation: string, userId: number, lang: string): Promise<void> {
        const count = await repo.createQueryBuilder(alias)
            .innerJoin(`${alias}.${userRelation}`, userRelation)
            .where(`${userRelation}.userId = :userId`, { userId })
            .getMany();

        if (count.length > 0) {
            throw new BadRequestException(this.i18nUtils.translate('validation.crud.delete_not_allowed', {}, lang));
        }
    }

}
