# FindYourTurf - User Roles: Company Users (Field Providers)

**Scope**: Field providers and facility managers who list and manage sports venues on the platform
**Related Files**: roles_staff_management.md, api_field_management.md, api_scheduling_system.md
**Last Updated**: 2025-08-20

---

## Overview
Company users are field owners and sports facility managers who can list and manage their venues, handle bookings, and respond to customer reviews.

## Key Features
- Field Management (CRUD operations)
- Booking Management and oversight
- Review responses
- Usage reporting
- Staff account management
- Pricing configuration

## Field Creation
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

## Schedule Management
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

## Authorization Requirements
- Protected with @Roles(UserRole.COMPANY)
- JWT token required for all operations
- Brand-specific access controls

## Common Errors
- 401: Invalid or expired JWT token
- 403: Insufficient permissions
- 400: Invalid field data format

## See Also
- roles_staff_management.md - Staff account management
- api_field_management.md - Detailed field CRUD operations
- api_scheduling_system.md - Advanced scheduling features