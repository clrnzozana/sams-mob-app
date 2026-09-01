# Network Timeout Troubleshooting

The app is timing out when trying to reach the backend server. Here's how to diagnose and fix it:

## 1. Verify Backend Server is Running

### If using PHP built-in server:

```bash
cd sams-backend
php -S localhost:8000
```

Visit: `http://localhost:8000/health.php` in a browser to verify it responds.

### If using Apache/Nginx:

Ensure the web server is running and the `sams-backend` folder is accessible.

## 2. Check Your Machine's IP Address

The app is configured to connect to: **http://192.168.1.7/sams-backend**

This IP address must match your development machine's actual network IP.

### Find your actual IP:

**Windows (PowerShell):**

```powershell
ipconfig
```

Look for "IPv4 Address" under your network adapter (typically starts with 192.168.x.x or 10.x.x.x)

**Mac/Linux:**

```bash
ifconfig
# or
hostname -I
```

## 3. Update the API URL (if needed)

If your IP address is different, update [constants/api.ts](constants/api.ts):

```typescript
export const API_BASE_URL = "http://YOUR_ACTUAL_IP/sams-backend";
```

Replace `YOUR_ACTUAL_IP` with the IP from step 2. Rebuild the app after changing this.

## 4. Test Backend Connectivity

From your phone/emulator, try opening this in a browser:

```
http://YOUR_ACTUAL_IP/sams-backend/health.php
```

You should see:

```json
{ "status": "ok", "service": "NU SAMS Mobile Backend", "timestamp": "..." }
```

## 5. Check Network/Firewall

- Ensure the phone/emulator is on the **same WiFi network** as the development machine
- Windows Firewall: Allow the PHP/web server through the firewall
- Router: Some networks block local device communication (check router settings)

## 6. Verify SMTP Configuration (if email sending is hanging)

If the login request times out during email sending:

- Ensure `SAMS_SMTP_HOST`, `SAMS_SMTP_USER`, `SAMS_SMTP_PASSWORD` are configured
- Or set `SAMS_OTP_DEBUG=true` to skip email and return test code in response

## Need More Help?

1. What's your actual machine IP? (`ipconfig` on Windows)
2. Is the backend server running? (Test with `health.php`)
3. Can you reach the health endpoint from your phone's browser?
4. What error message do you see exactly?
