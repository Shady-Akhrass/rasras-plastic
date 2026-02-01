# Production Deployment Guide - RasRas Plastics ERP

## Prerequisites
- Ubuntu/Debian VPS with root access
- Domain name pointed to your VPS IP
- Java 17 installed
- Node.js 18+ installed
- Nginx installed

## Step 1: Install Required Software

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Java 17
sudo apt install openjdk-17-jdk -y

# Install Node.js (using NodeSource)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Install Nginx
sudo apt install nginx -y

# Install Certbot for SSL (Let's Encrypt)
sudo apt install certbot python3-certbot-nginx -y
```

## Step 2: Build the Application

### Build Backend
```bash
cd /path/to/backend
./mvnw clean package -DskipTests
# JAR file will be in target/erp-1.0.0-SNAPSHOT.jar
```

### Build Frontend
```bash
cd /path/to/frontend
npm install
npm run build
# Build output will be in dist/
```

## Step 3: Deploy Application Files

```bash
# Create application directories
sudo mkdir -p /opt/rasrasplastics/backend
sudo mkdir -p /var/www/rasrasplastics/frontend

# Copy backend JAR
sudo cp target/erp-1.0.0-SNAPSHOT.jar /opt/rasrasplastics/backend/app.jar

# Copy frontend build
sudo cp -r dist/* /var/www/rasrasplastics/frontend/

# Set permissions
sudo chown -R www-data:www-data /var/www/rasrasplastics
sudo chown -R $USER:$USER /opt/rasrasplastics
```

## Step 4: Create Systemd Service for Backend

Create file: `/etc/systemd/system/rasrasplastics.service`

```ini
[Unit]
Description=RasRas Plastics ERP Backend
After=network.target

[Service]
Type=simple
User=rasrasplastics
WorkingDirectory=/opt/rasrasplastics/backend
ExecStart=/usr/bin/java -jar \
    -Xms512m -Xmx2g \
    -Dspring.profiles.active=production \
    /opt/rasrasplastics/backend/app.jar

# Logging
StandardOutput=journal
StandardError=journal
SyslogIdentifier=rasrasplastics

# Security
NoNewPrivileges=true
PrivateTmp=true
ProtectSystem=strict
ProtectHome=true
ReadWritePaths=/opt/rasrasplastics

# Restart policy
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

### Create service user
```bash
sudo useradd -r -s /bin/false rasrasplastics
sudo chown -R rasrasplastics:rasrasplastics /opt/rasrasplastics
```

### Enable and start service
```bash
sudo systemctl daemon-reload
sudo systemctl enable rasrasplastics
sudo systemctl start rasrasplastics
sudo systemctl status rasrasplastics
```

## Step 5: Configure Nginx

### Update the nginx-production.conf file
```bash
# Edit the configuration file
sudo nano nginx-production.conf
```

Replace the following placeholders:
- `your-domain.com` → Your actual domain (e.g., rasrasplastics.com)
- `/path/to/your/ssl/cert.pem` → Your SSL certificate path
- `/path/to/your/ssl/key.pem` → Your SSL key path
- `/path/to/your/ssl/chain.pem` → Your SSL chain path

### Copy to nginx sites-available
```bash
sudo cp nginx-production.conf /etc/nginx/sites-available/rasrasplastics
sudo ln -s /etc/nginx/sites-available/rasrasplastics /etc/nginx/sites-enabled/
```

### Remove default nginx config
```bash
sudo rm /etc/nginx/sites-enabled/default
```

### Test nginx configuration
```bash
sudo nginx -t
```

## Step 6: Obtain SSL Certificate

### Using Let's Encrypt (Recommended)
```bash
# First, temporarily modify nginx config to allow HTTP for verification
sudo certbot --nginx -d your-domain.com -d www.your-domain.com

# OR manually obtain certificate
sudo certbot certonly --nginx -d your-domain.com -d www.your-domain.com
```

### Update nginx config with certificate paths
After obtaining SSL certificate, update these lines in nginx config:
```nginx
ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;
ssl_trusted_certificate /etc/letsencrypt/live/your-domain.com/chain.pem;
```

### Auto-renewal
```bash
# Test renewal
sudo certbot renew --dry-run

# Certbot auto-renewal is usually set up automatically
sudo systemctl status certbot.timer
```

## Step 7: Start Nginx

```bash
sudo systemctl reload nginx
sudo systemctl enable nginx
sudo systemctl status nginx
```

## Step 8: Configure Firewall

```bash
# Allow HTTP, HTTPS, and SSH
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
sudo ufw status
```

## Step 9: Application Configuration

Create production application properties at `/opt/rasrasplastics/backend/application-production.properties`:

```properties
# Server Configuration
server.port=8080
server.address=127.0.0.1

# Database Configuration (update with your DB details)
spring.datasource.url=jdbc:postgresql://localhost:5432/rasrasplastics
spring.datasource.username=rasrasplastics_user
spring.datasource.password=YOUR_SECURE_PASSWORD

# JPA Configuration
spring.jpa.hibernate.ddl-auto=validate
spring.jpa.show-sql=false
spring.jpa.properties.hibernate.format_sql=false

# Logging
logging.level.root=WARN
logging.level.com.rasras=INFO
logging.file.name=/var/log/rasrasplastics/application.log

# Security
jwt.secret=YOUR_SUPER_SECRET_JWT_KEY_AT_LEAST_256_BITS
jwt.expiration=86400000

# CORS (adjust as needed)
cors.allowed-origins=https://your-domain.com,https://www.your-domain.com

# File Upload
spring.servlet.multipart.max-file-size=50MB
spring.servlet.multipart.max-request-size=50MB

# Actuator
management.endpoints.web.exposure.include=health,info
management.endpoint.health.show-details=when-authorized
```

## Step 10: Monitoring and Logs

### View application logs
```bash
# System logs
sudo journalctl -u rasrasplastics -f

# Application log file
sudo tail -f /var/log/rasrasplastics/application.log

# Nginx logs
sudo tail -f /var/log/nginx/rasrasplastics_access.log
sudo tail -f /var/log/nginx/rasrasplastics_error.log
```

### Check service status
```bash
sudo systemctl status rasrasplastics
sudo systemctl status nginx
```

## Step 11: Database Setup (PostgreSQL Example)

```bash
# Install PostgreSQL
sudo apt install postgresql postgresql-contrib -y

# Create database and user
sudo -u postgres psql

CREATE DATABASE rasrasplastics;
CREATE USER rasrasplastics_user WITH ENCRYPTED PASSWORD 'YOUR_SECURE_PASSWORD';
GRANT ALL PRIVILEGES ON DATABASE rasrasplastics TO rasrasplastics_user;
\q
```

## Troubleshooting

### Backend not starting
```bash
sudo journalctl -u rasrasplastics -n 100
```

### Nginx errors
```bash
sudo nginx -t
sudo tail -f /var/log/nginx/error.log
```

### Permission issues
```bash
sudo chown -R rasrasplastics:rasrasplastics /opt/rasrasplastics
sudo chown -R www-data:www-data /var/www/rasrasplastics
```

### Check if backend is running
```bash
curl http://localhost:8080/api/actuator/health
```

### Check if nginx is proxying correctly
```bash
curl -I https://your-domain.com/health
```

## Security Checklist

- [ ] SSL certificate installed and auto-renewal configured
- [ ] Firewall configured (only ports 22, 80, 443 open)
- [ ] Strong database password set
- [ ] JWT secret key changed to secure random value
- [ ] Swagger UI disabled or password protected in production
- [ ] Database backups configured
- [ ] Application logs rotation configured
- [ ] Security headers enabled in nginx
- [ ] Rate limiting configured
- [ ] CORS properly configured

## Maintenance

### Update application
```bash
# Stop service
sudo systemctl stop rasrasplastics

# Backup current version
sudo cp /opt/rasrasplastics/backend/app.jar /opt/rasrasplastics/backend/app.jar.backup

# Deploy new version
sudo cp target/erp-1.0.0-SNAPSHOT.jar /opt/rasrasplastics/backend/app.jar

# Start service
sudo systemctl start rasrasplastics
sudo systemctl status rasrasplastics
```

### Update frontend
```bash
# Build new version
npm run build

# Backup current version
sudo mv /var/www/rasrasplastics/frontend /var/www/rasrasplastics/frontend.backup

# Deploy new version
sudo mkdir /var/www/rasrasplastics/frontend
sudo cp -r dist/* /var/www/rasrasplastics/frontend/
sudo chown -R www-data:www-data /var/www/rasrasplastics/frontend

# Clear nginx cache (if enabled)
sudo systemctl reload nginx
```

## Performance Tuning

### Optimize JVM settings
Edit `/etc/systemd/system/rasrasplastics.service`:
```ini
ExecStart=/usr/bin/java -jar \
    -Xms1g -Xmx2g \
    -XX:+UseG1GC \
    -XX:MaxGCPauseMillis=200 \
    -Dspring.profiles.active=production \
    /opt/rasrasplastics/backend/app.jar
```

### Enable nginx caching (optional)
Add to nginx config:
```nginx
proxy_cache_path /var/cache/nginx levels=1:2 keys_zone=api_cache:10m max_size=100m inactive=60m;
```

## Backup Strategy

Create backup script `/opt/rasrasplastics/backup.sh`:
```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/opt/backups/rasrasplastics"

# Create backup directory
mkdir -p $BACKUP_DIR

# Backup database
sudo -u postgres pg_dump rasrasplastics | gzip > $BACKUP_DIR/db_$DATE.sql.gz

# Backup application files
tar -czf $BACKUP_DIR/app_$DATE.tar.gz /opt/rasrasplastics

# Delete backups older than 30 days
find $BACKUP_DIR -type f -mtime +30 -delete

echo "Backup completed: $DATE"
```

Setup cron job:
```bash
sudo crontab -e
# Add: 0 2 * * * /opt/rasrasplastics/backup.sh
```
