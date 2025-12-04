# Event Registration & Ticketing System - Architecture

## System Overview
A serverless event management platform built on AWS that enables event organizers to create and manage events while allowing attendees to discover, register, and receive digital tickets.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                          CLIENT LAYER                                │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  ┌──────────────────────┐         ┌──────────────────────┐         │
│  │  Organizer Portal    │         │   Attendee Portal    │         │
│  │  - Create Events     │         │  - Browse Events     │         │
│  │  - View Analytics    │         │  - Register          │         │
│  │  - Manage Tickets    │         │  - Download Tickets  │         │
│  └──────────┬───────────┘         └──────────┬───────────┘         │
│             │                                 │                      │
│             └─────────────────┬───────────────┘                      │
│                               │                                      │
└───────────────────────────────┼──────────────────────────────────────┘
                                │
                    ┌───────────▼───────────┐
                    │   CloudFront (CDN)    │
                    │  - Static Content     │
                    │  - SSL/TLS            │
                    └───────────┬───────────┘
                                │
┌───────────────────────────────┼──────────────────────────────────────┐
│                    AUTHENTICATION LAYER                               │
├───────────────────────────────┼──────────────────────────────────────┤
│                               │                                       │
│                    ┌──────────▼──────────┐                           │
│                    │   AWS Cognito       │                           │
│                    │  - User Pools       │                           │
│                    │  - Groups:          │                           │
│                    │    * Organizers     │                           │
│                    │    * Attendees      │                           │
│                    │  - JWT Tokens       │                           │
│                    └──────────┬──────────┘                           │
│                               │                                       │
└───────────────────────────────┼──────────────────────────────────────┘
                                │
┌───────────────────────────────┼──────────────────────────────────────┐
│                         API LAYER                                     │
├───────────────────────────────┼──────────────────────────────────────┤
│                               │                                       │
│                    ┌──────────▼──────────┐                           │
│                    │   API Gateway       │                           │
│                    │  - REST API         │                           │
│                    │  - Cognito Auth     │                           │
│                    │  - Rate Limiting    │                           │
│                    │  - CORS Enabled     │                           │
│                    └──────────┬──────────┘                           │
│                               │                                       │
└───────────────────────────────┼──────────────────────────────────────┘
                                │
                    ┌───────────┴───────────┐
                    │                       │
┌───────────────────▼───────────────────────▼──────────────────────────┐
│                      BUSINESS LOGIC LAYER                             │
├───────────────────────────────────────────────────────────────────────┤
│                                                                        │
│  ┌─────────────┐  ┌─────────────┐  ┌──────────────┐  ┌────────────┐│
│  │   Lambda    │  │   Lambda    │  │    Lambda    │  │   Lambda   ││
│  │ createEvent │  │ listEvents  │  │ createReg    │  │  getEvent  ││
│  └──────┬──────┘  └──────┬──────┘  └──────┬───────┘  └─────┬──────┘│
│         │                │                 │                 │       │
│  ┌──────▼──────┐  ┌──────▼──────┐  ┌──────▼───────┐  ┌─────▼──────┐│
│  │   Lambda    │  │   Lambda    │  │    Lambda    │  │   Lambda   ││
│  │generateTicket│ │getTicketDL  │  │processPayment│  │validateQR  ││
│  └──────┬──────┘  └──────┬──────┘  └──────┬───────┘  └─────┬──────┘│
│         │                │                 │                 │       │
└─────────┼────────────────┼─────────────────┼─────────────────┼───────┘
          │                │                 │                 │
          │                │                 │                 │
┌─────────┼────────────────┼─────────────────┼─────────────────┼───────┐
│         │    DATA & STORAGE LAYER          │                 │       │
├─────────┼────────────────┼─────────────────┼─────────────────┼───────┤
│         │                │                 │                 │       │
│  ┌──────▼────────────────▼─────────────────▼─────────────────▼────┐ │
│  │                    Amazon DynamoDB                              │ │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │ │
│  │  │Events Table  │  │Registrations │  │Tickets Table │         │ │
│  │  │PK: EVENT#id  │  │PK: REG#id    │  │PK: TICKET#id │         │ │
│  │  │- name        │  │- userId      │  │- qrCode      │         │ │
│  │  │- date        │  │- eventId     │  │- status      │         │ │
│  │  │- capacity    │  │- status      │  │- s3Key       │         │ │
│  │  │- price       │  │- paymentId   │  │- timestamp   │         │ │
│  │  └──────────────┘  └──────────────┘  └──────────────┘         │ │
│  └─────────────────────────────────────────────────────────────────┘ │
│                                                                        │
│  ┌─────────────────────────────────────────────────────────────────┐ │
│  │                      Amazon S3                                   │ │
│  │  ┌──────────────────┐         ┌──────────────────┐             │ │
│  │  │ Tickets Bucket   │         │ Frontend Bucket  │             │ │
│  │  │ - PDF files      │         │ - React build    │             │ │
│  │  │ - Pre-signed URLs│         │ - Static assets  │             │ │
│  │  └──────────────────┘         └──────────────────┘             │ │
│  └─────────────────────────────────────────────────────────────────┘ │
│                                                                        │
└────────────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────────────┐
│                      EXTERNAL SERVICES                                  │
├────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌──────────────────────┐         ┌──────────────────────┐            │
│  │   Stripe (Test)      │         │   CloudWatch         │            │
│  │  - Payment Intent    │         │  - Logs              │            │
│  │  - Webhooks          │         │  - Metrics           │            │
│  │  - Test Cards        │         │  - Alarms            │            │
│  └──────────────────────┘         └──────────────────────┘            │
│                                                                         │
└────────────────────────────────────────────────────────────────────────┘
```

## User Flows

### Organizer Flow
1. Sign up / Login via Cognito (Organizer role)
2. Access Organizer Dashboard
3. Create Event → Lambda → DynamoDB
4. View Registrations → Lambda → DynamoDB Query
5. View Analytics → Aggregate registration data

### Attendee Flow
1. Sign up / Login via Cognito (Attendee role)
2. Browse Events → Lambda → DynamoDB Scan
3. Select Event → View Details
4. Register → Lambda → Check Capacity
5. Payment → Stripe API → Webhook
6. Ticket Generation → Lambda → PDF + QR → S3
7. Download Ticket → Pre-signed URL → S3

### Ticket Validation Flow
1. Scan QR Code at venue
2. Decode QR data (ticketId, eventId, userId)
3. API Call → Lambda → DynamoDB
4. Check ticket status (valid/used/invalid)
5. Mark as used if valid
6. Return validation result

## Data Models

### Events Table
```json
{
  "eventId": "EVENT#uuid",
  "name": "Tech Conference 2025",
  "description": "Annual technology conference",
  "date": "2025-12-15T09:00:00Z",
  "location": "San Francisco, CA",
  "capacity": 500,
  "registeredCount": 245,
  "organizerId": "USER#uuid",
  "price": 99.99,
  "status": "active",
  "createdAt": "2025-12-03T10:00:00Z"
}
```

### Registrations Table
```json
{
  "registrationId": "REG#uuid",
  "userId": "USER#uuid",
  "eventId": "EVENT#uuid",
  "status": "confirmed",
  "paymentId": "pi_stripe_id",
  "amount": 99.99,
  "registeredAt": "2025-12-03T11:30:00Z"
}
```

### Tickets Table
```json
{
  "ticketId": "TICKET#uuid",
  "registrationId": "REG#uuid",
  "eventId": "EVENT#uuid",
  "userId": "USER#uuid",
  "qrCode": "base64_encoded_qr",
  "status": "valid",
  "s3Key": "tickets/TICKET#uuid.pdf",
  "generatedAt": "2025-12-03T11:31:00Z",
  "validatedAt": null
}
```

## API Endpoints

### Events
- `POST /events` - Create event (Organizer only)
- `GET /events` - List all events (Public)
- `GET /events/{id}` - Get event details (Public)
- `PUT /events/{id}` - Update event (Organizer only)
- `DELETE /events/{id}` - Delete event (Organizer only)

### Registrations
- `POST /registrations` - Register for event (Attendee)
- `GET /registrations` - List user's registrations (Authenticated)
- `GET /registrations/{id}` - Get registration details (Owner only)
- `GET /events/{id}/registrations` - List event registrations (Organizer only)

### Tickets
- `GET /tickets/{id}` - Get ticket details (Owner only)
- `GET /tickets/{id}/download` - Get pre-signed download URL (Owner only)
- `POST /tickets/validate` - Validate QR code (Organizer only)

### Payments
- `POST /payments/create-intent` - Create Stripe payment intent
- `POST /payments/webhook` - Stripe webhook handler

## Security Considerations

1. **Authentication**: All API endpoints require Cognito JWT tokens
2. **Authorization**: Role-based access control via Cognito groups
3. **Data Encryption**: 
   - DynamoDB encryption at rest
   - S3 bucket encryption (AES-256)
   - HTTPS/TLS for all communications
4. **API Security**:
   - Rate limiting on API Gateway
   - Input validation in Lambda functions
   - SQL injection prevention (NoSQL)
5. **Ticket Security**:
   - Unique QR codes per ticket
   - One-time use validation
   - Pre-signed URLs with expiration

## Scalability Design

1. **Auto-scaling**: Lambda scales automatically
2. **Database**: DynamoDB on-demand pricing scales with load
3. **CDN**: CloudFront caches static content globally
4. **API**: API Gateway handles millions of requests
5. **Storage**: S3 unlimited storage capacity

## Cost Optimization

1. **Lambda**: Pay per invocation, 1M free requests/month
2. **DynamoDB**: On-demand pricing, no idle costs
3. **S3**: Lifecycle policies to archive old tickets
4. **CloudFront**: Cache static content to reduce origin requests
5. **Cognito**: Free tier up to 50K MAU

## Monitoring & Logging

1. **CloudWatch Logs**: All Lambda function logs
2. **CloudWatch Metrics**: API Gateway, Lambda, DynamoDB metrics
3. **CloudWatch Alarms**: Error rates, latency, throttling
4. **X-Ray**: Distributed tracing for debugging
5. **CloudTrail**: Audit logs for compliance

## Disaster Recovery

1. **DynamoDB**: Point-in-time recovery enabled
2. **S3**: Versioning enabled for ticket bucket
3. **Multi-AZ**: All services deployed across availability zones
4. **Backup**: Daily snapshots of DynamoDB tables
5. **CloudFormation**: Infrastructure as Code for quick recovery
