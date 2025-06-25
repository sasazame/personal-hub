import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { GoogleIntegrationService, GoogleSyncSettings } from '@/services/google-integration';
import { showSuccess, showError } from '@/components/ui/toast';

export function useGoogleAuth() {
  const hasIntegration = GoogleIntegrationService.hasGoogleIntegration();
  
  const initiateAuth = () => {
    GoogleIntegrationService.initiateGoogleAuth();
  };
  
  const revokeIntegration = useMutation({
    mutationFn: () => GoogleIntegrationService.revokeGoogleIntegration(),
    onSuccess: () => {
      showSuccess('Google integration has been revoked');
      window.location.reload(); // Refresh to update UI state
    },
    onError: (error) => {
      showError('Failed to revoke Google integration');
      console.error('Revoke error:', error);
    },
  });
  
  return {
    hasIntegration,
    initiateAuth,
    revokeIntegration: revokeIntegration.mutate,
    isRevoking: revokeIntegration.isPending,
  };
}

export function useCalendarSyncSettings() {
  return useQuery({
    queryKey: ['google', 'calendar', 'sync-settings'],
    queryFn: () => GoogleIntegrationService.getCalendarSyncSettings(),
    enabled: GoogleIntegrationService.hasGoogleIntegration(),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useUpdateCalendarSyncSettings() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (settings: GoogleSyncSettings) => 
      GoogleIntegrationService.updateCalendarSyncSettings(settings),
    onSuccess: (data) => {
      queryClient.setQueryData(['google', 'calendar', 'sync-settings'], data);
      showSuccess('Calendar sync settings updated');
    },
    onError: (error) => {
      showError('Failed to update sync settings');
      console.error('Update settings error:', error);
    },
  });
}

export function useCalendarSync() {
  const queryClient = useQueryClient();
  
  const triggerSync = useMutation({
    mutationFn: () => GoogleIntegrationService.triggerCalendarSync(),
    onSuccess: (status) => {
      queryClient.setQueryData(['google', 'calendar', 'sync-status'], status);
      queryClient.invalidateQueries({ queryKey: ['calendar', 'events'] });
      showSuccess(`Calendar sync completed. ${status.syncedEvents} events synced.`);
    },
    onError: (error) => {
      showError('Calendar sync failed');
      console.error('Sync error:', error);
    },
  });
  
  const syncStatus = useQuery({
    queryKey: ['google', 'calendar', 'sync-status'],
    queryFn: () => GoogleIntegrationService.getCalendarSyncStatus(),
    enabled: GoogleIntegrationService.hasGoogleIntegration(),
    refetchInterval: 5000, // Check every 5 seconds
  });
  
  return {
    triggerSync: triggerSync.mutate,
    isSyncing: triggerSync.isPending || syncStatus.data?.isRunning || false,
    syncStatus: syncStatus.data,
    lastSyncTime: syncStatus.data?.lastSyncTime,
    nextSyncTime: syncStatus.data?.nextSyncTime,
    syncErrors: syncStatus.data?.errors,
  };
}

export function useGmailMessages(query = '', maxResults = 10) {
  return useQuery({
    queryKey: ['google', 'gmail', 'messages', query, maxResults],
    queryFn: () => GoogleIntegrationService.getGmailMessages(query, maxResults),
    enabled: GoogleIntegrationService.hasGoogleIntegration() && query.length > 0,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}

export function useGmailMessage(messageId: string) {
  return useQuery({
    queryKey: ['google', 'gmail', 'message', messageId],
    queryFn: () => GoogleIntegrationService.getGmailMessage(messageId),
    enabled: GoogleIntegrationService.hasGoogleIntegration() && !!messageId,
  });
}

export function useConvertEmailToTask() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ messageId, taskData }: {
      messageId: string;
      taskData: {
        title: string;
        description?: string;
        priority: 'LOW' | 'MEDIUM' | 'HIGH';
        dueDate?: string;
      };
    }) => GoogleIntegrationService.convertEmailToTask(messageId, taskData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] });
      showSuccess('Email converted to task successfully');
    },
    onError: (error) => {
      showError('Failed to convert email to task');
      console.error('Convert error:', error);
    },
  });
}