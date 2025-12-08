#!/bin/bash

# Comprehensive Backend Testing Script
# Tests all components before frontend development

set -e  # Exit on error

echo "========================================="
echo "🧪 COMPREHENSIVE BACKEND TESTING"
echo "Event Ticketing System"
echo "========================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test counters
TESTS_PASSED=0
TESTS_FAILED=0
TESTS_TOTAL=0

# Function to run test
run_test() {
    local test_name=$1
    local test_command=$2
    
    TESTS_TOTAL=$((TESTS_TOTAL + 1))
    echo -n "Test $TESTS_TOTAL: $test_name... "
    
    if eval "$test_command" > /dev/null 2>&1; then
        echo -e "${GREEN}✓ PASS${NC}"
        TESTS_PASSED=$((TESTS_PASSED + 1))
        return 0
    else
        echo -e "${RED}✗ FAIL${NC}"
        TESTS_FAILED=$((TESTS_FAILED + 1))
        return 1
    fi
}

# Function to run test with output
run_test_with_output() {
    local test_name=$1
    local test_command=$2
    
    TESTS_TOTAL=$((TESTS_TOTAL + 1))
    echo ""
    echo "Test $TESTS_TOTAL: $test_name"
    echo "-----------------------------------"
    
    if eval "$test_command"; then
        echo -e "${GREEN}✓ PASS${NC}"
        TESTS_PASSED=$((TESTS_PASSED + 1))
        return 0
    else
        echo -e "${RED}✗ FAIL${NC}"
        TESTS_FAILED=$((TESTS_FAILED + 1))
        return 1
    fi
}

echo "📋 PHASE 1: Infrastructure Tests"
echo "========================================="

# Test 1: DynamoDB Tables
run_test "Events table exists" \
    "aws dynamodb describe-table --table-name event-ticketing-events-dev --region us-east-1 --query 'Table.TableStatus' --output text | grep -q ACTIVE"

run_test "Registrations table exists" \
    "aws dynamodb describe-table --table-name event-ticketing-registrations-dev --region us-east-1 --query 'Table.TableStatus' --output text | grep -q ACTIVE"

run_test "Tickets table exists" \
    "aws dynamodb describe-table --table-name event-ticketing-tickets-dev --region us-east-1 --query 'Table.TableStatus' --output text | grep -q ACTIVE"

# Test 2: S3 Buckets
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)

run_test "Tickets bucket exists" \
    "aws s3 ls s3://event-ticketing-tickets-dev-$ACCOUNT_ID"

run_test "Frontend bucket exists" \
    "aws s3 ls s3://event-ticketing-frontend-dev-$ACCOUNT_ID"

# Test 3: Cognito
run_test "User Pool exists" \
    "aws cognito-idp describe-user-pool --user-pool-id us-east-1_LSO6RslSb --region us-east-1 --query 'UserPool.Id' --output text | grep -q us-east-1_LSO6RslSb"

run_test "Organizers group exists" \
    "aws cognito-idp get-group --user-pool-id us-east-1_LSO6RslSb --group-name Organizers --region us-east-1"

run_test "Attendees group exists" \
    "aws cognito-idp get-group --user-pool-id us-east-1_LSO6RslSb --group-name Attendees --region us-east-1"

echo ""
echo "📋 PHASE 2: Lambda Functions (us-east-1)"
echo "========================================="

# Test Lambda functions in us-east-1
run_test "createEvent Lambda exists" \
    "aws lambda get-function --function-name event-ticketing-createEvent-dev --region us-east-1 --query 'Configuration.State' --output text | grep -q Active"

run_test "listEvents Lambda exists" \
    "aws lambda get-function --function-name event-ticketing-listEvents-dev --region us-east-1 --query 'Configuration.State' --output text | grep -q Active"

run_test "getEvent Lambda exists" \
    "aws lambda get-function --function-name event-ticketing-getEvent-dev --region us-east-1 --query 'Configuration.State' --output text | grep -q Active"

run_test "createRegistration Lambda exists" \
    "aws lambda get-function --function-name event-ticketing-createRegistration-dev --region us-east-1 --query 'Configuration.State' --output text | grep -q Active"

echo ""
echo "📋 PHASE 3: Lambda Functions (eu-north-1)"
echo "========================================="

# Test Lambda functions in eu-north-1
run_test "processPayment Lambda exists" \
    "aws lambda get-function --function-name event-ticketing-processPayment-dev --region eu-north-1 --query 'Configuration.State' --output text | grep -q Active"

run_test "generateTicket Lambda exists" \
    "aws lambda get-function --function-name event-ticketing-generateTicket-dev --region eu-north-1 --query 'Configuration.State' --output text | grep -q Active"

run_test "getTicketDownload Lambda exists" \
    "aws lambda get-function --function-name event-ticketing-getTicketDownload-dev --region eu-north-1 --query 'Configuration.State' --output text | grep -q Active"

run_test "validateTicket Lambda exists" \
    "aws lambda get-function --function-name event-ticketing-validateTicket-dev --region eu-north-1 --query 'Configuration.State' --output text | grep -q Active"

echo ""
echo "📋 API Gateway Tests"
echo "========================================="

# Test API Gateway endpoints
run_test_with_output "Phase 2 API - List Events (GET /events)" \
    "curl -s -X GET 'https://1y2eb1bn78.execute-api.us-east-1.amazonaws.com/dev/events' | jq '.'"

run_test "Phase 2 API returns valid JSON" \
    "curl -s -X GET 'https://1y2eb1bn78.execute-api.us-east-1.amazonaws.com/dev/events' | jq -e '.events' > /dev/null"

# Test Phase 3 API (if accessible without auth)
echo ""
echo "Note: Phase 3 API endpoints require authentication, skipping direct tests"

echo ""
echo "📋 CloudFront Distribution"
echo "========================================="

run_test "CloudFront distribution exists" \
    "aws cloudfront get-distribution --id E3A54MN5Q7TR2P --query 'Distribution.Status' --output text | grep -q Deployed"

echo ""
echo "📋 Frontend Deployment"
echo "========================================="

run_test "Frontend files exist in S3" \
    "aws s3 ls s3://event-ticketing-frontend-dev-$ACCOUNT_ID/index.html"

run_test_with_output "CloudFront URL is accessible" \
    "curl -s -o /dev/null -w '%{http_code}' https://d2nkn01x3icawa.cloudfront.net | grep -q 200"

echo ""
echo "📋 DynamoDB Data Tests"
echo "========================================="

# Check if there's any data
EVENT_COUNT=$(aws dynamodb scan --table-name event-ticketing-events-dev --region us-east-1 --select COUNT --query 'Count' --output text)
echo "Events in database: $EVENT_COUNT"

REG_COUNT=$(aws dynamodb scan --table-name event-ticketing-registrations-dev --region us-east-1 --select COUNT --query 'Count' --output text)
echo "Registrations in database: $REG_COUNT"

TICKET_COUNT=$(aws dynamodb scan --table-name event-ticketing-tickets-dev --region us-east-1 --select COUNT --query 'Count' --output text)
echo "Tickets in database: $TICKET_COUNT"

echo ""
echo "📋 Lambda Environment Variables Check"
echo "========================================="

# Check if Lambda functions have correct environment variables
echo "Checking createEvent Lambda environment..."
aws lambda get-function-configuration \
    --function-name event-ticketing-createEvent-dev \
    --region us-east-1 \
    --query 'Environment.Variables' \
    --output json | jq '.'

echo ""
echo "Checking processPayment Lambda environment..."
aws lambda get-function-configuration \
    --function-name event-ticketing-processPayment-dev \
    --region eu-north-1 \
    --query 'Environment.Variables' \
    --output json | jq '.'

echo ""
echo "========================================="
echo "📊 TEST SUMMARY"
echo "========================================="
echo ""
echo "Total Tests: $TESTS_TOTAL"
echo -e "Passed: ${GREEN}$TESTS_PASSED${NC}"
echo -e "Failed: ${RED}$TESTS_FAILED${NC}"
echo ""

if [ $TESTS_FAILED -eq 0 ]; then
    echo -e "${GREEN}✓ ALL TESTS PASSED!${NC}"
    echo ""
    echo "🎉 Backend is ready for frontend development!"
    echo ""
    echo "Next steps:"
    echo "1. Test end-to-end flow manually"
    echo "2. Create test user and event"
    echo "3. Test registration and payment"
    echo "4. Verify ticket generation"
    exit 0
else
    echo -e "${RED}✗ SOME TESTS FAILED${NC}"
    echo ""
    echo "Please fix the failed tests before proceeding to frontend."
    exit 1
fi
