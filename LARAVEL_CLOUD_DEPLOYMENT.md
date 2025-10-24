# Laravel Cloud Deployment Guide

## PoultriInnox - Laravel Cloud Hosting Commands

This document contains the essential commands for deploying PoultriInnox on **Laravel Cloud** (https://cloud.laravel.com/).

---

## Initial Deployment

### 1. Connect Repository
```bash
# Laravel Cloud will automatically connect to your GitHub repository
# Repository: Afriinnox-Ltd/PoultriInnox
# Branch: mkp (or your production branch)
```

### 2. Environment Variables
Configure these in Laravel Cloud Dashboard → Your Project → Environment:

```env
APP_NAME=PoultriInnox
APP_ENV=production
APP_DEBUG=false
APP_URL=https://your-app.laravel.app

DB_CONNECTION=mysql
DB_HOST=<provided-by-laravel-cloud>
DB_PORT=3306
DB_DATABASE=<provided-by-laravel-cloud>
DB_USERNAME=<provided-by-laravel-cloud>
DB_PASSWORD=<provided-by-laravel-cloud>

CACHE_STORE=redis
QUEUE_CONNECTION=redis
SESSION_DRIVER=redis

REDIS_HOST=<provided-by-laravel-cloud>
REDIS_PASSWORD=<provided-by-laravel-cloud>
REDIS_PORT=6379

MAIL_MAILER=smtp
MAIL_HOST=<your-smtp-host>
MAIL_PORT=587
MAIL_USERNAME=<your-email>
MAIL_PASSWORD=<your-email-password>
MAIL_FROM_ADDRESS=noreply@yourdomain.com
MAIL_FROM_NAME="${APP_NAME}"

# MQTT/IoT Configuration (WebSocket Support)
MQTT_HOST=test.mosquitto.org
MQTT_WEBSOCKET_ENABLED=true
MQTT_WEBSOCKET_PORT=8080
MQTT_WEBSOCKET_PROTOCOL=
MQTT_WEBSOCKET_PATH=/mqtt
```

### 3. Build Commands
Configure in Laravel Cloud Dashboard → Your Project → Build Commands:

```bash
composer install --optimize-autoloader --no-dev
npm ci
npm run build
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan event:cache
```

### 4. Deploy Commands
Configure in Laravel Cloud Dashboard → Your Project → Deploy Commands:

```bash
php artisan migrate --force
php artisan storage:link
```

---

## Background Services Configuration

### Queue Worker
Laravel Cloud Dashboard → Your Project → Daemons → Add Daemon:

**Name:** Queue Worker  
**Command:**
```bash
php artisan queue:work --daemon --tries=3 --timeout=90 --sleep=3
```
**Instances:** 2

---

### MQTT Listener (Critical for IoT)
Laravel Cloud Dashboard → Your Project → Daemons → Add Daemon:

**Name:** MQTT Listener  
**Command:**
```bash
php artisan mqtt:listen
```
**Instances:** 1

---

### Scheduler
Laravel Cloud automatically handles `php artisan schedule:run`.

**Scheduled Tasks Include:**
- Batch Completion Check: Runs at 8:00 AM, 12:00 PM, 4:00 PM daily
- Automatically transitions batch status when incubation period ends

---

## Post-Deployment

### First Time Setup
Run these commands once via Laravel Cloud Dashboard → Your Project → Terminal:

```bash
# Run database migrations
php artisan migrate --force

# Run seeders (if needed)
php artisan db:seed --force

# Create storage symlink
php artisan storage:link

# Clear and cache configs
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

---

## Updating Deployment

### Automatic Deployment
When you push to your connected branch (`mkp`), Laravel Cloud will automatically:
1. Pull latest code
2. Run build commands
3. Run deploy commands
4. Restart daemons

### Manual Commands (if needed)
Via Laravel Cloud Terminal:

```bash
# Clear all caches
php artisan cache:clear
php artisan config:clear
php artisan route:clear
php artisan view:clear

# Rebuild caches
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan event:cache

# Run migrations
php artisan migrate --force

# Restart queue workers
php artisan queue:restart
```

---

## Monitoring

### View Logs
Laravel Cloud Dashboard → Your Project → Logs

### Check Queue Status
```bash
php artisan queue:monitor
```

### Check Batch Completion
```bash
php artisan batch:check-completion
```

### Verify MQTT Connection
Check logs for MQTT listener status and IoT device communication.

---

## Critical Daemons Checklist

Ensure these daemons are running in Laravel Cloud:

- ✅ **Queue Worker** - Handles async jobs
- ✅ **MQTT Listener** - Handles IoT device communication (device ID: BROODIINNOX-001)
- ✅ **Scheduler** - Runs batch completion checks and status transitions

---

## Troubleshooting

### Queue Not Processing
```bash
php artisan queue:restart
```

### MQTT Not Connecting
Check logs and verify MQTT broker is accessible:
- Broker: test.mosquitto.org
- Topic: broodinnox/BROODIINNOX-001/*

### WebSocket Connection Failures in Production
If you see errors like `WebSocket connection to 'wss://test.mosquitto.org:8080/' failed`:

**Problem:** Mosquitto WebSocket broker requires `/mqtt` path in the URL.

**Solution:** Ensure these environment variables are set:
```env
MQTT_WEBSOCKET_PATH=/mqtt
MQTT_WEBSOCKET_PROTOCOL=
```

The system will auto-detect protocol:
- `ws://test.mosquitto.org:8080/mqtt` for HTTP (local development)
- `wss://test.mosquitto.org:8081/mqtt` for HTTPS (production)

**Verify in browser console:**
- Connection URL should be: `wss://test.mosquitto.org:8081/mqtt` (NOT `wss://test.mosquitto.org:8080/`)

### Cache Issues
```bash
php artisan cache:clear
php artisan config:clear
```

### Database Connection Issues
Verify environment variables in Laravel Cloud dashboard match provided credentials.

---

## Important Notes

1. **MQTT Listener Must Run**: The IoT incubator devices require the MQTT listener daemon to sync data.
2. **Queue Worker Required**: Many operations (notifications, batch processing) use queues.
3. **Scheduler Enabled**: Automatic batch status transitions depend on the scheduler.
4. **Redis Required**: Used for cache, sessions, and queue driver.
5. **Build Assets**: Always run `npm run build` before deployment to compile React frontend.

---

## Environment-Specific Settings

### Production Checklist
- ✅ `APP_ENV=production`
- ✅ `APP_DEBUG=false`
- ✅ `APP_URL` set to your domain
- ✅ `CACHE_STORE=redis`
- ✅ `QUEUE_CONNECTION=redis`
- ✅ `SESSION_DRIVER=redis`
- ✅ All caches enabled (config, route, view, event)

---

## Support

For Laravel Cloud specific issues, visit: https://cloud.laravel.com/docs
