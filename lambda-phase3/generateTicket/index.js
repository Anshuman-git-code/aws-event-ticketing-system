const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, GetCommand, PutCommand, UpdateCommand } = require('@aws-sdk/lib-dynamodb');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const QRCode = require('qrcode');
const PDFDocument = require('pdfkit');

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
        
        console.log('Parsed request:', { registrationId, eventId });
        
        if (!registrationId || !eventId) {
            console.log('Missing required parameters');
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
        console.log('Fetching registration:', registrationId);
        const regResult = await docClient.send(new GetCommand({
            TableName: process.env.REGISTRATIONS_TABLE || 'event-ticketing-registrations-dev',
            Key: { registrationId }
        }));
        
        console.log('Registration result:', regResult.Item ? 'Found' : 'Not found');
        
        if (!regResult.Item) {
            console.log('Registration not found for ID:', registrationId);
            return {
                statusCode: 404,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                body: JSON.stringify({ error: 'Registration not found' })
            };
        }
        
        const registration = regResult.Item;
        const userId = registration.userId;
        
        console.log('Found registration for user:', userId);
        
        // Generate ticket ID
        const ticketId = `TKT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        console.log('Generated ticket ID:', ticketId);
        
        // Get event details
        console.log('Fetching event:', eventId);
        const eventResult = await docClient.send(new GetCommand({
            TableName: process.env.EVENTS_TABLE || 'event-ticketing-events-dev',
            Key: { eventId }
        }));
        
        const eventData = eventResult.Item || { 
            name: 'Event', 
            date: new Date().toISOString(),
            location: 'TBA',
            price: 0
        };
        
        console.log('Event data:', { name: eventData.name, date: eventData.date });
        
        // Generate QR code data
        const qrData = JSON.stringify({ 
            ticketId, 
            eventId, 
            userId,
            timestamp: new Date().toISOString()
        });
        
        console.log('Generating QR code...');
        
        // Generate QR code as base64 image
        const qrCodeDataURL = await QRCode.toDataURL(qrData, {
            width: 200,
            margin: 2,
            color: {
                dark: '#000000',
                light: '#FFFFFF'
            }
        });
        
        console.log('QR code generated, data URL length:', qrCodeDataURL.length);
        
        // Create PDF document
        console.log('Creating PDF document...');
        const doc = new PDFDocument({ 
            size: 'A4',
            margins: { top: 50, bottom: 50, left: 50, right: 50 }
        });
        
        // Create PDF content
        await createTicketPDF(doc, {
            ticketId,
            eventData,
            registration,
            qrCodeDataURL,
            qrData
        });
        
        // Convert PDF to buffer
        console.log('Converting PDF to buffer...');
        const pdfBuffer = await new Promise((resolve, reject) => {
            const chunks = [];
            doc.on('data', chunk => chunks.push(chunk));
            doc.on('end', () => resolve(Buffer.concat(chunks)));
            doc.on('error', reject);
            doc.end();
        });
        
        console.log('PDF buffer created, size:', pdfBuffer.length, 'bytes');
        
        // Upload to S3
        const s3Key = `tickets/${ticketId}.pdf`;
        console.log('Uploading to S3:', s3Key);
        
        await s3Client.send(new PutObjectCommand({
            Bucket: process.env.TICKETS_BUCKET || 'event-ticketing-tickets-dev-264449293739',
            Key: s3Key,
            Body: pdfBuffer,
            ContentType: 'application/pdf',
            Metadata: {
                ticketId,
                eventId,
                userId: userId.replace('USER#', ''),
                generatedAt: new Date().toISOString()
            }
        }));
        
        console.log('PDF uploaded to S3 successfully');
        
        // Save ticket to DynamoDB
        console.log('Saving ticket to DynamoDB...');
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
                eventDate: eventData.date,
                attendeeName: registration.userName,
                attendeeEmail: registration.userEmail
            }
        }));
        
        console.log('Ticket saved to DynamoDB');
        
        // Update registration with ticketId and payment status
        console.log('Updating registration...');
        await docClient.send(new UpdateCommand({
            TableName: process.env.REGISTRATIONS_TABLE || 'event-ticketing-registrations-dev',
            Key: { registrationId },
            UpdateExpression: 'SET ticketId = :tid, paymentStatus = :status, updatedAt = :timestamp',
            ExpressionAttributeValues: {
                ':tid': ticketId,
                ':status': 'completed',
                ':timestamp': new Date().toISOString()
            }
        }));
        
        console.log('Registration updated successfully');
        
        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({ 
                message: 'Ticket generated successfully', 
                ticketId, 
                s3Key,
                eventName: eventData.name,
                attendeeName: registration.userName
            })
        };
        
    } catch (error) {
        console.error('Error generating ticket:', error);
        console.error('Error stack:', error.stack);
        return {
            statusCode: 500,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({ 
                error: 'Failed to generate ticket',
                details: error.message 
            })
        };
    }
};

async function createTicketPDF(doc, { ticketId, eventData, registration, qrCodeDataURL, qrData }) {
    try {
        console.log('Creating PDF with data:', { ticketId, eventName: eventData.name, userName: registration.userName });
        
        const pageWidth = doc.page.width;
        const pageHeight = doc.page.height;
        const margin = 50;
        
        // Soft gradient header background - more eye-soothing colors
        doc.rect(0, 0, pageWidth, 200)
           .fill('#2c3e50');
        
        doc.rect(0, 0, pageWidth, 200)
           .fillOpacity(0.85)
           .fill('#34495e');
        
        // Subtle decorative accent bar with gradient effect
        doc.rect(0, 195, pageWidth, 5)
           .fill('#3498db');
        
        // Soft decorative circles for visual interest
        doc.circle(pageWidth - 70, 60, 40)
           .fillOpacity(0.08)
           .fill('#ffffff');
        
        doc.circle(pageWidth - 90, 40, 25)
           .fillOpacity(0.05)
           .fill('#ffffff');
        
        doc.fillOpacity(1);
        
        // Title with elegant styling
        doc.fillColor('#ffffff')
           .fontSize(42)
           .font('Helvetica-Bold')
           .text('EVENT TICKET', margin, 45, { align: 'left' });
        
        // Subtle subtitle
        doc.fontSize(11)
           .fillColor('#ecf0f1')
           .font('Helvetica')
           .text('Your digital pass to an amazing experience', margin, 92);
        
        // Ticket ID with softer styling
        doc.fontSize(10)
           .fillColor('#3498db')
           .font('Helvetica-Bold')
           .text('TICKET ID', margin, 125);
        
        doc.fontSize(12)
           .fillColor('#ffffff')
           .font('Helvetica')
           .text(ticketId, margin, 142);
        
        // Status badge with softer colors
        doc.roundedRect(margin, 165, 75, 26, 6)
           .fill('#27ae60');
        
        doc.fillColor('#ffffff')
           .fontSize(11)
           .font('Helvetica-Bold')
           .text('VALID', margin + 20, 172);
        
        // Reset opacity
        doc.fillOpacity(1);
        
        // Event Information Card
        let yPosition = 240;
        
        // Event name with elegant styling
        doc.fillColor('#2c3e50')
           .fontSize(28)
           .font('Helvetica-Bold')
           .text(eventData.name || 'Event Name', margin, yPosition, {
               width: pageWidth - (margin * 2),
               lineGap: 8
           });
        
        yPosition += 50;
        
        // Subtle decorative line
        doc.moveTo(margin, yPosition)
           .lineTo(pageWidth - margin, yPosition)
           .strokeOpacity(0.15)
           .stroke('#3498db')
           .strokeOpacity(1);
        
        yPosition += 30;
        
        // Event Details with soft, eye-soothing design
        const eventDate = new Date(eventData.date);
        const formattedDate = eventDate.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        const formattedTime = eventDate.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit'
        });
        
        // Date & Time box with soft colors
        doc.roundedRect(margin, yPosition, (pageWidth - margin * 2) / 2 - 15, 80, 10)
           .fillOpacity(0.04)
           .fill('#3498db')
           .fillOpacity(1);
        
        doc.fillColor('#3498db')
           .fontSize(10)
           .font('Helvetica-Bold')
           .text('DATE & TIME', margin + 18, yPosition + 18);
        
        doc.fillColor('#2c3e50')
           .fontSize(13)
           .font('Helvetica')
           .text(formattedDate, margin + 18, yPosition + 38, { width: 210, lineGap: 2 });
        
        doc.fontSize(12)
           .fillColor('#7f8c8d')
           .text(formattedTime, margin + 18, yPosition + 58);
        
        // Location box with soft colors
        const locationX = margin + (pageWidth - margin * 2) / 2 + 15;
        doc.roundedRect(locationX, yPosition, (pageWidth - margin * 2) / 2 - 15, 80, 10)
           .fillOpacity(0.04)
           .fill('#9b59b6')
           .fillOpacity(1);
        
        doc.fillColor('#9b59b6')
           .fontSize(10)
           .font('Helvetica-Bold')
           .text('LOCATION', locationX + 18, yPosition + 18);
        
        doc.fillColor('#2c3e50')
           .fontSize(13)
           .font('Helvetica')
           .text(eventData.location || 'TBA', locationX + 18, yPosition + 38, { 
               width: 210,
               lineGap: 3
           });
        
        yPosition += 105;
        
        // Price badge (if applicable)
        if (eventData.price && eventData.price > 0) {
            doc.roundedRect(margin, yPosition, 130, 38, 10)
               .fill('#f39c12');
            
            doc.fillColor('#1a1a2e')
               .fontSize(11)
               .font('Helvetica-Bold')
               .text('TICKET PRICE', margin + 10, yPosition + 8);
            
            doc.fontSize(14)
               .font('Helvetica-Bold')
               .text(`$${eventData.price}`, margin + 10, yPosition + 22);
            
            yPosition += 50;
        }
        
        // Attendee Information Card
        yPosition += 10;
        
        doc.roundedRect(margin, yPosition, pageWidth - (margin * 2), 95, 12)
           .fillOpacity(0.03)
           .fill('#34495e')
           .fillOpacity(1);
        
        doc.fillColor('#3498db')
           .fontSize(11)
           .font('Helvetica-Bold')
           .text('ATTENDEE DETAILS', margin + 25, yPosition + 22);
        
        doc.fillColor('#2c3e50')
           .fontSize(15)
           .font('Helvetica-Bold')
           .text(registration.userName, margin + 25, yPosition + 44);
        
        doc.fontSize(12)
           .fillColor('#7f8c8d')
           .font('Helvetica')
           .text(registration.userEmail, margin + 25, yPosition + 66);
        
            yPosition += 120;
        
        // QR Code Section with elegant, eye-soothing design
        const qrCodeSize = 170;
        const qrCodeX = (pageWidth - qrCodeSize) / 2;
        
        // Soft outer shadow container
        doc.roundedRect(qrCodeX - 30, yPosition - 20, qrCodeSize + 60, qrCodeSize + 110, 15)
           .fillOpacity(0.04)
           .fill('#3498db')
           .fillOpacity(1);
        
        // Clean white QR code container
        doc.roundedRect(qrCodeX - 25, yPosition - 15, qrCodeSize + 50, qrCodeSize + 100, 12)
           .fill('#ffffff');
        
        // QR Code title with softer color
        doc.fillColor('#3498db')
           .fontSize(13)
           .font('Helvetica-Bold')
           .text('SCAN TO VERIFY', margin, yPosition + 5, { align: 'center' });
        
        yPosition += 35;
        
        // Add QR Code image
        console.log('Adding QR code to PDF, data URL length:', qrCodeDataURL.length);
        const qrCodeBuffer = Buffer.from(qrCodeDataURL.split(',')[1], 'base64');
        console.log('QR code buffer size:', qrCodeBuffer.length);
        
        doc.image(qrCodeBuffer, qrCodeX, yPosition, { width: qrCodeSize });
        
        // Instructions with softer styling
        yPosition += qrCodeSize + 18;
        doc.fontSize(10)
           .font('Helvetica')
           .fillColor('#7f8c8d')
           .text('Present this QR code at the venue entrance', margin, yPosition, { 
               align: 'center',
               width: pageWidth - (margin * 2)
           });
        
        // Footer with elegant, minimal design
        const footerY = pageHeight - 65;
        
        // Subtle footer background
        doc.rect(0, footerY - 15, pageWidth, 80)
           .fillOpacity(0.02)
           .fill('#34495e')
           .fillOpacity(1);
        
        // Subtle top border
        doc.moveTo(margin, footerY - 15)
           .lineTo(pageWidth - margin, footerY - 15)
           .strokeOpacity(0.1)
           .stroke('#3498db')
           .strokeOpacity(1);
        
        doc.fontSize(9)
           .fillColor('#95a5a6')
           .font('Helvetica')
           .text(`Generated: ${new Date().toLocaleDateString('en-US', { 
               year: 'numeric', 
               month: 'short', 
               day: 'numeric',
               hour: '2-digit',
               minute: '2-digit'
           })}`, margin, footerY + 8);
        
        doc.fontSize(10)
           .fillColor('#34495e')
           .font('Helvetica-Bold')
           .text('AWS Event Ticketing', pageWidth - margin - 160, footerY + 6, { 
               width: 160,
               align: 'right'
           });
        
        doc.fontSize(8)
           .fillColor('#95a5a6')
           .font('Helvetica')
           .text('Secure • Verified • Digital', pageWidth - margin - 160, footerY + 24, { 
               width: 160,
               align: 'right'
           });
        
        // Soft decorative corner elements
        doc.circle(margin - 10, 30, 3)
           .fillOpacity(0.15)
           .fill('#3498db')
           .fillOpacity(1);
        
        doc.circle(pageWidth - margin + 10, 30, 3)
           .fillOpacity(0.15)
           .fill('#9b59b6')
           .fillOpacity(1);
           
        console.log('PDF creation completed successfully');
        
    } catch (error) {
        console.error('Error in createTicketPDF:', error);
        throw error;
    }
}
