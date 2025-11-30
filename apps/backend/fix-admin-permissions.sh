#!/bin/bash

# Quick fix: Grant CREATEDB permission to admin user
# Run this script with: bash fix-admin-permissions.sh

echo "Granting CREATEDB permission to admin user..."

sudo -u postgres psql << EOF

-- Grant CREATEDB permission to admin user
ALTER USER admin WITH CREATEDB;

-- Verify permissions
\du admin

SELECT 'Admin user now has CREATEDB permission!' AS status;

EOF

echo ""
echo "✅ Permission granted!"
echo "Now you can run: npm run db:migrate"
echo ""


