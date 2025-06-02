// 聊天记录管理
class ChatHistoryManager {
    constructor() {
        this.chatHistory = new Map(); // 使用Map存储聊天记录，key为用户ID
        this.emailConfig = {
            recipientEmail: 'qikaka625@gmail.com' // 接收邮件的邮箱
        };
        this.currentUserId = null; // 当前用户ID
    }
    
    // 生成随机用户ID
    generateUserId(ip) {
        return 'user_' + ip + '_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
    }
    
    // 获取或创建用户ID
    async getUserId() {
        if (!this.currentUserId) {
            const ip = await this.getUserIP();
            this.currentUserId = this.generateUserId(ip);
        }
        return this.currentUserId;
    }

    // 获取用户IP地址
    async getUserIP() {
        try {
            const response = await fetch('https://api.ipify.org?format=json');
            const data = await response.json();
            return data.ip;
        } catch (error) {
            console.error('获取IP地址失败:', error);
            return 'unknown';
        }
    }

    // 添加聊天记录
    async addChatMessage(message, isUser = true) {
        const userId = await this.getUserId();
        if (!this.chatHistory.has(userId)) {
            this.chatHistory.set(userId, []);
        }
        
        const timestamp = new Date().toISOString();
        this.chatHistory.get(userId).push({
            message,
            isUser,
            timestamp
        });
    }

    // 获取指定IP的聊天记录
    getChatHistory(ip) {
        return this.chatHistory.get(ip) || [];
    }

    // 格式化聊天记录为邮件内容
    async formatChatHistoryForEmail(userId) {
        const history = this.getChatHistory(userId);
        if (history.length === 0) return '';

        // 从userId中提取IP (格式: user_IP_randomString_timestamp)
        const ipMatch = userId.match(/user_([^_]+)_/);
        const ip = ipMatch ? ipMatch[1] : '未知IP';

        let emailContent = `用户ID: ${userId}\n`;
        emailContent += `用户IP: ${ip}\n`;
        emailContent += `聊天时间: ${new Date().toLocaleString()}\n\n`;
        emailContent += '聊天记录:\n';
        emailContent += '----------------------------------------\n';

        history.forEach(entry => {
            const role = entry.isUser ? '用户' : 'AI助手';
            const time = new Date(entry.timestamp).toLocaleString();
            emailContent += `[${time}] ${role}: ${entry.message}\n`;
        });

        return emailContent;
    }

    // 发送邮件
    async sendEmail(content) {
        try {
            console.log('准备发送邮件，内容:', content);
            
            // 添加重试机制
            let retries = 3;
            let lastError = null;
            
            while (retries > 0) {
                try {
                    const response = await fetch('/api/send-email', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            to: this.emailConfig.recipientEmail,
                            subject: '聊天记录报告',
                            content: content
                        })
                    });

                    console.log('服务器响应状态:', response.status);
                    const result = await response.json();
                    console.log('服务器响应数据:', result);

                    if (!response.ok) {
                        throw new Error(result.error || '邮件发送失败');
                    }

                    // 清空已发送的聊天记录
                    this.chatHistory.clear();
                    alert('邮件发送成功！请检查邮箱。');
                    return;
                } catch (error) {
                    console.error(`发送邮件失败 (剩余重试次数: ${retries}):`, error);
                    lastError = error;
                    retries--;
                    if (retries > 0) {
                        await new Promise(resolve => setTimeout(resolve, 1000)); // 等待1秒后重试
                    }
                }
            }

            throw lastError;
        } catch (error) {
            console.error('发送邮件失败:', error);
            alert(`邮件发送失败: ${error.message}\n请确保已在n8n界面点击"Execute workflow"按钮`);
        }
    }

    // 检查并发送邮件 (保留方法但不再使用24小时间隔逻辑)
    async checkAndSendEmail() {
        let emailContent = '';
        for (const [userId, history] of this.chatHistory.entries()) {
            if (history.length > 0) {
                emailContent += await this.formatChatHistoryForEmail(userId);
                emailContent += '\n----------------------------------------\n\n';
            }
        }

        if (emailContent) {
            await this.sendEmail(emailContent);
            this.lastEmailTime = Date.now();
        }
    }
    
    // 在对话结束时发送邮件
    async sendEmailOnConversationEnd() {
        let emailContent = '';
        for (const [userId, history] of this.chatHistory.entries()) {
            if (history.length > 0) {
                emailContent += await this.formatChatHistoryForEmail(userId);
                emailContent += '\n----------------------------------------\n\n';
            }
        }

        if (emailContent) {
            await this.sendEmail(emailContent);
            this.lastEmailTime = Date.now();
        }
    }

    // 测试发送邮件
    async testSendEmail() {
        try {
            console.log('开始测试邮件发送');
            
            // 生成测试用户ID
            const testIP = '192.168.1.1';
            const testUserId = this.generateUserId(testIP);
            
            // 添加一些测试数据
            this.chatHistory.set(testUserId, [
                {
                    message: '你好',
                    isUser: true,
                    timestamp: new Date().toISOString()
                },
                {
                    message: '您好！我是AI智能助手，很高兴为您服务。',
                    isUser: false,
                    timestamp: new Date().toISOString()
                },
                {
                    message: '请问有什么功能？',
                    isUser: true,
                    timestamp: new Date().toISOString()
                },
                {
                    message: '我可以帮您解答问题、提供建议等。',
                    isUser: false,
                    timestamp: new Date().toISOString()
                }
            ]);

            // 发送测试邮件
            let emailContent = '';
            for (const [userId, history] of this.chatHistory.entries()) {
                if (history.length > 0) {
                    emailContent += await this.formatChatHistoryForEmail(userId);
                    emailContent += '\n----------------------------------------\n\n';
                }
            }

            if (emailContent) {
                console.log('准备发送测试邮件，内容:', emailContent);
                await this.sendEmail(emailContent);
                this.lastEmailTime = Date.now();
                console.log('测试邮件发送完成');
            }
        } catch (error) {
            console.error('测试邮件发送失败:', error);
            alert(`测试邮件发送失败: ${error.message}`);
        }
    }
}

// 创建全局实例
const chatHistoryManager = new ChatHistoryManager();

// 导出实例
window.chatHistoryManager = chatHistoryManager;

// 注释掉自动发送测试邮件的代码，改为24小时发送一次
// chatHistoryManager.testSendEmail();