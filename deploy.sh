#!/bin/bash

# Update system packages
sudo apt update && sudo apt upgrade -y

# Install Docker if not already installed
if ! command -v docker &> /dev/null; then
    curl -fsSL https://get.docker.com -o get-docker.sh
    sudo sh get-docker.sh
    sudo usermod -aG docker $USER
fi

# Install Docker Compose if not already installed
if ! command -v docker-compose &> /dev/null; then
    sudo curl -L "https://github.com/docker/compose/releases/download/v2.24.5/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
fi

# Create production environment file
cat > .env.production << EOL
VITE_FIREBASE_API_KEY=${VITE_FIREBASE_API_KEY}
VITE_FIREBASE_AUTH_DOMAIN=${VITE_FIREBASE_AUTH_DOMAIN}
VITE_FIREBASE_PROJECT_ID=${VITE_FIREBASE_PROJECT_ID}
VITE_FIREBASE_STORAGE_BUCKET=${VITE_FIREBASE_STORAGE_BUCKET}
VITE_FIREBASE_MESSAGING_SENDER_ID=${VITE_FIREBASE_MESSAGING_SENDER_ID}
VITE_FIREBASE_APP_ID=${VITE_FIREBASE_APP_ID}
VITE_FIREBASE_MEASUREMENT_ID=${VITE_FIREBASE_MEASUREMENT_ID}
VITE_OPENAI_API_KEY=${VITE_OPENAI_API_KEY}
VITE_IKHOKHA_MERCHANT_ID=${VITE_IKHOKHA_MERCHANT_ID}
VITE_IKHOKHA_API_KEY=${VITE_IKHOKHA_API_KEY}
EOL

# Build and start containers
docker-compose up -d --build

# Install and configure Nginx
sudo apt install nginx -y
sudo cp nginx.conf /etc/nginx/sites-available/alice-tattoo
sudo ln -s /etc/nginx/sites-available/alice-tattoo /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl restart nginx

# Install Certbot and get SSL certificate
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com