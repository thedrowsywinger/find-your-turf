# FindYourTurf - System Architecture: Database Schema

**Scope**: Complete database structure including tables, relationships, and indexes
**Related Files**: api_field_management.md, roles_staff_management.md, api_scheduling_system.md
**Last Updated**: 2025-08-20

---

## Overview
PostgreSQL database schema with comprehensive relationships, JSONB columns for flexibility, and optimized indexing.

## Core Entity Relationships
```
Users (1:N) -> Brands -> (1:N) Fields -> (1:N) Schedules
Users (1:N) -> Bookings -> (N:1) Fields
Users (1:N) -> Reviews -> (N:1) Fields
Users (1:N) -> AuditLogs
```

## Users Table
```sql
CREATE TABLE "users" (
    "id" SERIAL PRIMARY KEY,
    "code" varchar(255) UNIQUE NOT NULL,
    "username" varchar(100) UNIQUE NOT NULL,
    "email" varchar(255) UNIQUE NOT NULL,
    "password" varchar(255) NOT NULL,
    "role" user_role_enum NOT NULL DEFAULT 'consumer',
    "permissions" JSONB,
    "parent_user_id" integer,
    "email_verified" boolean DEFAULT false,
    "phone_number" varchar(20),
    "profile_image" varchar(255),
    "last_login" TIMESTAMP,
    "status" integer DEFAULT 1,
    "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY ("parent_user_id") REFERENCES "users"("id") ON DELETE SET NULL
);
```

## Brands Table
```sql
CREATE TABLE "brands" (
    "id" SERIAL PRIMARY KEY,
    "code" varchar(255) UNIQUE NOT NULL,
    "name" varchar(100) NOT NULL,
    "description" text,
    "logo" varchar(255),
    "contact_email" varchar(255),
    "contact_phone" varchar(20),
    "address" text,
    "city" varchar(100),
    "country" varchar(100),
    "website" varchar(255),
    "owner_id" integer NOT NULL,
    "status" integer DEFAULT 1,
    "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY ("owner_id") REFERENCES "users"("id") ON DELETE CASCADE
);
```

## Fields Table
```sql
CREATE TABLE "fields" (
    "id" SERIAL PRIMARY KEY,
    "code" varchar(255) UNIQUE NOT NULL,
    "name" varchar(100) NOT NULL,
    "description" text,
    "address" text NOT NULL,
    "city" varchar(100) NOT NULL,
    "country" varchar(100) NOT NULL,
    "latitude" decimal(10,8),
    "longitude" decimal(11,8),
    "sport_type" sport_type_enum NOT NULL,
    "price_per_hour" decimal(10,2),
    "capacity" integer,
    "amenities" JSONB,
    "images" JSONB,
    "brand_id" integer NOT NULL,
    "status" integer DEFAULT 1,
    "created_by" integer,
    "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updated_by" integer,
    "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY ("brand_id") REFERENCES "brands"("id") ON DELETE CASCADE,
    FOREIGN KEY ("created_by") REFERENCES "users"("id")
);
```

## Field Schedules Table
```sql
CREATE TABLE "field_schedules" (
    "id" SERIAL PRIMARY KEY,
    "code" varchar(255) UNIQUE NOT NULL,
    "field_id" integer NOT NULL,
    "day_of_week" day_of_week_enum,
    "open_time" TIME,
    "close_time" TIME,
    "is_available" boolean DEFAULT true,
    "special_price" decimal(10,2),
    "zone_name" varchar(50),
    "zone_config" JSONB,
    "recurrence_type" recurrence_type_enum DEFAULT 'WEEKLY',
    "recurrence_config" JSONB,
    "time_blocks" JSONB,
    "status" integer DEFAULT 1,
    "created_by" integer,
    "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updated_by" integer,
    "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY ("field_id") REFERENCES "fields"("id") ON DELETE CASCADE,
    FOREIGN KEY ("created_by") REFERENCES "users"("id")
);
```

## Bookings Table
```sql
CREATE TABLE "bookings" (
    "id" SERIAL PRIMARY KEY,
    "code" varchar(255) UNIQUE NOT NULL,
    "field_id" integer NOT NULL,
    "user_id" integer NOT NULL,
    "schedule_id" integer,
    "date" DATE NOT NULL,
    "start_time" TIME NOT NULL,
    "end_time" TIME NOT NULL,
    "duration" integer NOT NULL,
    "zone_name" varchar(50),
    "total_price" decimal(10,2) NOT NULL,
    "payment_status" payment_status_enum DEFAULT 'PENDING',
    "booking_status" booking_status_enum DEFAULT 'PENDING',
    "payment_reference" varchar(255),
    "notes" text,
    "cancellation_reason" text,
    "cancelled_at" TIMESTAMP,
    "status" integer DEFAULT 1,
    "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY ("field_id") REFERENCES "fields"("id") ON DELETE CASCADE,
    FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE,
    FOREIGN KEY ("schedule_id") REFERENCES "field_schedules"("id")
);
```

## Reviews Table
```sql
CREATE TABLE "reviews" (
    "id" SERIAL PRIMARY KEY,
    "code" varchar(255) UNIQUE NOT NULL,
    "field_id" integer NOT NULL,
    "user_id" integer NOT NULL,
    "booking_id" integer NOT NULL,
    "rating" integer CHECK (rating >= 1 AND rating <= 5),
    "comment" text,
    "tags" JSONB,
    "company_response" text,
    "responded_at" TIMESTAMP,
    "review_status" review_status_enum DEFAULT 'PUBLISHED',
    "status" integer DEFAULT 1,
    "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY ("field_id") REFERENCES "fields"("id") ON DELETE CASCADE,
    FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE,
    FOREIGN KEY ("booking_id") REFERENCES "bookings"("id") ON DELETE CASCADE,
    UNIQUE("booking_id") -- One review per booking
);
```

## Audit Logs Table
```sql
CREATE TABLE "audit_logs" (
    "id" SERIAL PRIMARY KEY,
    "code" varchar(255) NOT NULL,
    "user_id" integer,
    "field_id" integer,
    "brand_id" integer,
    "action" audit_action_type_enum NOT NULL,
    "details" JSONB NOT NULL,
    "ip_address" inet,
    "user_agent" varchar(255),
    "timestamp" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" integer NOT NULL DEFAULT 1,
    
    FOREIGN KEY ("user_id") REFERENCES "users"("id"),
    FOREIGN KEY ("field_id") REFERENCES "fields"("id"),
    FOREIGN KEY ("brand_id") REFERENCES "brands"("id")
);
```

## Enumerations
```sql
CREATE TYPE user_role_enum AS ENUM (
    'admin',
    'company',
    'consumer',
    'facility_manager',
    'maintenance_staff',
    'customer_service'
);

CREATE TYPE sport_type_enum AS ENUM (
    'FOOTBALL',
    'BASKETBALL',
    'TENNIS',
    'CRICKET',
    'BADMINTON',
    'SWIMMING',
    'VOLLEYBALL'
);

CREATE TYPE day_of_week_enum AS ENUM (
    'MONDAY',
    'TUESDAY',
    'WEDNESDAY',
    'THURSDAY',
    'FRIDAY',
    'SATURDAY',
    'SUNDAY'
);

CREATE TYPE recurrence_type_enum AS ENUM (
    'DAILY',
    'WEEKLY',
    'BIWEEKLY',
    'MONTHLY',
    'CUSTOM'
);

CREATE TYPE booking_status_enum AS ENUM (
    'PENDING',
    'CONFIRMED',
    'CANCELLED',
    'COMPLETED',
    'NO_SHOW'
);

CREATE TYPE payment_status_enum AS ENUM (
    'PENDING',
    'PAID',
    'FAILED',
    'REFUNDED'
);
```

## Performance Indexes
```sql
-- User indexes
CREATE INDEX "IDX_users_email" ON "users" ("email");
CREATE INDEX "IDX_users_role" ON "users" ("role");
CREATE INDEX "IDX_users_parent_user_id" ON "users" ("parent_user_id");

-- Field indexes
CREATE INDEX "IDX_fields_brand_id" ON "fields" ("brand_id");
CREATE INDEX "IDX_fields_city_sport" ON "fields" ("city", "sport_type");
CREATE INDEX "IDX_fields_location" ON "fields" ("latitude", "longitude");
CREATE INDEX "IDX_fields_price" ON "fields" ("price_per_hour");

-- Booking indexes
CREATE INDEX "IDX_bookings_field_date" ON "bookings" ("field_id", "date");
CREATE INDEX "IDX_bookings_user_id" ON "bookings" ("user_id");
CREATE INDEX "IDX_bookings_date_time" ON "bookings" ("date", "start_time");
CREATE INDEX "IDX_bookings_status" ON "bookings" ("booking_status");

-- Review indexes
CREATE INDEX "IDX_reviews_field_id" ON "reviews" ("field_id");
CREATE INDEX "IDX_reviews_rating" ON "reviews" ("rating");
CREATE INDEX "IDX_reviews_created_at" ON "reviews" ("created_at");

-- Audit log indexes
CREATE INDEX "IDX_audit_logs_timestamp" ON "audit_logs" ("timestamp");
CREATE INDEX "IDX_audit_logs_action" ON "audit_logs" ("action");
CREATE INDEX "IDX_audit_logs_user_id" ON "audit_logs" ("user_id");

-- JSONB indexes
CREATE INDEX "IDX_fields_amenities" ON "fields" USING GIN ("amenities");
CREATE INDEX "IDX_schedules_zone_config" ON "field_schedules" USING GIN ("zone_config");
CREATE INDEX "IDX_users_permissions" ON "users" USING GIN ("permissions");
```

## JSONB Column Structures

### Field Amenities
```json
{
  "parking": true,
  "changing_rooms": true,
  "equipment_rental": false,
  "floodlights": true,
  "water_station": true,
  "first_aid": true,
  "spectator_seating": false
}
```

### Zone Configuration
```json
{
  "capacity": 20,
  "description": "North half of the main football field",
  "amenities": ["Floodlights", "Water Station"],
  "pricing": {
    "basePrice": 150.00,
    "peakHours": ["18:00-22:00"]
  }
}
```

### Time Blocks
```json
[
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
```

## Database Constraints
- Unique constraints on email, username, codes
- Foreign key constraints with appropriate cascading
- Check constraints on ratings (1-5)
- Not null constraints on required fields

## See Also
- api_field_management.md - Field-related tables
- roles_staff_management.md - User and permission tables
- api_scheduling_system.md - Schedule table structure