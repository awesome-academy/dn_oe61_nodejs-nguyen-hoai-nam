import { Injectable } from '@nestjs/common';
import { User } from 'src/database/entities/user.entity';
import { FindOptionsWhere, Repository } from 'typeorm';

@Injectable()
export class DatabaseValidation {
    checkEmailExists<T extends hasEmail>(repo: Repository<T>, email: string): Promise<T | null> {
        return repo.findOneBy({ email } as FindOptionsWhere<T>);
    }

    checkIdExists<T extends hasId>(repo: Repository<T>, userId: number): Promise<T | null> {
        return repo.findOneBy({ userId } as FindOptionsWhere<T>);
    }
}
