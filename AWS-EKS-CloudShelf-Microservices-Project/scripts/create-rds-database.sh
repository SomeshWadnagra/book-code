#!/bin/bash
set -e

# This script creates databases on RDS for future services
# Run this from Jump Server when ready to migrate to RDS

echo "=========================================="
echo "CloudShelf - Create RDS Databases"
echo "=========================================="

# Get RDS endpoint from Secrets Manager
echo "Getting RDS endpoint..."
RDS_SECRET=$(aws secretsmanager get-secret-value \
    --secret-id cloudshelf-rds-credentials \
    --query SecretString --output text)

RDS_HOST=$(echo $RDS_SECRET | jq -r '.host')
RDS_USER=$(echo $RDS_SECRET | jq -r '.username')
RDS_PASS=$(echo $RDS_SECRET | jq -r '.password')

echo "RDS Host: $RDS_HOST"
echo ""

# Create databases
echo "Creating databases..."
PGPASSWORD=$RDS_PASS psql -h $RDS_HOST -U $RDS_USER -d postgres << EOF
-- Create databases
CREATE DATABASE IF NOT EXISTS author_service;
CREATE DATABASE IF NOT EXISTS order_service;
CREATE DATABASE IF NOT EXISTS stock_check_service;

-- List databases
\l

-- Grant permissions
GRANT ALL PRIVILEGES ON DATABASE author_service TO $RDS_USER;
GRANT ALL PRIVILEGES ON DATABASE order_service TO $RDS_USER;
GRANT ALL PRIVILEGES ON DATABASE stock_check_service TO $RDS_USER;

EOF

echo ""
echo "✅ Databases created successfully!"
echo ""
echo "Databases:"
echo "  - author_service"
echo "  - order_service"
echo "  - stock_check_service"
echo ""
echo "Next steps:"
echo "1. Update ConfigMaps to use RDS endpoints"
echo "2. Redeploy services"
echo "3. Remove PostgreSQL container deployments"