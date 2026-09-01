# SAMS Mobile App

NU Student Assistants Management System — React Native mobile app built with Expo.

## Quick Setup

### 1. Install mobile dependencies

```bash
npm install
```

### 2. Start the backend server (in a separate terminal)

```bash
npm run start-backend
```

This starts a PHP development server at `http://localhost:8000` (accessible as `http://192.168.1.7:8000` on the network).

### 3. Start the mobile app

```bash
npm start
```

Then press:

- `a` for Android emulator
- `i` for iOS simulator
- `w` for web
- `j` to open debugger

## Backend Setup

The mobile app requires the `sams-backend` PHP server to be running.

### Option A: PHP Built-in Server (Easiest for Development)

```bash
npm run start-backend
```

- Server runs at `http://localhost:8000`
- Accessible on network as `http://192.168.1.7:8000`
- No additional software needed

### Option B: Apache/Nginx (For Production)

1. Configure a virtual host or alias for `sams-backend` folder
2. Ensure PHP is installed and enabled
3. Update `constants/api.ts` to use: `http://192.168.1.7/sams-backend`

## Network Configuration

The app is configured to connect to: **http://192.168.1.7:8000**

If your machine's IP is different, update [constants/api.ts](constants/api.ts):

```typescript
export const API_BASE_URL = "http://YOUR_IP:8000";
```

To find your IP on Windows:

```powershell
ipconfig
# Look for "IPv4 Address" (usually 192.168.x.x or 10.x.x.x)
```

## Testing on Physical Device

1. Ensure phone and development machine are on the same WiFi network
2. Backend server must be running: `npm run start-backend`
3. Update API URL in `constants/api.ts` to your actual machine IP
4. In Expo, scan the QR code from your phone

## Troubleshooting

### Network Timeout Error

See [NETWORK_TROUBLESHOOTING.md](NETWORK_TROUBLESHOOTING.md) for detailed diagnostics and solutions.

### Backend Not Accessible

1. Verify PHP is installed: `php --version`
2. Backend server is running: `npm run start-backend`
3. Firewall allows port 8000
4. Phone/emulator can reach your machine's IP

## Environment Variables

Backend configuration is in `sams-backend/.env` (copy from `.env.example`):

- `SAMS_SMTP_HOST`, `SAMS_SMTP_PORT`, `SAMS_SMTP_USER`, `SAMS_SMTP_PASSWORD` — email settings
- `SAMS_SMTP_FROM` — sender email address
- `SAMS_OTP_DEBUG` — set to `true` to skip SMTP and return test codes

## Development

- **Mobile code:** `app/` directory (Expo Router file-based routing)
- **Backend code:** `sams-backend/` directory (PHP)
- **Styles:** Inline StyleSheets (React Native)
- **Icons:** [lucide-react-native](https://lucide.dev)

## Learn More

- [Expo Documentation](https://docs.expo.dev/)
- [React Native](https://reactnative.dev/)
- [File-based routing](https://docs.expo.dev/router/introduction/)
