import { CSSProperties } from 'react';

export interface DragSelectionPosition {
  startTime: number; // in minutes
  endTime: number;   // in minutes
}

export interface DragSelectionConfig {
  hourHeight: number;
  timeSlotInterval?: number;
  leftOffset?: string;
  rightOffset?: string;
  backgroundColor?: string;
  borderColor?: string;
  borderRadius?: string;
}

/**
 * Calculate drag selection styles for calendar views
 */
export function calculateDragSelectionStyle(
  position: DragSelectionPosition,
  config: DragSelectionConfig
): CSSProperties {
  const {
    hourHeight,
    timeSlotInterval = 0,
    leftOffset = '2px',
    rightOffset = '2px',
    backgroundColor = 'rgb(59 130 246 / 0.15)',
    borderColor = 'rgb(59 130 246)',
    borderRadius = '0.375rem',
  } = config;

  const { startTime, endTime } = position;
  
  // Calculate position and dimensions
  const actualStartTime = Math.min(startTime, endTime);
  const actualEndTime = Math.max(startTime, endTime) + timeSlotInterval;
  
  const top = (actualStartTime / 60) * hourHeight;
  const height = ((actualEndTime - actualStartTime) / 60) * hourHeight;

  return {
    position: 'absolute',
    top: `${top}px`,
    height: `${height}px`,
    left: leftOffset,
    right: rightOffset,
    backgroundColor,
    border: `2px solid ${borderColor}`,
    borderRadius,
    pointerEvents: 'none',
  };
}

/**
 * Calculate time from Y position in calendar
 */
export function calculateTimeFromPosition(
  yPosition: number,
  hourHeight: number,
  timeSlotInterval: number = 15
): number {
  const minutes = (yPosition / hourHeight) * 60;
  // Round to nearest time slot
  return Math.floor(minutes / timeSlotInterval) * timeSlotInterval;
}

/**
 * Format time in minutes to HH:MM string
 */
export function formatTimeFromMinutes(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
}