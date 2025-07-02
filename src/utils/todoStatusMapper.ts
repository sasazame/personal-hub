/**
 * Maps between API status values and display status values
 */

export type ApiTodoStatus = 'TODO' | 'IN_PROGRESS' | 'DONE';
export type DisplayTodoStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED';

/**
 * Maps API status to display status
 */
export function mapApiStatusToDisplay(apiStatus: ApiTodoStatus): DisplayTodoStatus {
  switch (apiStatus) {
    case 'TODO':
      return 'NOT_STARTED';
    case 'IN_PROGRESS':
      return 'IN_PROGRESS';
    case 'DONE':
      return 'COMPLETED';
    default:
      return 'NOT_STARTED';
  }
}

/**
 * Maps display status to API status
 */
export function mapDisplayStatusToApi(displayStatus: DisplayTodoStatus): ApiTodoStatus {
  switch (displayStatus) {
    case 'NOT_STARTED':
      return 'TODO';
    case 'IN_PROGRESS':
      return 'IN_PROGRESS';
    case 'COMPLETED':
      return 'DONE';
    default:
      return 'TODO';
  }
}

/**
 * Gets the display color class for a status
 */
export function getStatusColorClass(status: DisplayTodoStatus) {
  switch (status) {
    case 'NOT_STARTED':
      return 'bg-status-pending-bg text-status-pending-text';
    case 'IN_PROGRESS':
      return 'bg-status-in-progress-bg text-status-in-progress-text';
    case 'COMPLETED':
      return 'bg-status-completed-bg text-status-completed-text';
  }
}