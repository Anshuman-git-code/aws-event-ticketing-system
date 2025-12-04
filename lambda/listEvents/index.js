const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, QueryCommand, ScanCommand } = require('@aws-sdk/lib-dynamodb');

const client = new DynamoDBClient({ region: 'us-east-1' });
const docClient = DynamoDBDocumentClient.from(client);

exports.handler = async (event) => {
    console.log('Event:', JSON.stringify(event, null, 2));
    
    try {
        const queryParams = event.queryStringParameters || {};
        const category = queryParams.category;
        const status = queryParams.status || 'active';
        const limit = parseInt(queryParams.limit) || 50;
        
        let command;
        
        if (category) {
            // Query by category using GSI
            command = new QueryCommand({
                TableName: process.env.EVENTS_TABLE,
                IndexName: 'CategoryIndex',
                KeyConditionExpression: 'category = :category',
                FilterExpression: '#status = :status',
                ExpressionAttributeNames: {
                    '#status': 'status'
                },
                ExpressionAttributeValues: {
                    ':category': category,
                    ':status': status
                },
                Limit: limit,
                ScanIndexForward: false // Sort by date descending
            });
        } else {
            // Scan all events with status filter
            command = new ScanCommand({
                TableName: process.env.EVENTS_TABLE,
                FilterExpression: '#status = :status',
                ExpressionAttributeNames: {
                    '#status': 'status'
                },
                ExpressionAttributeValues: {
                    ':status': status
                },
                Limit: limit
            });
        }
        
        const result = await docClient.send(command);
        
        // Sort by date
        const events = result.Items.sort((a, b) => 
            new Date(b.date) - new Date(a.date)
        );
        
        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({
                events,
                count: events.length,
                lastEvaluatedKey: result.LastEvaluatedKey
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
                error: 'Failed to list events',
                details: error.message
            })
        };
    }
};
