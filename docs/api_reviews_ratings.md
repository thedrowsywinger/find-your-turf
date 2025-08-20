# FindYourTurf - API: Reviews and Ratings System

**Scope**: User review submission and facility owner response management
**Related Files**: api_booking_flow.md, roles_consumer_users.md, roles_company_users.md
**Last Updated**: 2025-08-20

---

## Overview
Comprehensive review system allowing users to rate facilities and owners to respond, with moderation capabilities.

## Key Features
- Post-booking review submission
- 1-5 star rating system
- Written reviews with validation
- Company response system
- Review moderation
- Rating aggregation

## Submit Review
```http
POST /field/{fieldId}/reviews
Authorization: Bearer {jwt_token}
{
  "bookingId": 123,
  "rating": 4,
  "comment": "Great facility with excellent maintenance. Parking could be improved.",
  "tags": ["clean", "well-maintained", "good-lighting"]
}
```

## Review Response
```json
{
  "statusCode": 201,
  "success": true,
  "message": "Review submitted successfully",
  "data": {
    "id": 456,
    "fieldId": 1,
    "userId": 45,
    "bookingId": 123,
    "rating": 4,
    "comment": "Great facility with excellent maintenance. Parking could be improved.",
    "tags": ["clean", "well-maintained", "good-lighting"],
    "createdAt": "2025-04-13T10:00:00Z",
    "status": "PUBLISHED"
  },
  "errors": null
}
```

## Company Response
```http
POST /reviews/{reviewId}/response
Authorization: Bearer {jwt_token}
{
  "response": "Thank you for your feedback! We're working on expanding our parking facilities."
}
```

## Get Field Reviews
```http
GET /field/{fieldId}/reviews?page=1&limit=10&rating=4&sortBy=createdAt
```

## Review Validation Rules
- User must have completed booking
- One review per booking
- Rating: 1-5 stars (required)
- Comment: 10-500 characters
- Tags: Optional array of strings
- Review submission within 30 days of booking

## Review Status Types
- PENDING - Awaiting moderation
- PUBLISHED - Visible to public
- REJECTED - Rejected by moderation
- FLAGGED - Reported by users
- ARCHIVED - Removed from public view

## Rating Aggregation
```json
{
  "averageRating": 4.2,
  "totalReviews": 87,
  "ratingDistribution": {
    "5": 32,
    "4": 28,
    "3": 15,
    "2": 8,
    "1": 4
  }
}
```

## Review Moderation
- Automatic profanity filtering
- Spam detection algorithms
- Admin review for flagged content
- User reporting system

## Review Tags
Common tags for categorization:
- Facility: ["clean", "well-maintained", "spacious", "crowded"]
- Amenities: ["good-parking", "changing-rooms", "equipment-rental"]
- Service: ["helpful-staff", "quick-response", "professional"]
- Location: ["easy-access", "good-transport", "safe-area"]

## Company Review Management
```http
GET /company/reviews?status=PENDING&page=1&limit=20
```

## Review Analytics
- Average rating trends
- Review volume over time
- Common complaint categories
- Response rate metrics

## Common Errors
- 400: Invalid rating value (must be 1-5)
- 403: Review already submitted for this booking
- 404: Booking not found or not completed
- 422: Review submission deadline expired

## Notification System
- New review notifications for field owners
- Response notifications for reviewers
- Moderation alerts for flagged content

## See Also
- api_booking_flow.md - Booking completion requirement
- roles_company_users.md - Review response permissions
- roles_consumer_users.md - Review submission rights