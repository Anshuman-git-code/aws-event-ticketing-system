#!/bin/bash

# Event Ticketing System - CloudFormation Deployment Script
# Usage: ./deploy.sh [environment] [region]
# Example: ./deploy.sh dev us-east-1

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Default values
ENVIRONMENT=${1:-dev}
REGION=${2:-us-east-1}
PROJECT_NAME="event-ticketing"

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Event Ticketing System Deployment${NC}"
echo -e "${GREEN}========================================${NC}"
echo -e "Environment: ${YELLOW}${ENVIRONMENT}${NC}"
echo -e "Region: ${YELLOW}${REGION}${NC}"
echo -e "Project: ${YELLOW}${PROJECT_NAME}${NC}"
echo ""

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    echo -e "${RED}Error: AWS CLI is not installed${NC}"
    exit 1
fi

# Check AWS credentials
echo -e "${YELLOW}Checking AWS credentials...${NC}"
if ! aws sts get-caller-identity --region ${REGION} &> /dev/null; then
    echo -e "${RED}Error: AWS credentials not configured${NC}"
    exit 1
fi

ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
echo -e "${GREEN}✓ AWS Account: ${ACCOUNT_ID}${NC}"
echo ""

# Function to deploy stack
deploy_stack() {
    local stack_name=$1
    local template_file=$2
    local description=$3
    
    echo -e "${YELLOW}Deploying ${description}...${NC}"
    
    # Check if stack exists
    if aws cloudformation describe-stacks --stack-name ${stack_name} --region ${REGION} &> /dev/null; then
        echo "Stack exists, updating..."
        aws cloudformation update-stack \
            --stack-name ${stack_name} \
            --template-body file://${template_file} \
            --parameters \
                ParameterKey=Environment,ParameterValue=${ENVIRONMENT} \
                ParameterKey=ProjectName,ParameterValue=${PROJECT_NAME} \
            --capabilities CAPABILITY_NAMED_IAM \
            --region ${REGION} || {
                if [ $? -eq 254 ]; then
                    echo -e "${YELLOW}No updates to be performed${NC}"
                else
                    echo -e "${RED}Update failed${NC}"
                    exit 1
                fi
            }
        
        echo "Waiting for stack update to complete..."
        aws cloudformation wait stack-update-complete \
            --stack-name ${stack_name} \
            --region ${REGION} || true
    else
        echo "Stack does not exist, creating..."
        aws cloudformation create-stack \
            --stack-name ${stack_name} \
            --template-body file://${template_file} \
            --parameters \
                ParameterKey=Environment,ParameterValue=${ENVIRONMENT} \
                ParameterKey=ProjectName,ParameterValue=${PROJECT_NAME} \
            --capabilities CAPABILITY_NAMED_IAM \
            --region ${REGION}
        
        echo "Waiting for stack creation to complete..."
        aws cloudformation wait stack-create-complete \
            --stack-name ${stack_name} \
            --region ${REGION}
    fi
    
    echo -e "${GREEN}✓ ${description} deployed successfully${NC}"
    echo ""
}

# Deploy stacks in order
echo -e "${GREEN}Starting deployment...${NC}"
echo ""

# 1. Deploy base infrastructure
deploy_stack \
    "${PROJECT_NAME}-base-${ENVIRONMENT}" \
    "base-infrastructure.yaml" \
    "Base Infrastructure (DynamoDB, S3, CloudFront)"

# 2. Deploy authentication
deploy_stack \
    "${PROJECT_NAME}-auth-${ENVIRONMENT}" \
    "auth.yaml" \
    "Authentication (Cognito)"

# Get stack outputs
echo -e "${YELLOW}Retrieving stack outputs...${NC}"
echo ""

get_output() {
    local stack_name=$1
    local output_key=$2
    aws cloudformation describe-stacks \
        --stack-name ${stack_name} \
        --region ${REGION} \
        --query "Stacks[0].Outputs[?OutputKey=='${output_key}'].OutputValue" \
        --output text
}

# Base Infrastructure Outputs
EVENTS_TABLE=$(get_output "${PROJECT_NAME}-base-${ENVIRONMENT}" "EventsTableName")
REGISTRATIONS_TABLE=$(get_output "${PROJECT_NAME}-base-${ENVIRONMENT}" "RegistrationsTableName")
TICKETS_TABLE=$(get_output "${PROJECT_NAME}-base-${ENVIRONMENT}" "TicketsTableName")
TICKETS_BUCKET=$(get_output "${PROJECT_NAME}-base-${ENVIRONMENT}" "TicketsBucketName")
FRONTEND_BUCKET=$(get_output "${PROJECT_NAME}-base-${ENVIRONMENT}" "FrontendBucketName")
CLOUDFRONT_URL=$(get_output "${PROJECT_NAME}-base-${ENVIRONMENT}" "CloudFrontURL")

# Auth Outputs
USER_POOL_ID=$(get_output "${PROJECT_NAME}-auth-${ENVIRONMENT}" "UserPoolId")
USER_POOL_CLIENT_ID=$(get_output "${PROJECT_NAME}-auth-${ENVIRONMENT}" "UserPoolClientId")
IDENTITY_POOL_ID=$(get_output "${PROJECT_NAME}-auth-${ENVIRONMENT}" "IdentityPoolId")

# Display outputs
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Deployment Complete!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "${YELLOW}DynamoDB Tables:${NC}"
echo -e "  Events Table: ${GREEN}${EVENTS_TABLE}${NC}"
echo -e "  Registrations Table: ${GREEN}${REGISTRATIONS_TABLE}${NC}"
echo -e "  Tickets Table: ${GREEN}${TICKETS_TABLE}${NC}"
echo ""
echo -e "${YELLOW}S3 Buckets:${NC}"
echo -e "  Tickets Bucket: ${GREEN}${TICKETS_BUCKET}${NC}"
echo -e "  Frontend Bucket: ${GREEN}${FRONTEND_BUCKET}${NC}"
echo ""
echo -e "${YELLOW}CloudFront:${NC}"
echo -e "  URL: ${GREEN}${CLOUDFRONT_URL}${NC}"
echo ""
echo -e "${YELLOW}Cognito:${NC}"
echo -e "  User Pool ID: ${GREEN}${USER_POOL_ID}${NC}"
echo -e "  Client ID: ${GREEN}${USER_POOL_CLIENT_ID}${NC}"
echo -e "  Identity Pool ID: ${GREEN}${IDENTITY_POOL_ID}${NC}"
echo ""

# Save configuration to file
CONFIG_FILE="../frontend/.env.${ENVIRONMENT}"
echo -e "${YELLOW}Saving configuration to ${CONFIG_FILE}...${NC}"

cat > ${CONFIG_FILE} << EOF
# AWS Configuration - Generated on $(date)
REACT_APP_AWS_REGION=${REGION}
REACT_APP_USER_POOL_ID=${USER_POOL_ID}
REACT_APP_USER_POOL_CLIENT_ID=${USER_POOL_CLIENT_ID}
REACT_APP_IDENTITY_POOL_ID=${IDENTITY_POOL_ID}
REACT_APP_EVENTS_TABLE=${EVENTS_TABLE}
REACT_APP_REGISTRATIONS_TABLE=${REGISTRATIONS_TABLE}
REACT_APP_TICKETS_TABLE=${TICKETS_TABLE}
REACT_APP_TICKETS_BUCKET=${TICKETS_BUCKET}
REACT_APP_CLOUDFRONT_URL=${CLOUDFRONT_URL}
REACT_APP_ENVIRONMENT=${ENVIRONMENT}
EOF

echo -e "${GREEN}✓ Configuration saved${NC}"
echo ""
echo -e "${GREEN}Next Steps:${NC}"
echo -e "1. Configure frontend with the generated .env file"
echo -e "2. Deploy Lambda functions (Day 2)"
echo -e "3. Deploy API Gateway (Day 2)"
echo -e "4. Build and deploy frontend (Day 4)"
echo ""
echo -e "${GREEN}Deployment completed successfully!${NC}"
