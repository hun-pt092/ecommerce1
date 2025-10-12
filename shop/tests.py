from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase, APIClient
from rest_framework import status
from django.urls import reverse
from .models import Product, Category, Brand, Cart, CartItem, Order

User = get_user_model()

class UserAuthenticationTest(APITestCase):
    def setUp(self):
        self.client = APIClient()
        self.register_url = reverse('auth_register')
        self.login_url = reverse('token_obtain_pair')
        
        self.user_data = {
            'username': 'testuser',
            'email': 'test@example.com',
            'password': 'testpassword123',
            'password2': 'testpassword123',
            'first_name': 'Test',
            'last_name': 'User'
        }
    
    def test_user_registration(self):
        """Test user registration"""
        response = self.client.post(self.register_url, self.user_data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(User.objects.filter(username='testuser').exists())
    
    def test_user_login(self):
        """Test user login"""
        # Create user first
        user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpassword123'
        )
        
        login_data = {
            'username': 'testuser',
            'password': 'testpassword123'
        }
        
        response = self.client.post(self.login_url, login_data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)

class ProductTest(TestCase):
    def setUp(self):
        self.category = Category.objects.create(name='Test Category')
        self.brand = Brand.objects.create(name='Test Brand')
        
    def test_product_creation(self):
        """Test product creation"""
        product = Product.objects.create(
            name='Test Product',
            description='Test Description',
            price=100000,
            category=self.category,
            brand=self.brand
        )
        
        self.assertEqual(product.name, 'Test Product')
        self.assertIsNotNone(product.sku)
        self.assertTrue(product.is_active)

class CartTest(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpassword123'
        )
        self.client.force_authenticate(user=self.user)
        
        self.category = Category.objects.create(name='Test Category')
        self.product = Product.objects.create(
            name='Test Product',
            price=100000,
            category=self.category
        )
        
    def test_add_to_cart(self):
        """Test adding product to cart"""
        cart_url = reverse('cart')
        data = {
            'action': 'add',
            'product_id': self.product.id,
            'quantity': 2
        }
        
        response = self.client.post(cart_url, data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Check if cart item was created
        cart = Cart.objects.get(user=self.user)
        self.assertEqual(cart.items.count(), 1)

class OrderTest(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpassword123'
        )
        self.client.force_authenticate(user=self.user)
        
    def test_create_order_empty_cart(self):
        """Test creating order with empty cart should fail"""
        order_url = reverse('order_create')
        data = {
            'shipping_name': 'Test User',
            'shipping_address': '123 Test St',
            'shipping_city': 'Test City',
            'phone_number': '0123456789'
        }
        
        response = self.client.post(order_url, data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
