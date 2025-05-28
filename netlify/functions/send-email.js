const fetch = require('node-fetch');

exports.handler = async function(event, context) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }
  
  try {
    const body = JSON.parse(event.body);
    console.log('收到邮件发送请求:', body);

    const response = await fetch('https://qikaka625.app.n8n.cloud/webhook/email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'node-fetch/1.0 (+https://github.com/bitinn/node-fetch)'
      },
      body: JSON.stringify(body)
    });

    console.log('n8n服务器响应状态:', response.status);
    const data = await response.json();
    console.log('n8n服务器响应数据:', data);

    if (!response.ok) {
      throw new Error(`n8n服务器返回错误: ${response.status}`);
    }

    return {
      statusCode: 200,
      body: JSON.stringify(data)
    };
  } catch (error) {
    console.error('代理服务器错误:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: '邮件发送失败',
        details: error.message
      })
    };
  }
};