# find-your-turf

## Current Implementation Status

### Overview
FindYourTurf is a NestJS-based backend application that provides APIs for managing sports facilities, bookings, and user interactions. The system implements role-based access control with JWT authentication and includes features for field management, scheduling, bookings, and reviews.

### Implemented Features
- JWT-based authentication with role-based access control
- Field management system with scheduling capabilities
- Brand/Company management for facility owners
- Field search with multiple filtering options
- Review and rating system for fields
- Booking management
- Rate limiting and security measures
- Staff management system

### API Endpoints Documentation

#### Authentication
- **POST /auth/register**
  - Register a new user (company/consumer/admin)
  - Body: 
    ```json
    {
      "email": "string",
      "password": "string",
      "role": "COMPANY|CONSUMER|ADMIN"
    }
    ```

- **POST /auth/login**
  - Authenticate user and receive JWT tokens
  - Body:
    ```json
    {
      "email": "string",
      "password": "string"
    }
    ```
  - Response:
    ```json
    {
      "accessToken": "string",
      "refreshToken": "string"
    }
    ```

#### Field Management
- **GET /field/list**
  - Search and filter fields
  - Query Parameters:
    - name: string (optional)
    - address: string (optional)
    - city: string (optional)
    - country: string (optional)
    - brandId: number (optional)
    - availableFrom: string (optional, ISO date)
    - availableTo: string (optional, ISO date)
    - minPrice: number (optional)
    - maxPrice: number (optional)
    - sportType: string (optional)
    - dayOfWeek: string (optional)
    - timeSlot: string (optional)
    - minRating: number (optional)
    - maxRating: number (optional)
    - hasReviews: boolean (optional)
    - page: number (default: 1)
    - limit: number (default: 10)

- **POST /field/create** 🔒 (Company Only)
  - Create a new field
  - Body:
    ```json
    {
      "name": "string",
      "description": "string",
      "address": "string",
      "city": "string",
      "country": "string",
      "sportType": "string",
      "pricePerHour": number,
      "brandId": number
    }
    ```

- **POST /field/:fieldId/schedules** 🔒 (Company Only)
  - Add schedule for a field
  - Body:
    ```json
    {
      "dayOfWeek": "MONDAY|TUESDAY|WEDNESDAY|THURSDAY|FRIDAY|SATURDAY|SUNDAY",
      "openTime": "string (HH:mm:ss)",
      "closeTime": "string (HH:mm:ss)",
      "isAvailable": boolean,
      "specialPrice": number,
      "zoneName": "string (optional)",
      "zoneConfig": {
        "capacity": "number (optional)",
        "description": "string (optional)",
        "amenities": "string[] (optional)"
      },
      "recurrenceType": "DAILY|WEEKLY|BIWEEKLY|MONTHLY|CUSTOM",
      "recurrenceConfig": {
        "interval": "number (optional)",
        "daysOfWeek": "string[] (optional)",
        "monthlyDays": "number[] (optional)",
        "endDate": "string (optional, ISO date)",
        "exceptions": "string[] (optional, ISO dates)"
      },
      "timeBlocks": [
        {
          "startTime": "string (HH:mm:ss)",
          "endTime": "string (HH:mm:ss)",
          "capacity": "number (optional)",
          "price": "number (optional)"
        }
      ]
    }
    ```

- **PUT /field/:fieldId/schedules** 🔒 (Company Only)
  - Update field schedule
  - Body:
    ```json
    {
      "scheduleId": number,
      "dayOfWeek": "MONDAY|TUESDAY|WEDNESDAY|THURSDAY|FRIDAY|SATURDAY|SUNDAY",
      "openTime": "string (HH:mm:ss)",
      "closeTime": "string (HH:mm:ss)",
      "isAvailable": boolean,
      "specialPrice": number,
      "zoneName": "string (optional)",
      "zoneConfig": {
        "capacity": "number (optional)",
        "description": "string (optional)",
        "amenities": "string[] (optional)"
      },
      "recurrenceType": "DAILY|WEEKLY|BIWEEKLY|MONTHLY|CUSTOM",
      "recurrenceConfig": {
        "interval": "number (optional)",
        "daysOfWeek": "string[] (optional)",
        "monthlyDays": "number[] (optional)",
        "endDate": "string (optional, ISO date)",
        "exceptions": "string[] (optional, ISO dates)"
      },
      "timeBlocks": [
        {
          "startTime": "string (HH:mm:ss)",
          "endTime": "string (HH:mm:ss)",
          "capacity": "number (optional)",
          "price": "number (optional)"
        }
      ]
    }
    ```

- **GET /field/:fieldId/schedules**
  - Get all schedules for a field

- **DELETE /field/:fieldId/schedules/:scheduleId** 🔒 (Company Only)
  - Delete a field schedule

- **GET /field/:fieldId/availability**
  - Check field availability for a specific date
  - Query Parameters:
    - date: string (ISO date)
  - Response:
    ```json
    {
      "available": boolean,
      "reason": "string|null",
      "schedule": object,
      "specialPrice": "number|null"
    }
    ```

- **POST /field/:fieldId/pricing** 🔒 (Company Only)
  - Update pricing configuration for a field
  - Body:
    ```json
    {
      "pricing": [
        {
          "price": number,
          "durationInMinutes": number (minimum: 30)
        }
      ]
    }
    ```
  - Example:
    ```json
    {
      "pricing": [
        {
          "price": 50.00,
          "durationInMinutes": 60
        },
        {
          "price": 70.00,
          "durationInMinutes": 90
        },
        {
          "price": 90.00,
          "durationInMinutes": 120
        }
      ]
    }
    ```
  - Response:
    ```json
    {
      "message": "Field pricing updated successfully"
    }
    ```

- **GET /field/:fieldId/pricing**
  - Get pricing configuration for a field
  - Response:
    ```json
    {
      "pricing": [
        {
          "id": number,
          "price": number,
          "durationInMinutes": number,
          "status": number,
          "createdAt": string,
          "updatedAt": string
        }
      ]
    }
    ```

#### Reviews
- **POST /field/:fieldId/reviews** 🔒 (Authenticated Users)
  - Create a review for a field
  - Body:
    ```json
    {
      "bookingId": number,
      "rating": number,
      "review": "string"
    }
    ```

- **PUT /field/reviews/:reviewId/respond** 🔒 (Company Only)
  - Respond to a field review
  - Body:
    ```json
    {
      "response": "string"
    }
    ```

- **GET /field/:fieldId/reviews**
  - Get field reviews
  - Query Parameters:
    - page: number (default: 1)
    - limit: number (default: 10)

#### Brand Management
- **POST /brand/create** 🔒 (Company Only)
  - Create a new brand with initial field
  - Body:
    ```json
    {
      "brandInfo": {
        "name": "string",
        "description": "string",
        "contact": "string"
      },
      "fieldInfo": {
        "name": "string",
        "description": "string",
        "sportType": "string",
        "address": "string"
      }
    }
    ```

#### Staff Management
- **POST /staff** 🔒 (Company Only)
  - Create a new staff member account
  - Body:
    ```json
    {
      "username": "string",
      "email": "string",
      "password": "string",
      "role": "facility_manager|maintenance_staff|customer_service",
      "permissions": {
        "canManageStaff": "boolean (optional)",
        "canManageBookings": "boolean (optional)",
        "canUpdateSchedules": "boolean (optional)",
        "canRespondToReviews": "boolean (optional)",
        "canAccessReports": "boolean (optional)",
        "canUpdatePricing": "boolean (optional)",
        "canModifyFacilities": "boolean (optional)"
      }
    }
    ```

- **PUT /staff/:staffId/permissions** 🔒 (Company Only)
  - Update staff member permissions
  - Body:
    ```json
    {
      "permissions": {
        "canManageStaff": "boolean",
        "canManageBookings": "boolean",
        "canUpdateSchedules": "boolean",
        "canRespondToReviews": "boolean",
        "canAccessReports": "boolean",
        "canUpdatePricing": "boolean",
        "canModifyFacilities": "boolean"
      }
    }
    ```

- **GET /staff** 🔒 (Company Only)
  - List all staff members
  - Query Parameters:
    - role: string (optional, filter by role)
    - search: string (optional, search by username/email)

- **DELETE /staff/:staffId** 🔒 (Company Only)
  - Remove a staff member

- **GET /staff/:staffId/audit-logs** 🔒 (Company Only)
  - Get audit logs for a specific staff member

### Staff Roles and Permissions

#### Available Roles
1. **Facility Manager**
   - Full access to facility management
   - Can manage schedules, pricing, and staff
   - Can view reports and analytics

2. **Maintenance Staff**
   - Can update facility schedules
   - Limited access to facility management

3. **Customer Service**
   - Can manage bookings
   - Can respond to reviews
   - Can access reports
   - Cannot modify facility settings

#### Default Permissions by Role

1. **Facility Manager**
   - All permissions enabled by default:
     - Staff management
     - Booking management
     - Schedule updates
     - Review responses
     - Report access
     - Pricing updates
     - Facility modifications

2. **Maintenance Staff**
   - Limited permissions:
     - Schedule updates

3. **Customer Service**
   - Customer-facing permissions:
     - Booking management
     - Review responses
     - Report access

#### Audit Logging
- All staff actions are automatically logged
- Logs include:
  - Action type
  - Timestamp
  - IP address
  - User agent
  - Detailed changes
  - Success/failure status

### Advanced Scheduling Features

The system supports advanced scheduling capabilities:

1. **Multi-Zone Management**
   - Divide fields into zones with separate configurations
   - Set zone-specific capacity and amenities
   - Configure independent pricing per zone

2. **Time Block Segmentation**
   - Create multiple time blocks within a schedule
   - Set block-specific pricing and capacity
   - Manage fine-grained availability

3. **Advanced Recurrence Patterns**
   - Daily: Repeat every N days
   - Weekly: Standard weekly schedule
   - Biweekly: Alternate week schedules
   - Monthly: Specific days of month
   - Custom: Complex patterns with exceptions

4. **Schedule Validation**
   - Automatic validation of time blocks against operating hours
   - Conflict detection for overlapping schedules
   - Recurrence rule validation

### Response Format
All API endpoints return responses in a standardized format:
```json
{
  "statusCode": number,
  "success": boolean,
  "message": "string",
  "data": object|null,
  "errors": string[]|null
}
```

### Security Features
- JWT-based authentication
- Role-based access control (COMPANY, CONSUMER, ADMIN)
- Rate limiting:
  - Default: 100 requests per minute
  - Auth endpoints: 5 requests per minute
- Request validation and sanitization
- Secure error handling and logging

🔒 - Requires authentication
---

# Project Requirements Document (PRD)

## 1. Overview

### 1.1. Purpose
The purpose of this document is to specify the backend requirements for a field-booking application that allows users to search, view, and book various sports fields and facilities (e.g., football fields, cricket fields, basketball courts, table tennis tables, etc.). The backend will power three distinct panels:
- **Company Panel:** For sports facility owners or companies to manage their offerings, view booking history, set pricing, and schedule availability.
- **Consumer Panel:** For end users to find and book sports facilities.
- **Admin Panel:** For super admins to manage the overall system, including user management, bookings, content moderation, and system configuration.

### 1.2. Background and Context
Inspired by the JWT security narrative presented in the “Scoring Goals Securely” article, this project requires robust, secure authentication and authorization processes. JWTs will be used to manage access across different panels, ensuring that:
- Users (companies, consumers, admin) are securely authenticated.
- Tokens are signed, issued, and verified following best practices.
- Refresh token strategies are implemented to allow seamless user experiences.

---

## 2. Project Vision & Objectives

### 2.1. Vision
To create a secure and scalable backend system for “FindYourTurf” that provides an intuitive API for booking sports facilities. The system will serve as the backbone for a multi-panel application with tailored functionality for facility providers, end users, and administrators.

### 2.2. Objectives
- **Secure Authentication & Authorization:** Implement JWT authentication (using best practices such as RS256 where applicable) with a robust refresh token mechanism to maintain secure, long-lived sessions.
- **Efficient Data Management:** Structure and manage data using PostgreSQL and TypeORM for effective, reliable data access and migration processes.
- **Scalable APIs:** Develop RESTful endpoints (or GraphQL endpoints, if needed) that are modular, maintainable, and scalable to support thousands of concurrent users.
- **Role-Based Access Control (RBAC):** Ensure that the different panels (company, consumer, admin) expose only the functionalities relevant to each role.
- **Extensibility:** Build a modular architecture that allows for future extensions—such as payment integrations, notifications, and analytics—without compromising on performance or security.

---

## 3. Stakeholders & User Roles

### 3.1. Stakeholders
- **Field Providers / Companies:** Sports facility owners and companies that list their fields.
- **Consumers / End Users:** Individuals who search for and book the fields.
- **System Administrators:** Super admins and support staff who manage the platform and oversee system health and data integrity.

### 3.2. User Roles
- **Company User:**
  - Can register/login via secure JWT-based authentication.
  - Access a dashboard to manage fields (create/update/delete), set schedules, pricing, and view booking history.
- **Consumer/User:**
  - Can register/login, search for available fields by location, sport type, and time slots.
  - Book a facility, view personal booking history, and cancel/reschedule bookings.
- **Admin User:**
  - Has elevated privileges to manage all aspects of the platform.
  - Can view analytics, perform user management, handle disputes, monitor system performance, and perform CRUD operations across various entities.

---

## 4. System Architecture

### 4.1. Backend Components
- **API Server:**  
  - **Framework:** NestJS (Node.js based framework ensuring high modularity and testability)
  - **ORM:** TypeORM for mapping to PostgreSQL
- **Database:** PostgreSQL for relational data storage
- **Authentication & Authorization Module:**
  - Implements JWT creation, validation, and refresh mechanics.  
  - Incorporates best practices as detailed in the JWT playbook (secure token issuance, short-lived access tokens, secure refresh tokens).
- **Logging & Monitoring:** Integration with logging (e.g., Winston or Bunyan) and monitoring (e.g., Prometheus, Grafana) tools.
- **Security Layer:** Usage of HTTPS, secure headers, rate limiting, and intrusion detection/prevention mechanisms.

### 4.2. High-Level Data Flow
1. **User Requests:** Clients (companies, consumers, admins) send requests to API endpoints.
2. **Authentication:** Requests pass through an authentication middleware that validates JWTs. Invalid tokens are rejected.
3. **Business Logic Execution:** Based on the endpoint called, the API processes business logic, interacts with the database via TypeORM, and returns a response.
4. **Audit Logs:** Actions (especially those in management panels) are logged for auditing and debugging purposes.

### 4.3. System Diagram (Descriptive)
- **Client Layer:** Web or mobile app consuming REST endpoints.
- **API Gateway:** Routing incoming requests to relevant NestJS modules.
- **Service Layer:** Controllers, Services, and Repositories implementing business logic and persistence.
- **Database Layer:** PostgreSQL database with defined schemas for Users, Fields, Bookings, etc.
- **Security & Logging Layer:** Handling authentication, logging, monitoring, and error management.

---

## 5. Technical Stack
- **Backend Framework:** NestJS
- **ORM:** TypeORM
- **Database:** PostgreSQL
- **Language:** TypeScript (Node.js environment)
- **Authentication:** JWT (using secrets/RS256, access & refresh tokens)
- **Deployment:** Dockerized microservices (optional for scalability), CI/CD pipelines

---

## 6. Functional Requirements

### 6.1. Authentication & Authorization
- **JWT-Based Login/Registration:**
  - Secure endpoints for user registration and login.
  - Issue JWTs with standard claims (`sub`, `iat`, `exp`, etc.) and store minimal user data within the token.
  - Use secure storage options (e.g., HTTP-only secure cookies) to store tokens in client applications.
- **Refresh Token Mechanism:**
  - Issue long-lived refresh tokens used to generate new access tokens prior to expiration.
  - Invalidate refresh tokens upon logout or suspicious activity.
- **Role-Based Access:**
  - Implement guards or middleware in NestJS to restrict endpoint access based on user roles (company, consumer, admin).

### 6.2. Field and Facility Management (Company Panel)
- **Field Management:**
  - CRUD operations for field entities (including photos, descriptions, location coordinates, sport type, etc.).
  - Schedule and availability settings for each field (with slots, booking windows, cancellation policies).
- **Rate & Pricing Management:**
  - Set and update hourly/daily rates, discount offers, and seasonal pricing.
- **Booking History:**
  - View past and upcoming bookings.
  - Generate reports for field usage, revenue statistics, etc.
- **Notifications:**
  - Endpoints to trigger notifications (email, SMS, in-app) upon booking events or cancellations.

### 6.3. Booking & Search (Consumer Panel)
- **Search API:**
  - Allow filtering by location, sport type, availability, and price.
  - Support pagination and sorting for search results.
- **Booking Process:**
  - Endpoints to reserve a field.
  - Transaction management ensuring atomicity (booking confirmed only on successful payment, etc.).
  - Booking cancellation and rescheduling endpoints.
- **User Profile:**
  - Manage personal details, booking history, and payment methods.
- **Review & Rating System:** *(Optional Phase 2)*
  - Submit reviews and ratings for booked facilities.

### 6.4. Administration (Admin Panel)
- **User Management:**
  - View, edit, suspend, or delete any user profile.
- **Content Moderation:**
  - Oversee and update field listings, dispute resolution, and manage reviews.
- **Reporting & Analytics:**
  - Generate system-wide and individual performance reports (revenue, usage stats, active users).
- **System Configuration:**
  - Manage rate limits, API keys, and security parameters.
- **Audit & Logging:**
  - Access detailed logs of user actions and system events for security and debugging.

---

## 7. Non-Functional Requirements

### 7.1. Security
- **Data in Transit:** Enforce HTTPS for all endpoints.
- **Token Security:**
  - Sign JWTs with a secure algorithm (preferably RS256).
  - Implement short expiration times for access tokens; use long-lived refresh tokens stored securely on the server.
  - Secure storage of tokens on the client (avoid local storage when possible, favor secure HTTP-only cookies).
- **Input Validation & Sanitization:** All input must be validated and sanitized to prevent SQL injection, XSS, and other common vulnerabilities.
- **Rate Limiting:** Apply rate limiting on critical endpoints to thwart brute-force or DDoS attacks.
- **Logging & Intrusion Detection:** Integrate security logging and alerting mechanisms.

### 7.2. Performance & Scalability
- **Optimized Database Access:** Use indexing, caching, and efficient query design.
- **Modular Architecture:** Ensure services can scale horizontally (e.g., separate instances for API server, database replicas).
- **Load Balancing:** Prepare for deploying behind a load balancer with health checks.

### 7.3. Maintainability & Documentation
- **Code Organization:** Follow NestJS modularity best practices with clear separation between controllers, services, and repositories.
- **API Documentation:** Generate and maintain clear API documentation (e.g., using Swagger/OpenAPI).
- **Testing:** Implement unit and integration tests for critical components.
- **Monitoring:** Integrate application performance monitoring (APM) and logging.

---

## 8. Database Design

### 8.1. Primary Entities
- **Users:**  
  - **Attributes:** `id`, `email`, `password hash`, `role` (e.g., company, consumer, admin), `profile details`, `created_at`, `updated_at`
- **Companies / Field Providers:**  
  - **Attributes:** `id`, `user_id` (FK), `company_name`, `contact_info`, `address`, etc.
- **Fields / Facilities:**  
  - **Attributes:** `id`, `company_id` (FK), `name`, `description`, `location` (lat, long, address), `sport_type`, `pricing`, `availability schedule`, `media links`, etc.
- **Bookings:**  
  - **Attributes:** `id`, `user_id` (FK), `field_id` (FK), `booking_date`, `start_time`, `end_time`, `status` (booked, cancelled, completed), `payment details`, etc.
- **Schedules & Availability:**  
  - **Attributes:** For managing recurring time slots, special dates, and custom availability.
- **Staff:**  
  - **Attributes:** `id`, `company_id` (FK), `username`, `email`, `role`, `permissions`, `created_at`, `updated_at`
- **Audit Logs:** (For admin and compliance purposes)  
  - **Attributes:** `id`, `user_id`, `action`, `timestamp`, `metadata`

### 8.2. Relationships
- One-to-Many relationship between **Companies** and **Fields**.
- One-to-Many relationship between **Users** and **Bookings**.
- One-to-Many relationship between **Companies** and **Staff**.
- Foreign key relationships are enforced for referential integrity.
- Use database migrations (via TypeORM) to manage changes.

---

## 9. API Endpoints Overview

### 9.1. Authentication Endpoints
- **POST /auth/register** – Create a new user account (with role specification).
- **POST /auth/login** – Authenticate user credentials and issue an access token and refresh token.
- **POST /auth/refresh** – Validate refresh token and issue a new access token.
- **POST /auth/logout** – Invalidate the refresh token.

### 9.2. Company (Field Provider) Endpoints
- **GET /company/fields** – List all fields associated with the company.
- **POST /company/fields** – Create a new field entry.
- **PUT /company/fields/:id** – Update field details including scheduling and pricing.
- **DELETE /company/fields/:id** – Remove a field listing.
- **GET /company/bookings** – View booking history and upcoming bookings.
- **POST /staff** – Create a new staff member account.
- **PUT /staff/:staffId/permissions** – Update staff member permissions.
- **GET /staff** – List all staff members.
- **DELETE /staff/:staffId** – Remove a staff member.
- **GET /staff/:staffId/audit-logs** – Get audit logs for a specific staff member.

### 9.3. Consumer Endpoints
- **GET /fields/search** – Search for available fields based on parameters.
- **GET /fields/:id** – Retrieve details of a specific field.
- **POST /bookings** – Book a field (handle transactional processes).
- **PUT /bookings/:id/cancel** – Cancel or reschedule a booking.
- **GET /users/profile** – Retrieve authenticated user profile and booking history.

### 9.4. Admin Endpoints
- **GET /admin/users** – List and manage users.
- **GET /admin/fields** – Monitor and edit fields across companies.
- **GET /admin/bookings** – Access system-wide booking information.
- **POST /admin/config** – Update system configurations (rate limits, security settings).
- **GET /admin/audit-logs** – Retrieve audit logs for compliance and debugging.

---

## 10. Security Implementation (JWT Best Practices)
- **Token Creation & Validation:**  
  - Issue JWT on registration/login containing minimal user info.  
  - Sign tokens with a strong algorithm (RS256 or HMAC with a robust secret).
- **Token Expiry & Refresh:**  
  - Access tokens: Short-lived (e.g., 15 minutes – 1 hour)  
  - Refresh tokens: Long-lived, securely stored server-side.
- **Storage Considerations:**  
  - Use secure HTTP-only cookies for browser storage (or secure local storage with caution).
- **Revocation Strategy:**  
  - Maintain a token blacklist or use token versioning on sensitive endpoints.
- **HTTPS:**  
  - Enforce secure communication (TLS/SSL) for all data in transit.
- **Audit Logging:**  
  - Record login attempts, token refresh actions, and failed validations.

---

## 11. Milestones & Timeline (Example)

1. **Planning & Architecture Design:** 2–3 weeks  
   - Finalize PRD, identify key components, plan schema design.
2. **Backend Skeleton & Authentication Module:** 3–4 weeks  
   - Implement core NestJS structure, secure JWT authentication, API documentation.
3. **Company & Consumer Module Development:** 4–6 weeks  
   - Build field management, booking, and search APIs.
4. **Admin Panel Integration & Logging:** 3 weeks  
   - Develop admin endpoints, integrate monitoring/logging and audit trails.
5. **Testing, Bug Fixes & Performance Tuning:** 2–3 weeks  
6. **Deployment & Post-Launch Monitoring:** Ongoing

---

## 12. Appendices

### 12.1. Glossary
- **JWT:** JSON Web Token, used for securely transmitting information.
- **RBAC:** Role-Based Access Control.
- **ORM:** Object-Relational Mapping.
- **CRUD:** Create, Read, Update, Delete operations.
- **API:** Application Programming Interface.

### 12.2. References
- **JWT Best Practices & Secure Storage:** Refer to the “Scoring Goals Securely: The JWT Playbook in 'FindYourTurf'” article by Abdullah Md. Sarwar cite4.
- **TypeORM Documentation:** [https://typeorm.io](https://typeorm.io)
- **NestJS Documentation:** [https://docs.nestjs.com](https://docs.nestjs.com)

---

## 13. Conclusion

This PRD outlines a secure, maintainable, and scalable backend architecture for a field-booking application. By leveraging NestJS, TypeORM, and PostgreSQL, along with robust JWT authentication practices, “FindYourTurf” will offer a seamless experience across all user roles while ensuring data integrity and strong security. This document serves as the foundation for subsequent design, development, and deployment phases.

---

