#!/bin/bash

BUCKET="event-ticketing-frontend-dev-264449293739"
DISTRIBUTION_ID="E3A54MN5Q7TR2P"

echo "Deploying frontend to S3..."

# Upload files
aws s3 sync . s3://$BUCKET/ \
    --exclude "deploy.sh" \
    --exclude ".DS_Store" \
    --cache-control "max-age=31536000" \
    --exclude "index.html" \
    --exclude "*.html"

# Upload HTML files with no cache
aws s3 sync . s3://$BUCKET/ \
    --exclude "*" \
    --include "*.html" \
    --cache-control "no-cache"

echo "Invalidating CloudFront cache..."
aws cloudfront create-invalidation \
    --distribution-id $DISTRIBUTION_ID \
    --paths "/*" \
    --query 'Invalidation.Id' \
    --output text

echo "✓ Deployment complete!"
echo "URL: https://d2nkn01x3icawa.cloudfront.net"
