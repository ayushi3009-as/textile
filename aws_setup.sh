#!/bin/bash
set -e

echo "Updating system..."
sudo apt-get update && sudo apt-get upgrade -y

echo "Installing Node.js 20..."
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

echo "Installing PostgreSQL..."
sudo apt-get install -y postgresql postgresql-contrib

echo "Setting up PostgreSQL user and database..."
sudo -u postgres psql -c "ALTER USER postgres PASSWORD 'postgres';" || true
sudo -u postgres psql -c "CREATE DATABASE texvibe;" || true

echo "Installing PM2..."
sudo npm install -g pm2

echo "Cloning Repository..."
cd /home/ubuntu
if [ -d "textile" ]; then
  echo "Directory textile exists, pulling latest..."
  cd textile
  git pull origin main
else
  git clone https://github.com/ayushi3009-as/textile.git
  cd textile
fi

echo "Installing Dependencies..."
npm install

echo "Setup Complete!"
