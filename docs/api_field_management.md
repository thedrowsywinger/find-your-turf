# FindYourTurf - API: Field Management

**Scope**: CRUD operations for sports field and facility management
**Related Files**: roles_company_users.md, api_scheduling_system.md, api_pricing_configuration.md
**Last Updated**: 2025-08-20

---

## Overview
Complete field lifecycle management including creation, updates, deletion, and configuration.

## Key Endpoints
- POST /field/create - Create new field
- GET /field/{id} - Get field details
- PUT /field/{id} - Update field
- DELETE /field/{id} - Delete field
- GET /field/list - List fields with filters

## Create Field
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

## Response Format
```json
{
  "statusCode": 201,
  "success": true,
  "message": "Field created successfully",
  "data": {
    "id": 1,
    "name": "Premier Football Ground",
    "description": "Professional football field with artificial turf",
    "address": "123 Sports Avenue",
    "city": "Sportstown",
    "country": "Sportland",
    "sportType": "FOOTBALL",
    "pricePerHour": 100,
    "brandId": 1,
    "createdAt": "2025-04-12T10:00:00Z"
  },
  "errors": null
}
```

## Field List with Filters
```http
GET /field/list?city=Sportstown&sportType=FOOTBALL&minPrice=50&maxPrice=150&date=2025-04-12
```

## Validation Rules
- Name: Required, 3-100 characters
- Description: Required, 10-500 characters
- Address: Required, valid format
- SportType: Must be valid enum value
- PricePerHour: Positive number, max 2 decimal places
- BrandId: Must exist and belong to authenticated user

## Sport Types
- FOOTBALL
- BASKETBALL
- TENNIS
- CRICKET
- BADMINTON
- SWIMMING
- VOLLEYBALL

## Authorization
- Company role required
- Field must belong to authenticated user's brand
- Admin users can manage any field

## Common Errors
- 400: Validation errors (invalid data format)
- 401: Authentication required
- 403: Field doesn't belong to user's brand
- 404: Field not found
- 409: Duplicate field name within brand

## See Also
- api_scheduling_system.md - Field schedule management
- api_pricing_configuration.md - Pricing setup
- roles_company_users.md - User permissions