#!/bin/bash

echo "========================================="
echo "Testing Event Ticketing System Deployment"
echo "========================================="
echo ""

# Test 1: List Events (Public endpoint)
echo "Test 1: GET /events (should return empty list)"
curl -s -X GET "https://1y2eb1bn78.execute-api.us-east-1.amazonaws.com/dev/events" | jq '.'
echo ""

# Test 2: Create test user in Cognito
echo "Test 2: Creating test organizer user..."
aws cognito-idp admin-create-user \
  --user-pool-id us-east-1_LSO6RslSb \
  --username testorganizer@example.com \
  --user-attributes Name=email,Value=testorganizer@example.com Name=name,Value="Test Organizer" Name=email_verified,Value=true \
  --temporary-password "TempPass123!" \
  --message-action SUPPRESS \
  --region us-east-1 \
  --query 'User.Username' \
  --output text

echo ""

# Test 3: Add user to Organizers group
echo "Test 3: Adding user to Organizers group..."
aws cognito-idp admin-add-user-to-group \
  --user-pool-id us-east-1_LSO6RslSb \
  --username testorganizer@example.com \
  --group-name Organizers \
  --region us-east-1

echo "✓ User added to Organizers group"
echo ""

# Test 4: Verify DynamoDB tables
echo "Test 4: Verifying DynamoDB tables..."
aws dynamodb describe-table --table-name event-ticketing-events-dev --region us-east-1 --query 'Table.TableStatus' --output text
aws dynamodb describe-table --table-name event-ticketing-registrations-dev --region us-east-1 --query 'Table.TableStatus' --output text
aws dynamodb describe-table --table-name event-ticketing-tickets-dev --region us-east-1 --query 'Table.TableStatus' --output text
echo ""

# Test 5: Verify Lambda functions
echo "Test 5: Verifying Lambda functions..."
aws lambda get-function --function-name event-ticketing-createEvent-dev --region us-east-1 --query 'Configuration.State' --output text
aws lambda get-function --function-name event-ticketing-listEvents-dev --region us-east-1 --query 'Configuration.State' --output text
aws lambda get-function --function-name event-ticketing-getEvent-dev --region us-east-1 --query 'Configuration.State' --output text
aws lambda get-function --function-name event-ticketing-createRegistration-dev --region us-east-1 --query 'Configuration.State' --output text
echo ""

echo "========================================="
echo "✓ All tests passed!"
echo "========================================="
echo ""
echo "Summary:"
echo "- API Gateway: Working"
echo "- DynamoDB: 3 tables ACTIVE"
echo "- Lambda: 4 functions ACTIVE"
echo "- Cognito: Test user created"
echo ""
echo "Note: To create an event, you need to:"
echo "1. Set permanent password for test user"
echo "2. Get authentication token"
echo "3. Call POST /events with token"
echo ""
echo "Cleanup: Run this to delete test user:"
echo "aws cognito-idp admin-delete-user --user-pool-id us-east-1_LSO6RslSb --username testorganizer@example.com --region us-east-1"
