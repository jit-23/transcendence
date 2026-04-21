#!/bin/sh

set -e  # Exit on any error

CERT_DIR=/etc/ssl/certs
CERT_PATH="$CERT_DIR/server.cert"
KEY_PATH="$CERT_DIR/server.key"

# Create SSL certificate directories
echo "Creating SSL certificate directories..."
mkdir -p "$CERT_DIR"
chmod 755 "$CERT_DIR"

# Generate self-signed SSL certificates if they do not exist or do not match
needs_regen=0
if [ ! -f "$CERT_PATH" ] || [ ! -f "$KEY_PATH" ]; then
  needs_regen=1
else
  cert_pubkey=$(openssl x509 -in "$CERT_PATH" -pubkey -noout 2>/dev/null || true)
  key_pubkey=$(openssl pkey -in "$KEY_PATH" -pubout 2>/dev/null || true)

  if [ -z "$cert_pubkey" ] || [ -z "$key_pubkey" ] || [ "$cert_pubkey" != "$key_pubkey" ]; then
    needs_regen=1
  fi
fi

if [ "$needs_regen" -eq 1 ]; then
  echo "Generating self-signed SSL certificates..."
  rm -f "$CERT_PATH" "$KEY_PATH"
  openssl req -x509 -newkey rsa:2048 -keyout "$KEY_PATH" -out "$CERT_PATH" -days 365 -nodes -subj "/CN=localhost" 2>&1 | head -20
  echo "SSL certificates generated"
  chmod 600 "$KEY_PATH"
  chmod 644 "$CERT_PATH"
  echo "Certificate info:"
  ls -lah "$CERT_PATH" "$KEY_PATH"
  echo ""
  openssl x509 -in "$CERT_PATH" -text -noout | head -15
else
  echo "SSL certificates already exist and match"
  ls -lah "$CERT_PATH" "$KEY_PATH"
fi

# Verify certificates are readable
if [ ! -r "$CERT_PATH" ] || [ ! -r "$KEY_PATH" ]; then
  echo "SSL certificates are not readable"
  exit 1
fi

echo "SSL certificates verified and ready"
echo ""
echo "Starting backend server..."

# Run database migrations
echo "Running database migrations..."
npx prisma db push --schema=./src/prisma/schema.prisma

# Start the server
echo "Starting Node.js server..."
node dist/index.js
