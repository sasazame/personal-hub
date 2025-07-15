'use client';

import React, { useState, useRef } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { showSuccess, showError } from '@/components/ui/toast';
import { usePomodoroConfig, useUpdateConfig } from '@/hooks/usePomodoro';
import { Settings, Volume2, Play } from 'lucide-react';
import { useTranslations } from 'next-intl';

const ALARM_SOUNDS = [
  { value: 'default', label: 'Default' },
  { value: 'bell', label: 'Bell' },
  { value: 'chime', label: 'Chime' },
  { value: 'ding', label: 'Ding' },
  { value: 'gentle', label: 'Gentle' }
];

export function PomodoroConfig() {
  const t = useTranslations('pomodoro.config');
  const [isOpen, setIsOpen] = useState(false);
  const { data: config, isLoading } = usePomodoroConfig();
  const updateConfig = useUpdateConfig();
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Helper function to parse and validate numeric input
  const parseNumericInput = (value: string, min: number, max: number, defaultValue: number): number => {
    const parsed = parseInt(value, 10);
    if (isNaN(parsed)) return defaultValue;
    return Math.max(min, Math.min(max, parsed));
  };

  const [formData, setFormData] = useState({
    workDuration: 25,
    shortBreakDuration: 5,
    longBreakDuration: 15,
    cyclesBeforeLongBreak: 4,
    alarmSound: 'default',
    alarmVolume: 50,
    autoStartBreaks: true,
    autoStartWork: false
  });

  // Update form when config loads
  React.useEffect(() => {
    if (config) {
      setFormData({
        workDuration: config.workDuration,
        shortBreakDuration: config.shortBreakDuration,
        longBreakDuration: config.longBreakDuration,
        cyclesBeforeLongBreak: config.cyclesBeforeLongBreak || 4,
        alarmSound: config.alarmSound,
        alarmVolume: config.soundVolume,
        autoStartBreaks: config.autoStartBreaks,
        autoStartWork: config.autoStartWork
      });
    }
  }, [config]);

  const handleSave = () => {
    updateConfig.mutate(formData, {
      onSuccess: () => {
        showSuccess(t('saveSuccess'));
        setIsOpen(false);
      },
      onError: () => {
        showError(t('saveError'));
      }
    });
  };

  const handleTestSound = () => {
    if (audioRef.current) {
      audioRef.current.src = `/sounds/${formData.alarmSound}.mp3`;
      audioRef.current.volume = formData.alarmVolume / 100;
      audioRef.current.play().catch((error) => {
        console.error('Failed to preview alarm sound:', error);
        alert('Unable to play sound. Please check your browser settings for autoplay permissions.');
      });
    }
  };

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        size="sm"
        variant="outline"
        className="absolute top-4 right-4 p-2"
        data-testid="settings-button"
      >
        <Settings className="h-4 w-4" />
      </Button>

      <Modal open={isOpen} onClose={() => setIsOpen(false)} size="md">
        <div className="p-6">
          <h2 className="text-lg font-semibold mb-4">{t('title')}</h2>

          {isLoading ? (
            <div className="text-center py-8">{t('loading')}</div>
          ) : (
            <div className="space-y-6">
              {/* Timer durations */}
              <div className="space-y-4">
                <div>
                  <div className="flex items-center gap-2">
                    <div className="w-24">
                      <Input
                        type="number"
                        min="1"
                        max="120"
                        label={t('workDuration')}
                        value={formData.workDuration}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, workDuration: parseNumericInput(e.target.value, 1, 120, 25) })}
                      />
                    </div>
                    <span className="text-sm text-muted-foreground mt-6">{t('minutes')}</span>
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <div className="w-24">
                      <Input
                        type="number"
                        min="1"
                        max="60"
                        label={t('shortBreakDuration')}
                        value={formData.shortBreakDuration}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, shortBreakDuration: parseNumericInput(e.target.value, 1, 60, 5) })}
                      />
                    </div>
                    <span className="text-sm text-muted-foreground mt-6">{t('minutes')}</span>
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <div className="w-24">
                      <Input
                        type="number"
                        min="1"
                        max="60"
                        label={t('longBreakDuration')}
                        value={formData.longBreakDuration}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, longBreakDuration: parseNumericInput(e.target.value, 1, 60, 15) })}
                      />
                    </div>
                    <span className="text-sm text-muted-foreground mt-6">{t('minutes')}</span>
                  </div>
                </div>

                <div>
                  <div className="w-24">
                    <Input
                      type="number"
                      min="1"
                      max="10"
                      label={t('cyclesBeforeLongBreak')}
                      value={formData.cyclesBeforeLongBreak}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, cyclesBeforeLongBreak: parseNumericInput(e.target.value, 1, 10, 4) })}
                    />
                  </div>
                </div>
              </div>

              {/* Sound settings */}
              <div className="space-y-4 border-t pt-4">
                <div>
                  <Label>{t('alarmSound')}</Label>
                  <div className="flex items-center gap-2">
                    <Select
                      value={formData.alarmSound}
                      onValueChange={(value: string) => setFormData({ ...formData, alarmSound: value })}
                    >
                      <SelectTrigger className="flex-1 px-2 py-1 border rounded">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {ALARM_SOUNDS.map((sound) => (
                          <SelectItem key={sound.value} value={sound.value}>
                            {sound.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button size="sm" variant="outline" onClick={handleTestSound}>
                      <Play className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div>
                  <Label>{t('volume')}</Label>
                  <div className="flex items-center gap-2">
                    <Volume2 className="h-4 w-4 text-muted-foreground" />
                    <input
                      type="range"
                      value={formData.alarmVolume}
                      onChange={(e) => setFormData({ ...formData, alarmVolume: parseNumericInput(e.target.value, 0, 100, 50) })}
                      min="0"
                      max="100"
                      step="5"
                      className="flex-1 px-2 py-1 border rounded"
                    />
                    <span className="text-sm text-muted-foreground w-10 text-right">
                      {formData.alarmVolume}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Auto-start settings */}
              <div className="space-y-4 border-t pt-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="autoStartBreaks">{t('autoStartBreaks')}</Label>
                  <Switch
                    id="autoStartBreaks"
                    checked={formData.autoStartBreaks}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, autoStartBreaks: e.target.checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="autoStartWork">{t('autoStartWork')}</Label>
                  <Switch
                    id="autoStartWork"
                    checked={formData.autoStartWork}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, autoStartWork: e.target.checked })}
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsOpen(false)}>
                  {t('cancel')}
                </Button>
                <Button onClick={handleSave} disabled={updateConfig.isPending}>
                  {updateConfig.isPending ? t('saving') : t('save')}
                </Button>
              </div>
            </div>
          )}

          {/* Hidden audio element for testing */}
          <audio ref={audioRef} preload="auto" />
        </div>
      </Modal>
    </>
  );
}