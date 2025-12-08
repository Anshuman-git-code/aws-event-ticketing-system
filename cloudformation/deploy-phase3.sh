#!/bin/bash
set -e

ENVIRONMENT=${1:-dev}
REGION="eu-north-1"
STACK_NAME="event-ticketing-phase3-$ENVIRONMENT"

echo "========================================="
echo "Deploying Phase 3: Payments & Tickets"
echo "========================================="
echo "Environment: $ENVIRONMENT"
echo "Region: $REGION"
echo "Stack: $STACK_NAME"
echo ""

# Get account ID
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
echo "Account ID: $ACCOUNT_ID"

# Get Stripe key (you need to set this)
if [ -z "$STRIPE_SECRET_KEY" ]; then
    echo "ERROR: STRIPE_SECRET_KEY environment variable not set"
    echo "Please run: export STRIPE_SECRET_KEY=sk_test_..."
    exit 1
fi

# Set bucket name
TICKETS_BUCKET="event-ticketing-tickets-$ENVIRONMENT-$ACCOUNT_ID"

echo "Tickets Bucket: $TICKETS_BUCKET"
echo ""

# Deploy CloudFormation stack
echo "Deploying CloudFormation stack..."
aws cloudformation create-stack \
    --stack-name $STACK_NAME \
    --template-body file://phase3-api-lambda.yaml \
    --parameters \
        ParameterKey=Environment,ParameterValue=$ENVIRONMENT \
        ParameterKey=ProjectName,ParameterValue=event-ticketing \
        ParameterKey=StripeSecretKey,ParameterValue=$STRIPE_SECRET_KEY \
        ParameterKey=TicketsBucketName,ParameterValue=$TICKETS_BUCKET \
    --capabilities CAPABILITY_NAMED_IAM \
    --region $REGION

echo ""
echo "Waiting for stack creation to complete..."
aws cloudformation wait stack-create-complete \
    --stack-name $STACK_NAME \
    --region $REGION

echo ""
echo "✓ Stack created successfully!"
echo ""

# Get outputs
echo "Stack Outputs:"
aws cloudformation describe-stacks \
    --stack-name $STACK_NAME \
    --region $REGION \
    --query 'Stacks[0].Outputs' \
    --output table

echo ""
echo "========================================="
echo "✓ Phase 3 Infrastructure Deployed!"
echo "========================================="
echo ""
echo "Next steps:"
echo "1. Deploy Lambda function code:"
echo "   cd ../lambda-phase3"
echo "   ./deploy-functions.sh"
echo ""
echo "2. Test API endpoints"
echo "3. Update frontend with new API URL"
echo ""
