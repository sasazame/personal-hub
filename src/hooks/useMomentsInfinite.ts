import { useInfiniteQuery } from '@tanstack/react-query';
import { Moment, MomentFilters } from '@/types/moment';
import { momentsService } from '@/services/moments';

const PAGE_SIZE = 50;

interface PagedResponse {
  content: Moment[];
  totalElements: number;
  totalPages: number;
  pageable: {
    pageNumber: number;
    pageSize: number;
    sort: {
      sorted: boolean;
      direction: string;
      properties: string[];
    };
  };
  first: boolean;
  last: boolean;
}

export function useMomentsInfinite(filters?: MomentFilters) {
  return useInfiniteQuery<PagedResponse>({
    queryKey: ['moments', 'infinite', filters],
    initialPageParam: 0,
    queryFn: async ({ pageParam }) => {
      // If we have date range filters, use the paginated endpoint
      if (filters?.startDate && filters?.endDate) {
        const response = await momentsService.getMomentsByDateRange(
          filters.startDate,
          filters.endDate,
          pageParam as number,
          PAGE_SIZE
        );
        return response;
      }
      
      // For other filters, we need to get all and manually paginate
      // This is not ideal but works with the current API
      let allMoments = [];
      
      if (filters?.search && filters?.tags && filters.tags.length > 0) {
        allMoments = await momentsService.searchMoments(filters.search, filters.tags[0]);
      } else if (filters?.search) {
        allMoments = await momentsService.searchMoments(filters.search);
      } else if (filters?.tags && filters.tags.length > 0) {
        allMoments = await momentsService.getMomentsByTag(filters.tags[0]);
      } else {
        allMoments = await momentsService.getAllMoments();
      }
      
      // Manually paginate
      const start = (pageParam as number) * PAGE_SIZE;
      const end = start + PAGE_SIZE;
      const content = allMoments.slice(start, end);
      
      return {
        content,
        totalElements: allMoments.length,
        totalPages: Math.ceil(allMoments.length / PAGE_SIZE),
        pageable: {
          pageNumber: pageParam as number,
          pageSize: PAGE_SIZE,
          sort: {
            sorted: true,
            direction: 'desc',
            properties: ['createdAt']
          }
        },
        first: pageParam === 0,
        last: end >= allMoments.length
      } as PagedResponse;
    },
    getNextPageParam: (lastPage) => {
      if (lastPage.last) return undefined;
      return lastPage.pageable.pageNumber + 1;
    },
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}