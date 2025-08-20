# FindYourTurf - System Architecture: API Standards

**Scope**: Standardized response formats, error handling, and validation patterns
**Related Files**: auth_security.md, performance_monitoring.md, error_handling_guide.md
**Last Updated**: 2025-08-20

---

## Overview
Consistent API design patterns, response formats, error handling, and validation standards across all endpoints.

## Standard Response Format
All API endpoints follow this standardized response structure:
```json
{
  "statusCode": number,
  "success": boolean,
  "message": "string",
  "data": object|null,
  "errors": string[]|null
}
```

## Success Response Examples
```json
{
  "statusCode": 200,
  "success": true,
  "message": "Data retrieved successfully",
  "data": {
    "id": 123,
    "name": "Premier Football Ground"
  },
  "errors": null
}
```

## Error Response Examples
```json
{
  "statusCode": 400,
  "success": false,
  "message": "Validation failed",
  "data": null,
  "errors": [
    "Name must be between 3 and 100 characters",
    "Price per hour must be a positive number"
  ]
}
```

## HTTP Status Code Usage

### Success Codes
- 200 OK: Successful GET, PUT operations
- 201 Created: Successful POST operations
- 204 No Content: Successful DELETE operations

### Client Error Codes
- 400 Bad Request: Invalid request data
- 401 Unauthorized: Authentication required
- 403 Forbidden: Insufficient permissions
- 404 Not Found: Resource doesn't exist
- 409 Conflict: Resource conflict (duplicate, booking conflict)
- 422 Unprocessable Entity: Valid format but business rule violation
- 429 Too Many Requests: Rate limit exceeded

### Server Error Codes
- 500 Internal Server Error: Unexpected server error
- 502 Bad Gateway: External service error
- 503 Service Unavailable: System maintenance

## Request Validation
```typescript
// DTO Example
export class CreateFieldDto {
  @IsNotEmpty()
  @Length(3, 100)
  name: string;

  @IsNotEmpty()
  @Length(10, 500)
  description: string;

  @IsNotEmpty()
  address: string;

  @IsNotEmpty()
  city: string;

  @IsEnum(SportType)
  sportType: SportType;

  @IsNumber()
  @Min(0)
  pricePerHour: number;

  @IsNumber()
  brandId: number;
}
```

## Pagination Standards
```http
GET /endpoint?page=1&limit=20&sortBy=createdAt&sortOrder=DESC
```

Response:
```json
{
  "statusCode": 200,
  "success": true,
  "message": "Data retrieved successfully",
  "data": {
    "items": [...],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 150,
      "totalPages": 8,
      "hasNext": true,
      "hasPrev": false
    }
  },
  "errors": null
}
```

## Query Parameter Standards
- page: Page number (default: 1)
- limit: Items per page (default: 10, max: 100)
- sortBy: Field to sort by
- sortOrder: ASC or DESC (default: ASC)
- search: Text search query
- filter: Additional filtering parameters

## Date/Time Format Standards
- ISO 8601 format: "2025-04-12T14:30:00Z"
- Date only: "2025-04-12"
- Time only: "14:30:00"
- Timezone: UTC for storage, local for display

## Field Naming Conventions
- camelCase for JSON fields
- snake_case for database columns
- Consistent naming across related entities
- Descriptive and unambiguous names

## Version Control
```http
GET /api/v1/field/list
Accept: application/vnd.findyourturf.v1+json
```

## Content-Type Standards
- Request: application/json
- Response: application/json
- File uploads: multipart/form-data
- Character encoding: UTF-8

## Input Sanitization
```typescript
@Transform(({ value }) => value.trim())
@IsString()
name: string;

@Transform(({ value }) => sanitizeHtml(value))
@IsString()
description: string;
```

## Error Message Standards
- Clear, actionable error messages
- Field-specific validation errors
- Localization support
- No sensitive information exposure

## API Documentation Standards
- OpenAPI/Swagger specification
- Comprehensive endpoint documentation
- Request/response examples
- Authentication requirements
- Rate limiting information

## Request/Response Logging
```typescript
interface APILog {
  requestId: string;
  method: string;
  url: string;
  statusCode: number;
  responseTime: number;
  userAgent: string;
  ipAddress: string;
  userId?: number;
  timestamp: Date;
}
```

## CORS Configuration
```typescript
const corsOptions = {
  origin: process.env.ALLOWED_ORIGINS?.split(','),
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  maxAge: 86400 // 24 hours
};
```

## API Versioning Strategy
- URL versioning: /api/v1/endpoint
- Header versioning for minor changes
- Deprecation notices
- Migration guides
- Backward compatibility maintenance

## Common Validation Patterns
```typescript
// Email validation
@IsEmail()
email: string;

// Phone number validation
@Matches(/^\+[1-9]\d{1,14}$/)
phoneNumber: string;

// UUID validation
@IsUUID()
id: string;

// Enum validation
@IsEnum(UserRole)
role: UserRole;
```

## Rate Limiting Headers
```http
HTTP/1.1 200 OK
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1645123456
```

## Health Check Endpoint
```http
GET /health
```

Response:
```json
{
  "status": "healthy",
  "timestamp": "2025-04-12T14:30:00Z",
  "uptime": 86400,
  "dependencies": {
    "database": "healthy",
    "redis": "healthy",
    "external_api": "degraded"
  }
}
```

## See Also
- auth_security.md - Authentication standards
- error_handling_guide.md - Comprehensive error scenarios
- performance_monitoring.md - API monitoring