const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, GetCommand, UpdateCommand } = require('@aws-sdk/lib-dynamodb');

const region = process.env.AWS_REGION_OVERRIDE || 'us-east-1';
const dynamoClient = new DynamoDBClient({ region });
const docClient = DynamoDBDocumentClient.from(dynamoClient);

exports.handler = async (event) => {
    console.log('Validate Ticket Event:', JSON.stringify(event));
    
    try {
        const body = JSON.parse(event.body || '{}');
        const { qrData } = body;
        
        if (!qrData) {
            return {
                statusCode: 400,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                body: JSON.stringify({ error: 'QR data required' })
            };
        }
        
        // Parse QR data
        const ticketData = JSON.parse(qrData);
        const { ticketId } = ticketData;
        
        // Get ticket directly by ticketId
        const result = await docClient.send(new GetCommand({
            TableName: process.env.TICKETS_TABLE || 'event-ticketing-tickets-dev',
            Key: { ticketId }
        }));
        
        if (!result.Item) {
            return {
                statusCode: 404,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                body: JSON.stringify({
                    valid: false,
                    error: 'Ticket not found'
                })
            };
        }
        
        const ticket = result.Item;
        
        // Check if already used
        if (ticket.status === 'used') {
            return {
                statusCode: 200,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                body: JSON.stringify({
                    valid: false,
                    error: 'Ticket has already been used'
                })
            };
        }
        
        // Mark as used
        await docClient.send(new UpdateCommand({
            TableName: process.env.TICKETS_TABLE || 'event-ticketing-tickets-dev',
            Key: { ticketId: ticket.ticketId },
            UpdateExpression: 'SET #status = :used, validatedAt = :timestamp',
            ExpressionAttributeNames: {
                '#status': 'status'
            },
            ExpressionAttributeValues: {
                ':used': 'used',
                ':timestamp': new Date().toISOString()
            }
        }));
        
        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({
                valid: true,
                message: 'Ticket validated successfully',
                ticket: {
                    ticketId: ticket.ticketId,
                    eventId: ticket.eventId,
                    validatedAt: new Date().toISOString()
                }
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
