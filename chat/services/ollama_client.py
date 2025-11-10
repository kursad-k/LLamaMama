from openai import OpenAI
from .settings import settings

class OllamaClient:
    def __init__(self):
        self.client = OpenAI(
            base_url=f"{settings.ollama_base_url}/v1",
            api_key="ollama"  # Required but not used by Ollama
        )
    
    def send_message(self, message):
        try:
            messages = [
                {"role": "system", "content": "You are a helpful assistant. Provide concise, clear, and factual responses. Use simple formatting with line breaks for readability. Avoid markdown syntax like **bold** or *italic*. Be direct and to the point."},
                {"role": "user", "content": message}
            ]
            response = self.client.chat.completions.create(
                model=settings.ollama_model,
                messages=messages,
                timeout=settings.ollama_timeout
            )
            return response.choices[0].message.content
        except Exception as e:
            raise Exception(f"Ollama connection failed: {str(e)}")

ollama_client = OllamaClient()