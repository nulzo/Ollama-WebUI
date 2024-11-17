from typing import AsyncGenerator, Dict, Any
import json
from django.http import StreamingHttpResponse
from api.services.provider import ProviderFactory
import logging

logger = logging.getLogger(__name__)

class StreamService:
    def __init__(self):
        self.provider_factory = ProviderFactory()
        self.logger = logging.getLogger(__name__)

    async def stream_response(self, model: str, messages: list, request) -> AsyncGenerator[str, None]:
        try:
            provider = self.provider_factory.get_provider(model)
            full_content = ""
            
            async for chunk in provider.achat(model, messages):
                if isinstance(chunk, bytes):
                    chunk = chunk.decode('utf-8')
                
                if isinstance(chunk, str):
                    full_content += chunk
                    yield f"data: {json.dumps({'delta': {'content': chunk}})}\n\n"
                elif isinstance(chunk, dict):
                    if chunk.get('done'):
                        break
                    content = chunk.get('message', {}).get('content', '')
                    if content:
                        full_content += content
                        yield f"data: {json.dumps({'delta': {'content': content}})}\n\n"

            # Save the complete message to the database
            await self.save_message(request, model, messages[-1]['content'], full_content)
            
            yield f"data: {json.dumps({'done': True})}\n\n"
            yield "data: [DONE]\n\n"
            
        except Exception as e:
            self.logger.error(f"Error in stream_response: {str(e)}")
            yield f"data: {json.dumps({'error': str(e)})}\n\n"

    async def save_message(self, request, model: str, prompt: str, response: str):
        from api.models.messages.message import Message
        from api.models.conversation.conversation import Conversation
        
        try:
            # Save the assistant's response
            await Message.objects.acreate(
                conversation=request.conversation,
                role="assistant",
                content=response,
                model=model,
                user=request.user
            )
        except Exception as e:
            self.logger.error(f"Error saving message: {str(e)}")