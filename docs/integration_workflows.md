# FindYourTurf - Developer Integration: Common Workflows

**Scope**: Implementation patterns and workflows for integrating with the FindYourTurf platform
**Related Files**: error_handling_guide.md, testing_guidelines.md, api_standards.md
**Last Updated**: 2025-08-20

---

## Overview
Common implementation patterns, workflows, and best practices for developers integrating with the FindYourTurf API.

## Authentication Workflow
```typescript
class FindYourTurfClient {
  private accessToken: string;
  private refreshToken: string;
  
  async authenticate(email: string, password: string) {
    const response = await fetch('/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    
    const data = await response.json();
    if (data.success) {
      this.accessToken = data.data.accessToken;
      this.refreshToken = data.data.refreshToken;
      this.scheduleTokenRefresh();
    }
    return data;
  }
  
  async refreshAccessToken() {
    const response = await fetch('/auth/refresh', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken: this.refreshToken })
    });
    
    const data = await response.json();
    if (data.success) {
      this.accessToken = data.data.accessToken;
    }
    return data;
  }
}
```

## Field Search and Booking Workflow
```typescript
class BookingWorkflow {
  constructor(private client: FindYourTurfClient) {}
  
  async searchAndBook(searchCriteria: SearchCriteria, bookingDetails: BookingDetails) {
    // Step 1: Search for available fields
    const searchResults = await this.searchFields(searchCriteria);
    
    if (searchResults.data.fields.length === 0) {
      throw new Error('No available fields found');
    }
    
    // Step 2: Check specific availability
    const selectedField = searchResults.data.fields[0];
    const availability = await this.checkAvailability(
      selectedField.id,
      bookingDetails.date,
      bookingDetails.duration
    );
    
    if (!availability.data.isAvailable) {
      throw new Error('Field not available for selected time');
    }
    
    // Step 3: Get price preview
    const pricePreview = await this.getPricePreview(
      selectedField.id,
      bookingDetails
    );
    
    // Step 4: Create booking
    const booking = await this.createBooking({
      ...bookingDetails,
      fieldId: selectedField.id,
      expectedPrice: pricePreview.data.finalPrice
    });
    
    return booking;
  }
  
  private async searchFields(criteria: SearchCriteria) {
    return this.client.get('/field/list', { params: criteria });
  }
  
  private async checkAvailability(fieldId: number, date: string, duration: number) {
    return this.client.get(`/field/${fieldId}/availability`, {
      params: { date, duration }
    });
  }
  
  private async getPricePreview(fieldId: number, details: BookingDetails) {
    return this.client.get(`/field/${fieldId}/price-preview`, {
      params: details
    });
  }
  
  private async createBooking(bookingData: CreateBookingData) {
    return this.client.post('/booking/create', bookingData);
  }
}
```

## Field Management Workflow
```typescript
class FieldManagementWorkflow {
  constructor(private client: FindYourTurfClient) {}
  
  async setupNewField(fieldData: CreateFieldData) {
    // Step 1: Create the field
    const field = await this.client.post('/field/create', fieldData);
    
    if (!field.success) {
      throw new Error(`Failed to create field: ${field.message}`);
    }
    
    const fieldId = field.data.id;
    
    // Step 2: Set up basic schedules (Monday to Friday)
    const weekdaySchedules = this.generateWeekdaySchedules();
    for (const schedule of weekdaySchedules) {
      await this.client.post(`/field/${fieldId}/schedules`, schedule);
    }
    
    // Step 3: Set up weekend schedules with different pricing
    const weekendSchedules = this.generateWeekendSchedules();
    for (const schedule of weekendSchedules) {
      await this.client.post(`/field/${fieldId}/schedules`, schedule);
    }
    
    // Step 4: Upload field images
    if (fieldData.images) {
      await this.uploadFieldImages(fieldId, fieldData.images);
    }
    
    return field.data;
  }
  
  private generateWeekdaySchedules() {
    const weekdays = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY'];
    return weekdays.map(day => ({
      dayOfWeek: day,
      openTime: '09:00:00',
      closeTime: '22:00:00',
      isAvailable: true,
      timeBlocks: [
        { startTime: '09:00:00', endTime: '17:00:00', price: 80 },
        { startTime: '17:00:00', endTime: '22:00:00', price: 120 }
      ]
    }));
  }
  
  private generateWeekendSchedules() {
    return ['SATURDAY', 'SUNDAY'].map(day => ({
      dayOfWeek: day,
      openTime: '08:00:00',
      closeTime: '23:00:00',
      isAvailable: true,
      specialPrice: 150
    }));
  }
}
```

## Review Management Workflow
```typescript
class ReviewManagementWorkflow {
  constructor(private client: FindYourTurfClient) {}
  
  async handleNewReview(reviewId: number) {
    // Step 1: Get review details
    const review = await this.client.get(`/reviews/${reviewId}`);
    
    // Step 2: Analyze review sentiment
    const sentiment = this.analyzeSentiment(review.data.comment);
    
    // Step 3: Generate appropriate response based on rating and sentiment
    let response: string;
    
    if (review.data.rating >= 4) {
      response = this.generatePositiveResponse(review.data);
    } else if (review.data.rating <= 2) {
      response = this.generateNegativeResponse(review.data);
    } else {
      response = this.generateNeutralResponse(review.data);
    }
    
    // Step 4: Post company response
    await this.client.post(`/reviews/${reviewId}/response`, {
      response: response
    });
    
    // Step 5: Log review handling for analytics
    await this.logReviewHandling(reviewId, sentiment, response);
    
    return { reviewId, sentiment, response };
  }
  
  private analyzeSentiment(comment: string): 'positive' | 'negative' | 'neutral' {
    // Simplified sentiment analysis
    const positiveWords = ['great', 'excellent', 'amazing', 'perfect', 'love'];
    const negativeWords = ['terrible', 'awful', 'horrible', 'worst', 'hate'];
    
    const lowerComment = comment.toLowerCase();
    const positiveCount = positiveWords.filter(word => lowerComment.includes(word)).length;
    const negativeCount = negativeWords.filter(word => lowerComment.includes(word)).length;
    
    if (positiveCount > negativeCount) return 'positive';
    if (negativeCount > positiveCount) return 'negative';
    return 'neutral';
  }
}
```

## Error Handling Pattern
```typescript
class APIClient {
  async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<APIResponse<T>> {
    try {
      const response = await fetch(endpoint, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.accessToken}`,
          ...options.headers
        }
      });
      
      const data = await response.json();
      
      // Handle token expiration
      if (response.status === 401 && data.message.includes('token')) {
        await this.refreshAccessToken();
        return this.makeRequest(endpoint, options); // Retry with new token
      }
      
      // Handle rate limiting
      if (response.status === 429) {
        const retryAfter = response.headers.get('Retry-After');
        await this.delay(parseInt(retryAfter || '60') * 1000);
        return this.makeRequest(endpoint, options); // Retry after delay
      }
      
      return data;
    } catch (error) {
      // Handle network errors
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new NetworkError('Network connection failed');
      }
      throw error;
    }
  }
  
  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
```

## Webhook Integration Pattern
```typescript
class WebhookHandler {
  constructor(private secretKey: string) {}
  
  async handleWebhook(request: Request): Promise<void> {
    // Verify webhook signature
    const signature = request.headers.get('X-FindYourTurf-Signature');
    const payload = await request.text();
    
    if (!this.verifySignature(payload, signature)) {
      throw new Error('Invalid webhook signature');
    }
    
    const event = JSON.parse(payload);
    
    // Handle different event types
    switch (event.type) {
      case 'booking.created':
        await this.handleBookingCreated(event.data);
        break;
      case 'booking.cancelled':
        await this.handleBookingCancelled(event.data);
        break;
      case 'review.submitted':
        await this.handleReviewSubmitted(event.data);
        break;
      case 'payment.completed':
        await this.handlePaymentCompleted(event.data);
        break;
      default:
        console.warn(`Unknown webhook event type: ${event.type}`);
    }
  }
  
  private verifySignature(payload: string, signature: string): boolean {
    const expectedSignature = crypto
      .createHmac('sha256', this.secretKey)
      .update(payload)
      .digest('hex');
    return `sha256=${expectedSignature}` === signature;
  }
}
```

## Pagination Handling
```typescript
class PaginatedDataFetcher {
  async fetchAllPages<T>(
    endpoint: string,
    params: object = {}
  ): Promise<T[]> {
    const allItems: T[] = [];
    let page = 1;
    let hasMore = true;
    
    while (hasMore) {
      const response = await this.client.get(endpoint, {
        params: { ...params, page, limit: 100 }
      });
      
      if (response.success) {
        allItems.push(...response.data.items);
        hasMore = response.data.pagination.hasNext;
        page++;
      } else {
        throw new Error(`Failed to fetch page ${page}: ${response.message}`);
      }
    }
    
    return allItems;
  }
}
```

## Best Practices
- Always handle token refresh automatically
- Implement exponential backoff for retries
- Use webhooks for real-time event handling
- Cache frequently accessed data
- Implement proper error logging
- Use TypeScript for better type safety
- Follow rate limiting guidelines
- Validate all API responses

## See Also
- error_handling_guide.md - Comprehensive error scenarios
- testing_guidelines.md - Testing strategies
- api_standards.md - API standards and conventions