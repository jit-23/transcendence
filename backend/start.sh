#!/bin/sh

set -e  # Exit on any error

# Create SSL certificate directories
echo "Creating SSL certificate directories..."
mkdir -p /etc/ssl/private /etc/ssl/certs
chmod 755 /etc/ssl/private /etc/ssl/certs

# Generate self-signed SSL certificates if they don't exist
if [ ! -f /etc/ssl/certs/server.cert ] || [ ! -f /etc/ssl/private/server.key ]; then
  echo "🔐 Generating self-signed SSL certificates..."
  openssl req -x509 -newkey rsa:2048 -keyout /etc/ssl/private/server.key -out /etc/ssl/certs/server.cert -days 365 -nodes -subj "/CN=localhost" 2>&1 | head -20
  echo "✓ SSL certificates generated"
  chmod 600 /etc/ssl/private/server.key
  chmod 644 /etc/ssl/certs/server.cert
  echo "Certificate info:"
  ls -lah /etc/ssl/certs/server.cert /etc/ssl/private/server.key
  echo ""
  openssl x509 -in /etc/ssl/certs/server.cert -text -noout | head -15
else
  echo "✓ SSL certificates already exist"
  ls -lah /etc/ssl/certs/server.cert /etc/ssl/private/server.key
fi

# Verify certificates are readable
if [ ! -r /etc/ssl/certs/server.cert ] || [ ! -r /etc/ssl/private/server.key ]; then
  echo "✗ SSL certificates are not readable"
  exit 1
fi

echo "✓ SSL certificates verified and ready"
echo ""
echo "Starting backend server..."

# Run database migrations
echo "Running database migrations..."
npx prisma db push --schema=./src/prisma/schema.prisma

# Start the server
echo "Starting Node.js server..."
node dist/index.js

# Run database migrations and start the server
echo "Starting backend server..."
npx prisma db push --schema=./src/prisma/schema.prisma && node dist/index.js
