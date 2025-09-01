"""
Organization and multi-tenant models.
"""
from django.db import models
from django.contrib.auth import get_user_model
from apps.core.models import BaseModel

User = get_user_model()


class Organization(BaseModel):
    """Organization model for multi-tenant support."""
    name = models.CharField(max_length=200)
    slug = models.SlugField(unique=True)
    description = models.TextField(blank=True)
    
    # Contact information
    email = models.EmailField(blank=True)
    phone = models.CharField(max_length=20, blank=True)
    website = models.URLField(blank=True)
    
    # Address
    address_line1 = models.CharField(max_length=200, blank=True)
    address_line2 = models.CharField(max_length=200, blank=True)
    city = models.CharField(max_length=100, blank=True)
    state = models.CharField(max_length=100, blank=True)
    postal_code = models.CharField(max_length=20, blank=True)
    country = models.CharField(max_length=100, blank=True)
    
    # Organization details
    industry = models.CharField(max_length=100, blank=True)
    size = models.CharField(
        max_length=20,
        choices=[
            ('1-10', '1-10 employees'),
            ('11-50', '11-50 employees'),
            ('51-200', '51-200 employees'),
            ('201-500', '201-500 employees'),
            ('501-1000', '501-1000 employees'),
            ('1000+', '1000+ employees'),
        ],
        blank=True
    )
    
    # Settings
    timezone = models.CharField(max_length=50, default='UTC')
    currency = models.CharField(max_length=3, default='USD')
    language = models.CharField(max_length=10, default='en')
    
    # Status
    is_active = models.BooleanField(default=True)
    subscription_plan = models.CharField(
        max_length=20,
        choices=[
            ('free', 'Free'),
            ('basic', 'Basic'),
            ('professional', 'Professional'),
            ('enterprise', 'Enterprise'),
        ],
        default='free'
    )
    
    # Web3 settings
    wallet_address = models.CharField(max_length=42, blank=True, null=True)
    blockchain_network = models.CharField(max_length=20, default='ethereum')
    
    class Meta:
        verbose_name = 'Organization'
        verbose_name_plural = 'Organizations'
        ordering = ['name']
    
    def __str__(self):
        return self.name


class OrganizationMember(BaseModel):
    """Organization membership model."""
    ROLE_CHOICES = [
        ('owner', 'Owner'),
        ('admin', 'Administrator'),
        ('manager', 'Manager'),
        ('employee', 'Employee'),
        ('viewer', 'Viewer'),
    ]
    
    organization = models.ForeignKey(Organization, on_delete=models.CASCADE, related_name='members')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='organization_memberships')
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='employee')
    
    # Permissions
    can_manage_users = models.BooleanField(default=False)
    can_manage_settings = models.BooleanField(default=False)
    can_view_financials = models.BooleanField(default=False)
    can_manage_inventory = models.BooleanField(default=False)
    can_manage_sales = models.BooleanField(default=False)
    can_manage_purchasing = models.BooleanField(default=False)
    can_manage_hr = models.BooleanField(default=False)
    
    # Status
    is_active = models.BooleanField(default=True)
    joined_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name = 'Organization Member'
        verbose_name_plural = 'Organization Members'
        unique_together = ['organization', 'user']
        ordering = ['-joined_at']
    
    def __str__(self):
        return f"{self.user.get_full_name()} - {self.organization.name}"


class Department(BaseModel):
    """Department model within organizations."""
    organization = models.ForeignKey(Organization, on_delete=models.CASCADE, related_name='departments')
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    manager = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='managed_departments'
    )
    parent_department = models.ForeignKey(
        'self',
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='sub_departments'
    )
    budget = models.DecimalField(max_digits=15, decimal_places=2, null=True, blank=True)
    is_active = models.BooleanField(default=True)
    
    class Meta:
        verbose_name = 'Department'
        verbose_name_plural = 'Departments'
        unique_together = ['organization', 'name']
        ordering = ['name']
    
    def __str__(self):
        return f"{self.name} - {self.organization.name}"


class Team(BaseModel):
    """Team model within departments."""
    department = models.ForeignKey(Department, on_delete=models.CASCADE, related_name='teams')
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    leader = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='led_teams'
    )
    members = models.ManyToManyField(User, through='TeamMember', related_name='teams')
    is_active = models.BooleanField(default=True)
    
    class Meta:
        verbose_name = 'Team'
        verbose_name_plural = 'Teams'
        unique_together = ['department', 'name']
        ordering = ['name']
    
    def __str__(self):
        return f"{self.name} - {self.department.name}"


class TeamMember(BaseModel):
    """Team membership model."""
    team = models.ForeignKey(Team, on_delete=models.CASCADE)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    role = models.CharField(max_length=50, default='member')
    is_leader = models.BooleanField(default=False)
    joined_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name = 'Team Member'
        verbose_name_plural = 'Team Members'
        unique_together = ['team', 'user']
        ordering = ['-joined_at']
    
    def __str__(self):
        return f"{self.user.get_full_name()} - {self.team.name}"


class OrganizationSettings(BaseModel):
    """Organization-specific settings."""
    organization = models.OneToOneField(Organization, on_delete=models.CASCADE, related_name='settings')
    
    # General settings
    allow_self_registration = models.BooleanField(default=False)
    require_email_verification = models.BooleanField(default=True)
    session_timeout = models.IntegerField(default=30)  # minutes
    
    # Feature flags
    enable_inventory = models.BooleanField(default=True)
    enable_sales = models.BooleanField(default=True)
    enable_purchasing = models.BooleanField(default=True)
    enable_finance = models.BooleanField(default=True)
    enable_hr = models.BooleanField(default=True)
    enable_web3 = models.BooleanField(default=False)
    
    # Integration settings
    webhook_url = models.URLField(blank=True)
    api_key = models.CharField(max_length=100, blank=True)
    
    # Customization
    logo = models.ImageField(upload_to='organization_logos/', blank=True, null=True)
    primary_color = models.CharField(max_length=7, default='#007bff')
    secondary_color = models.CharField(max_length=7, default='#6c757d')
    
    class Meta:
        verbose_name = 'Organization Settings'
        verbose_name_plural = 'Organization Settings'
    
    def __str__(self):
        return f"Settings for {self.organization.name}"
