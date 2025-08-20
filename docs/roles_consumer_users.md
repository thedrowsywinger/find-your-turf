# FindYourTurf - User Roles: Consumer Users

**Scope**: End users who search for and book sports facilities
**Related Files**: api_booking_flow.md, api_search_discovery.md, api_reviews_ratings.md
**Last Updated**: 2025-08-20

---

## Overview
Consumer users search for sports facilities, make bookings, and provide reviews after using facilities.

## Key Features
- Search & Discovery by location, sport type, availability
- Filter by price range, ratings, amenities
- Booking Management (create, view, cancel, reschedule)
- Reviews & Ratings submission
- Booking history access

## Field Search
```http
GET /field/list?city=Sportstown&sportType=FOOTBALL&minPrice=50&maxPrice=150&date=2025-04-12
```

Response includes:
- Field details and descriptions
- Real-time availability
- Pricing information
- Reviews and ratings
- Amenity lists

## Booking Creation
```http
POST /booking/create
{
  "fieldId": 1,
  "date": "2025-04-12",
  "startTime": "14:00:00",
  "duration": 60
}
```

## Authorization Requirements
- JWT token required for booking operations
- Account registration required
- Email verification for new accounts

## Booking Lifecycle
1. Search and filter available fields
2. View field details and availability
3. Create booking with payment
4. Receive booking confirmation
5. Use facility
6. Submit review (optional)

## Common Errors
- 401: Authentication required for booking
- 409: Field not available at requested time
- 400: Invalid booking parameters

## See Also
- api_booking_flow.md - Complete booking process
- api_search_discovery.md - Field search and filtering
- api_reviews_ratings.md - Review system details