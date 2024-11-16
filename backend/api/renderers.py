from rest_framework import renderers

class EventStreamRenderer(renderers.BaseRenderer):
    media_type = 'text/event-stream'
    format = 'stream'
    
    def render(self, data, accepted_media_type=None, renderer_context=None):
        if isinstance(data, str):
            return data.encode('utf-8')
        return data
    