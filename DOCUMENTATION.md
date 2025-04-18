# FindYourTurf - Documentation

## Overview
FindYourTurf is a comprehensive sports facility booking platform that connects facility owners with users looking to book sports venues. The system is built using NestJS and implements secure JWT-based authentication with role-based access control.

## User Roles and Capabilities

### 1. Company Users (Field Providers)
Field owners and sports facility managers who can list and manage their venues.

#### Key Features:
- Field Management
  - Create, update, and delete field listings
  - Set field details (name, description, location, sport type)
  - Manage pricing configurations
  - Define availability schedules
- Booking Management
  - View upcoming and past bookings
  - Respond to user reviews
  - Generate usage reports

#### Sample Workflows:

##### Creating a New Field
```http
POST /field/create
Authorization: Bearer {jwt_token}
{
  "name": "Premier Football Ground",
  "description": "Professional football field with artificial turf",
  "address": "123 Sports Avenue",
  "city": "Sportstown",
  "country": "Sportland",
  "sportType": "FOOTBALL",
  "pricePerHour": 100,
  "brandId": 1
}
```

##### Setting Field Schedule
```http
POST /field/{fieldId}/schedules
{
  "dayOfWeek": "MONDAY",
  "openTime": "09:00:00",
  "closeTime": "22:00:00",
  "isAvailable": true,
  "specialPrice": 80
}
```

### 2. Consumer Users
End users who search for and book sports facilities.

#### Key Features:
- Search & Discovery
  - Search fields by location, sport type, availability
  - Filter by price range, ratings, and amenities
  - View field details and availability
- Booking Management
  - Create and manage bookings
  - View booking history
  - Cancel or reschedule bookings
- Reviews & Ratings
  - Submit reviews after using facilities
  - Rate their experience

#### Sample Workflows:

##### Searching for Fields
```http
GET /field/list?city=Sportstown&sportType=FOOTBALL&minPrice=50&maxPrice=150&date=2025-04-12
```

Response includes:
- Field details
- Availability
- Pricing
- Reviews and ratings

##### Creating a Booking
```http
POST /booking/create
{
  "fieldId": 1,
  "date": "2025-04-12",
  "startTime": "14:00:00",
  "duration": 60
}
```

### 3. Admin Users
System administrators who manage and oversee the platform.

#### Key Features:
- User Management
  - View and manage all users
  - Handle user suspensions/bans
  - Resolve disputes
- Content Moderation
  - Monitor field listings
  - Review and moderate user reviews
  - Handle reported content
- System Configuration
  - Manage rate limits
  - Configure security parameters
  - Monitor system performance

## API Response Format
All API endpoints follow a standardized response format:
```json
{
  "statusCode": number,
  "success": boolean,
  "message": "string",
  "data": object|null,
  "errors": string[]|null
}
```

## Security Features

### Authentication
- JWT-based authentication
- Access tokens (short-lived)
- Refresh tokens (long-lived, secure storage)
- Secure token validation and refresh mechanisms

### Rate Limiting
- Default: 100 requests per minute
- Auth endpoints: 5 requests per minute
- Configurable limits for different endpoints

### RBAC (Role-Based Access Control)
- Company-specific endpoints protected with @Roles(UserRole.COMPANY)
- Consumer-specific features accessible to authenticated users
- Admin endpoints restricted to administrative users

## Field Management

### Scheduling System
Fields can be configured with:
- Regular weekly schedules
- Special time slots
- Custom pricing for specific periods
- Availability windows

### Pricing Configuration
Support for:
- Base hourly rates
- Special time slot pricing
- Duration-based pricing
- Seasonal variations

### Review System
- Users can submit reviews after confirmed bookings
- Rating system (1-5 stars)
- Written reviews
- Company responses to reviews

## Multi-Tier Scheduling System

### Overview
The multi-tier scheduling system provides flexible and powerful scheduling capabilities for sports facilities. It supports zone-based scheduling, time block segmentation, and advanced recurrence patterns.

### Components

#### 1. Zone Management
Zones allow field owners to divide their facilities into separate areas, each with its own:
- Capacity limits
- Amenities list
- Description
- Independent pricing

Example use cases:
- Half-field bookings for football fields
- Individual court assignments for tennis complexes
- Specific areas for different activities in multi-purpose facilities

#### 2. Time Block System
Time blocks provide granular control over facility usage within a schedule:
- Multiple blocks within operating hours
- Block-specific pricing
- Independent capacity settings
- Automatic validation against operating hours

Example configuration:
```typescript
{
  openTime: "09:00:00",
  closeTime: "22:00:00",
  timeBlocks: [
    {
      startTime: "09:00:00",
      endTime: "12:00:00",
      price: 80.00,
      capacity: 20
    },
    {
      startTime: "12:00:00",
      endTime: "17:00:00",
      price: 100.00,
      capacity: 25
    },
    {
      startTime: "17:00:00",
      endTime: "22:00:00",
      price: 120.00,
      capacity: 20
    }
  ]
}
```

#### 3. Recurrence Patterns
Five types of recurrence patterns are supported:

1. **Daily Recurrence**
   - Repeat every N days
   - Example: Every 2 days
   ```typescript
   {
     recurrenceType: "DAILY",
     recurrenceConfig: {
       interval: 2
     }
   }
   ```

2. **Weekly Recurrence**
   - Standard weekly schedule
   - Default pattern
   ```typescript
   {
     recurrenceType: "WEEKLY"
   }
   ```

3. **Biweekly Recurrence**
   - Alternate week schedules
   ```typescript
   {
     recurrenceType: "BIWEEKLY"
   }
   ```

4. **Monthly Recurrence**
   - Specific days of each month
   ```typescript
   {
     recurrenceType: "MONTHLY",
     recurrenceConfig: {
       monthlyDays: [1, 15, 28] // Occurs on 1st, 15th, and 28th of each month
     }
   }
   ```

5. **Custom Recurrence**
   - Complex patterns with exceptions
   - Specific days of week
   - Date range limits
   ```typescript
   {
     recurrenceType: "CUSTOM",
     recurrenceConfig: {
       daysOfWeek: ["monday", "wednesday", "friday"],
       endDate: "2025-12-31",
       exceptions: ["2025-12-25", "2026-01-01"]
     }
   }
   ```

### Validation Rules

1. **Time Block Validation**
   - All blocks must be within schedule operating hours
   - No overlapping blocks allowed
   - End time must be after start time
   - Times must be in HH:mm:ss format

2. **Recurrence Validation**
   - Daily interval must be positive integer
   - Monthly days must be 1-31
   - Dates must be valid ISO format
   - End date must be in future
   - Exception dates must be valid

3. **Zone Validation**
   - Zone capacity must be positive integer
   - Amenities must be string array
   - Zone names must be unique per field

### Database Schema

The scheduling system uses a combination of JSON columns and standard fields:

```sql
CREATE TABLE field_schedules (
    id SERIAL PRIMARY KEY,
    code VARCHAR(255),
    field_id INTEGER REFERENCES fields(id),
    day_of_week day_of_week_enum,
    open_time TIME,
    close_time TIME,
    is_available BOOLEAN DEFAULT true,
    special_price DECIMAL(10,2),
    zone_name VARCHAR(50),
    zone_config JSONB,
    recurrence_type recurrence_type_enum DEFAULT 'WEEKLY',
    recurrence_config JSONB,
    time_blocks JSONB,
    status INTEGER DEFAULT 1,
    created_by INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_by INTEGER,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Usage Examples

1. **Creating a Half-Field Schedule**
```typescript
const schedule = {
  dayOfWeek: "MONDAY",
  openTime: "09:00:00",
  closeTime: "22:00:00",
  zoneName: "North Half",
  zoneConfig: {
    capacity: 15,
    description: "North half of the main football field",
    amenities: ["Floodlights", "Water Station"]
  },
  timeBlocks: [
    {
      startTime: "09:00:00",
      endTime: "17:00:00",
      price: 80.00
    },
    {
      startTime: "17:00:00",
      endTime: "22:00:00",
      price: 100.00
    }
  ],
  recurrenceType: "WEEKLY"
};
```

2. **Monthly Training Schedule**
```typescript
const schedule = {
  dayOfWeek: "SATURDAY",
  openTime: "10:00:00",
  closeTime: "16:00:00",
  recurrenceType: "MONTHLY",
  recurrenceConfig: {
    monthlyDays: [1, 15], // 1st and 15th of each month
  },
  timeBlocks: [
    {
      startTime: "10:00:00",
      endTime: "16:00:00",
      capacity: 30,
      price: 150.00
    }
  ]
};
```

### Error Handling

The system provides detailed error messages for various validation scenarios:

1. **Time Block Errors**
   - "Time blocks must be within schedule operating hours"
   - "Invalid time format"
   - "Overlapping time blocks detected"

2. **Recurrence Errors**
   - "Invalid recurrence configuration"
   - "Invalid interval value"
   - "Invalid monthly days"
   - "Invalid date format"

3. **Zone Errors**
   - "Invalid zone capacity"
   - "Duplicate zone name"

### Best Practices

1. **Zone Management**
   - Keep zone names consistent across schedules
   - Use descriptive zone names
   - Document zone amenities clearly

2. **Time Blocks**
   - Avoid too many small blocks
   - Consider transition times between blocks
   - Use consistent pricing tiers

3. **Recurrence Patterns**
   - Start with simpler patterns
   - Use exceptions for holidays
   - Document special schedules

4. **Validation**
   - Always validate user input
   - Check for schedule conflicts
   - Verify capacity limits

### Performance Considerations

1. **Database Optimization**
   - Indexes on commonly queried fields
   - JSONB for flexible storage
   - Partitioning for large datasets

2. **Query Optimization**
   - Efficient date range queries
   - Caching common schedules
   - Batch schedule creation

3. **Scalability**
   - Horizontal scaling support
   - Efficient conflict detection
   - Optimized validation logic

## Staff Management System

### Overview
The staff management system provides facility owners with the ability to create and manage sub-accounts with varying levels of permissions. It includes comprehensive audit logging and role-based access control.

### Technical Components

#### 1. Staff Roles
```typescript
enum UserRole {
  ADMIN = 'admin',
  COMPANY = 'company',
  CONSUMER = 'consumer',
  FACILITY_MANAGER = 'facility_manager',
  MAINTENANCE_STAFF = 'maintenance_staff',
  CUSTOMER_SERVICE = 'customer_service'
}
```

#### 2. Permission Schema
```typescript
interface StaffPermissions {
  canManageStaff?: boolean;
  canManageBookings?: boolean;
  canUpdateSchedules?: boolean;
  canRespondToReviews?: boolean;
  canAccessReports?: boolean;
  canUpdatePricing?: boolean;
  canModifyFacilities?: boolean;
}
```

#### 3. Audit Action Types
```typescript
enum AuditActionType {
  BOOKING_CREATED = 'booking_created',
  BOOKING_UPDATED = 'booking_updated',
  BOOKING_CANCELLED = 'booking_cancelled',
  SCHEDULE_CREATED = 'schedule_created',
  SCHEDULE_UPDATED = 'schedule_updated',
  SCHEDULE_DELETED = 'schedule_deleted',
  PRICING_UPDATED = 'pricing_updated',
  STAFF_ADDED = 'staff_added',
  STAFF_UPDATED = 'staff_updated',
  STAFF_REMOVED = 'staff_removed',
  FACILITY_UPDATED = 'facility_updated',
  REVIEW_RESPONSE = 'review_response',
  MAINTENANCE_LOG = 'maintenance_log',
  CUSTOMER_SERVICE_ACTION = 'customer_service_action'
}
```

### Database Schema

#### Staff Management Tables

1. Users Table Extensions:
```sql
ALTER TABLE "users" 
ADD COLUMN "permissions" JSONB,
ADD COLUMN "parent_user_id" integer;

ALTER TABLE "users"
ADD CONSTRAINT "FK_users_parent_user" 
FOREIGN KEY ("parent_user_id") 
REFERENCES "users"("id") ON DELETE SET NULL;
```

2. Audit Logs Table:
```sql
CREATE TABLE "audit_logs" (
    "id" SERIAL PRIMARY KEY,
    "code" varchar(255) NOT NULL,
    "user_id" integer REFERENCES users(id),
    "field_id" integer REFERENCES fields(id),
    "brand_id" integer REFERENCES brands(id),
    "action" audit_action_type_enum NOT NULL,
    "details" JSONB NOT NULL,
    "ip_address" inet,
    "user_agent" varchar(255),
    "timestamp" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" integer NOT NULL DEFAULT 1
);
```

### Authentication & Authorization Flow

1. **Permission Validation:**
```typescript
@Injectable()
export class StaffPermissionsGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Validate required permissions against user's assigned permissions
    // Company owners bypass permission checks
    // Staff members must have explicitly granted permissions
  }
}
```

2. **Permission Decorator Usage:**
```typescript
@RequirePermissions('canUpdateSchedules', 'canModifyFacilities')
async updateFieldDetails() {
  // Only accessible to users with both permissions
}
```

### Audit Logging Implementation

1. **Creating Audit Logs:**
```typescript
async createAuditLog(action: AuditActionType, userId: number, details: any) {
  const log = {
    userId,
    action,
    details,
    timestamp: new Date(),
    ipAddress: request.ip,
    userAgent: request.headers['user-agent']
  };
  await this.auditLogsRepository.save(log);
}
```

2. **Log Detail Structure:**
```typescript
interface AuditLogDetails {
  previousState?: any;
  newState?: any;
  description?: string;
  metadata?: {
    targetId?: number;
    changes?: object;
    additional?: any;
  };
  error?: {
    message: string;
    stack: string;
    timestamp: Date;
  };
}
```

### Default Role Configurations

1. **Facility Manager:**
```typescript
{
  canManageStaff: true,
  canManageBookings: true,
  canUpdateSchedules: true,
  canRespondToReviews: true,
  canAccessReports: true,
  canUpdatePricing: true,
  canModifyFacilities: true
}
```

2. **Maintenance Staff:**
```typescript
{
  canManageStaff: false,
  canManageBookings: false,
  canUpdateSchedules: true,
  canRespondToReviews: false,
  canAccessReports: false,
  canUpdatePricing: false,
  canModifyFacilities: false
}
```

3. **Customer Service:**
```typescript
{
  canManageStaff: false,
  canManageBookings: true,
  canUpdateSchedules: false,
  canRespondToReviews: true,
  canAccessReports: true,
  canUpdatePricing: false,
  canModifyFacilities: false
}
```

### Performance Optimizations

1. **Database Indexes:**
```sql
CREATE INDEX "IDX_audit_logs_timestamp" ON "audit_logs" ("timestamp");
CREATE INDEX "IDX_audit_logs_action" ON "audit_logs" ("action");
CREATE INDEX "IDX_audit_logs_user_id" ON "audit_logs" ("user_id");
CREATE INDEX "IDX_users_parent_user_id" ON "users" ("parent_user_id");
```

2. **Query Optimizations:**
- Use QueryBuilder for complex staff queries
- Implement JSONB indexing for permission queries
- Efficient audit log retrieval with pagination

### Error Handling

1. **Permission Errors:**
```typescript
try {
  await validatePermissions(user, requiredPermissions);
} catch (error) {
  await this.createAuditLog(AuditActionType.PERMISSION_DENIED, user.id, {
    attempted: requiredPermissions,
    error: error.message
  });
  throw new UnauthorizedException('Insufficient permissions');
}
```

2. **Audit Log Failures:**
```typescript
try {
  await this.createAuditLog(action, userId, details);
} catch (logError) {
  // Fallback to file-based logging
  this.loggingService.error('Failed to create audit log:', logError.stack);
}
```

### Testing Guidelines

1. **Unit Tests:**
- Test permission validation logic
- Verify audit log creation
- Check role-based access control

2. **Integration Tests:**
- Test staff member creation flow
- Verify permission inheritance
- Validate audit log queries

3. **Security Tests:**
- Test permission bypass attempts
- Verify audit log integrity
- Check cross-account access prevention

### Best Practices

1. **Permission Management:**
- Use principle of least privilege
- Regularly audit staff permissions
- Document permission changes

2. **Audit Logging:**
- Log all security-relevant actions
- Include detailed context
- Implement log rotation

3. **Staff Accounts:**
- Enforce strong password policies
- Regular permission reviews
- Automatic inactive account cleanup

## Error Handling
The system implements comprehensive error handling:
- Validation errors
- Authentication errors
- Business logic errors
- System errors

All errors return appropriate HTTP status codes and detailed error messages.

## Data Validation
- Input validation using DTOs
- Request parameter validation
- Data sanitization
- Type checking and conversion

## Monitoring and Logging
- Audit logging for critical operations
- Error logging
- Performance monitoring
- Security event logging

## Best Practices for Integration

### Authentication
Always include the JWT token in the Authorization header:
```http
Authorization: Bearer {your_jwt_token}
```

### Error Handling
Always check the response format for potential errors:
```json
{
  "statusCode": 400,
  "success": false,
  "message": "Error message",
  "data": null,
  "errors": ["Detailed error explanation"]
}
```

### Pagination
When retrieving lists, use pagination parameters:
```http
GET /endpoint?page=1&limit=10
```

## API Documentation
Complete API documentation is available at:
```
http://your-server:port/api/docs
```
This Swagger documentation provides detailed information about all endpoints, request/response formats, and authentication requirements.