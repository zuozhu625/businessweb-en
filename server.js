const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
const path = require('path');
const app = express();

// 启用CORS
app.use(cors());
app.use(express.json());

// 获取当前文件的绝对路径
const currentDir = __dirname;
console.log('当前目录:', currentDir);

// 静态文件服务
app.use(express.static(currentDir));

// 添加调试中间件
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
});

// 错误处理中间件
app.use((err, req, res, next) => {
    console.error('服务器错误:', err);
    res.status(500).send('服务器内部错误');
});

// 代理邮件发送请求
app.post('/api/send-email', async (req, res) => {
    try {
        console.log('收到邮件发送请求:', req.body);

        const response = await fetch('https://qikaka625.app.n8n.cloud/webhook/email', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'User-Agent': 'node-fetch/1.0 (+https://github.com/bitinn/node-fetch)'
            },
            body: JSON.stringify(req.body)
        });

        console.log('n8n服务器响应状态:', response.status);
        const data = await response.json();
        console.log('n8n服务器响应数据:', data);

        if (!response.ok) {
            throw new Error(`n8n服务器返回错误: ${response.status}`);
        }

        res.json(data);
    } catch (error) {
        console.error('代理服务器错误:', error);
        res.status(500).json({ 
            error: '邮件发送失败',
            details: error.message
        });
    }
});

// 添加根路由
app.get('/', (req, res) => {
    console.log('访问根路径');
    const indexPath = path.join(currentDir, 'index.html');
    console.log('尝试访问文件:', indexPath);
    
    // 检查文件是否存在
    const fs = require('fs');
    if (!fs.existsSync(indexPath)) {
        console.error('index.html文件不存在');
        return res.status(404).send('index.html文件不存在');
    }

    res.sendFile(indexPath, (err) => {
        if (err) {
            console.error('发送文件时出错:', err);
            res.status(500).send('Error loading index.html');
        }
    });
});

// 处理404错误
app.use((req, res) => {
    console.log('404 - 未找到页面:', req.url);
    res.status(404).send('页面未找到');
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`代理服务器运行在 http://localhost:${PORT}`);
    console.log('当前工作目录:', currentDir);
    console.log('index.html路径:', path.join(currentDir, 'index.html'));
});