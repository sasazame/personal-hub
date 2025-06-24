# Analytics Backend Implementation Checklist

## Quick Implementation Guide for Backend Agent

### Step 1: Create Analytics Service Layer
```java
@Service
public class AnalyticsService {
    
    @Autowired
    private TodoRepository todoRepository;
    
    @Autowired
    private EventRepository eventRepository;
    
    @Autowired
    private NoteRepository noteRepository;
    
    public DashboardAnalytics getDashboardAnalytics(Long userId) {
        // Aggregate all stats and return DashboardAnalytics object
    }
    
    public TodoActivity getTodoActivity(Long userId, LocalDate from, LocalDate to) {
        // Calculate TODO activity metrics
    }
}
```

### Step 2: Create DTOs/Response Classes
```java
public class DashboardAnalytics {
    private TodoStats todoStats;
    private EventStats eventStats;
    private NoteStats noteStats;
    private ProductivityStats productivityStats;
    // constructors, getters, setters
}

public class TodoActivity {
    private List<DailyCount> dailyCompletions;
    private List<DailyCount> dailyCreations;
    private Map<String, Integer> priorityDistribution;
    private Map<String, Integer> statusDistribution;
    private Double averageCompletionTimeInDays;
    // constructors, getters, setters
}

public class DailyCount {
    private String date;
    private Integer count;
    // constructors, getters, setters
}
```

### Step 3: Add Repository Methods
Add these methods to existing repositories:

**TodoRepository additions:**
```java
@Query("SELECT COUNT(t) FROM Todo t WHERE t.user.id = :userId")
Long countByUserId(@Param("userId") Long userId);

@Query("SELECT COUNT(t) FROM Todo t WHERE t.user.id = :userId AND t.status = :status")
Long countByUserIdAndStatus(@Param("userId") Long userId, @Param("status") TodoStatus status);

@Query("SELECT DATE(t.updatedAt) as date, COUNT(t) as count FROM Todo t " +
       "WHERE t.user.id = :userId AND t.status = 'COMPLETED' " +
       "AND t.updatedAt >= :fromDate GROUP BY DATE(t.updatedAt)")
List<Object[]> getDailyCompletions(@Param("userId") Long userId, @Param("fromDate") LocalDateTime fromDate);
```

**EventRepository additions:**
```java
@Query("SELECT COUNT(e) FROM Event e WHERE e.user.id = :userId")
Long countByUserId(@Param("userId") Long userId);

@Query("SELECT COUNT(e) FROM Event e WHERE e.user.id = :userId AND e.startDateTime >= :date")
Long countUpcomingEvents(@Param("userId") Long userId, @Param("date") LocalDateTime date);
```

**NoteRepository additions:**
```java
@Query("SELECT COUNT(n) FROM Note n WHERE n.user.id = :userId")
Long countByUserId(@Param("userId") Long userId);

@Query("SELECT COUNT(n) FROM Note n WHERE n.user.id = :userId AND n.createdAt >= :date")
Long countByUserIdAndCreatedAtAfter(@Param("userId") Long userId, @Param("date") LocalDateTime date);
```

### Step 4: Create Controller
```java
@RestController
@RequestMapping("/api/v1/analytics")
@PreAuthorize("hasRole('USER')")
public class AnalyticsController {
    
    @Autowired
    private AnalyticsService analyticsService;
    
    @GetMapping("/dashboard")
    public ResponseEntity<DashboardAnalytics> getDashboardAnalytics(Authentication auth) {
        Long userId = getCurrentUserId(auth);
        DashboardAnalytics analytics = analyticsService.getDashboardAnalytics(userId);
        return ResponseEntity.ok(analytics);
    }
    
    @GetMapping("/todos/activity")
    public ResponseEntity<TodoActivity> getTodoActivity(
            @RequestParam(defaultValue = "30") int days,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateFrom,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateTo,
            Authentication auth) {
        
        Long userId = getCurrentUserId(auth);
        
        // Set default date range if not provided
        LocalDate endDate = dateTo != null ? dateTo : LocalDate.now();
        LocalDate startDate = dateFrom != null ? dateFrom : endDate.minusDays(days);
        
        TodoActivity activity = analyticsService.getTodoActivity(userId, startDate, endDate);
        return ResponseEntity.ok(activity);
    }
    
    private Long getCurrentUserId(Authentication auth) {
        // Extract user ID from authentication - implement based on your auth system
        return ((UserPrincipal) auth.getPrincipal()).getId();
    }
}
```

### Step 5: Add Tests
```java
@ExtendWith(MockitoExtension.class)
class AnalyticsServiceTest {
    
    @Mock
    private TodoRepository todoRepository;
    
    @InjectMocks
    private AnalyticsService analyticsService;
    
    @Test
    void testGetDashboardAnalytics() {
        // Mock repository responses and test service logic
    }
}

@SpringBootTest
@AutoConfigureTestDatabase
class AnalyticsControllerIntegrationTest {
    
    @Test
    @WithMockUser
    void testGetDashboardAnalytics() {
        // Test full endpoint integration
    }
}
```

## Implementation Priority Order
1. ✅ Create DTOs and response classes
2. ✅ Add repository query methods
3. ✅ Implement AnalyticsService with basic calculations
4. ✅ Create AnalyticsController endpoints
5. ✅ Add comprehensive unit tests
6. ✅ Add integration tests
7. 🔄 Optional: Add Redis caching
8. 🔄 Optional: Add background job for daily stats

## Database Indexes to Add
```sql
-- Optimize analytics queries
CREATE INDEX idx_todos_user_status ON todos(user_id, status);
CREATE INDEX idx_todos_user_updated ON todos(user_id, updated_at);
CREATE INDEX idx_events_user_start ON events(user_id, start_date_time);
CREATE INDEX idx_notes_user_created ON notes(user_id, created_at);
```

## Testing Data Setup
```java
// Use in test setup to create realistic analytics data
@Test
void setupTestData() {
    // Create mix of todos with different statuses and dates
    // Create events spread across different dates
    // Create notes with various creation dates
}
```

## Frontend Integration Points
- Frontend service: `src/services/analytics.ts`
- Frontend hooks: `src/hooks/useAnalytics.ts`
- Frontend components: `src/components/analytics/`
- Frontend page: `src/app/analytics/page.tsx`

## Error Handling Examples
```java
@ExceptionHandler(Exception.class)
public ResponseEntity<ErrorResponse> handleAnalyticsError(Exception e) {
    return ResponseEntity.status(500)
        .body(new ErrorResponse("Analytics calculation failed", e.getMessage()));
}
```

This checklist provides everything needed for quick and efficient implementation of the analytics backend endpoints.