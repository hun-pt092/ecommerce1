# shop/middleware.py - Custom middleware for logging and security
import logging
import time
from django.utils.deprecation import MiddlewareMixin
from django.http import JsonResponse
from rest_framework import status

logger = logging.getLogger(__name__)

class APILoggingMiddleware(MiddlewareMixin):
    """Log API requests and responses"""
    
    def process_request(self, request):
        if request.path.startswith('/api/'):
            request.start_time = time.time()
            logger.info(f"API Request: {request.method} {request.path} from {request.META.get('REMOTE_ADDR')}")
    
    def process_response(self, request, response):
        if hasattr(request, 'start_time') and request.path.startswith('/api/'):
            duration = time.time() - request.start_time
            logger.info(f"API Response: {response.status_code} for {request.path} - Duration: {duration:.2f}s")
        return response

class RateLimitMiddleware(MiddlewareMixin):
    """Simple rate limiting middleware"""
    
    def __init__(self, get_response):
        self.get_response = get_response
        self.requests = {}  # In production, use Redis or database
    
    def __call__(self, request):
        # Simple IP-based rate limiting (100 requests per minute)
        client_ip = request.META.get('REMOTE_ADDR')
        current_time = time.time()
        
        if client_ip in self.requests:
            # Clean old requests
            self.requests[client_ip] = [req_time for req_time in self.requests[client_ip] 
                                     if current_time - req_time < 60]
            
            if len(self.requests[client_ip]) >= 100:
                return JsonResponse({
                    'error': 'Rate limit exceeded',
                    'detail': 'Too many requests, please try again later'
                }, status=status.HTTP_429_TOO_MANY_REQUESTS)
                
            self.requests[client_ip].append(current_time)
        else:
            self.requests[client_ip] = [current_time]
        
        response = self.get_response(request)
        return response