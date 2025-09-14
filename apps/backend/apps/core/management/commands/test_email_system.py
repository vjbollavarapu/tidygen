"""
Management command to test TidyGen email system.
"""
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from apps.core.email_service import (
    TidyGenEmailService, send_welcome_email, send_password_reset_email,
    send_invoice_email, send_custom_notification
)

User = get_user_model()


class Command(BaseCommand):
    help = 'Test TidyGen email system with sample emails'
    
    def add_arguments(self, parser):
        parser.add_argument(
            '--email',
            type=str,
            help='Email address to send test emails to',
            default='test@example.com'
        )
        parser.add_argument(
            '--type',
            type=str,
            choices=['all', 'welcome', 'reset', 'invoice', 'custom'],
            default='all',
            help='Type of email to test'
        )
    
    def handle(self, *args, **options):
        email = options['email']
        email_type = options['type']
        
        self.stdout.write(
            self.style.SUCCESS(f'Testing TidyGen email system...')
        )
        self.stdout.write(f'Target email: {email}')
        self.stdout.write(f'Email type: {email_type}')
        
        # Create a test user
        test_user, created = User.objects.get_or_create(
            username='testuser',
            defaults={
                'email': email,
                'first_name': 'Test',
                'last_name': 'User'
            }
        )
        
        if created:
            test_user.set_password('testpass123')
            test_user.save()
            self.stdout.write(f'Created test user: {test_user.username}')
        else:
            self.stdout.write(f'Using existing test user: {test_user.username}')
        
        success_count = 0
        total_count = 0
        
        if email_type in ['all', 'welcome']:
            total_count += 1
            self.stdout.write('\n1. Testing welcome email...')
            try:
                result = send_welcome_email(
                    test_user, 
                    'https://app.tidygen.com/verify-email?token=test123'
                )
                if result:
                    self.stdout.write(self.style.SUCCESS('✓ Welcome email sent successfully'))
                    success_count += 1
                else:
                    self.stdout.write(self.style.ERROR('✗ Welcome email failed to send'))
            except Exception as e:
                self.stdout.write(self.style.ERROR(f'✗ Welcome email error: {e}'))
        
        if email_type in ['all', 'reset']:
            total_count += 1
            self.stdout.write('\n2. Testing password reset email...')
            try:
                result = send_password_reset_email(
                    test_user,
                    'https://app.tidygen.com/reset-password?token=test123'
                )
                if result:
                    self.stdout.write(self.style.SUCCESS('✓ Password reset email sent successfully'))
                    success_count += 1
                else:
                    self.stdout.write(self.style.ERROR('✗ Password reset email failed to send'))
            except Exception as e:
                self.stdout.write(self.style.ERROR(f'✗ Password reset email error: {e}'))
        
        if email_type in ['all', 'invoice']:
            total_count += 1
            self.stdout.write('\n3. Testing invoice email...')
            try:
                invoice_data = {
                    'invoice_number': 'INV-TEST-001',
                    'invoice_amount': '$1,250.00',
                    'due_date': 'December 31, 2024',
                    'invoice_description': 'Test invoice for TidyGen ERP email system testing',
                    'invoice_url': 'https://app.tidygen.com/invoices/test-001/view'
                }
                result = send_invoice_email(
                    client_email=email,
                    client_name='Test Client',
                    invoice_data=invoice_data
                )
                if result:
                    self.stdout.write(self.style.SUCCESS('✓ Invoice email sent successfully'))
                    success_count += 1
                else:
                    self.stdout.write(self.style.ERROR('✗ Invoice email failed to send'))
            except Exception as e:
                self.stdout.write(self.style.ERROR(f'✗ Invoice email error: {e}'))
        
        if email_type in ['all', 'custom']:
            total_count += 1
            self.stdout.write('\n4. Testing custom notification...')
            try:
                result = send_custom_notification(
                    recipient_email=email,
                    subject='TidyGen ERP System Test',
                    message='This is a test notification from the TidyGen ERP email system. If you receive this email, the system is working correctly!',
                    notification_type='system_test'
                )
                if result:
                    self.stdout.write(self.style.SUCCESS('✓ Custom notification sent successfully'))
                    success_count += 1
                else:
                    self.stdout.write(self.style.ERROR('✗ Custom notification failed to send'))
            except Exception as e:
                self.stdout.write(self.style.ERROR(f'✗ Custom notification error: {e}'))
        
        # Summary
        self.stdout.write('\n' + '='*50)
        self.stdout.write('EMAIL SYSTEM TEST SUMMARY')
        self.stdout.write('='*50)
        self.stdout.write(f'Total tests: {total_count}')
        self.stdout.write(f'Successful: {success_count}')
        self.stdout.write(f'Failed: {total_count - success_count}')
        
        if success_count == total_count:
            self.stdout.write(
                self.style.SUCCESS('\n🎉 All email tests passed! TidyGen email system is working correctly.')
            )
        else:
            self.stdout.write(
                self.style.WARNING(f'\n⚠️  {total_count - success_count} email test(s) failed. Check your email configuration.')
            )
        
        self.stdout.write('\nNote: In development mode, emails are typically sent to console.')
        self.stdout.write('Check your Django console output for email content.')
