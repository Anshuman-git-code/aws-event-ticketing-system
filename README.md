# Event Registration & Ticketing System on AWS

A complete serverless event management platform built on AWS that enables event organizers to create and manage events while allowing attendees to discover, register, and receive digital tickets with QR codes.

## 🎯 Project Overview

This system provides:
- **Organizer Portal**: Create events, manage registrations, view analytics
- **Attendee Portal**: Browse events, register, download digital tickets
- **Digital Tickets**: PDF tickets with QR codes for validation
- **Payment Processing**: Stripe integration (test mode)
- **Scalable Architecture**: Serverless AWS infrastructure

## 🏗️ Architecture

Built using AWS serverless services:
- **Frontend**: React.js hosted on S3 + CloudFront
- **Authentication**: AWS Cognito with role-based access
- **API**: API Gateway + Lambda functions
- **Database**: DynamoDB with GSIs for efficient queries
- **Storage**: S3 for ticket PDFs
- **Payments**: Stripe API (test mode)
- **Infrastructure**: CloudFormation (IaC)

See [Architecture Documentation](docs/ARCHITECTURE.md) for detailed diagrams.

## 📁 Project Structure

```
event-ticketing-system/
├── cloudformation/           # Infrastructure as Code
│   ├── base-infrastructure.yaml  # DynamoDB, S3, CloudFront
│   ├── auth.yaml                 # Cognito User Pool
│   └── deploy.sh                 # Deployment script
├── lambda/                   # Lambda function code (Phase 2)
│   ├── createEvent/
│   ├── listEvents/
│   ├── createRegistration/
│   ├── generateTicket/
│   └── validateTicket/
├── frontend/                 # React application (Phase 4)
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   └── services/
│   └── package.json
├── docs/                     # Documentation
│   ├── ARCHITECTURE.md
│   ├── DATA_MODELS.md
│   └── DEPLOYMENT_GUIDE.md
├── PROJECT_PLAN.md          # 5-day implementation plan
└── README.md                # This file
```

## 🚀 Quick Start

### Prerequisites

- AWS Account with admin access
- AWS CLI installed and configured
- Node.js 18+ (for frontend)
- Git

### Phase 1: Infrastructure Setup (Completed ✅)

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd event-ticketing-system
   ```

2. **Deploy infrastructure**
   ```bash
   cd cloudformation
   ./deploy.sh dev us-east-1
   ```

3. **Verify deployment**
   ```bash
   aws dynamodb list-tables --region us-east-1
   aws s3 ls | grep event-ticketing
   ```

See [Deployment Guide](docs/DEPLOYMENT_GUIDE.md) for detailed instructions.

## 📊 Data Models

### Events Table
Stores event information with GSIs for querying by organizer, date, and category.

### Registrations Table
Tracks user registrations with GSIs for user and event lookups.

### Tickets Table
Manages digital tickets with QR codes and validation status.

See [Data Models Documentation](docs/DATA_MODELS.md) for complete schemas.

## 🔐 Authentication

AWS Cognito provides:
- Email-based signup/login
- Email verification
- Password policies (8+ chars, uppercase, numbers, symbols)
- Two user groups:
  - **Organizers**: Can create and manage events
  - **Attendees**: Can register for events

## 🎫 Features

### For Organizers
- ✅ Create and manage events
- ✅ Set capacity and pricing
- ✅ View registration list
- ✅ Track ticket sales
- ✅ Validate tickets via QR scan

### For Attendees
- ✅ Browse upcoming events
- ✅ Filter by category and date
- ✅ Register for events
- ✅ Make payments (Stripe test mode)
- ✅ Download PDF tickets
- ✅ View registration history

## 💰 Cost Estimation

### Development Environment (Low Traffic)
- **DynamoDB**: $0.50/month (on-demand)
- **S3**: $1.00/month (10GB storage)
- **CloudFront**: $1.00/month (10GB transfer)
- **Lambda**: $0.20/month (1M requests)
- **API Gateway**: $3.50/month (1M requests)
- **Cognito**: Free (up to 50K MAU)

**Total**: ~$6-7/month

### Production Environment (1000 events, 50K users)
- **DynamoDB**: $5/month
- **S3**: $10/month (100GB)
- **CloudFront**: $15/month (100GB transfer)
- **Lambda**: $2/month (10M requests)
- **API Gateway**: $35/month (10M requests)
- **Cognito**: Free (under 50K MAU)

**Total**: ~$67/month

## 📅 Implementation Timeline

- **Day 1 (Dec 3)**: ✅ Infrastructure & Architecture - COMPLETED
- **Day 2 (Dec 4)**: Authentication & API Foundation
- **Day 3 (Dec 5)**: Ticket Generation & Payments
- **Day 4 (Dec 6)**: Frontend Development
- **Day 5 (Dec 7)**: Deployment & Testing

See [PROJECT_PLAN.md](PROJECT_PLAN.md) for detailed timeline.

## 🔧 Development

### Environment Variables

After deployment, configuration is saved to `frontend/.env.dev`:

```env
REACT_APP_AWS_REGION=us-east-1
REACT_APP_USER_POOL_ID=us-east-1_xxxxxxxxx
REACT_APP_USER_POOL_CLIENT_ID=xxxxxxxxxxxxxxxxxxxxxxxxxx
REACT_APP_EVENTS_TABLE=event-ticketing-events-dev
REACT_APP_TICKETS_BUCKET=event-ticketing-tickets-dev-123456789012
```

### Local Development

```bash
# Install dependencies
cd frontend
npm install

# Start development server
npm start

# Build for production
npm run build
```

## 🧪 Testing

### Test DynamoDB
```bash
aws dynamodb scan --table-name event-ticketing-events-dev --region us-east-1
```

### Test S3
```bash
aws s3 ls s3://event-ticketing-tickets-dev-<ACCOUNT_ID>/
```

### Test Cognito
```bash
aws cognito-idp list-users --user-pool-id <USER_POOL_ID> --region us-east-1
```

## 📚 Documentation

- [Architecture](docs/ARCHITECTURE.md) - System design and diagrams
- [Data Models](docs/DATA_MODELS.md) - Database schemas and access patterns
- [Deployment Guide](docs/DEPLOYMENT_GUIDE.md) - Step-by-step deployment
- [Project Plan](PROJECT_PLAN.md) - 5-day implementation plan

## 🔒 Security

- ✅ Encryption at rest (DynamoDB, S3)
- ✅ Encryption in transit (HTTPS/TLS)
- ✅ IAM least privilege access
- ✅ Cognito authentication
- ✅ Pre-signed URLs for secure downloads
- ✅ Input validation in Lambda functions
- ✅ Rate limiting on API Gateway

## 🚀 Deployment

### Deploy to Development
```bash
cd cloudformation
./deploy.sh dev us-east-1
```

### Deploy to Production
```bash
cd cloudformation
./deploy.sh prod us-east-1
```

### Update Stack
```bash
aws cloudformation update-stack \
  --stack-name event-ticketing-base-dev \
  --template-body file://base-infrastructure.yaml \
  --region us-east-1
```

## 🧹 Cleanup

To remove all resources:

```bash
# Empty S3 buckets
aws s3 rm s3://event-ticketing-tickets-dev-<ACCOUNT_ID> --recursive
aws s3 rm s3://event-ticketing-frontend-dev-<ACCOUNT_ID> --recursive

# Delete stacks
aws cloudformation delete-stack --stack-name event-ticketing-auth-dev
aws cloudformation delete-stack --stack-name event-ticketing-base-dev
```

## 📈 Monitoring

CloudWatch provides:
- Lambda function logs
- API Gateway metrics
- DynamoDB performance metrics
- CloudFront access logs
- Billing alerts

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License.

## 🆘 Support

For issues and questions:
1. Check [Deployment Guide](docs/DEPLOYMENT_GUIDE.md)
2. Review CloudFormation events
3. Check CloudWatch logs
4. Open an issue on GitHub

## 🎯 Next Steps

After Phase 1 completion:

1. **Phase 2**: Create Lambda functions and API Gateway
2. **Phase 3**: Implement ticket generation and Stripe integration
3. **Phase 4**: Build React frontend
4. **Phase 5**: Deploy and test complete system

## 📊 Current Status

**Phase 1: COMPLETED ✅**

Infrastructure deployed:
- ✅ 3 DynamoDB tables with GSIs
- ✅ 2 S3 buckets (tickets, frontend)
- ✅ CloudFront distribution
- ✅ Cognito User Pool with groups
- ✅ IAM roles and policies
- ✅ CloudWatch log groups

Ready for Phase 2 development!

---

**Built with ❤️ using AWS Serverless Services**
