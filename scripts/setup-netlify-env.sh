#!/bin/bash

# Check if .env file exists
if [ ! -f .env ]; then
    echo "Error: .env file not found!"
    exit 1
fi

# Read .env file and set each variable in Netlify
while IFS='=' read -r key value
do
    # Skip empty lines and comments
    if [ -z "$key" ] || [[ $key == \#* ]]; then
        continue
    fi
    
    # Remove any quotes from the value
    value=$(echo $value | tr -d '"' | tr -d "'")
    
    # Set the environment variable in Netlify
    echo "Setting $key in Netlify..."
    netlify env:set $key $value
done < .env

echo "Environment variables have been set in Netlify!"
