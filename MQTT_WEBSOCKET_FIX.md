# MQTT WebSocket Connection Fix

## Problem
When deploying to production (HTTPS), WebSocket connections to Mosquitto broker failed with:
```
WebSocket connection to 'wss://test.mosquitto.org:8080/' failed
```

## Root Cause
The Mosquitto WebSocket broker requires `/mqtt` path in the URL:
- ❌ **Wrong:** `wss://test.mosquitto.org:8080/`
- ✅ **Correct:** `wss://test.mosquitto.org:8081/mqtt`

## Solution Applied

### 1. Backend Changes

#### `config/mqtt.php`
Added WebSocket path configuration:
```php
'websocket' => [
    'enabled' => env('MQTT_WEBSOCKET_ENABLED', true),
    'port' => env('MQTT_WEBSOCKET_PORT', 8080),
    'protocol' => env('MQTT_WEBSOCKET_PROTOCOL', ''), // Auto-detect
    'path' => env('MQTT_WEBSOCKET_PATH', '/mqtt'),    // NEW: WebSocket path
],
```

#### `app/Http/Controllers/api/v1/MqttIotDeviceController.php`
Updated `getBrokerInfo()` method to include WebSocket path:
```php
public function getBrokerInfo(): JsonResponse
{
    // ... existing code ...
    
    $path = $config['websocket']['path'] ?? '/mqtt';
    
    return response()->json([
        'broker' => [
            'host' => $config['broker']['host'],
            'port' => $port,
            'protocol' => $protocol,
            'path' => $path,  // NEW: Include WebSocket path
            // ... other fields ...
        ],
    ]);
}
```

### 2. Frontend Changes

#### `resources/js/hooks/useMqttClient.ts`
Updated interface and URL construction:
```typescript
export interface MqttBrokerConfig {
    host: string;
    port: number;
    protocol: 'ws' | 'wss' | 'mqtt' | 'mqtts';
    path?: string;  // NEW: Optional WebSocket path
    username?: string;
    password?: string;
    clientId?: string;
}

// In connect() function:
const { host, port, protocol, path, username, password } = mqttConfig;
const brokerUrl = `${protocol}://${host}:${port}${path || ''}`;  // NEW: Append path
```

#### `resources/js/components/incubator/MqttIotDeviceControl.tsx`
Updated broker config to include path from API:
```typescript
const config: MqttBrokerConfig = {
    host: data.broker.host,
    port: data.broker.port,
    protocol: data.broker.protocol as 'ws' | 'wss' | 'mqtt' | 'mqtts',
    path: data.broker.path,  // NEW: Include path from API
    username: data.broker.use_credentials ? data.broker.username : undefined,
};
```

## Environment Variables

Add to your `.env` file (optional, defaults are set):
```env
MQTT_WEBSOCKET_PATH=/mqtt
```

## How It Works

### Auto-Detection Logic
1. **Protocol Detection:**
   - HTTPS → uses `wss`
   - HTTP → uses `ws`

2. **Port Selection:**
   - `wss` → port 8081 (secure WebSocket)
   - `ws` → port 8080 (standard WebSocket)

3. **Path Appended:**
   - Final URL: `wss://test.mosquitto.org:8081/mqtt`

### Connection Flow
```
Production (HTTPS):
Request → Auto-detect → protocol: wss → port: 8081 → path: /mqtt
Result: wss://test.mosquitto.org:8081/mqtt ✅

Local Development (HTTP):
Request → Auto-detect → protocol: ws → port: 8080 → path: /mqtt
Result: ws://test.mosquitto.org:8080/mqtt ✅
```

## Verification

### Browser Console
After deploying, check browser console for:
```javascript
Connecting to MQTT broker: wss://test.mosquitto.org:8081/mqtt
MQTT: Connected to broker
```

### Common Issues Fixed
- ❌ Port 8080 used with wss → ✅ Auto-switches to 8081
- ❌ Missing `/mqtt` path → ✅ Added from config
- ❌ Hardcoded protocol → ✅ Auto-detects based on HTTPS/HTTP

## Deployment Guide Updated

Updated `LARAVEL_CLOUD_DEPLOYMENT.md` with:
- Environment variable configuration for WebSocket path
- Troubleshooting section for WebSocket connection failures
- Expected URLs for development vs production

## Files Modified
1. `config/mqtt.php` - Added `websocket.path` configuration
2. `app/Http/Controllers/api/v1/MqttIotDeviceController.php` - Return path in broker info
3. `resources/js/hooks/useMqttClient.ts` - Support path in broker config and URL
4. `resources/js/components/incubator/MqttIotDeviceControl.tsx` - Include path from API
5. `LARAVEL_CLOUD_DEPLOYMENT.md` - Updated deployment guide

## Testing
1. Clear browser cache and localStorage
2. Reload the application
3. Navigate to incubator control page
4. Check browser console for successful connection
5. Verify MQTT data is flowing

## Next Steps
1. Deploy updated code to production
2. Verify WebSocket connection succeeds
3. Monitor MQTT connectivity in production
4. Test device data synchronization
