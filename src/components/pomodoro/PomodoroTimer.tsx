'use client';

import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useActiveSession, useUpdateSession, usePomodoroConfig } from '@/hooks/usePomodoro';
import { SessionAction } from '@/types/pomodoro';
import { Button } from '@/components/ui/Button';
import { Play, Pause, Square, SkipForward } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/cn';

interface PomodoroTimerProps {
  onComplete?: () => void;
}

export function PomodoroTimer({ onComplete }: PomodoroTimerProps) {
  const t = useTranslations('pomodoro');
  const { data: activeSession, isLoading: sessionLoading } = useActiveSession();
  const { data: config } = usePomodoroConfig();
  const updateSession = useUpdateSession();
  
  const [timeLeft, setTimeLeft] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Calculate total duration based on session type
  const getTotalDuration = useCallback(() => {
    if (!activeSession) return 25 * 60; // Default 25 minutes
    
    return activeSession.sessionType === 'WORK' 
      ? activeSession.workDuration * 60 
      : activeSession.breakDuration * 60;
  }, [activeSession]);

  // Initialize timer
  useEffect(() => {
    if (activeSession) {
      const totalDuration = getTotalDuration();
      
      if (activeSession.startTime && activeSession.status !== 'PAUSED') {
        const elapsed = Math.floor((Date.now() - new Date(activeSession.startTime).getTime()) / 1000);
        const remaining = Math.max(0, totalDuration - elapsed);
        setTimeLeft(remaining);
        
        // Only auto-start if session is ACTIVE, not PAUSED
        setIsRunning(activeSession.status === 'ACTIVE' && remaining > 0);
      } else {
        setTimeLeft(totalDuration);
        setIsRunning(false); // Don't auto-start until user clicks start
      }
    }
  }, [activeSession, getTotalDuration]);

  // Define handleComplete first
  const handleComplete = useCallback(() => {
    if (!activeSession || !config) return;
    
    // Play alarm sound
    if (audioRef.current && config?.alarmSound && config?.soundEnabled) {
      const volume = config.soundVolume ?? 50;
      audioRef.current.volume = Math.max(0, Math.min(1, volume / 100));
      audioRef.current.play().catch(console.error);
    }
    
    setIsRunning(false);
    
    // Mark session as completed and wait for it to succeed before calling onComplete
    updateSession.mutate({
      id: activeSession.id,
      action: SessionAction.COMPLETE
    }, {
      onSuccess: () => {
        // Call onComplete callback after session is successfully marked as completed
        if (onComplete) {
          onComplete();
        }
      }
    });
  }, [activeSession, config, updateSession, onComplete]);

  // Timer countdown
  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            // Timer completed
            handleComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, timeLeft, handleComplete]);

  const handleStart = () => {
    if (!activeSession) return;
    
    // If timer was paused, send RESUME action to backend
    if (activeSession.status === 'PAUSED') {
      updateSession.mutate({
        id: activeSession.id,
        action: SessionAction.RESUME
      });
    } else {
      // First time starting, send START action
      updateSession.mutate({
        id: activeSession.id,
        action: SessionAction.START
      });
    }
    setIsRunning(true);
  };

  const handlePause = () => {
    if (!activeSession) return;
    
    // Send PAUSE action to backend to persist pause state
    updateSession.mutate({
      id: activeSession.id,
      action: SessionAction.PAUSE
    });
    setIsRunning(false);
  };

  const handleStop = () => {
    if (!activeSession) return;
    
    updateSession.mutate({
      id: activeSession.id,
      action: SessionAction.CANCEL
    });
    setIsRunning(false);
    setTimeLeft(0);
  };

  const handleSkip = () => {
    if (!activeSession) return;
    
    handleComplete();
  };

  // Format time display
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    
    if (mins === 0) {
      return `${secs}s`;
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Calculate progress percentage
  const totalDuration = getTotalDuration();
  let progress = 0;
  
  if (activeSession?.startTime && totalDuration > 0) {
    // Calculate actual elapsed time from startTime
    const elapsed = Math.floor((Date.now() - new Date(activeSession.startTime).getTime()) / 1000);
    progress = Math.min(100, (elapsed / totalDuration) * 100);
  } else if (totalDuration > 0 && timeLeft < totalDuration) {
    // Fallback: calculate from timeLeft if timer is running but no startTime
    progress = ((totalDuration - timeLeft) / totalDuration) * 100;
  }

  // SVG donut chart dimensions
  const size = 300;
  const strokeWidth = 20;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  if (sessionLoading) {
    return <div className="flex items-center justify-center h-[400px]">{t('loading')}</div>;
  }

  if (!activeSession) {
    return null;
  }

  return (
    <div className="flex flex-col items-center space-y-6" data-testid="pomodoro-timer">
      {/* Donut Chart Timer */}
      <div className="relative">
        <svg width={size} height={size} className="transform -rotate-90">
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="currentColor"
            strokeWidth={strokeWidth}
            fill="none"
            className="text-muted"
          />
          {/* Progress circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="currentColor"
            strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className={cn(
              "transition-all duration-1000 ease-linear",
              activeSession.sessionType === 'WORK'
                ? "text-primary"
                : "text-green-500"
            )}
          />
        </svg>
        
        {/* Timer display in center */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="text-5xl font-bold" data-testid="timer-display">{formatTime(timeLeft)}</div>
          <div className="text-sm text-muted-foreground mt-2" data-testid="session-type">
            {t(`sessionType.${activeSession.sessionType.toLowerCase()}`)}
          </div>
        </div>
      </div>

      {/* Control buttons */}
      <div className="flex gap-2">
        {/* Show start button if session hasn't started yet */}
        {!activeSession.startTime && (
          <Button onClick={handleStart} size="lg">
            <Play className="h-5 w-5 mr-2" />
            {t('start')}
          </Button>
        )}
        
        {/* Show pause button if session is active */}
        {activeSession.status === 'ACTIVE' && activeSession.startTime && (
          <Button onClick={handlePause} size="lg" variant="secondary">
            <Pause className="h-5 w-5 mr-2" />
            {t('pause')}
          </Button>
        )}
        
        {/* Show resume button if session is paused */}
        {activeSession.status === 'PAUSED' && (
          <Button onClick={handleStart} size="lg">
            <Play className="h-5 w-5 mr-2" />
            {t('resume')}
          </Button>
        )}
        
        <Button onClick={handleStop} size="lg" variant="outline">
          <Square className="h-5 w-5 mr-2" />
          {t('stop')}
        </Button>
        
        <Button onClick={handleSkip} size="lg" variant="outline">
          <SkipForward className="h-5 w-5 mr-2" />
          {t('skip')}
        </Button>
      </div>

      {/* Hidden audio element for alarm */}
      <audio
        ref={audioRef}
        src={`/sounds/${config?.alarmSound || 'default'}.mp3`}
        preload="auto"
      />
    </div>
  );
}