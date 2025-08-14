# Fleet Management System - Complete Setup & Deployment Guide for Windows 11

This tutorial provides comprehensive instructions for setting up the Fleet Management System on Windows 11 with PostgreSQL, including database configuration, authentication setup, and deployment options.

## Important Note About Project Setup

**This is a complete Next.js project that's ready to use!** The Fleet Management System was created as a locally initialized project with all files already included. You don't need to clone from a remote repository or download additional files. The project includes:

- A complete Next.js 15 application with TypeScript
- Prisma ORM configured for PostgreSQL
- shadcn/ui component library
- Authentication system with NextAuth.js
- WebSocket support for real-time features
- Complete admin dashboard and user management

Simply navigate to the project directory and follow the setup instructions below.

## Quick Start Guide (Windows 11 + PostgreSQL)

If you want to get started quickly with your existing PostgreSQL installation on Windows 11, follow these steps:

### 1. Navigate to Project and Install Dependencies
```cmd
# Open Command Prompt or PowerShell as Administrator
# Navigate to your project directory
cd C:\Users\YourUsername\Documents\Projects\fleet-management-system

# Install project dependencies
npm install
```

### 2. Set Up PostgreSQL Database
```cmd
# Open psql as postgres user
psql -U postgres

# In PostgreSQL shell:
CREATE DATABASE fleet_management_dev;
CREATE USER fleet_dev_user WITH ENCRYPTED PASSWORD 'dev_password';
GRANT ALL PRIVILEGES ON DATABASE fleet_management_dev TO fleet_dev_user;
\q

# Or using single commands in PowerShell:
psql -U postgres -c "CREATE DATABASE fleet_management_dev;"
psql -U postgres -c "CREATE USER fleet_dev_user WITH ENCRYPTED PASSWORD 'dev_password';"
psql -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE fleet_management_dev TO fleet_dev_user;"
```

### 3. Configure Environment
Create `.env.local` file in VS Code:
```env
DATABASE_URL="postgresql://fleet_dev_user:dev_password@localhost:5432/fleet_management_dev"
JWT_SECRET="your-super-secret-jwt-key-here"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-nextauth-secret-here"
NODE_ENV="development"
```

### 4. Set Up Database and Run
```cmd
# Generate Prisma client and push schema
npx prisma generate
npm run db:push

# Start development server
npm run dev
```

Your application will be running at `http://localhost:3000`!

---

## Table of Contents
1. [Project Overview](#project-overview)
2. [Prerequisites](#prerequisites)
3. [Local Development Setup](#local-development-setup)
4. [PostgreSQL Configuration](#postgresql-configuration)
5. [Authentication Setup](#authentication-setup)
6. [Environment Variables](#environment-variables)
7. [Production Deployment](#production-deployment)
8. [Deployment Platforms](#deployment-platforms)
9. [Maintenance & Monitoring](#maintenance--monitoring)
10. [Troubleshooting](#troubleshooting)

## Project Overview

The Fleet Management System is a comprehensive Next.js application for managing truck fleets, maintenance records, user activities, and administrative monitoring. This is a **complete, ready-to-use project** that includes:

- **Core Features**: Truck management, maintenance tracking, user management
- **Admin Features**: Audit logging, user activity monitoring, login history tracking
- **Technical Stack**: Next.js 15, TypeScript, Prisma ORM, PostgreSQL, Tailwind CSS, shadcn/ui
- **Project Status**: Complete and ready for deployment with all dependencies configured

## Prerequisites

Before setting up the project, ensure you have the following installed on Windows 11:

- **Windows 11** (with latest updates)
- **Node.js** (v18 or higher) - 64-bit version recommended
- **PostgreSQL** (already installed - we'll use this for both local and production)
- **Visual Studio Code** (recommended)
- **Windows Terminal** (recommended, comes with Windows 11)

### Install Node.js on Windows 11
```cmd
# Check if Node.js is installed (Command Prompt or PowerShell)
node --version
npm --version

# If not installed, download from https://nodejs.org/
# Download the LTS (Long Term Support) version for Windows 64-bit
# Run the installer and follow the setup wizard

# Verify installation after installation
node --version
npm --version
```

### Install Visual Studio Code (Recommended)
```cmd
# Download VS Code from https://code.visualstudio.com/
# Run the installer and select:
# - Add to PATH
# - Add "Open with Code" action
# - Register Code as default editor for supported file types

# Install recommended VS Code extensions for this project:
code --install-extension ms-vscode.vscode-typescript-next
code --install-extension esbenp.prettier-vscode
code --install-extension ms-vscode.vscode-json
code --install-extension bradlc.vscode-tailwindcss
code --install-extension Prisma.prisma
code --install-extension ms-ossdata.vscode-postgresql
```

### Verify PostgreSQL Installation on Windows 11
Since you already have PostgreSQL installed, ensure it's running:
```cmd
# Check PostgreSQL service status (Command Prompt as Administrator)
net start | findstr postgres

# If not running, start it
net start postgresql-x64-15  # Version number may vary

# Or check in Services:
# 1. Press Win + R, type services.msc, press Enter
# 2. Look for "postgresql-x64-15" service
# 3. Right-click and select "Start" if not running

# Verify PostgreSQL version
psql --version
```

## Local Development Setup

### 1. Navigate to Project Directory
```cmd
# Open Windows Terminal or Command Prompt as Administrator
# Navigate to your project directory
cd C:\Users\YourUsername\Documents\Projects\fleet-management-system

# Open in VS Code
code .
```

### 2. Install Dependencies
```cmd
# Using npm (in VS Code terminal or Command Prompt)
npm install

# This will install all packages listed in package.json including:
# - Next.js 15
# - TypeScript
# - Prisma ORM
# - shadcn/ui components
# - Authentication libraries
# - Database drivers
```

### 3. Set Up Environment Variables
Create a `.env.local` file in VS Code:

**Method 1: Using VS Code**
1. In VS Code Explorer, right-click in the project root
2. Select "New File"
3. Name it `.env.local`
4. Add the following content:

```env
# Database Configuration
DATABASE_URL="postgresql://fleet_dev_user:dev_password@localhost:5432/fleet_management_dev"

# Authentication Configuration
JWT_SECRET="your-super-secret-jwt-key-here-change-this-in-production"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-nextauth-secret-here-change-this-in-production"

# Environment Configuration
NODE_ENV="development"

# Optional: WebSocket Configuration
WS_PORT="3001"
```

### 4. Set Up PostgreSQL Database

#### Create Local Development Database
```cmd
# Open Command Prompt as Administrator
# Open psql as postgres user
psql -U postgres

# In PostgreSQL shell:
CREATE DATABASE fleet_management_dev;
CREATE USER fleet_dev_user WITH ENCRYPTED PASSWORD 'dev_password';
GRANT ALL PRIVILEGES ON DATABASE fleet_management_dev TO fleet_dev_user;
\q

# Or using single commands in PowerShell:
psql -U postgres -c "CREATE DATABASE fleet_management_dev;"
psql -U postgres -c "CREATE USER fleet_dev_user WITH ENCRYPTED PASSWORD 'dev_password';"
psql -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE fleet_management_dev TO fleet_dev_user;"
```

#### Generate Prisma Client and Set Up Database
```cmd
# Generate Prisma client
npx prisma generate

# Push database schema to PostgreSQL
npm run db:push

# (Optional) View database in browser
npx prisma studio
# This will open Prisma Studio in your browser at http://localhost:5555
```

#### Test PostgreSQL Connection
```cmd
# Test connection using psql
psql -U fleet_dev_user -d fleet_management_dev

# Or using the URI format:
psql "postgresql://fleet_dev_user:dev_password@localhost:5432/fleet_management_dev"

# Test using Prisma
npx prisma db execute --stdin --url="postgresql://fleet_dev_user:dev_password@localhost:5432/fleet_management_dev" <<< "SELECT 1"
```

### 5. Run the Development Server
```cmd
# Start the development server
npm run dev

# The application will be available at http://localhost:3000
# WebSocket server will run on port 3001
```

### 6. Run Linting (Optional but Recommended)
```cmd
npm run lint
```

### 7. Database Management Tools for Windows 11

#### Install pgAdmin (GUI Tool)
```cmd
# Download pgAdmin from https://www.pgadmin.org/download/
# Run the installer and follow the setup wizard
# Launch pgAdmin and add a new server connection:
# - Host: localhost
# - Port: 5432
# - Username: fleet_dev_user
# - Password: dev_password
# - Database: fleet_management_dev
```

#### Use DBeaver (Universal Database Tool)
```cmd
# Download DBeaver from https://dbeaver.io/download/
# Run the installer
# Launch DBeaver and create a new PostgreSQL connection
```

#### VS Code Database Extensions
```cmd
# Install these VS Code extensions for database management:
code --install-extension ms-ossdata.vscode-postgresql
code --install-extension mtxr.sqltools
code --install-extension mtxr.sqltools-driver-pg
```

#### Command-line Tips for PostgreSQL on Windows 11
```cmd
# List all databases
psql -U postgres -c "\l"

# Connect to your development database
psql -U fleet_dev_user -d fleet_management_dev

# View all tables
\dt

# View table structure
\d table_name

# Exit PostgreSQL shell
\q

# Check PostgreSQL service status
net start | findstr postgres

# Start PostgreSQL service (if stopped)
net start postgresql-x64-15

# Stop PostgreSQL service
net stop postgresql-x64-15

# Restart PostgreSQL service
net stop postgresql-x64-15 && net start postgresql-x64-15
```

## PostgreSQL Configuration

### Local Development Database Setup

#### Verify PostgreSQL Installation
```cmd
# Check if PostgreSQL is installed and running (Command Prompt as Administrator)
psql --version
net start | findstr postgres

# If not running, start it
net start postgresql-x64-15  # Version number may vary

# Enable PostgreSQL to start on boot (Windows Service)
sc config postgresql-x64-15 start=auto

# Check PostgreSQL data directory (optional)
psql -U postgres -c "SHOW data_directory;"
```

#### Create Production Database and User
```cmd
# Open Command Prompt as Administrator
# Open psql as postgres user
psql -U postgres

# In PostgreSQL shell:
CREATE DATABASE fleet_management;
CREATE USER fleet_user WITH ENCRYPTED PASSWORD 'your_secure_password_here';
GRANT ALL PRIVILEGES ON DATABASE fleet_management TO fleet_user;
ALTER USER fleet_user CREATEDB;
\q

# Or using single commands in PowerShell:
psql -U postgres -c "CREATE DATABASE fleet_management;"
psql -U postgres -c "CREATE USER fleet_user WITH ENCRYPTED PASSWORD 'your_secure_password_here';"
psql -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE fleet_management TO fleet_user;"
psql -U postgres -c "ALTER USER fleet_user CREATEDB;"
```

#### Test Production Database Connection
```cmd
# Test connection with new user
psql -U fleet_user -d fleet_management

# Or using the URI format:
psql "postgresql://fleet_user:your_secure_password_here@localhost:5432/fleet_management"

# Test using Prisma
npx prisma db execute --stdin --url="postgresql://fleet_user:your_secure_password_here@localhost:5432/fleet_management" <<< "SELECT 1"
```

### Configure PostgreSQL for Production on Windows 11

#### Method 1: Using pgAdmin
1. Open pgAdmin
2. Connect to your PostgreSQL server
3. Right-click on the server and select "Properties"
4. Adjust memory and connection settings as needed

#### Method 2: Manual Configuration
```cmd
# Find PostgreSQL configuration files
# Usually located in: C:\Program Files\PostgreSQL\<version>\data\

# Edit postgresql.conf (use Notepad++ or VS Code)
# Path: C:\Program Files\PostgreSQL\15\data\postgresql.conf

# Recommended settings for production on Windows 11:
# shared_buffers = 256MB
# effective_cache_size = 1GB
# maintenance_work_mem = 64MB
# checkpoint_completion_target = 0.9
# wal_buffers = 16MB
# default_statistics_target = 100
# random_page_cost = 1.1
# effective_io_concurrency = 200
# work_mem = 4MB
# min_wal_size = 1GB
# max_wal_size = 4GB
# max_connections = 200

# Edit pg_hba.conf for secure connections
# Path: C:\Program Files\PostgreSQL\15\data\pg_hba.conf

# Add these lines at the end for secure local connections:
# TYPE  DATABASE        USER            ADDRESS                 METHOD
# local   all             all                                     scram-sha-256
# host    all             all             127.0.0.1/32            scram-sha-256
# host    all             all             ::1/128                 scram-sha-256

# Restart PostgreSQL to apply changes
net stop postgresql-x64-15
net start postgresql-x64-15
```

### Set Up Automatic Backups on Windows 11

#### Create Backup Script
```cmd
# Create backup directory
mkdir C:\postgres_backups

# Create backup script (backup_postgres.bat)
@echo off
set DATE=%date:~-4,4%%date:~-7,2%%date:~-10,2%
set TIME=%time:~0,2%%time:~3,2%%time:~6,2%
set BACKUP_DIR=C:\postgres_backups
set DB_NAME=fleet_management

REM Create backup
pg_dump -U fleet_user -d %DB_NAME% > %BACKUP_DIR%\fleet_management_%DATE%_%TIME%.sql

REM Compress backup using PowerShell
powershell -Command "Compress-Archive -Path '%BACKUP_DIR%\fleet_management_%DATE%_%TIME%.sql' -DestinationPath '%BACKUP_DIR%\fleet_management_%DATE%_%TIME%.sql.gz' -Force"
del %BACKUP_DIR%\fleet_management_%DATE%_%TIME%.sql

REM Remove backups older than 30 days
forfiles /P %BACKUP_DIR% /M fleet_management_*.sql.gz /D -30 /C "cmd /c del @path"

echo Backup completed: fleet_management_%DATE%_%TIME%.sql.gz
```

Save this as `backup_postgres.bat` in `C:\postgres_backups`

#### Set Up Scheduled Task on Windows 11
```cmd
# Open Task Scheduler
# Press Win + R, type taskschd.msc, press Enter

# Create Basic Task:
# 1. Click "Create Basic Task" in Actions pane
# 2. Name: "PostgreSQL Backup"
# 3. Description: "Daily backup of Fleet Management database"
# 4. Trigger: Daily at 2:00 AM
# 5. Action: Start a program
# 6. Program/script: C:\postgres_backups\backup_postgres.bat
# 7. Finish
```

### Configure Remote Access (If Needed)
```cmd
# Edit postgresql.conf
# Find: listen_addresses = 'localhost'
# Change to: listen_addresses = '*'  (for all interfaces) or specific IP

# Edit pg_hba.conf
# Add line for remote access (replace IP with your client IP):
# host    all             all             your_client_ip/32        scram-sha-256

# Restart PostgreSQL
net stop postgresql-x64-15
net start postgresql-x64-15

# Configure Windows Firewall
# Open Windows Defender Firewall with Advanced Security
# Add inbound rule for PostgreSQL:
# - Port: 5432
# - Protocol: TCP
# - Action: Allow
# - Name: PostgreSQL

# Or using command line:
netsh advfirewall firewall add rule name="PostgreSQL" dir=in action=allow protocol=TCP localport=5432
```

### Monitor PostgreSQL Performance on Windows 11
```cmd
# Use pgAdmin for GUI monitoring

# Or use command-line monitoring
psql -U postgres -c "SELECT * FROM pg_stat_activity;"
psql -U postgres -c "SELECT * FROM pg_stat_database;"

# Check database size
psql -U postgres -c "SELECT pg_database.datname, pg_size_pretty(pg_database_size(pg_database.datname)) FROM pg_database;"

# Check table sizes
psql -U fleet_user -d fleet_management -c "SELECT tablename FROM pg_tables WHERE schemaname = 'public';"

# Check active connections
psql -U postgres -c "SELECT count(*) FROM pg_stat_activity;"
```

## Authentication Setup

### JWT Configuration
The project uses JSON Web Tokens (JWT) for authentication. Configure these settings in your `.env.local`:

```env
# JWT Configuration
JWT_SECRET="your-super-secret-jwt-key-here-change-this-in-production"
JWT_EXPIRES_IN="7d"
```

### NextAuth.js Configuration
The project also includes NextAuth.js for additional authentication providers:

```env
# NextAuth Configuration
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-nextauth-secret-here-change-this-in-production"
```

### External Authentication Providers (Optional)
You can configure external providers like Google, GitHub, etc.:

```env
# Google OAuth (Optional)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# GitHub OAuth (Optional)
GITHUB_CLIENT_ID="your-github-client-id"
GITHUB_CLIENT_SECRET="your-github-client-secret"
```

### User Roles and Permissions
The system includes predefined user roles:
- **Admin**: Full access to all features
- **Manager**: Access to fleet management and reports
- **Mechanic**: Access to maintenance records
- **User**: Basic access to view information

## Environment Variables

### Development Environment (.env.local)
```env
# Database Configuration
DATABASE_URL="postgresql://fleet_dev_user:dev_password@localhost:5432/fleet_management_dev"

# Authentication Configuration
JWT_SECRET="your-super-secret-jwt-key-here-change-this-in-production"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-nextauth-secret-here-change-this-in-production"

# Environment Configuration
NODE_ENV="development"

# WebSocket Configuration
WS_PORT="3001"

# Optional: External Auth Providers
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
GITHUB_CLIENT_ID=""
GITHUB_CLIENT_SECRET=""
```

### Production Environment (.env.production)
```env
# Database Configuration
DATABASE_URL="postgresql://fleet_user:your_secure_password_here@localhost:5432/fleet_management"

# Authentication Configuration
JWT_SECRET="your-production-super-secret-jwt-key"
NEXTAUTH_URL="https://your-domain.com"
NEXTAUTH_SECRET="your-production-nextauth-secret"

# Environment Configuration
NODE_ENV="production"

# WebSocket Configuration
WS_PORT="3001"

# Optional: External Auth Providers
GOOGLE_CLIENT_ID="your-production-google-client-id"
GOOGLE_CLIENT_SECRET="your-production-google-client-secret"
GITHUB_CLIENT_ID="your-production-github-client-id"
GITHUB_CLIENT_SECRET="your-production-github-client-secret"
```

## Production Deployment

### Windows 11 Production Setup

#### Option 1: Using IIS (Recommended for Windows Server)
```cmd
# Install IIS with URL Rewrite module
# 1. Open "Turn Windows features on or off"
# 2. Enable "Internet Information Services"
# 3. Expand "World Wide Web Services" -> "Application Development Features"
# 4. Enable "Application Initialization" and "HTTP Redirection"
# 5. Install URL Rewrite module from Microsoft

# Create a new website in IIS Manager:
# 1. Open IIS Manager
# 2. Right-click on "Sites" -> "Add Website"
# 3. Site name: Fleet Management
# 4. Physical path: C:\inetpub\wwwroot\fleet-management
# 5. Hostname: your-domain.com
# 6. Port: 80

# Configure URL Rewrite for Next.js:
# Create web.config in your project root:
<?xml version="1.0" encoding="utf-8"?>
<configuration>
  <system.webServer>
    <rewrite>
      <rules>
        <rule name="Next.js" stopProcessing="true">
          <match url="(.*)" />
          <conditions logicalGrouping="MatchAll">
            <add input="{REQUEST_FILENAME}" matchType="IsFile" negate="true" />
            <add input="{REQUEST_FILENAME}" matchType="IsDirectory" negate="true" />
          </conditions>
          <action type="Rewrite" url="index.js" />
        </rule>
      </rules>
    </rewrite>
  </system.webServer>
</configuration>
```

#### Option 2: Using Windows Service (NSSM)
```cmd
# Download NSSM from https://nssm.cc/download
# Extract to C:\nssm

# Build the Next.js application
npm run build

# Create Windows service
cd C:\nssm
nssm install "FleetManagement" "C:\Program Files\nodejs\node.exe" "C:\Users\YourUsername\Documents\Projects\fleet-management-system\server.js"

# Configure service
nssm set "FleetManagement" AppDirectory "C:\Users\YourUsername\Documents\Projects\fleet-management-system"
nssm set "FleetManagement" Description "Fleet Management System"
nssm set "FleetManagement" Start SERVICE_AUTO_START

# Start the service
nssm start "FleetManagement"

# Check service status
nssm status "FleetManagement"
```

#### Option 3: Using PM2 (Node.js Process Manager)
```cmd
# Install PM2 globally
npm install -g pm2

# Build the application
npm run build

# Start the application with PM2
pm2 start server.js --name "fleet-management"

# Save PM2 configuration
pm2 save

# Set up PM2 to start on boot
pm2 startup
pm2 save

# Check status
pm2 status
pm2 logs fleet-management
```

### SSL Certificate Configuration
```cmd
# Option 1: Using Let's Encrypt (Certbot)
# Download Certbot for Windows from https://certbot.eff.org/

# Option 2: Using IIS (for Windows Server)
# 1. Open IIS Manager
# 2. Select your server
# 3. Double-click "Server Certificates"
# 4. Click "Create Domain Certificate"
# 5. Fill in your details and complete the certificate request

# Option 3: Using Windows Certificate Manager
# 1. Press Win + R, type certmgr.msc
# 2. Import your SSL certificate
# 3. Bind the certificate to your website in IIS
```

### Windows Firewall Configuration
```cmd
# Allow inbound traffic for your application
netsh advfirewall firewall add rule name="Fleet Management HTTP" dir=in action=allow protocol=TCP localport=3000

# Allow inbound traffic for WebSocket
netsh advfirewall firewall add rule name="Fleet Management WebSocket" dir=in action=allow protocol=TCP localport=3001

# Allow inbound traffic for PostgreSQL (if remote access needed)
netsh advfirewall firewall add rule name="PostgreSQL" dir=in action=allow protocol=TCP localport=5432
```

## Deployment Platforms

### Vercel (Recommended for Next.js)
```cmd
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy to Vercel
vercel

# Configure environment variables in Vercel dashboard:
# - DATABASE_URL (PostgreSQL connection string)
# - JWT_SECRET
# - NEXTAUTH_URL
# - NEXTAUTH_SECRET
```

### AWS Options
```cmd
# Option 1: AWS Elastic Beanstalk
# 1. Install AWS CLI
# 2. Configure AWS credentials
# 3. Create Elastic Beanstalk application
# 4. Deploy using eb CLI

# Option 2: AWS EC2
# 1. Launch EC2 instance
# 2. Install Node.js and PostgreSQL
# 3. Deploy application using PM2
# 4. Configure security groups and load balancer

# Option 3: AWS RDS for PostgreSQL
# 1. Create RDS PostgreSQL instance
# 2. Configure security groups
# 3. Update DATABASE_URL with RDS connection string
```

### DigitalOcean
```cmd
# Option 1: DigitalOcean App Platform
# 1. Connect your GitHub repository
# 2. Configure build settings
# 3. Add environment variables
# 4. Deploy

# Option 2: DigitalOcean Droplet
# 1. Create Droplet with Node.js image
# 2. Install PostgreSQL
# 3. Deploy application using PM2
# 4. Configure Nginx as reverse proxy
```

### Docker Self-Hosting
```cmd
# Create Dockerfile in project root:
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000
EXPOSE 3001

CMD ["node", "server.js"]

# Create docker-compose.yml:
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
      - "3001:3001"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://fleet_user:password@postgres:5432/fleet_management
    depends_on:
      - postgres

  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: fleet_management
      POSTGRES_USER: fleet_user
      POSTGRES_PASSWORD: password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

volumes:
  postgres_data:

# Build and run:
docker-compose up -d
```

## Maintenance & Monitoring

### Windows 11 Specific Maintenance Tasks

#### Windows Service Management
```cmd
# Check all services related to your application
net start | findstr "Fleet"
net start | findstr "PostgreSQL"
net start | findstr "Node"

# Start/Stop services
net start "FleetManagement"
net stop "FleetManagement"

# Configure service recovery options
sc failure "FleetManagement" reset= 86400 actions= restart/60000/restart/60000/restart/60000
```

#### Windows Event Log Monitoring
```cmd
# View application logs
eventvwr.msc

# Or using PowerShell:
Get-WinEvent -LogName Application -MaxEvents 100 | Where-Object {$_.Message -like "*Fleet*"}

# Create custom log source (if needed)
wevtutil qe Application /f:text | findstr "Fleet"
```

#### Windows Performance Monitoring
```cmd
# Open Performance Monitor
perfmon

# Or using command line:
typeperf "\Processor(_Total)\% Processor Time"
typeperf "\Memory\Available MBytes"
typeperf "\Process(node)\% Processor Time"
```

### Database Maintenance

#### PostgreSQL Maintenance on Windows 11
```cmd
# Vacuum and analyze tables
psql -U fleet_user -d fleet_management -c "VACUUM ANALYZE;"

# Reindex database
psql -U fleet_user -d fleet_management -c "REINDEX DATABASE fleet_management;"

# Update statistics
psql -U fleet_user -d fleet_management -c "ANALYZE;"

# Check table sizes
psql -U fleet_user -d fleet_management -c "SELECT tablename FROM pg_tables WHERE schemaname = 'public';"
```

#### Database Backup and Restore
```cmd
# Create backup
pg_dump -U fleet_user -d fleet_management > fleet_management_backup.sql

# Restore backup
psql -U fleet_user -d fleet_management < fleet_management_backup.sql

# Create compressed backup
pg_dump -U fleet_user -d fleet_management | gzip > fleet_management_backup.sql.gz

# Restore compressed backup
gunzip -c fleet_management_backup.sql.gz | psql -U fleet_user -d fleet_management
```

### Application Monitoring

#### Log Management
```cmd
# View application logs
Get-Content C:\path\to\logs\app.log -Tail 50 -Wait

# Or using PowerShell:
Get-WinEvent -LogName Application -MaxEvents 100 | Where-Object {$_.Source -like "*Node*"}

# Configure log rotation in your application
# Add to your server.js or create a separate logging configuration
```

#### Performance Monitoring
```cmd
# Monitor Node.js process
tasklist | findstr node

# Monitor memory usage
wmic process where "name='node.exe'" get WorkingSetSize,PageFileUsage

# Monitor CPU usage
wmic cpu get loadpercentage
```

### Security Updates

#### Windows 11 Updates
```cmd
# Check for Windows updates
settings://windowsupdate

# Or using PowerShell:
Get-WindowsUpdate
Install-WindowsUpdate -AcceptAll -AutoReboot
```

#### Node.js and Dependencies Updates
```cmd
# Check for outdated packages
npm outdated

# Update packages
npm update

# Update Node.js
# Download latest LTS version from https://nodejs.org/
```

## Troubleshooting

### Windows 11 Specific Issues

#### PostgreSQL Service Issues
```cmd
# Problem: PostgreSQL service won't start
# Solution:
net stop postgresql-x64-15
net start postgresql-x64-15

# Check PostgreSQL logs
type "C:\Program Files\PostgreSQL\15\data\pg_log\postgresql-*.log"

# Check port conflicts
netstat -ano | findstr :5432
```

#### Port Conflicts
```cmd
# Check which process is using a port
netstat -ano | findstr :3000
netstat -ano | findstr :3001

# Kill process using port
taskkill /PID <process_id> /F

# Or using PowerShell:
Stop-Process -Id <process_id> -Force
```

#### Node.js Issues
```cmd
# Clear Node.js cache
npm cache clean --force

# Reinstall node_modules
rm -rf node_modules
npm install

# Check Node.js version
node --version
npm --version
```

### Database Connection Issues

#### PostgreSQL Connection Problems
```cmd
# Test PostgreSQL connection
psql -U fleet_user -d fleet_management

# Check if PostgreSQL is running
net start | findstr postgres

# Check PostgreSQL logs
type "C:\Program Files\PostgreSQL\15\data\pg_log\postgresql-*.log"

# Test connection using telnet
telnet localhost 5432
```

#### Prisma Issues
```cmd
# Regenerate Prisma client
npx prisma generate

# Reset database (warning: deletes all data)
npx prisma db push --force-reset

# Check Prisma schema
npx prisma validate
```

### Build and Runtime Issues

#### Next.js Build Issues
```cmd
# Clear Next.js cache
rm -rf .next
npm run build

# Check TypeScript errors
npx tsc --noEmit

# Check for memory issues
# Increase Node.js memory limit
node --max-old-space-size=4096 node_modules/.bin/next build
```

#### Runtime Errors
```cmd
# Check application logs
npm run dev 2>&1 | tee app.log

# Debug mode
node --inspect server.js

# Or using VS Code debugger
# Set breakpoints in VS Code and press F5 to debug
```

### Authentication Issues

#### JWT Issues
```cmd
# Verify JWT secret
echo %JWT_SECRET%

# Test JWT generation
# Use JWT.io to decode and verify tokens

# Check token expiration
# Make sure JWT_EXPIRES_IN is properly set
```

#### NextAuth Issues
```cmd
# Check NextAuth configuration
# Verify NEXTAUTH_URL matches your application URL
# Verify NEXTAUTH_SECRET is properly set

# Check NextAuth logs
# Set debug mode in NextAuth configuration
```

### WebSocket Issues

#### Connection Problems
```cmd
# Check if WebSocket server is running
netstat -ano | findstr :3001

# Test WebSocket connection
# Use browser developer tools to check WebSocket connections

# Check WebSocket logs
# Look for WebSocket-related error messages in server logs
```

#### SSL/TLS Issues
```cmd
# Check SSL certificate
# Use https://www.sslshopper.com/ssl-checker.html

# Test HTTPS connection
curl -v https://your-domain.com

# Check certificate expiration
certmgr.msc
```

### Performance Issues

#### Slow Database Queries
```cmd
# Enable query logging in PostgreSQL
# Add to postgresql.conf:
# log_statement = 'all'
# log_duration = on

# Restart PostgreSQL
net stop postgresql-x64-15
net start postgresql-x64-15

# Analyze slow queries
psql -U fleet_user -d fleet_management -c "SELECT query, calls, total_time, mean_time FROM pg_stat_statements ORDER BY total_time DESC LIMIT 10;"
```

#### High Memory Usage
```cmd
# Check Node.js memory usage
wmic process where "name='node.exe'" get WorkingSetSize,PageFileUsage

# Check PostgreSQL memory usage
wmic process where "name='postgres.exe'" get WorkingSetSize,PageFileUsage

# Optimize PostgreSQL memory settings
# Adjust shared_buffers and work_mem in postgresql.conf
```

---

## Conclusion

This comprehensive guide covers everything you need to set up and deploy the Fleet Management System on Windows 11 with PostgreSQL. The project is ready to use and includes all necessary files and configurations. Remember to:

1. Always use strong secrets for production environments
2. Keep your dependencies updated
3. Monitor your application and database performance
4. Set up regular backups
5. Follow security best practices

For additional support or questions, refer to the official documentation for each technology stack component.