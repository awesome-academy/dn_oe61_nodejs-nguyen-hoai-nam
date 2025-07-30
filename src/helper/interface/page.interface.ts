export interface PaginationParams {
    page?: number;
    pageSize?: number;
}

export interface PaginationMeta {
    totalItems: number;
    itemCount: number;
    currentPage: number;
    itemsPerPage: number;
    totalPages: number;
}

export interface PaginationResult<TEntity> {
    data: TEntity[];
    meta: PaginationMeta;
}
