class ChatApp {
    constructor() {
        this.messageInput = document.getElementById('messageInput');
        this.sendBtn = document.getElementById('sendBtn');
        this.newChatBtn = document.getElementById('newChatBtn');
        this.themeToggle = document.getElementById('themeToggle');
        this.fontDecrease = document.getElementById('fontDecrease');
        this.fontIncrease = document.getElementById('fontIncrease');
        this.chatMessages = document.getElementById('chatMessages');
        
        this.initializeTheme();
        this.initializeFontScale();
        this.bindEvents();
        this.loadCurrentChat();
    }
    
    initializeTheme() {
        const savedTheme = localStorage.getItem('theme') || window.defaultTheme;
        this.setTheme(savedTheme);
    }
    
    setTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        this.themeToggle.textContent = theme === 'dark' ? '☀️' : '🌙';
        localStorage.setItem('theme', theme);
    }
    
    toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        this.setTheme(newTheme);
    }
    
    bindEvents() {
        this.sendBtn.addEventListener('click', () => this.sendMessage());
        this.newChatBtn.addEventListener('click', () => this.newChat());
        this.themeToggle.addEventListener('click', () => this.toggleTheme());
        this.fontDecrease.addEventListener('click', () => this.decreaseFontSize());
        this.fontIncrease.addEventListener('click', () => this.increaseFontSize());
        
        this.messageInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });
        
        this.messageInput.addEventListener('input', () => {
            this.autoResize();
        });
    }
    
    autoResize() {
        this.messageInput.style.height = 'auto';
        this.messageInput.style.height = this.messageInput.scrollHeight + 'px';
    }
    
    async sendMessage() {
        const message = this.messageInput.value.trim();
        if (!message) return;
        
        this.addMessage(message, 'user');
        this.messageInput.value = '';
        this.autoResize();
        this.setLoading(true);
        
        try {
            const response = await fetch('/chat/api/send/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ message })
            });
            
            const data = await response.json();
            
            if (data.success) {
                this.addMessage(data.response, 'assistant');
            } else {
                this.addMessage(`Error: ${data.error}`, 'assistant');
            }
        } catch (error) {
            this.addMessage(`Connection error: ${error.message}`, 'assistant');
        } finally {
            this.setLoading(false);
        }
    }
    
    async newChat() {
        if (confirm('Start a new chat? Current conversation will be saved.')) {
            try {
                const response = await fetch('/chat/api/new-chat/', {
                    method: 'POST'
                });
                
                if (response.headers.get('content-type')?.includes('text/markdown')) {
                    // File download
                    const blob = await response.blob();
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = response.headers.get('content-disposition')?.split('filename=')[1]?.replace(/"/g, '') || 'chat.md';
                    a.click();
                    window.URL.revokeObjectURL(url);
                }
                
                this.clearMessages();
            } catch (error) {
                alert(`Error starting new chat: ${error.message}`);
            }
        }
    }
    
    addMessage(content, role) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${role}`;
        
        const contentDiv = document.createElement('div');
        contentDiv.className = 'message-content';
        contentDiv.textContent = content;
        
        messageDiv.appendChild(contentDiv);
        this.chatMessages.appendChild(messageDiv);
        
        // Remove welcome message if it exists
        const welcomeMsg = this.chatMessages.querySelector('.welcome-message');
        if (welcomeMsg) {
            welcomeMsg.remove();
        }
        
        this.scrollToBottom();
    }
    
    clearMessages() {
        this.chatMessages.innerHTML = '<div class="welcome-message"><p>Welcome! Start chatting with Ollama.</p></div>';
    }
    
    setLoading(loading) {
        this.sendBtn.disabled = loading;
        this.messageInput.disabled = loading;
        this.sendBtn.textContent = loading ? 'Sending...' : 'Send';
    }
    
    scrollToBottom() {
        this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
    }
    
    initializeFontScale() {
        const savedScale = localStorage.getItem('fontScale') || '1';
        this.setFontScale(parseFloat(savedScale));
    }
    
    setFontScale(scale) {
        scale = Math.max(0.8, Math.min(1.5, scale)); // Limit between 0.8x and 1.5x
        document.documentElement.style.setProperty('--font-scale', scale);
        localStorage.setItem('fontScale', scale.toString());
    }
    
    decreaseFontSize() {
        const currentScale = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--font-scale')) || 1;
        this.setFontScale(currentScale - 0.1);
    }
    
    increaseFontSize() {
        const currentScale = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--font-scale')) || 1;
        this.setFontScale(currentScale + 0.1);
    }
    
    async loadCurrentChat() {
        try {
            const response = await fetch('/chat/api/load-chat/');
            const data = await response.json();
            
            if (data.success && data.content) {
                this.parseAndDisplayChat(data.content);
            }
        } catch (error) {
            console.log('No existing chat to load');
        }
    }
    
    parseAndDisplayChat(content) {
        const lines = content.split('\n');
        let currentRole = null;
        let currentContent = [];
        
        for (const line of lines) {
            if (line.startsWith('## User -')) {
                if (currentRole && currentContent.length > 0) {
                    this.addMessage(currentContent.join('\n'), currentRole);
                }
                currentRole = 'user';
                currentContent = [];
            } else if (line.startsWith('## Assistant -')) {
                if (currentRole && currentContent.length > 0) {
                    this.addMessage(currentContent.join('\n'), currentRole);
                }
                currentRole = 'assistant';
                currentContent = [];
            } else if (line.trim() && currentRole) {
                currentContent.push(line);
            }
        }
        
        // Add the last message
        if (currentRole && currentContent.length > 0) {
            this.addMessage(currentContent.join('\n'), currentRole);
        }
    }
}

// Initialize the chat app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new ChatApp();
});