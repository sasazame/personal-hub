'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useCalendarSyncSettings, useUpdateCalendarSyncSettings, useCalendarSync, useGoogleAuth } from '@/hooks/useGoogleIntegration';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Calendar, RefreshCw, Settings, Unlink, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/cn';
import { format } from 'date-fns';

export function GoogleCalendarSettings() {
  const t = useTranslations();
  const { hasIntegration, initiateAuth, revokeIntegration, isRevoking } = useGoogleAuth();
  const { data: settings, isLoading: isLoadingSettings } = useCalendarSyncSettings();
  const updateSettings = useUpdateCalendarSyncSettings();
  const { triggerSync, isSyncing, syncStatus, lastSyncTime, syncErrors } = useCalendarSync();
  
  const [localSettings, setLocalSettings] = useState({
    enabled: settings?.enabled ?? false,
    calendarId: settings?.calendarId ?? 'primary',
    syncDirection: settings?.syncDirection ?? 'BIDIRECTIONAL',
    autoSync: settings?.autoSync ?? true,
    syncInterval: settings?.syncInterval ?? 30,
  });

  // Update local settings when fetched data changes
  useState(() => {
    if (settings) {
      setLocalSettings({
        enabled: settings.enabled,
        calendarId: settings.calendarId ?? 'primary',
        syncDirection: settings.syncDirection,
        autoSync: settings.autoSync,
        syncInterval: settings.syncInterval,
      });
    }
  });

  const handleSaveSettings = () => {
    updateSettings.mutate(localSettings);
  };

  if (!hasIntegration) {
    return (
      <Card className="border-dashed">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            {t('calendar.googleIntegration.title')}
          </CardTitle>
          <CardDescription>
            {t('calendar.googleIntegration.description')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={initiateAuth} className="w-full">
            {t('calendar.googleIntegration.connect')}
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (isLoadingSettings) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="flex items-center justify-center">
            <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              {t('calendar.googleIntegration.title')}
            </CardTitle>
            <CardDescription>
              {t('calendar.googleIntegration.settingsDescription')}
            </CardDescription>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => revokeIntegration()}
            disabled={isRevoking}
            className="text-destructive hover:text-destructive"
          >
            <Unlink className="mr-2 h-4 w-4" />
            {t('calendar.googleIntegration.disconnect')}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Sync Status */}
        {syncStatus && (
          <div className={cn(
            "rounded-lg border p-4",
            syncErrors?.length ? "border-destructive/50 bg-destructive/5" : "border-muted bg-muted/50"
          )}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Settings className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">{t('calendar.googleIntegration.syncSettings.syncStatus')}</span>
              </div>
              {lastSyncTime && (
                <span className="text-xs text-muted-foreground">
                  {t('calendar.googleIntegration.syncSettings.lastSync')}: {format(new Date(lastSyncTime), 'MMM d, h:mm a')}
                </span>
              )}
            </div>
            {syncErrors?.length ? (
              <div className="space-y-1">
                {syncErrors.map((error, index) => (
                  <div key={index} className="flex items-start gap-2 text-sm text-destructive">
                    <AlertCircle className="h-3 w-3 mt-0.5 flex-shrink-0" />
                    <span>{error}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                {t('calendar.googleIntegration.status.synced', { count: syncStatus.syncedEvents })}
              </p>
            )}
          </div>
        )}

        {/* Enable/Disable Sync */}
        <div className="flex items-center justify-between">
          <Label htmlFor="sync-enabled" className="flex flex-col">
            <span>{t('calendar.googleIntegration.syncSettings.enable')}</span>
            <span className="text-xs text-muted-foreground font-normal">
              {t('calendar.googleIntegration.syncSettings.enableDescription')}
            </span>
          </Label>
          <Switch
            id="sync-enabled"
            checked={localSettings.enabled}
            onChange={(e) => 
              setLocalSettings(prev => ({ ...prev, enabled: e.target.checked }))
            }
          />
        </div>

        {/* Sync Direction */}
        <div className="space-y-2">
          <Label>{t('calendar.googleIntegration.syncSettings.direction')}</Label>
          <RadioGroup
            value={localSettings.syncDirection}
            onValueChange={(value) => 
              setLocalSettings(prev => ({ 
                ...prev, 
                syncDirection: value as 'TO_GOOGLE' | 'FROM_GOOGLE' | 'BIDIRECTIONAL' 
              }))
            }
            disabled={!localSettings.enabled}
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="TO_GOOGLE" id="to-google" />
              <Label htmlFor="to-google" className="font-normal cursor-pointer">
                {t('calendar.googleIntegration.syncSettings.directionOptions.toGoogle')}
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="FROM_GOOGLE" id="from-google" />
              <Label htmlFor="from-google" className="font-normal cursor-pointer">
                {t('calendar.googleIntegration.syncSettings.directionOptions.fromGoogle')}
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="BIDIRECTIONAL" id="bidirectional" />
              <Label htmlFor="bidirectional" className="font-normal cursor-pointer">
                {t('calendar.googleIntegration.syncSettings.directionOptions.bidirectional')}
              </Label>
            </div>
          </RadioGroup>
        </div>

        {/* Auto Sync Settings */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="auto-sync" className="flex flex-col">
              <span>{t('calendar.googleIntegration.syncSettings.autoSync')}</span>
              <span className="text-xs text-muted-foreground font-normal">
                {t('calendar.googleIntegration.syncSettings.autoSyncDescription')}
              </span>
            </Label>
            <Switch
              id="auto-sync"
              checked={localSettings.autoSync}
              onChange={(e) => 
                setLocalSettings(prev => ({ ...prev, autoSync: e.target.checked }))
              }
              disabled={!localSettings.enabled}
            />
          </div>

          {localSettings.autoSync && (
            <div className="space-y-2">
              <Label htmlFor="sync-interval">{t('calendar.googleIntegration.syncSettings.interval')}</Label>
              <Select
                value={localSettings.syncInterval.toString()}
                onValueChange={(value) => 
                  setLocalSettings(prev => ({ ...prev, syncInterval: parseInt(value) }))
                }
                disabled={!localSettings.enabled}
              >
                <SelectTrigger id="sync-interval">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="15">{t('calendar.googleIntegration.syncSettings.intervals.15min')}</SelectItem>
                  <SelectItem value="30">{t('calendar.googleIntegration.syncSettings.intervals.30min')}</SelectItem>
                  <SelectItem value="60">{t('calendar.googleIntegration.syncSettings.intervals.hourly')}</SelectItem>
                  <SelectItem value="120">{t('calendar.googleIntegration.syncSettings.intervals.2hours')}</SelectItem>
                  <SelectItem value="240">{t('calendar.googleIntegration.syncSettings.intervals.4hours')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button
            onClick={() => triggerSync()}
            disabled={!localSettings.enabled || isSyncing}
            variant="outline"
            className="flex-1"
          >
            {isSyncing ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                {t('calendar.googleIntegration.status.syncing')}
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                {t('calendar.googleIntegration.syncSettings.syncNow')}
              </>
            )}
          </Button>
          <Button
            onClick={handleSaveSettings}
            disabled={updateSettings.isPending}
            className="flex-1"
          >
            {t('calendar.googleIntegration.saveSettings')}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}