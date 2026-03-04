const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const app = express();

app.use((req, res, next) => {
    //console.log(`[Proxy] Incoming: ${req.url}`);
    next();
});


app.use('/api', createProxyMiddleware({ 
    target: 'http://localhost:3001', 
    changeOrigin: true,
    
    onProxyReq: (proxyReq) => console.log(`[Proxy] Routing to API: ${proxyReq.path}`)
}));

app.use('/', createProxyMiddleware({ 
    target: 'http://localhost:5173', 
    changeOrigin: true,
    ws: true 
}));

app.listen(8080, () => console.log('Proxy active on 8080'));