const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, GetCommand, PutCommand, UpdateCommand } = require('@aws-sdk/lib-dynamodb');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');

const region = process.env.AWS_REGION_OVERRIDE || 'us-east-1';
const dynamoClient = new DynamoDBClient({ region });
const docClient = DynamoDBDocumentClient.from(dynamoClient);
const s3Client = new S3Client({ region });

exports.handler = async (event) => {
    console.log('Generate Ticket Event:', JSON.stringify(event));
    
    try {
        // Parse body if coming from API Gateway
        const body = event.body ? JSON.parse(event.body) : event;
        const { registrationId, eventId } = body;
        
        if (!registrationId || !eventId) {
            return {
                statusCode: 400,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                body: JSON.stringify({ error: 'registrationId and eventId are required' })
            };
        }
        
        // Get registration to find userId
        const regResult = await docClient.send(new GetCommand({
            TableName: process.env.REGISTRATIONS_TABLE || 'event-ticketing-registrations-dev',
            Key: { registrationId }
        }));
        
        if (!regResult.Item) {
            return {
                statusCode: 404,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                body: JSON.stringify({ error: 'Registration not found' })
            };
        }
        
        const userId = regResult.Item.userId;
        
        // Generate ticket ID
        const ticketId = `TKT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        
        // Get event details
        const eventResult = await docClient.send(new GetCommand({
            TableName: process.env.EVENTS_TABLE || 'event-ticketing-events-dev',
            Key: { eventId }
        }));
        
        const eventData = eventResult.Item || { name: 'Event', date: new Date().toISOString() };
        
        // Generate QR code data
        const qrData = JSON.stringify({ ticketId, eventId, userId });
        
        // Create simple PDF content (mock)
        const pdfContent = `Ticket: ${ticketId}\nEvent: ${eventData.name}\nDate: ${eventData.date}`;
        
        // Upload to S3
        const s3Key = `tickets/${ticketId}.pdf`;
        await s3Client.send(new PutObjectCommand({
            Bucket: process.env.TICKETS_BUCKET,
            Key: s3Key,
            Body: Buffer.from(pdfContent),
            ContentType: 'application/pdf'
        }));
        
        // Save ticket to DynamoDB
        await docClient.send(new PutCommand({
            TableName: process.env.TICKETS_TABLE || 'event-ticketing-tickets-dev',
            Item: {
                ticketId,
                registrationId,
                eventId,
                userId,
                qrCode: qrData,
                status: 'valid',
                s3Key,
                generatedAt: new Date().toISOString(),
                eventName: eventData.name,
                eventDate: eventData.date
            }
        }));
        
        // Update registration with ticketId and payment status
        const { UpdateCommand } = require('@aws-sdk/lib-dynamodb');
        await docClient.send(new UpdateCommand({
            TableName: process.env.REGISTRATIONS_TABLE || 'event-ticketing-registrations-dev',
            Key: { registrationId },
            UpdateExpression: 'SET ticketId = :tid, paymentStatus = :status',
            ExpressionAttributeValues: {
                ':tid': ticketId,
                ':status': 'completed'
            }
        }));
        
        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({ message: 'Ticket generated', ticketId, s3Key })
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
