// API Gateway
// Purpose: Proxy requests to the disaster service.

// src/middleware/apiGateway.js
console.log('Loading apiGateway.js');
import express from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';

const router = express.Router();

console.log('API_GATEWAY_URL:', process.env.API_GATEWAY_URL);
const target = process.env.API_GATEWAY_URL;

if (!target) {
  throw new Error('Missing API_GATEWAY_URL environment variable');
}

const apiProxy = createProxyMiddleware({
  target,
  changeOrigin: true,
  pathRewrite: {
    '^/api': '', // remove base path
  },
});

router.use('/api', apiProxy);

export default router;