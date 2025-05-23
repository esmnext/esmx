// 该文件用于设置一个简单的代理服务器，将 :3001 的流量代理到 :3000
// 用于模拟不同域的情况

import express from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';

const app = express();

app.use(
    '/',
    createProxyMiddleware({
        target: 'http://localhost:3000',
        changeOrigin: true
    })
);

// 启动服务器
const PORT = 3001;
app.listen(PORT, () => {
    console.log(`Proxy server is running on http://localhost:${PORT}`);
});
