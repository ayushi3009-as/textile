#!/bin/bash
set -e

echo "Installing Nginx and Certbot..."
sudo apt-get update
sudo apt-get install -y nginx certbot python3-certbot-nginx

echo "Configuring Nginx..."
cat << 'EOF' | sudo tee /etc/nginx/sites-available/api
server {
    listen 80;
    server_name api.tivra.marketing;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        
        # SSE Support
        proxy_buffering off;
        proxy_cache off;
        chunked_transfer_encoding off;
    }
}
EOF

sudo ln -sf /etc/nginx/sites-available/api /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo systemctl restart nginx

echo "Running Certbot for SSL..."
sudo certbot --nginx -d api.tivra.marketing --non-interactive --agree-tos -m admin@tivra.marketing --redirect

echo "Nginx and SSL Setup Complete!"
