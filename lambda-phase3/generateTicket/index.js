const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, GetCommand, PutCommand } = require('@aws-sdk/lib-dynamodb');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');

const region = process.env.AWS_REGION_OVERRIDE || 'us-east-1';
const dynamoClient = new DynamoDBClient({ region });
const docClient = DynamoDBDocumentClient.from(dynamoClient);
const s3Client = new S3Client({ region });

exports.handler = async (event) => {
    console.log('Generate Ticket Event:', JSON.stringify(event));
    
    try {
        const { registrationId, eventId, userId } = event;
        
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
                generatedAt: new Date().toISOString()
            }
        }));
        
        return {
            statusCode: 200,
            body: JSON.stringify({ message: 'Ticket generated', ticketId, s3Key })
        };
        
    } catch (error) {
        console.error('Error:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message })
        };
    }
};
