# find-your-turf

## Current Implementation Status

### Overview
FindYourTurf is a NestJS-based backend application that provides APIs for managing sports facilities, bookings, and user interactions. The system implements role-based access control with JWT authentication and includes features for field management, scheduling, bookings, and reviews.

### Implemented Features
- JWT-based authentication with role-based access control
- Field management system with scheduling capabilities
- Brand/Company management for facility owners
  - One-to-one relationship between company users and brands
  - Each company user can create and maintain only one brand
  - All fields created by a user are automatically associated with their brand
- Field search with multiple filtering options
- Review and rating system for fields
- Booking management
- Rate limiting and security measures
- Staff management system

#### Available Roles
1. **Company**
   - Can create and manage exactly one brand
   - Full access to their own facility management
   - Can create and manage fields under their brand

2. **Facility Manager**
   - Full access to facility management
   - Can manage schedules, pricing, and staff
   - Can view reports and analytics

3. **Maintenance Staff**
   - Can update facility schedules
   - Limited access to facility management

4. **Customer Service**
   - Can manage bookings
   - Can respond to reviews
   - Can access reports
   - Cannot modify facility settings

5. **Consumer**
   - Can search and book facilities
   - Can leave reviews
   - Can manage their bookings

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

### API Paths
All API endpoints are prefixed with `/api/v1/`. For example, a field listing endpoint would be:
- `/api/v1/field/list`

The Swagger documentation is available at:
- `/api/docs`

### Brand-User Relationship
- Each company user can only have one brand
- The relationship is managed via a one-to-one relationship in the database
- When a company user creates a brand, it's automatically associated with their user account
- All fields created by the user are automatically associated with their brand
- A user cannot create or manage fields for brands they don't own

### Field Management
- Fields are always associated with a brand
- When creating fields, the system automatically assigns them to the user's brand
- The brandId field in the field creation DTO is optional and will default to the user's brand
- Users cannot create fields without first creating a brand
- The field management service validates that users can only manage fields under their own brand
- Fields include detailed information such as:
  - Name, address, and location
  - Sport type (football, cricket, basketball, etc.)
  - Pricing configurations for different time durations
  - Facilities and amenities
  - Description and images

#### Supported Sport Types
The system currently supports the following sport types for fields:
- Football
- Cricket
- Basketball
- Table Tennis
- Other (for any sport not explicitly listed)

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
- Role-based access control (ADMIN, COMPANY, CONSUMER, FACILITY_MANAGER, MAINTENANCE_STAFF, CUSTOMER_SERVICE)
- Rate limiting:
  - Default: 100 requests per minute
  - Auth endpoints: 5 requests per minute
- Request validation and sanitization
- Secure error handling and logging

### API Documentation
The application includes comprehensive API documentation via Swagger:
- Available at `/api/docs`
- Includes all endpoints, request/response models, and authentication requirements
- Supports testing endpoints directly from the documentation
- Organized by tags: auth, fields, bookings, users, brands, reviews, admin
- Bearer token authentication for protected endpoints
- Refresh token cookie authentication for token refresh

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
Inspired by the JWT security narrative presented in the "Scoring Goals Securely" article, this project requires robust, secure authentication and authorization processes. JWTs will be used to manage access across different panels, ensuring that:
- Users (companies, consumers, admin) are securely authenticated.
- Tokens are signed, issued, and verified following best practices.
- Refresh token strategies are implemented to allow seamless user experiences.

---

## 2. Project Vision & Objectives

### 2.1. Vision
To create a secure and scalable backend system for "FindYourTurf" that provides an intuitive API for booking sports facilities. The system will serve as the backbone for a multi-panel application with tailored functionality for facility providers, end users, and administrators.

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
- **JWT Best Practices & Secure Storage:** Refer to the "Scoring Goals Securely: The JWT Playbook in 'FindYourTurf'" article by Abdullah Md. Sarwar cite4.
- **TypeORM Documentation:** [https://typeorm.io](https://typeorm.io)
- **NestJS Documentation:** [https://docs.nestjs.com](https://docs.nestjs.com)

---

