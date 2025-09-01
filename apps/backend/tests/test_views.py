"""
Test views and API endpoints.
"""
import pytest
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from django.contrib.auth import get_user_model
from apps.accounts.models import UserProfile
from apps.organizations.models import Organization

User = get_user_model()


class TestAuthenticationAPI(APITestCase):
    """Test authentication API endpoints."""
    
    def test_user_registration(self):
        """Test user registration."""
        url = reverse('user-register')
        data = {
            'username': 'newuser',
            'email': 'newuser@example.com',
            'first_name': 'New',
            'last_name': 'User',
            'password': 'newpass123',
            'password_confirm': 'newpass123'
        }
        
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(User.objects.filter(email='newuser@example.com').exists())
        
        # Check that user profile was created
        user = User.objects.get(email='newuser@example.com')
        self.assertTrue(UserProfile.objects.filter(user=user).exists())
    
    def test_user_registration_password_mismatch(self):
        """Test user registration with password mismatch."""
        url = reverse('user-register')
        data = {
            'username': 'newuser',
            'email': 'newuser@example.com',
            'first_name': 'New',
            'last_name': 'User',
            'password': 'newpass123',
            'password_confirm': 'differentpass'
        }
        
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('Passwords don\'t match', str(response.data))
    
    def test_user_login(self, user):
        """Test user login."""
        url = reverse('user-login')
        data = {
            'email': user.email,
            'password': 'testpass123'
        }
        
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)
        self.assertIn('refresh', response.data)
        self.assertIn('user', response.data)
    
    def test_user_login_invalid_credentials(self):
        """Test user login with invalid credentials."""
        url = reverse('user-login')
        data = {
            'email': 'nonexistent@example.com',
            'password': 'wrongpassword'
        }
        
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('Invalid credentials', str(response.data))
    
    def test_token_refresh(self, user):
        """Test token refresh."""
        # First login to get tokens
        login_url = reverse('user-login')
        login_data = {
            'email': user.email,
            'password': 'testpass123'
        }
        login_response = self.client.post(login_url, login_data)
        refresh_token = login_response.data['refresh']
        
        # Refresh token
        refresh_url = reverse('token-refresh')
        refresh_data = {'refresh': refresh_token}
        response = self.client.post(refresh_url, refresh_data)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)


class TestUserAPI(APITestCase):
    """Test user API endpoints."""
    
    def test_get_current_user(self, authenticated_client, user):
        """Test getting current user profile."""
        url = reverse('user-me')
        response = authenticated_client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['id'], user.id)
        self.assertEqual(response.data['email'], user.email)
    
    def test_update_current_user(self, authenticated_client, user):
        """Test updating current user profile."""
        url = reverse('user-update-me')
        data = {
            'first_name': 'Updated',
            'last_name': 'Name'
        }
        
        response = authenticated_client.patch(url, data)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        user.refresh_from_db()
        self.assertEqual(user.first_name, 'Updated')
        self.assertEqual(user.last_name, 'Name')
    
    def test_change_password(self, authenticated_client, user):
        """Test changing user password."""
        url = reverse('user-change-password')
        data = {
            'old_password': 'testpass123',
            'new_password': 'newpass123',
            'new_password_confirm': 'newpass123'
        }
        
        response = authenticated_client.post(url, data)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        user.refresh_from_db()
        self.assertTrue(user.check_password('newpass123'))
    
    def test_change_password_wrong_old_password(self, authenticated_client):
        """Test changing password with wrong old password."""
        url = reverse('user-change-password')
        data = {
            'old_password': 'wrongpassword',
            'new_password': 'newpass123',
            'new_password_confirm': 'newpass123'
        }
        
        response = authenticated_client.post(url, data)
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('Old password is incorrect', str(response.data))


class TestWeb3API(APITestCase):
    """Test Web3 API endpoints."""
    
    def test_web3_status(self, authenticated_client):
        """Test Web3 status endpoint."""
        url = reverse('web3-status')
        response = authenticated_client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('connected', response.data)
        self.assertIn('network', response.data)
    
    def test_wallet_list(self, authenticated_client):
        """Test wallet list endpoint."""
        url = reverse('wallet-list')
        response = authenticated_client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIsInstance(response.data, list)
    
    def test_create_wallet(self, authenticated_client):
        """Test wallet creation."""
        url = reverse('wallet-list')
        data = {
            'address': '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
            'wallet_type': 'metamask',
            'is_primary': True
        }
        
        response = authenticated_client.post(url, data)
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['address'], data['address'])
        self.assertEqual(response.data['wallet_type'], data['wallet_type'])
    
    def test_transaction_list(self, authenticated_client):
        """Test transaction list endpoint."""
        url = reverse('transaction-list')
        response = authenticated_client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIsInstance(response.data, list)


class TestOrganizationAPI(APITestCase):
    """Test organization API endpoints."""
    
    def test_organization_list(self, authenticated_client):
        """Test organization list endpoint."""
        url = reverse('organization-list')
        response = authenticated_client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIsInstance(response.data, list)
    
    def test_create_organization(self, authenticated_client):
        """Test organization creation."""
        url = reverse('organization-list')
        data = {
            'name': 'New Organization',
            'slug': 'new-org',
            'email': 'contact@neworg.com'
        }
        
        response = authenticated_client.post(url, data)
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['name'], data['name'])
        self.assertEqual(response.data['slug'], data['slug'])


class TestCoreAPI(APITestCase):
    """Test core API endpoints."""
    
    def test_audit_log_list_admin(self, admin_client):
        """Test audit log list for admin users."""
        url = reverse('auditlog-list')
        response = admin_client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIsInstance(response.data, list)
    
    def test_audit_log_list_non_admin(self, authenticated_client):
        """Test audit log list for non-admin users."""
        url = reverse('auditlog-list')
        response = authenticated_client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
    
    def test_system_configuration_list_admin(self, admin_client):
        """Test system configuration list for admin users."""
        url = reverse('systemconfiguration-list')
        response = admin_client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIsInstance(response.data, list)
    
    def test_notification_template_list(self, authenticated_client):
        """Test notification template list."""
        url = reverse('notificationtemplate-list')
        response = authenticated_client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIsInstance(response.data, list)
