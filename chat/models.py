from django.db import models
from datetime import datetime

class ChatMessage:
    def __init__(self, content, role, timestamp=None):
        self.content = content
        self.role = role  # 'user' or 'assistant'
        self.timestamp = timestamp or datetime.now()

class ChatSession:
    def __init__(self, session_id):
        self.session_id = session_id
        self.messages = []
        self.created_at = datetime.now()
    
    def add_message(self, content, role):
        message = ChatMessage(content, role)
        self.messages.append(message)
        return message
    
    def clear(self):
        self.messages = []