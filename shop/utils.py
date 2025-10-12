# shop/utils.py - Utility functions for better code organization
import logging
from django.http import JsonResponse
from django.conf import settings
from rest_framework import status

logger = logging.getLogger(__name__)

def handle_api_error(func):
    """Decorator to handle API errors consistently"""
    def wrapper(*args, **kwargs):
        try:
            return func(*args, **kwargs)
        except Exception as e:
            logger.error(f"API Error in {func.__name__}: {str(e)}")
            return JsonResponse({
                'error': 'An error occurred processing your request',
                'detail': str(e) if settings.DEBUG else 'Internal server error'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    return wrapper

def validate_stock_availability(cart_items):
    """Validate stock availability before creating order"""
    for item in cart_items:
        if item.product_variant.stock_quantity < item.quantity:
            return False, f"Not enough stock for {item.product_variant.product.name}"
    return True, None