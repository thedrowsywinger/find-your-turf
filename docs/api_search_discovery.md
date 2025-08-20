# FindYourTurf - API: Field Search and Discovery

**Scope**: Advanced search and filtering capabilities for field discovery
**Related Files**: api_field_management.md, roles_consumer_users.md, api_reviews_ratings.md
**Last Updated**: 2025-08-20

---

## Overview
Comprehensive search system with location-based filtering, availability checking, and multi-criteria field discovery.

## Key Features
- Location-based search
- Sport type filtering
- Price range filtering
- Availability checking
- Rating-based filtering
- Amenity filtering
- Distance-based sorting

## Basic Field Search
```http
GET /field/list?city=Sportstown&sportType=FOOTBALL&minPrice=50&maxPrice=150&date=2025-04-12
```

## Advanced Search Parameters
```http
GET /field/list?
  city=Sportstown&
  sportType=FOOTBALL&
  minPrice=50&
  maxPrice=150&
  date=2025-04-12&
  startTime=14:00:00&
  duration=60&
  minRating=4.0&
  amenities=parking,changing-rooms&
  latitude=40.7128&
  longitude=-74.0060&
  radius=10&
  sortBy=distance&
  page=1&
  limit=20
```

## Search Response Format
```json
{
  "statusCode": 200,
  "success": true,
  "message": "Fields retrieved successfully",
  "data": {
    "fields": [
      {
        "id": 1,
        "name": "Premier Football Ground",
        "description": "Professional football field with artificial turf",
        "address": "123 Sports Avenue",
        "city": "Sportstown",
        "sportType": "FOOTBALL",
        "pricePerHour": 100,
        "averageRating": 4.2,
        "totalReviews": 87,
        "distance": 2.5,
        "amenities": ["parking", "changing-rooms", "floodlights"],
        "availability": {
          "date": "2025-04-12",
          "availableSlots": [
            {
              "startTime": "14:00:00",
              "endTime": "15:00:00",
              "price": 100
            }
          ]
        },
        "images": ["image1.jpg", "image2.jpg"]
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 45,
      "totalPages": 3
    }
  },
  "errors": null
}
```

## Search Filters

### Location Filters
- city: City name
- latitude/longitude: GPS coordinates
- radius: Distance in kilometers
- address: Partial address matching

### Availability Filters
- date: Specific date (YYYY-MM-DD)
- startTime: Preferred start time
- duration: Required duration in minutes
- timeRange: Morning/afternoon/evening

### Facility Filters
- sportType: Specific sport enumeration
- minPrice/maxPrice: Price range per hour
- minRating: Minimum average rating
- capacity: Minimum capacity requirement

### Amenity Filters
Common amenity categories:
- parking
- changing-rooms
- equipment-rental
- floodlights
- water-station
- first-aid
- spectator-seating

## Sort Options
- distance: Nearest first (requires coordinates)
- price: Lowest price first
- rating: Highest rated first
- reviews: Most reviewed first
- availability: Most available slots first

## Availability Check
```http
GET /field/{fieldId}/availability?date=2025-04-12&duration=60
```

## Search Suggestions
```http
GET /field/suggestions?query=football+sportstown
```

## Popular Searches
```http
GET /field/popular?city=Sportstown&period=week
```

## Search Analytics
- Track popular search terms
- Monitor search-to-booking conversion
- Analyze filter usage patterns
- Optimize search relevance

## Geolocation Features
- Current location detection
- Nearby field suggestions
- Distance calculations
- Map integration support

## Cache Strategy
- Search results cached for 5 minutes
- Availability data cached for 1 minute
- Popular searches cached for 1 hour
- Location-based caching

## Common Errors
- 400: Invalid search parameters
- 422: Invalid date format
- 429: Too many search requests (rate limited)

## Performance Optimizations
- Database indexing on search fields
- Elasticsearch integration for text search
- Redis caching for frequent searches
- Pagination for large result sets

## See Also
- api_field_management.md - Field data structure
- api_reviews_ratings.md - Rating integration
- roles_consumer_users.md - User search permissions