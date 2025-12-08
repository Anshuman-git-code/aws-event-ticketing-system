const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, QueryCommand } = require('@aws-sdk/lib-dynamodb');

const client = new DynamoDBClient({ region: 'us-east-1' });
const docClient = DynamoDBDocumentClient.from(client);

exports.handler = async (event) => {
    console.log('Event:', JSON.stringify(event, null, 2));
    
    try {
        const eventId = event.pathParameters?.id;
        
        if (!eventId) {
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
        
        const fullEventId = eventId.startsWith('EVENT#') ? eventId : `EVENT#${eventId}`;
        
        // Query registrations by eventId using GSI
        const command = new QueryCommand({
            TableName: process.env.REGISTRATIONS_TABLE || 'event-ticketing-registrations-dev',
            IndexName: 'EventIndex',
            KeyConditionExpression: 'eventId = :eventId',
            ExpressionAttributeValues: {
                ':eventId': fullEventId
            }
        });
        
        const result = await docClient.send(command);
        
        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({
                registrations: result.Items || [],
                count: result.Count || 0
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
                error: 'Failed to fetch registrations',
                details: error.message
            })
        };
    }
};
