#!/bin/bash

# Script to generate SSL certificates for all containers

# Create a directory for SSL certificates
mkdir -p ssl/certs
mkdir -p ssl/private

# Generate a self-signed SSL certificate if it doesn't exist already
if [ ! -f ssl/certs/server.crt ]; then
    echo "Generating self-signed SSL certificates..."
    openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
        -keyout ssl/private/server.key \
        -out ssl/certs/server.crt \
        -subj "/C=ES/ST=State/L=City/O=Organization/CN=greenwork.local"
    
    # Copy certificates to the appropriate locations
    cp ssl/certs/server.crt ssl/certs/ssl-cert-snakeoil.pem
    cp ssl/private/server.key ssl/private/ssl-cert-snakeoil.key
    
    echo "SSL certificates generated successfully!"
else
    echo "SSL certificates already exist."
fi

echo "Make sure to mount these certificates in your containers using the ssl_certs volume."
echo "Your containers are now configured to use HTTPS."
