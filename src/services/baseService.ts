import { AxiosInstance } from 'axios';
import api from '@/lib/api';

export interface BaseService<TEntity, TCreateDto, TUpdateDto> {
  getAll?: () => Promise<TEntity[]>;
  getById?: (id: number) => Promise<TEntity>;
  create?: (data: TCreateDto) => Promise<TEntity>;
  update?: (id: number, data: TUpdateDto) => Promise<TEntity>;
  delete?: (id: number) => Promise<void>;
}

export interface PagedResponse<T> {
  content: T[];
  pageable: {
    pageNumber: number;
    pageSize: number;
    sort: {
      sorted: boolean;
      direction?: string;
      properties?: string[];
    };
  };
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}

export interface ServiceConfig<TEntity> {
  basePath: string;
  apiInstance?: AxiosInstance;
  transformGet?: (data: unknown) => TEntity;
  transformGetAll?: (data: unknown) => TEntity[];
  transformCreate?: (data: unknown) => TEntity;
  transformUpdate?: (data: unknown) => TEntity;
  includeDelete?: boolean;
  handleNotFound?: boolean;
}

/**
 * Creates a base CRUD service for an entity
 */
export function createBaseService<TEntity, TCreateDto = Partial<TEntity>, TUpdateDto = Partial<TEntity>>(
  config: ServiceConfig<TEntity>
): BaseService<TEntity, TCreateDto, TUpdateDto> {
  const {
    basePath,
    apiInstance = api,
    transformGet = (data) => data as TEntity,
    transformGetAll = (data) => data as TEntity[],
    transformCreate = (data) => data as TEntity,
    transformUpdate = (data) => data as TEntity,
    includeDelete = true,
    handleNotFound = false,
  } = config;

  const service: BaseService<TEntity, TCreateDto, TUpdateDto> = {
    async getAll(): Promise<TEntity[]> {
      const response = await apiInstance.get<TEntity[]>(basePath);
      return transformGetAll(response.data);
    },

    async getById(id: number): Promise<TEntity> {
      try {
        const response = await apiInstance.get<TEntity>(`${basePath}/${id}`);
        return transformGet(response.data);
      } catch (error) {
        if (handleNotFound && isNotFoundError(error)) {
          return null as unknown as TEntity;
        }
        throw error;
      }
    },

    async create(data: TCreateDto): Promise<TEntity> {
      const response = await apiInstance.post<TEntity>(basePath, data);
      return transformCreate(response.data);
    },

    async update(id: number, data: TUpdateDto): Promise<TEntity> {
      const response = await apiInstance.put<TEntity>(`${basePath}/${id}`, data);
      return transformUpdate(response.data);
    },
  };

  if (includeDelete) {
    service.delete = async (id: number): Promise<void> => {
      await apiInstance.delete(`${basePath}/${id}`);
    };
  }

  return service;
}

/**
 * Creates a paginated service for an entity
 */
export function createPaginatedService<TEntity>(
  basePath: string,
  apiInstance: AxiosInstance = api
) {
  return {
    async getPaginated(
      page = 0,
      size = 20,
      sort?: string
    ): Promise<PagedResponse<TEntity>> {
      const params: Record<string, string> = {
        page: page.toString(),
        size: size.toString(),
      };
      
      if (sort) {
        params.sort = sort;
      }
      
      const response = await apiInstance.get<PagedResponse<TEntity>>(basePath, { params });
      return response.data;
    },

    async getAllPaginated(pageSize = 1000): Promise<TEntity[]> {
      const firstPage = await this.getPaginated(0, pageSize);
      const allItems = [...firstPage.content];
      
      // Fetch remaining pages if needed
      if (firstPage.totalPages > 1) {
        const promises = [];
        for (let page = 1; page < firstPage.totalPages; page++) {
          promises.push(this.getPaginated(page, pageSize));
        }
        
        const remainingPages = await Promise.all(promises);
        remainingPages.forEach(page => {
          allItems.push(...page.content);
        });
      }
      
      return allItems;
    },
  };
}

/**
 * Combines base and paginated services
 */
export function createFullService<TEntity>(
  config: ServiceConfig<TEntity> & { supportsPagination?: boolean }
) {
  const baseService = createBaseService(config);
  
  if (config.supportsPagination) {
    const paginatedService = createPaginatedService<TEntity>(
      config.basePath,
      config.apiInstance
    );
    
    return {
      ...baseService,
      ...paginatedService,
      // Override getAll to use pagination
      async getAll(): Promise<TEntity[]> {
        return paginatedService.getAllPaginated();
      },
    };
  }
  
  return baseService;
}

/**
 * Helper to check if error is 404
 */
function isNotFoundError(error: unknown): boolean {
  if (error && typeof error === 'object' && 'response' in error) {
    const axiosError = error as { response: { status: number } };
    return axiosError.response?.status === 404;
  }
  return false;
}

/**
 * Service with additional filter support
 */
export interface FilterableService<TEntity, TFilters> {
  getFiltered(filters: TFilters): Promise<TEntity[]>;
}

export function addFilterSupport<TEntity, TFilters, TCreateDto, TUpdateDto>(
  baseService: BaseService<TEntity, TCreateDto, TUpdateDto>,
  basePath: string,
  apiInstance: AxiosInstance = api
): BaseService<TEntity, TCreateDto, TUpdateDto> & FilterableService<TEntity, TFilters> {
  return {
    ...baseService,
    async getFiltered(filters: TFilters): Promise<TEntity[]> {
      const response = await apiInstance.get<TEntity[]>(basePath, { params: filters });
      return response.data;
    },
  };
}