// Simplified version without Stripe for testing
const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, UpdateCommand } = require('@aws-sdk/lib-dynamodb');

const region = process.env.AWS_REGION_OVERRIDE || 'us-east-1';
const dynamoClient = new DynamoDBClient({ region });
const docClient = DynamoDBDocumentClient.from(dynamoClient);

exports.handler = async (event) => {
    console.log('Process Payment Event:', JSON.stringify(event));
    
    try {
        const body = JSON.parse(event.body || '{}');
        const { eventId, registrationId, amount, currency = 'usd' } = body;
        
        // For testing: Create a mock payment intent with proper format
        const timestamp = Date.now();
        const randomSecret = Math.random().toString(36).substring(2, 15);
        const mockPaymentIntent = {
            id: `pi_${timestamp}`,
            client_secret: `pi_${timestamp}_secret_${randomSecret}`,
            amount: Math.round(amount * 100),
            currency,
            status: 'requires_payment_method'
        };
        
        // Update registration with payment intent
        if (registrationId) {
            await docClient.send(new UpdateCommand({
                TableName: process.env.REGISTRATIONS_TABLE || 'event-ticketing-registrations-dev',
                Key: { registrationId },
                UpdateExpression: 'SET paymentIntentId = :pi, paymentStatus = :status',
                ExpressionAttributeValues: {
                    ':pi': mockPaymentIntent.id,
                    ':status': 'pending'
                }
            }));
        }
        
        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({
                clientSecret: mockPaymentIntent.client_secret,
                paymentIntentId: mockPaymentIntent.id,
                note: 'Using mock payment for testing'
            })
        };
        
    } catch (error) {
        console.error('Error:', error);
        return {
            statusCode: 500,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({ error: error.message })
        };
    }
};
