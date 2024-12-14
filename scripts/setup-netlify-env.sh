#!/bin/bash

# Check if netlify-cli is installed
if ! command -v netlify &> /dev/null; then
    echo "netlify-cli is not installed. Installing..."
    npm install -g netlify-cli
fi

# Function to set environment variable
set_env_var() {
    netlify env:set $1 "$2"
}

# Read from .env file and set each variable
if [ -f .env ]; then
    echo "Setting environment variables from .env file..."
    while IFS='=' read -r key value
    do
        # Skip comments and empty lines
        if [[ $key != \#* ]] && [ ! -z "$key" ]; then
            # Remove any quotes from the value
            value=$(echo $value | tr -d '"' | tr -d "'")
            set_env_var "$key" "$value"
        fi
    done < .env
    echo "Environment variables set successfully!"
else
    echo "Error: .env file not found!"
    exit 1
fi

# Set production specific variables
netlify env:set NODE_ENV "production"
netlify env:set VITE_APP_URL "https://alicetattoos.com"
netlify env:set VITE_API_URL "https://alicetattoos.com/api"

# Deploy Netlify functions
echo "Deploying Netlify functions..."
netlify deploy --prod --dir=dist --functions=netlify/functions
