# Event Ticketing System - Architecture Diagram

## System Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           FRONTEND LAYER                                 │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │  React Application (S3 + CloudFront)                             │  │
│  │  - User Authentication (Cognito)                                 │  │
│  │  - Event Browsing & Creation                                     │  │
│  │  - Registration & Payment (Stripe)                               │  │
│  │  - Ticket Management                                             │  │
│  │  - Organizer Dashboard                                           │  │
│  └──────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    │ HTTPS
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                        AUTHENTICATION LAYER                              │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │  AWS Cognito User Pool                                           │  │
│  │  - User Registration & Login                                     │  │
│  │  - Email Verification                                            │  │
│  │  - JWT Token Generation                                          │  │
│  │  - User Groups (Organizers, Attendees)                           │  │
│  └──────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    │ JWT Token
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                           API GATEWAY LAYER                              │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │  API Gateway (REST API) - us-east-1                              │  │
│  │  ├─ POST   /events              (Create Event)                   │  │
│  │  ├─ GET    /events              (List Events)                    │  │
│  │  ├─ GET    /events/{id}         (Get Event)                      │  │
│  │  ├─ POST   /registrations       (Create Registration)            │  │
│  │  ├─ GET    /my-events           (Get Organizer Events)           │  │
│  │  └─ GET    /events/{id}/registrations (Get Event Registrations)  │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                                                                          │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │  API Gateway (REST API) - eu-north-1                             │  │
│  │  ├─ POST   /create-payment-intent (Create Payment)               │  │
│  │  ├─ GET    /tickets              (Get My Tickets)                │  │
│  │  ├─ GET    /tickets/{id}         (Download Ticket)               │  │
│  │  └─ POST   /validate-ticket      (Validate Ticket)               │  │
│  └──────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    │ Invoke
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                          LAMBDA FUNCTIONS LAYER                          │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │  Phase 2 Functions (us-east-1)                                   │  │
│  │  ├─ createEvent          - Create new event                      │  │
│  │  ├─ listEvents           - List all events                       │  │
│  │  ├─ getEvent             - Get event details                     │  │
│  │  └─ createRegistration   - Register for event                    │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                                                                          │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │  Phase 3 Functions (eu-north-1)                                  │  │
│  │  ├─ processPayment       - Create Stripe payment intent          │  │
│  │  ├─ generateTicket       - Generate PDF ticket with QR code      │  │
│  │  ├─ getTicketDownload    - Get pre-signed S3 URL                 │  │
│  │  └─ validateTicket       - Validate QR code at entry             │  │
│  └──────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    │ Read/Write
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                          DATABASE LAYER                                  │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │  Amazon DynamoDB (us-east-1)                                     │  │
│  │                                                                   │  │
│  │  ┌────────────────────────────────────────────────────────────┐ │  │
│  │  │  Events Table                                              │ │  │
│  │  │  PK: eventId                                               │ │  │
│  │  │  GSIs: organizerId, date, category, status                 │ │  │
│  │  └────────────────────────────────────────────────────────────┘ │  │
│  │                                                                   │  │
│  │  ┌────────────────────────────────────────────────────────────┐ │  │
│  │  │  Registrations Table                                       │ │  │
│  │  │  PK: registrationId                                        │ │  │
│  │  │  GSIs: userId, eventId, status                             │ │  │
│  │  └────────────────────────────────────────────────────────────┘ │  │
│  │                                                                   │  │
│  │  ┌────────────────────────────────────────────────────────────┐ │  │
│  │  │  Tickets Table                                             │ │  │
│  │  │  PK: ticketId                                              │ │  │
│  │  │  GSIs: userId, eventId, registrationId, qrCode             │ │  │
│  │  └────────────────────────────────────────────────────────────┘ │  │
│  └──────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    │ Store/Retrieve
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                          STORAGE LAYER                                   │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │  Amazon S3                                                        │  │
│  │  ├─ Frontend Bucket (Static Website)                             │  │
│  │  │  └─ React build files                                         │  │
│  │  └─ Tickets Bucket (Private)                                     │  │
│  │     └─ PDF tickets with QR codes                                 │  │
│  └──────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    │ Distribute
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                          CDN LAYER                                       │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │  Amazon CloudFront                                                │  │
│  │  - Global content delivery                                        │  │
│  │  - HTTPS encryption                                               │  │
│  │  - Caching for performance                                        │  │
│  └──────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                       EXTERNAL SERVICES                                  │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │  Stripe Payment Gateway (Test Mode)                              │  │
│  │  - Payment intent creation                                        │  │
│  │  - Card processing                                                │  │
│  │  - Payment confirmation                                           │  │
│  └──────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────┘
```

## Data Flow Diagrams

### 1. User Registration Flow
```
User → Frontend → Cognito → Email Verification → Login → JWT Token
```

### 2. Event Creation Flow
```
Organizer → Frontend → API Gateway → Lambda (createEvent) → DynamoDB
                                                           → Return Event ID
```

### 3. Event Registration & Payment Flow
```
Attendee → Browse Events → Select Event → Register
    ↓
API Gateway → createRegistration Lambda → DynamoDB (Registration)
    ↓
Frontend → Stripe Elements → Payment Intent
    ↓
API Gateway → processPayment Lambda → Stripe API
    ↓
Payment Success → generateTicket Lambda → Create PDF with QR
    ↓
Store in S3 → Update DynamoDB (Ticket) → Return Ticket ID
```

### 4. Ticket Download Flow
```
User → My Tickets → Click Download
    ↓
API Gateway → getTicketDownload Lambda → Generate Pre-signed S3 URL
    ↓
Frontend → Open URL → Download PDF from S3
```

### 5. Ticket Validation Flow
```
Scanner → Scan QR Code → Extract Ticket ID
    ↓
API Gateway → validateTicket Lambda → Check DynamoDB
    ↓
Validate Status → Update as "used" → Return Valid/Invalid
```

## Security Architecture

### Authentication & Authorization
- **Cognito User Pool**: Manages user authentication
- **JWT Tokens**: Secure API access
- **API Gateway Authorizer**: Validates JWT tokens
- **User Groups**: Role-based access control (Organizers, Attendees)

### Data Security
- **DynamoDB Encryption**: At-rest encryption enabled
- **S3 Bucket Policies**: Private buckets with restricted access
- **Pre-signed URLs**: Time-limited access to tickets
- **HTTPS Only**: All communication encrypted in transit

### API Security
- **CORS Configuration**: Restricted origins
- **Rate Limiting**: API Gateway throttling
- **Input Validation**: Lambda function validation
- **Error Handling**: No sensitive data in error messages

## Scalability Features

### Auto-Scaling Components
- **Lambda Functions**: Automatic scaling based on demand
- **DynamoDB**: On-demand capacity mode
- **CloudFront**: Global edge locations
- **API Gateway**: Handles millions of requests

### Performance Optimizations
- **CloudFront Caching**: Reduced latency for static content
- **DynamoDB GSIs**: Fast queries without table scans
- **Lambda Concurrency**: Parallel execution
- **S3 Transfer Acceleration**: Fast file uploads/downloads

## High Availability

### Multi-AZ Deployment
- **DynamoDB**: Automatically replicated across AZs
- **Lambda**: Runs in multiple AZs
- **S3**: 99.999999999% durability
- **CloudFront**: Global distribution

### Disaster Recovery
- **DynamoDB Backups**: Point-in-time recovery
- **S3 Versioning**: File version history
- **CloudFormation**: Infrastructure as Code for quick recovery
- **Multi-Region**: Phase 3 in eu-north-1 for redundancy

## Monitoring & Logging

### AWS Services Used
- **CloudWatch Logs**: Lambda function logs
- **CloudWatch Metrics**: Performance monitoring
- **X-Ray**: Distributed tracing
- **API Gateway Logs**: Request/response logging

### Key Metrics Tracked
- API response times
- Lambda execution duration
- DynamoDB read/write capacity
- Error rates and types
- User authentication success/failure

## Technology Stack

### Frontend
- React 19.2.1
- AWS Amplify 6.15.8
- Stripe React Elements
- Axios for API calls

### Backend
- Node.js 18.x
- AWS SDK v3
- Stripe Node.js SDK
- PDFKit for ticket generation
- QRCode library

### Infrastructure
- AWS CloudFormation
- DynamoDB
- Lambda
- API Gateway
- S3
- CloudFront
- Cognito

### External Services
- Stripe (Payment Processing)
- Email (Cognito for verification)
