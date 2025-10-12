# shop/validators.py - Custom validators
from django.core.exceptions import ValidationError
from django.utils.translation import gettext_lazy as _
import re

def validate_phone_number(value):
    """Validate Vietnamese phone number format"""
    if not re.match(r'^(0|\+84)[3-9]\d{8}$', value):
        raise ValidationError(
            _('%(value)s is not a valid phone number'),
            params={'value': value},
        )

def validate_file_size(value):
    """Validate uploaded file size (max 5MB)"""
    filesize = value.size
    if filesize > 5242880:  # 5MB
        raise ValidationError("Maximum file size is 5MB")

def validate_image_extension(value):
    """Validate image file extensions"""
    import os
    ext = os.path.splitext(value.name)[1]
    valid_extensions = ['.jpg', '.jpeg', '.png', '.webp']
    if not ext.lower() in valid_extensions:
        raise ValidationError('Unsupported file extension. Use: jpg, jpeg, png, webp')

def validate_positive_number(value):
    """Validate that number is positive"""
    if value <= 0:
        raise ValidationError('This field must be a positive number')

def validate_stock_quantity(value):
    """Validate stock quantity"""
    if value < 0:
        raise ValidationError('Stock quantity cannot be negative')
    if value > 10000:
        raise ValidationError('Stock quantity seems too high, please verify')