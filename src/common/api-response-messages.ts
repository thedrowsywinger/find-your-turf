export enum ApiResponseMessages {

    SUCCESS = 'Success',
    SYSTEM_ERROR = 'System Error',

    NO_FIELDS_AVAILABLE_AT_THE_MOMENT = 'No Fields Available At The Moment',

    INVALID_QUERY_PARAMETER_PROVIDED = 'Invalid Field Filter Provided',
    INVALID_BRAND = 'Invalid Brand Provided',

    INVALID_CREDENTIALS = 'Invalid email or password',
    USER_REGISTERED = 'User registered successfully',
    EMAIL_EXISTS = 'Email already exists',
    INVALID_TOKEN = 'Invalid or expired token',
    UNAUTHORIZED = 'Unauthorized access',
    FORBIDDEN = 'Forbidden access',

    INVALID_FIELD = 'Invalid field selected',
    FIELD_ALREADY_BOOKED = 'Field is already booked for the selected time slot',
    BOOKING_CREATION_FAILED = 'Failed to create booking',
    BOOKING_FETCH_FAILED = 'Failed to fetch bookings',
    BOOKING_NOT_FOUND = 'Booking not found',
    BOOKING_ALREADY_CANCELLED = 'Booking is already cancelled',
    BOOKING_CANCELLATION_FAILED = 'Failed to cancel booking',

    INVALID_DATE_RANGE = 'Invalid date range provided',
    INVALID_PRICE_RANGE = 'Invalid price range provided',
    FIELD_NOT_AVAILABLE = 'Field is not available for the selected time slot',
    INVALID_SPORT_TYPE = 'Invalid sport type provided',
    SEARCH_ERROR = 'Error occurred while searching fields',

    SCHEDULE_NOT_FOUND = 'Schedule not found',
    SCHEDULE_CREATION_FAILED = 'Failed to create schedule',
    SCHEDULE_UPDATE_FAILED = 'Failed to update schedule',
    SCHEDULE_DELETION_FAILED = 'Failed to delete schedule',
    INVALID_SCHEDULE_TIME = 'Invalid schedule time provided',
    SCHEDULE_OVERLAP = 'Schedule overlaps with existing schedule',
    SCHEDULE_OUTSIDE_FIELD_HOURS = 'Schedule is outside field operating hours',
    INVALID_DAY_OF_WEEK = 'Invalid day of week provided',
    NO_SCHEDULE_AVAILABLE = 'No schedule available for the selected time'

}