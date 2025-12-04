# Work Plan: Pavan (Backend Developer)
**Phase 3: Ticket Generation & Payments**

---

## 👤 Your Role

**Name**: Pavan  
**Phase**: 3 (Ticket Generation & Payments)  
**Duration**: 1 day (December 5, 2025)  
**Dependencies**: Phase 1 & 2 (Complete)  
**Handoff To**: Shivam (Frontend Developer)

---

## 🎯 Your Mission

Build the ticket generation system that:
1. Generates PDF tickets with QR codes
2. Processes payments via Stripe
3. Validates tickets at event entry
4. Stores tickets securely in S3

---

## 📋 Prerequisites

### What You Need Before Starting

#### 1. Access & Credentials
- [ ] AWS CLI configured with credentials
- [ ] Access to AWS account (264449293739)
- [ ] Stripe test account created
- [ ] Repository cloned locally

#### 2. Knowledge Required
- Node.js and npm
- AWS Lambda basics
- DynamoDB operations
- S3 file operations
- Basic PDF generation concepts

#### 3. Resources Available
- API Gateway URL: `https://1y2eb1bn78.execute-api.us-east-1.amazonaws.com/dev`
- DynamoDB tables: events, registrations, tickets
- S3 bucket: `event-ticketing-tickets-dev-264449293739`
- Lambda execution role: Already created

---

## 📚 What to Read First

### Required Reading (2 hours)
1. **TEAM_ONBOARDING.md** - Team overview
2. **docs/ARCHITECTURE.md** - System design (focus on ticket flow)
3. **docs/DATA_MODELS.md** - Tickets table schema
4. **lambda/createRegistration/index.js** - Understand registration flow

### Reference Documents
- **PROJECT_PLAN.md** - Phase 3 section
- **docs/QUICK_REFERENCE.md** - AWS commands

---

## 🛠️ Your Tasks (Detailed)

### Task 1: Set Up Stripe (1 hour)

#### What to Do
Create Stripe test account and get API keys

#### How to Do It
1. Go to https://stripe.com
2. Sign up for account
3. Navigate to Developers → API Keys
4. Copy "Publishable key" and "Secret key" (test mode)
5. Save keys securely (don't commit!)

#### Files to Create
```bash
# Create Stripe config file
echo "STRIPE_SECRET_KEY=sk_test_your_key_here" > lambda/.env.stripe
echo "STRIPE_PUBLISHABLE_KEY=pk_test_your_key_here" >> lambda/.env.stripe
```

#### Verification
```bash
# Test Stripe connection
curl https://api.stripe.com/v1/charges \
  -u sk_test_your_key_here: \
  -d amount=2000 \
  -d currency=usd \
  -d source=tok_visa
```

#### Handoff Info
- Stripe publishable key (for Shivam's frontend)
- Test card numbers: 4242 4242 4242 4242

---

### Task 2: Create Ticket Generation Lambda (3 hours)

#### What to Do
Build Lambda function that generates PDF tickets with QR codes

#### How to Do It

**Step 1: Create function structure**
```bash
mkdir -p lambda/generateTicket
cd lambda/generateTicket
```

**Step 2: Create package.json**
```json
{
  "name": "generate-ticket",
  "version": "1.0.0",
  "dependencies": {
    "@aws-sdk/client-dynamodb": "^3.450.0",
    "@aws-sdk/lib-dynamodb": "^3.450.0",
    "@aws-sdk/client-s3": "^3.450.0",
    "pdfkit": "^0.13.0",
    "qrcode": "^1.5.3",
    "uuid": "^9.0.1"
  }
}
```

**Step 3: Create index.js**

Key functionality needed:
1. Receive registration data
2. Generate unique QR code (encode: ticketId, eventId, userId)
3. Create PDF with event details
4. Upload PDF to S3
5. Save ticket record to DynamoDB

**Code Structure**:
```javascript
// 1. Get registration details from DynamoDB
// 2. Get event details from DynamoDB
// 3. Generate QR code with ticket data
// 4. Create PDF using PDFKit
// 5. Upload PDF to S3
// 6. Create ticket record in DynamoDB
// 7. Return ticket ID and S3 key
```

**Step 4: Install dependencies**
```bash
npm install
```

**Step 5: Test locally**
```bash
# Create test event
node -e "console.log(JSON.stringify({
  registrationId: 'REG#test-123',
  eventId: 'EVENT#test-456',
  userId: 'USER#test-789'
}))" > test-event.json

# Test function (after deployment)
aws lambda invoke \
  --function-name event-ticketing-generateTicket-dev \
  --payload file://test-event.json \
  --region us-east-1 \
  output.json
```

#### Files to Create
- `lambda/generateTicket/index.js` (main code)
- `lambda/generateTicket/package.json`
- `lambda/generateTicket/README.md` (usage docs)

#### DynamoDB Operations Needed
```javascript
// Read from Registrations table
const registration = await docClient.send(new GetCommand({
  TableName: 'event-ticketing-registrations-dev',
  Key: { registrationId }
}));

// Read from Events table
const event = await docClient.send(new GetCommand({
  TableName: 'event-ticketing-events-dev',
  Key: { eventId }
}));

// Write to Tickets table
await docClient.send(new PutCommand({
  TableName: 'event-ticketing-tickets-dev',
  Item: {
    ticketId: `TICKET#${uuid}`,
    registrationId,
    eventId,
    userId,
    qrCode: qrCodeData,
    status: 'valid',
    s3Key: `tickets/${ticketId}.pdf`,
    generatedAt: new Date().toISOString()
  }
}));
```

#### S3 Operations Needed
```javascript
// Upload PDF to S3
const s3Client = new S3Client({ region: 'us-east-1' });
await s3Client.send(new PutObjectCommand({
  Bucket: 'event-ticketing-tickets-dev-264449293739',
  Key: `tickets/${ticketId}.pdf`,
  Body: pdfBuffer,
  ContentType: 'application/pdf'
}));
```

#### Verification
- PDF generated successfully
- QR code embedded in PDF
- File uploaded to S3
- Ticket record in DynamoDB
- Check CloudWatch logs for errors

---

### Task 3: Create Payment Processing Lambda (2 hours)

#### What to Do
Build Lambda to process Stripe payments

#### How to Do It

**Step 1: Create function**
```bash
mkdir -p lambda/processPayment
cd lambda/processPayment
```

**Step 2: Create package.json**
```json
{
  "name": "process-payment",
  "version": "1.0.0",
  "dependencies": {
    "@aws-sdk/client-dynamodb": "^3.450.0",
    "@aws-sdk/lib-dynamodb": "^3.450.0",
    "@aws-sdk/client-lambda": "^3.450.0",
    "stripe": "^14.0.0"
  }
}
```

**Step 3: Implement payment flow**

Key functionality:
1. Create Stripe payment intent
2. Handle payment confirmation
3. Update registration status
4. Trigger ticket generation
5. Handle payment failures

**Code Flow**:
```javascript
// 1. Initialize Stripe with secret key
// 2. Create payment intent with amount
// 3. Return client secret to frontend
// 4. On webhook: verify payment
// 5. Update registration status to 'confirmed'
// 6. Invoke generateTicket Lambda
// 7. Return success/failure
```

**Step 4: Create webhook handler**
```javascript
// Handle Stripe webhooks
// Events to handle:
// - payment_intent.succeeded
// - payment_intent.payment_failed
```

#### Files to Create
- `lambda/processPayment/index.js`
- `lambda/processPayment/package.json`
- `lambda/processPayment/webhook.js` (webhook handler)

#### Integration Points
```javascript
// Invoke ticket generation after payment
const lambdaClient = new LambdaClient({ region: 'us-east-1' });
await lambdaClient.send(new InvokeCommand({
  FunctionName: 'event-ticketing-generateTicket-dev',
  InvocationType: 'Event', // Async
  Payload: JSON.stringify({
    registrationId,
    eventId,
    userId
  })
}));
```

#### Verification
- Payment intent created
- Test card processed successfully
- Registration status updated
- Ticket generation triggered
- Webhook receives events

---

### Task 4: Create Ticket Download Lambda (1 hour)

#### What to Do
Generate pre-signed URLs for secure ticket downloads

#### How to Do It

**Step 1: Create function**
```bash
mkdir -p lambda/getTicketDownload
cd lambda/getTicketDownload
```

**Step 2: Implement pre-signed URL generation**

Key functionality:
1. Verify user owns the ticket
2. Get ticket S3 key from DynamoDB
3. Generate pre-signed URL (15 min expiry)
4. Return URL to user

**Code Structure**:
```javascript
// 1. Get ticketId from path parameters
// 2. Get userId from Cognito token
// 3. Verify ticket belongs to user
// 4. Generate pre-signed URL
// 5. Return URL with expiry time
```

#### Files to Create
- `lambda/getTicketDownload/index.js`
- `lambda/getTicketDownload/package.json`

#### S3 Pre-signed URL
```javascript
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const { GetObjectCommand } = require('@aws-sdk/client-s3');

const command = new GetObjectCommand({
  Bucket: 'event-ticketing-tickets-dev-264449293739',
  Key: ticket.s3Key
});

const url = await getSignedUrl(s3Client, command, { expiresIn: 900 }); // 15 min
```

#### Verification
- URL generated successfully
- URL expires after 15 minutes
- Only ticket owner can access
- PDF downloads correctly

---

### Task 5: Create Ticket Validation Lambda (1 hour)

#### What to Do
Validate QR codes at event entry

#### How to Do It

**Step 1: Create function**
```bash
mkdir -p lambda/validateTicket
cd lambda/validateTicket
```

**Step 2: Implement validation logic**

Key functionality:
1. Decode QR code data
2. Verify ticket exists
3. Check ticket status (valid/used)
4. Mark ticket as used
5. Prevent duplicate entry

**Code Structure**:
```javascript
// 1. Parse QR code data (ticketId, eventId, userId)
// 2. Query Tickets table by QR code
// 3. Verify ticket status is 'valid'
// 4. Check event date is today
// 5. Update status to 'used'
// 6. Record validation timestamp
// 7. Return validation result
```

#### Files to Create
- `lambda/validateTicket/index.js`
- `lambda/validateTicket/package.json`

#### DynamoDB Operations
```javascript
// Query by QR code using GSI
const result = await docClient.send(new QueryCommand({
  TableName: 'event-ticketing-tickets-dev',
  IndexName: 'QRCodeIndex',
  KeyConditionExpression: 'qrCode = :qr',
  ExpressionAttributeValues: {
    ':qr': qrCodeData
  }
}));

// Update ticket status
await docClient.send(new UpdateCommand({
  TableName: 'event-ticketing-tickets-dev',
  Key: { ticketId },
  UpdateExpression: 'SET #status = :used, validatedAt = :timestamp',
  ConditionExpression: '#status = :valid', // Prevent double-use
  ExpressionAttributeNames: { '#status': 'status' },
  ExpressionAttributeValues: {
    ':used': 'used',
    ':valid': 'valid',
    ':timestamp': new Date().toISOString()
  }
}));
```

#### Verification
- Valid ticket accepted
- Used ticket rejected
- Invalid ticket rejected
- Timestamp recorded
- Organizer can see validation

---

### Task 6: Update API Gateway (1 hour)

#### What to Do
Add new endpoints to API Gateway

#### How to Do It

**Step 1: Update CloudFormation template**

Edit `cloudformation/api-lambda.yaml` to add:
1. POST /payments/create-intent
2. POST /payments/webhook
3. GET /tickets/{id}/download
4. POST /tickets/validate

**Step 2: Add Lambda permissions**

For each new endpoint, add:
- Lambda function resource
- API Gateway method
- Lambda permission
- Integration

**Step 3: Deploy updated stack**
```bash
cd cloudformation
aws cloudformation update-stack \
  --stack-name event-ticketing-api-dev \
  --template-body file://api-lambda.yaml \
  --capabilities CAPABILITY_NAMED_IAM \
  --region us-east-1
```

#### Files to Update
- `cloudformation/api-lambda.yaml`

#### Verification
- All new endpoints accessible
- Lambda functions invoked correctly
- CORS headers present
- Authentication working

---

### Task 7: Deploy All Lambda Functions (1 hour)

#### What to Do
Package and deploy all new Lambda functions

#### How to Do It

**Step 1: Create deployment script**
```bash
# Create lambda/deploy-phase3.sh
#!/bin/bash
set -e

FUNCTIONS=("generateTicket" "processPayment" "getTicketDownload" "validateTicket")

for func in "${FUNCTIONS[@]}"; do
  echo "Deploying $func..."
  cd $func
  npm install --production
  zip -r function.zip .
  aws lambda update-function-code \
    --function-name event-ticketing-$func-dev \
    --zip-file fileb://function.zip \
    --region us-east-1
  rm function.zip
  cd ..
done
```

**Step 2: Make executable and run**
```bash
chmod +x lambda/deploy-phase3.sh
cd lambda
./deploy-phase3.sh
```

#### Verification
```bash
# Check all functions deployed
aws lambda list-functions --region us-east-1 | grep event-ticketing

# Test each function
aws lambda invoke \
  --function-name event-ticketing-generateTicket-dev \
  --payload '{"test":true}' \
  --region us-east-1 \
  output.json
```

---

### Task 8: Testing (2 hours)

#### What to Do
Comprehensive testing of all Phase 3 features

#### How to Do It

**Test 1: Payment Flow**
```bash
# Create payment intent
curl -X POST \
  https://1y2eb1bn78.execute-api.us-east-1.amazonaws.com/dev/payments/create-intent \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"registrationId":"REG#123","amount":9999}'
```

**Test 2: Ticket Generation**
```bash
# Trigger ticket generation
aws lambda invoke \
  --function-name event-ticketing-generateTicket-dev \
  --payload '{"registrationId":"REG#123"}' \
  --region us-east-1 \
  output.json

# Check S3 for PDF
aws s3 ls s3://event-ticketing-tickets-dev-264449293739/tickets/
```

**Test 3: Ticket Download**
```bash
# Get download URL
curl -X GET \
  https://1y2eb1bn78.execute-api.us-east-1.amazonaws.com/dev/tickets/TICKET#123/download \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Test 4: Ticket Validation**
```bash
# Validate ticket
curl -X POST \
  https://1y2eb1bn78.execute-api.us-east-1.amazonaws.com/dev/tickets/validate \
  -H "Content-Type: application/json" \
  -d '{"qrCode":"TICKET#123|EVENT#456|USER#789"}'
```

#### Create Test Script
```bash
# Create test-phase3.sh
#!/bin/bash
echo "Testing Phase 3 Features..."
# Add all test commands
```

#### Verification Checklist
- [ ] Payment intent created
- [ ] Payment processed successfully
- [ ] Ticket PDF generated
- [ ] PDF uploaded to S3
- [ ] Ticket record in DynamoDB
- [ ] Download URL works
- [ ] PDF downloads correctly
- [ ] QR code validates
- [ ] Used ticket rejected
- [ ] All CloudWatch logs clean

---

## 📤 Handoff to Shivam (Frontend)

### What to Provide

#### 1. API Endpoints Documentation
Create `API_ENDPOINTS.md` with:
```markdown
# Payment Endpoints

## Create Payment Intent
POST /payments/create-intent
Headers: Authorization: Bearer {token}
Body: { registrationId, amount }
Response: { clientSecret, paymentIntentId }

## Ticket Endpoints

## Get Ticket Download URL
GET /tickets/{id}/download
Headers: Authorization: Bearer {token}
Response: { downloadUrl, expiresAt }

## Validate Ticket
POST /tickets/validate
Body: { qrCode }
Response: { valid, ticket, message }
```

#### 2. Stripe Configuration
```javascript
// Stripe publishable key for frontend
REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_test_your_key_here

// Test card numbers
4242 4242 4242 4242 - Success
4000 0000 0000 9995 - Decline
```

#### 3. Updated Environment Variables
Update `frontend/.env.dev`:
```env
REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxx
```

#### 4. Sample API Calls
Provide working curl commands for all endpoints

#### 5. Test Data
- Sample event IDs
- Sample registration IDs
- Sample ticket IDs
- Test user credentials

---

## 📝 Documentation to Create

### Required Documents

#### 1. PHASE3_COMPLETION_REPORT.md
Include:
- What was built
- Lambda functions created
- API endpoints added
- Test results
- Known issues
- Handoff information

#### 2. lambda/README.md
Document each Lambda function:
- Purpose
- Input/output
- Environment variables
- Dependencies
- Testing instructions

#### 3. STRIPE_SETUP.md
Document:
- How to create Stripe account
- How to get API keys
- Test card numbers
- Webhook configuration

---

## ⚠️ Common Issues & Solutions

### Issue 1: PDF Generation Fails
**Solution**: Check Lambda memory (increase to 512MB if needed)

### Issue 2: S3 Upload Permission Denied
**Solution**: Verify Lambda execution role has S3 PutObject permission

### Issue 3: Stripe Webhook Not Receiving Events
**Solution**: Use Stripe CLI for local testing: `stripe listen --forward-to localhost:3000/webhook`

### Issue 4: QR Code Not Scanning
**Solution**: Ensure QR code data is properly formatted and not too long

### Issue 5: Pre-signed URL Expired
**Solution**: Generate new URL (they expire after 15 minutes)

---

## ✅ Completion Checklist

### Before Marking Phase 3 Complete

- [ ] All 4 Lambda functions created
- [ ] All Lambda functions deployed
- [ ] API Gateway updated with new endpoints
- [ ] Stripe integration working
- [ ] PDF tickets generating correctly
- [ ] QR codes embedded in PDFs
- [ ] Tickets uploading to S3
- [ ] Pre-signed URLs working
- [ ] Ticket validation working
- [ ] All tests passing
- [ ] CloudWatch logs reviewed
- [ ] Documentation created
- [ ] Handoff document prepared
- [ ] Shivam notified and briefed
- [ ] Code committed to repository
- [ ] Phase 3 completion report written

---

## 🎯 Success Criteria

Your phase is complete when:
1. ✅ User can register and pay for event
2. ✅ PDF ticket is automatically generated
3. ✅ User can download their ticket
4. ✅ QR code can be scanned and validated
5. ✅ Used tickets are rejected
6. ✅ All endpoints tested and working
7. ✅ Documentation complete
8. ✅ Shivam has all information to start Phase 4

---

## 📞 Need Help?

**Contact Anshuman for**:
- AWS permissions issues
- Infrastructure questions
- DynamoDB schema questions
- Architecture clarifications

**Resources**:
- Stripe Docs: https://stripe.com/docs
- PDFKit Docs: http://pdfkit.org/
- QRCode Docs: https://www.npmjs.com/package/qrcode
- AWS Lambda Docs: https://docs.aws.amazon.com/lambda/

---

**Good luck, Pavan! You've got this! 🚀**

---

*Work Plan Created: December 4, 2025*  
*Phase 3: Ticket Generation & Payments*  
*Estimated Duration: 1 day*
