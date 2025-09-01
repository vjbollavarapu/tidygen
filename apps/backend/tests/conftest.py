"""
Pytest configuration and fixtures.
"""
import pytest
from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework_simplejwt.tokens import RefreshToken
from apps.organizations.models import Organization

User = get_user_model()


@pytest.fixture
def api_client():
    """API client fixture."""
    return APIClient()


@pytest.fixture
def user():
    """User fixture."""
    return User.objects.create_user(
        username='testuser',
        email='test@example.com',
        password='testpass123',
        first_name='Test',
        last_name='User'
    )


@pytest.fixture
def admin_user():
    """Admin user fixture."""
    return User.objects.create_superuser(
        username='admin',
        email='admin@example.com',
        password='adminpass123',
        first_name='Admin',
        last_name='User'
    )


@pytest.fixture
def organization():
    """Organization fixture."""
    return Organization.objects.create(
        name='Test Organization',
        slug='test-org',
        email='contact@testorg.com'
    )


@pytest.fixture
def authenticated_client(api_client, user):
    """Authenticated API client fixture."""
    refresh = RefreshToken.for_user(user)
    api_client.credentials(HTTP_AUTHORIZATION=f'Bearer {refresh.access_token}')
    return api_client


@pytest.fixture
def admin_client(api_client, admin_user):
    """Admin API client fixture."""
    refresh = RefreshToken.for_user(admin_user)
    api_client.credentials(HTTP_AUTHORIZATION=f'Bearer {refresh.access_token}')
    return api_client


@pytest.fixture
def sample_user_data():
    """Sample user data for testing."""
    return {
        'username': 'newuser',
        'email': 'newuser@example.com',
        'first_name': 'New',
        'last_name': 'User',
        'password': 'newpass123',
        'password_confirm': 'newpass123'
    }


@pytest.fixture
def sample_organization_data():
    """Sample organization data for testing."""
    return {
        'name': 'New Organization',
        'slug': 'new-org',
        'email': 'contact@neworg.com',
        'phone': '+1234567890',
        'website': 'https://neworg.com',
        'industry': 'Technology',
        'size': '11-50'
    }


@pytest.fixture
def mock_web3_provider(mocker):
    """Mock Web3 provider for testing."""
    mock_provider = mocker.Mock()
    mock_provider.is_connected.return_value = True
    mock_provider.get_balance.return_value = 1000000000000000000  # 1 ETH in wei
    return mock_provider


@pytest.fixture
def mock_wallet_address():
    """Mock wallet address for testing."""
    return '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6'


class BaseTestCase(TestCase):
    """Base test case with common setup."""
    
    def setUp(self):
        """Set up test data."""
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
        self.organization = Organization.objects.create(
            name='Test Organization',
            slug='test-org'
        )
        self.client = APIClient()
        
    def authenticate_user(self, user=None):
        """Authenticate a user for API requests."""
        if user is None:
            user = self.user
        refresh = RefreshToken.for_user(user)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {refresh.access_token}')
