import { Injectable } from '@nestjs/common';
import { Repository, FindManyOptions, ObjectLiteral } from 'typeorm';
import { PaginationParams, PaginationResult } from '../interface/page.interface';

@Injectable()
export class PaginationService {
    private readonly DEFAULT_PAGE_SIZE = 50;
    private readonly MAX_PAGE_SIZE = 100;

    async queryWithPagination<TEntity extends ObjectLiteral>(
        repo: Repository<TEntity>,
        options: PaginationParams,
        findOptions?: FindManyOptions<TEntity>,
    ): Promise<PaginationResult<TEntity>> {
        let page = typeof options.page === 'number' && options.page > 0 ? options.page : 1;

        let pageSize = typeof options.pageSize === 'number' && options.pageSize > 0
            ? Math.min(options.pageSize, this.MAX_PAGE_SIZE)
            : this.DEFAULT_PAGE_SIZE;

        const totalItems = await repo.count({ where: findOptions?.where });

        const totalPages = Math.max(Math.ceil(totalItems / pageSize), 1);
        const safePage = Math.min(Math.max(page, 1), totalPages);
        const skip = (safePage - 1) * pageSize;

        const items = await repo.find({
            skip,
            take: pageSize,
            ...findOptions,
        });

        return {
            data: items,
            meta: {
                totalItems,
                itemCount: items.length,
                currentPage: safePage,
                itemsPerPage: pageSize,
                totalPages,
            },
        };
    }
}




