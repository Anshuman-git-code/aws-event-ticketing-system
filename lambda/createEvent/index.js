const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, PutCommand } = require('@aws-sdk/lib-dynamodb');
const { v4: uuidv4 } = require('uuid');

const client = new DynamoDBClient({ region: 'us-east-1' });
const docClient = DynamoDBDocumentClient.from(client);

exports.handler = async (event) => {
    console.log('Event:', JSON.stringify(event, null, 2));
    
    try {
        // Parse request body
        const body = JSON.parse(event.body);
        
        // Get user info from Cognito authorizer
        const userId = event.requestContext.authorizer.claims.sub;
        const userEmail = event.requestContext.authorizer.claims.email;
        const userName = event.requestContext.authorizer.claims.name;
        
        // Validate required fields
        if (!body.name || !body.date || !body.capacity || !body.price) {
            return {
                statusCode: 400,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                body: JSON.stringify({
                    error: 'Missing required fields: name, date, capacity, price'
                })
            };
        }
        
        // Generate event ID
        const eventId = `EVENT#${uuidv4()}`;
        const timestamp = new Date().toISOString();
        
        // Create event item
        const eventItem = {
            eventId,
            name: body.name,
            description: body.description || '',
            date: body.date,
            endDate: body.endDate || body.date,
            location: body.location || '',
            venue: body.venue || '',
            capacity: parseInt(body.capacity),
            registeredCount: 0,
            organizerId: `USER#${userId}`,
            organizerName: userName,
            organizerEmail: userEmail,
            price: parseFloat(body.price),
            currency: body.currency || 'USD',
            category: body.category || 'General',
            tags: body.tags || [],
            status: 'active',
            imageUrl: body.imageUrl || '',
            createdAt: timestamp,
            updatedAt: timestamp
        };
        
        // Put item in DynamoDB
        const command = new PutCommand({
            TableName: process.env.EVENTS_TABLE,
            Item: eventItem
        });
        
        await docClient.send(command);
        
        return {
            statusCode: 201,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({
                message: 'Event created successfully',
                event: eventItem
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
                error: 'Failed to create event',
                details: error.message
            })
        };
    }
};
