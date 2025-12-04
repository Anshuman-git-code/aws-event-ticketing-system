# Quick Reference Guide

## 🚀 Common Commands

### Deployment
```bash
# Deploy all infrastructure
cd cloudformation && ./deploy.sh dev us-east-1

# Deploy specific stack
aws cloudformation create-stack \
  --stack-name event-ticketing-base-dev \
  --template-body file://base-infrastructure.yaml \
  --parameters ParameterKey=Environment,ParameterValue=dev \
  --region us-east-1

# Update existing stack
aws cloudformation update-stack \
  --stack-name event-ticketing-base-dev \
  --template-body file://base-infrastructure.yaml \
  --region us-east-1
```

### Monitoring
```bash
# Check stack status
aws cloudformation describe-stacks \
  --stack-name event-ticketing-base-dev \
  --region us-east-1

# View stack events
aws cloudformation describe-stack-events \
  --stack-name event-ticketing-base-dev \
  --region us-east-1 \
  --max-items 10

# Get stack outputs
aws cloudformation describe-stacks \
  --stack-name event-ticketing-base-dev \
  --query 'Stacks[0].Outputs' \
  --region us-east-1
```

### DynamoDB
```bash
# List tables
aws dynamodb list-tables --region us-east-1

# Describe table
aws dynamodb describe-table \
  --table-name event-ticketing-events-dev \
  --region us-east-1

# Scan table
aws dynamodb scan \
  --table-name event-ticketing-events-dev \
  --region us-east-1

# Put item
aws dynamodb put-item \
  --table-name event-ticketing-events-dev \
  --item file://sample-event.json \
  --region us-east-1

# Get item
aws dynamodb get-item \
  --table-name event-ticketing-events-dev \
  --key '{"eventId": {"S": "EVENT#123"}}' \
  --region us-east-1
```

### S3
```bash
# List buckets
aws s3 ls | grep event-ticketing

# List bucket contents
aws s3 ls s3://event-ticketing-tickets-dev-123456789012/

# Upload file
aws s3 cp ticket.pdf s3://event-ticketing-tickets-dev-123456789012/tickets/

# Generate pre-signed URL
aws s3 presign \
  s3://event-ticketing-tickets-dev-123456789012/tickets/ticket.pdf \
  --expires-in 900

# Sync directory
aws s3 sync ./build s3://event-ticketing-frontend-dev-123456789012/
```

### Cognito
```bash
# List user pools
aws cognito-idp list-user-pools --max-results 10 --region us-east-1

# Describe user pool
aws cognito-idp describe-user-pool \
  --user-pool-id us-east-1_xxxxxxxxx \
  --region us-east-1

# List users
aws cognito-idp list-users \
  --user-pool-id us-east-1_xxxxxxxxx \
  --region us-east-1

# Create user
aws cognito-idp admin-create-user \
  --user-pool-id us-east-1_xxxxxxxxx \
  --username user@example.com \
  --user-attributes Name=email,Value=user@example.com \
  --region us-east-1

# Add user to group
aws cognito-idp admin-add-user-to-group \
  --user-pool-id us-east-1_xxxxxxxxx \
  --username user@example.com \
  --group-name Attendees \
  --region us-east-1

# Delete user
aws cognito-idp admin-delete-user \
  --user-pool-id us-east-1_xxxxxxxxx \
  --username user@example.com \
  --region us-east-1
```

### CloudFront
```bash
# List distributions
aws cloudfront list-distributions \
  --query 'DistributionList.Items[*].[Id,DomainName,Status]' \
  --output table

# Get distribution
aws cloudfront get-distribution \
  --id E1234567890ABC

# Create invalidation
aws cloudfront create-invalidation \
  --distribution-id E1234567890ABC \
  --paths "/*"
```

### CloudWatch
```bash
# List log groups
aws logs describe-log-groups --region us-east-1

# Tail logs
aws logs tail /aws/lambda/event-ticketing-dev --follow --region us-east-1

# Get log events
aws logs get-log-events \
  --log-group-name /aws/lambda/event-ticketing-dev \
  --log-stream-name 2025/12/03/[$LATEST]abc123 \
  --region us-east-1
```

### Cleanup
```bash
# Empty S3 buckets
aws s3 rm s3://event-ticketing-tickets-dev-123456789012 --recursive
aws s3 rm s3://event-ticketing-frontend-dev-123456789012 --recursive

# Delete stacks
aws cloudformation delete-stack --stack-name event-ticketing-auth-dev
aws cloudformation delete-stack --stack-name event-ticketing-base-dev

# Wait for deletion
aws cloudformation wait stack-delete-complete \
  --stack-name event-ticketing-base-dev
```

## 📊 Stack Outputs Reference

### Base Infrastructure Stack
- `EventsTableName`: DynamoDB Events table name
- `EventsTableArn`: Events table ARN
- `RegistrationsTableName`: DynamoDB Registrations table name
- `RegistrationsTableArn`: Registrations table ARN
- `TicketsTableName`: DynamoDB Tickets table name
- `TicketsTableArn`: Tickets table ARN
- `TicketsBucketName`: S3 bucket for tickets
- `TicketsBucketArn`: Tickets bucket ARN
- `FrontendBucketName`: S3 bucket for frontend
- `CloudFrontDistributionId`: CloudFront distribution ID
- `CloudFrontDomainName`: CloudFront domain
- `CloudFrontURL`: Full CloudFront URL

### Auth Stack
- `UserPoolId`: Cognito User Pool ID
- `UserPoolArn`: User Pool ARN
- `UserPoolClientId`: User Pool Client ID
- `UserPoolDomain`: User Pool domain
- `IdentityPoolId`: Identity Pool ID
- `OrganizersGroupName`: Organizers group name
- `AttendeesGroupName`: Attendees group name
- `CognitoAuthenticatedRoleArn`: IAM role ARN

## 🔑 Environment Variables

### Frontend (.env.dev)
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

### Lambda (Environment Variables)
```env
EVENTS_TABLE=event-ticketing-events-dev
REGISTRATIONS_TABLE=event-ticketing-registrations-dev
TICKETS_TABLE=event-ticketing-tickets-dev
TICKETS_BUCKET=event-ticketing-tickets-dev-123456789012
REGION=us-east-1
STRIPE_SECRET_KEY=sk_test_xxxxxxxxxxxxx
```

## 📋 Resource Naming Convention

```
{ProjectName}-{ResourceType}-{Environment}-{AccountId}

Examples:
- event-ticketing-events-dev
- event-ticketing-tickets-dev-123456789012
- event-ticketing-users-dev
```

## 🔍 Troubleshooting

### Stack Creation Failed
```bash
# Check events
aws cloudformation describe-stack-events \
  --stack-name event-ticketing-base-dev \
  --region us-east-1 \
  --max-items 20

# Check specific resource
aws cloudformation describe-stack-resource \
  --stack-name event-ticketing-base-dev \
  --logical-resource-id EventsTable \
  --region us-east-1
```

### DynamoDB Access Denied
```bash
# Check IAM policy
aws iam get-user-policy \
  --user-name your-username \
  --policy-name DynamoDBAccess

# Test access
aws dynamodb list-tables --region us-east-1
```

### S3 Bucket Access Denied
```bash
# Check bucket policy
aws s3api get-bucket-policy \
  --bucket event-ticketing-tickets-dev-123456789012

# Check bucket ACL
aws s3api get-bucket-acl \
  --bucket event-ticketing-tickets-dev-123456789012
```

### Cognito User Creation Failed
```bash
# Check user pool configuration
aws cognito-idp describe-user-pool \
  --user-pool-id us-east-1_xxxxxxxxx \
  --region us-east-1

# List groups
aws cognito-idp list-groups \
  --user-pool-id us-east-1_xxxxxxxxx \
  --region us-east-1
```

## 💰 Cost Monitoring

### Set up billing alerts
```bash
# Create SNS topic
aws sns create-topic --name billing-alerts --region us-east-1

# Subscribe to topic
aws sns subscribe \
  --topic-arn arn:aws:sns:us-east-1:123456789012:billing-alerts \
  --protocol email \
  --notification-endpoint your-email@example.com \
  --region us-east-1
```

### Check current costs
```bash
# Get cost and usage (requires Cost Explorer API)
aws ce get-cost-and-usage \
  --time-period Start=2025-12-01,End=2025-12-31 \
  --granularity MONTHLY \
  --metrics BlendedCost \
  --region us-east-1
```

## 🔐 Security Best Practices

### Enable MFA for AWS account
```bash
# List MFA devices
aws iam list-mfa-devices

# Enable virtual MFA
aws iam enable-mfa-device \
  --user-name your-username \
  --serial-number arn:aws:iam::123456789012:mfa/your-username \
  --authentication-code1 123456 \
  --authentication-code2 789012
```

### Rotate access keys
```bash
# Create new access key
aws iam create-access-key --user-name your-username

# Delete old access key
aws iam delete-access-key \
  --user-name your-username \
  --access-key-id AKIAIOSFODNN7EXAMPLE
```

### Enable CloudTrail
```bash
# Create trail
aws cloudtrail create-trail \
  --name event-ticketing-trail \
  --s3-bucket-name my-cloudtrail-bucket \
  --region us-east-1

# Start logging
aws cloudtrail start-logging \
  --name event-ticketing-trail \
  --region us-east-1
```

## 📚 Useful Links

- [AWS CLI Documentation](https://docs.aws.amazon.com/cli/)
- [CloudFormation Reference](https://docs.aws.amazon.com/cloudformation/)
- [DynamoDB Developer Guide](https://docs.aws.amazon.com/dynamodb/)
- [Cognito Developer Guide](https://docs.aws.amazon.com/cognito/)
- [S3 User Guide](https://docs.aws.amazon.com/s3/)
- [CloudFront Developer Guide](https://docs.aws.amazon.com/cloudfront/)

## 🎯 Quick Start Checklist

- [ ] AWS CLI installed and configured
- [ ] AWS credentials set up
- [ ] Region selected (us-east-1)
- [ ] CloudFormation templates reviewed
- [ ] Deploy script executed
- [ ] Stack outputs retrieved
- [ ] Configuration file generated
- [ ] Resources verified
- [ ] Test data created
- [ ] Documentation reviewed

## 📞 Support

For issues:
1. Check CloudFormation events
2. Review CloudWatch logs
3. Verify IAM permissions
4. Check resource limits
5. Review documentation

---

*Quick Reference Guide - Event Ticketing System*  
*Last Updated: December 3, 2025*
