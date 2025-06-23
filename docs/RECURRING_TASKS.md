# Recurring Tasks Feature

This document describes the recurring tasks feature of the Personal Hub application.

## Overview

The recurring tasks feature allows users to set up and manage tasks that execute periodically. It leverages backend APIs already implemented and provides an intuitive user interface on the frontend.

## Features

### 1. Creating Recurring Tasks

By enabling repeat settings in the TODO form, you can create recurring tasks with the following patterns:

- **Daily**: Repeat at specified intervals (days)
- **Weekly**: Repeat on specified weekdays (multiple selection possible)
- **Monthly**: Repeat on specified date
- **Yearly**: Repeat annually on specified date

#### Configuration Options

- **Repeat Pattern**: DAILY/WEEKLY/MONTHLY/YEARLY
- **Interval**: Repeat interval (e.g., every 2 days, every 3 weeks)
- **Weekday Selection**: Only for weekly repeat (multiple selection possible)
- **Day of Month**: Only for monthly repeat
- **End Date**: Date to stop repetition (optional)

### 2. Recurring Tasks Management Screen

The dedicated management screen (`/recurring-tasks`) provides the following operations:

- List view of created recurring tasks
- View repeat settings for each task
- Display instances (auto-generated tasks)
- Manual instance generation

### 3. Instance Management

You can view task instances automatically generated from recurring tasks:

- List view of generated instances
- Each instance's status (TODO/IN_PROGRESS/DONE)
- Due date for each instance
- Relationship display with original recurring task

### 4. Integration with Existing TODO List

Recurring tasks are also identifiable in the regular TODO list screen:

- Recurring tasks display 🔄 icon
- Instances display 🔗 icon
- Relationship with original task viewable via tooltip

## Technical Specifications

### API Endpoints

Frontend uses the following backend APIs:

- `POST /api/v1/todos` - Create recurring task
- `GET /api/v1/todos/repeatable` - List tasks with repeat settings enabled
- `GET /api/v1/todos/{id}/instances` - List instances for specific task
- `POST /api/v1/todos/repeat/generate` - Manual instance generation

### Data Types

```typescript
export interface RepeatConfig {
  repeatType: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY' | 'ONCE';
  interval?: number;
  daysOfWeek?: number[] | null;
  dayOfMonth?: number | null;
  endDate?: string | null;
}

export interface Todo {
  // ... existing fields
  isRepeatable?: boolean;
  repeatConfig?: RepeatConfig | null;
  originalTodoId?: number | null;
}
```

### Component Structure

```
src/
├── components/
│   ├── TodoForm.tsx              # Repeat settings added
│   └── TodoItem.tsx              # Icon display support
├── app/
│   └── recurring-tasks/
│       ├── page.tsx              # Management screen
│       └── __tests__/            # Tests
├── lib/
│   └── api.ts                    # API functions added
└── types/
    └── todo.ts                   # Type definitions updated
```

## Usage

### Creating Recurring Tasks

1. Click "Create New Task" on TODO page
2. Enter basic information (title, description, priority, etc.)
3. Enable "Recurring Task" checkbox
4. Select repeat pattern and detailed settings
5. Click "Create Recurring Task"

### Management Screen Operations

1. Click "Recurring Tasks" from sidebar
2. View list of created tasks
3. Click "View Instances" to see task instances
4. Execute "Generate Instance" for manual generation

### Configuration Examples

#### Daily Exercise
- Pattern: Daily
- Interval: Every 1 day
- End Date: None

#### Gym 3 Times a Week
- Pattern: Weekly
- Interval: Every 1 week
- Weekdays: Monday, Wednesday, Friday
- End Date: None

#### Month-end Report
- Pattern: Monthly
- Interval: Every 1 month
- Date: 31st
- End Date: December 31, 2025

## Testing

### Unit Tests

- `TodoForm.recurring.test.tsx`: Form repeat settings functionality
- `api.recurring.test.ts`: API function tests
- `page.test.tsx`: Management screen tests

### Integration Tests

- `integration.test.tsx`: End-to-end workflow tests

### Running Tests

```bash
# Unit tests
npm test TodoForm.recurring
npm test api.recurring
npm test page.test

# Integration tests
npm test integration.test

# All tests
npm test
```

## Future Extension Plans

1. **Template Feature**: Templates for commonly used repeat patterns
2. **Notification Feature**: Notifications for instance generation or task deadlines
3. **Calendar Integration**: Display recurring tasks in calendar screen
4. **Statistics Feature**: Completion rate and trend analysis for recurring tasks
5. **Batch Operations**: Bulk status changes for multiple instances

## Troubleshooting

### Common Issues

1. **Instances Not Generated**
   - Verify backend server is running
   - Check if repeat settings are saved correctly

2. **Weekday Selection Not Saved**
   - Select at least one weekday when WEEKLY is selected
   - Note that Sunday is treated as "7"

3. **Invalid Date in Monthly Settings**
   - Avoid dates that don't exist in some months (e.g., February 31st)
   - Set to 31st if you want month-end

### Debugging

1. Check API requests in browser developer tools
2. Check console errors
3. Review backend logs

## References

- [Backend API Specification](../../personal-hub-backend/docs/API.md#recurring-todo-endpoints-authentication-required)
- [React Hook Form Official Documentation](https://react-hook-form.com/)
- [TanStack Query Official Documentation](https://tanstack.com/query/latest)