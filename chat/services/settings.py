import json
import os
from pathlib import Path

class SettingsLoader:
    def __init__(self):
        self.settings_path = Path(__file__).resolve().parent.parent.parent / 'settings.json'
        self._settings = None
    
    def load(self):
        if self._settings is None:
            with open(self.settings_path, 'r') as f:
                self._settings = json.load(f)
        return self._settings
    
    @property
    def ollama_model(self):
        return self.load()['ollama']['model']
    
    @property
    def ollama_timeout(self):
        return self.load()['ollama']['timeout']
    
    @property
    def ollama_base_url(self):
        return self.load()['ollama']['base_url']
    
    @property
    def default_theme(self):
        return self.load()['ui']['default_theme']

settings = SettingsLoader()