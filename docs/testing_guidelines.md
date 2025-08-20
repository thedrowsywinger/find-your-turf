# FindYourTurf - Developer Integration: Testing Guidelines

**Scope**: Comprehensive testing strategies for unit, integration, and security testing
**Related Files**: integration_workflows.md, error_handling_guide.md, auth_security.md
**Last Updated**: 2025-08-20

---

## Overview
Complete testing strategy covering unit tests, integration tests, end-to-end tests, security testing, and performance testing for FindYourTurf API integration.

## Testing Stack
- **Unit Testing**: Jest, Mocha, or similar
- **Integration Testing**: Supertest, Postman/Newman
- **E2E Testing**: Cypress, Playwright
- **API Testing**: Postman Collections, REST Assured
- **Security Testing**: OWASP ZAP, Custom security tests
- **Performance Testing**: Artillery, JMeter

## Unit Testing Patterns

### API Client Testing
```typescript
describe('FindYourTurfClient', () => {
  let client: FindYourTurfClient;
  let mockFetch: jest.Mock;
  
  beforeEach(() => {
    mockFetch = jest.fn();
    global.fetch = mockFetch;
    client = new FindYourTurfClient('test-api-url');
  });
  
  describe('authenticate', () => {
    it('should successfully authenticate with valid credentials', async () => {
      const mockResponse = {
        statusCode: 200,
        success: true,
        data: {
          accessToken: 'mock-access-token',
          refreshToken: 'mock-refresh-token'
        }
      };
      
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => mockResponse
      });
      
      const result = await client.authenticate('test@example.com', 'password123');
      
      expect(result.success).toBe(true);
      expect(result.data.accessToken).toBe('mock-access-token');
      expect(mockFetch).toHaveBeenCalledWith('/auth/login', expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'test@example.com',
          password: 'password123'
        })
      }));
    });
    
    it('should handle authentication failure', async () => {
      const mockResponse = {
        statusCode: 401,
        success: false,
        message: 'Invalid credentials',
        errors: ['Email or password is incorrect']
      };
      
      mockFetch.mockResolvedValue({
        ok: false,
        status: 401,
        json: async () => mockResponse
      });
      
      await expect(client.authenticate('test@example.com', 'wrongpassword'))
        .rejects.toThrow('Invalid credentials');
    });
  });
  
  describe('token refresh', () => {
    it('should automatically refresh expired tokens', async () => {
      // Mock expired token response
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: async () => ({
          statusCode: 401,
          success: false,
          message: 'Token expired'
        })
      });
      
      // Mock successful refresh response
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          statusCode: 200,
          success: true,
          data: { accessToken: 'new-access-token' }
        })
      });
      
      // Mock successful retry
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          statusCode: 200,
          success: true,
          data: { fields: [] }
        })
      });
      
      client.setTokens('expired-token', 'refresh-token');
      
      const result = await client.get('/field/list');
      
      expect(mockFetch).toHaveBeenCalledTimes(3);
      expect(result.success).toBe(true);
    });
  });
});
```

### Workflow Testing
```typescript
describe('BookingWorkflow', () => {
  let workflow: BookingWorkflow;
  let mockClient: jest.Mocked<FindYourTurfClient>;
  
  beforeEach(() => {
    mockClient = {
      get: jest.fn(),
      post: jest.fn()
    } as any;
    workflow = new BookingWorkflow(mockClient);
  });
  
  it('should complete full booking workflow', async () => {
    // Mock search results
    mockClient.get.mockResolvedValueOnce({
      success: true,
      data: {
        fields: [{ id: 1, name: 'Test Field', pricePerHour: 100 }]
      }
    });
    
    // Mock availability check
    mockClient.get.mockResolvedValueOnce({
      success: true,
      data: { isAvailable: true }
    });
    
    // Mock price preview
    mockClient.get.mockResolvedValueOnce({
      success: true,
      data: { finalPrice: 100 }
    });
    
    // Mock booking creation
    mockClient.post.mockResolvedValueOnce({
      success: true,
      data: { id: 123, status: 'CONFIRMED' }
    });
    
    const result = await workflow.searchAndBook(
      { city: 'TestCity', sportType: 'FOOTBALL' },
      { date: '2025-04-12', startTime: '14:00:00', duration: 60 }
    );
    
    expect(result.success).toBe(true);
    expect(result.data.id).toBe(123);
    expect(mockClient.get).toHaveBeenCalledTimes(3);
    expect(mockClient.post).toHaveBeenCalledTimes(1);
  });
});
```

## Integration Testing

### API Endpoint Testing
```typescript
describe('Field Management API', () => {
  let app: Application;
  let authToken: string;
  
  beforeAll(async () => {
    app = await createTestApp();
    authToken = await authenticateTestUser();
  });
  
  afterAll(async () => {
    await cleanupTestData();
    await closeTestApp(app);
  });
  
  describe('POST /field/create', () => {
    it('should create a field with valid data', async () => {
      const fieldData = {
        name: 'Test Football Field',
        description: 'A test field for integration testing',
        address: '123 Test Street',
        city: 'TestCity',
        country: 'TestCountry',
        sportType: 'FOOTBALL',
        pricePerHour: 100,
        brandId: 1
      };
      
      const response = await request(app)
        .post('/field/create')
        .set('Authorization', `Bearer ${authToken}`)
        .send(fieldData)
        .expect(201);
      
      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe(fieldData.name);
      expect(response.body.data.id).toBeDefined();
      
      // Cleanup
      await deleteTestField(response.body.data.id);
    });
    
    it('should return validation errors for invalid data', async () => {
      const invalidData = {
        name: 'AB', // Too short
        description: 'Short', // Too short
        pricePerHour: -10 // Negative price
      };
      
      const response = await request(app)
        .post('/field/create')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidData)
        .expect(400);
      
      expect(response.body.success).toBe(false);
      expect(response.body.errors).toContain('Name must be between 3 and 100 characters');
      expect(response.body.errors).toContain('Description must be between 10 and 500 characters');
      expect(response.body.errors).toContain('Price per hour must be a positive number');
    });
    
    it('should require authentication', async () => {
      const response = await request(app)
        .post('/field/create')
        .send({})
        .expect(401);
      
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Authentication required');
    });
  });
  
  describe('GET /field/list', () => {
    beforeEach(async () => {
      await createTestFields();
    });
    
    afterEach(async () => {
      await cleanupTestFields();
    });
    
    it('should return paginated field list', async () => {
      const response = await request(app)
        .get('/field/list')
        .query({ page: 1, limit: 10 })
        .expect(200);
      
      expect(response.body.success).toBe(true);
      expect(response.body.data.fields).toBeInstanceOf(Array);
      expect(response.body.data.pagination).toMatchObject({
        page: 1,
        limit: 10,
        total: expect.any(Number),
        totalPages: expect.any(Number)
      });
    });
    
    it('should filter by search criteria', async () => {
      const response = await request(app)
        .get('/field/list')
        .query({
          city: 'TestCity',
          sportType: 'FOOTBALL',
          minPrice: 50,
          maxPrice: 150
        })
        .expect(200);
      
      expect(response.body.success).toBe(true);
      response.body.data.fields.forEach((field: any) => {
        expect(field.city).toBe('TestCity');
        expect(field.sportType).toBe('FOOTBALL');
        expect(field.pricePerHour).toBeGreaterThanOrEqual(50);
        expect(field.pricePerHour).toBeLessThanOrEqual(150);
      });
    });
  });
});
```

## Security Testing

### Authentication Testing
```typescript
describe('Security Tests', () => {
  describe('Authentication Security', () => {
    it('should prevent brute force attacks', async () => {
      const promises = [];
      
      // Attempt 10 failed logins
      for (let i = 0; i < 10; i++) {
        promises.push(
          request(app)
            .post('/auth/login')
            .send({
              email: 'test@example.com',
              password: 'wrongpassword'
            })
        );
      }
      
      await Promise.all(promises);
      
      // 11th attempt should be rate limited
      const response = await request(app)
        .post('/auth/login')
        .send({
          email: 'test@example.com',
          password: 'wrongpassword'
        });
      
      expect(response.status).toBe(429);
      expect(response.body.message).toContain('Too many attempts');
    });
    
    it('should validate JWT tokens properly', async () => {
      const malformedToken = 'invalid.jwt.token';
      
      const response = await request(app)
        .get('/field/list')
        .set('Authorization', `Bearer ${malformedToken}`)
        .expect(401);
      
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Invalid authentication token');
    });
  });
  
  describe('Authorization Testing', () => {
    it('should prevent cross-brand access', async () => {
      const user1Token = await createUserAndGetToken('company', 1); // Brand 1
      const user2Field = await createFieldForBrand(2); // Brand 2
      
      const response = await request(app)
        .put(`/field/${user2Field.id}`)
        .set('Authorization', `Bearer ${user1Token}`)
        .send({ name: 'Hacked Field' })
        .expect(403);
      
      expect(response.body.message).toContain('Access denied');
    });
    
    it('should enforce staff permissions', async () => {
      const staffToken = await createStaffUserToken({
        canManageBookings: false,
        canUpdateSchedules: true
      });
      
      // Should fail - no booking management permission
      await request(app)
        .get('/bookings/manage')
        .set('Authorization', `Bearer ${staffToken}`)
        .expect(403);
      
      // Should succeed - has schedule update permission
      await request(app)
        .post('/field/1/schedules')
        .set('Authorization', `Bearer ${staffToken}`)
        .send(validScheduleData)
        .expect(201);
    });
  });
  
  describe('Input Validation Security', () => {
    it('should prevent SQL injection', async () => {
      const maliciousInput = "'; DROP TABLE users; --";
      
      const response = await request(app)
        .get('/field/list')
        .query({ city: maliciousInput })
        .expect(200);
      
      // Should return empty results, not execute SQL
      expect(response.body.data.fields).toEqual([]);
    });
    
    it('should prevent XSS attacks', async () => {
      const xssPayload = '<script>alert("xss")</script>';
      const token = await getValidUserToken();
      
      const response = await request(app)
        .post('/field/create')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: xssPayload,
          description: 'Test field description',
          address: '123 Test St',
          city: 'TestCity',
          sportType: 'FOOTBALL',
          pricePerHour: 100,
          brandId: 1
        });
      
      // Should be sanitized
      expect(response.body.data.name).not.toContain('<script>');
    });
  });
});
```

## Performance Testing

### Load Testing
```javascript
// artillery.yml configuration
config:
  target: 'http://localhost:3000'
  phases:
    - duration: 60
      arrivalRate: 10
    - duration: 120
      arrivalRate: 50
    - duration: 60
      arrivalRate: 100
scenarios:
  - name: "Field search and booking flow"
    weight: 70
    flow:
      - post:
          url: "/auth/login"
          json:
            email: "{{ $randomEmail() }}"
            password: "testpassword"
          capture:
            - json: "$.data.accessToken"
              as: "token"
      - get:
          url: "/field/list"
          headers:
            Authorization: "Bearer {{ token }}"
          qs:
            city: "TestCity"
            sportType: "FOOTBALL"
      - post:
          url: "/booking/create"
          headers:
            Authorization: "Bearer {{ token }}"
          json:
            fieldId: 1
            date: "2025-04-12"
            startTime: "{{ $randomTime() }}"
            duration: 60
```

## Test Data Management

### Test Fixtures
```typescript
export const testFixtures = {
  users: {
    companyUser: {
      username: 'companyuser',
      email: 'company@test.com',
      password: 'TestPass123',
      role: UserRole.COMPANY
    },
    consumerUser: {
      username: 'consumeruser',
      email: 'consumer@test.com',
      password: 'TestPass123',
      role: UserRole.CONSUMER
    }
  },
  
  fields: {
    footballField: {
      name: 'Test Football Field',
      description: 'A test football field for automated testing',
      address: '123 Test Street',
      city: 'TestCity',
      country: 'TestCountry',
      sportType: SportType.FOOTBALL,
      pricePerHour: 100
    }
  },
  
  bookings: {
    futureBooking: {
      date: '2025-04-12',
      startTime: '14:00:00',
      duration: 60
    }
  }
};
```

## Test Best Practices
- Use test databases with proper isolation
- Clean up test data after each test
- Use meaningful test descriptions
- Mock external dependencies
- Test both success and failure scenarios
- Implement proper test data factories
- Use page object model for E2E tests
- Maintain test environment consistency

## See Also
- integration_workflows.md - Implementation patterns
- error_handling_guide.md - Error scenarios to test
- auth_security.md - Security requirements to test