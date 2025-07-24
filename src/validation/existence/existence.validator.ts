import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';

interface HasEmail {
    email: string;
}

@Injectable()
export class DatabaseValidation {
    checkEmailExists<T extends HasEmail>(repo: Repository<T>, email: string): Promise<T | null> {
        return repo.findOneBy({ email } as any);
    }
}
