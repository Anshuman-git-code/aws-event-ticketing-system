const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, GetCommand, PutCommand, UpdateCommand } = require('@aws-sdk/lib-dynamodb');
const { v4: uuidv4 } = require('uuid');

const client = new DynamoDBClient({ region: 'us-east-1' });
const docClient = DynamoDBDocumentClient.from(client);

exports.handler = async (event) => {
    console.log('Event:', JSON.stringify(event, null, 2));
    
    try {
        const body = JSON.parse(event.body);
        const userId = event.requestContext.authorizer.claims.sub;
        const userEmail = event.requestContext.authorizer.claims.email;
        const userName = event.requestContext.authorizer.claims.name;
        
        if (!body.eventId) {
            return {
                statusCode: 400,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                body: JSON.stringify({
                    error: 'Event ID is required'
                })
            };
        }
        
        const eventId = body.eventId.startsWith('EVENT#') ? body.eventId : `EVENT#${body.eventId}`;
        
        // Get event details
        const getEventCommand = new GetCommand({
            TableName: process.env.EVENTS_TABLE,
            Key: { eventId }
        });
        
        const eventResult = await docClient.send(getEventCommand);
        
        if (!eventResult.Item) {
            return {
                statusCode: 404,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                body: JSON.stringify({
                    error: 'Event not found'
                })
            };
        }
        
        const eventItem = eventResult.Item;
        
        // Check capacity
        if (eventItem.registeredCount >= eventItem.capacity) {
            return {
                statusCode: 400,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                body: JSON.stringify({
                    error: 'Event is at full capacity'
                })
            };
        }
        
        // Create registration
        const registrationId = `REG#${uuidv4()}`;
        const timestamp = new Date().toISOString();
        
        const registrationItem = {
            registrationId,
            userId: `USER#${userId}`,
            userName,
            userEmail,
            eventId,
            eventName: eventItem.name,
            eventDate: eventItem.date,
            status: 'pending',
            paymentStatus: 'pending',
            amount: eventItem.price,
            currency: eventItem.currency,
            registeredAt: timestamp,
            updatedAt: timestamp,
            metadata: {
                source: 'web'
            }
        };
        
        // Save registration
        const putCommand = new PutCommand({
            TableName: process.env.REGISTRATIONS_TABLE,
            Item: registrationItem
        });
        
        await docClient.send(putCommand);
        
        // Update event registered count
        const updateCommand = new UpdateCommand({
            TableName: process.env.EVENTS_TABLE,
            Key: { eventId },
            UpdateExpression: 'SET registeredCount = registeredCount + :inc, updatedAt = :timestamp',
            ExpressionAttributeValues: {
                ':inc': 1,
                ':timestamp': timestamp
            }
        });
        
        await docClient.send(updateCommand);
        
        return {
            statusCode: 201,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({
                message: 'Registration created successfully',
                registration: registrationItem
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
            body: JSON.stringify({
                error: 'Failed to create registration',
                details: error.message
            })
        };
    }
};
