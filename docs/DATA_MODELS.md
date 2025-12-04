# Data Models & DynamoDB Schema Design

## Overview
This document details the DynamoDB table structures, access patterns, and indexing strategies for the Event Ticketing System.

## Design Principles
1. **Single Table Design**: Consider for future optimization
2. **Query Patterns First**: Design based on access patterns
3. **Partition Key Strategy**: Ensure even distribution
4. **GSI Usage**: Support secondary access patterns
5. **Sparse Indexes**: Optimize for specific queries

---

## Table 1: Events

### Primary Key Structure
- **Partition Key (PK)**: `eventId` (String) - Format: `EVENT#<uuid>`
- **Sort Key**: None (single item per event)

### Attributes
```json
{
  "eventId": "EVENT#550e8400-e29b-41d4-a716-446655440000",
  "name": "Tech Conference 2025",
  "description": "Annual technology conference featuring latest innovations",
  "date": "2025-12-15T09:00:00Z",
  "endDate": "2025-12-15T18:00:00Z",
  "location": "Moscone Center, San Francisco, CA",
  "venue": "Main Hall",
  "capacity": 500,
  "registeredCount": 245,
  "organizerId": "USER#123e4567-e89b-12d3-a456-426614174000",
  "organizerName": "John Doe",
  "organizerEmail": "john@example.com",
  "price": 99.99,
  "currency": "USD",
  "category": "Technology",
  "tags": ["tech", "conference", "networking"],
  "status": "active",
  "imageUrl": "https://cdn.example.com/event-image.jpg",
  "createdAt": "2025-12-03T10:00:00Z",
  "updatedAt": "2025-12-03T10:00:00Z"
}
```

### Global Secondary Indexes (GSI)

#### GSI-1: OrganizerIndex
- **Partition Key**: `organizerId`
- **Sort Key**: `date`
- **Purpose**: Query all events by organizer, sorted by date
- **Projection**: ALL

#### GSI-2: DateIndex
- **Partition Key**: `status`
- **Sort Key**: `date`
- **Purpose**: Query active events sorted by date
- **Projection**: ALL

#### GSI-3: CategoryIndex
- **Partition Key**: `category`
- **Sort Key**: `date`
- **Purpose**: Browse events by category
- **Projection**: ALL

### Access Patterns
1. Get event by ID: `GetItem(eventId)`
2. List all active events: `Query(GSI-2, status='active')`
3. List organizer's events: `Query(GSI-1, organizerId)`
4. List events by category: `Query(GSI-3, category)`
5. Search events by date range: `Query(GSI-2, status='active', date BETWEEN)`

---

## Table 2: Registrations

### Primary Key Structure
- **Partition Key (PK)**: `registrationId` (String) - Format: `REG#<uuid>`
- **Sort Key**: None

### Attributes
```json
{
  "registrationId": "REG#660e8400-e29b-41d4-a716-446655440001",
  "userId": "USER#123e4567-e89b-12d3-a456-426614174001",
  "userName": "Jane Smith",
  "userEmail": "jane@example.com",
  "eventId": "EVENT#550e8400-e29b-41d4-a716-446655440000",
  "eventName": "Tech Conference 2025",
  "eventDate": "2025-12-15T09:00:00Z",
  "status": "confirmed",
  "paymentId": "pi_3MtwBwLkdIwHu7ix28a3tqPa",
  "paymentStatus": "succeeded",
  "amount": 99.99,
  "currency": "USD",
  "ticketId": "TICKET#770e8400-e29b-41d4-a716-446655440002",
  "registeredAt": "2025-12-03T11:30:00Z",
  "updatedAt": "2025-12-03T11:30:00Z",
  "metadata": {
    "source": "web",
    "referrer": "google"
  }
}
```

### Global Secondary Indexes (GSI)

#### GSI-1: UserIndex
- **Partition Key**: `userId`
- **Sort Key**: `registeredAt`
- **Purpose**: Query all registrations by user
- **Projection**: ALL

#### GSI-2: EventIndex
- **Partition Key**: `eventId`
- **Sort Key**: `registeredAt`
- **Purpose**: Query all registrations for an event
- **Projection**: ALL

#### GSI-3: PaymentIndex
- **Partition Key**: `paymentId`
- **Sort Key**: None
- **Purpose**: Lookup registration by payment ID (for webhooks)
- **Projection**: ALL
- **Sparse Index**: Only items with paymentId

### Access Patterns
1. Get registration by ID: `GetItem(registrationId)`
2. List user's registrations: `Query(GSI-1, userId)`
3. List event registrations: `Query(GSI-2, eventId)`
4. Find registration by payment: `Query(GSI-3, paymentId)`
5. Count registrations for event: `Query(GSI-2, eventId, Select='COUNT')`

---

## Table 3: Tickets

### Primary Key Structure
- **Partition Key (PK)**: `ticketId` (String) - Format: `TICKET#<uuid>`
- **Sort Key**: None

### Attributes
```json
{
  "ticketId": "TICKET#770e8400-e29b-41d4-a716-446655440002",
  "registrationId": "REG#660e8400-e29b-41d4-a716-446655440001",
  "eventId": "EVENT#550e8400-e29b-41d4-a716-446655440000",
  "eventName": "Tech Conference 2025",
  "eventDate": "2025-12-15T09:00:00Z",
  "eventLocation": "Moscone Center, San Francisco, CA",
  "userId": "USER#123e4567-e89b-12d3-a456-426614174001",
  "userName": "Jane Smith",
  "userEmail": "jane@example.com",
  "qrCode": "TICKET#770e8400|EVENT#550e8400|USER#123e4567",
  "qrCodeImage": "data:image/png;base64,iVBORw0KGgoAAAANS...",
  "status": "valid",
  "s3Key": "tickets/2025/12/TICKET#770e8400.pdf",
  "s3Bucket": "event-ticketing-tickets-prod",
  "generatedAt": "2025-12-03T11:31:00Z",
  "validatedAt": null,
  "validatedBy": null,
  "expiresAt": "2025-12-15T23:59:59Z",
  "metadata": {
    "pdfSize": 245678,
    "version": "1.0"
  }
}
```

### Global Secondary Indexes (GSI)

#### GSI-1: RegistrationIndex
- **Partition Key**: `registrationId`
- **Sort Key**: None
- **Purpose**: Get ticket by registration ID
- **Projection**: ALL

#### GSI-2: UserIndex
- **Partition Key**: `userId`
- **Sort Key**: `generatedAt`
- **Purpose**: List all tickets for a user
- **Projection**: ALL

#### GSI-3: EventIndex
- **Partition Key**: `eventId`
- **Sort Key**: `status`
- **Purpose**: List tickets by event and status
- **Projection**: ALL

#### GSI-4: QRCodeIndex
- **Partition Key**: `qrCode`
- **Sort Key**: None
- **Purpose**: Fast lookup during validation
- **Projection**: ALL

### Access Patterns
1. Get ticket by ID: `GetItem(ticketId)`
2. Get ticket by registration: `Query(GSI-1, registrationId)`
3. List user's tickets: `Query(GSI-2, userId)`
4. List event tickets: `Query(GSI-3, eventId)`
5. Validate QR code: `Query(GSI-4, qrCode)`
6. Count valid tickets: `Query(GSI-3, eventId, status='valid', Select='COUNT')`

---

## Table 4: Users (Optional - Cognito handles most)

### Primary Key Structure
- **Partition Key (PK)**: `userId` (String) - Format: `USER#<uuid>`
- **Sort Key**: None

### Attributes
```json
{
  "userId": "USER#123e4567-e89b-12d3-a456-426614174001",
  "cognitoSub": "123e4567-e89b-12d3-a456-426614174001",
  "email": "jane@example.com",
  "name": "Jane Smith",
  "role": "attendee",
  "phone": "+1234567890",
  "profileImage": "https://cdn.example.com/profile.jpg",
  "preferences": {
    "emailNotifications": true,
    "smsNotifications": false,
    "categories": ["Technology", "Business"]
  },
  "createdAt": "2025-12-01T10:00:00Z",
  "lastLoginAt": "2025-12-03T09:00:00Z",
  "metadata": {
    "totalEventsCreated": 5,
    "totalEventsAttended": 12
  }
}
```

### Global Secondary Indexes (GSI)

#### GSI-1: EmailIndex
- **Partition Key**: `email`
- **Sort Key**: None
- **Purpose**: Lookup user by email
- **Projection**: ALL

#### GSI-2: CognitoIndex
- **Partition Key**: `cognitoSub`
- **Sort Key**: None
- **Purpose**: Map Cognito user to internal user
- **Projection**: ALL

---

## Capacity Planning

### Read/Write Capacity Units (RCU/WCU)

#### Events Table
- **Provisioned Mode** (Predictable traffic):
  - RCU: 5 (eventually consistent reads)
  - WCU: 2 (low write frequency)
- **On-Demand Mode** (Variable traffic): Recommended for MVP

#### Registrations Table
- **On-Demand Mode**: Recommended (spiky traffic during ticket sales)
- **Expected Load**: 100 registrations/minute during peak

#### Tickets Table
- **On-Demand Mode**: Recommended
- **Expected Load**: 100 ticket generations/minute during peak

### Cost Estimation (On-Demand)
- Write: $1.25 per million write request units
- Read: $0.25 per million read request units
- Storage: $0.25 per GB-month

**Example Monthly Cost (1000 events, 50K registrations)**:
- Writes: 51K × $1.25/1M = $0.06
- Reads: 500K × $0.25/1M = $0.13
- Storage: 1GB × $0.25 = $0.25
- **Total**: ~$0.44/month

---

## Data Lifecycle & Retention

### Events
- **Active**: Keep indefinitely
- **Past Events**: Archive after 1 year to S3 Glacier

### Registrations
- **Active**: Keep for 2 years
- **Archived**: Move to S3 after 2 years

### Tickets
- **Valid**: Keep until event date + 30 days
- **Used**: Archive to S3 after 30 days
- **Expired**: Delete after 90 days

### TTL Configuration
Enable DynamoDB TTL on `expiresAt` attribute for automatic cleanup.

---

## Backup Strategy

1. **Point-in-Time Recovery (PITR)**: Enable on all tables
2. **On-Demand Backups**: Weekly backups retained for 35 days
3. **Cross-Region Replication**: Optional for disaster recovery
4. **Export to S3**: Monthly exports for analytics

---

## Query Examples

### Get all events for an organizer
```javascript
const params = {
  TableName: 'Events',
  IndexName: 'OrganizerIndex',
  KeyConditionExpression: 'organizerId = :orgId',
  ExpressionAttributeValues: {
    ':orgId': 'USER#123e4567'
  }
};
```

### Get user's upcoming tickets
```javascript
const params = {
  TableName: 'Tickets',
  IndexName: 'UserIndex',
  KeyConditionExpression: 'userId = :userId',
  FilterExpression: 'eventDate > :now AND #status = :valid',
  ExpressionAttributeNames: {
    '#status': 'status'
  },
  ExpressionAttributeValues: {
    ':userId': 'USER#123e4567',
    ':now': new Date().toISOString(),
    ':valid': 'valid'
  }
};
```

### Validate QR code
```javascript
const params = {
  TableName: 'Tickets',
  IndexName: 'QRCodeIndex',
  KeyConditionExpression: 'qrCode = :qr',
  ExpressionAttributeValues: {
    ':qr': 'TICKET#770e8400|EVENT#550e8400|USER#123e4567'
  }
};
```

---

## Performance Optimization

1. **Batch Operations**: Use BatchGetItem for multiple reads
2. **Projection Expressions**: Only fetch required attributes
3. **Consistent Reads**: Use only when necessary (costs 2x)
4. **Caching**: Implement ElastiCache for frequently accessed data
5. **Pagination**: Use LastEvaluatedKey for large result sets

---

## Security Best Practices

1. **Encryption**: Enable encryption at rest (AWS managed keys)
2. **IAM Policies**: Least privilege access for Lambda functions
3. **VPC Endpoints**: Access DynamoDB without internet gateway
4. **Audit Logging**: Enable CloudTrail for all table operations
5. **Fine-Grained Access**: Use IAM conditions for row-level security
