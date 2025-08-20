# FindYourTurf - API: Multi-Tier Scheduling System

**Scope**: Advanced scheduling features including zones, time blocks, and recurrence patterns
**Related Files**: api_field_management.md, api_booking_flow.md, api_multi_tier_scheduling.md
**Last Updated**: 2025-08-20

---

## Overview
Flexible scheduling system supporting zone-based booking, time block segmentation, and complex recurrence patterns.

## Key Features
- Zone Management (field subdivisions)
- Time Block System (granular time control)
- Recurrence Patterns (5 types)
- Capacity Management
- Dynamic Pricing

## Basic Schedule Creation
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

## Zone-Based Schedule
```typescript
{
  "dayOfWeek": "MONDAY",
  "openTime": "09:00:00",
  "closeTime": "22:00:00",
  "zoneName": "North Half",
  "zoneConfig": {
    "capacity": 15,
    "description": "North half of the main football field",
    "amenities": ["Floodlights", "Water Station"]
  },
  "recurrenceType": "WEEKLY"
}
```

## Time Blocks Configuration
```typescript
{
  "openTime": "09:00:00",
  "closeTime": "22:00:00",
  "timeBlocks": [
    {
      "startTime": "09:00:00",
      "endTime": "12:00:00",
      "price": 80.00,
      "capacity": 20
    },
    {
      "startTime": "17:00:00",
      "endTime": "22:00:00",
      "price": 120.00,
      "capacity": 20
    }
  ]
}
```

## Recurrence Types

### Daily Recurrence
```typescript
{
  "recurrenceType": "DAILY",
  "recurrenceConfig": {
    "interval": 2  // Every 2 days
  }
}
```

### Monthly Recurrence
```typescript
{
  "recurrenceType": "MONTHLY",
  "recurrenceConfig": {
    "monthlyDays": [1, 15, 28]  // 1st, 15th, 28th of each month
  }
}
```

### Custom Recurrence
```typescript
{
  "recurrenceType": "CUSTOM",
  "recurrenceConfig": {
    "daysOfWeek": ["monday", "wednesday", "friday"],
    "endDate": "2025-12-31",
    "exceptions": ["2025-12-25", "2026-01-01"]
  }
}
```

## Validation Rules
- Time blocks must be within operating hours
- No overlapping blocks allowed
- End time must be after start time
- Times must be in HH:mm:ss format
- Capacity must be positive integer
- Monthly days must be 1-31

## Database Schema
```sql
CREATE TABLE field_schedules (
    id SERIAL PRIMARY KEY,
    field_id INTEGER REFERENCES fields(id),
    day_of_week day_of_week_enum,
    open_time TIME,
    close_time TIME,
    zone_name VARCHAR(50),
    zone_config JSONB,
    recurrence_type recurrence_type_enum DEFAULT 'WEEKLY',
    recurrence_config JSONB,
    time_blocks JSONB,
    status INTEGER DEFAULT 1
);
```

## Common Errors
- "Time blocks must be within schedule operating hours"
- "Invalid time format"
- "Overlapping time blocks detected"
- "Invalid recurrence configuration"
- "Invalid monthly days"
- "Duplicate zone name"

## See Also
- api_field_management.md - Field CRUD operations
- api_booking_flow.md - Booking against schedules
- api_multi_tier_scheduling.md - Advanced scheduling features