#!/bin/bash

# Script to create dummy events in DynamoDB

TABLE_NAME="event-ticketing-events-dev"
REGION="us-east-1"

# Dummy organizer user ID (you can replace with actual user ID)
ORGANIZER_ID="USER#demo-organizer-001"

echo "Creating dummy events..."

# Event 1: Tech Conference
EVENT_ID_1="EVENT#$(uuidgen)"
aws dynamodb put-item --table-name $TABLE_NAME --region $REGION --item '{
  "eventId": {"S": "'$EVENT_ID_1'"},
  "organizerId": {"S": "'$ORGANIZER_ID'"},
  "name": {"S": "Tech Summit 2026"},
  "description": {"S": "Annual technology conference featuring keynotes from industry leaders, workshops on AI, Cloud Computing, and Cybersecurity. Network with professionals and explore the latest tech innovations."},
  "date": {"S": "2026-03-15T09:00"},
  "location": {"S": "San Francisco Convention Center, CA"},
  "capacity": {"N": "500"},
  "price": {"N": "299"},
  "category": {"S": "Technology"},
  "status": {"S": "active"},
  "registeredCount": {"N": "0"},
  "createdAt": {"S": "'$(date -u +"%Y-%m-%dT%H:%M:%S.%3NZ")'"},
  "updatedAt": {"S": "'$(date -u +"%Y-%m-%dT%H:%M:%S.%3NZ")'"} 
}'

echo "✓ Created: Tech Summit 2026"

# Event 2: Music Festival
EVENT_ID_2="EVENT#$(uuidgen)"
aws dynamodb put-item --table-name $TABLE_NAME --region $REGION --item '{
  "eventId": {"S": "'$EVENT_ID_2'"},
  "organizerId": {"S": "'$ORGANIZER_ID'"},
  "name": {"S": "Summer Music Festival"},
  "description": {"S": "Three-day outdoor music festival featuring 50+ artists across multiple stages. Genres include Rock, Pop, EDM, and Indie. Food trucks, art installations, and camping available."},
  "date": {"S": "2026-07-20T14:00"},
  "location": {"S": "Golden Gate Park, San Francisco, CA"},
  "capacity": {"N": "10000"},
  "price": {"N": "199"},
  "category": {"S": "Music"},
  "status": {"S": "active"},
  "registeredCount": {"N": "0"},
  "createdAt": {"S": "'$(date -u +"%Y-%m-%dT%H:%M:%S.%3NZ")'"},
  "updatedAt": {"S": "'$(date -u +"%Y-%m-%dT%H:%M:%S.%3NZ")'"} 
}'

echo "✓ Created: Summer Music Festival"

# Event 3: Startup Pitch Night
EVENT_ID_3="EVENT#$(uuidgen)"
aws dynamodb put-item --table-name $TABLE_NAME --region $REGION --item '{
  "eventId": {"S": "'$EVENT_ID_3'"},
  "organizerId": {"S": "'$ORGANIZER_ID'"},
  "name": {"S": "Startup Pitch Night"},
  "description": {"S": "Watch 10 promising startups pitch their ideas to a panel of venture capitalists. Networking session with investors and entrepreneurs. Prizes for best pitch!"},
  "date": {"S": "2026-02-10T18:00"},
  "location": {"S": "Innovation Hub, Palo Alto, CA"},
  "capacity": {"N": "150"},
  "price": {"N": "49"},
  "category": {"S": "Business"},
  "status": {"S": "active"},
  "registeredCount": {"N": "0"},
  "createdAt": {"S": "'$(date -u +"%Y-%m-%dT%H:%M:%S.%3NZ")'"},
  "updatedAt": {"S": "'$(date -u +"%Y-%m-%dT%H:%M:%S.%3NZ")'"} 
}'

echo "✓ Created: Startup Pitch Night"

# Event 4: Food & Wine Tasting
EVENT_ID_4="EVENT#$(uuidgen)"
aws dynamodb put-item --table-name $TABLE_NAME --region $REGION --item '{
  "eventId": {"S": "'$EVENT_ID_4'"},
  "organizerId": {"S": "'$ORGANIZER_ID'"},
  "name": {"S": "Gourmet Food & Wine Tasting"},
  "description": {"S": "Exclusive evening of fine dining and wine tasting. Sample dishes from 15 top chefs paired with premium wines from Napa Valley. Live jazz music and chef meet-and-greet."},
  "date": {"S": "2026-04-25T19:00"},
  "location": {"S": "The Ritz-Carlton, San Francisco, CA"},
  "capacity": {"N": "100"},
  "price": {"N": "175"},
  "category": {"S": "Food & Drink"},
  "status": {"S": "active"},
  "registeredCount": {"N": "0"},
  "createdAt": {"S": "'$(date -u +"%Y-%m-%dT%H:%M:%S.%3NZ")'"},
  "updatedAt": {"S": "'$(date -u +"%Y-%m-%dT%H:%M:%S.%3NZ")'"} 
}'

echo "✓ Created: Gourmet Food & Wine Tasting"

# Event 5: Marathon Run
EVENT_ID_5="EVENT#$(uuidgen)"
aws dynamodb put-item --table-name $TABLE_NAME --region $REGION --item '{
  "eventId": {"S": "'$EVENT_ID_5'"},
  "organizerId": {"S": "'$ORGANIZER_ID'"},
  "name": {"S": "Bay Area Marathon 2026"},
  "description": {"S": "Annual marathon through scenic Bay Area routes. Full marathon (26.2 miles), half marathon, and 5K options. Includes race packet, finisher medal, and post-race celebration."},
  "date": {"S": "2026-05-10T07:00"},
  "location": {"S": "Embarcadero, San Francisco, CA"},
  "capacity": {"N": "5000"},
  "price": {"N": "85"},
  "category": {"S": "Sports"},
  "status": {"S": "active"},
  "registeredCount": {"N": "0"},
  "createdAt": {"S": "'$(date -u +"%Y-%m-%dT%H:%M:%S.%3NZ")'"},
  "updatedAt": {"S": "'$(date -u +"%Y-%m-%dT%H:%M:%S.%3NZ")'"} 
}'

echo "✓ Created: Bay Area Marathon 2026"

# Event 6: Comedy Show
EVENT_ID_6="EVENT#$(uuidgen)"
aws dynamodb put-item --table-name $TABLE_NAME --region $REGION --item '{
  "eventId": {"S": "'$EVENT_ID_6'"},
  "organizerId": {"S": "'$ORGANIZER_ID'"},
  "name": {"S": "Stand-Up Comedy Night"},
  "description": {"S": "Hilarious evening with 5 top comedians. Featuring headliners from Netflix specials and Comedy Central. 21+ event with full bar and appetizers available."},
  "date": {"S": "2026-01-30T20:00"},
  "location": {"S": "The Laugh Factory, San Francisco, CA"},
  "capacity": {"N": "200"},
  "price": {"N": "45"},
  "category": {"S": "Entertainment"},
  "status": {"S": "active"},
  "registeredCount": {"N": "0"},
  "createdAt": {"S": "'$(date -u +"%Y-%m-%dT%H:%M:%S.%3NZ")'"},
  "updatedAt": {"S": "'$(date -u +"%Y-%m-%dT%H:%M:%S.%3NZ")'"} 
}'

echo "✓ Created: Stand-Up Comedy Night"

# Event 7: Art Exhibition
EVENT_ID_7="EVENT#$(uuidgen)"
aws dynamodb put-item --table-name $TABLE_NAME --region $REGION --item '{
  "eventId": {"S": "'$EVENT_ID_7'"},
  "organizerId": {"S": "'$ORGANIZER_ID'"},
  "name": {"S": "Modern Art Exhibition Opening"},
  "description": {"S": "Grand opening of contemporary art exhibition featuring 50+ artists. Interactive installations, live painting demonstrations, and artist Q&A sessions. Wine and hors d'\''oeuvres served."},
  "date": {"S": "2026-03-05T17:00"},
  "location": {"S": "SFMOMA, San Francisco, CA"},
  "capacity": {"N": "300"},
  "price": {"N": "35"},
  "category": {"S": "Art & Culture"},
  "status": {"S": "active"},
  "registeredCount": {"N": "0"},
  "createdAt": {"S": "'$(date -u +"%Y-%m-%dT%H:%M:%S.%3NZ")'"},
  "updatedAt": {"S": "'$(date -u +"%Y-%m-%dT%H:%M:%S.%3NZ")'"} 
}'

echo "✓ Created: Modern Art Exhibition Opening"

# Event 8: Yoga Retreat
EVENT_ID_8="EVENT#$(uuidgen)"
aws dynamodb put-item --table-name $TABLE_NAME --region $REGION --item '{
  "eventId": {"S": "'$EVENT_ID_8'"},
  "organizerId": {"S": "'$ORGANIZER_ID'"},
  "name": {"S": "Weekend Wellness Yoga Retreat"},
  "description": {"S": "Two-day yoga and meditation retreat in nature. Includes yoga sessions, guided meditation, healthy meals, and wellness workshops. All levels welcome. Accommodation included."},
  "date": {"S": "2026-06-12T08:00"},
  "location": {"S": "Esalen Institute, Big Sur, CA"},
  "capacity": {"N": "50"},
  "price": {"N": "450"},
  "category": {"S": "Health & Wellness"},
  "status": {"S": "active"},
  "registeredCount": {"N": "0"},
  "createdAt": {"S": "'$(date -u +"%Y-%m-%dT%H:%M:%S.%3NZ")'"},
  "updatedAt": {"S": "'$(date -u +"%Y-%m-%dT%H:%M:%S.%3NZ")'"} 
}'

echo "✓ Created: Weekend Wellness Yoga Retreat"

# Event 9: Gaming Tournament
EVENT_ID_9="EVENT#$(uuidgen)"
aws dynamodb put-item --table-name $TABLE_NAME --region $REGION --item '{
  "eventId": {"S": "'$EVENT_ID_9'"},
  "organizerId": {"S": "'$ORGANIZER_ID'"},
  "name": {"S": "Esports Championship 2026"},
  "description": {"S": "Professional gaming tournament featuring top teams competing in popular games. Live commentary, meet pro gamers, gaming expo, and $50,000 prize pool. Spectator and competitor tickets available."},
  "date": {"S": "2026-08-15T10:00"},
  "location": {"S": "Chase Center, San Francisco, CA"},
  "capacity": {"N": "2000"},
  "price": {"N": "65"},
  "category": {"S": "Gaming"},
  "status": {"S": "active"},
  "registeredCount": {"N": "0"},
  "createdAt": {"S": "'$(date -u +"%Y-%m-%dT%H:%M:%S.%3NZ")'"},
  "updatedAt": {"S": "'$(date -u +"%Y-%m-%dT%H:%M:%S.%3NZ")'"} 
}'

echo "✓ Created: Esports Championship 2026"

# Event 10: Charity Gala
EVENT_ID_10="EVENT#$(uuidgen)"
aws dynamodb put-item --table-name $TABLE_NAME --region $REGION --item '{
  "eventId": {"S": "'$EVENT_ID_10'"},
  "organizerId": {"S": "'$ORGANIZER_ID'"},
  "name": {"S": "Annual Charity Gala"},
  "description": {"S": "Black-tie charity event supporting local education programs. Includes gourmet dinner, live auction, entertainment by renowned performers, and keynote speech. All proceeds go to charity."},
  "date": {"S": "2026-11-20T18:30"},
  "location": {"S": "Fairmont Hotel, San Francisco, CA"},
  "capacity": {"N": "250"},
  "price": {"N": "500"},
  "category": {"S": "Charity"},
  "status": {"S": "active"},
  "registeredCount": {"N": "0"},
  "createdAt": {"S": "'$(date -u +"%Y-%m-%dT%H:%M:%S.%3NZ")'"},
  "updatedAt": {"S": "'$(date -u +"%Y-%m-%dT%H:%M:%S.%3NZ")'"} 
}'

echo "✓ Created: Annual Charity Gala"

echo ""
echo "=========================================="
echo "✅ Successfully created 10 dummy events!"
echo "=========================================="
echo ""
echo "Events created:"
echo "1. Tech Summit 2026 - $299"
echo "2. Summer Music Festival - $199"
echo "3. Startup Pitch Night - $49"
echo "4. Gourmet Food & Wine Tasting - $175"
echo "5. Bay Area Marathon 2026 - $85"
echo "6. Stand-Up Comedy Night - $45"
echo "7. Modern Art Exhibition Opening - $35"
echo "8. Weekend Wellness Yoga Retreat - $450"
echo "9. Esports Championship 2026 - $65"
echo "10. Annual Charity Gala - $500"
echo ""
echo "All events are visible at: https://d2nkn01x3icawa.cloudfront.net"
