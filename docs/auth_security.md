# FindYourTurf - System Architecture: Authentication & Security

**Scope**: JWT authentication, RBAC implementation, and comprehensive security measures
**Related Files**: roles_staff_management.md, api_standards.md, performance_monitoring.md
**Last Updated**: 2025-08-20

---

## Overview
Secure authentication system using JWT tokens with role-based access control and comprehensive security measures.

## Authentication Flow
- JWT-based authentication
- Access tokens (short-lived, 15 minutes)
- Refresh tokens (long-lived, 7 days)
- Secure token validation and refresh mechanisms
- Multi-factor authentication support

## JWT Token Structure
```typescript
interface JWTPayload {
  sub: number;        // User ID
  email: string;      // User email
  role: UserRole;     // User role
  brandId?: number;   // Company brand ID (if applicable)
  permissions?: StaffPermissions; // Staff permissions
  iat: number;        // Issued at
  exp: number;        // Expiration
}
```

## Authentication Endpoints
```http
POST /auth/login
{
  "email": "user@example.com",
  "password": "SecurePassword123"
}
```

Response:
```json
{
  "statusCode": 200,
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 123,
      "email": "user@example.com",
      "role": "company",
      "brandId": 45
    }
  }
}
```

## Token Refresh
```http
POST /auth/refresh
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

## Role-Based Access Control (RBAC)
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

## Permission Guards
```typescript
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}
  
  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.get<UserRole[]>('roles', context.getHandler());
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    
    return requiredRoles.some(role => user.role === role);
  }
}
```

## Permission Decorator
```typescript
@RequirePermissions('canUpdateSchedules', 'canModifyFacilities')
@UseGuards(JwtAuthGuard, StaffPermissionsGuard)
async updateFieldSchedule() {
  // Endpoint implementation
}
```

## Rate Limiting
```typescript
const rateLimitConfig = {
  default: {
    windowMs: 60 * 1000,    // 1 minute
    max: 100,               // 100 requests per minute
  },
  auth: {
    windowMs: 60 * 1000,    // 1 minute
    max: 5,                 // 5 requests per minute
  },
  booking: {
    windowMs: 60 * 1000,    // 1 minute
    max: 20,                // 20 requests per minute
  }
};
```

## Security Headers
```typescript
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}));
```

## Password Security
- Bcrypt hashing with salt rounds: 12
- Minimum password requirements:
  - 8 characters minimum
  - Must include uppercase, lowercase, number
  - Special characters required
- Password history tracking (last 5 passwords)
- Account lockout after 5 failed attempts

## API Security Measures
- HTTPS enforcement
- CORS configuration
- Request size limits
- Input validation and sanitization
- SQL injection prevention
- XSS protection

## Session Management
```typescript
interface UserSession {
  userId: number;
  deviceId: string;
  ipAddress: string;
  userAgent: string;
  lastActivity: Date;
  isActive: boolean;
}
```

## Multi-Factor Authentication
```http
POST /auth/mfa/enable
{
  "method": "totp",
  "phoneNumber": "+1234567890"
}
```

## Security Audit Logging
```typescript
enum SecurityEvent {
  LOGIN_SUCCESS = 'login_success',
  LOGIN_FAILURE = 'login_failure',
  PASSWORD_CHANGE = 'password_change',
  ACCOUNT_LOCKED = 'account_locked',
  PERMISSION_DENIED = 'permission_denied',
  SUSPICIOUS_ACTIVITY = 'suspicious_activity'
}
```

## Token Blacklisting
- Maintain blacklist for revoked tokens
- Redis-based token storage
- Automatic cleanup of expired tokens
- Force logout functionality

## Common Security Errors
- 401: Invalid or expired token
- 403: Insufficient permissions
- 429: Rate limit exceeded
- 423: Account locked due to failed attempts

## Security Best Practices
- Regular security audits
- Dependency vulnerability scanning
- Automated security testing
- Incident response procedures
- Regular password policy updates

## See Also
- roles_staff_management.md - Staff permission system
- api_standards.md - Secure API practices
- performance_monitoring.md - Security monitoring