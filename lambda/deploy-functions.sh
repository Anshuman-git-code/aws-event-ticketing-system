#!/bin/bash

# Lambda Functions Deployment Script
set -e

REGION="us-east-1"
PROJECT="event-ticketing"
ENV="dev"

echo "Deploying Lambda functions..."

# Function to deploy a Lambda
deploy_lambda() {
    local function_dir=$1
    local function_name=$2
    
    echo "Deploying ${function_name}..."
    
    cd ${function_dir}
    
    # Install dependencies if package.json exists
    if [ -f "package.json" ]; then
        npm install --production
    fi
    
    # Create deployment package
    zip -r function.zip . -x "*.sh" "*.md"
    
    # Update Lambda function code
    aws lambda update-function-code \
        --function-name ${PROJECT}-${function_name}-${ENV} \
        --zip-file fileb://function.zip \
        --region ${REGION}
    
    # Clean up
    rm function.zip
    
    cd ..
    
    echo "✓ ${function_name} deployed"
}

# Deploy all functions
deploy_lambda "createEvent" "createEvent"
deploy_lambda "listEvents" "listEvents"
deploy_lambda "getEvent" "getEvent"
deploy_lambda "createRegistration" "createRegistration"

echo ""
echo "All Lambda functions deployed successfully!"
