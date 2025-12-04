# Team Onboarding Guide
**Event Registration & Ticketing System on AWS**

---

## 👥 Team Members

1. **Anshuman** - Project Lead (Phase 1 & 2 Complete)
2. **Pavan** - Backend Developer (Phase 3)
3. **Shivam** - Frontend Developer (Phase 4)

---

## 📋 Project Overview

### What We're Building
A complete serverless event management platform on AWS where:
- **Organizers** can create and manage events
- **Attendees** can browse, register, and get digital tickets
- **System** generates PDF tickets with QR codes for validation

### Technology Stack
- **Frontend**: React.js
- **Backend**: AWS Lambda (Node.js)
- **API**: API Gateway with Cognito Auth
- **Database**: DynamoDB
- **Storage**: S3
- **CDN**: CloudFront
- **Auth**: Cognito
- **Payments**: Stripe (test mode)
- **Infrastructure**: CloudFormation (IaC)

---

## ✅ What's Already Done

### Phase 1: Infrastructure (Complete ✅)
**Completed by**: Anshuman  
**Date**: December 3, 2025

**Deployed Resources**:
- 3 DynamoDB tables with 10 Global Secondary Indexes
- 2 S3 buckets (tickets storage, frontend hosting)
- CloudFront distribution for CDN
- Cognito User Pool with 2 groups (Organizers, Attendees)
- IAM roles and policies
- CloudWatch logging

**Files Created**: 14 files (CloudFormation templates, documentation)

### Phase 2: API & Lambda (Complete ✅)
**Completed by**: Anshuman  
**Date**: December 4, 2025

**Deployed Resources**:
- API Gateway REST API with 4 endpoints
- 4 Lambda functions (createEvent, listEvents, getEvent, createRegistration)
- Cognito authorizer integration
- Full event CRUD operations

**Files Created**: 9 files (Lambda code, API CloudFormation)

---

## 🔑 Critical Information

### AWS Account Details
- **Account ID**: 264449293739
- **Region**: us-east-1
- **Environment**: dev

### Live Resources

#### API Gateway
```
URL: https://1y2eb1bn78.execute-api.us-east-1.amazonaws.com/dev
```

#### Cognito
```
User Pool ID: us-east-1_LSO6RslSb
Client ID: 712kg88tji37pcn6b3miqfbdlf
Identity Pool: us-east-1:8e1ba083-bd58-4f84-a811-ffcff1457a00
```

#### DynamoDB Tables
```
event-ticketing-events-dev
event-ticketing-registrations-dev
event-ticketing-tickets-dev
```

#### S3 Buckets
```
event-ticketing-tickets-dev-264449293739
event-ticketing-frontend-dev-264449293739
```

#### CloudFront
```
Distribution ID: E3A54MN5Q7TR2P
URL: https://d2nkn01x3icawa.cloudfront.net
```

---

## 📚 Documentation to Read

### Start Here (In Order)
1. **START_HERE.md** - Quick overview (5 min)
2. **README.md** - Project overview (10 min)
3. **docs/ARCHITECTURE.md** - System architecture (15 min)
4. **docs/DATA_MODELS.md** - Database design (15 min)
5. **DEPLOYMENT_STATUS.md** - Current status (5 min)

### For Your Role
- **Pavan (Backend)**: Read `PROJECT_PLAN.md` Phase 3 section
- **Shivam (Frontend)**: Read `PROJECT_PLAN.md` Phase 4 section

### Reference Documents
- **docs/DEPLOYMENT_GUIDE.md** - How to deploy
- **docs/QUICK_REFERENCE.md** - Common commands
- **PHASE1_COMPLETION_REPORT.md** - Phase 1 details
- **PHASE2_COMPLETION_REPORT.md** - Phase 2 details

---

## 🛠️ Setup Instructions

### Prerequisites
All team members need:
1. AWS CLI installed and configured
2. Node.js 18+ installed
3. Git access to repository
4. AWS credentials (ask Anshuman)

### Verify Access
```bash
# Check AWS access
aws sts get-caller-identity

# Should show Account: 264449293739

# Test API
curl https://1y2eb1bn78.execute-api.us-east-1.amazonaws.com/dev/events

# Should return: {"events":[],"count":0}
```

### Clone and Setup
```bash
# Clone repository
git clone <repo-url>
cd event-ticketing-system

# Verify structure
ls -la

# You should see:
# - cloudformation/
# - lambda/
# - frontend/
# - docs/
```

---

## 🎯 Remaining Work

### Phase 3: Ticket Generation & Payments (Pavan)
**Duration**: 1 day  
**Status**: Not started

**Tasks**:
1. Generate PDF tickets with QR codes
2. Integrate Stripe payments
3. Create ticket validation endpoint
4. Implement S3 pre-signed URLs

### Phase 4: Frontend Development (Shivam)
**Duration**: 1 day  
**Status**: Not started

**Tasks**:
1. Build React application
2. Implement authentication UI
3. Create organizer portal
4. Create attendee portal

### Phase 5: Final Deployment & Testing (All)
**Duration**: 1 day  
**Status**: Not started

**Tasks**:
1. Deploy frontend to S3/CloudFront
2. End-to-end testing
3. Documentation updates
4. Demo preparation

---

## 📞 Communication

### Daily Standup Questions
1. What did you complete yesterday?
2. What will you work on today?
3. Any blockers?

### Handoff Requirements
When completing your phase:
1. Update your phase completion report
2. Document all new resources created
3. Update configuration files
4. Test your work
5. Notify next team member

### Getting Help
- **Infrastructure/AWS issues**: Ask Anshuman
- **Backend/Lambda issues**: Ask Pavan (after Phase 3)
- **Frontend/React issues**: Ask Shivam (after Phase 4)

---

## 🔐 Security Notes

### Important
- Never commit AWS credentials
- Never commit API keys
- Use environment variables
- Keep .env files in .gitignore

### Credentials Location
- AWS credentials: `~/.aws/credentials`
- Stripe test keys: (Pavan will set up)
- Frontend config: `frontend/.env.dev`

---

## 🧪 Testing

### Test Your Work
Before marking phase complete:
1. Run automated tests
2. Test manually
3. Check CloudWatch logs
4. Verify in AWS Console
5. Document any issues

### Test Script
```bash
# Run deployment tests
./test-deployment.sh
```

---

## 📊 Project Timeline

```
Day 1 (Dec 3): Phase 1 - Infrastructure ✅ (Anshuman)
Day 2 (Dec 4): Phase 2 - API & Lambda ✅ (Anshuman)
Day 3 (Dec 5): Phase 3 - Tickets & Payments 📅 (Pavan)
Day 4 (Dec 6): Phase 4 - Frontend 📅 (Shivam)
Day 5 (Dec 7): Phase 5 - Deployment & Testing 📅 (All)
```

---

## 🎓 Learning Resources

### AWS Services
- [Lambda Documentation](https://docs.aws.amazon.com/lambda/)
- [DynamoDB Guide](https://docs.aws.amazon.com/dynamodb/)
- [API Gateway](https://docs.aws.amazon.com/apigateway/)
- [Cognito](https://docs.aws.amazon.com/cognito/)

### Development
- [Node.js AWS SDK](https://docs.aws.amazon.com/sdk-for-javascript/)
- [React Documentation](https://react.dev/)
- [Stripe API](https://stripe.com/docs/api)

---

## ✅ Onboarding Checklist

### For All Team Members
- [ ] Read START_HERE.md
- [ ] Read README.md
- [ ] Read ARCHITECTURE.md
- [ ] AWS CLI installed
- [ ] AWS credentials configured
- [ ] Verified AWS access
- [ ] Tested API endpoint
- [ ] Reviewed your phase documentation
- [ ] Joined team communication channel

### For Pavan (Backend)
- [ ] Read Phase 3 work plan
- [ ] Reviewed Lambda code structure
- [ ] Understand DynamoDB schema
- [ ] Set up Stripe test account
- [ ] Ready to start Phase 3

### For Shivam (Frontend)
- [ ] Read Phase 4 work plan
- [ ] Node.js installed
- [ ] React knowledge refreshed
- [ ] Reviewed frontend structure
- [ ] Ready to start Phase 4

---

## 🚀 Getting Started

### Your First Day

**Morning**:
1. Read all onboarding documentation (2 hours)
2. Set up development environment (1 hour)
3. Verify access to all resources (30 min)

**Afternoon**:
1. Review your phase work plan (1 hour)
2. Ask questions in team chat (30 min)
3. Start planning your implementation (2 hours)

---

## 📝 Questions?

Contact Anshuman for:
- AWS access issues
- Architecture questions
- Infrastructure problems
- General project questions

---

**Welcome to the team! Let's build something great! 🎉**

---

*Last Updated: December 4, 2025*  
*Project: Event Registration & Ticketing System*  
*Status: Phase 1 & 2 Complete*
