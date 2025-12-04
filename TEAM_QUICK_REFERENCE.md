# Team Quick Reference Guide

## 👥 Team Structure

| Member | Role | Phase | Duration | Status |
|--------|------|-------|----------|--------|
| **Anshuman** | Project Lead | 1, 2, 5 | 3 days | Phase 1 & 2 ✅ |
| **Pavan** | Backend Dev | 3 | 1 day | Not started |
| **Shivam** | Frontend Dev | 4 | 1 day | Not started |

---

## 📚 Essential Documents

### For Everyone
1. **TEAM_ONBOARDING.md** - Start here!
2. **README.md** - Project overview
3. **docs/ARCHITECTURE.md** - System design
4. **DEPLOYMENT_STATUS.md** - Current status

### For Pavan (Backend)
1. **PAVAN_WORKPLAN.md** - Your detailed work plan
2. **docs/DATA_MODELS.md** - Database schemas
3. **lambda/** folder - Existing Lambda code

### For Shivam (Frontend)
1. **SHIVAM_WORKPLAN.md** - Your detailed work plan
2. **API_ENDPOINTS.md** - API documentation (from Pavan)
3. **frontend/.env.dev** - Configuration

### For Anshuman (Lead)
1. **ANSHUMAN_COORDINATION_GUIDE.md** - Coordination guide
2. All phase completion reports
3. Team work plans

---

## 🔑 Critical Information

### AWS Resources
```
Account ID: 264449293739
Region: us-east-1
Environment: dev
```

### Live URLs
```
API: https://1y2eb1bn78.execute-api.us-east-1.amazonaws.com/dev
Frontend: https://d2nkn01x3icawa.cloudfront.net
```

### Cognito
```
User Pool: us-east-1_LSO6RslSb
Client ID: 712kg88tji37pcn6b3miqfbdlf
```

### DynamoDB Tables
```
event-ticketing-events-dev
event-ticketing-registrations-dev
event-ticketing-tickets-dev
```

### S3 Buckets
```
event-ticketing-tickets-dev-264449293739
event-ticketing-frontend-dev-264449293739
```

---

## 🎯 Phase Overview

### Phase 1: Infrastructure ✅
**Owner**: Anshuman  
**Status**: Complete  
**Deliverables**: DynamoDB, S3, CloudFront, Cognito

### Phase 2: API & Lambda ✅
**Owner**: Anshuman  
**Status**: Complete  
**Deliverables**: 4 Lambda functions, API Gateway

### Phase 3: Tickets & Payments 📅
**Owner**: Pavan  
**Status**: Not started  
**Deliverables**: 
- PDF ticket generation
- Stripe payment integration
- QR code validation
- S3 pre-signed URLs

**Key Tasks**:
1. Set up Stripe account
2. Create generateTicket Lambda
3. Create processPayment Lambda
4. Create getTicketDownload Lambda
5. Create validateTicket Lambda
6. Update API Gateway
7. Deploy and test

### Phase 4: Frontend 📅
**Owner**: Shivam  
**Status**: Not started  
**Deliverables**:
- React application
- Organizer portal
- Attendee portal
- Payment UI
- Ticket download

**Key Tasks**:
1. React app setup
2. Authentication UI
3. API service layer
4. Organizer portal
5. Attendee portal
6. Styling
7. Testing
8. Build for deployment

### Phase 5: Deployment & Testing 📅
**Owner**: Anshuman (with team)  
**Status**: Not started  
**Deliverables**:
- Frontend deployed
- End-to-end testing
- Monitoring setup
- Documentation
- Demo

---

## 🔄 Handoff Process

### Anshuman → Pavan
**When**: After Phase 2 complete ✅  
**What to provide**:
- AWS credentials
- PAVAN_WORKPLAN.md
- Access to Lambda deployment
- DynamoDB table details
- Test user credentials

### Pavan → Shivam
**When**: After Phase 3 complete  
**What to provide**:
- API_ENDPOINTS.md (all endpoints documented)
- Stripe publishable key
- Sample API calls (curl commands)
- Test data (event IDs, user credentials)
- Updated .env.dev file
- PHASE3_COMPLETION_REPORT.md

### Shivam → Team
**When**: After Phase 4 complete  
**What to provide**:
- Built frontend (build/ folder)
- Frontend documentation
- User guide
- Known issues list
- PHASE4_COMPLETION_REPORT.md

---

## 🧪 Testing Commands

### Test API
```bash
curl https://1y2eb1bn78.execute-api.us-east-1.amazonaws.com/dev/events
```

### Test AWS Access
```bash
aws sts get-caller-identity
```

### Run Full Tests
```bash
./test-deployment.sh
```

### Check Lambda Logs
```bash
aws logs tail /aws/lambda/event-ticketing-listEvents-dev --follow
```

### List DynamoDB Items
```bash
aws dynamodb scan --table-name event-ticketing-events-dev --region us-east-1
```

---

## 💰 Cost Tracking

### Current Monthly Cost: ~$3-5

| Service | Cost |
|---------|------|
| DynamoDB | $0.50 |
| S3 | $1.00 |
| CloudFront | $1.00 |
| Lambda | $0.20 |
| API Gateway | $0.50 |
| Cognito | Free |

**After Phase 3 & 4**: ~$6-8/month

---

## 🆘 Getting Help

### Infrastructure/AWS Issues
**Contact**: Anshuman  
**Response Time**: Within 1 hour  
**Topics**: Permissions, CloudFormation, DynamoDB, S3

### Backend/Lambda Issues
**Contact**: Pavan (after Phase 3)  
**Topics**: Lambda code, API endpoints, Stripe

### Frontend/React Issues
**Contact**: Shivam (after Phase 4)  
**Topics**: React components, UI/UX, authentication

---

## 📅 Timeline

```
Dec 3 (Tue): Phase 1 ✅ - Infrastructure
Dec 4 (Wed): Phase 2 ✅ - API & Lambda
Dec 5 (Thu): Phase 3 📅 - Tickets & Payments (Pavan)
Dec 6 (Fri): Phase 4 📅 - Frontend (Shivam)
Dec 7 (Sat): Phase 5 📅 - Deployment & Testing (All)
```

---

## ✅ Daily Checklist

### Morning
- [ ] Check team chat
- [ ] Review your work plan
- [ ] Identify today's tasks
- [ ] Ask questions if blocked

### During Work
- [ ] Commit code regularly
- [ ] Test as you build
- [ ] Document as you go
- [ ] Ask for help when stuck

### Evening
- [ ] Commit final code
- [ ] Update progress
- [ ] Document any issues
- [ ] Plan tomorrow's work

---

## 🔐 Security Reminders

- ❌ Never commit AWS credentials
- ❌ Never commit API keys
- ❌ Never commit passwords
- ✅ Use environment variables
- ✅ Keep .env files in .gitignore
- ✅ Use IAM roles when possible

---

## 📞 Communication

### Daily Standup (15 min)
**Time**: 9:00 AM  
**Format**: 
- What did you do yesterday?
- What will you do today?
- Any blockers?

### Questions
- Use team chat for quick questions
- Tag relevant person
- Include error messages/screenshots
- Be specific about the issue

### Updates
- Update your phase completion report daily
- Commit code at least once per day
- Notify team when phase complete

---

## 🎯 Success Metrics

### Code Quality
- No hardcoded credentials
- Proper error handling
- Clean code structure
- Comments where needed

### Testing
- All features tested
- Edge cases covered
- No console errors
- Performance acceptable

### Documentation
- README files complete
- API documented
- Code commented
- Handoff docs ready

---

## 🚀 Quick Start

### Day 1 (Your First Day)
1. Read TEAM_ONBOARDING.md (30 min)
2. Read your work plan (30 min)
3. Set up environment (1 hour)
4. Verify access (30 min)
5. Ask questions (30 min)
6. Start coding! (rest of day)

---

## 📱 Useful Links

- [AWS Console](https://console.aws.amazon.com)
- [Stripe Dashboard](https://dashboard.stripe.com)
- [React Docs](https://react.dev)
- [AWS Lambda Docs](https://docs.aws.amazon.com/lambda/)
- [DynamoDB Docs](https://docs.aws.amazon.com/dynamodb/)

---

**Let's build something great together! 🎉**

---

*Last Updated: December 4, 2025*  
*Team: Anshuman, Pavan, Shivam*  
*Project: Event Registration & Ticketing System*
