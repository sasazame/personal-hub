# Analytics Backend Endpoints Implementation Guide

## Overview
The frontend analytics system requires backend API endpoints to provide aggregated data for productivity insights and statistical analysis. This document outlines the specific endpoints needed to support the analytics dashboard functionality.

## Required Endpoints

### 1. Dashboard Analytics Endpoint

**Endpoint**: `GET /api/v1/analytics/dashboard`
**Authentication**: JWT Bearer Token required
**Description**: Provides comprehensive analytics data for the main dashboard

**Response Structure**:
```json
{
  "todoStats": {
    "totalTodos": 150,
    "completedTodos": 89,
    "inProgressTodos": 25,
    "pendingTodos": 30,
    "completionRate": 59.33,
    "overdueCount": 6
  },
  "eventStats": {
    "totalEvents": 45,
    "upcomingEvents": 12,
    "pastEvents": 30,
    "todayEvents": 3
  },
  "noteStats": {
    "totalNotes": 78,
    "notesThisWeek": 12,
    "notesThisMonth": 34,
    "totalTags": 23
  },
  "productivityStats": {
    "dailyTodoCompletions": [
      {"date": "2024-01-15", "count": 5},
      {"date": "2024-01-16", "count": 8}
    ],
    "dailyEventCounts": [
      {"date": "2024-01-15", "count": 2},
      {"date": "2024-01-16", "count": 4}
    ],
    "dailyNoteCreations": [
      {"date": "2024-01-15", "count": 3},
      {"date": "2024-01-16", "count": 1}
    ],
    "weeklyProductivityScore": 85.6
  }
}
```

### 2. TODO Activity Analytics Endpoint

**Endpoint**: `GET /api/v1/analytics/todos/activity`
**Authentication**: JWT Bearer Token required
**Description**: Provides detailed TODO activity metrics for productivity analysis

**Query Parameters**:
- `days` (optional): Number of days to analyze (default: 30)
- `dateFrom` (optional): Start date in ISO format
- `dateTo` (optional): End date in ISO format

**Response Structure**:
```json
{
  "dailyCompletions": [
    {"date": "2024-01-15", "count": 5},
    {"date": "2024-01-16", "count": 8}
  ],
  "dailyCreations": [
    {"date": "2024-01-15", "count": 3},
    {"date": "2024-01-16", "count": 4}
  ],
  "priorityDistribution": {
    "HIGH": 45,
    "MEDIUM": 78,
    "LOW": 27
  },
  "statusDistribution": {
    "PENDING": 30,
    "IN_PROGRESS": 25,
    "COMPLETED": 89,
    "CANCELLED": 6
  },
  "averageCompletionTimeInDays": 3.2
}
```

## Database Query Requirements

### TODO Statistics Queries
```sql
-- Total counts by status
SELECT status, COUNT(*) FROM todos WHERE user_id = ? GROUP BY status;

-- Completion rate calculation
SELECT 
  COUNT(*) as total,
  SUM(CASE WHEN status = 'COMPLETED' THEN 1 ELSE 0 END) as completed
FROM todos WHERE user_id = ?;

-- Overdue todos
SELECT COUNT(*) FROM todos 
WHERE user_id = ? AND due_date < CURRENT_DATE AND status != 'COMPLETED';

-- Daily completions (last 30 days)
SELECT 
  DATE(updated_at) as date,
  COUNT(*) as count
FROM todos 
WHERE user_id = ? 
  AND status = 'COMPLETED' 
  AND updated_at >= DATE_SUB(CURRENT_DATE, INTERVAL 30 DAY)
GROUP BY DATE(updated_at)
ORDER BY date;
```

### Event Statistics Queries
```sql
-- Event counts by time period
SELECT 
  COUNT(*) as total,
  SUM(CASE WHEN start_date_time >= CURRENT_DATE THEN 1 ELSE 0 END) as upcoming,
  SUM(CASE WHEN DATE(start_date_time) = CURRENT_DATE THEN 1 ELSE 0 END) as today
FROM events WHERE user_id = ?;

-- Daily event counts
SELECT 
  DATE(start_date_time) as date,
  COUNT(*) as count
FROM events 
WHERE user_id = ? 
  AND start_date_time >= DATE_SUB(CURRENT_DATE, INTERVAL 30 DAY)
GROUP BY DATE(start_date_time);
```

### Note Statistics Queries
```sql
-- Note counts by time period
SELECT 
  COUNT(*) as total,
  SUM(CASE WHEN created_at >= DATE_SUB(CURRENT_DATE, INTERVAL 7 DAY) THEN 1 ELSE 0 END) as this_week,
  SUM(CASE WHEN created_at >= DATE_SUB(CURRENT_DATE, INTERVAL 30 DAY) THEN 1 ELSE 0 END) as this_month
FROM notes WHERE user_id = ?;

-- Daily note creations
SELECT 
  DATE(created_at) as date,
  COUNT(*) as count
FROM notes 
WHERE user_id = ? 
  AND created_at >= DATE_SUB(CURRENT_DATE, INTERVAL 30 DAY)
GROUP BY DATE(created_at);
```

## Implementation Notes

### Security
- All endpoints require JWT authentication
- Ensure user can only access their own analytics data
- Add rate limiting for analytics endpoints

### Performance Optimization
- Consider implementing Redis caching with 1-hour TTL
- Use database indexes on `user_id`, `created_at`, `updated_at`, `status`
- Implement background jobs for daily stats pre-computation

### Error Handling
- Return HTTP 401 for unauthorized requests
- Return HTTP 403 if user tries to access other user's data
- Return HTTP 500 with proper error messages for database failures
- Handle empty datasets gracefully (return zeros, not null)

### Data Aggregation Logic
```java
// Productivity score calculation example
double productivityScore = (completedTodos / totalTodos) * 100 * 
                          (1 - (overdueTodos / totalTodos)) * 
                          Math.min(1.0, averageTasksPerDay / targetTasksPerDay);
```

## Testing Requirements

### Unit Tests
- Test analytics calculations with mock data
- Verify proper user data isolation
- Test date range filtering
- Test empty dataset handling

### Integration Tests
- Test full endpoint responses
- Verify database query performance
- Test caching behavior
- Test authentication and authorization

## Example Controller Structure (Spring Boot)

```java
@RestController
@RequestMapping("/api/v1/analytics")
@PreAuthorize("hasRole('USER')")
public class AnalyticsController {
    
    @GetMapping("/dashboard")
    public ResponseEntity<DashboardAnalytics> getDashboardAnalytics(
            Authentication auth) {
        // Implementation here
    }
    
    @GetMapping("/todos/activity")
    public ResponseEntity<TodoActivity> getTodoActivity(
            @RequestParam(defaultValue = "30") int days,
            @RequestParam(required = false) String dateFrom,
            @RequestParam(required = false) String dateTo,
            Authentication auth) {
        // Implementation here
    }
}
```

## Dependencies
- Requires TODO, Calendar, and Notes entities to be implemented
- Requires user authentication system
- Requires database with proper indexing
- Optional: Redis for caching

## Priority: Medium
This feature enhances user experience but is not critical for core functionality.