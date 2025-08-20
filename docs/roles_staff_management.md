# FindYourTurf - User Roles: Staff Management System

**Scope**: Sub-account management and permissions for facility staff members
**Related Files**: roles_company_users.md, auth_security.md, api_standards.md
**Last Updated**: 2025-08-20

---

## Overview
Staff management allows facility owners to create sub-accounts with specific permissions and comprehensive audit logging.

## Staff Roles
```typescript
enum UserRole {
  FACILITY_MANAGER = 'facility_manager',
  MAINTENANCE_STAFF = 'maintenance_staff',
  CUSTOMER_SERVICE = 'customer_service'
}
```

## Permission Schema
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

## Create Staff User
```http
POST /api/v1/users/staff
Authorization: Bearer {jwt_token}
{
  "username": "facility_manager1",
  "email": "manager@example.com",
  "password": "SecurePassword123",
  "role": "facility_manager",
  "permissions": {
    "canManageStaff": true,
    "canManageBookings": true,
    "canUpdateSchedules": true,
    "canRespondToReviews": true,
    "canAccessReports": true,
    "canUpdatePricing": true,
    "canModifyFacilities": true
  }
}
```

## Default Role Configurations

### Facility Manager
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

### Maintenance Staff
```typescript
{
  canUpdateSchedules: true
  // All other permissions: false
}
```

### Customer Service
```typescript
{
  canManageBookings: true,
  canRespondToReviews: true,
  canAccessReports: true
  // All other permissions: false
}
```

## Audit Logging
```typescript
enum AuditActionType {
  BOOKING_CREATED = 'booking_created',
  BOOKING_UPDATED = 'booking_updated',
  SCHEDULE_UPDATED = 'schedule_updated',
  STAFF_ADDED = 'staff_added',
  STAFF_UPDATED = 'staff_updated',
  PRICING_UPDATED = 'pricing_updated'
}
```

## Staff Management Endpoints
- GET /api/v1/users/staff - List all staff
- GET /api/v1/users/staff/{staffId} - Get staff details
- PUT /api/v1/users/staff/{staffId} - Update staff
- DELETE /api/v1/users/staff/{staffId} - Remove staff
- GET /api/v1/users/audit-logs - Get audit logs

## Authorization Flow
- Admin and Company users bypass permission checks
- Staff members require specific permissions
- Permission validation occurs at endpoint level
- Failed permission attempts are logged

## See Also
- roles_company_users.md - Parent company accounts
- auth_security.md - Authentication details
- api_standards.md - Response formats