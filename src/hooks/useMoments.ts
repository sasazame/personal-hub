import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CreateMomentDto, UpdateMomentDto, MomentFilters } from '@/types/moment';
import { momentsService } from '@/services/moments';

export function useMoments(filters?: MomentFilters) {
  return useQuery({
    queryKey: ['moments', 'all', filters],
    queryFn: async () => {
      // Handle search and tags filters
      if (filters?.search && filters?.tags && filters.tags.length > 0) {
        return momentsService.searchMoments(filters.search, filters.tags[0]);
      }
      
      if (filters?.search) {
        return momentsService.searchMoments(filters.search);
      }
      
      if (filters?.tags && filters.tags.length > 0) {
        // For simplicity, search by first tag
        return momentsService.getMomentsByTag(filters.tags[0]);
      }

      if (filters?.startDate && filters?.endDate) {
        const response = await momentsService.getMomentsByDateRange(
          filters.startDate,
          filters.endDate
        );
        return response.content;
      }
      
      // Default: get all moments
      return momentsService.getAllMoments();
    },
    staleTime: 1000 * 60 * 2, // 2 minutes - shorter than notes for real-time feel
  });
}

export function useMomentsPaginated(page = 0, size = 20) {
  return useQuery({
    queryKey: ['moments', 'paginated', page, size],
    queryFn: () => momentsService.getMoments(page, size),
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}

export function useMoment(id: number) {
  return useQuery({
    queryKey: ['moment', id],
    queryFn: () => momentsService.getMoment(id),
    enabled: !!id,
  });
}

export function useRecentMoments(limit?: number) {
  return useQuery({
    queryKey: ['moments', 'recent', limit],
    queryFn: () => momentsService.getRecentMoments(limit),
    staleTime: 1000 * 60 * 1, // 1 minute - more frequent updates
  });
}

export function useTodaysMoments() {
  return useQuery({
    queryKey: ['moments', 'today'],
    queryFn: () => momentsService.getTodaysMoments(),
    staleTime: 1000 * 60 * 1, // 1 minute
  });
}

export function useMomentTags() {
  return useQuery({
    queryKey: ['moments', 'tags'],
    queryFn: () => momentsService.getTags(),
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
}

export function useDefaultMomentTags() {
  return useQuery({
    queryKey: ['moments', 'tags', 'default'],
    queryFn: () => momentsService.getDefaultTags(),
    staleTime: 1000 * 60 * 60, // 1 hour - default tags rarely change
  });
}

export function useCreateMoment() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateMomentDto) => momentsService.createMoment(data),
    onSuccess: () => {
      // Invalidate all moments queries
      queryClient.invalidateQueries({ queryKey: ['moments'] });
    },
  });
}

export function useUpdateMoment() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateMomentDto }) => 
      momentsService.updateMoment(id, data),
    onSuccess: (updatedMoment) => {
      // Update the specific moment in cache
      queryClient.setQueryData(['moment', updatedMoment.id], updatedMoment);
      
      // Invalidate moments queries
      queryClient.invalidateQueries({ queryKey: ['moments'] });
    },
  });
}

export function useDeleteMoment() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: number) => momentsService.deleteMoment(id),
    onSuccess: (_, deletedId) => {
      // Remove from specific moment cache
      queryClient.removeQueries({ queryKey: ['moment', deletedId] });
      
      // Invalidate moments queries
      queryClient.invalidateQueries({ queryKey: ['moments'] });
    },
  });
}

// Hook to get moments by date range with filters
export function useMomentsByDateRange(
  startDate: string | undefined,
  endDate: string | undefined,
  page = 0,
  size = 20
) {
  return useQuery({
    queryKey: ['moments', 'dateRange', startDate, endDate, page, size],
    queryFn: () => {
      if (!startDate || !endDate) {
        return Promise.resolve({ 
          content: [], 
          totalElements: 0, 
          totalPages: 0,
          pageable: {
            pageNumber: 0,
            pageSize: 20,
            sort: {
              sorted: false,
              direction: 'desc',
              properties: []
            }
          },
          first: true,
          last: true
        });
      }
      return momentsService.getMomentsByDateRange(startDate, endDate, page, size);
    },
    enabled: !!startDate && !!endDate,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}