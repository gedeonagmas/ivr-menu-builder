#!/bin/bash

# Script to create a new PostgreSQL database for Workflow Builder
# Run this script with: bash setup-database.sh

echo "Creating PostgreSQL database for Workflow Builder..."

# Connect to PostgreSQL as postgres user and create database
sudo -u postgres psql << EOF

-- Create the admin user if it doesn't exist
DO \$\$
BEGIN
   IF NOT EXISTS (SELECT FROM pg_user WHERE usename = 'admin') THEN
      CREATE USER admin WITH PASSWORD 'admin' CREATEDB;
   ELSE
      -- Update password and grant CREATEDB if user exists
      ALTER USER admin WITH PASSWORD 'admin' CREATEDB;
   END IF;
END
\$\$;

-- Create the database
CREATE DATABASE workflowbuilder OWNER admin;

-- Grant all privileges
GRANT ALL PRIVILEGES ON DATABASE workflowbuilder TO admin;

-- Connect to the new database and grant schema privileges
\c workflowbuilder
GRANT ALL ON SCHEMA public TO admin;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO admin;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO admin;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO admin;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO admin;

-- List created databases
\l

-- Show success message
SELECT 'Database workflowbuilder created successfully!' AS status;

EOF

echo ""
echo "✅ Database setup complete!"
echo ""
echo "Your .env file should have:"
echo "DATABASE_URL=\"postgresql://admin:admin@localhost:5432/workflowbuilder\""
echo ""
