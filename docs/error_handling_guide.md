# FindYourTurf - Developer Integration: Error Handling Guide

**Scope**: Comprehensive error scenarios, status codes, and handling strategies
**Related Files**: integration_workflows.md, api_standards.md, auth_security.md
**Last Updated**: 2025-08-20

---

## Overview
Complete guide to error handling including all possible error scenarios, proper status codes, retry strategies, and debugging approaches.

## Error Response Format
All errors follow the standardized format:
```json
{
  "statusCode": number,
  "success": false,
  "message": "string",
  "data": null,
  "errors": string[]|null
}
```

## Authentication Errors (401)

### Invalid Token
```json
{
  "statusCode": 401,
  "success": false,
  "message": "Invalid authentication token",
  "data": null,
  "errors": ["Token is malformed or expired"]
}
```

### Expired Token
```json
{
  "statusCode": 401,
  "success": false,
  "message": "Authentication token has expired",
  "data": null,
  "errors": ["Please refresh your access token"]
}
```

### Missing Token
```json
{
  "statusCode": 401,
  "success": false,
  "message": "Authentication required",
  "data": null,
  "errors": ["Authorization header is required"]
}
```

## Authorization Errors (403)

### Insufficient Permissions
```json
{
  "statusCode": 403,
  "success": false,
  "message": "Insufficient permissions",
  "data": null,
  "errors": ["User role 'consumer' cannot access this resource"]
}
```

### Resource Access Denied
```json
{
  "statusCode": 403,
  "success": false,
  "message": "Access denied to this resource",
  "data": null,
  "errors": ["Field does not belong to your brand"]
}
```

### Staff Permission Denied
```json
{
  "statusCode": 403,
  "success": false,
  "message": "Staff permission required",
  "data": null,
  "errors": ["Missing required permission: canUpdateSchedules"]
}
```

## Validation Errors (400)

### Field Creation Validation
```json
{
  "statusCode": 400,
  "success": false,
  "message": "Validation failed",
  "data": null,
  "errors": [
    "Name must be between 3 and 100 characters",
    "Description must be between 10 and 500 characters",
    "Price per hour must be a positive number",
    "Sport type must be a valid enum value"
  ]
}
```

### Booking Validation
```json
{
  "statusCode": 400,
  "success": false,
  "message": "Invalid booking parameters",
  "data": null,
  "errors": [
    "Date must be in the future",
    "Duration must be between 30 and 480 minutes",
    "Start time must be in HH:mm:ss format"
  ]
}
```

### Schedule Validation
```json
{
  "statusCode": 400,
  "success": false,
  "message": "Schedule validation failed",
  "data": null,
  "errors": [
    "Time blocks must be within operating hours",
    "Overlapping time blocks detected",
    "Invalid recurrence configuration"
  ]
}
```

## Resource Not Found (404)

### Field Not Found
```json
{
  "statusCode": 404,
  "success": false,
  "message": "Field not found",
  "data": null,
  "errors": ["Field with ID 123 does not exist"]
}
```

### Booking Not Found
```json
{
  "statusCode": 404,
  "success": false,
  "message": "Booking not found",
  "data": null,
  "errors": ["Booking with ID 456 does not exist or has been cancelled"]
}
```

### User Not Found
```json
{
  "statusCode": 404,
  "success": false,
  "message": "User not found",
  "data": null,
  "errors": ["No user found with the provided credentials"]
}
```

## Conflict Errors (409)

### Booking Conflicts
```json
{
  "statusCode": 409,
  "success": false,
  "message": "Booking conflict detected",
  "data": null,
  "errors": [
    "Field is not available during the requested time slot",
    "Existing booking overlaps with requested time: 2025-04-12 14:00-15:00"
  ]
}
```

### Duplicate Resource
```json
{
  "statusCode": 409,
  "success": false,
  "message": "Resource already exists",
  "data": null,
  "errors": [
    "Field with name 'Premier Football Ground' already exists in this brand",
    "Email address is already registered"
  ]
}
```

### Schedule Conflicts
```json
{
  "statusCode": 409,
  "success": false,
  "message": "Schedule conflict",
  "data": null,
  "errors": ["A schedule already exists for this field on MONDAY"]
}
```

## Business Logic Errors (422)

### Review Submission
```json
{
  "statusCode": 422,
  "success": false,
  "message": "Review submission not allowed",
  "data": null,
  "errors": [
    "Reviews can only be submitted after booking completion",
    "Review deadline has passed (30 days after booking)",
    "Review already submitted for this booking"
  ]
}
```

### Booking Restrictions
```json
{
  "statusCode": 422,
  "success": false,
  "message": "Booking restrictions violated",
  "data": null,
  "errors": [
    "Bookings must be made at least 2 hours in advance",
    "Maximum booking duration is 4 hours",
    "Field is not available on this date"
  ]
}
```

### Payment Issues
```json
{
  "statusCode": 422,
  "success": false,
  "message": "Payment processing failed",
  "data": null,
  "errors": [
    "Insufficient funds",
    "Payment method declined",
    "Currency not supported for this field"
  ]
}
```

## Rate Limiting (429)

### Standard Rate Limit
```json
{
  "statusCode": 429,
  "success": false,
  "message": "Too many requests",
  "data": null,
  "errors": [
    "Rate limit exceeded: 100 requests per minute",
    "Please wait 60 seconds before making another request"
  ]
}
```

### Authentication Rate Limit
```json
{
  "statusCode": 429,
  "success": false,
  "message": "Too many authentication attempts",
  "data": null,
  "errors": [
    "Maximum 5 login attempts per minute exceeded",
    "Account temporarily locked for security"
  ]
}
```

## Server Errors (5xx)

### Internal Server Error
```json
{
  "statusCode": 500,
  "success": false,
  "message": "Internal server error",
  "data": null,
  "errors": [
    "An unexpected error occurred",
    "Error ID: 12345-67890 (for support reference)"
  ]
}
```

### Service Unavailable
```json
{
  "statusCode": 503,
  "success": false,
  "message": "Service temporarily unavailable",
  "data": null,
  "errors": [
    "System is undergoing maintenance",
    "Estimated downtime: 30 minutes"
  ]
}
```

## Error Handling Strategies

### Token Refresh Strategy
```typescript
class AuthErrorHandler {
  async handleAuthError(error: APIError, originalRequest: RequestConfig) {
    if (error.statusCode === 401 && error.message.includes('expired')) {
      try {
        await this.refreshToken();
        return this.retryRequest(originalRequest);
      } catch (refreshError) {
        // Refresh failed, redirect to login
        this.redirectToLogin();
        throw refreshError;
      }
    }
    throw error;
  }
}
```

### Retry Strategy with Exponential Backoff
```typescript
class RetryHandler {
  async executeWithRetry<T>(
    operation: () => Promise<T>,
    maxRetries: number = 3
  ): Promise<T> {
    let attempt = 0;
    
    while (attempt < maxRetries) {
      try {
        return await operation();
      } catch (error) {
        attempt++;
        
        // Don't retry client errors (4xx) except 429
        if (error.statusCode >= 400 && error.statusCode < 500 && error.statusCode !== 429) {
          throw error;
        }
        
        if (attempt === maxRetries) {
          throw error;
        }
        
        // Exponential backoff: 1s, 2s, 4s, 8s...
        const delay = Math.pow(2, attempt - 1) * 1000;
        await this.sleep(delay);
      }
    }
  }
  
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
```

### Comprehensive Error Handler
```typescript
class ErrorHandler {
  handle(error: APIError): never {
    // Log error for monitoring
    this.logError(error);
    
    switch (error.statusCode) {
      case 400:
        throw new ValidationError(error.message, error.errors);
      case 401:
        throw new AuthenticationError(error.message);
      case 403:
        throw new AuthorizationError(error.message);
      case 404:
        throw new NotFoundError(error.message);
      case 409:
        throw new ConflictError(error.message, error.errors);
      case 422:
        throw new BusinessLogicError(error.message, error.errors);
      case 429:
        throw new RateLimitError(error.message);
      case 500:
      case 502:
      case 503:
        throw new ServerError(error.message);
      default:
        throw new UnknownError(error.message);
    }
  }
  
  private logError(error: APIError) {
    console.error(`API Error [${error.statusCode}]: ${error.message}`, {
      errors: error.errors,
      timestamp: new Date().toISOString(),
      stack: new Error().stack
    });
  }
}
```

## Error Recovery Patterns

### Circuit Breaker Pattern
```typescript
class CircuitBreaker {
  private failureCount = 0;
  private lastFailureTime = 0;
  private state: 'CLOSED' | 'OPEN' | 'HALF_OPEN' = 'CLOSED';
  
  async execute<T>(operation: () => Promise<T>): Promise<T> {
    if (this.state === 'OPEN') {
      if (Date.now() - this.lastFailureTime > 60000) { // 1 minute timeout
        this.state = 'HALF_OPEN';
      } else {
        throw new Error('Circuit breaker is OPEN');
      }
    }
    
    try {
      const result = await operation();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }
  
  private onSuccess() {
    this.failureCount = 0;
    this.state = 'CLOSED';
  }
  
  private onFailure() {
    this.failureCount++;
    this.lastFailureTime = Date.now();
    if (this.failureCount >= 5) {
      this.state = 'OPEN';
    }
  }
}
```

## Debugging Tips
- Always log error details including request ID
- Check rate limiting headers
- Verify token expiration times
- Monitor network connectivity
- Validate request payload format
- Check field and resource ownership
- Verify user permissions and roles

## Common Error Prevention
- Implement proper input validation
- Use proper date/time formats
- Handle token refresh proactively
- Implement proper error boundaries
- Use retry logic for transient errors
- Monitor API response patterns

## See Also
- integration_workflows.md - Implementation patterns
- api_standards.md - Response format standards
- auth_security.md - Authentication error details