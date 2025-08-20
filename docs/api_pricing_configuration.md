# FindYourTurf - API: Pricing Configuration

**Scope**: Flexible pricing models and dynamic pricing configuration
**Related Files**: api_field_management.md, api_scheduling_system.md, api_booking_flow.md
**Last Updated**: 2025-08-20

---

## Overview
Comprehensive pricing system supporting hourly rates, time-based pricing, seasonal variations, and zone-specific pricing.

## Key Features
- Base hourly pricing
- Time block specific pricing
- Seasonal pricing variations
- Zone-based pricing
- Dynamic pricing rules
- Promotional pricing

## Basic Field Pricing
```http
PUT /field/{fieldId}/pricing
{
  "pricePerHour": 100,
  "currency": "USD",
  "minimumBookingDuration": 60,
  "maximumBookingDuration": 240
}
```

## Time Block Pricing
```typescript
{
  "timeBlocks": [
    {
      "startTime": "09:00:00",
      "endTime": "12:00:00",
      "price": 80.00,
      "description": "Morning rates"
    },
    {
      "startTime": "12:00:00",
      "endTime": "17:00:00",
      "price": 100.00,
      "description": "Afternoon rates"
    },
    {
      "startTime": "17:00:00",
      "endTime": "22:00:00",
      "price": 120.00,
      "description": "Peak evening rates"
    }
  ]
}
```

## Seasonal Pricing
```typescript
{
  "seasonalPricing": [
    {
      "name": "Summer Season",
      "startDate": "2025-06-01",
      "endDate": "2025-08-31",
      "priceMultiplier": 1.2,
      "description": "20% increase during summer"
    },
    {
      "name": "Winter Discount",
      "startDate": "2025-12-01",
      "endDate": "2025-02-28",
      "priceMultiplier": 0.8,
      "description": "20% discount in winter"
    }
  ]
}
```

## Zone-Specific Pricing
```typescript
{
  "zoneName": "Premium Court",
  "zoneConfig": {
    "basePrice": 150.00,
    "timeBlocks": [
      {
        "startTime": "18:00:00",
        "endTime": "22:00:00",
        "price": 200.00
      }
    ]
  }
}
```

## Dynamic Pricing Rules
```typescript
{
  "dynamicPricing": {
    "enabled": true,
    "rules": [
      {
        "condition": "high_demand",
        "multiplier": 1.3,
        "description": "30% increase during high demand"
      },
      {
        "condition": "last_minute",
        "threshold": 120, // minutes before booking
        "multiplier": 0.9,
        "description": "10% discount for last-minute bookings"
      }
    ]
  }
}
```

## Promotional Pricing
```http
POST /field/{fieldId}/promotions
{
  "name": "Grand Opening Special",
  "description": "50% off for first month",
  "startDate": "2025-04-01",
  "endDate": "2025-04-30",
  "discountType": "PERCENTAGE",
  "discountValue": 50,
  "maxUses": 100,
  "applicableHours": ["09:00:00-17:00:00"]
}
```

## Price Calculation Algorithm
```typescript
function calculatePrice(
  basePrice: number,
  duration: number,
  timeBlock?: TimeBlock,
  seasonal?: SeasonalPricing,
  dynamic?: DynamicRule[]
): number {
  let finalPrice = timeBlock?.price || basePrice;
  
  // Apply seasonal multiplier
  if (seasonal) {
    finalPrice *= seasonal.priceMultiplier;
  }
  
  // Apply dynamic pricing rules
  dynamic?.forEach(rule => {
    if (rule.condition === 'high_demand' && isHighDemand()) {
      finalPrice *= rule.multiplier;
    }
  });
  
  return finalPrice * (duration / 60); // Convert to hourly rate
}
```

## Pricing Validation Rules
- Base price must be positive number
- Time blocks cannot overlap
- Seasonal dates must be valid ranges
- Discount percentages: 0-100%
- Zone prices must be positive

## Currency Support
- Primary: USD, EUR, GBP
- Automatic currency conversion
- Regional pricing variations
- Tax calculation integration

## Booking Price Preview
```http
GET /field/{fieldId}/price-preview?date=2025-04-12&startTime=14:00:00&duration=60&zoneName=Court1
```

Response:
```json
{
  "basePrice": 100.00,
  "seasonalMultiplier": 1.0,
  "timeBlockPrice": 120.00,
  "dynamicAdjustment": 1.1,
  "finalPrice": 132.00,
  "breakdown": {
    "baseHourlyRate": 100.00,
    "peakTimeAdjustment": 20.00,
    "highDemandSurcharge": 12.00
  },
  "currency": "USD"
}
```

## Pricing History
- Track pricing changes over time
- Audit log for price modifications
- Revenue impact analysis
- Competitor pricing comparison

## Common Errors
- 400: Invalid price format
- 422: Overlapping time blocks
- 400: Invalid seasonal date ranges
- 422: Negative price values

## Best Practices
- Regular pricing analysis
- A/B testing for optimal rates
- Market research integration
- Clear pricing communication

## See Also
- api_field_management.md - Field setup
- api_scheduling_system.md - Time block integration
- api_booking_flow.md - Price calculation in bookings