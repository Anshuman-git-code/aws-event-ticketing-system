const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, GetCommand } = require('@aws-sdk/lib-dynamodb');
const { S3Client, GetObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');

const region = process.env.AWS_REGION_OVERRIDE || 'us-east-1';
const dynamoClient = new DynamoDBClient({ region });
const docClient = DynamoDBDocumentClient.from(dynamoClient);
const s3Client = new S3Client({ region });

exports.handler = async (event) => {
    console.log('Get Ticket Download Event:', JSON.stringify(event));
    
    try {
        const ticketId = event.pathParameters?.ticketId || event.ticketId;
        
        if (!ticketId) {
            return {
                statusCode: 400,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                body: JSON.stringify({ error: 'Ticket ID required' })
            };
        }
        
        // Get ticket from DynamoDB
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
                body: JSON.stringify({ error: 'Ticket not found' })
            };
        }
        
        const ticket = result.Item;
        
        // Generate pre-signed URL
        const command = new GetObjectCommand({
            Bucket: process.env.TICKETS_BUCKET,
            Key: ticket.s3Key
        });
        
        const downloadUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
        
        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({
                ticketId,
                downloadUrl,
                expiresIn: 3600,
                status: ticket.status
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
