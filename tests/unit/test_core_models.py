"""
Unit tests for core models.
"""

import pytest
from django.core.exceptions import ValidationError
from django.contrib.auth import get_user_model
from apps.core.models import User, Permission, Role, SystemSettings, AuditLog

User = get_user_model()


class TestUser:
    """Test User model."""
    
    def test_user_creation(self):
        """Test user creation."""
        user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123',
            first_name='Test',
            last_name='User'
        )
        assert user.username == 'testuser'
        assert user.email == 'test@example.com'
        assert user.first_name == 'Test'
        assert user.last_name == 'User'
        assert user.is_active is True
        assert user.is_verified is False
        assert user.wallet_verified is False
    
    def test_user_full_name(self):
        """Test user full name property."""
        user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123',
            first_name='John',
            last_name='Doe'
        )
        assert user.full_name == 'John Doe'
    
    def test_user_full_name_empty(self):
        """Test user full name with empty names."""
        user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
        assert user.full_name == ''
    
    def test_user_str(self):
        """Test user string representation."""
        user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123',
            first_name='John',
            last_name='Doe'
        )
        assert str(user) == 'John Doe (test@example.com)'
    
    def test_user_username_field(self):
        """Test USERNAME_FIELD is email."""
        assert User.USERNAME_FIELD == 'email'
    
    def test_user_required_fields(self):
        """Test REQUIRED_FIELDS."""
        assert 'username' in User.REQUIRED_FIELDS
        assert 'first_name' in User.REQUIRED_FIELDS
        assert 'last_name' in User.REQUIRED_FIELDS


class TestPermission:
    """Test Permission model."""
    
    def test_permission_creation(self):
        """Test permission creation."""
        permission = Permission.objects.create(
            name='Test Permission',
            codename='test_permission',
            description='A test permission',
            module='test'
        )
        assert permission.name == 'Test Permission'
        assert permission.codename == 'test_permission'
        assert permission.description == 'A test permission'
        assert permission.module == 'test'
        assert permission.is_system is False
    
    def test_permission_str(self):
        """Test permission string representation."""
        permission = Permission.objects.create(
            name='Test Permission',
            codename='test_permission',
            module='test'
        )
        assert str(permission) == 'test: Test Permission'
    
    def test_permission_str_no_module(self):
        """Test permission string representation without module."""
        permission = Permission.objects.create(
            name='Test Permission',
            codename='test_permission'
        )
        assert str(permission) == 'Test Permission'


class TestRole:
    """Test Role model."""
    
    def test_role_creation(self):
        """Test role creation."""
        role = Role.objects.create(
            name='Test Role',
            description='A test role'
        )
        assert role.name == 'Test Role'
        assert role.description == 'A test role'
        assert role.is_system is False
        assert role.is_active is True
    
    def test_role_str(self):
        """Test role string representation."""
        role = Role.objects.create(
            name='Test Role',
            description='A test role'
        )
        assert str(role) == 'Test Role'
    
    def test_role_with_permissions(self):
        """Test role with permissions."""
        permission = Permission.objects.create(
            name='Test Permission',
            codename='test_permission'
        )
        role = Role.objects.create(
            name='Test Role',
            description='A test role'
        )
        role.permissions.add(permission)
        
        assert permission in role.permissions.all()
        assert role in permission.roles.all()


class TestSystemSettings:
    """Test SystemSettings model."""
    
    def test_system_settings_creation(self):
        """Test system settings creation."""
        settings = SystemSettings.objects.create(
            key='test_setting',
            value={'test': 'value'},
            description='A test setting'
        )
        assert settings.key == 'test_setting'
        assert settings.value == {'test': 'value'}
        assert settings.description == 'A test setting'
        assert settings.is_public is False
    
    def test_system_settings_str(self):
        """Test system settings string representation."""
        settings = SystemSettings.objects.create(
            key='test_setting',
            value={'test': 'value'}
        )
        assert str(settings) == "test_setting: {'test': 'value'}"


class TestAuditLog:
    """Test AuditLog model."""
    
    def test_audit_log_creation(self):
        """Test audit log creation."""
        user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
        audit_log = AuditLog.objects.create(
            user=user,
            action='create',
            model_name='User',
            object_id='1',
            object_repr='Test User',
            changes={'field': 'value'}
        )
        assert audit_log.user == user
        assert audit_log.action == 'create'
        assert audit_log.model_name == 'User'
        assert audit_log.object_id == '1'
        assert audit_log.object_repr == 'Test User'
        assert audit_log.changes == {'field': 'value'}
    
    def test_audit_log_str(self):
        """Test audit log string representation."""
        user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
        audit_log = AuditLog.objects.create(
            user=user,
            action='create',
            model_name='User',
            object_id='1',
            object_repr='Test User'
        )
        assert str(audit_log) == f'{user} - create - User'
