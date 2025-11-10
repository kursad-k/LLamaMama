import os
from datetime import datetime
from pathlib import Path

class FileManager:
    def __init__(self):
        self.current_chat_path = Path(__file__).resolve().parent.parent.parent / 'current-chat.md'
    
    def append_to_current_chat(self, role, content):
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        with open(self.current_chat_path, 'a', encoding='utf-8') as f:
            f.write(f"\n## {role.title()} - {timestamp}\n{content}\n")
    
    def save_chat_export(self):
        if not self.current_chat_path.exists():
            return None
        
        timestamp = datetime.now().strftime("%Y-%m-%d_%H-%M-%S")
        filename = f"chat_{timestamp}.md"
        
        with open(self.current_chat_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        return filename, content
    
    def clear_current_chat(self):
        if self.current_chat_path.exists():
            self.current_chat_path.unlink()

file_manager = FileManager()