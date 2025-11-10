import json
from django.shortcuts import render
from django.http import JsonResponse, HttpResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from .models import ChatSession
from .services.ollama_client import ollama_client
from .services.file_manager import file_manager
from .services.settings import settings

def chat_view(request):
    # Initialize session if needed
    if 'chat_session_id' not in request.session:
        request.session['chat_session_id'] = 'default'
    
    context = {
        'default_theme': settings.default_theme
    }
    return render(request, 'chat/index.html', context)

@csrf_exempt
@require_http_methods(["POST"])
def send_message(request):
    try:
        data = json.loads(request.body)
        message = data.get('message', '').strip()
        
        if not message:
            return JsonResponse({'success': False, 'error': 'Message cannot be empty'})
        
        # Save user message to current-chat.md
        file_manager.append_to_current_chat('user', message)
        
        # Send to Ollama
        response = ollama_client.send_message(message)
        
        # Save assistant response to current-chat.md
        file_manager.append_to_current_chat('assistant', response)
        
        return JsonResponse({
            'success': True,
            'response': response,
            'timestamp': file_manager.current_chat_path.stat().st_mtime if file_manager.current_chat_path.exists() else None
        })
        
    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)})

@csrf_exempt
@require_http_methods(["POST"])
def new_chat(request):
    try:
        # Export current chat
        export_data = file_manager.save_chat_export()
        
        if export_data:
            filename, content = export_data
            
            # Clear current chat
            file_manager.clear_current_chat()
            
            # Create download response
            response = HttpResponse(content, content_type='text/markdown')
            response['Content-Disposition'] = f'attachment; filename="{filename}"'
            return response
        else:
            return JsonResponse({'success': True, 'message': 'No chat to export'})
            
    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)})

@require_http_methods(["GET"])
def load_current_chat(request):
    try:
        if file_manager.current_chat_path.exists():
            with open(file_manager.current_chat_path, 'r', encoding='utf-8') as f:
                content = f.read()
            return JsonResponse({'success': True, 'content': content})
        else:
            return JsonResponse({'success': True, 'content': ''})
    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)})