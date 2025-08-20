# FindYourTurf - API: Booking Flow Management

**Scope**: Complete booking lifecycle from creation to completion
**Related Files**: roles_consumer_users.md, api_scheduling_system.md, api_reviews_ratings.md
**Last Updated**: 2025-08-20

---

## Overview
End-to-end booking management including creation, payment, modification, and cancellation workflows.

## Key Endpoints
- POST /booking/create - Create new booking
- GET /booking/{id} - Get booking details
- PUT /booking/{id} - Update booking
- DELETE /booking/{id} - Cancel booking
- GET /booking/user/{userId} - User's booking history

## Create Booking
```http
POST /booking/create
Authorization: Bearer {jwt_token}
{
  "fieldId": 1,
  "date": "2025-04-12",
  "startTime": "14:00:00",
  "duration": 60
}
```

## Booking Response
```json
{
  "statusCode": 201,
  "success": true,
  "message": "Booking created successfully",
  "data": {
    "id": 123,
    "fieldId": 1,
    "userId": 45,
    "date": "2025-04-12",
    "startTime": "14:00:00",
    "endTime": "15:00:00",
    "duration": 60,
    "totalPrice": 100.00,
    "status": "CONFIRMED",
    "paymentStatus": "PAID",
    "bookingCode": "BK-2025-000123",
    "createdAt": "2025-04-10T10:00:00Z"
  },
  "errors": null
}
```

## Booking States
- PENDING - Awaiting payment confirmation
- CONFIRMED - Payment successful, booking active
- CANCELLED - Cancelled by user or system
- COMPLETED - Booking time has passed
- NO_SHOW - User didn't show up

## Booking Validation
- Field must be available at requested time
- User must be authenticated
- Date must be in future
- Duration must be positive integer
- Start time must align with field schedule

## Zone-Specific Booking
```http
POST /booking/create
{
  "fieldId": 1,
  "zoneName": "North Half",
  "date": "2025-04-12",
  "startTime": "14:00:00",
  "duration": 60
}
```

## Booking Modification
```http
PUT /booking/{id}
{
  "date": "2025-04-13",
  "startTime": "15:00:00",
  "duration": 90
}
```

## Cancellation Policy
- Free cancellation up to 24 hours before
- 50% refund for cancellations 12-24 hours before
- No refund for cancellations within 12 hours
- Automatic cancellation for failed payments

## Booking History
```http
GET /booking/user/{userId}?status=CONFIRMED&fromDate=2025-01-01&toDate=2025-12-31
```

## Payment Integration
- Payment required before confirmation
- Multiple payment methods supported
- Automatic refund processing
- Payment failure handling

## Common Errors
- 409: Field not available at requested time
- 400: Invalid booking parameters
- 401: Authentication required
- 402: Payment required
- 404: Field or booking not found

## Notification System
- Booking confirmation email
- Reminder notifications (24h, 2h before)
- Cancellation confirmations
- Payment receipts

## See Also
- api_scheduling_system.md - Availability checking
- api_reviews_ratings.md - Post-booking reviews
- roles_consumer_users.md - User booking permissions