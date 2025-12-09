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
        
        // Create a minimal valid PDF with ticket information
        const pdfContent = `%PDF-1.4
1 0 obj
<<
/Type /Catalog
/Pages 2 0 R
>>
endobj
2 0 obj
<<
/Type /Pages
/Kids [3 0 R]
/Count 1
>>
endobj
3 0 obj
<<
/Type /Page
/Parent 2 0 R
/MediaBox [0 0 612 792]
/Contents 4 0 R
/Resources <<
/Font <<
/F1 5 0 R
>>
>>
>>
endobj
4 0 obj
<<
/Length 400
>>
stream
BT
/F1 24 Tf
50 700 Td
(EVENT TICKET) Tj
0 -40 Td
/F1 14 Tf
(Ticket ID: ${ticketId}) Tj
0 -30 Td
(Event: ${eventData.name || 'Event'}) Tj
0 -30 Td
(Date: ${new Date(eventData.date).toLocaleDateString()}) Tj
0 -30 Td
(Location: ${eventData.location || 'TBA'}) Tj
0 -50 Td
(QR Code Data: ${qrData}) Tj
0 -50 Td
/F1 10 Tf
(This is a valid ticket for entry.) Tj
0 -20 Td
(Please present this ticket at the venue.) Tj
ET
endstream
endobj
5 0 obj
<<
/Type /Font
/Subtype /Type1
/BaseFont /Helvetica
>>
endobj
xref
0 6
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000274 00000 n 
0000000724 00000 n 
trailer
<<
/Size 6
/Root 1 0 R
>>
startxref
812
%%EOF`;
        
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
