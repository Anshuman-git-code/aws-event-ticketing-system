const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, UpdateCommand } = require('@aws-sdk/lib-dynamodb');
const { LambdaClient, InvokeCommand } = require('@aws-sdk/client-lambda');
const Stripe = require('stripe');

const region = process.env.AWS_REGION_OVERRIDE || 'us-east-1';
const dynamoClient = new DynamoDBClient({ region });
const docClient = DynamoDBDocumentClient.from(dynamoClient);
const lambdaClient = new LambdaClient({ region: 'eu-north-1' });
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

exports.handler = async (event) => {
    console.log('Process Payment Event:', JSON.stringify(event));
    
    try {
        const body = JSON.parse(event.body || '{}');
        const { eventId, registrationId, userId, amount, currency = 'usd' } = body;
        
        // Create Stripe payment intent
        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(amount * 100), // Convert to cents
            currency,
            metadata: { eventId, registrationId, userId }
        });
        
        // Update registration with payment intent
        await docClient.send(new UpdateCommand({
            TableName: process.env.REGISTRATIONS_TABLE || 'event-ticketing-registrations-dev',
            Key: { registrationId },
            UpdateExpression: 'SET paymentIntentId = :pi, paymentStatus = :status',
            ExpressionAttributeValues: {
                ':pi': paymentIntent.id,
                ':status': 'pending'
            }
        }));
        
        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({
                clientSecret: paymentIntent.client_secret,
                paymentIntentId: paymentIntent.id
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
