"""
Test models.
"""
import pytest
from django.core.exceptions import ValidationError
from django.contrib.auth import get_user_model
from apps.accounts.models import User, UserProfile
from apps.organizations.models import Organization, OrganizationMember
from apps.core.models import BaseModel, AuditLog

User = get_user_model()


class TestUserModel:
    """Test User model."""
    
    def test_user_creation(self):
        """Test user creation."""
        user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
        assert user.username == 'testuser'
        assert user.email == 'test@example.com'
        assert user.check_password('testpass123')
        assert not user.is_staff
        assert not user.is_superuser
    
    def test_superuser_creation(self):
        """Test superuser creation."""
        user = User.objects.create_superuser(
            username='admin',
            email='admin@example.com',
            password='adminpass123'
        )
        assert user.is_staff
        assert user.is_superuser
    
    def test_user_str_representation(self):
        """Test user string representation."""
        user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            first_name='Test',
            last_name='User'
        )
        assert str(user) == 'Test User (test@example.com)'
    
    def test_get_full_name(self):
        """Test get_full_name method."""
        user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            first_name='Test',
            last_name='User'
        )
        assert user.get_full_name() == 'Test User'
        
        # Test with no first/last name
        user.first_name = ''
        user.last_name = ''
        assert user.get_full_name() == 'testuser'


class TestUserProfileModel:
    """Test UserProfile model."""
    
    def test_profile_creation(self, user):
        """Test profile creation."""
        profile = UserProfile.objects.create(
            user=user,
            bio='Test bio',
            company='Test Company'
        )
        assert profile.user == user
        assert profile.bio == 'Test bio'
        assert profile.company == 'Test Company'
    
    def test_profile_str_representation(self, user):
        """Test profile string representation."""
        profile = UserProfile.objects.create(user=user)
        assert str(profile) == f'{user.get_full_name()} Profile'


class TestOrganizationModel:
    """Test Organization model."""
    
    def test_organization_creation(self):
        """Test organization creation."""
        org = Organization.objects.create(
            name='Test Organization',
            slug='test-org',
            email='contact@testorg.com'
        )
        assert org.name == 'Test Organization'
        assert org.slug == 'test-org'
        assert org.email == 'contact@testorg.com'
        assert org.is_active
    
    def test_organization_str_representation(self):
        """Test organization string representation."""
        org = Organization.objects.create(
            name='Test Organization',
            slug='test-org'
        )
        assert str(org) == 'Test Organization'
    
    def test_unique_slug(self):
        """Test unique slug constraint."""
        Organization.objects.create(
            name='Test Organization',
            slug='test-org'
        )
        
        with pytest.raises(Exception):  # IntegrityError
            Organization.objects.create(
                name='Another Organization',
                slug='test-org'
            )


class TestOrganizationMemberModel:
    """Test OrganizationMember model."""
    
    def test_member_creation(self, user, organization):
        """Test member creation."""
        member = OrganizationMember.objects.create(
            organization=organization,
            user=user,
            role='employee'
        )
        assert member.organization == organization
        assert member.user == user
        assert member.role == 'employee'
        assert member.is_active
    
    def test_unique_membership(self, user, organization):
        """Test unique membership constraint."""
        OrganizationMember.objects.create(
            organization=organization,
            user=user,
            role='employee'
        )
        
        with pytest.raises(Exception):  # IntegrityError
            OrganizationMember.objects.create(
                organization=organization,
                user=user,
                role='admin'
            )


class TestBaseModel:
    """Test BaseModel functionality."""
    
    def test_timestamps(self):
        """Test automatic timestamp creation."""
        # Create a test model instance
        user = User.objects.create_user(
            username='testuser',
            email='test@example.com'
        )
        
        # Check that timestamps are set
        assert user.created_at is not None
        assert user.updated_at is not None
    
    def test_soft_delete(self):
        """Test soft delete functionality."""
        user = User.objects.create_user(
            username='testuser',
            email='test@example.com'
        )
        
        # Soft delete
        user.soft_delete()
        assert user.is_deleted
        assert user.deleted_at is not None
        
        # Restore
        user.restore()
        assert not user.is_deleted
        assert user.deleted_at is None


class TestAuditLogModel:
    """Test AuditLog model."""
    
    def test_audit_log_creation(self, user):
        """Test audit log creation."""
        log = AuditLog.objects.create(
            model_name='User',
            object_id='1',
            action='CREATE',
            user=user,
            changes={'name': 'Test User'}
        )
        assert log.model_name == 'User'
        assert log.object_id == '1'
        assert log.action == 'CREATE'
        assert log.user == user
        assert log.changes == {'name': 'Test User'}
    
    def test_audit_log_str_representation(self, user):
        """Test audit log string representation."""
        log = AuditLog.objects.create(
            model_name='User',
            object_id='1',
            action='CREATE',
            user=user
        )
        expected = f'CREATE User 1 by {user}'
        assert str(log) == expected
