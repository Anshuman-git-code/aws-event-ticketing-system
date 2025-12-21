const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, GetCommand, UpdateCommand } = require('@aws-sdk/lib-dynamodb');

// Force us-east-1 region for DynamoDB since that's where the tables are
const region = 'us-east-1';
const dynamoClient = new DynamoDBClient({ region });
const docClient = DynamoDBDocumentClient.from(dynamoClient);

exports.handler = async (event) => {
    console.log('Validate Ticket Event:', JSON.stringify(event));
    
    try {
        // Handle both API Gateway format and direct invocation
        let body;
        if (event.body) {
            // API Gateway format
            body = JSON.parse(event.body);
        } else {
            // Direct invocation
            body = event;
        }
        
        const { qrData, ticketId: directTicketId } = body;
        
        let ticketId = null;
        
        // Handle both QR data and direct ticket ID
        if (qrData) {
            try {
                // Parse QR data (JSON format)
                const ticketData = JSON.parse(qrData);
                ticketId = ticketData.ticketId;
            } catch (parseError) {
                // If parsing fails, treat qrData as direct ticket ID
                ticketId = qrData;
            }
        } else if (directTicketId) {
            ticketId = directTicketId;
        }
        
        if (!ticketId) {
            return {
                statusCode: 400,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                body: JSON.stringify({ 
                    valid: false,
                    error: 'Ticket ID or QR data required' 
                })
            };
        }
        
        console.log('Validating ticket ID:', ticketId);
        
        // Get ticket directly by ticketId
        const result = await docClient.send(new GetCommand({
            TableName: process.env.TICKETS_TABLE || 'event-ticketing-tickets-dev',
            Key: { ticketId }
        }));
        
        console.log('Ticket lookup result:', result.Item ? 'Found' : 'Not found');
        
        if (!result.Item) {
            return {
                statusCode: 200,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                body: JSON.stringify({
                    valid: false,
                    message: 'Ticket not found or invalid'
                })
            };
        }
        
        const ticket = result.Item;
        console.log('Ticket status:', ticket.status);
        
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
                    message: 'Ticket has already been used',
                    ticket: {
                        ticketId: ticket.ticketId,
                        eventName: ticket.eventName,
                        attendeeName: ticket.attendeeName,
                        status: ticket.status,
                        usedAt: ticket.validatedAt
                    }
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
        
        console.log('Ticket marked as used successfully');
        
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
                    eventName: ticket.eventName,
                    attendeeName: ticket.attendeeName,
                    userEmail: ticket.attendeeEmail,
                    status: 'used',
                    validatedAt: new Date().toISOString()
                }
            })
        };
        
    } catch (error) {
        console.error('Error validating ticket:', error);
        console.error('Error stack:', error.stack);
        return {
            statusCode: 500,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({ 
                valid: false,
                error: 'Internal server error',
                message: 'Failed to validate ticket. Please try again.'
            })
        };
    }
};
