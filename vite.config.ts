import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import os from 'os';
import { defineConfig, Plugin } from 'vite';

interface AccessLog {
  id: string;
  timestamp: string;
  ip: string;
  method: string;
  url: string;
  userAgent: string;
}

const serverStartTime = new Date();
const accessLogs: AccessLog[] = [];
let totalRequests = 0;

function getNetworkIPs(): string[] {
  const ips: string[] = ['http://localhost:3000'];
  const interfaces = os.networkInterfaces();
  for (const devName in interfaces) {
    const iface = interfaces[devName];
    if (!iface) continue;
    for (const alias of iface) {
      if (alias.family === 'IPv4' && !alias.internal) {
        ips.push(`http://${alias.address}:3000`);
      }
    }
  }
  return ips;
}

function serverStatusLoggerPlugin(): Plugin {
  return {
    name: 'vite-plugin-server-status-logger',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (!req.url) {
          return next();
        }

        // Handle API endpoint for server status & client IPs
        if (req.url === '/api/server-status') {
          const uniqueIPs = Array.from(new Set(accessLogs.map((l) => l.ip)));
          const uptimeSeconds = Math.floor((Date.now() - serverStartTime.getTime()) / 1000);
          
          res.setHeader('Content-Type', 'application/json');
          res.setHeader('Access-Control-Allow-Origin', '*');
          res.end(
            JSON.stringify({
              status: 'ONLINE',
              serverStartTime: serverStartTime.toISOString(),
              uptimeSeconds,
              port: 3000,
              networkIPs: getNetworkIPs(),
              totalRequests,
              uniqueIPsCount: uniqueIPs.length,
              uniqueIPs,
              recentLogs: accessLogs.slice(0, 30),
            })
          );
          return;
        }

        // Ignore static assets hot-reload noises for clean logs
        const isStaticAsset = req.url.match(/\.(svg|png|jpg|css|js|map|json|ico|woff2?)$/i) || req.url.includes('/@');

        if (!isStaticAsset) {
          totalRequests++;
          let clientIp = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '127.0.0.1';
          if (clientIp.includes('::ffff:')) {
            clientIp = clientIp.replace('::ffff:', '');
          }
          if (clientIp === '::1') {
            clientIp = '127.0.0.1';
          }

          const now = new Date();
          const timeStr = now.toLocaleTimeString('zh-TW', { hour12: false });
          const logEntry: AccessLog = {
            id: Math.random().toString(36).substring(2, 9),
            timestamp: timeStr,
            ip: clientIp,
            method: req.method || 'GET',
            url: req.url,
            userAgent: (req.headers['user-agent'] as string) || 'Browser/Client',
          };

          // Store in ring buffer (max 100 entries)
          accessLogs.unshift(logEntry);
          if (accessLogs.length > 100) {
            accessLogs.pop();
          }

          // Terminal console stdout output for instant monitoring
          console.log(`\x1b[32m[ArchSystems 伺服器存取] \x1b[36m${timeStr}\x1b[0m | 連入 IP: \x1b[33m${clientIp}\x1b[0m | ${req.method} ${req.url}`);
        }

        next();
      });
    },
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), serverStatusLoggerPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
