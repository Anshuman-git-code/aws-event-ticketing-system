# Project Structure Visualization

## 📁 Complete Folder Structure

```
event-ticketing-system/
│
├── 📄 README.md                          # Project overview & quick start
├── 📄 PROJECT_PLAN.md                    # 5-day implementation plan
├── 📄 PHASE1_COMPLETION_REPORT.md        # Detailed Phase 1 report
├── 📄 PHASE1_SUMMARY.md                  # Quick Phase 1 summary
│
├── 📁 cloudformation/                    # Infrastructure as Code
│   ├── 📄 base-infrastructure.yaml       # DynamoDB, S3, CloudFront (270 lines)
│   ├── 📄 auth.yaml                      # Cognito setup (180 lines)
│   └── 📄 deploy.sh                      # Automated deployment script ⚡
│
├── 📁 docs/                              # Documentation
│   ├── 📄 ARCHITECTURE.md                # System architecture & diagrams
│   ├── 📄 DATA_MODELS.md                 # DynamoDB schemas & GSIs
│   ├── 📄 DEPLOYMENT_GUIDE.md            # Step-by-step deployment
│   ├── 📄 QUICK_REFERENCE.md             # Common commands & tips
│   └── 📄 PROJECT_STRUCTURE.md           # This file
│
├── 📁 lambda/                            # Lambda functions (Phase 2)
│   ├── 📁 createEvent/                   # Create event Lambda
│   │   ├── 📄 index.js
│   │   └── 📄 package.json
│   ├── 📁 listEvents/                    # List events Lambda
│   │   ├── 📄 index.js
│   │   └── 📄 package.json
│   ├── 📁 getEvent/                      # Get event details Lambda
│   │   ├── 📄 index.js
│   │   └── 📄 package.json
│   ├── 📁 createRegistration/            # Create registration Lambda
│   │   ├── 📄 index.js
│   │   └── 📄 package.json
│   ├── 📁 generateTicket/                # Generate PDF ticket Lambda
│   │   ├── 📄 index.js
│   │   ├── 📄 package.json
│   │   └── 📁 layers/                    # Lambda layers for dependencies
│   ├── 📁 getTicketDownload/             # Get pre-signed URL Lambda
│   │   ├── 📄 index.js
│   │   └── 📄 package.json
│   ├── 📁 processPayment/                # Stripe payment Lambda
│   │   ├── 📄 index.js
│   │   └── 📄 package.json
│   └── 📁 validateTicket/                # QR code validation Lambda
│       ├── 📄 index.js
│       └── 📄 package.json
│
└── 📁 frontend/                          # React application (Phase 4)
    ├── 📁 public/
    │   ├── 📄 index.html
    │   ├── 📄 favicon.ico
    │   └── 📄 manifest.json
    ├── 📁 src/
    │   ├── 📁 components/                # Reusable UI components
    │   │   ├── 📄 EventCard.js
    │   │   ├── 📄 EventForm.js
    │   │   ├── 📄 RegistrationsList.js
    │   │   ├── 📄 TicketCard.js
    │   │   ├── 📄 PaymentForm.js
    │   │   ├── 📄 QRScanner.js
    │   │   └── 📄 Navbar.js
    │   ├── 📁 pages/                     # Page components
    │   │   ├── 📄 Login.js
    │   │   ├── 📄 Signup.js
    │   │   ├── 📄 OrganizerDashboard.js
    │   │   ├── 📄 AttendeeDashboard.js
    │   │   ├── 📄 EventDetails.js
    │   │   ├── 📄 MyTickets.js
    │   │   └── 📄 CreateEvent.js
    │   ├── 📁 services/                  # API service layer
    │   │   ├── 📄 api.js                 # API client
    │   │   ├── 📄 auth.js                # Authentication service
    │   │   ├── 📄 events.js              # Events API
    │   │   ├── 📄 registrations.js       # Registrations API
    │   │   └── 📄 tickets.js             # Tickets API
    │   ├── 📁 utils/                     # Utility functions
    │   │   ├── 📄 helpers.js
    │   │   ├── 📄 validators.js
    │   │   └── 📄 constants.js
    │   ├── 📁 styles/                    # CSS files
    │   │   ├── 📄 App.css
    │   │   └── 📄 index.css
    │   ├── 📄 App.js                     # Main app component
    │   ├── 📄 index.js                   # Entry point
    │   └── 📄 aws-config.js              # AWS Amplify configuration
    ├── 📄 package.json
    ├── 📄 .env.dev                       # Dev environment variables
    ├── 📄 .env.prod                      # Prod environment variables
    └── 📄 .gitignore
```

---

## 🎯 File Purpose Guide

### Root Level Files

| File | Purpose | Status |
|------|---------|--------|
| `README.md` | Project overview, quick start guide | ✅ Complete |
| `PROJECT_PLAN.md` | 5-day implementation timeline | ✅ Complete |
| `PHASE1_COMPLETION_REPORT.md` | Detailed Phase 1 results | ✅ Complete |
| `PHASE1_SUMMARY.md` | Quick Phase 1 overview | ✅ Complete |

### CloudFormation Directory

| File | Purpose | Lines | Status |
|------|---------|-------|--------|
| `base-infrastructure.yaml` | DynamoDB, S3, CloudFront setup | 270 | ✅ Complete |
| `auth.yaml` | Cognito User Pool & Groups | 180 | ✅ Complete |
| `deploy.sh` | Automated deployment script | 150 | ✅ Complete |

### Documentation Directory

| File | Purpose | Status |
|------|---------|--------|
| `ARCHITECTURE.md` | System design & diagrams | ✅ Complete |
| `DATA_MODELS.md` | Database schemas & GSIs | ✅ Complete |
| `DEPLOYMENT_GUIDE.md` | Deployment instructions | ✅ Complete |
| `QUICK_REFERENCE.md` | CLI commands & tips | ✅ Complete |
| `PROJECT_STRUCTURE.md` | This file | ✅ Complete |

### Lambda Directory (Phase 2)

| Function | Purpose | Status |
|----------|---------|--------|
| `createEvent/` | Create new event | 📅 Phase 2 |
| `listEvents/` | List all events | 📅 Phase 2 |
| `getEvent/` | Get event details | 📅 Phase 2 |
| `createRegistration/` | Register for event | 📅 Phase 2 |
| `generateTicket/` | Generate PDF ticket | 📅 Phase 3 |
| `getTicketDownload/` | Get pre-signed URL | 📅 Phase 3 |
| `processPayment/` | Process Stripe payment | 📅 Phase 3 |
| `validateTicket/` | Validate QR code | 📅 Phase 3 |

### Frontend Directory (Phase 4)

| Component | Purpose | Status |
|-----------|---------|--------|
| `components/` | Reusable UI components | 📅 Phase 4 |
| `pages/` | Page-level components | 📅 Phase 4 |
| `services/` | API integration layer | 📅 Phase 4 |
| `utils/` | Helper functions | 📅 Phase 4 |

---

## 📊 Phase Progress

### Phase 1: Infrastructure ✅ COMPLETE
```
[████████████████████] 100%

✅ Architecture designed
✅ Data models defined
✅ CloudFormation templates created
✅ Documentation complete
```

### Phase 2: API & Lambda 📅 NEXT
```
[░░░░░░░░░░░░░░░░░░░░] 0%

📅 Lambda functions
📅 API Gateway
📅 DynamoDB integration
📅 Testing
```

### Phase 3: Tickets & Payments 📅 UPCOMING
```
[░░░░░░░░░░░░░░░░░░░░] 0%

📅 PDF generation
📅 QR codes
📅 Stripe integration
📅 S3 storage
```

### Phase 4: Frontend 📅 UPCOMING
```
[░░░░░░░░░░░░░░░░░░░░] 0%

📅 React app
📅 Authentication UI
📅 Organizer portal
📅 Attendee portal
```

### Phase 5: Deployment 📅 UPCOMING
```
[░░░░░░░░░░░░░░░░░░░░] 0%

📅 Frontend deployment
📅 Testing
📅 Documentation
📅 Cost analysis
```

---

## 🔄 Data Flow

### Event Creation Flow
```
Organizer → Frontend → API Gateway → Lambda (createEvent) → DynamoDB (Events)
```

### Registration Flow
```
Attendee → Frontend → API Gateway → Lambda (createRegistration) 
    → DynamoDB (Registrations)
    → Lambda (processPayment) → Stripe
    → Lambda (generateTicket) → S3 (PDF)
    → DynamoDB (Tickets)
```

### Ticket Download Flow
```
Attendee → Frontend → API Gateway → Lambda (getTicketDownload)
    → S3 (Pre-signed URL) → Frontend → Download
```

### Ticket Validation Flow
```
Organizer → QR Scanner → API Gateway → Lambda (validateTicket)
    → DynamoDB (Tickets) → Update Status → Response
```

---

## 🗄️ Database Structure

### Events Table
```
PK: eventId
GSI-1: organizerId + date
GSI-2: status + date
GSI-3: category + date
```

### Registrations Table
```
PK: registrationId
GSI-1: userId + registeredAt
GSI-2: eventId + registeredAt
GSI-3: paymentId
```

### Tickets Table
```
PK: ticketId
GSI-1: registrationId
GSI-2: userId + generatedAt
GSI-3: eventId + status
GSI-4: qrCode
```

---

## 🔐 Security Layers

```
┌─────────────────────────────────────┐
│   CloudFront (HTTPS/TLS)            │
├─────────────────────────────────────┤
│   API Gateway (Rate Limiting)       │
├─────────────────────────────────────┤
│   Cognito (JWT Authentication)      │
├─────────────────────────────────────┤
│   Lambda (Input Validation)         │
├─────────────────────────────────────┤
│   IAM (Least Privilege)             │
├─────────────────────────────────────┤
│   DynamoDB (Encryption at Rest)     │
│   S3 (Encryption at Rest)           │
└─────────────────────────────────────┘
```

---

## 📈 Scalability

### Auto-Scaling Components
- ✅ Lambda: Automatic concurrency scaling
- ✅ DynamoDB: On-demand capacity
- ✅ S3: Unlimited storage
- ✅ CloudFront: Global CDN
- ✅ API Gateway: Automatic scaling
- ✅ Cognito: Scales to millions

### Performance Optimizations
- ✅ DynamoDB GSIs for fast queries
- ✅ CloudFront caching
- ✅ S3 pre-signed URLs
- ✅ Lambda warm starts
- ✅ API Gateway caching (optional)

---

## 💰 Cost Breakdown by Component

### Monthly Costs (Dev Environment)
```
DynamoDB (3 tables)     $0.50  ████░░░░░░
S3 (2 buckets)          $1.00  ████████░░
CloudFront              $1.00  ████████░░
Lambda (Phase 2+)       $0.20  ██░░░░░░░░
API Gateway (Phase 2+)  $3.50  ██████████
Cognito                 $0.00  ░░░░░░░░░░
CloudWatch              $0.50  ████░░░░░░
                        ─────
Total                   $6.70/month
```

---

## 🎯 Next Actions

### Immediate (Phase 2 - Day 2)
1. Create Lambda function structure
2. Implement event management Lambdas
3. Set up API Gateway
4. Test endpoints

### Short-term (Phase 3 - Day 3)
1. Implement ticket generation
2. Integrate Stripe payments
3. Create QR validation
4. Test complete flow

### Medium-term (Phase 4 - Day 4)
1. Build React application
2. Implement authentication
3. Create organizer portal
4. Create attendee portal

### Final (Phase 5 - Day 5)
1. Deploy frontend to S3
2. End-to-end testing
3. Complete documentation
4. Cost analysis

---

## 📚 Documentation Map

```
Start Here
    ↓
README.md (Overview)
    ↓
PROJECT_PLAN.md (5-day plan)
    ↓
PHASE1_SUMMARY.md (Quick summary)
    ↓
PHASE1_COMPLETION_REPORT.md (Detailed report)
    ↓
docs/ARCHITECTURE.md (System design)
    ↓
docs/DATA_MODELS.md (Database schemas)
    ↓
docs/DEPLOYMENT_GUIDE.md (How to deploy)
    ↓
docs/QUICK_REFERENCE.md (Commands & tips)
```

---

## ✅ Quality Checklist

### Code Quality
- ✅ CloudFormation templates validated
- ✅ Parameterized for flexibility
- ✅ Follows AWS best practices
- ✅ Proper error handling
- ✅ Resource tagging

### Documentation Quality
- ✅ Comprehensive coverage
- ✅ Clear examples
- ✅ Troubleshooting guides
- ✅ Visual diagrams
- ✅ Quick references

### Security Quality
- ✅ Encryption enabled
- ✅ Least privilege IAM
- ✅ Secure authentication
- ✅ Input validation planned
- ✅ Audit logging ready

### Operational Quality
- ✅ Automated deployment
- ✅ Monitoring setup
- ✅ Backup strategy
- ✅ Cost optimization
- ✅ Scalability designed

---

**Project Structure Documentation**  
*Last Updated: December 3, 2025*  
*Phase 1: Complete ✅*
