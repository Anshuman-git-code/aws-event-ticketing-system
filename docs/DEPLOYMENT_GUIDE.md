# Deployment Guide - Phase 1

## Prerequisites

Before deploying the infrastructure, ensure you have:

1. **AWS Account**: Active AWS account with appropriate permissions
2. **AWS CLI**: Installed and configured
   ```bash
   aws --version
   # Should show: aws-cli/2.x.x or higher
   ```
3. **AWS Credentials**: Configured with admin access (for development)
   ```bash
   aws configure
   # Enter: Access Key ID, Secret Access Key, Region (us-east-1), Output format (json)
   ```
4. **Verify Access**:
   ```bash
   aws sts get-caller-identity
   # Should display your account ID and user ARN
   ```

## Step-by-Step Deployment

### Option 1: Automated Deployment (Recommended)

Use the provided deployment script:

```bash
cd cloudformation
./deploy.sh dev us-east-1
```

This script will:
- Deploy base infrastructure (DynamoDB, S3, CloudFront)
- Deploy authentication (Cognito)
- Generate configuration file for frontend
- Display all resource details

### Option 2: Manual Deployment

#### Step 1: Deploy Base Infrastructure

```bash
aws cloudformation create-stack \
  --stack-name event-ticketing-base-dev \
  --template-body file://base-infrastructure.yaml \
  --parameters \
    ParameterKey=Environment,ParameterValue=dev \
    ParameterKey=ProjectName,ParameterValue=event-ticketing \
  --region us-east-1

# Wait for completion
aws cloudformation wait stack-create-complete \
  --stack-name event-ticketing-base-dev \
  --region us-east-1
```

#### Step 2: Deploy Authentication

```bash
aws cloudformation create-stack \
  --stack-name event-ticketing-auth-dev \
  --template-body file://auth.yaml \
  --parameters \
    ParameterKey=Environment,ParameterValue=dev \
    ParameterKey=ProjectName,ParameterValue=event-ticketing \
  --capabilities CAPABILITY_NAMED_IAM \
  --region us-east-1

# Wait for completion
aws cloudformation wait stack-create-complete \
  --stack-name event-ticketing-auth-dev \
  --region us-east-1
```

#### Step 3: Retrieve Outputs

```bash
# Get all outputs from base stack
aws cloudformation describe-stacks \
  --stack-name event-ticketing-base-dev \
  --region us-east-1 \
  --query 'Stacks[0].Outputs'

# Get all outputs from auth stack
aws cloudformation describe-stacks \
  --stack-name event-ticketing-auth-dev \
  --region us-east-1 \
  --query 'Stacks[0].Outputs'
```

## Verify Deployment

### 1. Check DynamoDB Tables

```bash
# List tables
aws dynamodb list-tables --region us-east-1

# Describe Events table
aws dynamodb describe-table \
  --table-name event-ticketing-events-dev \
  --region us-east-1
```

Expected tables:
- `event-ticketing-events-dev`
- `event-ticketing-registrations-dev`
- `event-ticketing-tickets-dev`

### 2. Check S3 Buckets

```bash
# List buckets
aws s3 ls | grep event-ticketing

# Check bucket details
aws s3api get-bucket-encryption \
  --bucket event-ticketing-tickets-dev-<ACCOUNT_ID>
```

Expected buckets:
- `event-ticketing-tickets-dev-<ACCOUNT_ID>`
- `event-ticketing-frontend-dev-<ACCOUNT_ID>`

### 3. Check CloudFront Distribution

```bash
# List distributions
aws cloudfront list-distributions \
  --query 'DistributionList.Items[*].[Id,DomainName,Status]' \
  --output table
```

Status should be "Deployed"

### 4. Check Cognito User Pool

```bash
# List user pools
aws cognito-idp list-user-pools --max-results 10 --region us-east-1

# Get user pool details
aws cognito-idp describe-user-pool \
  --user-pool-id <USER_POOL_ID> \
  --region us-east-1

# List groups
aws cognito-idp list-groups \
  --user-pool-id <USER_POOL_ID> \
  --region us-east-1
```

Expected groups:
- `Organizers`
- `Attendees`

## Test Infrastructure

### 1. Test DynamoDB Write/Read

```bash
# Create a test event
aws dynamodb put-item \
  --table-name event-ticketing-events-dev \
  --item '{
    "eventId": {"S": "EVENT#test-001"},
    "name": {"S": "Test Event"},
    "date": {"S": "2025-12-15T09:00:00Z"},
    "status": {"S": "active"},
    "organizerId": {"S": "USER#test"},
    "capacity": {"N": "100"},
    "price": {"N": "50"}
  }' \
  --region us-east-1

# Read the test event
aws dynamodb get-item \
  --table-name event-ticketing-events-dev \
  --key '{"eventId": {"S": "EVENT#test-001"}}' \
  --region us-east-1

# Delete test event
aws dynamodb delete-item \
  --table-name event-ticketing-events-dev \
  --key '{"eventId": {"S": "EVENT#test-001"}}' \
  --region us-east-1
```

### 2. Test S3 Upload

```bash
# Create test file
echo "Test ticket content" > test-ticket.txt

# Upload to tickets bucket
aws s3 cp test-ticket.txt \
  s3://event-ticketing-tickets-dev-<ACCOUNT_ID>/test/test-ticket.txt

# Generate pre-signed URL
aws s3 presign \
  s3://event-ticketing-tickets-dev-<ACCOUNT_ID>/test/test-ticket.txt \
  --expires-in 900

# Clean up
aws s3 rm s3://event-ticketing-tickets-dev-<ACCOUNT_ID>/test/test-ticket.txt
rm test-ticket.txt
```

### 3. Test Cognito User Creation

```bash
# Create test user
aws cognito-idp admin-create-user \
  --user-pool-id <USER_POOL_ID> \
  --username test@example.com \
  --user-attributes \
    Name=email,Value=test@example.com \
    Name=name,Value="Test User" \
    Name=email_verified,Value=true \
  --temporary-password "TempPass123!" \
  --region us-east-1

# Add user to Attendees group
aws cognito-idp admin-add-user-to-group \
  --user-pool-id <USER_POOL_ID> \
  --username test@example.com \
  --group-name Attendees \
  --region us-east-1

# Delete test user
aws cognito-idp admin-delete-user \
  --user-pool-id <USER_POOL_ID> \
  --username test@example.com \
  --region us-east-1
```

## Configuration File

After deployment, a configuration file is generated at `frontend/.env.dev`:

```env
REACT_APP_AWS_REGION=us-east-1
REACT_APP_USER_POOL_ID=us-east-1_xxxxxxxxx
REACT_APP_USER_POOL_CLIENT_ID=xxxxxxxxxxxxxxxxxxxxxxxxxx
REACT_APP_IDENTITY_POOL_ID=us-east-1:xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
REACT_APP_EVENTS_TABLE=event-ticketing-events-dev
REACT_APP_REGISTRATIONS_TABLE=event-ticketing-registrations-dev
REACT_APP_TICKETS_TABLE=event-ticketing-tickets-dev
REACT_APP_TICKETS_BUCKET=event-ticketing-tickets-dev-123456789012
REACT_APP_CLOUDFRONT_URL=https://d1234567890abc.cloudfront.net
REACT_APP_ENVIRONMENT=dev
```

## Update Existing Stack

To update an existing stack:

```bash
aws cloudformation update-stack \
  --stack-name event-ticketing-base-dev \
  --template-body file://base-infrastructure.yaml \
  --parameters \
    ParameterKey=Environment,ParameterValue=dev \
    ParameterKey=ProjectName,ParameterValue=event-ticketing \
  --region us-east-1
```

## Delete Stack (Cleanup)

To remove all resources:

```bash
# Delete auth stack first
aws cloudformation delete-stack \
  --stack-name event-ticketing-auth-dev \
  --region us-east-1

# Wait for deletion
aws cloudformation wait stack-delete-complete \
  --stack-name event-ticketing-auth-dev \
  --region us-east-1

# Empty S3 buckets before deleting base stack
aws s3 rm s3://event-ticketing-tickets-dev-<ACCOUNT_ID> --recursive
aws s3 rm s3://event-ticketing-frontend-dev-<ACCOUNT_ID> --recursive

# Delete base stack
aws cloudformation delete-stack \
  --stack-name event-ticketing-base-dev \
  --region us-east-1

# Wait for deletion
aws cloudformation wait stack-delete-complete \
  --stack-name event-ticketing-base-dev \
  --region us-east-1
```

## Troubleshooting

### Issue: Stack creation fails

**Solution**: Check CloudFormation events
```bash
aws cloudformation describe-stack-events \
  --stack-name event-ticketing-base-dev \
  --region us-east-1 \
  --max-items 10
```

### Issue: Permission denied

**Solution**: Ensure IAM user has required permissions:
- CloudFormation: Full access
- DynamoDB: Full access
- S3: Full access
- CloudFront: Full access
- Cognito: Full access
- IAM: Create roles and policies

### Issue: Bucket name already exists

**Solution**: S3 bucket names must be globally unique. The template uses `${AWS::AccountId}` to ensure uniqueness. If it still fails, modify the bucket name in the template.

### Issue: CloudFront distribution takes long time

**Solution**: CloudFront distributions can take 15-20 minutes to deploy. This is normal. Check status:
```bash
aws cloudfront get-distribution \
  --id <DISTRIBUTION_ID> \
  --query 'Distribution.Status'
```

## Cost Monitoring

Set up billing alerts:

```bash
# Create SNS topic for billing alerts
aws sns create-topic \
  --name billing-alerts \
  --region us-east-1

# Subscribe your email
aws sns subscribe \
  --topic-arn arn:aws:sns:us-east-1:<ACCOUNT_ID>:billing-alerts \
  --protocol email \
  --notification-endpoint your-email@example.com \
  --region us-east-1
```

Then create a CloudWatch billing alarm in the AWS Console.

## Next Steps

After Phase 1 deployment:

1. ✅ Infrastructure is ready
2. ✅ DynamoDB tables created
3. ✅ S3 buckets configured
4. ✅ CloudFront distribution deployed
5. ✅ Cognito user pool set up

**Proceed to Phase 2 (Day 2)**:
- Create Lambda functions
- Set up API Gateway
- Connect Lambda to DynamoDB
- Test API endpoints

## Resources Created

### DynamoDB Tables (3)
- Events table with 3 GSIs
- Registrations table with 3 GSIs
- Tickets table with 4 GSIs

### S3 Buckets (2)
- Tickets bucket (encrypted, versioned)
- Frontend bucket (static website hosting)

### CloudFront (1)
- Distribution with S3 origin

### Cognito (4)
- User Pool
- User Pool Client
- Identity Pool
- 2 User Groups (Organizers, Attendees)

### IAM (1)
- Authenticated role for Cognito users

### CloudWatch (1)
- Log group for Lambda functions

**Total Resources**: ~15 AWS resources

## Estimated Costs (Monthly)

Based on 1000 active users, 100 events:

- **DynamoDB**: $0.50 (on-demand, low traffic)
- **S3**: $1.00 (10GB storage)
- **CloudFront**: $1.00 (10GB transfer)
- **Cognito**: $0.00 (free tier up to 50K MAU)
- **CloudWatch**: $0.50 (logs)

**Total**: ~$3.00/month for Phase 1 infrastructure

Note: Costs will increase with Lambda and API Gateway in Phase 2.
