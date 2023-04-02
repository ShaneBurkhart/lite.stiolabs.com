const http = require('http');
const https = require('https');
const httpProxy = require('http-proxy');
const fs = require('fs');
const uuid = require('uuid');
const serveStatic = require('serve-static');
const querystring = require('querystring');

const staticMiddleware = serveStatic('/monorepo_logs');

function parseCookies(cookieHeader) {
  const cookies = {};
  if (cookieHeader) {
    const cookieStrings = cookieHeader.split(';');
    cookieStrings.forEach((cookieString) => {
      const parts = cookieString.trim().split('=');
      const key = parts[0];
      const value = parts[1] ? decodeURIComponent(parts[1]) : '';
      cookies[key] = value;
    });
  }
  return cookies;
}

const options = {
  key: fs.readFileSync('/data/live/shane.stiolabs.com/privkey.pem'),
  cert: fs.readFileSync('/data/live/shane.stiolabs.com/fullchain.pem')
};

const DOMAIN = process.env.STIO_DOMAIN || 'shaneburkhart.com'
const USER = process.env.STIO_USER || 'shane'
const PROXIES = {
	// app: 'https://next:3000',
	dozzle: 'http://dozzle:8080',
	prisma: 'http://prisma:5555',
	diagrams: 'http://diagrams:80',
	lite_stiolabs: 'http://next:3000',
}
console.log('PROXIES', DOMAIN, USER, PROXIES);
const DASHBOARD = 'http://monorepo:3000';

const COOKIE_NAME = 'myCookie';
const AUTH_UUID = process.env.MONOREPO_SECRET;
if (!uuid.validate(AUTH_UUID)) {
  throw new Error('Invalid UUID');
}

// Create a proxy server instance
const proxy = httpProxy.createProxyServer({ ws: true });

// Create an HTTP server that handles incoming requests
const httpServer = http.createServer((req, res) => {
	console.log('redirecting to https');
  res.writeHead(301, { "Location": "https://" + req.headers.host + req.url });
  res.end();
});

// Create an HTTP server that handles incoming requests
const httpsServer = https.createServer(options, (req, res) => {
	const host = req.headers.host;
	const parts = host.split('.');

	let subdomain;
	let user;
	let domain;
	if (parts.length === 3) {
		subdomain = null;
		user = parts[0];
		domain = parts[1] + '.' + parts[2];
	} else if (parts.length === 4) {
		subdomain = parts[0];
		user = parts[1];
		domain = parts[2] + '.' + parts[3];
	} else {
		res.writeHead(404);
		res.end();
		return;
	}

	if (domain !== DOMAIN || user !== USER) {
		console.log('Invalid domain', domain, DOMAIN, user, USER);
		res.writeHead(404);
		res.end();
		return;
	}

  // Handle authentication
  if (subdomain === AUTH_UUID) {
    res.setHeader('Set-Cookie', `${COOKIE_NAME}=${AUTH_UUID}; Domain=.${DOMAIN}; Path=/;`);
    res.writeHead(302, { 'Location': `https://${user}.${DOMAIN}` });
    res.end();
    return;
  }

  // Check for authentication cookie
  const cookies = parseCookies(req.headers.cookie);
  if (!cookies[COOKIE_NAME] || cookies[COOKIE_NAME] !== AUTH_UUID) {
		console.log("Click here to authenticate: https://" + AUTH_UUID + "." + user + "." + DOMAIN)
		res.writeHead(401);
    res.end();
    return;
  }

	if (subdomain) {
		// serve static logs 
		if (subdomain === 'monorepo_logs') {
			staticMiddleware(req, res, () => {
				res.writeHead(404);
				res.end();
			});
			return;
		}

		const target = PROXIES[subdomain];
		if (!target) {
			res.writeHead(404);
			res.end();
			return;
		}

		proxy.web(req, res, { target });
	} else {
		proxy.web(req, res, { target: DASHBOARD });
	}
});

// Listen on port 80 for HTTP traffic
httpServer.listen(80, () => {
  console.log('HTTP Server listening on port 80');
});

// Listen on port 443 for HTTPS traffic
httpsServer.listen(443, () => {
  console.log('Server listening on port 443');
});

// Handle WebSocket connections
httpsServer.on('upgrade', (req, socket, head) => {
	const host = req.headers.host;
	const parts = host.split('.');

	let subdomain;
	let user;
	let domain;
	if (parts.length === 3) {
		subdomain = null;
		user = parts[0];
		domain = parts[1] + '.' + parts[2];
	} else if (parts.length === 4) {
		subdomain = parts[0];
		user = parts[1];
		domain = parts[2] + '.' + parts[3];
	} else {
		res.writeHead(404);
		res.end();
		return;
	}

	if (domain !== DOMAIN || user !== USER) {
    socket.destroy();
		return;
	}

	if (subdomain) {
		const target = PROXIES[subdomain];
		if (!target) {
			socket.destroy();
			return;
		}

		console.log(subdomain + ' -> ' + target);
    proxy.ws(req, socket, head, { target: target.replace('https', 'ws') });
	} else {
		console.log(user + ' -> ' + DASHBOARD);
    proxy.ws(req, socket, head, { target: DASHBOARD.replace('https', 'ws') });
	}
});